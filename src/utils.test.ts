import {forComprehension, step} from "./util";
import {failure, success, Try} from "./try";
import {Either, left, right} from "./either";
import {none, some} from "./option";

describe('forComprehension', () => {

    const profileOriginal = {
        name: 'Foo',
        age: 28
    };
    const goodRequest = JSON.stringify(profileOriginal);
    const badRequest = JSON.stringify({
        name: 'Foo',
        age: 8
    });



    const profileValidator = (obj: any): Either<string, Profile> => {
        if (obj.name.length > 10) {
            return left('Name too long');
        } else if (obj.age < 18) {
            return left('Age too small');
        } else {
            return right(obj as Profile);
        }

    }

    test('sum', () => {
        function toNum(x: string) {
            return Try(() => {
                const res = parseInt(x);
                if (isNaN(res)) {
                    throw new Error(`${x} is not a number`);
                } else {
                    return res;
                }
            });
        }


        const res = forComprehension(
            step('num1', () => toNum('1')),
            step('num2', () => toNum('2')),
            step('num3', () => toNum('3')),
        ).yield(state => state.num1 + state.num2 + state.num3);
        expect(res).toEqual(success(6));

        const resError = forComprehension(
            step('num1', () => toNum('1')),
            step('num2', () => toNum('s2')),
            step('num3', () => toNum('3')),
        ).yield(state => state.num1 + state.num2 + state.num3);
        expect(resError).toEqual(failure(new Error('s2 is not a number')));
    });

    test('successful result', () => {

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse(goodRequest)).toOption),
            step('profile', (json, state) => profileValidator(json).toOption)
        ).yield(state => state.profile)).toEqual(some(profileOriginal));

        expect(forComprehension<Either<any, any>>(
            step('profileJson', () => Try(() => JSON.parse(goodRequest)).toEither),
            step('profile', (json, state) => profileValidator(json))
        ).yield(state => state.profile)).toEqual(right(profileOriginal));

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse(goodRequest))),
            step('profile', (json, state) => profileValidator(json).toTry(e => new Error(e)))
        ).yield(state => state.profile)).toEqual(success(profileOriginal));

    });


    test('failed result step 1', () => {

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse('*')).toOption),
            step('profile', (json, state) => profileValidator(json).toOption)
        ).yield(state => state.profile)).toEqual(none);

        expect(forComprehension<Either<any, any>>(
            step('profileJson', () => Try(() => JSON.parse('*')).toEither),
            step('profile', (json, state) => profileValidator(json))
        ).yield(state => state.profile).isLeft).toBeTruthy();

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse('*'))),
            step('profile', (json, state) => profileValidator(json).toTry(e => new Error(e)))
        ).yield(state => state.profile).isFailure).toBeTruthy();

    });

    test('failed result step 2', () => {

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse(badRequest)).toOption),
            step('profile', (json, state) => profileValidator(json).toOption)
        ).yield(state => state.profile)).toEqual(none);

        expect(forComprehension<Either<any, any>>(
            step('profileJson', () => Try(() => JSON.parse(badRequest)).toEither),
            step('profile', (json, state) => profileValidator(json))
        ).yield(state => state.profile)).toEqual(left('Age too small'));

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse(badRequest))),
            step('profile', (json, state) => profileValidator(json).toTry(e => new Error(e)))
        ).yield(state => state.profile)).toEqual(failure(new Error('Age too small')));

    });


});


interface Profile {
    name: string;
    age: number;
}

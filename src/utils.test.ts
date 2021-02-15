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


    test('filter', () => {
        expect(forComprehension<Either<any, any>>(
            step('profileJson', () => Try(() => JSON.parse(badRequest)).toEither),
            step('profile', (json, state) => profileValidator(json)).filter(p => !!p.name)
        ).yield(state => state.profile)).toEqual(failure(new Error('Age too small')));

    })

});


interface Profile {
    name: string;
    age: number;
}

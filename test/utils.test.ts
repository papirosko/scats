import {Either, failure, forComprehension, left, none, right, some, step, success, task, Try, TryLike} from '../src';


const profileOriginal = {
    name: 'Foo',
    age: 28
};
const goodRequest = JSON.stringify(profileOriginal);
const badRequest = JSON.stringify({
    name: 'Foo',
    age: 8
});


describe('forComprehension', () => {

    const profileValidator = (obj: any): Either<string, Profile> => {
        if (obj.name.length > 10) {
            return left('Name too long');
        } else if (obj.age < 18) {
            return left('Age too small');
        } else {
            return right(obj as Profile);
        }

    };

    test('forComprehension', () => {
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
        ).yield(({num1, num2, num3}) => num1 + num2 + num3);
        expect(res).toEqual(success(6));

        const resError = forComprehension(
            step('num1', () => toNum('1')),
            step('num2', () => toNum('s2')),
            step('num3', () => toNum('3')),
        ).yield(({num1, num2, num3}) => num1 + num2 + num3);
        expect(resError).toEqual(failure(new Error('s2 is not a number')));

        expect(forComprehension(
            step('num1', () => toNum('1')),
            step('num2', () => toNum('s2').transform<number>(x => success(x), () => failure(new Error('failed to convert')))),
            step('num3', () => toNum('3')),
        ).yield(({num1, num2, num3}) => num1 + num2 + num3)).toEqual(failure(new Error('failed to convert')));
    });

    test('successful result', () => {

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse(goodRequest)).toOption),
            step('profile', ({profileJson}) => profileValidator(profileJson).toOption)
        ).yield(({profile}) => profile)).toEqual(some(profileOriginal));

        expect(forComprehension<Either<any, any>>(
            step('profileJson', () => Try(() => JSON.parse(goodRequest)).toEither),
            step('profile', ({profileJson}) => profileValidator(profileJson))
        ).yield(({profile}) => profile)).toEqual(right(profileOriginal));

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse(goodRequest))),
            step('profile', ({profileJson}) => profileValidator(profileJson).toTry(e => new Error(e)))
        ).yield(({profile}) => profile)).toEqual(success(profileOriginal));

    });


    test('failed result step 1', () => {

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse('*')).toOption),
            step('profile', ({profileJson}) => profileValidator(profileJson).toOption)
        ).yield(({profile}) => profile)).toEqual(none);

        expect(forComprehension<Either<any, any>>(
            step('profileJson', () => Try(() => JSON.parse('*')).toEither),
            step('profile', ({profileJson}) => profileValidator(profileJson))
        ).yield(({profile}) => profile).isLeft).toBeTruthy();

        expect(forComprehension<TryLike<any>>(
            step('profileJson', () => Try(() => JSON.parse('*'))),
            step('profile', ({profileJson}) => profileValidator(profileJson).toTry(e => new Error(e)))
        ).yield(({profile}) => profile).isFailure).toBeTruthy();

    });

    test('failed result step 2', () => {

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse(badRequest)).toOption),
            step('profile', ({profileJson}) => profileValidator(profileJson).toOption)
        ).yield(({profile}) => profile)).toEqual(none);

        expect(forComprehension<Either<any, any>>(
            step('profileJson', () => Try(() => JSON.parse(badRequest)).toEither),
            step('profile', ({profileJson}) => profileValidator(profileJson))
        ).yield(({profile}) => profile)).toEqual(left('Age too small'));

        expect(forComprehension(
            step('profileJson', () => Try(() => JSON.parse(badRequest))),
            step('profile', ({profileJson}) => profileValidator(profileJson).toTry(e => new Error(e)))
        ).yield(({profile}) => profile)).toEqual(failure(new Error('Age too small')));

    });


});


describe('forComprehension.promise', () => {

    const profileValidator = (obj: any): Promise<Either<string, Profile>> => {
        if (obj.name.length > 10) {
            return Promise.resolve(left('Name too long'));
        } else if (obj.age < 18) {
            return Promise.resolve(left('Age too small'));
        } else {
            return Promise.resolve(right(obj as Profile));
        }

    };


    test('forComprehension', async () => {
        function toNum(x: string): Promise<TryLike<number>> {
            return Promise.resolve(Try(() => {
                const res = parseInt(x);
                if (isNaN(res)) {
                    throw new Error(`${x} is not a number`);
                } else {
                    return res;
                }
            }));
        }


        const res = await forComprehension.promise(
            task('num1', () => toNum('1')),
            task('num2', () => toNum('2')),
            task('num3', () => toNum('3')),
        ).yield(({num1, num2, num3}) => num1 + num2 + num3);
        expect(res).toEqual(success(6));

        const resError = await forComprehension.promise(
            task('num1', () => toNum('1')),
            task('num2', () => toNum('s2')),
            task('num3', () => toNum('3')),
        ).yield(({num1, num2, num3}) => num1 + num2 + num3);
        expect(resError).toEqual(failure(new Error('s2 is not a number')));

        expect(await forComprehension.promise(
            task('num1', () => toNum('1')),
            task('num2', () => toNum('s2').then(x => x.transform<number>(x => success(x), () => failure(new Error('failed to convert'))))),
            task('num3', () => toNum('3')),
        ).yield(({num1, num2, num3}) => num1 + num2 + num3)).toEqual(failure(new Error('failed to convert')));
    });

    test('successful result', async () => {

        await expect(forComprehension.promise(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(goodRequest)).toOption)),
            task('profile', async ({profileJson}) => (await profileValidator(profileJson)).toOption)
        ).yield(({profile}) => profile)).resolves.toEqual(some(profileOriginal));

        await expect(forComprehension.promise<Either<any, any>>(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(goodRequest)).toEither)),
            task('profile', ({profileJson}) => profileValidator(profileJson))
        ).yield(({profile}) => profile)).resolves.toEqual(right(profileOriginal));

        await expect(forComprehension.promise(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(goodRequest)))),
            task('profile', async ({profileJson}) => (await profileValidator(profileJson)).toTry(e => new Error(e)))
        ).yield(({profile}) => profile)).resolves.toEqual(success(profileOriginal));

        await expect(forComprehension.promise(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(goodRequest)))),

            task('profile', async ({profileJson}) =>
                (await profileValidator(profileJson)).toTry(e => new Error(e)))
                .if(({profile}) => profile.name.startsWith('Foo'))
        ).yield(({profile}) => profile)).resolves.toEqual(success(profileOriginal));

        await expect(forComprehension.promise(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(goodRequest)))),

            task('profile', async ({profileJson}) =>
                (await profileValidator(profileJson)).toTry(e => new Error(e)))
                .if(({profile}) => profile.name.startsWith('Foo1'))
        ).yield(({profile}) => profile)).resolves.toEqual(failure(new Error('Predicate does not hold for [object Object]')));

    });


    test('failed result step 1', async () => {

        expect(await forComprehension.promise(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse('*')).toOption)),
            task('profile', async ({profileJson}) => (await profileValidator(profileJson)).toOption)
        ).yield(({profile}) => profile)).toEqual(none);

        expect((await forComprehension.promise<Either<any, any>>(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse('*')).toEither)),
            task('profile', ({profileJson}) => profileValidator(profileJson))
        ).yield(({profile}) => profile)).isLeft).toBeTruthy();

        expect((await forComprehension.promise<TryLike<any>>(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse('*')))),
            task('profile', ({profileJson}) => profileValidator(profileJson).then(x => x.toTry(e => new Error(e))))
        ).yield(({profile}) => profile)).isFailure).toBeTruthy();

    });

    test('failed result step 2', async () => {

        expect(await forComprehension.promise(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(badRequest)).toOption)),
            task('profile', ({profileJson}) => profileValidator(profileJson).then(_ => _.toOption))
        ).yield(({profile}) => profile)).toEqual(none);

        expect(await forComprehension.promise<Either<any, any>>(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(badRequest)).toEither)),
            task('profile', ({profileJson}) => profileValidator(profileJson))
        ).yield(({profile}) => profile)).toEqual(left('Age too small'));

        expect(await forComprehension.promise(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(badRequest)))),
            task('profile', ({profileJson}) => profileValidator(profileJson).then(x => x.toTry(e => new Error(e))))
        ).yield(({profile}) => profile)).toEqual(failure(new Error('Age too small')));

    });

    test('failed with exception on step 1', async () => {
        await expect(forComprehension.promise(
            task('profileJson', () => Promise.reject(new Error('promise'))),
            task('profile', ({profileJson}) => profileValidator(profileJson).then(x => x.toTry(e => new Error(e))))
        ).yield(({profile}) => profile)).rejects.toThrowError('promise');

        await expect(forComprehension.promise(
            task('profileJson', () => { throw new Error('promise');}),
            task('profile', ({profileJson}) => profileValidator(profileJson).then(x => x.toTry(e => new Error(e))))
        ).yield(({profile}) => profile)).rejects.toThrowError('promise');

    });

    test('failed with exception on step 2', async () => {


        await expect(forComprehension.promise(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(goodRequest)))),
            task('profile', () => Promise.reject(new Error('promise')))
        ).yield(({profile}) => profile)).rejects.toThrowError('promise');

        await expect(forComprehension.promise(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(goodRequest)))),
            task('profile', () => { throw new Error('promise'); })
        ).yield(({profile}) => profile)).rejects.toThrowError('promise');

    });

    test('failed with exception on yield', async () => {


        await expect(forComprehension.promise(
            task('profileJson', () => Promise.resolve(Try(() => JSON.parse(goodRequest)).toOption)),
            task('profile', async ({profileJson}) => (await profileValidator(profileJson)).toOption)
        ).yield(() => { throw new Error('promise');})).rejects.toThrowError('promise');


    });

});


interface Profile {
    name: string;
    age: number;
}

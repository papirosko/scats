import {
    Collection,
    failure,
    forComprehension,
    left,
    Left,
    Nil,
    none,
    Right,
    right,
    some,
    step,
    success,
    Try
} from '../src';

describe('Either', () => {

    test('construct', () => {
        expect(right('123')).toEqual(new Right('123'));
        expect(left('123')).toEqual(new Left('123'));
    });


    test('equal', () => {
        expect(right('123')).toEqual(right('123'));
        expect(left('123')).toEqual(left('123'));
    });


    test('isLeft, isRight', () => {
        expect(right('123').isLeft).toBeFalsy();
        expect(right('123').isRight).toBeTruthy();
        expect(left('123').isLeft).toBeTruthy();
        expect(left('123').isRight).toBeFalsy();
    });

    test('match', () => {

        expect(right('123').match({
            right: () => 111,
            left: () => 222
        })).toEqual(111);

        expect(left('123').match({
            right: () => 111,
            left: () => 222
        })).toEqual(222);
    });


    test('fold', () => {
        const resultF = Try(() => {throw new Error('error');}).toEither;
        expect(resultF.fold(
            e => `Operation failed with ${e.message}`,
            v => `Operation produced value: ${v}`
        )).toEqual('Operation failed with error');

        const resultS = Try(() => 12).toEither;
        expect(resultS.fold(
            e => `Operation failed with ${e.message}`,
            v => `Operation produced value: ${v}`
        )).toEqual('Operation produced value: 12');
    });

    test('swap', () => {
        expect(left('left').withRight<number>().swap).toEqual(right('left'));
        expect(right('right').withLeft<number>().swap).toEqual(left('right'));
    });

    test('foreach', () => {
        let r = 0;
        right(12).foreach(x => r = x);
        expect(r).toEqual(12);

        const r1 = 0;
        right(12).left.foreach(x => r = x);
        expect(r1).toEqual(0);

        let l = 0;
        left(12).foreach(x => l = x);
        expect(l).toEqual(0);

        let l1 = 0;
        left(1).left.foreach(x => l1 = x);
        expect(l1).toEqual(1);
    });

    test('getOrElse, getOrElseValue', () => {
        expect(right(12).getOrElse(() => 1)).toEqual(12);
        expect(right(12).getOrElseValue(1)).toEqual(12);
        expect(right(12).left.getOrElse(() => 1)).toEqual(1);
        expect(right(12).left.getOrElseValue(1)).toEqual(1);
        expect(left(12).getOrElse(() => 1)).toEqual(1);
        expect(left(12).getOrElseValue(1)).toEqual(1);
        expect(left(12).left.getOrElse(() => 1)).toEqual(12);
        expect(left(12).left.getOrElseValue(1)).toEqual(12);
    });

    test('orElse, orElseValue', () => {
        expect(right(1).orElse(() => left(2))).toEqual(right(1));
        expect(right(1).orElseValue(left(2))).toEqual(right(1));
        expect(left(1).orElse(() => left(2))).toEqual(left(2));
        expect(left(1).orElseValue(left(2))).toEqual(left(2));
        expect(left(1).orElse(() => left(2)).orElse(() => right(3))).toEqual(right(3));
        expect(left(1).orElseValue(left(2)).orElseValue(right(3))).toEqual(right(3));
    });

    test('contains', () => {
        expect(right(1).contains(1)).toBeTruthy();
        expect(right(1).contains(2)).toBeFalsy();
        expect(left(1).contains(1)).toBeFalsy();
        expect(left(1).contains(2)).toBeFalsy();
    });

    test('forall', () => {
        expect(right(12).forall(_ => _ > 10)).toBeTruthy();
        expect(right(12).left.forall(_ => _ > 10)).toBeTruthy();
        expect(right(7).forall(_ => _ > 10)).toBeFalsy();
        expect(right(7).left.forall(_ => _ > 10)).toBeTruthy();
        expect(left(12).forall(_ => false)).toBeTruthy();
        expect(left(12).left.forall(_ => _ > 10)).toBeTruthy();
        expect(left(12).left.forall(_ => _ < 10)).toBeFalsy();
    });

    test('exists', () => {
        expect(right(12).exists(_ => _ > 10)).toBeTruthy();
        expect(right(12).left.exists(_ => _ > 10)).toBeFalsy();
        expect(right(7).exists(_ => _ > 10)).toBeFalsy();
        expect(right(7).left.exists(_ => _ > 10)).toBeFalsy();
        expect(left(12).exists(_ => true)).toBeFalsy();
        expect(left(12).left.exists(_ => _ > 10)).toBeTruthy();
        expect(left(12).left.exists(_ => _ < 10)).toBeFalsy();
    });

    test('flatMap', () => {
        expect(right(12).flatMap(_ => right('flower'))).toEqual(right('flower'));
        expect(right(12).left.flatMap<any, any>(_ => right('flower'))).toEqual(right(12));
        expect(left(12).flatMap(_ => right('flower'))).toEqual(left(12));
        expect(left(12).left.flatMap(_ => right('flower'))).toEqual(right('flower'));
    });

    test('flatMapPromise', async () => {
        await expect(right(12).flatMapPromise(_ => Promise.resolve(right('flower'))))
            .resolves.toEqual(right('flower'));
        await expect(right(12).left.flatMapPromise<any, any>(_ => Promise.resolve(right('flower'))))
            .resolves.toEqual(right(12));
        await expect(left(12).flatMapPromise(_ => Promise.resolve(right('flower'))))
            .resolves.toEqual(left(12));
        await expect(left(12).left.flatMapPromise(_ => Promise.resolve(right('flower'))))
            .resolves.toEqual(right('flower'));
    });

    test('map', () => {
        expect(right(12).map(_ => 'flower')).toEqual(right('flower'));
        expect(right(12).left.map(_ => 'flower')).toEqual(right(12));
        expect(left(12).map(_ => 'flower')).toEqual(left(12));
        expect(left(12).left.map(_ => 'flower')).toEqual(left('flower'));
    });

    test('mapPromise', async () => {
        await expect(right(12).mapPromise(x => Promise.resolve(x + 1))).resolves.toEqual(right(13));
        await expect(right(12).left.mapPromise(x => Promise.resolve(x + 1))).resolves.toEqual(right(12));
        await expect(left(12).mapPromise(x => Promise.resolve(x + 1))).resolves.toEqual(left(12));
        await expect(left(12).left.mapPromise(x => Promise.resolve(x + 1))).resolves.toEqual(left(13));
    });


    test('filterOrElse, filterOrElseValue', () => {
        expect(right(12).filterOrElse(_ => _ > 10, () => -1)).toEqual(right(12));
        expect(right(7).filterOrElse(_ => _ > 10, () => -1)).toEqual(left(-1));
        expect(left(7).filterOrElse(_ => false, () => -1)).toEqual(left(7));

        expect(right(12).filterOrElseValue(_ => _ > 10, -1)).toEqual(right(12));
        expect(right(7).filterOrElseValue(_ => _ > 10, -1)).toEqual(left(-1));
        expect(left(7).filterOrElseValue(_ => false, -1)).toEqual(left(7));
    });

    test('left.filterToOption', () => {
        expect(right(12).left.filterToOption(_ => _ > 10)).toEqual(none);
        expect(right(7).left.filterToOption(_ => _ > 10)).toEqual(none);
        expect(left(12).left.filterToOption(_ => _ > 10)).toEqual(some(left(12)));
        expect(left(7).left.filterToOption(_ => _ > 10)).toEqual(none);
    });

    test('toCollection', () => {
        expect(right('123').toCollection).toEqual(Collection.of('123'));
        expect(right('123').left.toCollection).toEqual(Nil);
        expect(left('123').toCollection).toEqual(Nil);
        expect(left('123').left.toCollection).toEqual(Collection.of('123'));
    });

    test('toOption', () => {
        expect(right(12).toOption).toEqual(some(12));
        expect(right(12).left.toOption).toEqual(none);
        expect(left(12).toOption).toEqual(none);
        expect(left(12).left.toOption).toEqual(some(12));
    });

    test('toTry', () => {
        expect(right('123').toTry()).toEqual(success('123'));
        expect(left('123').toTry()).toEqual(failure(new Error('123')));
        expect(left(new Error('123')).toTry()).toEqual(failure(new Error('123')));
    });


    test('left docs', () => {
        expect(forComprehension(
           step('s', () => left('flower').left)
        ).yield(({s}) => s.length)).toEqual(left(6));

        expect(forComprehension(
           step('s', () => left('flower').left),
           step('m', () => left('bird').left),
        ).yield(({s, m}) => s.length + m.length)).toEqual(left(10));
    });

});

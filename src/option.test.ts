import {none, option, some} from "./option";
import {left, right} from "./either";
import {Collection} from "./collection";
import {HashSet} from "./hashset";
import {HashMap} from "./hashmap";

describe('Option', () => {

    test('should equal', () => {
        expect(none).toEqual(none);
        expect(option(null)).toEqual(none);
        expect(some(1)).toEqual(some(1));
        expect(some(1)).toEqual(option(1));
        expect(some(1)).not.toEqual(some(2));
        expect(some(1)).not.toEqual(none);
    })

    test('should detect nulls and undefined', () => {

        expect(option(1).isDefined).toBeTruthy();
        expect(option(1).isEmpty).toBeFalsy();

        expect(option(null).isDefined).toBeFalsy();
        expect(option(null).isEmpty).toBeTruthy();

        expect(option(undefined).isDefined).toBeFalsy();
        expect(option(undefined).isEmpty).toBeTruthy();

    });

    test('map', () => {

        expect(option(1).map(x => x + 1)).toEqual(some(2));
        expect(option(null).map(x => (x || 0) + 1)).toEqual(none);

    });

    test('flatMap', () => {

        expect(option(1).flatMap(() => option(2))).toEqual(some(2));
        expect(option(null).flatMap(() => option(2))).toEqual(none);
        expect(option(1).flatMap(() => option(null))).toEqual(none);

    });

    test('toCollection', () => {
        expect(option(1).toCollection).toEqual(Collection.of(1));
        expect(option(null).toCollection).toEqual(Collection.empty);
    });

    test('toSet', () => {
        expect(option(1).toSet).toEqual(HashSet.of(1));
        expect(option(null).toSet).toEqual(HashSet.empty);
    });

    test('toMap', () => {
        expect(option(1).toMap(x => [x, x])).toEqual(HashMap.of([1, 1]));
        expect(option(null).toMap(x => [x, x])).toEqual(HashMap.empty);
    });

    test('contains', () => {
        expect(option(1).contains(1)).toBeTruthy();
        expect(option(2).contains(1)).toBeFalsy();
        expect(option<any>(null).contains(1)).toBeFalsy();
    });

    test('toRight', () => {
        expect(option(1).toRight(() => 2)).toEqual(right(1));
        expect(option(null).toRight(() => 2)).toEqual(left(2));
    });

    test('toLeft', () => {
        expect(option(1).toLeft(() => 2)).toEqual(left(1));
        expect(option(null).toLeft(() => 2)).toEqual(right(2));
    });

    test('get', () => {
        expect(option(1).get).toEqual(1);
        expect(() => option(null).get).toThrowError('No such element.');
    });

    test('toArray', () => {
        expect(option(1).toArray).toEqual([1]);
        expect(option(null).toArray).toEqual([]);
    });

    test('should support nonEmpty', () => {
        expect(option(1).nonEmpty).toBeTruthy();
        expect(option(null).nonEmpty).toBeFalsy();
    });

    test('orNull', () => {
        expect(option(1).orNull).toEqual(1);
        expect(option(null).orNull).toBeNull();
    });

    test('orUndefined', () => {
        expect(option(1).orUndefined).toEqual(1);
        expect(option(null).orUndefined).toBeUndefined();
    });

    test('exists', () => {
        expect(option(1).exists(x => x === 1)).toBeTruthy()
        expect(option(1).exists(x => x === 2)).toBeFalsy();
        expect(option(null).exists(x => x === 2)).toBeFalsy();
    });

    test('filter', () => {
        expect(option(1).filter(x => x >= 1)).toEqual(some(1))
        expect(option(1).filter(x => x < 1)).toEqual(none);
        expect(option(null).filter(x => x! > 2)).toEqual(none);
    });

    test('filterNot', () => {
        expect(option(1).filterNot(x => x >= 1)).toEqual(none)
        expect(option(1).filterNot(x => x < 1)).toEqual(some(1));
        expect(option(null).filterNot(x => x! > 2)).toEqual(none);
    });

    test('should support getOrElseValue', () => {
        expect(option(1).getOrElseValue(2)).toEqual(1)
        expect(option<any>(null).getOrElseValue(2)).toEqual(2);
    });

    test('should support orElse', () => {
        expect(option(1).orElse(() => some(2))).toEqual(some(1))
        expect(option<any>(null).orElse(() => some<any>(2))).toEqual(some(2));
    });

    test('orElseValue', () => {
        expect(option(1).orElseValue(some(2))).toEqual(some(1))
        expect(option<any>(null).orElseValue(some<any>(2))).toEqual(some(2));
    });

    test('foldValue', () => {
        expect(option(1).foldValue(() => 0)((x: number) => x + 1)).toEqual(2);
        expect(option<any>(null).foldValue(() => 0)(x => x + 1)).toEqual(0);
    });

    test('forall', () => {
        expect(option(1).forall(x => x >= 1)).toBeTruthy();
        expect(option(1).forall(x => x < 1)).toBeFalsy();
        expect(option<any>(null).forall(x => x < 1)).toBeFalsy();
    });

    test('foreach', () => {
        const emptyArr: any[] = [];
        option(null).foreach(x => emptyArr.push(x));
        expect(emptyArr).toEqual([]);

        const fillArr: any[] = [];
        option(1).foreach(x => fillArr.push(x));
        expect(fillArr).toEqual([1]);

    });

    test('match', () => {
        const r1 = option(null).match({
            some: () => 2,
            none: () => 3
        });

        expect(r1).toEqual(3);

        const r2 = option(1).match({
            some: () => 2,
            none: () => 3
        });

        expect(r2).toEqual(2);

    });

    test('head, headOption, last, lastOption', () => {
        expect(some(1).head).toEqual(1);
        expect(some(1).headOption).toEqual(some(1));
        expect(some(1).last).toEqual(1);
        expect(some(1).lastOption).toEqual(some(1));

        expect(() => none.head).toThrow(Error);
        expect(none.headOption).toEqual(none);
        expect(() => none.last).toThrow(Error);
        expect(none.lastOption).toEqual(none);
    });

    test('take, takeRight, drop, dropRight', () => {
        expect(none.take(0)).toEqual(none);
        expect(none.drop(0)).toEqual(none);
        expect(some(1).take(0)).toEqual(none);
        expect(some(1).take(1)).toEqual(some(1));
        expect(some(1).takeRight(0)).toEqual(none);
        expect(some(1).takeRight(1)).toEqual(some(1));
        expect(some(1).takeWhile(x => x > 1)).toEqual(none);
        expect(some(1).takeWhile(x => x <= 1)).toEqual(some(1));
        expect(some(1).drop(0)).toEqual(some(1));
        expect(some(1).drop(1)).toEqual(none);
        expect(some(1).dropRight(0)).toEqual(some(1));
        expect(some(1).dropRight(1)).toEqual(none);
        expect(some(1).dropWhile(x => x > 1)).toEqual(some(1));
        expect(some(1).dropWhile(x => x <= 1)).toEqual(none);
    });

    test('partition', () => {
        expect(none.partition(i => i % 2 === 0)).toEqual([none, none]);
        expect(some(1).partition(i => i % 2 === 0)).toEqual([none, some(1)]);
        expect(some(2).partition(i => i % 2 === 0)).toEqual([some(2), none]);
    });


    test('mapPromise', async () => {
        await expect(option(1).mapPromise(x => Promise.resolve(x))).resolves.toEqual(some(1));
        await expect(option(null).mapPromise(x => Promise.resolve(x))).resolves.toEqual(none);
        await expect(option(undefined).mapPromise(x => Promise.resolve(x))).resolves.toEqual(none);
    });

});






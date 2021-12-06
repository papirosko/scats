import {HashSet, identity, none, some} from '../src';

describe('HashSet', () => {

    test('constructor', () => {

        expect(new HashSet(new Set([1, 1, 2, 3])).toSet).toEqual(new Set([1, 2, 3]));
        expect(HashSet.of(1, 1, 2, 3).toSet).toEqual(new Set([1, 2, 3]));

    });

    test('toCollection', () => {
        const res = HashSet.of(1, 1, 2, 3).toCollection;
        expect(res.contains(1)).toBeTruthy();
        expect(res.contains(2)).toBeTruthy();
        expect(res.contains(3)).toBeTruthy();
        expect(res.size).toBe(3);
    });

    test('contains', () => {
        const set = HashSet.of(1, 2);
        expect(set.contains(1)).toBeTruthy();
        expect(set.contains(3)).toBeFalsy();
    });

    test('size', () => {
        expect(HashSet.of(1, 2).size).toEqual(2);
        expect(HashSet.of(1, 2, 2).size).toEqual(2);
        expect(HashSet.empty.size).toEqual(0);
    });

    test('isEmpty, nonEmpty', () => {
        expect(HashSet.of(1, 2).isEmpty).toBeFalsy();
        expect(HashSet.of(1, 2).nonEmpty).toBeTruthy();
        expect(HashSet.empty.isEmpty).toBeTruthy();
        expect(HashSet.empty.nonEmpty).toBeFalsy();
    });

    test('filter, filterNot', () => {
        expect(HashSet.of(1, 2).filter(x => x <= 1)).toEqual(HashSet.of(1));
        expect(HashSet.of(1, 2).filter(x => x <= 0)).toEqual(HashSet.empty);
        expect(HashSet.of(1, 2).filterNot(x => x <= 1)).toEqual(HashSet.of(2));
    });

    test('map', () => {
        expect(HashSet.of(1, 2).map(x => x + 1)).toEqual(HashSet.of(2, 3));
    });

    test('flatMap', () => {
        expect(HashSet.of(1, 2).flatMap(x => HashSet.of(x, x + 1))).toEqual(HashSet.of(1, 2, 3));
    });

    test('appended, appendedAll, removed, removedAll, concat, union', () => {
        expect(HashSet.of(1, 2).appended(3)).toEqual(HashSet.of(1, 2, 3));
        expect(HashSet.of(1, 2).appendedAll(HashSet.of(2, 3))).toEqual(HashSet.of(1, 2, 3));
        expect(HashSet.of(1, 2).removed(2)).toEqual(HashSet.of(1));
        expect(HashSet.of(1, 2).removedAll([2, 3])).toEqual(HashSet.of(1));
        expect(HashSet.of(1, 2).removedAll(HashSet.of(2, 3))).toEqual(HashSet.of(1));
        expect(HashSet.of(1, 2).concat(HashSet.of(2, 3))).toEqual(HashSet.of(1, 2, 3));
        expect(HashSet.of(1, 2).union(HashSet.of(2, 3))).toEqual(HashSet.of(1, 2, 3));
    });

    test('intersect', () => {
        expect(HashSet.of(1, 2).intersect(HashSet.of(2, 3))).toEqual(HashSet.of(2));
        expect(HashSet.of(1, 2).intersect(HashSet.of(3, 4))).toEqual(HashSet.empty);
    });

    test('contains', () => {
        expect(HashSet.of(1, 2, 3).contains(2)).toBeTruthy();
    });

    test('toMap', () => {
        expect(HashSet.of(1, 2, 3).contains(2)).toBeTruthy();
    });

    test('toMap', () => {
        expect(HashSet.of(
            {id: 1, name: 'foo1'}, {id: 2, name: 'foo2'}
        ).toMap(o => [o.id, o.name]).toMap).toEqual(new Map([[1, 'foo1'], [2, 'foo2']]));
    });

    test('minBy, minByOption, maxBy, maxByOption', () => {
        expect(() => HashSet.empty.minBy(identity)).toThrow(Error);
        expect(() => HashSet.empty.maxBy(identity)).toThrow(Error);

        expect(HashSet.empty.minByOption(identity)).toEqual(none);
        expect(HashSet.empty.maxByOption(identity)).toEqual(none);

        expect(HashSet.of(
            {amount: 4},
            {amount: 5},
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).minBy(x => x.amount)).toEqual({amount: 1});

        expect(HashSet.of(
            {amount: 4},
            {amount: 5},
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).minByOption(x => x.amount)).toEqual(some({amount: 1}));

        expect(HashSet.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).maxBy(x => x.amount)).toEqual({amount: 3});

        expect(HashSet.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).maxByOption(x => x.amount)).toEqual(some({amount: 3}));

    });

    test('reduce, reduceLeft', () => {

        expect(() => HashSet.empty.reduce(identity)).toThrow(Error);
        expect(() => HashSet.empty.reduceLeft(identity)).toThrow(Error);

        expect(HashSet.empty.reduceOption(identity)).toEqual(none);
        expect(HashSet.empty.reduceLeftOption(identity)).toEqual(none);

        expect(HashSet.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).reduce((x1, x2) => ({
            amount: x1.amount + x2.amount
        }))).toEqual({amount: 6});

        expect(HashSet.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).reduceLeft((x1, x2) => ({
            amount: x1.amount + x2.amount
        }))).toEqual({amount: 6});

        expect(HashSet.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).reduceOption((x1, x2) => ({
            amount: x1.amount + x2.amount
        }))).toEqual(some({amount: 6}));

        expect(HashSet.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).reduceLeftOption((x1, x2) => ({
            amount: x1.amount + x2.amount
        }))).toEqual(some({amount: 6}));

    });

    test('foldLeft', () => {
        expect(HashSet.of(1, 2, 3, 3).foldLeft(0)((a, b) => a + b)).toEqual(6);
        expect(HashSet.of(1, 2, 3, 3).fold(0)((a, b) => a + b)).toEqual(6);
        expect(HashSet.of(1, 2, 3, 3).fold({sum: 0})((a, b) =>
            ({
                sum: a.sum + b
            }))).toEqual({sum: 6});
    });

    test('partition', () => {
        const actual = HashSet.of(1, 2, 3, 4).partition(i => i % 2 === 0);
        expect(actual).toEqual([HashSet.of(2, 4), HashSet.of(1, 3)]);
    });

    test('take', () => {

        expect(HashSet.empty.take(1)).toEqual(HashSet.empty);
        expect(HashSet.of(1, 2).take(0)).toEqual(HashSet.of());
        expect(HashSet.of(1, 2).take(1)).toEqual(HashSet.of(1));
        expect(HashSet.of(1, 2).take(2)).toEqual(HashSet.of(1, 2));
        expect(HashSet.of(1, 2).take(3)).toEqual(HashSet.of(1, 2));

    });

    test('takeRight', () => {

        expect(HashSet.empty.takeRight(1)).toEqual(HashSet.empty);
        expect(HashSet.of(1, 2).takeRight(0)).toEqual(HashSet.empty);
        expect(HashSet.of(1, 2).takeRight(1)).toEqual(HashSet.of(2));
        expect(HashSet.of(1, 2).takeRight(2)).toEqual(HashSet.of(1, 2));
        expect(HashSet.of(1, 2).takeRight(3)).toEqual(HashSet.of(1, 2));

    });

    test('takeWhile', () => {
        expect(HashSet.of(1, 2, 3).takeWhile(_ => _ <= 2)).toEqual(HashSet.of(1, 2));
        expect(HashSet.of(1, 2, 3).takeWhile(_ => _ <= 0)).toEqual(HashSet.empty);
        expect(HashSet.of(1, 2, 3).takeWhile(_ => _ <= 4)).toEqual(HashSet.of(1, 2, 3));
    });

    test('drop', () => {

        expect(HashSet.empty.drop(1)).toEqual(HashSet.empty);
        expect(HashSet.of(1, 2).drop(0)).toEqual(HashSet.of(1, 2));
        expect(HashSet.of(1, 2).drop(1)).toEqual(HashSet.of(2));
        expect(HashSet.of(1, 2).drop(2)).toEqual(HashSet.empty);
        expect(HashSet.of(1, 2).drop(3)).toEqual(HashSet.empty);

    });

    test('dropRight', () => {

        expect(HashSet.empty.dropRight(1)).toEqual(HashSet.empty);
        expect(HashSet.of(1, 2).dropRight(0)).toEqual(HashSet.of(1, 2));
        expect(HashSet.of(1, 2).dropRight(1)).toEqual(HashSet.of(1));
        expect(HashSet.of(1, 2).dropRight(2)).toEqual(HashSet.empty);
        expect(HashSet.of(1, 2).dropRight(3)).toEqual(HashSet.empty);

    });

    test('dropWhile', () => {
        expect(HashSet.of(1, 2, 3).dropWhile(_ => _ <= 2)).toEqual(HashSet.of(3));
        expect(HashSet.of(1, 2, 3).dropWhile(_ => _ <= 0)).toEqual(HashSet.of(1, 2, 3));
        expect(HashSet.of(1, 2, 3).dropWhile(_ => _ <= 4)).toEqual(HashSet.empty);
    });

    test('sum', () => {
        expect(HashSet.empty.sum(identity)).toEqual(0);
        expect(HashSet.of(1, 2, 2).sum(identity)).toEqual(3);
    });

    test('for of', () => {
        let sum = 0;
        for (const i of HashSet.of(1, 2, 2, 3, 3, 3)) {
            sum += i;
        }

        expect(sum).toBe(6);
    });

    test('toBuffer', () => {
        const buf = HashSet.of(1, 2).toBuffer;
        expect(buf.size).toEqual(2);
        expect(buf.contains(1)).toBeTruthy();
        expect(buf.contains(2)).toBeTruthy();
    });

});

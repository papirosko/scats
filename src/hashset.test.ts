import {HashSet} from "./hashset";
import {idFunction} from "./util";
import {none, some} from "./option";

describe('HashSet', () => {

    test('constructor', () => {

        expect(new HashSet(new Set([1, 1, 2, 3])).toSet()).toEqual(new Set([1, 2, 3]));
        expect(HashSet.of(1, 1, 2, 3).toSet()).toEqual(new Set([1, 2, 3]));

    });

    test('toCollection', () => {
        const res = HashSet.of(1, 1, 2, 3).toCollection();
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

    test('appended, appendedAll, removed, removedAll, concat, union', () => {
        expect(HashSet.of(1, 2).appended(3)).toEqual(HashSet.of(1, 2, 3));
        expect(HashSet.of(1, 2).appendedAll(HashSet.of(2, 3))).toEqual(HashSet.of(1, 2, 3));
        expect(HashSet.of(1, 2).removed(2)).toEqual(HashSet.of(1));
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
        expect(() => HashSet.empty.minBy(idFunction)).toThrow(Error);
        expect(() => HashSet.empty.maxBy(idFunction)).toThrow(Error);

        expect(HashSet.empty.minByOption(idFunction)).toEqual(none);
        expect(HashSet.empty.maxByOption(idFunction)).toEqual(none);

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

        expect(() => HashSet.empty.reduce(idFunction)).toThrow(Error);
        expect(() => HashSet.empty.reduceLeft(idFunction)).toThrow(Error);

        expect(HashSet.empty.reduceOption(idFunction)).toEqual(none);
        expect(HashSet.empty.reduceLeftOption(idFunction)).toEqual(none);

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


});

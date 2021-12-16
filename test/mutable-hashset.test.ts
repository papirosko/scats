import {HashSet, mutable} from '../src';

describe('mutable.HashMap', () => {

    test('create', () => {
        const set = new mutable.HashSet();
        expect(set.size).toEqual(0);
    });


    test('of', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        expect(set.size).toEqual(3);
        expect(set.contains(1)).toBeTruthy();
        expect(set.contains(2)).toBeTruthy();
        expect(set.contains(3)).toBeTruthy();
        expect(set.contains(4)).toBeFalsy();
    });


    test('from', () => {
        expect(mutable.HashSet.from([1, 2, 2, 3])).toEqual(mutable.HashSet.of(1, 2, 2, 3));
    });


    test('add', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        expect(set.add(1)).toBeFalsy();
        expect(set.size).toEqual(3);

        expect(set.add(4)).toBeTruthy();
        expect(set.size).toEqual(4);
        expect(set.contains(4)).toBeTruthy();
    });


    test('addAll', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        const set2 = set.addAll([1, 4]);
        expect(set === set2).toBeTruthy();
        expect(set.size).toEqual(4);
        expect(set.contains(4)).toBeTruthy();
    });


    test('subtractAll', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3, 4);
        expect(set.size).toEqual(4);
        expect(set.contains(1)).toBeTruthy();
        expect(set.contains(4)).toBeTruthy();

        const set2 = set.subtractAll([1, 4]);
        expect(set === set2).toBeTruthy();
        expect(set2.size).toEqual(2);
        expect(set2.contains(1)).toBeFalsy();
        expect(set2.contains(4)).toBeFalsy();
    });


    test('remove', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        expect(set.remove(4)).toBeFalsy();
        expect(set.remove(1)).toBeTruthy();
        expect(set.size).toEqual(2);
        expect(set.contains(1)).toBeFalsy();
    });


    test('filterInPlace', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        const set2 = set.filterInPlace(x => x > 2);
        expect(set === set2).toBeTruthy();
        expect(set2.size).toEqual(1);
        expect(set.contains(1)).toBeFalsy();
        expect(set.contains(2)).toBeFalsy();
        expect(set.contains(3)).toBeTruthy();
    });


    test('clear', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        set.clear();
        expect(set.size).toEqual(0);
    });


    test('addOne', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        const set2 = set.addOne(1);
        expect(set === set2).toBeTruthy();
        expect(set.size).toEqual(3);

        const set3 = set.addOne(4);
        expect(set === set3).toBeTruthy();
        expect(set.size).toEqual(4);
        expect(set.contains(4)).toBeTruthy();
    });


    test('subtractOne', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        const set2 = set.subtractOne(4);
        expect(set === set2).toBeTruthy();
        expect(set.size).toEqual(3);

        const set3 = set.subtractOne(1);
        expect(set === set3).toBeTruthy();
        expect(set.size).toEqual(2);
        expect(set.contains(1)).toBeFalsy();
    });


    test('concat', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        const set2 = set.concat([3, 4]);
        expect(set === set2).toBeFalsy();
        expect(set2.size).toEqual(4);
        expect(set2.contains(4)).toBeTruthy();
    });


    test('intersect', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        const set2 = set.intersect(mutable.HashSet.of(3, 4));
        expect(set === set2).toBeFalsy();
        expect(set2.size).toEqual(1);
        expect(set2.contains(3)).toBeTruthy();
    });


    test('union', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        const set2 = set.union(mutable.HashSet.of(3, 4));
        expect(set === set2).toBeFalsy();
        expect(set2.size).toEqual(4);
        expect(set2.contains(1)).toBeTruthy();
        expect(set2.contains(2)).toBeTruthy();
        expect(set2.contains(3)).toBeTruthy();
        expect(set2.contains(4)).toBeTruthy();
    });


    test('toImmutable', () => {
        const set = mutable.HashSet.of(1, 2, 2, 3);
        const set2 = set.intersect(mutable.HashSet.of(3, 4));
        expect(set === set2).toBeFalsy();
        expect(mutable.HashSet.of(1, 2, 2, 3).toImmutable).toEqual(HashSet.of(1, 2, 3));
    });


});

import {HashMap, mutable, none, some} from '../src';

describe('mutable.HashMap', () => {

    test('create', () => {
        const map = new mutable.HashMap();
        expect(map.size).toEqual(0);
    });

    test('of', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13]);
        expect(map.size).toEqual(2);
        expect(map.get('Bob')).toEqual(some(12));
        expect(map.get('Steve')).toEqual(some(13));
        expect(map.get('Alice')).toEqual(none);
    });

    test('from', () => {
        expect(mutable.HashMap.from([['1', 1], ['2', 3]]).toMap).toEqual(new Map([['1', 1], ['2', 3]]));
    });


    test('addAll', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13]);
        expect(map.size).toEqual(2);
        const newMap = map.addAll([['Alice', 11]]);
        expect(map === newMap).toBeTruthy();
        expect(map.size).toEqual(3);
        expect(map.get('Bob')).toEqual(some(12));
        expect(map.get('Steve')).toEqual(some(13));
        expect(map.get('Alice')).toEqual(some(11));
    });

    test('addOne', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13]);
        expect(map.size).toEqual(2);
        const newMap = map.addOne(['Alice', 11]);
        expect(map === newMap).toBeTruthy();
        expect(map.size).toEqual(3);
        expect(map.get('Bob')).toEqual(some(12));
        expect(map.get('Steve')).toEqual(some(13));
        expect(map.get('Alice')).toEqual(some(11));
    });

    test('clear', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13]);
        expect(map.size).toEqual(2);
        map.clear();
        expect(map.size).toEqual(0);
    });

    test('getOrElseUpdate', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13]);
        expect(map.size).toEqual(2);
        expect(map.get('Alice')).toEqual(none);
        const alice = map.getOrElseUpdate('Alice', () => 11);
        expect(alice).toEqual(11);
        expect(map.size).toEqual(3);
        expect(map.get('Bob')).toEqual(some(12));
        expect(map.get('Steve')).toEqual(some(13));
        expect(map.get('Alice')).toEqual(some(11));
    });

    test('set', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13]);
        expect(map.size).toEqual(2);
        const newMap = map.set('Alice', 11);
        expect(map === newMap).toBeTruthy();
        expect(map.size).toEqual(3);
        expect(map.get('Bob')).toEqual(some(12));
        expect(map.get('Steve')).toEqual(some(13));
        expect(map.get('Alice')).toEqual(some(11));
    });

    test('put', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13]);
        expect(map.size).toEqual(2);
        const newValue = map.put('Alice', 11);
        expect(newValue).toEqual(none);
        expect(map.size).toEqual(3);
        expect(map.get('Bob')).toEqual(some(12));
        expect(map.get('Steve')).toEqual(some(13));
        expect(map.get('Alice')).toEqual(some(11));
    });

    test('updatedWith', () => {
        const original = mutable.HashMap.of(['foo1', 1], ['foo2', 2]);

        expect(original.updateWith('foo1')((opt) => some(opt.getOrElseValue(0) + 1))).toEqual(some(2));
        expect(original.size).toEqual(2);

        expect(original.updateWith('foo2')(() => none)).toEqual(none);
        expect(original.size).toEqual(1);

        expect(original.updateWith('foo3')((opt) => some(opt.getOrElseValue(0) + 1))).toEqual(some(1));
        expect(original.size).toEqual(2);

        expect(original.updateWith('foo3')(() => none)).toEqual(none);
        expect(original.size).toEqual(1);

        expect(original.updateWith('foo4')(() => none)).toEqual(none);
        expect(original.size).toEqual(1);

    });

    test('filterInPlace', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13]);

        const filtered = map.filterInPlace(([_, value]) => value >= 13);
        expect(map === filtered).toBeTruthy();
        expect(map.size).toEqual(1);
        expect(map.get('Steve')).toEqual(some(13));
        expect(map.get('Bob')).toEqual(none);

    });

    test('mapValuesInPlace', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13]);

        const filtered = map.mapValuesInPlace(([_, value]) => value + 1);
        expect(map === filtered).toBeTruthy();
        expect(map.size).toEqual(2);
        expect(map.get('Steve')).toEqual(some(14));
        expect(map.get('Bob')).toEqual(some(13));

    });

    test('clone', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13]);

        const cloned = map.clone();
        expect(map === cloned).toBeFalsy();

        expect(map.size).toEqual(2);
        expect(map.get('Steve')).toEqual(some(13));
        expect(map.get('Bob')).toEqual(some(12));

        expect(cloned.size).toEqual(2);
        expect(cloned.get('Steve')).toEqual(some(13));
        expect(cloned.get('Bob')).toEqual(some(12));

        map.set('Alice', 11);
        expect(map.size).toEqual(3);
        expect(map.get('Alice')).toEqual(some(11));
        expect(cloned.size).toEqual(2);
        expect(cloned.get('Alice')).toEqual(none);


    });

    test('subtractAll', () => {
        const map = mutable.HashMap.of(['Bob', 12], ['Steve', 13], ['Alice', 11]);

        const removed = map.subtractAll(['Alice', 'Bob']);
        expect(map === removed).toBeTruthy();
        expect(map.size).toEqual(1);
        expect(map.get('Alice')).toEqual(none);
        expect(map.get('Bob')).toEqual(none);
        expect(map.get('Steve')).toEqual(some(13));

        const emptyMap = new mutable.HashMap<string, number>();
        const emptySubtracted = emptyMap.subtractAll(['Alice']);
        expect(emptySubtracted === emptyMap).toBeTruthy();
        expect(emptySubtracted.size).toEqual(0);


        const map2 = mutable.HashMap.of(['Bob', 12], ['Steve', 13], ['Alice', 11]);

        const removed2 = map2.subtractAll(['Alice', 'Bob', 'Steve', 'John']);
        expect(map2 === removed2).toBeTruthy();
        expect(map2.size).toEqual(0);
        expect(map2.get('Alice')).toEqual(none);
        expect(map2.get('Bob')).toEqual(none);
        expect(map2.get('Steve')).toEqual(none);
    });


    test('drop', () => {
        const map = mutable.HashMap.of(['Bob', 12]);
        const map2 = map.drop(1);
        expect(map.size).toEqual(1);
        expect(map2.size).toEqual(0);
        expect(map === map2).toBeFalsy();
    });

    test('toImmutable', () => {
        const map = mutable.HashMap.of(['Bob', 12]);
        const map2 = map.toImmutable;
        expect(map2).toEqual(HashMap.of(['Bob', 12]));
    });

});

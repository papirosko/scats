import {Collection} from "./collection";
import {HashMap} from "./hashmap";
import {none, some} from "./option";

describe('Hashmap', () => {

    test('should create map of', () => {
        expect(HashMap.of(['1', 1], ['2', 3]).toMap).toEqual(new Map([['1', 1], ['2', 3]]));

        expect(Collection.of(
            {id: 1, name: 'foo1'}, {id: 2, name: 'foo2'}
        ).toMap(o => [o.id, o.name]).toMap).toEqual(new Map([[1, 'foo1'], [2, 'foo2']]));

    });

    test('size', () => {
        expect(HashMap.empty.size).toEqual(0);
        expect(HashMap.of(['1', 1], ['2', 3]).size).toEqual(2);
    });

    test('isEmpty', () => {
        expect(HashMap.empty.isEmpty).toBeTruthy();
        expect(HashMap.of(['1', 1], ['2', 3]).isEmpty).toBeFalsy();
        expect(HashMap.of().isEmpty).toBeTruthy();
    });

    test('nonEmpty', () => {
        expect(HashMap.empty.nonEmpty).toBeFalsy();
        expect(HashMap.of(['1', 1], ['2', 3]).nonEmpty).toBeTruthy();
        expect(HashMap.of().nonEmpty).toBeFalsy();
    });

    test('foreach', () => {
        let sum = 0;
        HashMap.of(['1', 1], ['2', 3]).foreach((k, v) => {
            sum = sum + v;
        });
        expect(sum).toEqual(4);
    });

    test('get', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.get('1')).toEqual(some(1));
        expect(map.get('2')).toEqual(some(3));
        expect(map.get('3')).toEqual(none);
    });

    test('getOrElse', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.getOrElse('1', () => 2)).toEqual(1);
        expect(map.getOrElse('2', () => 2)).toEqual(3);
        expect(map.getOrElse('3', () => 5)).toEqual(5);
    });

    test('getOrElseValue', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.getOrElseValue('1', 2)).toEqual(1);
        expect(map.getOrElseValue('2', 2)).toEqual(3);
        expect(map.getOrElseValue('3', 5)).toEqual(5);
    });

    test('keySet', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.keySet).toEqual(new Set(['1', '2']));
    });

    test('keyIterator', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        const iter = map.keyIterator;
        expect(iter.next()).toEqual({value: '1', done: false});
        expect(iter.next()).toEqual({value: '2', done: false});
    });

    test('keys', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.keys).toEqual(Collection.of('1', '2'));
    });


    test('valueIterator', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        const iter = map.valueIterator;
        expect(iter.next()).toEqual({value: 1, done: false});
        expect(iter.next()).toEqual({value: 3, done: false});
    });

    test('values', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.values).toEqual(Collection.of(1, 3));
    });

    test('entriesIterator', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        const iter = map.entriesIterator;
        expect(iter.next()).toEqual({value: ['1', 1], done: false});
        expect(iter.next()).toEqual({value: ['2', 3], done: false});
    });

    test('entries', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.entries).toEqual(Collection.of(['1', 1], ['2', 3]));
    });

    test('addAll', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        const map2 = HashMap.of(['1', 2], ['4', 4]);
        const merged = map.addAll(map2);
        expect(merged).toEqual(HashMap.of(['1', 2], ['2', 3], ['4', 4]));
        expect(merged === map).toBeFalsy();
        expect(merged === map2).toBeFalsy();
    });

    test('set', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        const map2 = map.set('1', 2);
        expect(map2.get('1')).toEqual(some(2));
        expect(map === map2).toBeFalsy();
    });

    test('remove', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        const map2 = map.remove('1');
        expect(map2.get('1')).toEqual(none);
        expect(map === map2).toBeFalsy();
    });

    test('contains', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.contains('1')).toBeTruthy();
        expect(map.contains('3')).toBeFalsy();
    });


    test('updated', () => {
        const original = HashMap.of(['foo1', 1], ['foo2', 2]);
        const updated = original.updated('foo3', 3);
        expect(updated.get('foo1')).toEqual(some(1));
        expect(updated.get('foo2')).toEqual(some(2));
        expect(updated.get('foo3')).toEqual(some(3));
        expect(updated === original).toBeFalsy();
    });


    test('toCollection', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.toCollection()).toEqual(Collection.of(['1', 1], ['2', 3]));
    });

    test('toMap', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.toMap).toEqual(new Map([['1', 1], ['2', 3]]));
    });

    test('immutability on set', () => {
        const originalMap = new Map([['1', 1], ['2', 2]]);
        const hm = new HashMap(originalMap);
        const hmSet = hm.set('3', 3);
        expect(hmSet.get('3')).toEqual(some(3));
        expect(hmSet.toMap.get('3')).toEqual(3);
        expect(originalMap.get('3')).toBeUndefined();
    });

    test('immutability on remove', () => {
        const originalMap = new Map([['1', 1], ['2', 2]]);
        const hm = new HashMap(originalMap);
        const hmDel = hm.remove('2');
        expect(hmDel.get('2')).toEqual(none);
        expect(hmDel.toMap.get('2')).toBeUndefined();
        expect(originalMap.get('2')).toEqual(2);
    })

});

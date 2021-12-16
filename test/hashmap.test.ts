import {Collection, HashMap, HashSet, mutable, none, some} from '../src';

describe('Hashmap', () => {

    test('of', () => {
        expect(HashMap.of(['1', 1], ['2', 3]).toMap).toEqual(new Map([['1', 1], ['2', 3]]));
    });

    test('from', () => {
        expect(HashMap.from([['1', 1], ['2', 3]]).toMap).toEqual(new Map([['1', 1], ['2', 3]]));
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
        HashMap.of(['1', 1], ['2', 3]).foreach(([_, v]) => {
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
        expect(map.keySet).toEqual(HashSet.of('1', '2'));
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

    test('appendedAll', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        const map2 = HashMap.of(['1', 2], ['4', 4]);
        const merged = map.appendedAll(map2);
        expect(merged).toEqual(HashMap.of(['1', 2], ['2', 3], ['4', 4]));
        expect(merged === map).toBeFalsy();
        expect(merged === map2).toBeFalsy();
    });

    test('concat', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        const map2 = HashMap.of(['1', 2], ['4', 4]);
        const merged = map.concat(map2);
        expect(merged).toEqual(HashMap.of(['1', 2], ['2', 3], ['4', 4]));
        expect(merged === map).toBeFalsy();
        expect(merged === map2).toBeFalsy();
    });

    test('set', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        const map2 = map.set('1', 2);
        expect(map2.get('1')).toEqual(some(2));
        expect(map === map2).toBeFalsy();
        expect(map.toMap === map2.toMap).toBeFalsy();
    });

    test('removed', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        const map2 = map.removed('1');
        expect(map2.get('1')).toEqual(none);
        expect(map === map2).toBeFalsy();
    });

    test('removedAll', () => {
        const map = HashMap.of(['1', 1], ['2', 2], ['3', 3]);
        const map2 = map.removedAll(['1', '2']);
        expect(map2.get('1')).toEqual(none);
        expect(map2.get('2')).toEqual(none);
        expect(map2.get('3')).toEqual(some(3));
        expect(map === map2).toBeFalsy();
    });

    test('containsKey', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.containsKey('1')).toBeTruthy();
        expect(map.containsKey('3')).toBeFalsy();
    });


    test('appended', () => {
        const original = HashMap.of(['foo1', 1], ['foo2', 2]);
        const appended = original.appended('foo3', 3);
        expect(appended.get('foo1')).toEqual(some(1));
        expect(appended.get('foo2')).toEqual(some(2));
        expect(appended.get('foo3')).toEqual(some(3));
        expect(appended === original).toBeFalsy();
        expect(appended.toMap === original.toMap).toBeFalsy();
    });

    test('updated', () => {
        const original = HashMap.of(['foo1', 1], ['foo2', 2]);
        const updated = original.updated('foo3', 3);
        expect(updated.get('foo1')).toEqual(some(1));
        expect(updated.get('foo2')).toEqual(some(2));
        expect(updated.get('foo3')).toEqual(some(3));
        expect(updated === original).toBeFalsy();
        expect(updated.toMap === original.toMap).toBeFalsy();
    });

    test('updatedWith', () => {
        const original: HashMap<string, number> = HashMap.of(['foo1', 1], ['foo2', 2]);
        expect(original.updatedWith('foo1')((opt) => some(opt.getOrElseValue(0) + 1)).get('foo1')).toEqual(some(2));
        expect(original.updatedWith('foo2')(() => none).get('foo2')).toEqual(none);
        expect(original.updatedWith('foo3')((opt) => some(opt.getOrElseValue(0) + 1)).get('foo1')).toEqual(some(1));
        expect(original.updatedWith('foo3')(() => none)).toEqual(original);
    });


    test('toCollection', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.toCollection).toEqual(Collection.of(['1', 1], ['2', 3]));
    });

    test('toMap', () => {
        const map = HashMap.of(['1', 1], ['2', 3]);
        expect(map.toMap).toEqual(new Map([['1', 1], ['2', 3]]));
    });

    test('immutability on set', () => {
        const hm = HashMap.of<string, number>(['1', 1], ['2', 2]);
        const hmSet = hm.set('3', 3);
        expect(hmSet.get('3')).toEqual(some(3));
        expect(hmSet.toMap.get('3')).toEqual(3);
        expect(hm.get('3')).toEqual(none);
    });

    test('immutability on remove', () => {
        const hm = HashMap.of(['1', 1], ['2', 2]);
        const hmDel = hm.removed('2');
        expect(hmDel.get('2')).toEqual(none);
        expect(hmDel.toMap.get('2')).toBeUndefined();
        expect(hm.get('2')).toEqual(some(2));
    });

    test('toArray', () => {
        expect(HashMap.of(['1', 1], ['2', 2]).toArray).toEqual([['1', 1], ['2', 2]]);
    });

    test('partition', () => {
        const actual = HashMap.of(['1', 1], ['2', 2]).partition(([_, i]) => i % 2 === 0);
        expect(actual).toEqual([HashMap.of(['2', 2]), HashMap.of(['1', 1])]);
    });

    test('take', () => {

        expect(HashMap.empty.take(1)).toEqual(HashMap.empty);
        expect(HashMap.of(['1', 1], ['2', 2]).take(0)).toEqual(HashMap.of());
        expect(HashMap.of(['1', 1], ['2', 2]).take(1)).toEqual(HashMap.of(['1', 1]));
        expect(HashMap.of(['1', 1], ['2', 2]).take(2)).toEqual(HashMap.of(['1', 1], ['2', 2]));
        expect(HashMap.of(['1', 1], ['2', 2]).take(3)).toEqual(HashMap.of(['1', 1], ['2', 2]));

    });

    test('takeRight', () => {

        expect(HashMap.empty.takeRight(1)).toEqual(HashMap.empty);
        expect(HashMap.of(['1', 1], ['2', 2]).takeRight(0)).toEqual(HashMap.empty);
        expect(HashMap.of(['1', 1], ['2', 2]).takeRight(1)).toEqual(HashMap.of(['2', 2]));
        expect(HashMap.of(['1', 1], ['2', 2]).takeRight(2)).toEqual(HashMap.of(['1', 1], ['2', 2]));
        expect(HashMap.of(['1', 1], ['2', 2]).takeRight(3)).toEqual(HashMap.of(['1', 1], ['2', 2]));

    });

    test('takeWhile', () => {
        expect(HashMap.of(['1', 1], ['2', 2], ['3', 3]).takeWhile(([_, v]) => v <= 2)).toEqual(HashMap.of(['1', 1], ['2', 2]));
        expect(HashMap.of(['1', 1], ['2', 2], ['3', 3]).takeWhile(([_, v]) => v <= 0)).toEqual(HashMap.empty);
        expect(HashMap.of(['1', 1], ['2', 2], ['3', 3]).takeWhile(([_, v]) => v <= 4)).toEqual(HashMap.of(['1', 1], ['2', 2], ['3', 3]));
    });

    test('drop', () => {

        expect(HashMap.empty.drop(1)).toEqual(HashMap.empty);
        expect(HashMap.of(['1', 1], ['2', 2]).drop(0)).toEqual(HashMap.of(['1', 1], ['2', 2]));
        expect(HashMap.of(['1', 1], ['2', 2]).drop(1)).toEqual(HashMap.of(['2', 2]));
        expect(HashMap.of(['1', 1], ['2', 2]).drop(2)).toEqual(HashMap.empty);
        expect(HashMap.of(['1', 1], ['2', 2]).drop(3)).toEqual(HashMap.empty);

    });

    test('dropRight', () => {

        expect(HashMap.empty.dropRight(1)).toEqual(HashMap.empty);
        expect(HashMap.of(['1', 1], ['2', 2]).dropRight(0)).toEqual(HashMap.of(['1', 1], ['2', 2]));
        expect(HashMap.of(['1', 1], ['2', 2]).dropRight(1)).toEqual(HashMap.of(['1', 1]));
        expect(HashMap.of(['1', 1], ['2', 2]).dropRight(2)).toEqual(HashMap.empty);
        expect(HashMap.of(['1', 1], ['2', 2]).dropRight(3)).toEqual(HashMap.empty);

    });

    test('dropWhile', () => {
        expect(HashMap.of(['1', 1], ['2', 2], ['3', 3]).dropWhile(([_, v]) => v <= 2)).toEqual(HashMap.of(['3', 3]));
        expect(HashMap.of(['1', 1], ['2', 2], ['3', 3]).dropWhile(([_, v]) => v <= 0)).toEqual(HashMap.of(['1', 1], ['2', 2], ['3', 3]));
        expect(HashMap.of(['1', 1], ['2', 2], ['3', 3]).dropWhile(([_, v]) => v <= 4)).toEqual(HashMap.empty);
    });

    test('sum', () => {
        expect(HashMap.empty.sum(([_, v]) => v)).toEqual(0);
        expect(HashMap.of(['1', 1], ['2', 2]).sum(([_, v]) => v)).toEqual(3);
    });

    test('filter, filterNot', () => {
        expect(HashMap.of(['1', 1], ['2', 2]).filter(([_, v]) => v <= 1)).toEqual(HashMap.of(['1', 1]));
        expect(HashMap.of(['1', 1], ['2', 2]).filter(([_, v]) => v <= 0)).toEqual(HashMap.empty);
        expect(HashMap.of(['1', 1], ['2', 2]).filterNot(([_, v]) => v <= 1)).toEqual(HashMap.of(['2', 2]));
    });

    test('for of', () => {
        let sum = 0;
        for (const [, i] of HashMap.of(['1', 1], ['2', 2], ['3', 3])) {
            sum += i;
        }

        expect(sum).toBe(6);
    });

    test('toImmutable', () => {
        const map = HashMap.of(['Bob', 12]);
        const map2 = map.toMutable;
        expect(map2).toEqual(mutable.HashMap.of(['Bob', 12]));
    });

});

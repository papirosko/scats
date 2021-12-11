import {mutable, some, none} from '../src';

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


});
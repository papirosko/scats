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

});
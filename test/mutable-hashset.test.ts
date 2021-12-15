import {mutable} from '../src';

describe('mutable.HashMap', () => {

    test('create', () => {
        const map = new mutable.HashSet();
        expect(map.size).toEqual(0);
    });

    test('of', () => {
        const map = mutable.HashSet.of(1, 2, 2, 3);
        expect(map.size).toEqual(3);
        expect(map.contains(1)).toBeTruthy();
        expect(map.contains(2)).toBeTruthy();
        expect(map.contains(3)).toBeTruthy();
        expect(map.contains(4)).toBeFalsy();
    });

});

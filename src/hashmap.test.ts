import {Collection} from "./collection";
import {HashMap} from "./hashmap";
import {some} from "./option";

describe('Hashmap', () => {

    test('should create map of', () => {
        expect(HashMap.of(['1', 1], ['2', 3]).toMap).toEqual(new Map([['1', 1], ['2', 3]]));

        expect(Collection.of(
            {id: 1, name: 'foo1'}, {id: 2, name: 'foo2'}
        ).toMap(o => [o.id, o.name]).toMap).toEqual(new Map([[1, 'foo1'], [2, 'foo2']]));

    });

    test('updated', () => {
        const original = HashMap.of(['foo1', 1], ['foo2', 2]);
        const updated = original.updated('foo3', 3);
        expect(updated.get('foo1')).toEqual(some(1));
        expect(updated.get('foo2')).toEqual(some(2));
        expect(updated.get('foo3')).toEqual(some(3));
        expect(updated === original).toBeFalsy();
    })

});

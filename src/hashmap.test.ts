import {Collection} from "./collection";
import {HashMap} from "./hashmap";

describe('Hashmap', () => {

    test('should create map of', () => {
        expect(HashMap.of(['1', 1], ['2', 3]).toMap).toEqual(new Map([['1', 1], ['2', 3]]));

        expect(Collection.of(
            {id: 1, name: 'foo1'}, {id: 2, name: 'foo2'}
        ).toMap(o => [o.id, o.name]).toMap).toEqual(new Map([[1, 'foo1'], [2, 'foo2']]));

    });

});

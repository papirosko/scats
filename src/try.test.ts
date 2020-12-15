import {failure, success, Try} from "./try";
import {none, some} from "./option";
import {left, right} from "./either";

describe('Try', () => {

    const successAware = () => {
        return 'success';
    }

    const errorAware = () => {
        throw new Error('error');
    }


    test('store the response', () => {

        expect(Try(() => 1/1)).toEqual(success(1));
        expect(Try(() => 1/1).toOption).toEqual(some(1));
        expect(Try(() => 1/1).toEither).toEqual(right(1));

    });

    test('should catch errors', () => {

        expect(Try(() => {
            throw new Error('123');
        })).toEqual(failure(new Error('123')));

        expect(Try(errorAware).toOption).toEqual(none);

        expect(Try(() => {
            throw new Error('test');
        }).toEither).toEqual(left(new Error('test')));

    });

    test('should map', () => {
        expect(Try(successAware).map(_ => 123)).toEqual(success(123));
        expect(Try(errorAware).map(_ => 123)).toEqual(failure(new Error('error')));
    })

});

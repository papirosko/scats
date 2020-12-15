import {Right, Left, right, left} from './either';
import {some, none} from './option';

describe('Either', () => {

    test('should construct', () => {
        expect(right('123')).toEqual(new Right('123'));
        expect(left('123')).toEqual(new Left('123'));
    });


    test('should equal', () => {
        expect(right('123')).toEqual(right('123'));
        expect(left('123')).toEqual(left('123'));
    });


    test('convert to option', () => {
        expect(right('123').toOption).toEqual(some('123'));
        expect(left('123').toOption).toEqual(none);
    });

    test('match', () => {

        expect(right('123').match({
            right: () => 111,
            left: () => 222
        })).toEqual(111);

        expect(left('123').match({
            right: () => 111,
            left: () => 222
        })).toEqual(222);
    });



});

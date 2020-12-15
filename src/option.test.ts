import {none, option, some} from "./option";
import {left, right} from "./either";

describe('Option', () => {

    test('should equal', () => {
        expect(none).toEqual(none);
        expect(option(null)).toEqual(none);
        expect(some(1)).toEqual(some(1));
        expect(some(1)).toEqual(option(1));
        expect(some(1)).not.toEqual(some(2));
        expect(some(1)).not.toEqual(none);
    })

    test('should detect nulls and undefined', () => {

        expect(option(1).isDefined).toBeTruthy();
        expect(option(1).isEmpty).toBeFalsy();

        expect(option(null).isDefined).toBeFalsy();
        expect(option(null).isEmpty).toBeTruthy();

        expect(option(undefined).isDefined).toBeFalsy();
        expect(option(undefined).isEmpty).toBeTruthy();

    });

    test('should map', () => {

        expect(option(1).map(x => x + 1)).toEqual(some(2));
        expect(option(null).map(x => (x || 0) + 1)).toEqual(none);

    });

    test('should flatMap', () => {

        expect(option(1).flatMap(() => option(2))).toEqual(some(2));
        expect(option(null).flatMap(() => option(2))).toEqual(none);
        expect(option(1).flatMap(() => option(null))).toEqual(none);

    });

    test('should convert to collection', () => {

        expect(option(1).toCollection.size).toEqual(1);
        expect(option(null).toCollection.size).toEqual(0);

    });

    test('should support contains', () => {
        expect(option(1).contains(1)).toBeTruthy();
        expect(option(2).contains(1)).toBeFalsy();
        expect(option<any>(null).contains(1)).toBeFalsy();
    });

    test('should support toRight', () => {
        expect(option(1).toRight(() => 2)).toEqual(right(1));
        expect(option(null).toRight(() => 2)).toEqual(left(2));
    });

    test('should support toLeft', () => {
        expect(option(1).toLeft(() => 2)).toEqual(left(1));
        expect(option(null).toLeft(() => 2)).toEqual(right(2));
    });

    test('should support get', () => {
        expect(option(1).get).toEqual(1);
        expect(() => option(null).get).toThrowError('No such element.');
    });

    test('should support get', () => {
        expect(option(1).toArray).toEqual([1]);
        expect(option(null).toArray).toEqual([]);
    });

    test('should support nonEmpty', () => {
        expect(option(1).nonEmpty).toBeTruthy();
        expect(option(null).nonEmpty).toBeFalsy();
    });

    test('should support orNull', () => {
        expect(option(1).orNull).toEqual(1);
        expect(option(null).orNull).toBeNull();
    });

    test('should support orUndefined', () => {
        expect(option(1).orUndefined).toEqual(1);
        expect(option(null).orUndefined).toBeUndefined();
    });

    test('should support exists', () => {
        expect(option(1).exists(x => x === 1)).toBeTruthy()
        expect(option(1).exists(x => x === 2)).toBeFalsy();
        expect(option(null).exists(x => x === 2)).toBeFalsy();
    });

    test('should support filter', () => {
        expect(option(1).filter(x => x >= 1)).toEqual(some(1))
        expect(option(1).filter(x => x < 1)).toEqual(none);
        expect(option(null).filter(x => x! > 2)).toEqual(none);
    });

    test('should support filterNot', () => {
        expect(option(1).filterNot(x => x >= 1)).toEqual(none)
        expect(option(1).filterNot(x => x < 1)).toEqual(some(1));
        expect(option(null).filterNot(x => x! > 2)).toEqual(none);
    });

    test('should support getOrElseValue', () => {
        expect(option(1).getOrElseValue(2)).toEqual(1)
        expect(option<any>(null).getOrElseValue(2)).toEqual(2);
    });

    test('should support orElse', () => {
        expect(option(1).orElse(() => some(2))).toEqual(some(1))
        expect(option<any>(null).orElse(() => some<any>(2))).toEqual(some(2));
    });

    test('should support orElseValue', () => {
        expect(option(1).orElseValue(some(2))).toEqual(some(1))
        expect(option<any>(null).orElseValue(some<any>(2))).toEqual(some(2));
    });

    test('should support fold', () => {
        expect(option(1).fold(() => 0)((x: number) => x + 1)).toEqual(2);
        expect(option<any>(null).fold(() => 0)(x => x + 1)).toEqual(0);
    });

    test('should support forall', () => {
        expect(option(1).forall(x => x >= 1)).toBeTruthy();
        expect(option(1).forall(x => x < 1)).toBeFalsy();
        expect(option<any>(null).forall(x => x < 1)).toBeFalsy();
    });

    test('should support foreach', () => {
        const emptyArr: any[] = [];
        option(null).foreach(x => emptyArr.push(x));
        expect(emptyArr).toEqual([]);

        const fillArr: any[] = [];
        option(1).foreach(x => fillArr.push(x));
        expect(fillArr).toEqual([1]);

    });


});






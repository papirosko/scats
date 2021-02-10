import {Collection} from "./collection";
import {none, some} from "./option";
import {idFunction} from "./util";

describe('Collection', () => {

    test('should create collection of', () => {
        expect(Collection.of(1, 2, 3, 4).toArray).toEqual([1, 2, 3, 4]);
    });

    test('should create collection fill', () => {
        expect(Collection.fill(4)(n => n).toArray).toEqual([0, 1, 2, 3]);
    });

    test('should filter', () => {
        expect(Collection.of(1, 2, 3, 4).filter(x => x > 2).toArray).toEqual([3, 4]);
    });

    test('should filterNot', () => {
        expect(Collection.of(1, 2, 3, 4).filterNot(x => x > 2).toArray).toEqual([1, 2]);
    });

    test('should flatten', () => {

        expect(Collection.of<any>(1, Collection.of(2, 3), 4).flatten().toArray)
            .toEqual([1, 2, 3, 4])

    });

    test('should flatMap', () => {

        expect(Collection.of<any>(1, 2).flatMap(n => Collection.fill(n)(() => n)).toArray)
            .toEqual([1, 2, 2]);

    });

    test('should sum', () => {

        expect(Collection.empty.sum(idFunction)).toEqual(0);
        expect(Collection.of<any>(1, 2).sum(idFunction)).toEqual(3);

    });

    test('should take', () => {

        expect(Collection.empty.take(1).toArray).toEqual([]);
        expect(Collection.of<any>(1, 2).take(0).toArray).toEqual([]);
        expect(Collection.of<any>(1, 2).take(1).toArray).toEqual([1]);
        expect(Collection.of<any>(1, 2).take(2).toArray).toEqual([1, 2]);
        expect(Collection.of<any>(1, 2).take(3).toArray).toEqual([1, 2]);

    });

    test('should drop', () => {

        expect(Collection.empty.drop(1).toArray).toEqual([]);
        expect(Collection.of<any>(1, 2).drop(0).toArray).toEqual([1, 2]);
        expect(Collection.of<any>(1, 2).drop(1).toArray).toEqual([2]);
        expect(Collection.of<any>(1, 2).drop(2).toArray).toEqual([]);
        expect(Collection.of<any>(1, 2).drop(3).toArray).toEqual([]);

    });

    test('should headOption and head', () => {

        expect(Collection.empty.headOption).toEqual(none);
        expect(Collection.of(1, 2).headOption).toEqual(some(1));

        expect(() => Collection.empty.head).toThrow(Error);
        expect(Collection.of(1, 2).head).toEqual(1);

    });

    test('should lastOption and last', () => {

        expect(Collection.empty.lastOption).toEqual(none);
        expect(Collection.of(1, 2).lastOption).toEqual(some(2));

        expect(() => Collection.empty.last).toThrow(Error);
        expect(Collection.of(1, 2).last).toEqual(2);

    });


    test('should support foreach', () => {
        const emptyArray: any[] = [];
        Collection.empty.foreach(_ => emptyArray.push(_));
        expect(emptyArray).toEqual([]);

        const fillArray: any[] = [];
        Collection.of(1).foreach(_ => fillArray.push(_));
        expect(fillArray).toEqual([1]);

    });

    test('should support reverse', () => {
        expect(Collection.of(1, 2).reverse()).toEqual(Collection.of(2, 1));
    });

    test('should support forall', () => {
        expect(Collection.of(1, 2).forall(_ => _ > 3)).toBeFalsy();
        expect(Collection.of(1, 2).forall(_ => _ < 3)).toBeTruthy();
    });

    test('should support sort', () => {
        expect(Collection.of(3, 1, 2).sort((a, b) => a - b))
            .toEqual(Collection.of(1, 2, 3));
    });

    test('should support mkString', () => {
        expect(Collection.of(3, 1, 2).mkString(', ')).toEqual('3, 1, 2');
    });

    test('should support nonEmpty', () => {
        expect(Collection.of(3, 1, 2).nonEmpty).toBeTruthy();
        expect(Collection.empty.nonEmpty).toBeFalsy();
    });

    test('should get element by index', () => {
        expect(Collection.of(3, 1, 2).get(1)).toEqual(1);
    });

    test('should support find', () => {
        expect(Collection.of(3, 1, 2).find(_ => _ >= 3)).toEqual(some(3));
        expect(Collection.of(3, 1, 2).find(_ => _ >= 4)).toEqual(none);
    });

    test('should support count', () => {
        expect(Collection.of(3, 1, 2).count(_ => _ >= 3)).toEqual(1);
        expect(Collection.of(3, 1, 2).count(_ => _ >= 4)).toEqual(0);
    });

    test('should support exists', () => {
        expect(Collection.of(3, 1, 2).exists(_ => _ >= 3)).toBeTruthy();
        expect(Collection.of(3, 1, 2).exists(_ => _ >= 4)).toBeFalsy();
    });

    test('should support map', () => {
        expect(Collection.of(3, 1, 2).map(_ => _ + 1)).toEqual(Collection.of(4, 2, 3));
    });

    test('should support slice', () => {
        expect(Collection.of(1, 2, 3).slice(0, 2)).toEqual(Collection.of(1, 2));
        expect(Collection.of(1, 2, 3).slice(0, 3)).toEqual(Collection.of(1, 2, 3));
        expect(Collection.of(1, 2, 3).slice(5, 7)).toEqual(Collection.empty);
    });

    test('should support takeWhile', () => {
        expect(Collection.of(1, 2, 3).takeWhile(_ => _ <= 2)).toEqual(Collection.of(1, 2));
        expect(Collection.of(1, 2, 3).takeWhile(_ => _ <= 0)).toEqual(Collection.empty);
        expect(Collection.of(1, 2, 3).takeWhile(_ => _ <= 4)).toEqual(Collection.of(1, 2, 3));
    });

    test('should support dropWhile', () => {
        expect(Collection.of(1, 2, 3).dropWhile(_ => _ <= 2)).toEqual(Collection.of(3));
        expect(Collection.of(1, 2, 3).dropWhile(_ => _ <= 0)).toEqual(Collection.of(1, 2, 3));
        expect(Collection.of(1, 2, 3).dropWhile(_ => _ <= 4)).toEqual(Collection.empty);
    });

    test('foldLeft', () => {
        expect(Collection.of(1, 2, 3).foldLeft(0)((a, b) => a + b)).toEqual(6);
        expect(Collection.of(1, 2, 3).fold(0)((a, b) => a + b)).toEqual(6);
        expect(Collection.of(1, 2, 3).fold({sum: 0})((a, b) =>
            ({
                sum: a.sum + b
            }))).toEqual({sum: 6});
    });

    test('foldRight', () => {
        expect(Collection.of(1, 2, 3).foldRight(0)((a, b) => a + b)).toEqual(6);
        expect(Collection.of(1, 2, 3).foldRight({sum: 0})((a, b) =>
            ({
                sum: b.sum + a
            }))).toEqual({sum: 6});
    });

});

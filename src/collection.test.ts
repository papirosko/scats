import {Collection} from "./collection";
import {none, some} from "./option";
import {idFunction} from "./util";
import {HashMap} from "./hashmap";
import {HashSet} from "./hashset";

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

    test('groupBy', () => {
        expect(Collection.of(
            {name: 'Foo1', amount: 1},
            {name: 'Foo2', amount: 3},
            {name: 'Foo1', amount: 2},
        ).groupBy(x => x.name)).toEqual(HashMap.of(
            ['Foo1', Collection.of({name: 'Foo1', amount: 1}, {name: 'Foo1', amount: 2})],
            ['Foo2', Collection.of({name: 'Foo2', amount: 3})],
        ))
    });

    test('sortBy', () => {
        expect(Collection.of(
            {name: 'Foo1', amount: 1},
            {name: 'Foo2', amount: 3},
            {name: 'Foo1', amount: 2},
        ).sortBy(x => x.amount)).toEqual(Collection.of(
            {name: 'Foo1', amount: 1},
            {name: 'Foo1', amount: 2},
            {name: 'Foo2', amount: 3},
        ))
    });


    test('reduce, reduceLeft, reduceRight', () => {

        expect(() => Collection.empty.reduce(idFunction)).toThrow(Error);
        expect(() => Collection.empty.reduceLeft(idFunction)).toThrow(Error);
        expect(() => Collection.empty.reduceRight(idFunction)).toThrow(Error);

        expect(Collection.empty.reduceOption(idFunction)).toEqual(none);
        expect(Collection.empty.reduceLeftOption(idFunction)).toEqual(none);
        expect(Collection.empty.reduceRightOption(idFunction)).toEqual(none);

        expect(Collection.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).reduce((x1, x2) => ({
            amount: x1.amount + x2.amount
        }))).toEqual({amount: 6});

        expect(Collection.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).reduceLeft((x1, x2) => ({
            amount: x1.amount + x2.amount
        }))).toEqual({amount: 6});

        expect(Collection.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).reduceRight((x1, x2) => ({
            amount: x1.amount + x2.amount
        }))).toEqual({amount: 6});

        expect(Collection.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).reduceOption((x1, x2) => ({
            amount: x1.amount + x2.amount
        }))).toEqual(some({amount: 6}));

        expect(Collection.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).reduceLeftOption((x1, x2) => ({
            amount: x1.amount + x2.amount
        }))).toEqual(some({amount: 6}));

        expect(Collection.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).reduceRightOption((x1, x2) => ({
            amount: x1.amount + x2.amount
        }))).toEqual(some({amount: 6}));
    });


    test('minBy, minByOption, maxBy, maxByOption', () => {
        expect(() => Collection.empty.minBy(idFunction)).toThrow(Error);
        expect(() => Collection.empty.maxBy(idFunction)).toThrow(Error);

        expect(Collection.empty.minByOption(idFunction)).toEqual(none);
        expect(Collection.empty.maxByOption(idFunction)).toEqual(none);

        expect(Collection.of(
            {amount: 4},
            {amount: 5},
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).minBy(x => x.amount)).toEqual({amount: 1});

        expect(Collection.of(
            {amount: 4},
            {amount: 5},
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).minByOption(x => x.amount)).toEqual(some({amount: 1}));

        expect(Collection.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).maxBy(x => x.amount)).toEqual({amount: 3});

        expect(Collection.of(
            {amount: 1},
            {amount: 3},
            {amount: 2},
        ).maxByOption(x => x.amount)).toEqual(some({amount: 3}));

    })

    test('sliding', () => {
        expect(Collection.empty.sliding(2)).toEqual(Collection.empty);
        expect(Collection.of(1).sliding(2)).toEqual(Collection.of(Collection.of(1)));
        expect(Collection.of(1, 2).sliding(2)).toEqual(Collection.of(Collection.of(1, 2)));
        expect(Collection.of(1, 2, 3).sliding(2)).toEqual(Collection.of(
            Collection.of(1, 2),
            Collection.of(2, 3),
        ));

        expect(Collection.empty.sliding(2, 2)).toEqual(Collection.empty);
        expect(Collection.of(1).sliding(2, 2)).toEqual(Collection.of(Collection.of(1)));
        expect(Collection.of(1, 2).sliding(2, 2)).toEqual(Collection.of(Collection.of(1, 2)));
        expect(Collection.of(1, 2, 3).sliding(2, 2)).toEqual(Collection.of(
            Collection.of(1, 2),
            Collection.of(3),
        ));

        expect(Collection.of(1, 2).sliding(5, 3)).toEqual(Collection.of(Collection.of(1, 2)));

    });

    test('grouped', () => {
        expect(Collection.empty.grouped(2)).toEqual(Collection.empty);
        expect(Collection.of(1).grouped(2)).toEqual(Collection.of(Collection.of(1)));
        expect(Collection.of(1, 2).grouped(2)).toEqual(Collection.of(Collection.of(1, 2)));
        expect(Collection.of(1, 2, 3).grouped(2)).toEqual(Collection.of(
            Collection.of(1, 2),
            Collection.of(3),
        ));

    });

    test("appended, appendedAll, prepended, prependedAll, concat", () => {
        expect(Collection.of(2).appended(1)).toEqual(Collection.of(2, 1));
        expect(Collection.of(2).prepended(1)).toEqual(Collection.of(1, 2));
        expect(Collection.of(2).appendedAll(Collection.of(3, 4))).toEqual(Collection.of(2, 3, 4));
        expect(Collection.of(2).concat(Collection.of(3, 4))).toEqual(Collection.of(2, 3, 4));
        expect(Collection.of(2).prependedAll(Collection.of(0, 1))).toEqual(Collection.of(0, 1, 2));
    })

    test('distinct', () => {
        expect(Collection.of(1, 1, 2, 2, 3).distinct).toEqual(Collection.of(1, 2, 3));
    })

    test('indexOf', () => {
        expect(Collection.of(1, 2, 3).indexOf(2)).toEqual(1);
    });

    test('contains', () => {
        expect(Collection.of(1, 2, 3).contains(2)).toBeTruthy();
    });

    test('toSet', () => {
        expect(Collection.of(1, 2, 2, 3).toSet()).toEqual(HashSet.of(1, 2, 3));
    });

    test('toMap', () => {
        expect(Collection.of(
            {id: 1, name: 'foo1'}, {id: 2, name: 'foo2'}
        ).toMap(o => [o.id, o.name]).toMap).toEqual(new Map([[1, 'foo1'], [2, 'foo2']]));
    });

});

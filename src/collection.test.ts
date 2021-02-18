import {Collection, Nil} from "./collection";
import {none, some} from "./option";
import {forComprehension, identity, step} from "./util";
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

    test('flatMap', () => {

        expect(Collection.of<any>(1, 2).flatMap(n => Collection.fill(n)(() => n)).toArray)
            .toEqual([1, 2, 2]);

    });

    test('flatMapPromise', async () => {

        await expect(Collection.of<any>(1, 2).flatMapPromise(n =>
            Promise.resolve(Collection.fill(n)(() => n))
        )).resolves.toEqual(Collection.of(1, 2, 2));

    });

    test('sum', () => {
        expect(Collection.empty.sum(identity)).toEqual(0);
        expect(Collection.of<any>(1, 2).sum(identity)).toEqual(3);
    });

    test('take', () => {

        expect(Nil.take(1)).toEqual(Nil);
        expect(Collection.of(1, 2).take(0)).toEqual(Collection.of());
        expect(Collection.of(1, 2).take(1)).toEqual(Collection.of(1));
        expect(Collection.of(1, 2).take(2)).toEqual(Collection.of(1, 2));
        expect(Collection.of(1, 2).take(3)).toEqual(Collection.of(1, 2));

    });

    test('takeRight', () => {

        expect(Nil.takeRight(1)).toEqual(Nil);
        expect(Collection.of(1, 2).takeRight(0)).toEqual(Nil);
        expect(Collection.of(1, 2).takeRight(1)).toEqual(Collection.of(2));
        expect(Collection.of(1, 2).takeRight(2)).toEqual(Collection.of(1, 2));
        expect(Collection.of(1, 2).takeRight(3)).toEqual(Collection.of(1, 2));

    });

    test('takeWhile', () => {
        expect(Collection.of(1, 2, 3).takeWhile(_ => _ <= 2)).toEqual(Collection.of(1, 2));
        expect(Collection.of(1, 2, 3).takeWhile(_ => _ <= 0)).toEqual(Collection.empty);
        expect(Collection.of(1, 2, 3).takeWhile(_ => _ <= 4)).toEqual(Collection.of(1, 2, 3));
    });

    test('span', () => {
        expect(Collection.of(1, 2, 3).span(_ => _ <= 2))
            .toEqual([Collection.of(1, 2), Collection.of(3)]);
    });

    test('drop', () => {
        expect(Collection.empty.drop(1).toArray).toEqual([]);
        expect(Collection.of(1, 2).drop(0)).toEqual(Collection.of(1, 2));
        expect(Collection.of(1, 2).drop(1)).toEqual(Collection.of(2));
        expect(Collection.of(1, 2).drop(2)).toEqual(Nil);
        expect(Collection.of(1, 2).drop(3)).toEqual(Nil);
    });

    test('dropRight', () => {

        expect(Nil.dropRight(1)).toEqual(Nil);
        expect(Collection.of(1, 2).dropRight(0)).toEqual(Collection.of(1, 2));
        expect(Collection.of(1, 2).dropRight(1)).toEqual(Collection.of(1));
        expect(Collection.of(1, 2).dropRight(2)).toEqual(Nil);
        expect(Collection.of(1, 2).dropRight(3)).toEqual(Nil);

    });

    test('dropWhile', () => {
        expect(Collection.of(1, 2, 3).dropWhile(_ => _ <= 2)).toEqual(Collection.of(3));
        expect(Collection.of(1, 2, 3).dropWhile(_ => _ <= 0)).toEqual(Collection.of(1, 2, 3));
        expect(Collection.of(1, 2, 3).dropWhile(_ => _ <= 4)).toEqual(Collection.empty);
    });

    test('init, tail', () => {
        expect(() => Collection.empty.tail).toThrow(Error);
        expect(Collection.of(1).tail).toEqual(Nil);
        expect(Collection.of(1, 2).tail).toEqual(Collection.of(2));

        expect(() => Collection.empty.init).toThrow(Error);
        expect(Collection.of(1).init).toEqual(Nil);
        expect(Collection.of(1,2,3).init).toEqual(Collection.of(1,2));

    });



    test('headOption, head', () => {

        expect(Collection.empty.headOption).toEqual(none);
        expect(Collection.of(1, 2).headOption).toEqual(some(1));

        expect(() => Collection.empty.head).toThrow(Error);
        expect(Collection.of(1, 2).head).toEqual(1);

    });

    test('lastOption, last', () => {

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

        expect(() => Collection.empty.reduce(identity)).toThrow(Error);
        expect(() => Collection.empty.reduceLeft(identity)).toThrow(Error);
        expect(() => Collection.empty.reduceRight(identity)).toThrow(Error);

        expect(Collection.empty.reduceOption(identity)).toEqual(none);
        expect(Collection.empty.reduceLeftOption(identity)).toEqual(none);
        expect(Collection.empty.reduceRightOption(identity)).toEqual(none);

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
        expect(() => Collection.empty.minBy(identity)).toThrow(Error);
        expect(() => Collection.empty.maxBy(identity)).toThrow(Error);

        expect(Collection.empty.minByOption(identity)).toEqual(none);
        expect(Collection.empty.maxByOption(identity)).toEqual(none);

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

    test('distinctBy', () => {
        expect(Collection.of(
            {name: 'Foo', age: 1},
            {name: 'Foo', age: 2},
            {name: 'Bar', age: 3},
        ).distinctBy(x => x.name)).toEqual(Collection.of(
            {name: 'Foo', age: 1},
            {name: 'Bar', age: 3},
        ));
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

    test('partition', () => {
        const actual = Collection.of(1, 2, 3, 4).partition(i => i % 2 === 0);
        expect(actual).toEqual([Collection.of(2, 4), Collection.of(1, 3)]);
    });

    test('splitAt', () => {
        expect(Collection.of(1, 2, 3, 4).splitAt(2)).toEqual([Collection.of(1, 2), Collection.of(3, 4)]);
        expect(Collection.of(1, 2, 3, 4).splitAt(0)).toEqual([Nil, Collection.of(1, 2, 3, 4)]);
        expect(Collection.of(1, 2, 3, 4).splitAt(5)).toEqual([Collection.of(1, 2, 3, 4), Nil]);
        expect(Nil.splitAt(1)).toEqual([Nil, Nil]);
    });

    test('forComprehension', () => {
        const res = forComprehension(
            step('n', () => Collection.of(1,2,3))
        ).yield(({n}) => n + 1)
        expect(res).toEqual(Collection.of(2, 3, 4));

        expect(forComprehension(
            step('n', () => Collection.of(1,2,3)).if(({n}) => n % 2 === 0)
        ).yield(({n}) => n + 1)).toEqual(Collection.of(3));


        const y = Collection.of(1, 2).flatMap(i =>
            Collection.of(4, 3).map(j =>
                [i, j]
            )
        );
        expect(y).toEqual(Collection.of([1, 4], [1, 3], [2, 4], [2, 3]));

        const x = forComprehension(
            step('i', () => Collection.of(1, 2)),
            step('j', () => Collection.of(4, 3))
        ).yield(({i, j}) => [i, j]);
        expect(x).toEqual(Collection.of([1, 4], [1, 3], [2, 4], [2, 3]));

        const z = forComprehension(
            step('i', () => Collection.of(1, 2)),
            step('j', () => Collection.of(2, 1)).if(({i, j}) => i + j === 3)
        ).yield(({i, j}) => [i, j]);
        expect(z).toEqual(Collection.of([1, 2], [2, 1]));

        expect(forComprehension(
            step('i', () => Collection.of(1, 2)),
            step('j', () => Collection.of(4, 3)),
            step('k', () => Collection.of(5, 6))
        ).yield(({i, j, k}) => [i, j, k])).toEqual(
            Collection.of(
                [1, 4, 5], [1, 4, 6],
                [1, 3, 5], [1, 3, 6],
                [2, 4, 5], [2, 4, 6],
                [2, 3, 5], [2, 3, 6]
            )
        );

    });


    test('groupMap', () => {
        expect(Collection.of(
            {name: 'Alice', age: 25},
            {name: 'Bob', age: 29},
            {name: 'John', age: 29},
        ).groupMap(_ => _.age)(_ => _.name)).toEqual(HashMap.of(
            [25, Collection.of('Alice')],
            [29, Collection.of('Bob', 'John')]
        ));
    });

    test('groupMapReduce', () => {
        expect(Collection.of(
            {name: 'Alice', age: 25},
            {name: 'Bob', age: 29},
            {name: 'John', age: 29},
        ).groupMapReduce<number, string>(_ => _.age)(_ => _.name)((a, b) => a + b)).toEqual(HashMap.of(
            [25, 'Alice'],
            [29, 'BobJohn']
        ));

        expect((Collection.of(1, 2, 2, 3, 3, 3))
            .groupMapReduce<number, number>(identity)(_ => 1)((a, b) => a + b))
            .toEqual(HashMap.of([1, 1], [2, 2], [3, 3]));
    });


    test('scan, scanLeft, scanRight', () => {
        expect(Collection.of(1, 2, 3, 4).scan(0)((a, b) => a + b))
            .toEqual(Collection.of(0, 1, 3, 6, 10));

        expect(Collection.of(1, 2, 3, 4).scanLeft(0)((a, b) => a + b))
            .toEqual(Collection.of(0, 1, 3, 6, 10));

        expect(Collection.of(1, 2, 3, 4).scanRight(0)((a, b) => a + b))
            .toEqual(Collection.of(10, 9, 7, 4, 0));
    });


    test('zip, zipAll', () => {
        expect(Collection.of(1, 2).zip(Collection.of(3, 4, 5)))
            .toEqual(Collection.of([1, 3], [2, 4]));
        expect(Collection.of(1, 2).zipAll(Collection.of(3, 4, 5), 7, 8))
            .toEqual(Collection.of([1, 3], [2, 4], [7, 5]));
        expect(Collection.of(1, 2, 3).zipAll(Collection.of(4, 5), 7, 8))
            .toEqual(Collection.of([1, 4], [2, 5], [3, 8]));
    });

    test('zipWithIndex', () => {
        expect(Collection.of('foo', 'bar').zipWithIndex)
            .toEqual(Collection.of(['foo', 0], ['bar', 1]));
    });

    test('inits, tails', () => {
        expect(Collection.of(1,2,3).inits)
            .toEqual(Collection.of(Collection.of(1,2,3), Collection.of(1,2), Collection.of(1), Nil));

        expect(Collection.of(1,2,3).tails)
            .toEqual(Collection.of(Collection.of(1,2,3), Collection.of(2,3), Collection.of(3), Nil));
    });


    test('mapPromise', async () => {
        await expect(Collection.of(1, 2).mapPromise(x => Promise.resolve(x))).resolves.toEqual(Collection.of(1, 2));

        function processItem(i: number) {
            return Promise.resolve(i.toString(10));
        }

        const res: Collection<string> = (await Collection.fill<number>(100)(identity)
            .grouped(10)
            .mapPromise(async chunk =>
                new Collection(await Promise.all(chunk.map(i => processItem(i)).toArray))
            )).flatten<string>();
        expect(res).toEqual(Collection.fill<string>(100)(x => x.toString(10)));
    });

})

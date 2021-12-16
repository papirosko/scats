import {Collection, HashMap, HashSet, identity, mutable, option} from '../src';
import ArrayBuffer = mutable.ArrayBuffer;

describe('ArrayBuffer', () => {

    test('of', () => {
        expect(ArrayBuffer.of(1, 2, 3, 4).toArray).toEqual([1, 2, 3, 4]);
    });

    test('from', () => {
        expect(ArrayBuffer.from([1, 2, 3, 4])).toEqual(ArrayBuffer.of(1, 2, 3, 4));
    });



    test('equal', () => {
        const source1 = ArrayBuffer.of(1, 2);
        const source2 = ArrayBuffer.of(1, 2);
        expect(source1).toEqual(source2);
        expect(source1 === source2).toBeFalsy();

        const source3 = ArrayBuffer.of(1, 2);
        const source4 = ArrayBuffer.of(1, 3);
        expect(source3).not.toEqual(source4);
        expect(source3 === source4).toBeFalsy();
    });

    test('get', () => {
        const buff = ArrayBuffer.of(1, 2, 3, 4);
        expect(buff.get(1)).toEqual(2);
    });

    test('empty', () => {
        const source1 = ArrayBuffer.empty;
        const source2 = ArrayBuffer.empty;
        expect(source1).toEqual(source2);
        expect(source1 === source2).toBeFalsy();
    });

    test('append', () => {
        const source1 = ArrayBuffer.of(1, 2, 3, 4);
        const res1 = source1.append(5);
        expect(res1).toEqual(ArrayBuffer.of(1, 2, 3, 4, 5));
        expect(source1 === res1).toBeTruthy();
    });

    test('appendAll', () => {
        const source1 = ArrayBuffer.of(1, 2, 3, 4);
        const res1 = source1.appendAll([5, 6]);
        expect(res1).toEqual(ArrayBuffer.of(1, 2, 3, 4, 5, 6));
        expect(source1 === res1).toBeTruthy();

        const source2 = ArrayBuffer.of(1, 2, 3, 4);
        const res2 = source2.appendAll(Collection.of(5, 6));
        expect(res2).toEqual(ArrayBuffer.of(1, 2, 3, 4, 5, 6));
        expect(source2 === res2).toBeTruthy();

        const source3 = ArrayBuffer.of(1, 2, 3, 4);
        const res3 = source3.appendAll(ArrayBuffer.of(5, 6));
        expect(res3).toEqual(ArrayBuffer.of(1, 2, 3, 4, 5, 6));
        expect(source3 === res3).toBeTruthy();
    });

    test('prepend', () => {
        const source1 = ArrayBuffer.of(1, 2, 3, 4);
        const res1 = source1.prepend(0);
        expect(res1).toEqual(ArrayBuffer.of(0, 1, 2, 3, 4));
        expect(source1 === res1).toBeTruthy();
    });

    test('prependAll', () => {
        const source1 = ArrayBuffer.of(2, 3, 4);
        const res1 = source1.prependAll([0, 1]);
        expect(res1).toEqual(ArrayBuffer.of(0, 1, 2, 3, 4));
        expect(source1 === res1).toBeTruthy();

        const source2 = ArrayBuffer.of(2, 3, 4);
        const res2 = source2.prependAll(Collection.of(0, 1));
        expect(res2).toEqual(ArrayBuffer.of(0, 1, 2, 3, 4));
        expect(source2 === res2).toBeTruthy();

        const source3 = ArrayBuffer.of(2, 3, 4);
        const res3 = source3.prependAll(ArrayBuffer.of(0, 1));
        expect(res3).toEqual(ArrayBuffer.of(0, 1, 2, 3, 4));
        expect(source3 === res3).toBeTruthy();
    });

    test('insert', () => {
        const buf = ArrayBuffer.of(1, 2, 3, 5);
        buf.insert(3, 4);
        expect(buf).toEqual(ArrayBuffer.of(1, 2, 3, 4, 5));
    });

    test('insertAll', () => {
        const buf = ArrayBuffer.of(1, 2, 3, 6);
        buf.insertAll(3, [4, 5]);
        expect(buf).toEqual(ArrayBuffer.of(1, 2, 3, 4, 5, 6));
    });

    test('remove', () => {
        const buf = ArrayBuffer.of(1, 2, 3);
        buf.remove(1);
        expect(buf).toEqual(ArrayBuffer.of(1, 3));

        const buf2 = ArrayBuffer.of(1, 2, 3);
        buf2.remove(1, 2);
        expect(buf2).toEqual(ArrayBuffer.of(1));

        expect(() => {
            const buf2 = ArrayBuffer.of(1, 2, 3);
            buf2.remove(1, -1);
        }).toThrow(Error);

    });

    test('sort', () => {
        const source1 = ArrayBuffer.of(2, 1, 3);
        const res1 = source1.sort((a, b) => a - b);
        expect(res1).toEqual(ArrayBuffer.of(1, 2, 3));
        expect(source1 === res1).toBeTruthy();
    });

    test('clear', () => {
        const buf = ArrayBuffer.of(1, 2, 3);
        buf.clear();
        expect(buf).toEqual(ArrayBuffer.empty);
    });

    test('update', () => {
        const buf = ArrayBuffer.of(1, 2, 3);
        buf.update(1, 10);
        expect(buf).toEqual(ArrayBuffer.of(1, 10, 3));

        expect(() => buf.update(-1, 10)).toThrow(Error);
        expect(() => buf.update(5, 10)).toThrow(Error);

    });

    test('set', () => {
        const buf = ArrayBuffer.of(1, 2, 3);
        buf.set(1, 10);
        expect(buf).toEqual(ArrayBuffer.of(1, 10, 3));

        expect(() => buf.set(-1, 10)).toThrow(Error);
        expect(() => buf.set(5, 10)).toThrow(Error);

    });

    test('length', () => {
        expect(ArrayBuffer.of(1, 2, 3).length).toEqual(3);
    });

    test('toCollection', () => {
        expect(ArrayBuffer.of(1, 2, 3).toCollection).toEqual(Collection.of(1, 2, 3));
    });

    test('subtractOne', () => {
        const source = ArrayBuffer.of(1, 2, 3);
        const res = source.subtractOne(2);
        expect(res).toEqual(ArrayBuffer.of(1, 3));
        expect(source === res).toBeTruthy();
    });

    test('take', () => {
        const source = ArrayBuffer.of(1, 2, 3);
        const res = source.take(2);
        expect(res).toEqual(ArrayBuffer.of(1, 2));
        expect(source === res).toBeFalsy();
    });

    test('subtractAll', () => {
        const source = ArrayBuffer.of(1, 2, 3);
        const res = source.subtractAll([2, 3]);
        expect(res).toEqual(ArrayBuffer.of(1));
        expect(source === res).toBeTruthy();

        const buf = ArrayBuffer.of(1, 2, 3);
        const res2 = buf.subtractAll(buf);
        expect(buf).toEqual(ArrayBuffer.empty);
        expect(buf === res2).toBeTruthy();

        const items = [1, 2, 3];
        const buf2 = new ArrayBuffer(items);
        const res3 = buf2.subtractAll(items);
        expect(buf2).toEqual(ArrayBuffer.empty);
        expect(buf2 === res3).toBeTruthy();

    });

    test('appended, appendedAll, prepended, prependedAll, concat', () => {
        const source1 = ArrayBuffer.of(2);
        const res1 = source1.appended(1);
        expect(res1).toEqual(ArrayBuffer.of(2, 1));
        expect(source1 === res1).toBeFalsy();

        const source2 = ArrayBuffer.of(2);
        const res2 = source2.prepended(1);
        expect(res2).toEqual(ArrayBuffer.of(1, 2));
        expect(source2 === res2).toBeFalsy();

        const source3 = ArrayBuffer.of(2);
        const res3 = source3.appendedAll(ArrayBuffer.of(3, 4));
        expect(res3).toEqual(ArrayBuffer.of(2, 3, 4));
        expect(source3 === res3).toBeFalsy();

        const source4 = ArrayBuffer.of(2);
        const res4 = source4.concat(ArrayBuffer.of(3, 4));
        expect(res4).toEqual(ArrayBuffer.of(2, 3, 4));
        expect(source4 === res4).toBeFalsy();

        const source5 = ArrayBuffer.of(2);
        const res5 = source5.prependedAll(ArrayBuffer.of(0, 1));
        expect(res5).toEqual(ArrayBuffer.of(0, 1, 2));
        expect(source5 === res5).toBeFalsy();
    });

    test('slice', () => {
        const source1 = ArrayBuffer.of(1, 2, 3);
        const res1 = source1.slice(0, 2);
        expect(res1).toEqual(ArrayBuffer.of(1, 2));
        expect(source1 === res1).toBeFalsy();

        expect(ArrayBuffer.of(1, 2, 3).slice(0, 3)).toEqual(ArrayBuffer.of(1, 2, 3));
        expect(ArrayBuffer.of(1, 2, 3).slice(5, 7)).toEqual(ArrayBuffer.empty);
    });


    test('flatten', () => {

        expect(ArrayBuffer.of<any>(1, ArrayBuffer.of(2, 3), 4).flatten())
            .toEqual(ArrayBuffer.of(1, 2, 3, 4));

    });

    test('flatMap', () => {

        expect(ArrayBuffer.of<any>(1, 2).flatMap(n => ArrayBuffer.fill(n)(() => n)))
            .toEqual(ArrayBuffer.of(1, 2, 2));

    });


    test('mapPromise', async () => {
        await expect(ArrayBuffer.of(1, 2).mapPromise(x => Promise.resolve(x))).resolves.toEqual(ArrayBuffer.of(1, 2));

        function processItem(i: number) {
            return Promise.resolve(i.toString(10));
        }

        const res: ArrayBuffer<string> = (await ArrayBuffer.fill<number>(100)(identity)
            .grouped(10)
            .mapPromise(async chunk =>
                new ArrayBuffer(await Promise.all(chunk.map(i => processItem(i)).toArray))
            )).toBuffer.flatten<string>();
        expect(res).toEqual(ArrayBuffer.fill<string>(100)(x => x.toString(10)));
    });

    test('mapPromiseAll', async () => {
        await expect(ArrayBuffer.of(1, 2)
            .mapPromiseAll(x => Promise.resolve(x))).resolves.toEqual(ArrayBuffer.of(1, 2));

        function processItem(i: number) {
            return Promise.resolve(i.toString(10));
        }

        const res: ArrayBuffer<string> = (await ArrayBuffer.fill<number>(100)(identity)
            .mapPromiseAll(async i => processItem(i)));
        expect(res).toEqual(ArrayBuffer.fill<string>(100)(x => x.toString(10)));
    });


    test('flatMapPromise', async () => {

        await expect(ArrayBuffer.of<any>(1, 2).flatMapPromise(n =>
            Promise.resolve(ArrayBuffer.fill(n)(() => n))
        )).resolves.toEqual(ArrayBuffer.of(1, 2, 2));

        function processItem(i: number): Promise<string> {
            return Promise.resolve(i.toString(10));
        }

        const res = ArrayBuffer.fill<number>(100)(identity)
            .grouped(10)
            .toBuffer
            .flatMapPromise(chunk => chunk.mapPromiseAll(i => processItem(i)));

        await expect(res).resolves.toEqual(ArrayBuffer.fill<string>(100)(x => x.toString(10)));

    });

    test('flatMapPromiseAll', async () => {

        await expect(ArrayBuffer.of<any>(1, 2).flatMapPromiseAll(n =>
            Promise.resolve(ArrayBuffer.fill(n)(() => n))
        )).resolves.toEqual(ArrayBuffer.of(1, 2, 2));

        function processItem(i: number): Promise<string> {
            return Promise.resolve(i.toString(10));
        }

        const res = ArrayBuffer.fill<number>(100)(identity)
            .grouped(10)
            .toBuffer
            .flatMapPromiseAll(chunk => chunk.mapPromiseAll(i => processItem(i)));

        await expect(res).resolves.toEqual(ArrayBuffer.fill<string>(100)(x => x.toString(10)));

    });


    test('distinct', () => {
        expect(ArrayBuffer.of(1, 1, 2, 2, 3).distinct).toEqual(ArrayBuffer.of(1, 2, 3));
    });

    test('distinctBy', () => {
        expect(ArrayBuffer.of(
            {name: 'Foo', age: 1},
            {name: 'Foo', age: 2},
            {name: 'Bar', age: 3},
        ).distinctBy(x => x.name)).toEqual(ArrayBuffer.of(
            {name: 'Foo', age: 1},
            {name: 'Bar', age: 3},
        ));
    });

    test('partition', () => {
        const actual = ArrayBuffer.of(1, 2, 3, 4).partition(i => i % 2 === 0);
        expect(actual).toEqual([ArrayBuffer.of(2, 4), ArrayBuffer.of(1, 3)]);
    });

    test('reverse', () => {
        const source1 = ArrayBuffer.of(1, 2);
        const res1 = source1.reverse;
        expect(res1).toEqual(ArrayBuffer.of(2, 1));
        expect(source1 === res1).toBeFalsy();
    });

    test('toMap', () => {
        expect(ArrayBuffer.of(1, 2).toMap(x => [x, x + 2])).toEqual(HashMap.of([1, 3], [2, 4]));
    });

    test('toSet', () => {
        expect(ArrayBuffer.of(1, 2, 2).toSet).toEqual(HashSet.of(1, 2));
    });

    test('flatMapOption', () => {
        expect(ArrayBuffer.of<any>(1, 2).flatMapOption(x => option(x).filter(x => x >= 2)))
            .toEqual(ArrayBuffer.of(2));
    });


});

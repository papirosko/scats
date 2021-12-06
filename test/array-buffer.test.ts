import {Collection, identity, mutable} from '../src';
import ArrayBuffer = mutable.ArrayBuffer;

describe('ArrayBuffer', () => {

    test('should create ArrayBuffer.of', () => {
        expect(ArrayBuffer.of(1, 2, 3, 4).toArray).toEqual([1, 2, 3, 4]);
    });

    test('get', () => {
        const buff = ArrayBuffer.of(1, 2, 3, 4);
        expect(buff.get(1)).toEqual(2);
    });

    test('append', () => {
        expect(ArrayBuffer.of(1, 2, 3, 4).append(5).toArray).toEqual([1, 2, 3, 4, 5]);
    });

    test('appendAll', () => {
        expect(ArrayBuffer.of(1, 2, 3, 4).appendAll([5, 6]).toArray).toEqual([1, 2, 3, 4, 5, 6]);
        expect(ArrayBuffer.of(1, 2, 3, 4).appendAll(Collection.of(5, 6)).toArray).toEqual([1, 2, 3, 4, 5, 6]);
        expect(ArrayBuffer.of(1, 2, 3, 4).appendAll(ArrayBuffer.of(5, 6)).toArray).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test('prepend', () => {
        expect(ArrayBuffer.of(1, 2, 3, 4).prepend(0).toArray).toEqual([0, 1, 2, 3, 4]);
    });

    test('prependAll', () => {
        expect(ArrayBuffer.of(2, 3, 4).prependAll([0, 1]).toArray).toEqual([0, 1, 2, 3, 4]);
        expect(ArrayBuffer.of(2, 3, 4).prependAll(Collection.of(0, 1)).toArray).toEqual([0, 1, 2, 3, 4]);
        expect(ArrayBuffer.of(2, 3, 4).prependAll(ArrayBuffer.of(0, 1)).toArray).toEqual([0, 1, 2, 3, 4]);
    });

    test('insert', () => {
        const buf = ArrayBuffer.of(1, 2, 3, 5);
        buf.insert(3, 4);
        expect(buf.toArray).toEqual([1, 2, 3, 4, 5]);
    });

    test('insertAll', () => {
        const buf = ArrayBuffer.of(1, 2, 3, 6);
        buf.insertAll(3, [4, 5]);
        expect(buf.toArray).toEqual([1, 2, 3, 4, 5, 6]);
    });

    test('remove', () => {
        const buf = ArrayBuffer.of(1, 2, 3);
        const removed = buf.remove(1);
        expect(removed).toEqual(2);
        expect(buf.toArray).toEqual([1, 3]);

        const buf2 = ArrayBuffer.of(1, 2, 3);
        const removed2 = buf2.remove(1, 2);
        expect(removed2).toEqual(2);
        expect(buf2.toArray).toEqual([1]);

        expect(() => {
            const buf2 = ArrayBuffer.of(1, 2, 3);
            buf2.remove(1, -1);
        }).toThrow(Error);

    });

    test('sort', () => {
        expect(ArrayBuffer.of(2, 1, 3).sort((a, b) => a - b).toArray).toEqual([1, 2, 3]);
    });

    test('clear', () => {
        const buf = ArrayBuffer.of(1, 2, 3);
        buf.clear();
        expect(buf.toArray).toEqual([]);
    });

    test('update', () => {
        const buf = ArrayBuffer.of(1, 2, 3);
        buf.update(1, 10);
        expect(buf.toArray).toEqual([1, 10, 3]);

        expect(() => buf.update(-1, 10)).toThrow(Error);
        expect(() => buf.update(5, 10)).toThrow(Error);

    });

    test('set', () => {
        const buf = ArrayBuffer.of(1, 2, 3);
        buf.set(1, 10);
        expect(buf.toArray).toEqual([1, 10, 3]);

        expect(() => buf.set(-1, 10)).toThrow(Error);
        expect(() => buf.set(5, 10)).toThrow(Error);

    });

    test('length', () => {
        expect(ArrayBuffer.of(1, 2, 3).length).toEqual(3);
    });

    test('toCollection', () => {
        expect(ArrayBuffer.of(1, 2, 3).toCollection.toArray).toEqual(Collection.of(1, 2, 3).toArray);
    });

    test('subtractOne', () => {
        expect(ArrayBuffer.of(1, 2, 3).subtractOne(2).toArray).toEqual([1, 3]);
    });

    test('take', () => {
        expect(ArrayBuffer.of(1, 2, 3).take(2)).toEqual(ArrayBuffer.of(1, 2));
    });

    test('subtractAll', () => {
        expect(ArrayBuffer.of(1, 2, 3).subtractAll([2, 3]).toArray).toEqual([1]);

        const buf = ArrayBuffer.of(1, 2, 3);
        buf.subtractAll(buf);
        expect(buf.toArray).toEqual([]);

        const items = [1, 2, 3];
        const buf2 = new ArrayBuffer(items);
        buf2.subtractAll(items);
        expect(buf2.toArray).toEqual([]);

    });

    test('appended, appendedAll, prepended, prependedAll, concat', () => {
        expect(ArrayBuffer.of(2).appended(1)).toEqual(ArrayBuffer.of(2, 1));
        expect(ArrayBuffer.of(2).prepended(1)).toEqual(ArrayBuffer.of(1, 2));
        expect(ArrayBuffer.of(2).appendedAll(ArrayBuffer.of(3, 4))).toEqual(ArrayBuffer.of(2, 3, 4));
        expect(ArrayBuffer.of(2).concat(ArrayBuffer.of(3, 4))).toEqual(ArrayBuffer.of(2, 3, 4));
        expect(ArrayBuffer.of(2).prependedAll(ArrayBuffer.of(0, 1))).toEqual(ArrayBuffer.of(0, 1, 2));
    });

    test('slice', () => {
        expect(ArrayBuffer.of(1, 2, 3).slice(0, 2)).toEqual(ArrayBuffer.of(1, 2));
        expect(ArrayBuffer.of(1, 2, 3).slice(0, 3)).toEqual(ArrayBuffer.of(1, 2, 3));
        expect(ArrayBuffer.of(1, 2, 3).slice(5, 7)).toEqual(ArrayBuffer.empty);
    });


    test('flatten', () => {

        expect(ArrayBuffer.of<any>(1, ArrayBuffer.of(2, 3), 4).flatten().toArray)
            .toEqual([1, 2, 3, 4]);

    });

    test('flatMap', () => {

        expect(ArrayBuffer.of<any>(1, 2).flatMap(n => ArrayBuffer.fill(n)(() => n)).toArray)
            .toEqual([1, 2, 2]);

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
        expect(ArrayBuffer.of(1, 2).reverse).toEqual(ArrayBuffer.of(2, 1));
    });

});

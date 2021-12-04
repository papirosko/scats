import {ArrayBuffer} from '../src';
import {Collection} from '../src';

describe('ArrayBuffer', () => {

    test('should create ArrayBuffer.of', () => {
        expect(ArrayBuffer.of(1, 2, 3, 4).toArray).toEqual([1, 2, 3, 4]);
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
    });

    test('sort', () => {
        expect(ArrayBuffer.of(2, 1, 3).sort((a, b) => a - b).toArray).toEqual([1, 2, 3]);
    });

    test('clear', () => {
        const buf = ArrayBuffer.of(1, 2, 3);
        buf.clear();
        expect(buf.toArray).toEqual([]);
    });

    test('subtractOne', () => {
        expect(ArrayBuffer.of(1, 2, 3).subtractOne(2).toArray).toEqual([1, 3]);
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



});

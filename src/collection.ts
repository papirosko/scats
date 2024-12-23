import {Mappable} from './mappable.js';
import {HashMap, HashSet, Option} from './index.js';
import {Filterable} from './util.js';
import {ArrayIterable} from './array-iterable.js';

export abstract class ArrayBackedCollection<T, C extends ArrayIterable<T, any>> extends ArrayIterable<T, C> {

    protected abstract readonly items: T[];


    protected checkWithinBounds(lo: number, hi: number): void {
        if (lo < 0) throw new Error(`$lo is out of bounds (min 0, max ${this.items.length - 1})`);
        if (hi > this.size) throw new Error(`$lo is out of bounds (min 0, max ${this.items.length - 1})`);
    }

    get reverse(): C {
        return this.fromArray(this.items.reverse());
    }

    get toArray(): T[] {
        return this.items;
    }

    get(index: number): T {
        this.checkWithinBounds(index, index + 1);
        return this.items[index];
    }

    get toSet(): HashSet<T> {
        return HashSet.of(...this.items);
    }


    indexOf(item: T): number {
        return this.items.indexOf(item);
    }

    get distinct(): C {
        return this.fromArray(Array.from(new Set(this.items)));
    }

    distinctBy(key: (item: T) => string | number): C {
        const keys = new Set();
        const res: T[] = [];
        this.foreach(item => {
            const currentKey = key(item);
            if (!keys.has(currentKey)) {
                keys.add(currentKey);
                res.push(item);
            }
        });
        return this.fromArray(res);
    }

    appended(item: T): C {
        return this.fromArray(this.items.concat([item]));
    }

    appendedAll(other: Iterable<T>): C {
        return this.fromArray(this.items.concat([...other]));
    }

    prepended(item: T): C {
        return this.fromArray([item].concat(this.items));
    }

    prependedAll(other: Iterable<T>): C {
        return this.fromArray(Array.from(other).concat(this.items));
    }

    concat(other: Iterable<T>): C {
        return this.appendedAll(other);
    }

    slice(from: number, until: number): C {
        return this.fromArray(this.items.slice(from, until));
    }

    sort(param: (a: T, b: T) => number): C {
        return this.fromArray(this.items.slice(0).sort(param));
    }


    sortBy(fieldToNumber: (a: T) => number): C {
        return this.sort(((a, b) => fieldToNumber(a) - fieldToNumber(b)));
    }

    get length(): number {
        return this.size;
    }


}


export class Collection<T> extends ArrayBackedCollection<T, Collection<T>> implements Mappable<T>,
    Filterable<T, Collection<T>>  {

    constructor(protected readonly items: T[]) {
        super();
    }

    static empty = new Collection<any>([]);

    protected fromArray(array: T[]): Collection<T> {
        if (!array || array.length <= 0) {
            return Nil;
        } else {
            return new Collection(array);
        }
    }

    static of<T>(...items: T[]): Collection<T> {
        return new Collection<T>(items);
    }

    static from<T>(elements: Iterable<T>): Collection<T> {
        return new Collection<T>(Array.from(elements));
    }

    static fill<A>(len: number): (elem: (idx: number) => A) => Collection<A> {
        return function(elem: (idx: number) => A): Collection<A> {
            const res: A[] = new Array<A>(len);
            for (let i = 0; i < len; i++) {
                res[i] = elem(i);
            }
            return new Collection(res);
        };
    }

    map<B>(f: (item: T) => B): Collection<B> {
        return new Collection<B>(this.items.map(i => f(i)));
    }

    flatMap<B>(f: (item: T) => Collection<B>): Collection<B> {
        //https://stackoverflow.com/questions/61740599/rangeerror-maximum-call-stack-size-exceeded-with-array-push
        let res: B[] = [];
        this.items.forEach(i => {
            res = res.concat(f(i).items);
        });
        return new Collection<B>(res);
    }

    flatMapOption<B>(f: (item: T) => Option<B>): Collection<B> {
        const res: B[] = [];
        this.items.forEach(i => {
            f(i).foreach(v => {
                res.push(v);
            });
        });
        return new Collection<B>(res);
    }


    /**
     * Maps each element of current collection to promise. Next element will be mapped once the current is resolved.
     *
     * This allows sequential processing of big amount of tasks in chunks:
     * ```
     * function processItem(i: number) {
     *       return Promise.resolve(i.toString(10));
     * }
     *
     * const res: Collection<string> = (await Collection.fill<number>(100)(identity)
     *    .grouped(10)
     *    .mapPromise(async chunk =>
     *       new Collection(await Promise.all(chunk.map(i => processItem(i)).toArray))
     *    )).flatten<string>()
     * ```
     * @param f
     */
    async mapPromise<B>(f: (v: T) => Promise<B>): Promise<Collection<B>> {
        const res: B[] = [];
        for (let i = 0; i < this.items.length; i++) {
            res.push(await f(this.items[i]));
        }
        return new Collection<B>(res);
    }

    /**
     * Maps each element of current collection to promise. All elements will be resolved concurrently.
     * @param f
     */
    async mapPromiseAll<B>(f: (v: T) => Promise<B>): Promise<Collection<B>> {
        return new Collection<B>(await Promise.all(this.items.map(i => f(i))));
    }

    /**
     * Flat maps each element of current collection to promise. Next element will be mapped once the current is resolved.
     *
     * This allows sequential processing of big amount of tasks in chunks:
     * ```
     * function processItem(i: number) {
     *       return Promise.resolve(i.toString(10));
     * }
     *
     * const res: Collection<string> = (await Collection
     *    .fill<number>(100)(identity)
     *    .grouped(10)
     *    .flatMapPromise(chunk => chunk.mapPromiseAll(i => processItem(i)));
     * ```
     * @param f
     */
    async flatMapPromise<B>(f: (item: T) => Promise<Collection<B>>): Promise<Collection<B>> {
        let res: B[] = [];
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            res = res.concat((await f(item)).items);
        }
        return new Collection<B>(res);
    }

    /**
     * Maps each element of current collection to promise. All elements will be resolved concurrently.
     * @param f
     */
    async flatMapPromiseAll<B>(f: (v: T) => Promise<Collection<B>>): Promise<Collection<B>> {
        return (await this.mapPromiseAll(f)).flatten<B>();
    }


    flatten<B>(): Collection<B> {
        const res: B[] = [];
        this.items.forEach(i => {
            if (i instanceof Collection) {
                res.push(...i.items);
            } else {
                res.push(i as any as B);
            }
        });
        return new Collection<B>(res);
    }

    get toBuffer(): ArrayBuffer<T> {
        return new ArrayBuffer(this.items);
    }

    toMap<K, V>(mapper: (item: T) => [K, V]): HashMap<K, V> {
        return HashMap.of(...this.map(mapper).toArray);
    }


    /** Returns a $coll formed from this $coll and another iterable collection
     *  by combining corresponding elements in pairs.
     *  If one of the two collections is longer than the other, its remaining elements are ignored.
     *
     *  @param   that  The iterable providing the second half of each result pair
     *  @tparam  B     the type of the second half of the returned pairs
     *  @return        a new $coll containing pairs consisting of corresponding elements of this $coll and `that`.
     *                 The length of the returned collection is the minimum of the lengths of this $coll and `that`.
     */
    zip<B>(that: Collection<B>): Collection<[T, B]> {
        const res: [T, B][] = [];
        for (let i = 0; i < Math.min(this.size, that.size); i++) {
            res.push([this.items[i], that.items[i]]);
        }
        return new Collection<[T, B]>(res);
    }

    /** Returns a $coll formed from this $coll and another iterable collection
     *  by combining corresponding elements in pairs.
     *  If one of the two collections is shorter than the other,
     *  placeholder elements are used to extend the shorter collection to the length of the longer.
     *
     *  @param that     the iterable providing the second half of each result pair
     *  @param thisElem the element to be used to fill up the result if this $coll is shorter than `that`.
     *  @param thatElem the element to be used to fill up the result if `that` is shorter than this $coll.
     *  @return        a new collection of type `That` containing pairs consisting of
     *                 corresponding elements of this $coll and `that`. The length
     *                 of the returned collection is the maximum of the lengths of this $coll and `that`.
     *                 If this $coll is shorter than `that`, `thisElem` values are used to pad the result.
     *                 If `that` is shorter than this $coll, `thatElem` values are used to pad the result.
     */
    zipAll<B>(that: Collection<B>, thisElem: T, thatElem: B): Collection<[T, B]> {
        const res: [T, B][] = [];
        for (let i = 0; i < Math.max(this.size, that.size); i++) {
            res.push([
                i < this.items.length ? this.items[i] : thisElem,
                i < that.items.length ? that.items[i] : thatElem]);
        }
        return new Collection<[T, B]>(res);
    }


}


export const Nil = Collection.empty;

export class ArrayBuffer<T> extends ArrayBackedCollection<T, ArrayBuffer<T>> implements Mappable<T>,
    Filterable<T, ArrayBuffer<T>>{

    static get empty(): ArrayBuffer<any> {
        return new ArrayBuffer<any>([]);
    }

    constructor(protected readonly items: T[] = []) {
        super();
    }

    static of<T>(...elements: T[]): ArrayBuffer<T> {
        return new ArrayBuffer<T>(elements);
    }

    static from<T>(elements: Iterable<T>): ArrayBuffer<T> {
        return new ArrayBuffer<T>(Array.from(elements));
    }

    static fill<A>(len: number): (elem: (idx: number) => A) => ArrayBuffer<A> {
        return function (elem: (idx: number) => A): ArrayBuffer<A> {
            const res: A[] = new Array<A>(len);
            for (let i = 0; i < len; i++) {
                res[i] = elem(i);
            }
            return new ArrayBuffer(res);
        };
    }

    protected fromArray(array: T[]): ArrayBuffer<T> {
        if (!array || array.length <= 0) {
            return new ArrayBuffer<T>([]);
        } else {
            return new ArrayBuffer(array);
        }
    }

    private normalized(n: number): number {
        return Math.min(Math.max(n, 0), this.length);
    }


    /** Replaces element at given index with a new value.
     *
     *  @param index      the index of the element to replace.
     *  @param element     the new value.
     *  @throws   Error if the index is not valid.
     */
    update(index: number, element: T): void {
        this.checkWithinBounds(index, index + 1);
        this.items[index] = element;
    }

    /** Replaces element at given index with a new value.
     *
     *  @param index      the index of the element to replace.
     *  @param element     the new value.
     *  @throws   Error if the index is not valid.
     */
    set(index: number, element: T): void {
        this.update(index, element);
    }


    /**
     * Clears the buffer's contents. After this operation, the
     * buffer is empty.
     */
    clear(): void {
        this.items.length = 0;
    }


    /**
     * Appends the given elements to this buffer.
     *  @param element  the element to append.
     *  @return the buffer itself
     */
    append(element: T): this {
        this.items.push(element);
        return this;
    }

    /**
     * Appends the elements contained in a iterable object to this buffer.
     *  @param elements  the iterable object containing the elements to append.
     *  @return the buffer itself
     */
    appendAll(elements: Iterable<T>): this {
        this.items.push(...elements);
        return this;
    }

    /**
     * Prepends a single element at the front of this ArrayBuffer.
     *
     *  @param element  the element to add.
     *  @return the buffer itself
     */
    prepend(element: T): this {
        this.items.unshift(element);
        return this;
    }

    prependAll(elements: Iterable<T>): this {
        this.items.unshift(...elements);
        return this;
    }

    /**
     * Inserts a new element at a given index into this buffer.
     *
     * @param idx    the index where the new elements is inserted.
     * @param element   the element to insert.
     * @throws   Error if the index `idx` is not in the valid range
     *           `0 <= idx <= length`.
     */
    insert(idx: number, element: T): void {
        this.checkWithinBounds(idx, idx);
        this.items.splice(idx, 0, element);
    }

    /** Inserts new elements at the index `idx`. Opposed to method
     *  `update`, this method will not replace an element with a new
     *  one. Instead, it will insert a new element at index `idx`.
     *
     *  @param idx     the index where a new element will be inserted.
     *  @param elements   the iterable object providing all elements to insert.
     *  @throws Error if `idx` is out of bounds.
     */
    insertAll(idx: number, elements: Iterable<T>): void {
        this.checkWithinBounds(idx, idx);
        this.items.splice(idx, 0, ...elements);
    }

    /** Removes the element on a given index position.
     *
     *  @param index       the index which refers to the first element to remove.
     *  @param count   the number of elements to remove.
     *  @throws   Error if the index `idx` is not in the valid range
     *            `0 <= idx <= length - count` (with `count > 0`).
     *  @throws   Error if `count < 0`.
     */
    remove(index: number, count = 1): void {
        if (count > 0) {
            this.checkWithinBounds(index, index + 1);
            this.items.splice(index, count);
        } else if (count < 0) {
            throw new Error('removing negative number of elements: ' + count);
        }
    }

    /** Removes a single element from this buffer, at its first occurrence.
     *  If the buffer does not contain that element, it is unchanged.
     *
     *  @param element  the element to remove.
     *  @return   the buffer itself
     */
    subtractOne(element: T): this {
        const i = this.items.indexOf(element);
        if (i != -1) {
            this.remove(i);
        }
        return this;
    }

    /** Removes all elements produced by an iterator from this buffer.
     *
     *  @param elements   the iterator producing the elements to remove.
     *  @return the buffer itself
     */
    subtractAll(elements: Iterable<T>): this {
        if (elements === this || elements === this.items) {
            const buf = new ArrayBuffer(Array.from(elements));
            buf.foreach(e => this.subtractOne(e));
        } else {
            for (const element of elements) {
                this.subtractOne(element);
            }
        }
        return this;
    }


    /**
     * returns same instance
     * @param compareFn
     * @return the buffer itself
     */
    sort(compareFn?: (a: T, b: T) => number): this {
        this.items.sort(compareFn);
        return this;
    }


    filterInPlace(p: (element: T) => boolean): this {
        let i = 0, j = 0;
        while (i < this.size) {
            if (p(this.items[i])) {
                if (i != j) {
                    this.items[j] = this.items[i];
                }
                j += 1;
            }
            i += 1;
        }

        if (i == j) {
            return this;
        } else {
            return this.takeInPlace(j);
        }

    }

    dropInPlace(n: number): this {
        this.remove(0, this.normalized(n));
        return this;
    }

    dropRightInPlace(n: number): this {
        const norm = this.normalized(n);
        this.remove(this.length - norm, norm);
        return this;
    }

    takeInPlace(n: number): this {
        const norm = this.normalized(n);
        this.remove(norm, this.length - norm);
        return this;
    }

    takeRightInPlace(n: number): this {
        this.remove(0, this.length - this.normalized(n));
        return this;
    }

    sliceInPlace(start: number, end: number): this {
        return this.takeInPlace(end).dropInPlace(start);
    }

    get toCollection(): Collection<T> {
        return new Collection<T>(this.items.slice(0));
    }


    /** Builds a new ArrayBuffer by applying a function to all elements of this ArrayBuffer
     *  and using the elements of the resulting collections.
     *
     *    For example:
     *
     *    {{{
     *      getWords(lines: ArrayBuffer<string>): ArrayBuffer<string> {
     *          return lines.flatMap(line => ArrayBuffer.from(line.split("\\W+")))
     *      }
     *    }}}
     *
     *
     *  @param f      the function to apply to each element.
     *  @tparam B     the element type of the returned collection.
     *  @return       a new ArrayBuffer resulting from applying the given collection-valued function
     *                `f` to each element of this $coll and concatenating the results.
     */
    flatMap<B>(f: (item: T) => ArrayBuffer<B>): ArrayBuffer<B> {
        //https://stackoverflow.com/questions/61740599/rangeerror-maximum-call-stack-size-exceeded-with-array-push
        let res: B[] = [];
        this.items.forEach(i => {
            res = res.concat(f(i).items);
        });
        return new ArrayBuffer<B>(res);
    }

    flatMapOption<B>(f: (item: T) => Option<B>): ArrayBuffer<B> {
        const res: B[] = [];
        this.items.forEach(i => {
            f(i).foreach(v => {
                res.push(v);
            });
        });
        return new ArrayBuffer<B>(res);
    }


    async flatMapPromise<B>(f: (item: T) => Promise<ArrayBuffer<B>>): Promise<ArrayBuffer<B>> {
        //https://stackoverflow.com/questions/61740599/rangeerror-maximum-call-stack-size-exceeded-with-array-push
        let res: B[] = [];
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            res = res.concat((await f(item)).items);
        }
        return new ArrayBuffer<B>(res);
    }

    map<B>(f: (item: T) => B): ArrayBuffer<B> {
        return new ArrayBuffer<B>(this.items.map(i => f(i)));
    }

    async mapPromise<B>(f: (v: T) => Promise<B>): Promise<ArrayBuffer<B>> {
        const res: B[] = [];
        for (let i = 0; i < this.items.length; i++) {
            res.push(await f(this.items[i]));
        }
        return new ArrayBuffer<B>(res);
    }

    async mapPromiseAll<B>(f: (v: T) => Promise<B>): Promise<ArrayBuffer<B>> {
        return new ArrayBuffer<B>(await Promise.all(this.items.map(i => f(i))));
    }

    async flatMapPromiseAll<B>(f: (v: T) => Promise<ArrayBuffer<B>>): Promise<ArrayBuffer<B>> {
        return (await this.mapPromiseAll(f)).flatten<B>();
    }

    flatten<B>(): ArrayBuffer<B> {
        const res: B[] = [];
        this.items.forEach(i => {
            if (i instanceof ArrayBuffer) {
                res.push(...i.items);
            } else {
                res.push(i as any as B);
            }
        });
        return new ArrayBuffer<B>(res);
    }

    toMap<K, V>(mapper: (item: T) => [K, V]): HashMap<K, V> {
        return HashMap.of(...this.map(mapper).toArray);
    }

}

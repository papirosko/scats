import {HashMap} from './hashmap';
import {HashSet} from './hashset';
import {ArrayIterable} from './array-iterable';
import {Mappable} from './mappable';
import {Filterable} from './util';

export class Collection<T> extends ArrayIterable<T, Collection<T>>
    implements Mappable<T>,
               Filterable<T, Collection<T>> {


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

    static fill<A>(len: number): (elem: (idx: number) => A) => Collection<A> {
        return function(elem: (idx: number) => A): Collection<A> {
            const res: A[] = new Array<A>(len);
            for (let i = 0; i < len; i++) {
                res[i] = elem(i);
            }
            return new Collection(res);
        };
    }

    slice(from: number, until: number): Collection<T> {
        return new Collection<T>(this.items.slice(from, until));
    }

    map<B>(f: (item: T) => B): Collection<B> {
        return new Collection<B>(this.items.map(i => f(i)));
    }

    flatMap<B>(f: (item: T) => Collection<B>): Collection<B> {
        const res: B[] = [];
        this.items.forEach(i => {
            res.push(...f(i).items);
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
        return new Collection(await Promise.all(this.items.map(i => f(i))));
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
        const res: B[] = [];
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            res.push(...(await f(item)).items);
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


    get(idx: number): T {
        return this.items[idx];
    }


    get toArray(): T[] {
        return this.items;
    }


    get reverse(): Collection<T> {
        return new Collection(this.items.reverse());
    }

    sort(param: (a: T, b: T) => number): Collection<T> {
        return new Collection(this.items.sort(param));
    }


    sortBy(fieldToNumber: (a: T) => number): Collection<T> {
        return this.sort((a, b) => fieldToNumber(a) - fieldToNumber(b));
    }


    appended(item: T): Collection<T> {
        return new Collection(this.items.concat([item]));
    }

    appendedAll(other: Iterable<T>): Collection<T> {
        return new Collection(this.items.concat(...other));
    }

    prepended(item: T): Collection<T> {
        return new Collection([item].concat(this.items));
    }

    prependedAll(other: Iterable<T>): Collection<T> {
        return new Collection(Array.from(other).concat(this.items));
    }

    concat(other: Collection<T>): Collection<T> {
        return this.appendedAll(other);
    }

    get toSet(): HashSet<T> {
        return HashSet.of(...this.items);
    }

    get toBuffer(): ArrayBuffer<T> {
        return new ArrayBuffer(this.items);
    }

    get distinct(): Collection<T> {
        return HashSet.of(...this.items).toCollection;
    }

    distinctBy(key: (item: T) => string | number): Collection<T> {
        const keys = new Set();
        const res: T[] = [];
        this.foreach(item => {
            const currentKey = key(item);
            if (!keys.has(currentKey)) {
                keys.add(currentKey);
                res.push(item);
            }
        });
        return new Collection<T>(res);
    }

    toMap<K, V>(mapper: (item: T) => [K, V]): HashMap<K, V> {
        return HashMap.of(...this.map(mapper).toArray);
    }

    indexOf(item: T): number {
        return this.items.indexOf(item);
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

export class ArrayBuffer<T> extends Collection<T> {


    constructor(protected readonly items: T[]) {
        super(items);
    }

    static of<T>(...elements: T[]): ArrayBuffer<T> {
        return new ArrayBuffer<T>(elements);
    }

    protected fromArray(array: T[]): ArrayBuffer<T> {
        if (!array || array.length <= 0) {
            return new ArrayBuffer<T>([]);
        } else {
            return new ArrayBuffer(array);
        }
    }

    private checkWithinBounds(lo: number, hi: number) {
        if (lo < 0) throw new Error(`$lo is out of bounds (min 0, max ${this.items.length - 1})`);
        if (hi > this.size) throw new Error(`$lo is out of bounds (min 0, max ${this.items.length - 1})`);
    }

    get(index: number): T {
        this.checkWithinBounds(index, index + 1);
        return this.items[index];
    }

    update(index: number, element: T): void {
        this.checkWithinBounds(index, index + 1);
        this.items[index] = element;
    }

    set(index: number, element: T): void {
        this.update(index, element);
    }


    get length() {
        return this.size;
    }

    clear() {
        this.items.length = 0;
    }


    append(element: T): this {
        this.items.push(element);
        return this;
    }

    appendAll(elements: Iterable<T>): this {
        this.items.push(...elements);
        return this;
    }

    prepend(element: T): this {
        this.items.unshift(element);
        return this;
    }

    prependAll(elements: Iterable<T>): this {
        this.items.unshift(...elements);
        return this;
    }

    insert(idx: number, element: T): void {
        this.items.splice(idx, 0, element);
    }

    insertAll(idx: number, elements: Iterable<T>): void {
        this.items.splice(idx, 0, ...elements);
    }

    remove(index: number, count: number = 1): T {
        if (count > 0) {
            this.checkWithinBounds(index, index + 1)
            return this.items.splice(index, count)[0];
        } else {
            throw new Error('removing negative number of elements: ' + count)
        }
    }

    subtractOne(element: T): this {
        const i = this.items.indexOf(element);
        if (i != -1) {
            this.remove(i);
        }
        return this
    }

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

    sort(compareFn?: (a: T, b: T) => number): this {
        this.items.sort(compareFn);
        return this;
    }

    get toCollection(): Collection<T> {
        return this;
    }


    flatMap<B>(f: (item: T) => ArrayBuffer<B>): ArrayBuffer<B> {
        const res: B[] = [];
        this.items.forEach(i => {
            res.push(...f(i).items);
        });
        return new ArrayBuffer<B>(res);
    }

    async flatMapPromise<B>(f: (item: T) => Promise<ArrayBuffer<B>>): Promise<ArrayBuffer<B>> {
        const res: B[] = [];
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            res.push(...(await f(item)).items);
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
        return new ArrayBuffer(await Promise.all(this.items.map(i => f(i))));
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

    sortBy(fieldToNumber: (a: T) => number): ArrayBuffer<T> {
        return this.sort((a, b) => fieldToNumber(a) - fieldToNumber(b));
    }


    appended(item: T): ArrayBuffer<T> {
        return new ArrayBuffer(this.items.concat([item]));
    }

    appendedAll(other: Iterable<T>): ArrayBuffer<T> {
        return new ArrayBuffer(this.items.concat(...other));
    }

    prepended(item: T): ArrayBuffer<T> {
        return new ArrayBuffer([item].concat(this.items));
    }

    prependedAll(other: Iterable<T>): ArrayBuffer<T> {
        return new ArrayBuffer(Array.from(other).concat(this.items));
    }

    concat(other: Iterable<T>): ArrayBuffer<T> {
        return this.appendedAll(other);
    }

    slice(from: number, until: number): ArrayBuffer<T> {
        return new ArrayBuffer<T>(this.items.slice(from, until));
    }


}

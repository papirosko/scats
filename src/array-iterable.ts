import {Collection, HashMap, none, option, Option, some} from './index';

export abstract class ArrayIterable<T, C extends ArrayIterable<T, any>> implements Iterable<T> {

    [Symbol.iterator](): Iterator<T, T | undefined, undefined> {
        let i = 0;
        const items = this.toArray;
        return {
            next() {
                if (i < items.length) {
                    const value = items[i];
                    i = i + 1;
                    return {
                        value: value,
                        done: false
                    };
                } else {
                    return {
                        value: undefined,
                        done: true
                    };
                }
            }
        };
    }

    abstract get toArray(): Array<T>;

    protected abstract fromArray(array: T[]): C;

    foreach<U>(job: (item: T) => U): void {
        this.toArray.forEach(x => job(x));
    }

    contains(item: T): boolean {
        return this.toArray.indexOf(item) >= 0;
    }

    forall(p: (item: T) => boolean): boolean {
        return this.toArray.every(i => p(i));
    }

    exists(p: (item: T) => boolean): boolean {
        return this.toArray.find(i => p(i)) !== undefined;
    }

    find(p: (item: T) => boolean): Option<T> {
        return option(this.toArray.find(i => p(i)));
    }

    count(p: (item: T) => boolean): number {
        let res = 0;
        this.toArray.forEach(i => {
            if (p(i)) { res++; }
        });

        return res;
    }

    get isEmpty(): boolean {
        return this.size <= 0;
    }

    get nonEmpty(): boolean {
        return !this.isEmpty;
    }

    get size(): number {
        return this.toArray.length;
    }


    reduce(op: (i1: T, i2: T) => T): T {
        return this.reduceLeft(op);
    }

    reduceOption(op: (i1: T, i2: T) => T): Option<T> {
        return this.reduceLeftOption(op);
    }

    get headOption(): Option<T> {
        return this.isEmpty ? none : some(this.head);
    }

    get head(): T {
        if (this.isEmpty) {
            throw new Error('head on empty collection');
        } else {
            return this.toArray[0];
        }
    }

    get lastOption(): Option<T> {
        return this.isEmpty ? none : some(this.last);
    }


    get last(): T {
        if (this.isEmpty) {
            throw new Error('empty.last');
        } else {
            return this.toArray[this.size - 1];
        }
    }

    reduceLeft(op: (i1: T, i2: T) => T): T {
        if (this.isEmpty) {
            throw new Error('empty.reduceLeft');
        }

        const array = this.toArray;
        let acc = array[0];
        if (array.length > 1) {
            for (let i = 1; i< array.length; i++) {
                acc = op(acc, array[i]);
            }
        }
        return acc;
    }

    reduceLeftOption(op: (i1: T, i2: T) => T): Option<T> {
        return this.isEmpty ? none : some(this.reduceLeft(op));
    }

    foldRight<B>(initial: B): (op: (next: T, acc: B) => B) => B {
        return (op: (next: T, acc: B) => B) => {
            return new Collection(this.toArray)
                .reverse
                .foldLeft(initial)((a, n) => op(n, a));
        };
    }

    reduceRight(op: (i1: T, i2: T) => T): T {
        if (this.isEmpty) {
            throw new Error('empty.reduceRight');
        }

        let acc = this.last;
        const array = this.toArray.reverse();
        if (array.length > 1) {
            for (let i = 1; i< array.length; i++) {
                acc = op(acc, array[i]);
            }
        }
        return acc;
    }

    reduceRightOption(op: (i1: T, i2: T) => T): Option<T> {
        return this.isEmpty ? none : some(this.reduceRight(op));
    }



    foldLeft<B>(initial: B): (op: (acc: B, next: T) => B) => B {
        return (op: (acc: B, next: T) => B) => {
            return this.toArray.reduce((a, n) => op(a, n), initial);
        };
    }

    fold<B>(initial: B): (op: (acc: B, next: T) => B) => B {
        return this.foldLeft(initial);
    }


    groupBy<K>(field: (item: T) => K): HashMap<K, Collection<T>> {
        return this.foldLeft<HashMap<K, Collection<T>>>(HashMap.empty)((acc, next) => {
            const key = field(next);
            const existing = acc.get(key).getOrElseValue(Collection.empty);
            return acc.set(key, new Collection<T>(existing.toArray.concat(next)));
        });
    }

    minBy(toNumber: (item: T) => number): T {
        if (this.isEmpty) {
            throw new Error('empty.minBy');
        } else {
            let res = this.head;
            let min = toNumber(res);
            this.toArray.forEach(i => {
                const next = toNumber(i);
                if (next < min) {
                    res = i;
                    min = next;
                }
            });
            return res;
        }
    }

    minByOption(toNumber: (item: T) => number): Option<T> {
        return this.isEmpty ? none : some(this.minBy(toNumber));
    }

    maxBy(toNumber: (item: T) => number): T {

        if (this.isEmpty) {
            throw new Error('empty.maxBy');
        } else {
            let res = this.head;
            let max = toNumber(res);
            this.toArray.forEach(i => {
                const next = toNumber(i);
                if (next > max) {
                    res = i;
                    max = next;
                }
            });
            return res;
        }
    }

    maxByOption(toNumber: (item: T) => number): Option<T> {
        return this.isEmpty ? none : some(this.maxBy(toNumber));
    }

    partition(p: (item: T) => boolean): [C, C] {
        const array = this.toArray;
        const first = array.filter(i => p(i));
        const second = array.filter(i => !p(i));
        return [this.fromArray(first), this.fromArray(second)];
    }

    take(n: number): C {
        const items = this.toArray;
        return items.length > n ? this.fromArray(items.slice(0, n)) : this as unknown as C;
    }

    takeRight(n: number): C {
        const array = this.toArray;
        return array.length > n ? this.fromArray(array.slice(array.length - n, array.length)) : this as unknown as C;
    }

    takeWhile(p: (item: T) => boolean): C {
        const array = this.toArray;
        let res = true;
        let i = 0;
        for (; res && i < array.length; i++) {
            res = p(array[i]);
        }

        if (res) {
            return this as unknown as C;
        } else {
            return this.take(i - 1);
        }
    }

    drop(n: number): C {
        const array = this.toArray;
        if (n >= array.length) {
            return this.fromArray([]);
        } else if (n === 0) {
            return this as unknown as C;
        } else {
            return this.fromArray(array.slice(n , array.length));
        }
    }

    dropRight(n: number): C {
        const array = this.toArray;
        if (n >= array.length) {
            return this.fromArray([]);
        } else if (n === 0) {
            return this as unknown as C;
        } else {
            return this.fromArray(array.slice(0 , array.length - n));
        }

    }


    dropWhile(p: (item: T) => boolean): C {
        const array = this.toArray;
        let res = true;
        let i = 0;
        for (; res && i < array.length; i++) {
            res = p(array[i]);
        }

        if (res) {
            return this.fromArray([]);
        } else {
            return this.drop(i - 1);
        }
    }


    sliding(length: number, step = 1): Collection<C> {
        if (this.isEmpty) {
            return Collection.empty;
        } else {
            const itemsSize = this.size;
            if (itemsSize <= length) {
                return Collection.of(this as unknown as C);
            } else {
                const result: Array<C> = [];
                let left = 0;
                let done = false;
                let right = length;
                const items = this.toArray;
                while (!done) {
                    done = right >= itemsSize;
                    result.push(this.fromArray(items.slice(left, right)));
                    left += step;
                    right = left + length;
                }

                return new Collection(result);
            }
        }

    }

    grouped(length: number): Collection<C> {
        return this.sliding(length, length);
    }

    mkString(separator = ''): string {
        return this.toArray.join(separator);
    }


    sum(elementToNum: (element: T) => number): number {
        if (this.isEmpty) {
            return 0;
        } else {
            return this.toArray.reduce<number>((acc, next) => acc + elementToNum(next), 0);
        }
    }

    filter(p: (item: T) => boolean): C {
        return this.fromArray(this.toArray.filter(i => p(i)));
    }

    filterNot(p: (item: T) => boolean): C {
        return this.fromArray(this.toArray.filter(i => !p(i)));
    }

    splitAt(n: number): [C, C] {
        return [this.take(n), this.drop(n)];
    }

    /** Splits this $coll into a prefix/suffix pair according to a predicate.
     *
     *  Note: `c span p`  is equivalent to (but possibly more efficient than)
     *  `(c takeWhile p, c dropWhile p)`, provided the evaluation of the
     *  predicate `p` does not cause any side-effects.
     *  $orderDependent
     *
     *  @param p the test predicate
     *  @return  a pair consisting of the longest prefix of this $coll whose
     *           elements all satisfy `p`, and the rest of this $coll.
     */
    span(p: (item: T) => boolean): [C, C] {
        return [this.takeWhile(p), this.dropWhile(p)];
    }


    /** The initial part of the collection without its last element.
     * $willForceEvaluation
     */
    get init(): C {
        if (this.isEmpty) throw new Error('empty.init');
        return this.dropRight(1);
    }



    /** The rest of the collection without its first element. */
    get tail(): C {
        if (this.isEmpty) throw new Error('empty.tail');
        return this.drop(1);
    }


    /**
     * Partitions this $coll into a map of ${coll}s according to a discriminator function `key`.
     * Each element in a group is transformed into a value of type `B` using the `value` function.
     *
     *
     * ```
     * class User {
     *   constructor(readonly name: string, readonly age: number)
     * }
     *
     * function namesByAge(users: Collection<User>): Map<number, Collection<string>> {
     *   users.groupMap(_ => _.age)(_ => _.name)
     * }
     * ```
     *
     *
     * @param key the discriminator function.
     * @param value the element transformation function
     * @tparam K the type of keys returned by the discriminator function
     * @tparam B the type of values returned by the transformation function
     */
    groupMap<K, B>(key: (item: T) => K): (value: (_: T) => B) => HashMap<K, Collection<B>> {
        return (value: (i: T) => B) => {
            return this.foldLeft<HashMap<K, Collection<B>>>(HashMap.empty)((acc, next) => {
                const nextKey = key(next);
                const existingColl = acc.getOrElse(nextKey, () => Collection.empty);
                const updatedColl = existingColl.appended(value(next));
                return acc.updated(nextKey, updatedColl);
            });

        };
    }




    /**
     * Partitions this $coll into a map according to a discriminator function `key`. All the values that
     * have the same discriminator are then transformed by the `f` function and then reduced into a
     * single value with the `reduce` function.
     *
     * It is equivalent to `groupBy(key).mapValues(_.map(f).reduce(reduce))`, but more efficient.
     *
     * ```
     *   occurrences[A](as: Collection<A>): Map<A, number> =
     *     as.groupMapReduce<number, number>(identity)(_ => 1)((a, b) => a + b)
     * ```
     *
     * $willForceEvaluation
     */
    groupMapReduce<K, B>(key: (_: T) => K): GroupMapReduce2<T, K, B> {
        return (value: (i: T) => B) => {
            return (reduce: (v1: B, v2: B) => B) => {
                return this.foldLeft<HashMap<K, B>>(HashMap.empty)((acc, next) => {
                    const nextKey = key(next);
                    const nextValue = value(next);
                    return acc.updated(nextKey, acc.get(nextKey).map(e => reduce(e, nextValue)).getOrElseValue(nextValue));
                });
            };
        };
    }


    /** Computes a prefix scan of the elements of the collection.
     *
     *  Note: The neutral element `z` may be applied more than once.
     *
     *  @tparam B         element type of the resulting collection
     *  @param z          neutral element for the operator `op`
     *  @param op         the associative operator for the scan
     *
     *  @return           a new $coll containing the prefix scan of the elements in this $coll
     */
    scan(z: T): (op: (acc: T, next: T) => T) => C {
        return this.scanLeft(z);
    }

    scanLeft(z: T): (op: (acc: T, next: T) => T) => C {
        return (op: (acc: T, next: T) => T) => {
            const res: T[] = [z];
            let acc: T = z;
            this.toArray.forEach(i => {
                acc = op(acc, i);
                res.push(acc);
            });
            return this.fromArray(res);
        };
    }

    /** Produces a collection containing cumulative results of applying the operator going right to left.
     *  The head of the collection is the last cumulative result.
     *  $willNotTerminateInf
     *  $orderDependent
     *  $willForceEvaluation
     *
     *  Example:
     *  ```
     *    Collection.of(1, 2, 3, 4).scanRight(0)((a, b) => a + b) == Collection.of(10, 9, 7, 4, 0)
     *  ```
     *
     *  @tparam B      the type of the elements in the resulting collection
     *  @param z       the initial value
     *  @param op      the binary operator applied to the intermediate result and the element
     *  @return        collection with intermediate results
     */
    scanRight(z: T): (op: (acc: T, next: T) => T) => C {
        return (op: (acc: T, next: T) => T) => {
            const res: T[] = [z];
            let acc: T = z;
            this.toArray.reverse().forEach(i => {
                acc = op(acc, i);
                res.push(acc);
            });
            return this.fromArray(res.reverse());
        };
    }

    get zipWithIndex(): Collection<[T, number]> {
        const res: [T, number][] = [];
        const array = this.toArray;
        for (let i = 0; i < array.length; i++) {
            res.push([array[i], i]);
        }
        return new Collection<[T, number]>(res);
    }

    /** Iterates over the tails of this $coll. The first value will be this
     *  $coll and the final one will be an empty $coll, with the intervening
     *  values the results of successive applications of `tail`.
     *
     *  @return   an iterator over all the tails of this $coll
     *  @example  `Collection.of(1,2,3).tails = Collection.of(Collection.of(1,2,3), Collection.of(2,3), Collection.of(3), Nil)`
     */
    get tails(): Collection<C> {
        const array = this.toArray;
        const res: C[] = [];
        for (let i = 0; i <= array.length; i++) {
            res.push(this.takeRight(array.length - i));
        }
        return new Collection<C>(res);
    }

    /** Iterates over the inits of this $coll. The first value will be this
     *  $coll and the final one will be an empty $coll, with the intervening
     *  values the results of successive applications of `init`.
     *
     *  $willForceEvaluation
     *
     *  @return  an iterator over all the inits of this $coll
     *  @example  `Collection.of(1,2,3).inits = Collection.of(Collection.of(1,2,3), Collection.of(1,2), Collection.of(1), Nil)`
     */
    get inits(): Collection<C> {
        const array = this.toArray;
        const res: C[] = [];
        for (let i = 0; i <= array.length; i++) {
            res.push(this.take(array.length - i));
        }
        return new Collection<C>(res);
    }

}


export type GroupMapReduce3<K, B> = (reduce: (v1: B, v2: B) => B) => HashMap<K, B>;
export type GroupMapReduce2<T, K, B> = (f: (_: T) => B) => GroupMapReduce3<K, B>;


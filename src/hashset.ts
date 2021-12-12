import {Collection} from './collection';
import {ArrayIterable} from './array-iterable';
import {ArrayBuffer} from './mutable';
import {HashMap} from './hashmap';

export class HashSet<T> extends ArrayIterable<T, HashSet<T>>{

    protected fromArray(array: T[]): HashSet<T> {
        return HashSet.of(...array);
    }

    constructor(private readonly items: Set<T>) {
        super();
    }

    static empty = new HashSet<any>(new Set());

    static of<T>(...items: T[]): HashSet<T> {
        return new HashSet<T>(new Set(items));
    }

    static from<T>(elements: Iterable<T>): HashSet<T> {
        return new HashSet<T>(new Set(elements));
    }

    get toCollection(): Collection<T> {
        return new Collection(Array.from(this.items.keys()));
    }

    get toSet(): Set<T> {
        return this.items;
    }

    toMap<K, V>(mapper: (item: T) => [K, V]): HashMap<K, V> {
        return HashMap.of(...this.map(mapper).toArray);
    }


    get toBuffer(): ArrayBuffer<T> {
        return new ArrayBuffer(Array.from(this.items.keys()));
    }

    contains(item: T): boolean {
        return this.items.has(item);
    }

    /**
     * Builds a new HashSet by applying a function to all elements of this $coll.
     *
     * @param f      the function to apply to each element.
     * @tparam B     the element type of the returned $coll.
     * @return       a new HashSet resulting from applying the given function
     *               `f` to each element of this HashSet and collecting the results.
     */
    map<B>(f: (item: T) => B): HashSet<B> {
        return HashSet.of(...Array.from(this.items).map(i => f(i)));
    }

    get toArray(): Array<T> {
        return Array.from(this.items.keys());
    }


    /** Builds a new HashSet by applying a function to all elements of this HashSet
     *  and using the elements of the resulting collections.
     *
     *    For example:
     *
     *    ```
     *      getWords(lines: HashSet<string>): HashSet<string> {
     *          return lines.flatMap(line => HashSet.from(line.split("\\W+")))
     *      }
     *    ```
     *
     *
     *  @param f  the function to apply to each element.
     *  @tparam B the element type of the returned collection.
     *  @return   a new HashSet resulting from applying the given collection-valued function
     *            `f` to each element of this HashSet and concatenating the results.
     */
    flatMap<B>(f: (item: T) => HashSet<B>): HashSet<B> {
        let res = HashSet.empty;
        this.items.forEach(i => {
            res = res.union(f(i));
        });
        return res;
    }

    get isEmpty(): boolean {
        return this.items.size <= 0;
    }

    get size(): number {
        return this.items.size;
    }

    concat(other: Iterable<T>): HashSet<T> {
        return this.appendedAll(other);
    }

    union(other: Iterable<T>): HashSet<T> {
        return this.concat(other);
    }

    appended(item: T): HashSet<T> {
        return HashSet.of(...this.toArray.concat([item]));
    }

    appendedAll(other: Iterable<T>): HashSet<T> {
        const res = new Set(Array.from(this.items));
        for (const element of other) {
            res.add(element);
        }
        return new HashSet(res);
    }

    removed(item: T): HashSet<T> {
        const res = new Set(Array.from(this.items));
        res.delete(item);
        return new HashSet(res);
    }

    removedAll(other: Iterable<T>): HashSet<T> {
        const res = new Set(Array.from(this.items));
        for (const element of other) {
            res.delete(element);
        }
        return new HashSet(res);
    }

    /**
     * Computes the intersection between this set and another set.
     *
     * @param   other  the set to intersect with.
     * @return  a new set consisting of all elements that are both in this
     * set and in the given set `that`.
     */
    intersect(other: HashSet<T>): HashSet<T> {
        return this.filter(x => other.contains(x));
    }


}

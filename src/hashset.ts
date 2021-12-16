import {HashMap} from './hashmap';
import {AbstractSet} from './abstract-set';
import * as mutable from './mutable/hashset';

export class HashSet<T> extends AbstractSet<T, HashSet<T>> {

    protected constructor(items: Set<T>) {
        super(items);
    }

    static empty = new HashSet<any>(new Set());

    static of<T>(...items: T[]): HashSet<T> {
        return new HashSet<T>(new Set(items));
    }

    static from<T>(elements: Iterable<T>): HashSet<T> {
        return new HashSet<T>(new Set(elements));
    }

    protected fromArray(array: T[]): HashSet<T> {
        return HashSet.of(...array);
    }


    toMap<K, V>(mapper: (item: T) => [K, V]): HashMap<K, V> {
        return HashMap.of(...this.map(mapper).toArray);
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
        const res = new Set<B>();
        this.items.forEach(i =>
            f(i).foreach(e => res.add(e))
        );
        return new HashSet(res);
    }


    /** Creates a new $coll by adding all elements contained in another collection to this $coll, omitting duplicates.
     *
     * This method takes a collection of elements and adds all elements, omitting duplicates, into $coll.
     *
     * Example:
     *  {{{
     *    scala> val a = Set(1, 2) concat Set(2, 3)
     *    a: scala.collection.immutable.Set[Int] = Set(1, 2, 3)
     *  }}}
     *
     *  @param that     the collection containing the elements to add.
     *  @return a new $coll with the given elements added, omitting duplicates.
     */
    concat(that: Iterable<T>): HashSet<T> {
        return this.appendedAll(that);
    }

    union(other: Iterable<T>): HashSet<T> {
        return this.concat(other);
    }

    appended(item: T): HashSet<T> {
        return this.fromArray(this.toArray.concat([item]));
    }

    appendedAll(other: Iterable<T>): HashSet<T> {
        const res = Array.from(this.items);
        res.push(...Array.from(other));
        return this.fromArray(res);
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

    /**
     * Creates the immutable HashMap with the contents from this HashMap.
     * @return immutable HashMap
     */
    get toMutable(): mutable.HashSet<T> {
        return mutable.HashSet.of(...this.items);
    }

}

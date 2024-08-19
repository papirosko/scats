import {AbstractSet} from '../abstract-set.js';
import * as immutable from '../hashset.js';

export class HashSet<T> extends AbstractSet<T, HashSet<T>> {

    constructor(items: Set<T> = new Set()) {
        super(items);
    }

    static of<T>(...items: T[]): HashSet<T> {
        return new HashSet<T>(new Set(items));
    }

    static from<T>(values: Iterable<T>): HashSet<T> {
        return HashSet.of(...Array.from(values));
    }

    protected fromArray(array: T[]): HashSet<T> {
        return HashSet.of(...array);
    }

    /**
     * Adds an element to this set
     * @param elem element to add
     * @return true if the element wasn't already contained in the set
     */
    add(elem: T): boolean {
        const res = this.items.has(elem);
        if (!res) {
            this.items.add(elem);
            return true;
        } else {
            return !res;
        }
    }

    /**
     * Adds all elements produced by an Iterable to this set.
     *
     *  @param xs   the Iterable producing the elements to add.
     *  @return  the set itself.
     */
    addAll(xs: Iterable<T>): this {
        for (const x of xs) {
            this.items.add(x);
        }
        return this;
    }

    /**
     * Removes all elements produced by an iterator from this set.
     *
     *  @param xs   the iterator producing the elements to remove.
     *  @return the set itself
     */
    subtractAll(xs: Iterable<T>): this {
        for (const x of xs) {
            this.items.delete(x);
        }
        return this;
    }

    /**
     * Removes an element from this set.
     *
     *  @param elem     the element to be removed
     *  @return true if this set contained the element before it was removed
     */
    remove(elem: T) : boolean {
        const res = this.items.has(elem);
        if (res) {
            this.items.delete(elem);
            return true;
        } else {
            return res;
        }

    }


    /**
     * Removes all elements from the set for which do not satisfy a predicate.
     * @param  p  the predicate used to test elements. Only elements for
     *            which `p` returns `true` are retained in the set; all others
     *            are removed.
     */
    filterInPlace(p: (item: T) => boolean): this {
        if (this.nonEmpty) {
            const arr = this.toArray;
            for (const t of arr) {
                if (!p(t)) {
                    this.remove(t);
                }
            }
        }
        return this;
    }


    /** Clears the set's contents. After this operation, the
     *  set is empty.
     */
    clear(): void {
        this.items.clear();
    }

    /**
     * Adds a single element to this set.
     *
     * @param elem  the element to add.
     * @return the $coll itself
     */
    addOne(elem: T): this {
        this.add(elem);
        return this;
    }


    /** Removes a single element from this set.
     *
     *  @param elem  the element to remove.
     *  @return the set itself
     */
    subtractOne(elem: T): this {
        this.remove(elem);
        return this;
    }

    /**
     * Creates a new $coll by adding all elements contained in another collection to this $coll, omitting duplicates.
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
        const newSet = new Set<T>([...this.items, ...that]);
        return new HashSet<T>(newSet);
    }

    /**
     * Computes the intersection between this set and another set.
     *
     * @param   that  the set to intersect with.
     * @return  a new set consisting of all elements that are both in this
     * set and in the given set `that`.
     */
    intersect(that: AbstractSet<T, any>): HashSet<T> {
        return this.filter(x => that.contains(x));
    }

    /** Computes the union between of set and another set.
     *
     *  @param   that  the set to form the union with.
     *  @return  a new set consisting of all elements that are in this
     *  set or in the given set `that`.
     */
    union(that: AbstractSet<T, any>): HashSet<T> {
        return this.concat(that);
    }

    /**
     * Creates the immutable HashMap with the contents from this HashMap.
     * @return immutable HashMap
     */
    get toImmutable(): immutable.HashSet<T> {
        return immutable.HashSet.of(...this.items);
    }

}

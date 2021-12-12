import {Option} from '../option';
import {AbstractMap, Tuple2} from '../abstract-map';

export class HashMap<K, V> extends AbstractMap<K, V, HashMap<K, V>> {

    constructor(protected readonly map: Map<K, V> = new Map()) {
        super(map);
    }

    protected fromArray(array: Tuple2<K, V>[]): HashMap<K, V> {
        return HashMap.of(...array);
    }

    static of<K, V>(...values: Tuple2<K, V>[]): HashMap<K, V> {
        return new HashMap<K, V>(new Map(values));
    }

    addAll(values: Iterable<Tuple2<K, V>>): this {
        for (const [key, value] of values) {
            this.map.set(key, value);
        }
        return this;
    }


    /**
     * Update a mapping for the specified key and its current optionally-mapped value
     * (`Some` if there is current mapping, `None` if not).
     *
     * If the remapping function returns `Some(v)`, the mapping is updated with the new value `v`.
     * If the remapping function returns `None`, the mapping is removed (or remains absent if initially absent).
     * If the function itself throws an exception, the exception is rethrown, and the current mapping is left unchanged.
     *
     * @param key the key value
     * @param remappingFunction a partial function that receives current optionally-mapped value and return a new mapping
     * @return the new value associated with the specified key
     */
    updateWith(key: K): (remappingFunction: (maybeValue: Option<V>) => Option<V>) => Option<V> {
        const previousValue = this.get(key);

        return (remappingFunction: (maybeValue: Option<V>) => Option<V>) => {
            const nextValue = remappingFunction(previousValue);
            if (previousValue.isEmpty && nextValue.isEmpty) {
                return nextValue;
            } else if (previousValue.isDefined && nextValue.isEmpty) {
                this.remove(key);
                return nextValue;
            } else {
                this.update(key, nextValue.get);
                return nextValue;
            }

        };
    }

    subtractAll(values: Iterable<K>): this {
        if (this.isEmpty) {
            return this;
        }

        for (const key of values) {
            this.map.delete(key);
            if (this.isEmpty) {
                return this;
            }
        }

        return this;
    }


    /** Clears the map's contents. After this operation, the
     *  map is empty.
     */
    clear(): void {
        this.map.clear();
    }

    clone(): HashMap<K, V> {
        const contentClone = new Map(this.map);
        return new HashMap<K, V>(contentClone);
    }

    /**
     * Retains only those mappings for which the predicate
     * `p` returns `true`.
     *
     * @param p  The test predicate
     */
    filterInPlace(p: (entry: Tuple2<K, V>) => boolean): this {
        if (this.nonEmpty) {
            const entries = this.entries;
            entries.foreach(e => {
                if (!p(e)) {
                    this.remove(e[0]);
                }
            });
        }
        return this;
    }

    /**
     * Applies a transformation function to all values contained in this map.
     * The transformation function produces new values from existing keys
     * associated values.
     *
     * @param f  the transformation to apply
     * @return   the map itself.
     */
    mapValuesInPlace(f: (entry: Tuple2<K, V>) => V): this {
        if (this.nonEmpty) {
            const entries = this.entries;
            entries.foreach(e => {
                this.update(e[0], f(e));
            });
        }
        return this;
    }

    /**
     * If given key is already in this map, returns associated value.
     *
     * Otherwise, computes value from given expression `op`, stores with key
     * in map and returns that value.
     *
     * Concurrent map implementations may evaluate the expression `op`
     * multiple times, or may evaluate `op` without inserting the result.
     *
     * @param  key          the key to test
     * @param  defaultValue the computation yielding the value to associate with `key`, if
     *                      `key` is previously unbound.
     * @return              the value associated with key (either previously or as a result
     *                      of executing the method).
     */
    getOrElseUpdate(key: K, defaultValue: () => V): V {
        return this.get(key).getOrElse(() => {
            const newValue = defaultValue();
            this.map.set(key, newValue);
            return newValue;
        });
    }

    set(key: K, value: V): this {
        this.map.set(key, value);
        return this;
    }

    /**
     * Adds a new key/value pair to this map and optionally returns previously bound value.
     * If the map already contains a
     * mapping for the key, it will be overridden by the new value.
     *
     * @param key    the key to update
     * @param value  the new value
     * @return an option value containing the value associated with the key
     *         before the `put` operation was executed, or `None` if `key`
     *         was not defined in the map before.
     */
    put(key: K, value: V): Option<V> {
        const res = this.get(key);
        this.map.set(key, value);
        return res;
    }

    /**
     * Removes a key from this map, returning the value associated previously
     * with that key as an option.
     * @param  key the key to be removed
     * @return an option value containing the value associated previously with `key`,
     *         or `None` if `key` was not defined in the map before.
     */
    remove(key: K): Option<V> {
        const res = this.get(key);
        this.subtractOne(key);
        return res;
    }

    /**
     * Adds a new key/value pair to this map.
     * If the map already contains a
     * mapping for the key, it will be overridden by the new value.
     *
     * @param key    The key to update
     * @param value  The new value
     */
    update(key: K, value: V): void {
        this.map.set(key, value);
    }

    /**
     * Adds a single element to this map.
     *
     * @param elem  the element to $=add.
     * @return the map itself
     */
    addOne(elem: Tuple2<K, V>): this {
        this.map.set(elem[0], elem[1]);
        return this;
    }

    /**
     * Removes a single element from this $coll.
     *
     * @param key  the element to remove.
     * @return the map itself
     */
    subtractOne(key: K): this {
        this.map.delete(key);
        return this;
    }


}

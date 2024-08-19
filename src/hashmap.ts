import {mutable, Option} from './index.js';
import {AbstractMap, Tuple2} from './abstract-map.js';



export class HashMap<K, V> extends AbstractMap<K, V, HashMap<K, V>> {

    protected fromArray(array: Tuple2<K, V>[]): HashMap<K, V> {
        return HashMap.of(...array);
    }

    protected constructor(protected readonly map: Map<K, V>) {
        super(map);
    }

    static of<K, V>(...values: Tuple2<K, V>[]): HashMap<K, V> {
        return new HashMap<K, V>(new Map(values));
    }

    static from<K, V>(values: Iterable<Tuple2<K, V>>): HashMap<K, V> {
        return HashMap.of(...Array.from(values));
    }

    static empty = new HashMap(new Map());

    appendedAll(map: HashMap<K, V>): HashMap<K, V> {
        return this.concat(map);
    }

    appended(key: K, value: V): HashMap<K, V> {
        return this.set(key, value);
    }

    /**
     * Creates a new map obtained by updating this map with a given key/value pair.
     * @param  key the key
     * @param  value the value
     * @tparam V1 the type of the added value
     * @return A new map with the new key/value mapping added to this map.
     */
    updated(key: K, value: V): HashMap<K, V> {
        return this.set(key, value);
    }

    /**
     * Removes a key from this map, returning a new map.
     *
     * @param key the key to be removed
     * @return a new map without a binding for ''key''
     */
    removed(key: K): HashMap<K, V> {
        const next = new Map(this.map);
        next.delete(key);
        return new HashMap<K, V>(next);
    }

    /**
     * Creates a new map from this map by removing all elements of another
     * collection.
     *
     * @param keys   the collection containing the removed elements.
     * @return a new map that contains all elements of the current map
     * except one less occurrence of each of the elements of `elems`.
     */
    removedAll(keys: Iterable<K>): HashMap<K, V> {
        const next = new Map(this.map);
        for (const key of keys) {
            next.delete(key);
        }
        return new HashMap<K, V>(next);
    }

    concat(map: HashMap<K, V>): HashMap<K, V> {
        const mergedMap = new Map<K, V>([
            ...this.entries.toArray,
            ...map.entries.toArray
        ]);
        return new HashMap<K, V>(mergedMap);
    }

    set(key: K, value: V): HashMap<K, V> {
        const next = new Map(this.map);
        next.set(key, value);
        return new HashMap<K, V>(new Map(next));
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
     * @return A new map with the updated mapping with the key
     */
    updatedWith(key: K): (remappingFunction: (maybeValue: Option<V>) => Option<V>) => HashMap<K, V> {
        const previousValue = this.get(key);
        return (remappingFunction: (maybeValue: Option<V>) => Option<V>) => {
            const nextValue = remappingFunction(previousValue);
            if (previousValue.isEmpty && nextValue.isEmpty) {
                return this;
            } else if (previousValue.isDefined && nextValue.isEmpty) {
                return this.removed(key);
            } else {
                return this.updated(key, nextValue.get);
            }
        };
    }

    get toMutable(): mutable.HashMap<K, V> {
        return mutable.HashMap.of(...Array.from(this.map.entries()));
    }
}

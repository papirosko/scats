import {option, Option} from './option';
import {Collection} from './collection';
import {HashSet} from './hashset';
import {ArrayIterable} from './array-iterable';

export type Tuple2<K, V> = [K, V];

export abstract class AbstractMap<K, V> extends ArrayIterable<Tuple2<K, V>, AbstractMap<K, V>> {

    protected fromArray(array: Tuple2<K, V>[]): HashMap<K, V> {
        return HashMap.of(...array);
    }

    protected constructor(protected readonly map: Map<K, V>) {
        super();
    }

    get size(): number {
        return this.map.size;
    }

    get isEmpty(): boolean {
        return this.map.size <= 0;
    }

    get(key: K): Option<V> {
        return option(this.map.get(key));
    }

    getOrElse(key: K, defaultValue: () => V): V {
        return this.get(key).getOrElse(defaultValue);
    }

    getOrElseValue(key: K, defaultValue: V): V {
        return this.get(key).getOrElseValue(defaultValue);
    }

    get keySet(): HashSet<K> {
        return HashSet.of(...Array.from(this.map.keys()));
    }

    get keyIterator(): IterableIterator<K> {
        return this.map.keys();
    }

    get keys(): Collection<K> {
        return new Collection(Array.from(this.map.keys()));
    }

    get values(): Collection<V> {
        return new Collection(Array.from(this.map.values()));
    }

    get valueIterator(): IterableIterator<V> {
        return this.map.values();
    }

    get entries(): Collection<Tuple2<K, V>> {
        return new Collection(Array.from(this.map.entries()));
    }

    get entriesIterator(): IterableIterator<Tuple2<K, V>> {
        return this.map.entries();
    }

    containsKey(key: K): boolean {
        return this.map.has(key);
    }

    get toCollection(): Collection<Tuple2<K, V>> {
        return new Collection<Tuple2<K, V>>(Array.from(this.map.entries()));
    }

    get toMap(): Map<K, V> {
        return this.map;
    }

    get toArray(): Array<Tuple2<K, V>> {
        return Array.from(this.map.entries());
    }

}


export class HashMap<K, V> extends AbstractMap<K, V> {


    constructor(protected readonly map: Map<K, V>) {
        super(map);
    }

    static of<K, V>(...values: Tuple2<K, V>[]): HashMap<K, V> {
        return new HashMap<K, V>(new Map(values));
    }

    static empty = new HashMap(new Map());

    appendedAll(map: HashMap<K, V>): HashMap<K, V> {
        return this.concat(map);
    }

    appended(key: K, value: V): HashMap<K, V> {
        return this.set(key, value);
    }

    updated(key: K, value: V): HashMap<K, V> {
        return this.set(key, value);
    }

    removed(key: K): HashMap<K, V> {
        const next = new Map(this.map);
        next.delete(key);
        return new HashMap<K, V>(next);
    }

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

}


export namespace mutable {
    export class HashMap<K, V> extends AbstractMap<K, V> {

        constructor(protected readonly map: Map<K, V>) {
            super(map);
        }

        static of<K, V>(...values: Tuple2<K, V>[]): HashMap<K, V> {
            return new mutable.HashMap<K, V>(new Map(values));
        }

        addAll(values: Iterable<Tuple2<K, V>>): this {
            for (const [key, value] of values) {
                this.map.set(key, value);
            }
            return this;
        }



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


        clear(): void {
            this.map.clear();
        }


        getOrElseUpdate(key: K, defaultValue: () => V): V {
            return this.get(key).getOrElse(() => {
                const newValue = defaultValue();
                this.map.set(key, newValue);
                return newValue;
            });
        }

        put(key: K, value: V): Option<V> {
            const res = this.get(key);
            this.addOne(key, value);
            return res;
        }

        remove(key: K): Option<V> {
            const res = this.get(key);
            this.subtractOne(key);
            return res;
        }

        update(key: K, value: V): void {
            this.addOne(key, value);
        }

        addOne(key: K, value: V): this {
            this.map.set(key, value);
            return this;
        }

        subtractOne(key: K): this {
            this.map.delete(key);
            return this;
        }


    }
}

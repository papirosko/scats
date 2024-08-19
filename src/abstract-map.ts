import {ArrayIterable} from './array-iterable.js';
import {option, Option} from './option.js';
import {HashSet} from './hashset.js';
import {Collection} from './collection.js';

export type Tuple2<K, V> = [K, V];

export abstract class AbstractMap<K, V, S extends AbstractMap<K, V, any>> extends ArrayIterable<Tuple2<K, V>, S> {


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

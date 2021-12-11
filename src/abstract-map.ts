import {ArrayIterable} from './array-iterable';
import {option, Option} from './option';
import {HashSet} from './hashset';
import {Collection} from './collection';
import {Tuple2} from './hashmap';

export abstract class AbstractMap<K, V> extends ArrayIterable<Tuple2<K, V>, AbstractMap<K, V>> {


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

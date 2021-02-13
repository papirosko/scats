import {option, Option} from "./option";
import {Collection} from "./collection";
import {HashSet} from "./hashset";
import {ArrayIterable} from "./array-iterable";

export class HashMap<K, V> extends ArrayIterable<[K, V]> {


    constructor(private readonly map: Map<K, V>) {
        super();
    }

    static of<K, V>(...values: [k: K, v: V][]) {
        return new HashMap<K, V>(new Map(values));
    }

    static empty = new HashMap(new Map());

    get size(): number {
        return this.map.size;
    }

    get isEmpty() {
        return this.map.size <= 0;
    }

    get(key: K): Option<V> {
        return option(this.map.get(key));
    }

    getOrElse(key: K, defaultValue: () => V) {
        return this.get(key).getOrElse(defaultValue);
    }

    getOrElseValue(key: K, defaultValue: V) {
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

    get entries(): Collection<[K, V]> {
        return new Collection(Array.from(this.map.entries()));
    }

    get entriesIterator(): IterableIterator<[K, V]> {
        return this.map.entries();
    }

    appendedAll(map: HashMap<K, V>): HashMap<K, V> {
        return this.concat(map);
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

    remove(key: K): HashMap<K, V> {
        const next = new Map(this.map);
        next.delete(key);
        return new HashMap<K, V>(next);
    }

    containsKey(key: K): boolean {
        return this.map.has(key);
    }

    updated(key: K, value: V) {
        return this.set(key, value);
    }

    toCollection(): Collection<[K, V]> {
        return new Collection<[K, V]>(Array.from(this.map.entries()));
    }

    get toMap(): Map<K, V> {
        return this.map;
    }

    get toArray(): Array<[K, V]> {
        return Array.from(this.map.entries());
    }
}

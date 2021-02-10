import {option, Option} from "./option";
import {Collection} from "./collection";

export class HashMap<K, V> {


    constructor(private readonly map: Map<K, V>) {
    }

    static of<K, V>(...values: [k: K, v: V][]) {
        return new HashMap<K, V>(new Map(values));
    }



    static empty = new HashMap(new Map());

    get size(): number {
        return this.map.size;
    }

    get isEmpty(): boolean {
        return this.size === 0;
    }

    get nonEmpty(): boolean {
        return !this.isEmpty;
    }

    foreach<U>(f: (key: K, value: V) => U): void {
        this.map.forEach((v, k) => {
            f(k, v);
        })
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

    get keySet(): Set<K> {
        return new Set(this.map.keys());
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

    addAll(map: HashMap<K, V>): HashMap<K, V> {
        const mergedMap = new Map<K, V>([
            ...this.entries.toArray,
            ...map.entries.toArray
        ]);
        return new HashMap<K, V>(mergedMap);
    }

    set(key: K, value: V): HashMap<K, V> {
        this.map.set(key, value);
        return new HashMap<K, V>(this.map);
    }

    remove(key: K): HashMap<K, V> {
        this.map.delete(key);
        return new HashMap<K, V>(this.map);
    }

    contains(key: K): boolean {
        return this.map.has(key);
    }

    updated(key: K, value: V) {
        this.map.set(key, value);
        return new HashMap<K, V>(this.map);
    }

    toCollection(): Collection<[K, V]> {
        return new Collection<[K, V]>(Array.from(this.map.entries()));
    }

    get toMap(): Map<K, V> {
        return this.map;
    }
}

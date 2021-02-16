import {Collection} from "./collection";
import {ArrayIterable} from "./array-iterable";
import {HashMap} from "./hashmap";

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

    toCollection() {
        return new Collection(Array.from(this.items.keys()));
    }

    toSet() {
        return this.items;
    }

    contains(item: T) {
        return this.items.has(item);
    }

    map<B>(f: (item: T) => B): HashSet<B> {
        return HashSet.of(...Array.from(this.items).map(i => f(i)));
    }

    get toArray(): Array<T> {
        return Array.from(this.items.keys());
    }

    get isEmpty() {
        return this.items.size <= 0;
    }

    get size(): number {
        return this.items.size;
    }

    concat(other: ArrayIterable<T, any>): HashSet<T> {
        return this.appendedAll(other);
    }

    union(other: ArrayIterable<T, any>): HashSet<T> {
        return this.concat(other);
    }

    appended(item: T): HashSet<T> {
        return HashSet.of(...this.toArray.concat([item]));
    }

    appendedAll(other: ArrayIterable<T, any>): HashSet<T> {
        return HashSet.of(...this.toArray.concat(other.toArray));
    }

    removed(item: T): HashSet<T> {
        const res = new Set(Array.from(this.items));
        res.delete(item);
        return new HashSet(res);
    }

    removedAll(other: HashSet<T>): HashSet<T> {
        const res = new Set(Array.from(this.items));
        other.foreach(i => res.delete(i));
        return new HashSet(res);
    }

    intersect(other: HashSet<T>): HashSet<T> {
        return this.filter(x => other.contains(x));
    }

    toMap<K, V>(mapper: (item: T) => [K, V]): HashMap<K, V> {
        return HashMap.of(...this.map(mapper).toArray);
    }


}

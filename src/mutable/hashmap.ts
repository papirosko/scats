import {Option} from '../option';
import {Tuple2} from '../hashmap';
import {AbstractMap} from '../abstract-map';

export class HashMap<K, V> extends AbstractMap<K, V> {

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

    set(key: K, value: V): this {
        return this.addOne(key, value);
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

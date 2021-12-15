import {ArrayIterable} from './array-iterable';
import {ArrayBuffer, Collection} from './collection';

export abstract class AbstractSet<T, S extends AbstractSet<T, any>> extends ArrayIterable<T, S> {

    protected constructor(protected readonly items: Set<T>) {
        super();
    }


    contains(item: T): boolean {
        return this.items.has(item);
    }

    get toArray(): Array<T> {
        return Array.from(this.items.keys());
    }

    get toCollection(): Collection<T> {
        return new Collection(Array.from(this.items.keys()));
    }

    get toSet(): Set<T> {
        return new Set(this.items);
    }

    get isEmpty(): boolean {
        return this.items.size <= 0;
    }

    get size(): number {
        return this.items.size;
    }

    get toBuffer(): ArrayBuffer<T> {
        return new ArrayBuffer(Array.from(this.items.keys()));
    }


}

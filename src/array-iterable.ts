import {none, option, Option, some} from "./option";
import {HashMap} from "./hashmap";
import {Collection} from "./collection";
import {Mappable} from "./mappable";

export abstract class ArrayIterable<T> {

    abstract get toArray(): Array<T>;

    foreach<U>(job: (item: T) => U): void {
        this.toArray.forEach(x => job(x));
    }

    contains(item: T) {
        return this.toArray.indexOf(item) >= 0;
    }

    forall(p: (item: T) => boolean): boolean {
        return this.toArray.every(i => p(i));
    }

    exists(p: (item: T) => boolean): boolean {
        return this.toArray.find(i => p(i)) !== undefined;
    }

    find(p: (item: T) => boolean): Option<T> {
        return option(this.toArray.find(i => p(i)));
    }

    count(p: (item: T) => boolean): number {
        let res = 0;
        this.toArray.forEach(i => {
            if (p(i)) { res++; }
        });

        return res;
    }

    get isEmpty() {
        return this.size <= 0;
    }

    get nonEmpty() {
        return !this.isEmpty;
    }

    get size(): number {
        return this.toArray.length;
    }


    reduce(op: (i1: T, i2: T) => T): T {
        return this.reduceLeft(op);
    }

    reduceOption(op: (i1: T, i2: T) => T): Option<T> {
        return this.reduceLeftOption(op);
    }

    get headOption(): Option<T> {
        return this.isEmpty ? none : some(this.head);
    }

    get head(): T {
        if (this.isEmpty) {
            throw new Error('head on empty collection');
        } else {
            return this.toArray[0];
        }
    }

    get lastOption(): Option<T> {
        return this.isEmpty ? none : some(this.last);
    }


    get last(): T {
        if (this.isEmpty) {
            throw new Error('empty.last')
        } else {
            return this.toArray[this.size - 1];
        }
    }

    reduceLeft(op: (i1: T, i2: T) => T): T {
        if (this.isEmpty) {
            throw new Error('empty.reduceLeft')
        }

        const array = this.toArray;
        let acc = array[0];
        if (array.length > 1) {
            for (let i = 1; i< array.length; i++) {
                acc = op(acc, array[i]);
            }
        }
        return acc;
    }

    reduceLeftOption(op: (i1: T, i2: T) => T): Option<T> {
        return this.isEmpty ? none : some(this.reduceLeft(op));
    }

    foldRight<B>(initial: B): (op: (next: T, acc: B) => B) => B {
        return (op: (next: T, acc: B) => B) => {
            return new Collection(this.toArray)
                .reverse()
                .foldLeft(initial)((a, n) => op(n, a));
        };
    }

    reduceRight(op: (i1: T, i2: T) => T): T {
        if (this.isEmpty) {
            throw new Error('empty.reduceRight')
        }

        let acc = this.last
        const array = this.toArray.reverse()
        if (array.length > 1) {
            for (let i = 1; i< array.length; i++) {
                acc = op(acc, array[i]);
            }
        }
        return acc;
    }

    reduceRightOption(op: (i1: T, i2: T) => T): Option<T> {
        return this.isEmpty ? none : some(this.reduceRight(op));
    }



    foldLeft<B>(initial: B): (op: (acc: B, next: T) => B) => B {
        return (op: (acc: B, next: T) => B) => {
            return this.toArray.reduce((a, n) => op(a, n), initial);
        };
    }

    fold<B>(initial: B): (op: (acc: B, next: T) => B) => B {
        return this.foldLeft(initial);
    }


    groupBy<K>(field: (item: T) => K): HashMap<K, Collection<T>> {
        return this.foldLeft<HashMap<K, Collection<T>>>(HashMap.empty)((acc, next) => {
            const key = field(next);
            const existing = acc.get(key).getOrElseValue(Collection.empty);
            return acc.set(key, new Collection<T>(existing.toArray.concat(next)));
        });
    }

    minBy(toNumber: (item: T) => number): T {
        if (this.isEmpty) {
            throw new Error('empty.minBy');
        } else {
            let res = this.head;
            let min = toNumber(res);
            this.toArray.forEach(i => {
                const next = toNumber(i);
                if (next < min) {
                    res = i;
                    min = next;
                }
            });
            return res;
        }
    }

    minByOption(toNumber: (item: T) => number): Option<T> {
        return this.isEmpty ? none : some(this.minBy(toNumber));
    }

    maxBy(toNumber: (item: T) => number): T {

        if (this.isEmpty) {
            throw new Error('empty.maxBy');
        } else {
            let res = this.head;
            let max = toNumber(res);
            this.toArray.forEach(i => {
                const next = toNumber(i);
                if (next > max) {
                    res = i;
                    max = next;
                }
            });
            return res;
        }
    }

    maxByOption(toNumber: (item: T) => number): Option<T> {
        return this.isEmpty ? none : some(this.maxBy(toNumber));
    }


}

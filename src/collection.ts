import {none, Option, option, some} from "./option";
import {HashMap} from "./hashmap";
import {idFunction} from "./util";

export class Collection<T> {


    constructor(private readonly items: T[]) {
    }

    static empty = new Collection([]);

    static of<T>(...items: T[]): Collection<T> {
        return new Collection<T>(items);
    }

    static fill<A>(len: number): (elem: (idx: number) => A) => Collection<A> {
        return function(elem: (idx: number) => A): Collection<A> {
            const res: A[] = new Array<A>(len);
            for (let i = 0; i < len; i++) {
                res[i] = elem(i);
            }
            return new Collection(res);
        };
    }

    filter(p: (item: T) => Boolean): Collection<T> {
        return new Collection<T>(this.items.filter(i => p(i)));
    }

    filterNot(p: (item: T) => Boolean): Collection<T> {
        return new Collection<T>(this.items.filter(i => !p(i)));
    }

    take(n: number): Collection<T> {
        return this.items.length > n ? new Collection<T>(this.items.slice(0, n)) : this;
    }

    takeWhile(p: (item: T) => boolean): Collection<T> {
        let res = true
        let i = 0;
        for (; res && i < this.items.length; i++) {
            res = p(this.items[i]);
        }

        if (res) {
            return this;
        } else {
            return this.take(i - 1);
        }
    }

    drop(n: number): Collection<T> {
        if (n >= this.items.length) {
            return Collection.empty;
        } else if (n === 0) {
            return this;
        } else {
            return new Collection<T>(this.items.slice(n , this.items.length));
        }
    }

    dropWhile(p: (item: T) => boolean): Collection<T> {
        let res = true
        let i = 0;
        for (; res && i < this.items.length; i++) {
            res = p(this.items[i]);
        }

        if (res) {
            return Collection.empty;
        } else {
            return this.drop(i - 1);
        }
    }

    slice(from: number, until: number): Collection<T> {
        return new Collection<T>(this.items.slice(from, until));
    }

    map<B>(f: (item: T) => B): Collection<B> {
        return new Collection<B>(this.items.map(i => f(i)));
    }

    flatMap<B>(f: (item: T) => Collection<B>): Collection<B> {
        let res: B[] = [];
        this.items.forEach(i => {
            res = res.concat(f(i).items);
        });
        return new Collection<B>(res);
    }

    flatten<B>(): Collection<B> {
        let res: B[] = [];
        this.items.forEach(i => {
            if (i instanceof Collection) {
                res.push(...i.items);
            } else {
                res.push(i as any as B);
            }
        });
        return new Collection<B>(res);
    }

    foreach<U>(job: (item: T) => U): void {
        this.items.forEach(x => job(x));
    }


    forall(p: (item: T) => boolean): boolean {
        return this.items.every(i => p(i));
    }

    exists(p: (item: T) => boolean): boolean {
        return this.items.find(i => p(i)) !== undefined;
    }

    count(p: (item: T) => boolean): number {
        let res = 0;
        this.items.forEach(i => {
            if (p(i)) { res++; }
        });

        return res;
    }

    find(p: (item: T) => boolean): Option<T> {
        return option(this.items.find(i => p(i)));
    }


    get isEmpty() {
        return this.items.length <= 0;
    }

    get nonEmpty() {
        return !this.isEmpty;
    }

    get(idx: number): T {
        return this.items[idx];
    }

    get size(): number {
        return this.items.length;
    }

    get toArray(): T[] {
        return this.items;
    }

    sum(elementToNum: (element: T) => number): number {
        if (this.isEmpty) {
            return 0
        } else {
            return this.items.reduce<number>((acc, next) => acc + elementToNum(next), 0)
        }
    }


    mkString(separator: string = ''): string {
        return this.items.join(separator);
    }

    get headOption(): Option<T> {
        return this.isEmpty ? none : some(this.items[0]);
    }

    get head(): T {
        return this.headOption.getOrElse(() => {
            throw new Error('head on empty collection')
        });
    }

    get lastOption(): Option<T> {
        return this.isEmpty ? none : some(this.items[this.items.length - 1]);
    }


    get last(): T {
        return this.lastOption.getOrElse(() => {
            throw new Error('last on empty collection')
        });
    }

    reverse(): Collection<T> {
        return new Collection(this.items.reverse());
    }

    sort(param: (a: T, b: T) => number) {
        return new Collection(this.items.sort(param));
    }


    sortBy(fieldToNumber: (a: T) => number) {
        return this.sort((a, b) => fieldToNumber(a) - fieldToNumber(b));
    }

    reduce(op: (i1: T, i2: T) => T): T {
        return this.reduceLeft(op);
    }

    reduceOption(op: (i1: T, i2: T) => T): Option<T> {
        return this.reduceLeftOption(op);
    }

    reduceLeft(op: (i1: T, i2: T) => T): T {
        if (this.isEmpty) {
            throw new Error('empty.reduceLeft')
        }

        let acc = this.head
        this.drop(1).foreach(next => {
            acc = op(acc, next)
        })
        return acc
    }

    reduceLeftOption(op: (i1: T, i2: T) => T): Option<T> {
        return this.isEmpty ? none : some(this.reduceLeft(op));
    }


    reduceRight(op: (i1: T, i2: T) => T): T {
        if (this.isEmpty) {
            throw new Error('empty.reduceRight')
        }

        let acc = this.last
        this.reverse().drop(1).foreach(next => {
            acc = op(acc, next)
        })
        return acc
    }

    reduceRightOption(op: (i1: T, i2: T) => T): Option<T> {
        return this.isEmpty ? none : some(this.reduceRight(op));
    }


    foldLeft<B>(initial: B): (op: (acc: B, next: T) => B) => B {
        return (op: (acc: B, next: T) => B) => {
            return this.items.reduce((a, n) => op(a, n), initial);
        };
    }

    foldRight<B>(initial: B): (op: (next: T, acc: B) => B) => B {
        return (op: (next: T, acc: B) => B) => {
            return this.reverse().foldLeft(initial)((a, n) => op(n, a));
        };
    }

    fold<B>(initial: B): (op: (acc: B, next: T) => B) => B {
        return this.foldLeft(initial);
    }

    toMap<K, V>(mapper: (item: T) => [K, V]): HashMap<K, V> {
        return HashMap.of(...this.map(mapper).toArray);
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
            this.drop(1).foreach(i => {
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
            this.drop(1).foreach(i => {
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

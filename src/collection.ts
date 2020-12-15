import {none, Option, option, some} from "./option";

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

    get sum(): number {
        if (this.isEmpty) {
            return 0
        } else {
            return this.items.reduce((a, b) => (a as unknown as number) + (b as unknown as number), 0)
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
}

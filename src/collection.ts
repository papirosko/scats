import {HashMap} from "./hashmap";
import {HashSet} from "./hashset";
import {ArrayIterable} from "./array-iterable";

export class Collection<T> extends ArrayIterable<T, Collection<T>>{


    constructor(private readonly items: T[]) {
        super();
    }

    static empty = new Collection([]);

    protected fromArray(array: T[]): Collection<T> {
        if (!array || array.length <= 0) {
            return Nil;
        } else {
            return new Collection(array);
        }
    }



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

    filter(p: (item: T) => boolean): Collection<T> {
        return new Collection<T>(this.items.filter(i => p(i)));
    }

    filterNot(p: (item: T) => boolean): Collection<T> {
        return new Collection<T>(this.items.filter(i => !p(i)));
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


    get(idx: number): T {
        return this.items[idx];
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

    reverse(): Collection<T> {
        return new Collection(this.items.reverse());
    }

    sort(param: (a: T, b: T) => number): Collection<T> {
        return new Collection(this.items.sort(param));
    }


    sortBy(fieldToNumber: (a: T) => number): Collection<T> {
        return this.sort((a, b) => fieldToNumber(a) - fieldToNumber(b));
    }




    appended(item: T): Collection<T> {
        return new Collection(this.items.concat([item]));
    }

    appendedAll(other: Collection<T>): Collection<T> {
        return new Collection(this.items.concat(other.items));
    }

    prepended(item: T): Collection<T> {
        return new Collection([item].concat(this.items));
    }

    prependedAll(other: Collection<T>): Collection<T> {
        return new Collection(other.items.concat(this.items));
    }

    concat(other: Collection<T>): Collection<T> {
        return this.appendedAll(other);
    }

    toSet(): HashSet<T> {
        return HashSet.of(...this.items);
    }

    get distinct(): Collection<T> {
        return HashSet.of(...this.items).toCollection();
    }

    toMap<K, V>(mapper: (item: T) => [K, V]): HashMap<K, V> {
        return HashMap.of(...this.map(mapper).toArray);
    }

    indexOf(item: T): number {
        return this.items.indexOf(item);
    }
}


export const Nil = Collection.empty;

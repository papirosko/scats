import {Collection} from './collection.js';
import {Either, Left, left, Right, right} from './either.js';
import {ArrayIterable} from './array-iterable.js';
import {HashSet} from './hashset.js';
import {HashMap} from './hashmap.js';
import {Mappable} from './mappable.js';

export interface OptionMatch<A, T> {
    some: (value: A) => T;
    none: () => T;
}


export abstract class Option<A> extends ArrayIterable<A, Option<A>> implements Mappable<A> {

    abstract readonly get: A;

    /** When a given condition is true, evaluates the `a` argument and returns
     *  Some(a). When the condition is false, `a` is not evaluated and None is
     *  returned.
     */
    static when<A>(cond: boolean): (a: () => A) => Option<A> {
        return a => {
            if (cond) {
                return some(a());
            } else {
                return none;
            }
        };
    }


    static useless<A>(cond: boolean): (a: () => A) => Option<A> {
        return Option.when(!cond);
    }

    protected fromArray(array: A[]): Option<A> {
        if (array.length <= 0) {
            return none;
        } else {
            return some(array[0]);
        }
    }

    exists(p: (value: A) => boolean): boolean {
        if (this.isEmpty) {
            return false;
        } else {
            return p(this.get);
        }
    }

    filter(p: (value: A) => boolean): Option<A> {
        if (this.isEmpty) {
            return none;
        } else {
            return p(this.get) ? this : none;
        }
    }

    filterNot(p: (value: A) => boolean): Option<A> {
        if (this.isEmpty) {
            return none;
        } else {
            return p(this.get) ? none : this;
        }
    }

    map<B>(f: (item: A) => B): Option<B> {
        return this.isEmpty ? none : some(f(this.get));
    }


    flatMap<B>(p: (value: A) => Option<B>): Option<B> {
        return this.isEmpty ? none : p(this.get);
    }

    async mapPromise<B>(f: (v: A) => Promise<B>): Promise<Option<B>> {
        if (this.isEmpty) {
            return Promise.resolve(none);
        } else {
            return option<B>(await f(this.get));
        }
    }


    flatMapPromise<B>(f: (item: A) => Promise<Mappable<B>>): Promise<Mappable<B>> {
        if (this.isEmpty) {
            return Promise.resolve(none);
        } else {
            return f(this.get);
        }
    }


    foldValue<B>(ifEmpty: () => B): (f: (_: A) => B) => B {
        if (this.isEmpty) {
            return function() { return ifEmpty(); };
        } else {
            return (f: (_: A) => B) => { return f(this.get); };
        }
    }

    forall(p: (_: A) => boolean): boolean {
        return this.isEmpty ? true : p(this.get);
    }


    foreach(f: (_: A) => void): void {
        if (this.nonEmpty) {
            f(this.get);
        }
    }

    getOrElse(f: () => A): A {
        return this.isEmpty ? f() : this.get;
    }

    getOrElseValue(other: A): A {
        return this.isEmpty ? other : this.get;
    }

    getOrElseThrow(error: () => Error): A {
        if (this.isEmpty) {
            throw error();
        } else {
            return this.get;
        }
    }


    contains<A1 extends A>(x: A1): boolean {
        return this.isEmpty ? false : x === this.get;
    }

    get isDefined(): boolean {
        return !this.isEmpty;
    }

    orElse(alternative: () => Option<A>): Option<A> {
        return this.isEmpty ? alternative() : this;
    }


    orElseValue(alternative: Option<A>): Option<A> {
        return this.isEmpty ? alternative : this;
    }

    get orNull(): A | null {
        return this.isEmpty ? null : this.get;
    }

    get orUndefined(): A | undefined {
        return this.isEmpty ? undefined : this.get;
    }

    get toCollection(): Collection<A> {
        return this.isEmpty ? Collection.empty : Collection.of(this.get);
    }

    toRight<X>(left: () => X): Either<X, A> {
        return this.isEmpty ? new Left(left()) : right(this.get);
    }

    toLeft<X>(right: () => X): Either<A, X> {
        return this.isEmpty ? new Right(right()) : left(this.get);
    }

    get toArray(): A[] {
        return this.isEmpty ? [] : [this.get];
    }

    get toSet(): HashSet<A> {
        return this.isEmpty ? HashSet.empty : HashSet.of(this.get);
    }

    match<T>(matcher: OptionMatch<A, T>): T {
        return this.isEmpty ? matcher.none() : matcher.some(this.get);
    }

    toMap<K, V>(mapper: (item: A) => [K, V]): HashMap<K, V> {
        return this.isEmpty ? HashMap.empty : HashMap.of(...this.map(mapper).toArray);
    }

}


export class Some<A> extends Option<A> {

    constructor(private readonly value: A) {
        super();
    }

    get get(): A {
        return this.value;
    }

    get isEmpty(): boolean {
        return false;
    }

}


export class None<A> extends Option<A> {

    get get(): A {
        throw new Error('No such element.');
    }

    get isEmpty(): boolean {
        return true;
    }

}

export function option<A>(value: A | null | undefined): Option<A> {
    return value === null || typeof value === 'undefined' ? none : some(value);
}


export function some<A>(value: A): Some<A> {
    return new Some<A>(value);
}

export const none: Option<any> = new None<any>();

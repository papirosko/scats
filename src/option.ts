import {Collection} from "./collection";
import {Left, Right, Either, left, right} from "./either";

export interface Option<A> {

    exists(p: (value: A) => boolean): boolean;

    filter(p: (value: A) => boolean): Option<A>;

    filterNot(p: (value: A) => boolean): Option<A>;

    flatMap<B>(p: (value: A) => Option<B>): Option<B>;

    fold<B>(ifEmpty: () => B): (f: (_: A) => B) => B

    forall(p: (_: A) => boolean): boolean

    foreach(f: (_: A) => void): void

    readonly get: A;

    getOrElse(f: () => A): A;

    getOrElseValue(other: A): A;

    contains<A1 extends A>(x: A1): boolean;

    readonly isDefined: boolean
    readonly isEmpty: boolean

    map<B>(f: (item: A) => B): Option<B>;

    readonly nonEmpty: boolean

    orElse(alternative: () => Option<A>): Option<A>

    orElseValue(alternative: Option<A>): Option<A>

    readonly orNull: A | null
    readonly orUndefined: A | undefined

    toCollection: Collection<A>;

    toRight<X>(left: () => X): Either<X, A>;
    toLeft<X>(right: () => X): Either<A, X>;

    toArray: A[];

}


export class Some<A> implements Option<A> {

    constructor(private readonly value: A) {
    }

    map<B>(f: (item: A) => B): Option<B> {
        return option<B>(f(this.value));
    }

    get get() {
        return this.value;
    }

    get toCollection(): Collection<A> {
        return Collection.of(this.value);
    }

    get toArray(): A[] {
        return [this.value];
    }

    get isDefined(): boolean {
        return true;
    }

    get isEmpty(): boolean {
        return false;
    }


    get nonEmpty(): boolean {
        return true;
    }

    get orNull() {
        return this.value;
    }

    get orUndefined() {
        return this.value;
    }

    exists(p: (value: A) => boolean): boolean {
        return p(this.value);
    }

    filter(p: (value: A) => boolean): Option<A> {
        return p(this.value) ? this : none;
    }

    filterNot(p: (value: A) => boolean): Option<A> {
        return p(this.value) ? none : this;
    }

    flatMap<B>(p: (value: A) => Option<B>): Option<B> {
        return p(this.value);
    }

    fold<B>(ifEmpty: () => B): (f: (_: A) => B) => B {
        return (f: (_: A) => B) => { return f(this.value) };
    }

    forall(p: (_: A) => boolean): boolean {
        return p(this.value);
    }

    foreach(f: (_: A) => void): void {
        f(this.value);
    }

    getOrElse(f: () => A): A {
        return this.value;
    }

    getOrElseValue(other: A): A {
        return this.value;
    }

    orElse(alternative: () => Option<A>): Option<A> {
        return this;
    }

    orElseValue(alternative: Option<A>): Option<A> {
        return this;
    }


    toRight<X>(left: () => X): Either<X, A> {
        return right(this.value);
    }

    toLeft<X>(right: () => X): Either<A, X> {
        return left(this.value);
    }

    contains<A1 extends A>(x: A1): boolean {
        return x === this.value;
    }

}


export class None<A> implements Option<A> {

    map<B>(f: (item: A) => B): Option<B> {
        return none;
    }

    get get(): A {
        throw new Error('No such element.');
    }


    get toCollection(): Collection<A> {
        return Collection.empty;
    }

    get toArray(): A[] {
        return [];
    }

    exists(p: (value: A) => boolean): boolean {
        return false;
    }

    get isDefined(): boolean {
        return false;
    }

    get isEmpty(): boolean {
        return true;
    }


    get nonEmpty(): boolean {
        return false;
    }

    get orNull() {
        return null;
    }

    get orUndefined() {
        return undefined;
    }


    filter(p: (value: A) => boolean): Option<A> {
        return none;
    }

    filterNot(p: (value: A) => boolean): Option<A> {
        return none;
    }

    flatMap<B>(p: (value: A) => Option<B>): Option<B> {
        return none;
    }

    fold<B>(ifEmpty: () => B): (f: (_: A) => B) => B {
        return function() { return ifEmpty() };
    }

    forall(p: (_: A) => boolean): boolean {
        return false;
    }

    foreach(f: (_: A) => void): void {
    }

    getOrElse(f: () => A): A {
        return f();
    }

    getOrElseValue(other: A): A {
        return other;
    }

    orElse(alternative: () => Option<A>): Option<A> {
        return alternative();
    }

    orElseValue(alternative: Option<A>): Option<A> {
        return alternative;
    }

    contains<A1 extends A>(x: A1) {
        return false;
    }

    toRight<X>(left: () => X): Either<X, A> {
        return new Left(left());
    }

    toLeft<X>(right: () => X): Either<A, X> {
        return new Right(right());
    }

}

export function option<A>(value?: A | null): Option<A> {
    return value === null || typeof value === 'undefined' ? none : some(value);
}


export function some<A>(value: A): Some<A> {
    return new Some<A>(value);
}

export const none: Option<never> = new None<never>();

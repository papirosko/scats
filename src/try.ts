import {none, Option, some} from "./option";
import {Either, left, right} from "./either";

export interface TryMatch<T, E extends Error, R> {
    success: (result: T) => R;
    failure: (error: E) => R;
}


export abstract class TryLike<T, E extends Error> {

    abstract readonly toOption: Option<T>;
    abstract readonly toEither: Either<E, T>;
    abstract map<B>(f: (x: T) => B): TryLike<B, E>;
    abstract readonly isFailure: boolean;
    abstract readonly isSuccess: boolean;
    abstract getOrElse(value: () => T): T;
    abstract getOrElseValue(value: T): T;
    abstract orElse(value: () => TryLike<T, E>): TryLike<T, E>;
    abstract readonly get: T;
    abstract match<R>(matcher: TryMatch<T, E, R>): R;
    abstract foreach<U>(f: (value: T) => U): void;
    abstract flatMap<U>(f: (value: T) => TryLike<U, E>): TryLike<U, E>;

}



export class Success<T> extends TryLike<T, Error> {

    readonly isSuccess = true;
    readonly isFailure = false;

    constructor(private readonly result: T) {
        super();
    }

    get toOption(): Option<T> {
        return some(this.result);
    }

    get toEither(): Either<Error, T> {
        return right(this.result);
    }

    map<B>(f: (x: T) => B): TryLike<B, Error> {
        return success(f(this.result));
    }

    get get() {
        return this.result;
    }

    getOrElse(value: () => T): T {
        return this.result;
    }

    getOrElseValue(value: T): T {
        return this.result;
    }

    orElse(value: () => TryLike<T, Error>): TryLike<T, Error> {
        return this;
    }

    match<R>(matcher: TryMatch<T, Error, R>): R {
        return matcher.success(this.result);
    }

    foreach<U>(f: (value: T) => U): void {
        f(this.result);
    }

    flatMap<U>(f: (value: T) => TryLike<U, Error>): TryLike<U, Error> {
        try {
            return f(this.result);
        } catch (e) {
            return failure(e);
        }
    }



}

export class Failure<E extends Error> extends TryLike<any, E> {

    readonly isSuccess = false;
    readonly isFailure = true;

    constructor(private readonly error: E) {
        super();
    }

    get toOption(): Option<never> {
        return none;
    }

    get toEither(): Either<Error, any> {
        return left(this.error);
    }

    map<B>(f: (x: any) => B) {
        return this;
    }

    get get(): any {
        throw this.error;
    }

    getOrElse<T>(value: () => T): T {
        return value();
    }

    getOrElseValue<T>(value: T): T {
        return value;
    }

    orElse<T>(value: () => TryLike<T, E>): TryLike<T, Error> {
        try {
            return value()
        } catch (e) {
            return failure(e);
        }
    }

    match<R>(matcher: TryMatch<any, Error, R>): R {
        return matcher.failure(this.error);
    }

    foreach<U>(f: (value: any) => U): void {
    }

    flatMap<U>(f: (value: any) => TryLike<U, E>): TryLike<U, E> {
        return this;
    }



}


export function Try<T, E extends Error>(block: () => T): TryLike<T, E> {
    try {
        return new Success(block())
    } catch (e) {
        return new Failure(e);
    }
}

export namespace Try {
    export function promise<T, E extends Error>(block: () => Promise<T>): Promise<TryLike<T, E>> {
        return block()
            .then(res => new Success(res))
            .catch(e => new Failure(e));
    }
}



export function success<T>(x: T): Success<T> {
    return new Success<T>(x);
}

export function failure<T extends Error>(x: T): Failure<T> {
    return new Failure<T>(x);
}

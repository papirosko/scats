import {none, Option, some} from "./option";
import {Either, left, right} from "./either";

export interface TryMatch<T, R> {
    success: (result: T) => R;
    failure: (error: Error) => R;
}


export abstract class TryLike<T> {

    abstract readonly toOption: Option<T>;
    abstract readonly toEither: Either<Error, T>;
    abstract map<B>(f: (x: T) => B): TryLike<B>;
    abstract readonly isFailure: boolean;
    abstract readonly isSuccess: boolean;
    abstract getOrElse(value: () => T): T;
    abstract getOrElseValue(value: T): T;
    abstract orElse(value: () => TryLike<T>): TryLike<T>;
    abstract readonly get: T;
    abstract match<R>(matcher: TryMatch<T, R>): R;
    abstract foreach<U>(f: (value: T) => U): void;
    abstract flatMap<U>(f: (value: T) => TryLike<U>): TryLike<U>;
    abstract filter(p: (value: T) => boolean): TryLike<T>;
    abstract readonly failed: TryLike<Error>;
    abstract fold<U>(fa: (e: Error) => U, fb: (result: T) => U): U;

}



export class Success<T> extends TryLike<T> {

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

    map<B>(f: (x: T) => B): TryLike<B> {
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

    orElse(value: () => TryLike<T>): TryLike<T> {
        return this;
    }

    match<R>(matcher: TryMatch<T, R>): R {
        return matcher.success(this.result);
    }

    foreach<U>(f: (value: T) => U): void {
        f(this.result);
    }

    flatMap<U>(f: (value: T) => TryLike<U>): TryLike<U> {
        try {
            return f(this.result);
        } catch (e) {
            return failure(e);
        }
    }

    filter(p: (value: T) => boolean): TryLike<T> {
        try {
            if (p(this.result)) {
                return this;
            } else {
                return failure(new Error('Predicate does not hold for ' + this.result))
            }
        } catch (e) {
            return failure(e);
        }
    }

    get failed(): TryLike<Error> {
        return failure(new Error('Success.failed'))
    };

    fold<U>(fa: (e: Error) => U, fb: (result: T) => U): U {
        try {
            return fb(this.result);
        } catch (e) {
            return fa(e);
        }
    }



}

export class Failure extends TryLike<any> {

    readonly isSuccess = false;
    readonly isFailure = true;

    constructor(private readonly error: Error) {
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

    orElse<T>(value: () => TryLike<T>): TryLike<T> {
        try {
            return value()
        } catch (e) {
            return failure(e);
        }
    }

    match<R>(matcher: TryMatch<any, R>): R {
        return matcher.failure(this.error);
    }

    foreach<U>(f: (value: any) => U): void {
    }

    flatMap<U>(f: (value: any) => TryLike<U>): TryLike<U> {
        return this;
    }

    filter(p: (value: any) => boolean): TryLike<any> {
        return this;
    }

    get failed(): TryLike<Error> {
        return success(this.error)
    };

    fold<U>(fa: (e: Error) => U, fb: (result: any) => U): U {
        return fa(this.error);
    }

}


export function Try<T, E extends Error>(block: () => T): TryLike<T> {
    try {
        return new Success(block())
    } catch (e) {
        return new Failure(e);
    }
}

export namespace Try {
    export function promise<T, E extends Error>(block: () => Promise<T>): Promise<TryLike<T>> {
        return block()
            .then(res => new Success(res))
            .catch(e => new Failure(e));
    }
}



export function success<T>(x: T): Success<T> {
    return new Success<T>(x);
}

export function failure(x: Error): Failure {
    return new Failure(x);
}

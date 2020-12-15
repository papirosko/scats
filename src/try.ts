import {none, Option, some} from "./option";
import {Either, left, right} from "./either";

export abstract class TryLike<T, E extends Error> {

    abstract readonly toOption: Option<T>;
    abstract readonly toEither: Either<E, T>;
    abstract map<B>(f: (x: T) => B): TryLike<B, E>;
}

export class Success<T> extends TryLike<T, Error> {

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


}

export class Failure<E extends Error> extends TryLike<any, E> {

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

}


export function Try<T, E extends Error>(block: () => T): TryLike<T, E> {
    try {
        return new Success(block())
    } catch (e) {
        return new Failure(e);
    }
}


export function success<T>(x: T): Success<T> {
    return new Success<T>(x);
}

export function failure<T extends Error>(x: T): Failure<T> {
    return new Failure<T>(x);
}

import {none, Option, some} from "./option";

export interface EitherMatch<LEFT, RIGHT, T> {
    right: (right: RIGHT) => T;
    left: (left: LEFT) => T;
}

export abstract class Either<LEFT, RIGHT> {

    abstract readonly toOption: Option<RIGHT>;

    abstract match<T>(matcher: EitherMatch<LEFT, RIGHT, T>): T;

}


export class Left<T> extends Either<T, any> {

    constructor(private readonly error: T) {
        super();
    }

    get toOption(): Option<never> {
        return none;
    }

    match<X>(matcher: EitherMatch<T, any, X>): X {
        return matcher.left(this.error);
    }

}


export class Right<T> extends Either<any, T> {


    constructor(private readonly value: T) {
        super();
    }

    get toOption(): Option<T> {
        return some(this.value);
    }

    match<X>(matcher: EitherMatch<any, T, X>): X {
        return matcher.right(this.value);
    }

}


export function right<T>(value: T): Right<T> {
    return new Right(value);
}

export function left<E>(error: E): Left<E> {
    return new Left(error);
}

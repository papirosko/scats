import {none, Option, some} from './option';
import {Either, left, right} from './either';
import {identity} from './util';
import {Mappable} from './mappable';

export interface TryMatch<T, R> {
    success: (result: T) => R;
    failure: (error: Error) => R;
}


export abstract class TryLike<T> implements Mappable<T>{
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
    abstract flatMap<U>(f: (value: T) => TryLike<U>): TryLike<U>;
    abstract filter(p: (value: T) => boolean): TryLike<T>;
    abstract readonly failed: TryLike<Error>;
    abstract fold<U>(fa: (e: Error) => U, fb: (result: T) => U): U;
    // no lower bound generic in typescript: https://github.com/Microsoft/TypeScript/issues/14520
    abstract recover(f: (e: Error) => any): TryLike<any>;
    abstract recoverWith(f: (e: Error) => TryLike<any>): TryLike<any>;
    abstract transform<U>(s: (value: T) => TryLike<U>, f: (e: Error) => TryLike<U>): TryLike<U>;

    async mapPromise<B>(f: (v: T) => Promise<B>): Promise<TryLike<B>> {
        return this.match({
            success: r => Try.promise(() => f(r)),
            failure: () => Promise.resolve(this as unknown as TryLike<B>)
        });
    }

    flatMapPromise<B>(f: (item: T) => Promise<TryLike<B>>): Promise<TryLike<B>> {
        return this.match({
            success: r => f(r),
            failure: () => Promise.resolve(this as unknown as TryLike<B>)
        });
    }

    foreach<U>(f: (value: T) => U): void {
        if (this.isSuccess) {
            f(this.get);
        }
    }

    tapFailure(f: (e: Error) => void): TryLike<T> {
        return this.match<TryLike<T>>({
            success: () => this,
            failure: e => {
                try {
                    f(e);
                    return this;
                } catch (ex) {
                    return failure(ex as Error);
                }
            }
        });
    }

    toEitherWithLeft<L>(f: (e: Error) => L): Either<L, T> {
        return this.match<Either<L, T>>({
            success: r => right(r),
            failure: e => left(f(e))
        });

    }

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

    get get(): T {
        return this.result;
    }

    getOrElse(_: () => T): T {
        return this.result;
    }

    getOrElseValue(_: T): T {
        return this.result;
    }

    orElse(_: () => TryLike<T>): TryLike<T> {
        return this;
    }

    match<R>(matcher: TryMatch<T, R>): R {
        return matcher.success(this.result);
    }

    flatMap<U>(f: (value: T) => TryLike<U>): TryLike<U> {
        try {
            return f(this.result);
        } catch (e) {
            return failure(e as Error);
        }
    }

    filter(p: (value: T) => boolean): TryLike<T> {
        try {
            if (p(this.result)) {
                return this;
            } else {
                return failure(new Error('Predicate does not hold for ' + this.result));
            }
        } catch (e) {
            return failure(e as Error);
        }
    }

    get failed(): TryLike<Error> {
        return failure(new Error('Success.failed'));
    }

    fold<U>(fa: (e: Error) => U, fb: (result: T) => U): U {
        try {
            return fb(this.result);
        } catch (e) {
            return fa(e as Error);
        }
    }

    recover(_: (e: Error) => any): TryLike<any> {
        return this;
    }

    recoverWith(_: (e: Error) => TryLike<any>): TryLike<any> {
        return this;
    }

    transform<U>(s: (value: T) => TryLike<U>, _: (e: Error) => TryLike<U>): TryLike<U> {
        return this.flatMap(s);
    }




}

export class Failure extends TryLike<any> {

    readonly isSuccess = false;
    readonly isFailure = true;

    constructor(private readonly error: Error) {
        super();
    }

    get toOption(): Option<any> {
        return none;
    }

    get toEither(): Either<Error, any> {
        return left(this.error);
    }

    map<B>(_: (x: any) => B): TryLike<any> {
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
            return value();
        } catch (e) {
            return failure(e as Error);
        }
    }

    match<R>(matcher: TryMatch<any, R>): R {
        return matcher.failure(this.error);
    }

    flatMap<U>(_: (value: any) => TryLike<U>): TryLike<U> {
        return this;
    }

    filter(_: (value: any) => boolean): TryLike<any> {
        return this;
    }

    get failed(): TryLike<Error> {
        return success(this.error);
    }

    fold<U>(fa: (e: Error) => U, _: (result: any) => U): U {
        return fa(this.error);
    }

    recover(f: (e: Error) => any): TryLike<any> {
        try {
            return success(f(this.error));
        } catch (ex) {
            return failure(ex as Error);
        }
    }

    recoverWith(f: (e: Error) => TryLike<any>): TryLike<any> {
        return this.transform(identity, f);
    }

    transform<U>(s: (value: any) => TryLike<U>, f: (e: Error) => TryLike<U>): TryLike<U> {
        try {
            return f(this.error);
        } catch (ex) {
            return failure(ex as Error);
        }
    }


}


export function Try<T>(block: () => T): TryLike<T> {
    try {
        return new Success(block());
    } catch (e) {
        return new Failure(e as Error);
    }
}

export namespace Try {
    export function promise<T>(block: () => Promise<T>): Promise<TryLike<T>> {
        try {
            return block()
                .then(res => new Success(res))
                .catch(e => new Failure(e));
        } catch (e) {
            return Promise.resolve(new Failure(e as Error));
        }
    }
}



export function success<T>(x: T): Success<T> {
    return new Success<T>(x);
}

export function failure(x: Error): Failure {
    return new Failure(x);
}

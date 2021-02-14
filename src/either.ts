import {none, Option, some} from "./option";
import {Collection} from "./collection";
import {failure, success, TryLike} from "./try";
import {toErrorConversion} from "./util";

export interface EitherMatch<LEFT, RIGHT, T> {
    right: (right: RIGHT) => T;
    left: (left: LEFT) => T;
}

export abstract class Either<LEFT, RIGHT> {

    abstract match<T>(matcher: EitherMatch<LEFT, RIGHT, T>): T;

    /** Returns `true` if this is a `Left`, `false` otherwise.
     *
     *  ```
     *  left("tulip").isLeft // true
     *  right("venus fly-trap").isLeft // false
     *  ```
     */
    abstract get isLeft(): boolean;

    /** Returns `true` if this is a `Right`, `false` otherwise.
     *
     *  ```
     *  Left("tulip").isRight // false
     *  Right("venus fly-trap").isRight // true
     *  ```
     */
    get isRight(): boolean {
        return !this.isLeft;
    }

    /** Applies `fa` if this is a `Left` or `fb` if this is a `Right`.
     *
     *  @example ```
     *  const result = Try(() => {throw Error('error')}).toEither
     *  result.fold(
     *      e => `Operation failed with ${e.message}`,
     *      v => `Operation produced value: ${v}`
     *  )
     *  ```
     *
     *  @param fa the function to apply if this is a `Left`
     *  @param fb the function to apply if this is a `Right`
     *  @return the results of applying the function
     */
    fold<C>(fa: (left: LEFT) => C, fb: (right: RIGHT) => C) {
        return this.match({
            right: v => fb(v),
            left: e => fa(e)
        });
    }

    /** If this is a `Left`, then return the left value in `Right` or vice versa.
     *
     *  @example
     *  ```
     *  const left: Either<string, number>  = left("left")
     *  const right: Either<number, string> = left.swap // Result: Right("left")
     *  ```
     */
    get swap(): Either<RIGHT, LEFT> {
        return this.match<Either<RIGHT, LEFT>>({
            right: v => left(v),
            left: e => right(e)
        });
    }


    /** Executes the given side-effecting function if this is a `Right`.
     *
     *  ```
     *  right(12).foreach(x => console.log(x)) // prints "12"
     *  left(12).foreach(x => console.log(x))  // doesn't print
     *  ```
     *  @param f The side-effecting function to execute.
     */
    foreach(f: (right: RIGHT) => void): void {
        this.match<void>({
            right: b => f(b),
            left: () => {}
        });
    }


    /** Returns the value from this `Right` or the given argument if this is a `Left`.
     *
     *  ```
     *  right(12).getOrElse(() => 17) // 12
     *  left(12).getOrElse(() => 17)  // 17
     *  ```
     */
    getOrElse(or: () => RIGHT): RIGHT {
        return this.match({
            right: b => b,
            left: () => or()
        });
    }

    /** Returns the value from this `Right` or the given argument if this is a `Left`.
     *
     *  ```
     *  right(12).getOrElseValue(17) // 12
     *  left(12).getOrElseValue(17)  // 17
     *  ```
     */
    getOrElseValue(or: RIGHT): RIGHT {
        return this.match({
            right: b => b,
            left: () => or
        });
    }

    /** Returns this `Right` or the given argument if this is a `Left`.
     *
     *  ```
     *  right(1).orElse(() => left(2)) // right(1)
     *  left(1).orElse(() => left(2))  // left(2)
     *  left(1).orElse(() => left(2)).orElse(() => right(3)) // right(3)
     *  ```
     */
    orElse(or: () => Either<LEFT, RIGHT>): Either<LEFT, RIGHT> {
        return this.match({
            right: () => this,
            left: () => or()
        });
    }

    /** Returns this `Right` or the given argument if this is a `Left`.
     *
     *  ```
     *  right(1).orElseValue(left(2)) // right(1)
     *  left(1).orElseValue(left(2))  // left(2)
     *  left(1).orElseValue(left(2)).orElseValue(right(3)) // right(3)
     *  ```
     */
    orElseValue(or: Either<LEFT, RIGHT>): Either<LEFT, RIGHT> {
        return this.match({
            right: () => this,
            left: () => or
        });
    }


    /** Returns `true` if this is a `Right` and its value is equal to `elem` (as determined by `===`),
     *  returns `false` otherwise.
     *
     *  ```
     *  // Returns true because value of Right is "something" which equals "something".
     *  Right("something") contains "something"
     *
     *  // Returns false because value of Right is "something" which does not equal "anything".
     *  Right("something") contains "anything"
     *
     *  // Returns false because it's not a Right value.
     *  Left("something") contains "something"
     *  ```
     *
     *  @param elem    the element to test.
     *  @return `true` if this is a `Right` value `===` to `elem`.
     */
    contains(elem: RIGHT): Boolean {
        return this.match({
            right: b => elem === b,
            left: () => false
        });
    }

    /** Returns `true` if `Left` or returns the result of the application of
     *  the given predicate to the `Right` value.
     *
     *  ```
     *  right(12).forall(_ => _ > 10)    // true
     *  right(7).forall(_ => _ > 10)     // false
     *  left(12).forall(_ => false) // true
     *  ```
     */
    forall(f: (right: RIGHT) => Boolean): Boolean {
        return this.match({
            right: b => f(b),
            left: () => true
        });
    }



    /** Returns `false` if `Left` or returns the result of the application of
     *  the given predicate to the `Right` value.
     *
     *  ```
     *  right(12).exists(_ => _ > 10)   // true
     *  right(7).exists(_ => _ > 10)    // false
     *  left(12).exists(_ => true) // false
     *  ```
     */
    exists(p: (right: RIGHT) => Boolean): Boolean {
        return this.match({
            right: b => p(b),
            left: () => false
        });
    }



    /** Binds the given function across `Right`.
     *
     *  @param f The function to bind across `Right`.
     */
    flatMap<RIGHT1>(f: (value: RIGHT) => Either<LEFT, RIGHT1>): Either<LEFT, RIGHT1> {
        return this.match({
            right: v => f(v),
            left: (e) => left(e)
        });
    }


    /** The given function is applied if this is a `Right`.
     *
     *  ```
     *  right(12).map(x => "flower") // Result: Right("flower")
     *  left(12).map(x => "flower")  // Result: Left(12)
     *  ```
     */
    map<RIGHT1>(f: (value: RIGHT) => RIGHT1): Either<LEFT, RIGHT1> {
        return this.match<Either<LEFT, RIGHT1>>({
            right: v => right(f(v)),
            left: (e) => left(e)
        });
    }

    /** Returns `Right` with the existing value of `Right` if this is a `Right`
     *  and the given predicate `p` holds for the right value,
     *  or `Left(zero)` if this is a `Right` and the given predicate `p` does not hold for the right value,
     *  or `Left` with the existing value of `Left` if this is a `Left`.
     *
     * ```
     * right(12).filterOrElse(_ => _ > 10, () => -1)   // Right(12)
     * right(7).filterOrElse(_ => _ > 10, () => -1)    // Left(-1)
     * left(7).filterOrElse(_ => false, () => -1) // Left(7)
     * ```
     */
    filterOrElse(p: (v: RIGHT) => Boolean, zero: () => LEFT): Either<LEFT, RIGHT> {
        return this.match({
            right: (v) => p(v) ? this : left(zero()),
            left: (v) => this,
        })
    }

    /** Returns `Right` with the existing value of `Right` if this is a `Right`
     *  and the given predicate `p` holds for the right value,
     *  or `Left(zero)` if this is a `Right` and the given predicate `p` does not hold for the right value,
     *  or `Left` with the existing value of `Left` if this is a `Left`.
     *
     * ```
     * right(12).filterOrElseValue(_ => _ > 10, -1)   // Right(12)
     * right(7).filterOrElseValue(_ => _ > 10, -1)    // Left(-1)
     * left(7).filterOrElseValue(_ => false, -1) // Left(7)
     * ```
     */
    filterOrElseValue(p: (v: RIGHT) => Boolean, zero: LEFT): Either<LEFT, RIGHT> {
        return this.match({
            right: (v) => p(v) ? this : left(zero),
            left: (v) => this,
        })
    }

    /** Returns a `Collection` containing the `Right` value if
     *  it exists or an empty `Collection` if this is a `Left`.
     *
     * ```
     * right(12).toCollection // Collection.of(12)
     * left(12).toCollection  // Collection.empty
     * ```
     */
    get toCollection(): Collection<RIGHT> {
        return this.match({
            right: v => Collection.of(v),
            left: () => Collection.empty
        });
    }

    /** Returns a `Some` containing the `Right` value
     *  if it exists or a `None` if this is a `Left`.
     *
     * ```
     * right(12).toOption // Some(12)
     * left(12).toOption  // None
     * ```
     */
    get toOption(): Option<RIGHT> {
        return this.match<Option<RIGHT>>({
            right: v => some(v),
            left: () => none
        });
    }

    toTry(toError: (e: LEFT) => Error = toErrorConversion): TryLike<RIGHT> {
        return this.match<TryLike<RIGHT>>({
            right: (b) => success(b),
            left: (e)  => failure(toError(e))
        });
    }



}


export class Left<T> extends Either<T, any> {

    constructor(private readonly error: T) {
        super();
    }

    match<X>(matcher: EitherMatch<T, any, X>): X {
        return matcher.left(this.error);
    }

    get isLeft(): boolean {
        return true;
    }

    withRight<RIGHT>(): Either<T, RIGHT>{
        return this;
    }
}


export class Right<T> extends Either<any, T> {


    constructor(private readonly value: T) {
        super();
    }

    match<X>(matcher: EitherMatch<any, T, X>): X {
        return matcher.right(this.value);
    }

    get isLeft(): boolean {
        return false;
    }

    withLeft<LEFT>(): Either<LEFT, T>{
        return this;
    }

}


export function right<T>(value: T): Right<T> {
    return new Right(value);
}

export function left<E>(value: E): Left<E> {
    return new Left(value);
}

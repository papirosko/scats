import {none, Option, some} from "./option";
import {Collection, Nil} from "./collection";
import {failure, success, TryLike} from "./try";
import {toErrorConversion} from "./util";
import {Mappable} from "./mappable";

export interface EitherMatch<LEFT, RIGHT, T> {
    right: (right: RIGHT) => T;
    left: (left: LEFT) => T;
}

export abstract class Either<LEFT, RIGHT> implements Mappable<RIGHT> {

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

    /** Projects this `Either` as a `Left`.
     *
     *  This allows for-comprehensions over the left side of `Either` instances,
     *  reversing `Either`'s usual right-bias.
     *
     *  For example ```
     *  forComprehension(
     *      step('s', () => left("flower").left)
     *  ).yield(state => state.s.length) // Left(6)
     *  ```
     *
     *  Continuing the analogy with [[Option]], a `LeftProjection` declares
     *  that `Left` should be analogous to `Some` in some code.
     *
     *  ```
     *  // using Option
     *  function interactWithDB(x: Query): Option<Result> {
     *    try {
     *        return some(getResultFromDatabase(x));
     *    }
     *    catch(e) {
     *        return none;
     *    }
     *  }
     *
     *  // this will only be executed if interactWithDB returns a Some
     *  const report = forComprehension(
     *    step('result', () => interactWithDB(someQuery))
     *  ).yield(state => generateReport(state.result));
     *
     *  report.match({
     *    some: (r) => send(r),
     *    none: ()  => console.log("report not generated, not sure why...")
     *  })
     *
     *  // using Either
     *  function interactWithDB(x: Query): Either<Exception, Result> =
     *    try {
     *      return Right(getResultFromDatabase(x));
     *    }
     *    catch(e) {
     *      return left(e);
     *    }
     *  }
     *
     *   // run a report only if interactWithDB returns a Right
     *   const report = forComprehension(
     *      step('result', () => interactWithDB(someQuery))
     *   ).yield(state => generateReport(state.result));
     *
     *   report.match({
     *     right: (r) => send(r),
     *     left: (e)  => console.log(`report not generated, reason was ${e}`)
     *   })
     *
     *   // only report errors
     *   forComprehension(
     *      step('e', () => interactWithDB('1').left)
     *   ).yield(state => console.log(`query failed, reason was ${state.e}`));
     *   ```
     */
    get left(): Either.LeftProjection<LEFT, RIGHT> {
        return new Either.LeftProjection(this);
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
            left: () => this as unknown as Either<LEFT, RIGHT1>
        });
    }

    flatMapPromise<RIGHT1>(f: (item: RIGHT) => Promise<Either<LEFT, RIGHT1>>): Promise<Either<LEFT, RIGHT1>> {
        return this.match({
            right: v => f(v),
            left: () => Promise.resolve(this as unknown as Either<LEFT, RIGHT1>)
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
            left: () => this as unknown as Either<LEFT, RIGHT1>
        });
    }

    async mapPromise<RIGHT1>(f: (v: RIGHT) => Promise<RIGHT1>): Promise<Either<LEFT, RIGHT1>> {
        return this.match({
            right: async v => right(await f(v)) as Either<LEFT, RIGHT1>,
            left: () => Promise.resolve(this as unknown as Either<LEFT, RIGHT1>)
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
            left: () => this,
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
            left: () => this,
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

export module Either {
    export class LeftProjection<A, B> {

        constructor(private readonly e: Either<A, B>) {
        }


        mapPromise<A1, B1 extends B>(f: (item: A) => Promise<A1>): Promise<Either<A1, B1>> {
            return this.e.match<Promise<Either<A1, B1>>>({
                left: async v => left(await f(v)),
                right: () => Promise.resolve(this.e as unknown as Either<A1, B1>)
            }) as Promise<Either<A1, B1>>;
        }

        flatMapPromise<A1, B1 extends B>(f: (item: A) => Promise<Either<A1, B1>>): Promise<Either<A1, B1>> {
            return this.e.match<Promise<Either<A1, B1>>>({
                left: v => f(v),
                right: () => Promise.resolve(this.e as unknown as Either<A1, B1>)
            }) as Promise<Either<A1, B1>>;
        }

        /** Executes the given side-effecting function if this is a `Left`.
         *
         *  ```
         *  left(12).left.foreach(x => println(x))  // prints "12"
         *  right(12).left.foreach(x => println(x)) // doesn't print
         *  ```
         *  @param f The side-effecting function to execute.
         */
        foreach<U>(f: (value: A) => U): void {
            this.e.match({
                left: l => f(l),
                right: () => {}
            });
        }

        /** Returns the value from this `Left` or the given argument if this is a `Right`.
         *
         *  ```
         *  left(12).left.getOrElse(17)  // 12
         *  right(12).left.getOrElse(17) // 17
         *  ```
         */
        getOrElse(or: () => A): A {
            return this.e.match({
                left: a => a,
                right: or
            })
        }

        /** Returns the value from this `Left` or the given argument if this is a `Right`.
         *
         *  ```
         *  left(12).left.getOrElseValue(17)  // 12
         *  right(12).left.getOrElseValue(17) // 17
         *  ```
         */
        getOrElseValue(or: A): A {
            return this.e.match({
                left: a => a,
                right: () => or
            })
        }


        /** Returns `true` if `Right` or returns the result of the application of
         *  the given function to the `Left` value.
         *
         *  ```
         *  left(12).left.forall(_ > 10)  // true
         *  left(7).left.forall(_ > 10)   // false
         *  right(12).left.forall(_ > 10) // true
         *  ```
         */
        forall(p: (value: A) => boolean): boolean {
            return this.e.match({
                left: (a) => p(a),
                right: () => true
            });
        }

        /** Returns `false` if `Right` or returns the result of the application of
         *  the given function to the `Left` value.
         *
         *  ```
         *  left(12).left.exists(_ > 10)  // true
         *  left(7).left.exists(_ > 10)   // false
         *  right(12).left.exists(_ > 10) // false
         *  ```
         */
        exists(p: (value: A) => boolean): boolean {
            return this.e.match({
                left: (a) => p(a),
                right: () => false
            });
        }


        /** Binds the given function across `Left`.
         *
         *  ```
         *  left(12).left.flatMap(x => Left("scala")) // Left("scala")
         *  right(12).left.flatMap(x => Left("scala")) // Right(12)
         *  ```
         *  @param f The function to bind across `Left`.
         */
        flatMap<A1, B1 extends B>(f: (value: A) => Either<A1, B1>): Either<A1, B1> {
            return this.e.match<Either<A1, B1>>({
                left: (a) => f(a),
                right: () => this.e as unknown as Either<A1, B1>
            });
        }

        /** Maps the function argument through `Left`.
         *
         *  ```
         *  left(12).left.map(_ + 2) // Left(14)
         *  right<number, number>(12).left.map(_ => _ + 2) // Right(12)
         *  ```
         */
        map<A1>(f: (value: A) => A1): Either<A1, B> {
            return this.e.match<Either<A1, B>>({
                left: a => left(f(a)),
                right: () => this.e as unknown as Either<A1, B>
            });
        }


        /** Returns `None` if this is a `Right` or if the given predicate
         *  `p` does not hold for the left value, otherwise, returns a `Left`.
         *
         *  ```
         *  left(12).left.filterToOption(_ => _ > 10)  // Some(Left(12))
         *  left(7).left.filterToOption(_ => _ > 10)   // None
         *  right(12).left.filterToOption(_ => _ > 10) // None
         *  ```
         */
        filterToOption(p: (value: A) => boolean): Option<Either<A, B>> {
            return this.e.match<Option<Either<A, B>>>({
                left: l => p(l) ? some(this.e) : none,
                right: () => none
            });
        }

        /** Returns a `Seq` containing the `Left` value if it exists or an empty
         *  `Seq` if this is a `Right`.
         *
         *  ```
         *  left(12).left.toSeq // Seq(12)
         *  right(12).left.toSeq // Seq()
         *  ```
         */
        get toCollection(): Collection<A> {
            return this.e.match({
                left: l => Collection.of(l),
                right: () => Nil
            });
        }

        /** Returns a `Some` containing the `Left` value if it exists or a
         *  `None` if this is a `Right`.
         *
         *  {{{
         *  Left(12).left.toOption // Some(12)
         *  Right(12).left.toOption // None
         *  }}}
         */
        get toOption(): Option<A> {
            return this.e.match<Option<A>>({
                left: l => some(l),
                right: () => none
            });
        }

    }
}


export function right<T>(value: T): Right<T> {
    return new Right(value);
}

export function left<E>(value: E): Left<E> {
    return new Left(value);
}

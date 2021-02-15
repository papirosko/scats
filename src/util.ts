import {Option, some} from "./option";
import {Mappable} from "./mappable";

export function idFunction<T>(x: T): T {
    return x;
}


export function toErrorConversion(x: any): Error {
    if (x instanceof Error) {
        return x as Error;
    } else {
        return new Error(x);
    }
}

export type StepFunction<C extends Mappable<any>> = (prev: any, state: any) => C;

export class Step<C extends Mappable<any>> {

    constructor(readonly name: Option<string>,
                readonly f: StepFunction<C>) {
    }

}

export function step<C extends Mappable<any>>(name: string, f: StepFunction<C>) {
    return new Step(some(name), f);
}

export function forComprehension<C extends Mappable<any>>(...steps: Step<C>[]): { yield: (final: (state: any) => any) => C } {

    return {
        yield: function(final: (state: any) => any): C {

            const acc: any = {};

            let result: C = steps[0].f(undefined, acc);
            for (let i = 1; i < steps.length; i++) {
                result = result.flatMap(x => {
                    steps[i - 1].name.foreach(n => acc[n] = x);
                    return steps[i].f(x, acc);
                }) as C;

            }
            return result.map(x => {
                steps[steps.length - 1].name.foreach(n => acc[n] = x);
                return final(acc);
            }) as C;

        }
    }


}


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

export type StepFunction<C extends Mappable<any>> = (state: any) => C;

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
            function processStep(stepIdx: number, result: C, acc: any): C {
                return result.flatMap(x => {
                    steps[stepIdx - 1].name.foreach(name => acc[name] = x);
                    const nextResult = steps[stepIdx].f(acc);
                    if (stepIdx < steps.length - 1) {
                        return processStep(stepIdx + 1, nextResult, acc);
                    } else {
                        return nextResult.map(x => {
                            steps[stepIdx].name.foreach(name => acc[name] = x);
                            return final(acc);
                        }) as C
                    }
                }) as C
            }

            let result: C = steps[0].f(acc);
            if (steps.length > 1) {
                return processStep(1, result, acc);
            } else {
                return result.map(x => {
                    steps[steps.length - 1].name.foreach(n => acc[n] = x);
                    return final(acc);
                }) as C;
            }


        }
    }


}


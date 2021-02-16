import {none, Option, some} from "./option";
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
export type StepCondition = (state: any) => boolean;
export interface Filterable<T> {
    filter(p: (x: T ) => boolean): this
}
export type MaybeWithFilter<C extends Mappable<any>> = C extends Filterable<any> ? StepWithFilter<C> : Step<C>;

export class Step<C extends Mappable<any>> {

    constructor(readonly name: Option<string>,
                protected readonly f: StepFunction<C>) {
    }

    invokeStep(state: any): C {
        return this.f(state) as unknown as C;
    }

}

export class StepWithFilter<C extends Mappable<any>> extends Step<C>{

    constructor(name: Option<string>,
                f: StepFunction<C>,
                readonly filter: Option<StepCondition>) {
        super(name, f);
    }

    if(condition: (state: any) => boolean): Step<C> {
        return new StepWithFilter(this.name, this.f, some(condition));
    }

    invokeStep(state: any): C {
        const result = this.f(state);
        return this.filter.filter(() => 'filter' in result).map(filter => {
            return (result as unknown as Filterable<any>).filter(x => {
                this.name.foreach(name => state[name] = x);
                return filter(state)
            }) as unknown as C;
        }).getOrElseValue(result as unknown as C);
    }

}

export function step<C extends Mappable<any>>(name: string, f: StepFunction<C>): MaybeWithFilter<C> {
    return new StepWithFilter<C>(some(name), f, none) as MaybeWithFilter<C>;
}

export function forComprehension<C extends Mappable<any>>(...steps: Step<C>[]): { yield: (final: (state: any) => any) => C } {

    return {
        yield: function(final: (state: any) => any): C {

            function processStep(stepIdx: number, acc: any): C {
                const result = steps[stepIdx].invokeStep(acc);

                if (stepIdx < steps.length - 1) {
                    return result.flatMap(x => {
                        steps[stepIdx].name.foreach(name => acc[name] = x);
                        return processStep(stepIdx + 1, acc)
                    }) as C;
                } else {
                    return result.map(x => {
                        steps[stepIdx].name.foreach(name => acc[name] = x);
                        return final(acc);
                    }) as C
                }

            }

            return processStep(0, {});
        }
    }


}


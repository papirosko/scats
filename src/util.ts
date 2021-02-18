import {none, Option, some} from "./option";
import {Mappable} from "./mappable";

export function identity<T>(x: T): T {
    return x;
}


export function toErrorConversion(x: any): Error {
    if (x instanceof Error) {
        return x as Error;
    } else {
        return new Error(x);
    }
}

export type StepFunction<C extends Mappable<any>, R> = (state: any) => R;
export type StepCondition = (state: any) => boolean;
export interface Filterable<T, R extends Mappable<T>> {
    filter(p: (x: T ) => boolean): R
}
export type MaybeWithFilter<C extends Mappable<any>, R> = C extends Filterable<any, Mappable<any>> ? StepWithFilter<C, R> : Step<C, R>;
export type TaskMaybeWithFilter<C extends Mappable<any>> = C extends Filterable<any, Mappable<any>> ? TaskWithFilter<C> : Task<C>;

export interface Step<C extends Mappable<any>, R> {

    readonly name: Option<string>;
    invokeStep(state: any): R;

}

export interface Task<C extends Mappable<any>> extends Step<C, Promise<C>> {
}

export class StepWithFilter<C extends Mappable<any>, R> implements Step<C, R>{

    constructor(readonly name: Option<string>,
                readonly f: StepFunction<C, R>,
                readonly filter: Option<StepCondition>) {
    }

    if(condition: (state: any) => boolean): Step<C, R> {
        return new StepWithFilter(this.name, this.f, some(condition));
    }

    invokeStep(state: any): R {
        const result = this.f(state);
        return this.filter.filter(() => 'filter' in result).map(filter => {
            return (result as unknown as Filterable<any, any>).filter(x => {
                this.name.foreach(name => state[name] = x);
                return filter(state)
            }) as unknown as R;
        }).getOrElseValue(result as unknown as R);
    }

}

export class TaskWithFilter<C extends Mappable<any>> implements Task<C> {

    constructor(readonly name: Option<string>,
                readonly f: StepFunction<C, Promise<C>>,
                readonly filter: Option<StepCondition>) {
    }

    if(condition: (state: any) => boolean): Step<C, Promise<C>> {
        return new TaskWithFilter(this.name, this.f, some(condition));
    }

    async invokeStep(state: any): Promise<C> {
        const result = await this.f(state);
        return this.filter.filter(() => 'filter' in result).map(filter => {
            return (result as unknown as Filterable<any, any>).filter(x => {
                this.name.foreach(name => state[name] = x);
                return filter(state)
            }) as C;
        }).getOrElseValue(result as unknown as C);
    }

}

export function step<C extends Mappable<any>>(name: string, f: StepFunction<C, C>): MaybeWithFilter<C, C> {
    return new StepWithFilter<C, C>(some(name), f, none) as MaybeWithFilter<C, C>;
}

export function task<C extends Mappable<any>>(name: string, f: StepFunction<C, Promise<C>>): TaskMaybeWithFilter<C> {
    return new TaskWithFilter<C>(some(name), f, none) as MaybeWithFilter<C, Promise<C>>;
}

export function forComprehension<C extends Mappable<any>>(...steps: Step<C, C>[]): { yield: (final: (state: any) => any) => C } {

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

export module forComprehension {

    export function promise<C extends Mappable<any>>(...steps: Task<C>[]): { yield: (final: (state: any) => any) => Promise<C> } {

        return {
            yield: function (final: (state: any) => any): Promise<C> {

                async function processStep(stepIdx: number, acc: any): Promise<C> {
                    const result = await steps[stepIdx].invokeStep(acc);

                    if (stepIdx < steps.length - 1) {
                        return await result.flatMapPromise(x => {
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
}

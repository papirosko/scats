export interface Mappable<C> {

    map<B>(f: (item: C) => B): Mappable<B>;
    flatMap<B>(f: (item: C) => Mappable<B>): Mappable<B>;
    flatMapPromise<B>(f: (item: C) => Promise<Mappable<B>>): Promise<Mappable<B>>;
}

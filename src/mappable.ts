export interface Mappable<C> {

    map<B>(f: (item: C) => B): Mappable<B>;
    flatMap<B>(f: (item: C) => Mappable<B>): Mappable<B>;

    mapPromise<B>(f: (v: C) => Promise<B>): Promise<Mappable<B>>
    flatMapPromise<B>(f: (item: C) => Promise<Mappable<B>>): Promise<Mappable<B>>;
}

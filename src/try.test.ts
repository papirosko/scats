import {failure, success, Try, TryLike} from "./try";
import {none, some} from "./option";
import {left, right} from "./either";

describe('Try', () => {

    const successAware: () => any = () => {
        return 'success';
    }


    const errorAware: () => any = () => {
        throw new Error('error');
    }


    test('store the response', () => {

        expect(Try(() => 1 / 1)).toEqual(success(1));
        expect(Try(() => 1 / 1).toOption).toEqual(some(1));
        expect(Try(() => 1 / 1).toEither).toEqual(right(1));

    });


    test('should catch errors', () => {

        expect(Try(() => {
            throw new Error('123');
        })).toEqual(failure(new Error('123')));

        expect(Try(errorAware).toOption).toEqual(none);

        expect(Try(() => {
            throw new Error('test');
        }).toEither).toEqual(left(new Error('test')));

    });


    test('map', () => {
        expect(Try(successAware).map(_ => 123)).toEqual(success(123));
        expect(Try(errorAware).map(_ => 123)).toEqual(failure(new Error('error')));
    });


    test('isSuccess, isFailure', () => {
        expect(success(1).isSuccess).toBeTruthy();
        expect(success(1).isFailure).toBeFalsy();
        expect(failure(new Error('123')).isSuccess).toBeFalsy();
        expect(failure(new Error('123')).isFailure).toBeTruthy();
    });


    test('getOrElse, getOrElseValue, orElse, get', () => {
        expect(Try(successAware).getOrElse(() => '')).toEqual('success');
        expect(Try(successAware).getOrElseValue('')).toEqual('success');
        expect(Try(successAware).orElse(() => success(''))).toEqual(success('success'));
        expect(Try(successAware).get).toEqual('success');

        expect(Try(errorAware).getOrElse(() => 'fallback')).toEqual('fallback');
        expect(Try(errorAware).getOrElseValue('fallback')).toEqual('fallback');
        expect(Try(errorAware).orElse(() => success('fallback'))).toEqual(success('fallback'));
        expect(Try(errorAware).orElse(() => {
            throw new Error('fallback_error');
        })).toEqual(failure(new Error('fallback_error')));
        expect(() => Try(errorAware).get).toThrowError('error');
    });


    test('match', () => {
        expect(Try(successAware).match<number>({
            success: () => 1,
            failure: () => 2
        })).toEqual(1);

        expect(Try(errorAware).match<number>({
            success: () => 1,
            failure: () => 2
        })).toEqual(2);

    });


    test('foreach', () => {
        let s = 1;
        Try(successAware).foreach(() => {
            s = 2;
        });
        expect(s).toEqual(2);

        let f = 1;
        Try(errorAware).foreach(() => {
            f = 2;
        });
        expect(f).toEqual(1);
    });


    test('flatMap', () => {
        expect(Try(successAware).flatMap(() => success(2))).toEqual(success(2));
        expect(Try(successAware).flatMap(() => failure(new Error('2')))).toEqual(failure(new Error('2')));
        expect(Try(successAware).flatMap(() => {
            throw new Error('3');
        })).toEqual(failure(new Error('3')));

        expect(Try(errorAware).flatMap(() => success(2))).toEqual(failure(new Error('error')));

    });


    test('filter', () => {
        expect(Try(successAware).filter(x => x === 'success')).toEqual(success('success'));
        expect(Try(successAware).filter(x => x === 'success1').isFailure).toBeTruthy();
        expect(Try(errorAware).filter(x => x === 'success')).toEqual(failure(new Error('error')));
    });


    test('failed', () => {
        expect(Try(successAware).failed.isFailure).toBeTruthy();
        expect(Try(errorAware).failed).toEqual(success(new Error('error')));
    });


    test('fold', () => {

        expect(Try(successAware).fold(
            e => 1,
            result => 2
        )).toEqual(2);

        expect(Try(successAware).fold(
            e => 1,
            result => {
                throw new Error('1');
            }
        )).toEqual(1);

        expect(Try(errorAware).fold(
            e => 1,
            result => 2
        )).toEqual(1);
    });


    test('recover', () => {
        expect(Try(successAware).recover(x => '1')).toEqual(success('success'));
        expect(Try(errorAware).recover(x => '1')).toEqual(success('1'));
        expect(Try(errorAware).recover(x => {
            throw new Error('fallback_error');
        })).toEqual(failure(new Error('fallback_error')));
    });


    test('recoverWith', () => {
        expect(Try(successAware).recoverWith(x => success('1'))).toEqual(success('success'));
        expect(Try(errorAware).recoverWith(x => success('1'))).toEqual(success('1'));
        expect(Try(errorAware).recoverWith(x => failure(new Error('2')))).toEqual(failure(new Error('2')));
        expect(Try(errorAware).recoverWith(x => {
            throw new Error('fallback_error');
        })).toEqual(failure(new Error('fallback_error')));
    });

    test('transform', () => {
        expect(Try(successAware).transform(x => success('1'), e => failure(e))).toEqual(success('1'));
        expect(Try(errorAware).transform(x => success('1'), e => success('2'))).toEqual(success('2'));
        expect(Try(errorAware).transform(x => failure(new Error('1')), e => failure(new Error('2')))).toEqual(failure(new Error('2')));
        expect(Try(errorAware).transform(x => {
            throw new Error('fallback_error1');
        }, e => {
            throw new Error('fallback_error2');
        })).toEqual(failure(new Error('fallback_error2')));
    });

});


describe('Try.promise', () => {

    test('work with promises promise', async () => {

        expect(await Try.promise(() => Promise.resolve(1))).toEqual(success(1));
        expect(await Try.promise(() => Promise.reject(new Error('123')))).toEqual(failure(new Error('123')));

    });

});

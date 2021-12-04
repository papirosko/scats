import {Either, right, left} from '../src';



describe('Validation with either', () => {

    interface Profile {
        readonly name: string;
        readonly password: string;
    }

    class Validator {

        static validateProfile(profile: Profile): Either<string, Profile> {

            if (!profile.name) {
                return left('name is empty');
            } else if (profile.name.length > 10) {
                return left('name length more then 10 symbols');
            } else {
                return right(profile);
            }

        }

    }


    test('should validate profile', () => {

        expect(Validator.validateProfile({
            name: 'qqq',
            password: '111'
        }).match({
            right: () => 'done',
            left: error => error
        })).toEqual('done');

        expect(Validator.validateProfile({
            name: '',
            password: '111'
        }).match({
            right: () => 'done',
            left: error => error
        })).toEqual('name is empty');

        expect(Validator.validateProfile({
            name: '1234567890123',
            password: '111'
        }).match({
            right: () => 'done',
            left: error => error
        })).toEqual('name length more then 10 symbols');

    });

});

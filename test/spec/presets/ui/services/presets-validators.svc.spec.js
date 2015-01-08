/**
 * Created by tzachit on 08/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('services', function(){
      describe('presetValidators', function(){

        var presetsValidators;

        beforeEach(inject(function(_presetValidators_){
          presetsValidators = _presetValidators_;
        }));

        describe('methods', function(){
          describe('isNullOrUndefined', function(){
            it('should return true when called with null or undefined.', function(){
              expect(presetsValidators.isNullOrUndefined(null)).toBeTruthy();
              expect(presetsValidators.isNullOrUndefined(undefined)).toBeTruthy();
            });

            it('should return false when called with non null or undefined value.', function(){
              expect(presetsValidators.isNullOrUndefined({})).toBeFalsy();
            });
          });

          describe('isNullEmptyOrWhiteSpaces', function(){
            it('should return true when called with null or empty or white spaces string.', function(){
              expect(presetsValidators.isNullEmptyOrWhiteSpaces(null)).toBeTruthy();
              expect(presetsValidators.isNullEmptyOrWhiteSpaces('')).toBeTruthy();
              expect(presetsValidators.isNullEmptyOrWhiteSpaces('   ')).toBeTruthy();
            });

            it('should return false when called with non null or empty or white spaces string.', function(){
              expect(presetsValidators.isNullEmptyOrWhiteSpaces('good value')).toBeFalsy();
            });
          });
        });
      });
    });
  });
});

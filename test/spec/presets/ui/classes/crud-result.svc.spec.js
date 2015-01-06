/**
 * Created by tzachit on 30/12/14.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('classes', function(){
      describe('CRUDResult', function(){

        var CRUDResult = null;

        beforeEach(inject(function(_CRUDResult_){
          CRUDResult = _CRUDResult_;
        }));

        describe('initialize', function(){
          it('should private members equals to public properties.',  function(){
            var result = new CRUDResult();
            expect(result._succeeded).toBe(result.succeeded);
            expect(result._data).toBe(result.data);
            expect(result._errors).toBe(result.errors);

            result = new CRUDResult(true, {}, []);
            expect(result._succeeded).toBe(result.succeeded);
            expect(result._data).toBe(result.data);
            expect(result._errors).toBe(result.errors);
          });
        });

        describe('properties', function(){
          describe('success', function(){
            it('should equals to _success private member value.', function(){
              var result = new CRUDResult();
              result.succeeded = true;
              expect(result.succeeded).toBe(result._succeeded);
              expect(result.succeeded).toBeTruthy();
            });
          });

          describe('data', function(){
            it('should equals to _data private member.', function(){
              var result = new CRUDResult();
              result.data = {};
              expect(result.data).toBe(result._data);
              expect(result.data).toEqual({});
            });
          });

          describe('errors', function(){
            it('should equals to _errors private member.', function(){
              var result = new CRUDResult();
              result.errors = [];
              expect(result.errors).toBe(result._errors);
              expect(result.errors).toEqual([]);
            });
          });
        });
      });
    });
  });
});

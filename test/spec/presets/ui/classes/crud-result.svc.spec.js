/**
 * Created by tzachit on 30/12/14.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('classes', function(){

      var CRUDResult = null;
      beforeEach(inject(function(_CRUDResult_){
        CRUDResult = _CRUDResult_;
      }));

      describe('CRUDResult', function(){

        it('should private members equals to pubs properties.',  function(){
          var result = new CRUDResult();
          expect(result._succeeded).toBe(result.succeeded);
          expect(result._data).toBe(result.data);
          expect(result._errors).toBe(result.errors);

          result = new CRUDResult(true, {}, []);
          expect(result._succeeded).toBe(result.succeeded);
          expect(result._data).toBe(result.data);
          expect(result._errors).toBe(result.errors);
        });

        it('should success property value equals to _success private member value.', function(){
          var result = new CRUDResult();
          result.succeeded = true;
          expect(result.succeeded).toBe(result._succeeded);
          expect(result.succeeded).toBeTruthy();
        });

        it('should data auto property equals to _data private member.', function(){
          var result = new CRUDResult();
          result.data = {};
          expect(result.data).toBe(result._data);
          expect(result.data).toEqual({});
        });

        it('should errors property equals to _errors private member.', function(){
          var result = new CRUDResult();
          result.errors = [];
          expect(result.errors).toBe(result._errors);
          expect(result.errors).toEqual([]);
        });
      });
    });
  });
});

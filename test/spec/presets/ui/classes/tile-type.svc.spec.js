/**
 * Created by tzachit on 05/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  beforeEach(function(){
    jasmine.addMatchers({
      toBeInstanceOf: function(){
        return {
          compare: function(actual, expected){
            var result = {};
            result.message = "Expected " + actual.constructor.name + " to be is instance of " + expected.name;
            result.pass = actual instanceof expected;
            return result;
          }
        };
      }
    });
  });

  describe('ui', function(){
    describe('classes', function(){
      describe('TileType', function(){

        var TileType, CRUDResult;

        beforeEach(inject(function(_TileType_, _CRUDResult_){
          TileType = _TileType_;
          CRUDResult = _CRUDResult_;
        }));

        describe('initialize', function(){

          var name, creationInfo, presentationInfo, confirmAdd, confirmRemove, confirmUpdate;

          beforeEach(function(){
            name = 'type1';
            creationInfo = {};
            presentationInfo = {};
            confirmAdd = angular.noop;
            confirmRemove = angular.noop;
            confirmUpdate = angular.noop;
          });

          it('should initialize some private properties when construct.', function(){
            var tileType = new TileType(name, creationInfo, presentationInfo, confirmAdd, confirmRemove, confirmUpdate);
            expect(tileType._name).toBe(name);
            expect(tileType._creationInfo).toBe(creationInfo);
            expect(tileType._presentationInfo).toBe(presentationInfo);
            expect(tileType._confirmAdd).toBe(confirmAdd);
            expect(tileType._confirmRemove).toBe(confirmRemove);
            expect(tileType._confirmUpdate).toBe(confirmUpdate);
          });

          it('should initialize some private properties when invoke init(...).', function(){
            var tileType = new TileType();
            tileType.init({
              name: name,
              creationInfo: creationInfo,
              presentationInfo: presentationInfo,
              confirmAdd: confirmAdd,
              confirmRemove: confirmRemove,
              confirmUpdate: confirmUpdate
            });
            expect(tileType._name).toBe(name);
            expect(tileType._creationInfo).toBe(creationInfo);
            expect(tileType._presentationInfo).toBe(presentationInfo);
            expect(tileType._confirmAdd).toBe(confirmAdd);
            expect(tileType._confirmRemove).toBe(confirmRemove);
            expect(tileType._confirmUpdate).toBe(confirmUpdate);
          });

          it('should set the events to functions that returns CRUDResult when not set.', function(){
            var tileType = new TileType();
            expect(tileType._confirmAdd()).toBeInstanceOf(CRUDResult);
            expect(tileType._confirmRemove()).toBeInstanceOf(CRUDResult);
            expect(tileType._confirmUpdate()).toBeInstanceOf(CRUDResult);

            tileType.init({});
            expect(tileType._confirmAdd()).toBeInstanceOf(CRUDResult);
            expect(tileType._confirmRemove()).toBeInstanceOf(CRUDResult);
            expect(tileType._confirmUpdate()).toBeInstanceOf(CRUDResult);
          });
        });

        describe('properties', function(){
          describe('name', function(){
            it('should equals to _name private member value.', function(){
              var tileType = new TileType();
              tileType.name = 'type1';
              expect(tileType.name).toBe(tileType._name);
              expect(tileType.name).toBe('type1');
            });
          });

          describe('creationInfo', function(){
            it('should equals to _creationInfo private member value.', function(){
              var tileType = new TileType();
              tileType._creationInfo = {};
              expect(tileType.creationInfo).toBe(tileType._creationInfo);
            });
          });

          describe('presentationInfo', function(){
            it('should equals to _presentationInfo private member value.', function(){
              var tileType = new TileType();
              tileType._presentationInfo = {};
              expect(tileType.presentationInfo).toBe(tileType._presentationInfo);
            });
          });
        });

        describe('events', function(){
          describe('confirmAdd', function(){
            it('should throw exception when set to non function value.', function(){
              var tileType = new TileType();
              expect(function(){ tileType.confirmAdd = {}; }).toThrow();
            });

            it('should equals to _confirmAdd private member value.', function(){
              var tileType = new TileType();
              tileType._confirmAdd = function(){};
              expect(tileType.confirmAdd).toBe(tileType._confirmAdd);
            });
          });

          describe('confirmRemove', function(){
            it('should throw exception when set to non function value.', function(){
              var tileType = new TileType();
              expect(function(){ tileType.confirmRemove = {}; }).toThrow();
            });

            it('should equals to _confirmRemove private member value.', function(){
              var tileType = new TileType();
              tileType._confirmRemove = function(){};
              expect(tileType.confirmRemove).toBe(tileType._confirmRemove);
            });
          });

          describe('confirmUpdate', function(){
            it('should throw exception when set to non function value.', function(){
              var tileType = new TileType();
              expect(function(){ tileType.confirmUpdate = {}; }).toThrow();
            });

            it('should equals to _confirmUpdate private member value.', function(){
              var tileType = new TileType();
              tileType._confirmUpdate = function(){};
              expect(tileType.confirmUpdate).toBe(tileType._confirmUpdate);
            });
          });
        });
      });
    });
  });
});

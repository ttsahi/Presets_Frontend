/**
 * Created by tzachit on 07/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('controllers', function(){
      describe('updateTileController', function(){

        var $controller, $rootScope, $q, $scope;

        var workspaceDataMock = {
          preset: {
            useCache: true,
            types: {
              type1: {name: 'type1', creationInfo: {}},
              type2: {name: 'type2', creationInfo: {}},
              type3: {name: 'type3', creationInfo: {}}
            },
            generateId: function(){ return '###-###-###'; }
          },
          addTileAsync: angular.noop,
          enterEditMode: angular.noop,
          updateTileByPositionAsync: angular.noop,
          removeTileByPositionAsync: angular.noop,
          enterDragDropMode: angular.noop,
          tiles: [{ type: 'type1', model: {} }, { type: 'type2', model: {} }, { type: 'type3', model: {} }]
        };

        beforeEach(inject(function(_$controller_, _$rootScope_, _$q_){
          $controller = _$controller_;
          $rootScope = _$rootScope_;
          $q = _$q_;

          $scope = { workspaceData: workspaceDataMock, position: 1 };
        }));

        describe('construct', function(){
          it('should initialize $scope.model, $scope.isUpdateTemplateLoaded, $scope.loadTemplateDeferred, $scope.creationInfo.', function(){
            var defer = { promise: { then: angular.noop } };
            spyOn($q, 'defer').and.callFake(function(){ return defer; });
            spyOn(defer.promise, 'then');
            var tile = workspaceDataMock.tiles[$scope.position - 1];
            $controller('updateTileController', { $scope: $scope, $q: $q });
            expect($scope.model).toEqual(tile.model);
            expect($scope.isUpdateTemplateLoaded).toBeFalsy();
            expect(defer.promise.then).toHaveBeenCalled();
            expect($scope.creationInfo).toBe(workspaceDataMock.preset.types[tile.type].creationInfo);
          });
        });

        describe('methods', function(){
          describe('onModelValidation', function(){
            it('should invoke the callback that pass to onModelValidation when call to update().', function(){
              var callback = jasmine.createSpy('callback');
              $controller('updateTileController', { $scope: $scope, $q: $q });
              $scope.onModelValidation(callback);
              $scope.update();
              expect(callback).toHaveBeenCalled();
            });
          });

          describe('update', function(){
            it('should invoke validationCallback an workspaceData.updateTileByPositionAsync(...) when called.', function(){
              var callback = jasmine.createSpy('callback').and.returnValue(true);
              spyOn(workspaceDataMock, 'updateTileByPositionAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve();
                });
              });
              spyOn(workspaceDataMock, 'enterDragDropMode');
              $controller('updateTileController', { $scope: $scope, $q: $q });
              $scope.onModelValidation(callback);
              $scope.update();
              $rootScope.$digest();
              expect(callback).toHaveBeenCalled();
              expect(workspaceDataMock.updateTileByPositionAsync).toHaveBeenCalled();
              expect(workspaceDataMock.enterDragDropMode).toHaveBeenCalled();
            });
          });

          describe('delete', function(){
            it('should invoke removeTileByPositionAsync(...) and enterDragDropMode() when called.', function(){
              spyOn(workspaceDataMock, 'removeTileByPositionAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve();
                });
              });
              spyOn(workspaceDataMock, 'enterDragDropMode');
              $controller('updateTileController', { $scope: $scope, $q: $q });
              $scope.delete();
              $rootScope.$digest();
              expect(workspaceDataMock.removeTileByPositionAsync).toHaveBeenCalled();
              expect(workspaceDataMock.enterDragDropMode).toHaveBeenCalled();
            });
          });

          describe('cancel', function(){
            it('should invoke enterDragDropMode() when called.', function(){
              spyOn(workspaceDataMock, 'enterDragDropMode');
              $controller('updateTileController', { $scope: $scope, $q: $q });
              $scope.cancel();
              expect(workspaceDataMock.enterDragDropMode).toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});

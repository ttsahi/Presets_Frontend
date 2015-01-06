/**
 * Created by tzachit on 06/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('controllers', function(){
      describe('addTileController', function(){

        var $controller, $rootScope, $q, $scope;

        var workspaceDataMock = {
          preset: {
            useCache: true,
            types: [{name: 'type1'}, {name: 'type2'}, {name: 'type3'}],
            generateId: function(){ return '###-###-###'; }
          },
          addTileAsync: angular.noop,
          enterEditMode: angular.noop
        };

        beforeEach(inject(function(_$controller_, _$rootScope_, _$q_){
          $controller = _$controller_;
          $rootScope = _$rootScope_;
          $q = _$q_;

          $scope = { workspaceData: workspaceDataMock };
        }));

        describe('construct', function(){
          it('should initialize $scope.tileTypes and $scope.loadTemplateDeferred.', function(){
            var defer = angular.noop;
            spyOn($q, 'defer').and.callFake(function(){ return defer; });
            $controller('addTileController', { $scope: $scope, $q: $q });
            expect($scope.tilesTypes).toContain(workspaceDataMock.preset.types[0]);
            expect($scope.tilesTypes).toContain(workspaceDataMock.preset.types[1]);
            expect($scope.tilesTypes).toContain(workspaceDataMock.preset.types[2]);
            expect($scope.loadTemplateDeferred).toBe(defer);
          });
        });

        describe('methods', function(){
          describe('next', function(){
            it('should $scope.creationInfo = tileType.creationInfo when called to $scope.next(tileType).', function(){
              var tileType = { name: 'type1', creationInfo: {}, presentationInfo: {} };
              $controller('addTileController', { $scope: $scope, $q: $q });
              $scope.next(tileType);
              expect($scope.creationInfo).toBe(tileType.creationInfo);
            });

            it('should $scope.typeSelected = true when called to $scope.next(tileType) and resolve $scope.loadTemplateDeferred.', function(){
              var tileType = { name: 'type1', creationInfo: {}, presentationInfo: {} };
              $controller('addTileController', { $scope: $scope, $q: $q });
              $scope.next(tileType);
              $scope.loadTemplateDeferred.resolve();
              $rootScope.$digest();
              expect($scope.typeSelected).toBeTruthy();
            });
          });

          describe('onModelValidation', function(){
            it('should validationCallback equals to callback when called to $scope.onModelValidation(callback) with function.', function(){
              $controller('addTileController', { $scope: $scope, $q: $q });
              var callback = jasmine.createSpy('callback');
              $scope.onModelValidation(callback);
              $scope.create();
              expect(callback).toHaveBeenCalled();
            });
          });

          describe('create', function(){
            it('should invoke validationCallback() when called.', function(){
              $controller('addTileController', { $scope: $scope, $q: $q });
              var callback = jasmine.createSpy('callback');
              $scope.onModelValidation(callback);
              $scope.create();
              expect(callback).toHaveBeenCalled();
            });

            it('should invoke  workspaceData.addTileAsync(...) and  workspaceData.enterEditMode() when validationCallback() = true.', function(){
              $controller('addTileController', { $scope: $scope, $q: $q });
              spyOn(workspaceDataMock, 'addTileAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve();
                });
              });
              spyOn(workspaceDataMock, 'enterEditMode');
              $scope.onModelValidation(function(){ return true; });
              $scope.create();
              $rootScope.$digest();
              expect(workspaceDataMock.addTileAsync).toHaveBeenCalled();
              expect(workspaceDataMock.enterEditMode).toHaveBeenCalled();
            });
          });

          describe('cancel', function(){
            it('should invoke workspaceData.enterEditMode() when called.', function(){
              $controller('addTileController', { $scope: $scope, $q: $q });
              spyOn(workspaceDataMock, 'enterEditMode');
              $scope.cancel();
              expect(workspaceDataMock.enterEditMode).toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});

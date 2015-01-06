/**
 * Created by tzachit on 06/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('controllers', function(){
      describe('addWorkspaceController', function(){

        var $controller, $rootScope, $q, $scope;

        var presetMock = {
          useCache: true,
          workspacesList: [{name: 'workspace1'}, {name: 'workspace2'}, {name: 'workspace3'}],
          generateId: function(){ return '###-###-###'; }
        };

        var PresetMock = {
          defaultRows: 4,
          defaultCols: 5
        };

        beforeEach(inject(function(_$controller_, _$rootScope_, _$q_){
          $controller = _$controller_;
          $rootScope = _$rootScope_;
          $q = _$q_;

          $scope = $rootScope.$new();
          $scope.preset = presetMock;
        }));

        describe('construct', function(){
          it('should initialize $scope.workspace, $scope.datepicker, $scope.firstCreate and $scope.formErrors.', function(){
            spyOn(window, 'Date').and.callFake(angular.noop);

            var workspace = {
              name: null,
              description: null,
              expires: new Date()
            };

            var datepicker = {
              minDate: new Date(),
              format: 'dd-MM-yyyy',
              dateOptions: {
                formatYear: 'yy',
                startingDay: 1
              }
            };

            var formErrors = [];

            $controller('addWorkspaceController', { $scope: $scope, Preset: PresetMock});

            expect($scope.workspace).toEqual(workspace);
            expect($scope.datepicker).toEqual(datepicker);
            expect($scope.firstCreate).toBeTruthy();
            expect($scope.formErrors).toEqual([]);
          });
        });

        describe('methods', function(){
          describe('today', function(){
            it('should $scope.workspace.expires instance of Date when called.', function(){
              $controller('addWorkspaceController', { $scope: $scope, Preset: PresetMock});
              $scope.today();
              expect($scope.workspace.expires instanceof Date).toBeTruthy();
            });
          });

          describe('nextWeek', function(){
            it('should $scope.workspace.expires instance of Date and equals next week date when called.', function(){
              $controller('addWorkspaceController', { $scope: $scope, Preset: PresetMock});
              var nextWeek = new Date((new Date().getTime() + 1000 * 60 * 60 * 24 * 7));
              $scope.nextWeek();
              expect($scope.workspace.expires instanceof Date).toBeTruthy();
              expect($scope.workspace.expires.getTime() >= nextWeek.getTime()).toBeTruthy();
            });
          });

          describe('clear', function(){
            it('should $scope.workspace.expires = null when called.', function(){
              $controller('addWorkspaceController', { $scope: $scope, Preset: PresetMock});
              $scope.clear();
              expect($scope.workspace.expires).toBe(null);
            });
          });

          describe('open', function(){
            it('should $scope.datepicker.opened = true when called.', function(){
              $controller('addWorkspaceController', { $scope: $scope, Preset: PresetMock});
              $scope.open({ preventDefault: angular.noop, stopPropagation: angular.noop });
              expect($scope.datepicker.opened).toBeTruthy();
            });
          });

          describe('$on(initCreation)', function(){
            it('should set $scope.firstCreate, $scope.workspace, $scope.formErrors and invoke $scope.nextWeek() when raise initCreation.', function(){
              spyOn(window, 'Date').and.callFake(angular.noop);

              var workspace = {
                name: null,
                description: null,
                expires: new Date()
              };

              $controller('addWorkspaceController', { $scope: $scope, Preset: PresetMock});
              spyOn($scope, 'nextWeek');
              $rootScope.$broadcast('initCreation');
              expect($scope.firstCreate).toBeTruthy();
              expect($scope.workspace).toEqual(workspace);
              expect($scope.formErrors).toEqual([]);
              expect($scope.nextWeek).toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});

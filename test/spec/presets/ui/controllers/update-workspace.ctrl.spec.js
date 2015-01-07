/**
 * Created by tzachit on 07/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('controllers', function(){
      describe('updateWorkspaceController', function(){

        var $controller, $rootScope, $q, $scope;

        var presetMock = {
          useCache: true,
          workspacesList: [{name: 'workspace1'}, {name: 'workspace2'}, {name: 'workspace3'}],
          generateId: function(){ return '###-###-###'; },
          updateWorkspaceAsync: angular.noop,
          removeWorkspaceAsync: angular.noop
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
          $scope.setSelectedWorkspace = angular.noop;
          $scope.enterUpdateMode = angular.noop;
        }));

        describe('construct', function(){
          it('should initialize $scope.workspace, $scope.datepicker, $scope.firstUpdate and $scope.formErrors.', function(){
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

            $controller('updateWorkspaceController', { $scope: $scope, Preset: PresetMock});

            expect($scope.workspace).toEqual(workspace);
            expect($scope.datepicker).toEqual(datepicker);
            expect($scope.firstUpdate).toBeTruthy();
            expect($scope.formErrors).toEqual([]);
          });
        });

        describe('methods', function(){
          describe('today', function(){
            it('should $scope.workspace.expires instance of Date when called.', function(){
              $controller('updateWorkspaceController', { $scope: $scope, Preset: PresetMock});
              $scope.today();
              expect($scope.workspace.expires instanceof Date).toBeTruthy();
            });
          });

          describe('nextWeek', function(){
            it('should $scope.workspace.expires instance of Date and equals next week date when called.', function(){
              $controller('updateWorkspaceController', { $scope: $scope, Preset: PresetMock});
              var nextWeek = new Date((new Date().getTime() + 1000 * 60 * 60 * 24 * 7));
              $scope.nextWeek();
              expect($scope.workspace.expires instanceof Date).toBeTruthy();
              expect($scope.workspace.expires.getTime() >= nextWeek.getTime()).toBeTruthy();
            });
          });

          describe('clear', function(){
            it('should $scope.workspace.expires = null when called.', function(){
              $controller('updateWorkspaceController', { $scope: $scope, Preset: PresetMock});
              $scope.clear();
              expect($scope.workspace.expires).toBe(null);
            });
          });

          describe('open', function(){
            it('should $scope.datepicker.opened = true when called.', function(){
              $controller('updateWorkspaceController', { $scope: $scope, Preset: PresetMock});
              $scope.open({ preventDefault: angular.noop, stopPropagation: angular.noop });
              expect($scope.datepicker.opened).toBeTruthy();
            });
          });

          describe('$on(initUpdate)', function(){
            it('should set $scope.firstUpdate, $scope.workspace and $scope.formErrors when raise initUpdate.', function(){
              spyOn(window, 'Date').and.callFake(angular.noop);

              var currentWorkspace = {
                id: '###-###-###',
                name: null,
                description: null,
                expires: new Date()
              };

              $controller('updateWorkspaceController', { $scope: $scope, Preset: PresetMock});
              $rootScope.$broadcast('initUpdate', currentWorkspace);
              expect($scope.firstUpdate).toBeTruthy();
              expect($scope.workspace).toEqual(currentWorkspace);
              expect($scope.formErrors).toEqual([]);
            });
          });

          describe('updateWorkspace', function(){
            it('should set $scope.firstUpdate = true and invoke setSelectedWorkspace(...) and enterUpdateMode() when called.', function(){
              var formMock = { $valid: true };
              var workspaceMock = {};

              spyOn($scope.preset, 'updateWorkspaceAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve();
                });
              });
              spyOn($scope, 'setSelectedWorkspace');
              spyOn($scope, 'enterUpdateMode');

              $controller('updateWorkspaceController', { $scope: $scope, Preset: PresetMock});
              $scope.updateWorkspace(formMock, workspaceMock);
              $rootScope.$digest();

              expect($scope.preset.updateWorkspaceAsync).toHaveBeenCalled();
              expect($scope.setSelectedWorkspace).toHaveBeenCalled();
              expect($scope.firstUpdate).toBeTruthy();
              expect($scope.enterUpdateMode).toHaveBeenCalled();
            });
          });

          describe('delete', function(){
            it('should set $scope.firstUpdate = true and invoke removeWorkspaceAsync(...), setSelectedWorkspace() and enterUpdateMode() when called.', function(){
              spyOn(presetMock, 'removeWorkspaceAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve();
                });
              });
              spyOn($scope, 'setSelectedWorkspace');
              spyOn($scope, 'enterUpdateMode');
              $controller('updateWorkspaceController', { $scope: $scope, Preset: PresetMock});
              $scope.delete({});
              $rootScope.$digest();
              expect(presetMock.removeWorkspaceAsync).toHaveBeenCalled();
              expect($scope.firstUpdate).toBeTruthy();
              expect($scope.setSelectedWorkspace).toHaveBeenCalled();
              expect($scope.enterUpdateMode).toHaveBeenCalled();
            });
          });

          describe('cancel', function(){
            it('should $scope.firstUpdate = true and invoke enterUpdateMode() when called.', function(){
              spyOn($scope, 'enterUpdateMode');

              $controller('updateWorkspaceController', { $scope: $scope, Preset: PresetMock});
              $scope.cancel();

              expect($scope.firstUpdate).toBeTruthy();
              expect($scope.enterUpdateMode).toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});

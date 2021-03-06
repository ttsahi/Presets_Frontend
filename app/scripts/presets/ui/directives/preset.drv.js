/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  app.directive('preset', ['Preset',
    function(Preset){

      function DeveloperError(message){
        this.message = message;
      }

      return {
        restrict: 'EA',
        replace: true,
        templateUrl: Preset.templatesDir + 'templates/preset/template.html',
        scope: {
          preset: '='
        },
        controller: ['$scope', '$q', 'Preset', 'Workspace', 'ReducedWorkspace', 'WorkspaceData',
          function($scope, $q, Preset, Workspace, ReducedWorkspace, WorkspaceData){

            if(!($scope.preset instanceof Preset)){
              throw new DeveloperError('preset must be instance of preset!');
            }

            $scope.addWorkspaceUrl =  Preset.templatesDir + 'templates/preset/add-workspace.html';
            $scope.updateWorkspaceUrl =  Preset.templatesDir + 'templates/preset/update-workspace.html';

            $scope.mainFlipTrigger = '';
            $scope.addUpdateflipTrigger = '';

            var isInAddMode = false;
            var isInUpdateMode = false;

            $scope.selectedWorkspace = null;
            $scope.currentWorkspace = null;

            var preset = $scope.preset;

            preset.onAddToCache = function(workspace){ console.log('add to cache!'); };
            preset.onRefreshCache = function(workspace){
              console.log('refresh cache!');

              if($scope.currentWorkspace !== null && workspace.id === $scope.currentWorkspace.id){
                $scope.refresh();
              }
            };

            $scope.setSelectedWorkspace = function(value){
              $scope.selectedWorkspace = value;
            };

            function resetTriggers(){
              if(!angular.isObject($scope.selectedWorkspace) && preset.workspacesCount !== 0){
                $scope.selectedWorkspace = preset.workspacesList[preset.workspacesList.length - 1];
              }

              isInAddMode = false;
              isInUpdateMode = false;
              $scope.mainFlipTrigger = '';
              $scope.addUpdateflipTrigger = '';


              if(preset.workspacesCount === 0){
                isInAddMode = true;
                $scope.$broadcast('initCreation');
                $scope.mainFlipTrigger = 'flip';
              }else{
                $scope.mainFlipTrigger = '';
              }
            }

            $scope.enterAddMode = function(){
              if(isInAddMode){
                if(preset.workspacesCount === 0) {
                  $scope.$broadcast('initCreation');
                }else{
                  resetTriggers();
                }
              }else{
                $scope.$broadcast('initCreation');
                if(isInUpdateMode || $scope.addUpdateflipTrigger === 'flip'){
                  $scope.addUpdateflipTrigger = '';
                  isInUpdateMode = false;
                }
                if($scope.mainFlipTrigger === ''){
                  $scope.mainFlipTrigger = 'flip';
                }
                isInAddMode = true;
              }
            };

            $scope.enterUpdateMode = function(){
              if(isInUpdateMode){
                if(preset.workspacesCount === 0) {
                  $scope.$broadcast('initCreation');
                  isInAddMode = true;
                  isInUpdateMode = false;
                  $scope.mainFlipTrigger = 'flip';
                  $scope.addUpdateflipTrigger = '';
                }else {
                  resetTriggers();
                }
              }else{
                $scope.$broadcast('initUpdate', $scope.currentWorkspace);
                if(isInAddMode || $scope.addUpdateflipTrigger === ''){
                  $scope.addUpdateflipTrigger = 'flip';
                  isInAddMode = false;
                }
                if($scope.mainFlipTrigger === ''){
                  $scope.mainFlipTrigger = 'flip';
                }
                isInUpdateMode = true;
              }
            };

            $scope.triggerEditMode = function(){
              alert('edit mode not available!');
            };

            function setCurrentWorkspace(selectedWorkspace){

              var currentWorkspace = $scope.currentWorkspace;
              $scope.currentWorkspace = null;

              $q.when((preset.useCache && (currentWorkspace instanceof Workspace)) ? preset.commitChanges(currentWorkspace) : true).then(
                function resolveSuccess(){
                  preset._onWorkspaceChanged();
                  if(selectedWorkspace instanceof ReducedWorkspace){
                    preset.getWorkspaceAsync(selectedWorkspace.id, true).then(
                      function resolveSuccess(result){
                        var workspace = result.data;
                        preset.currentWorkspace = workspace;
                        var workspaceData = new WorkspaceData(preset, workspace);

                        if(preset.useCache === true){
                          workspaceData.onadd = function(tile){
                            preset._workspacesCache.addTile(workspace.id, tile);
                          };

                          workspaceData.onremove = function(tile){
                            preset._workspacesCache.removeTile(workspace.id, tile.id);
                          };

                          workspaceData.onupdate = function(tile){
                            preset._workspacesCache.updateTile(workspace.id, tile);
                          };

                          workspaceData.onTileSizeChanged = function(tile, resizeInfo){
                            preset._workspacesCache.updateTileSize(workspace.id, tile.id, resizeInfo);
                          };
                        }else{
                          workspaceData.onTileSizeChanged = function(tile, resizeInfo){
                            preset.types[tile.type].confirmUpdate(angular.copy(workspace), angular.copy(tile));
                          };
                        }

                        preset._currentWorkspaceData = workspaceData;

                        resetTriggers();

                        $scope.currentWorkspace = workspace;
                        $scope.workspaceData = workspaceData;

                        $scope.triggerEditMode = function(){ workspaceData.triggerEditMode(); };

                      }, function resolveError(reason){
                        console.log('error while loading workspace id: ' + selectedWorkspace.id);
                      });
                  }else{
                    resetTriggers();
                  }

                }, function resolveError(reason){
                  console.log('commit workspace changes failed!');
                }
              );
            }

            $scope.refresh = function(){
              setCurrentWorkspace($scope.selectedWorkspace);
            };

            $scope.$watch('selectedWorkspace',function(newValue){
              setCurrentWorkspace(newValue);
            });
          }
        ]
      };
    }
  ]);

}(angular.module('presetsApp')));

/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  app.directive('preset', ['Preset', 'Workspace', 'TileType',
    function(Preset, Workspace, TileType){

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
        controller: ['$scope', 'WorkspaceData',
          function($scope, WorkspaceData){

            if(!($scope.preset instanceof Preset)){
              throw new DeveloperError('preset must be instance of preset!');
            }

            $scope.addWorkspaceUrl =  Preset.templatesDir + 'templates/preset/add-workspace.html';
            $scope.updateWorkspaceUrl =  Preset.templatesDir + 'templates/preset/update-workspace.html';

            $scope.mainFlipTrigger = '';
            $scope.addUpdateflipTrigger = '';

            var isInAddMode = false;
            var isInUpdateMode = false;

            var preset = $scope.preset;

            $scope.selectedWorkspace = null;

            if(preset.workspacesCount === 0){
              isInAddMode = true;
              $scope.$broadcast('initCreation');
              $scope.mainFlipTrigger = 'flip';
            }else{
              $scope.mainFlipTrigger = '';
            }

            $scope.setSelectedWorkspace = function(value){
              $scope.selectedWorkspace = value;
            };

            $scope.enterAddMode = function(){
              if(isInAddMode){
                if(preset.workspacesCount === 0) {
                  $scope.$broadcast('initCreation');
                }else{
                  isInAddMode = false;
                  isInUpdateMode = false;
                  $scope.mainFlipTrigger = '';
                  $scope.addUpdateflipTrigger = '';
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
                isInUpdateMode = false;
                isInAddMode = false;
                $scope.mainFlipTrigger = '';
                $scope.addUpdateflipTrigger = '';
              }else{
                $scope.$broadcast('initUpdate', $scope.selectedWorkspace);
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

            $scope.workspaceData = new WorkspaceData(null, new Workspace(null, null, null, null, 4, 5));
          }
        ]
      };
    }
  ]);

}(angular.module('presetsApp')));

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

            var preset = $scope.preset;

            if(preset.workspacesCount === 0){
              $scope.flipTrigger = 'flip';
            }else{
              $scope.flipTrigger = '';
            }

            $scope.enterAddMode = function(){
              if($scope.flipTrigger === ''){
                $scope.flipTrigger = 'flip';
              }else{
                $scope.flipTrigger = '';
              }
            };

            $scope.workspaceData = new WorkspaceData(null, new Workspace(null, null, null, null, 4, 5));
          }
        ]
      };
    }
  ]);

}(angular.module('presetsApp')));

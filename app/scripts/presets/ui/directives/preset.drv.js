/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  app.directive('preset', ['Preset', 'TileType',
    function(Preset, TileType){
      return {
        restrict: 'EA',
        replace: true,
        templateUrl: Preset.templatesDir + 'templates/preset/template.html',
        controller: ['$scope', 'WorkspaceData',
          function($scope, WorkspaceData){

            $scope.workspaceData = new WorkspaceData(null, 4, 5);

            $scope.changeWorkspace = function(){
              $scope.workspaceData = new WorkspaceData(null, 20, 20);
              console.log('change workspace data!');
            };

            $scope.isPresentation = true;

            var isAddMode = false;
            var isUpdateMode = false;

            $scope.enterAddMode = function(){
              if(!isAddMode) {
                $scope.workspaceData.enterAddMode();
                isAddMode = true;
                isUpdateMode = false;
              }else{
                $scope.workspaceData.enterPresentationMode();
                isAddMode = false;
                isUpdateMode = false;
              }
            };

            $scope.enterUpdateMode = function(){
              if(!isUpdateMode) {
                $scope.workspaceData.enterUpdateMode();
                isUpdateMode = true;
                isAddMode = false;
              }else{
                $scope.workspaceData.enterPresentationMode();
                isUpdateMode = false;
                isAddMode = false;
              }
            };
          }
        ]
      };
    }
  ]);

}(angular.module('presetsApp')));

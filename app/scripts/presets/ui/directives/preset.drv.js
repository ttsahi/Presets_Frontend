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

            $scope.workspace = {
              name: null,
              description: null,
              expiration: new Date()
            };

            $scope.datepicker = {
              minDate: new Date(),
              format: 'dd-MM-yyyy',
              dateOptions: {
                formatYear: 'yy',
                startingDay: 1
              }
            };

            $scope.today = function() {
              $scope.workspace.expiration = new Date();
            };

            $scope.clear = function () {
              $scope.workspace.expiration = null;
            };

            $scope.open = function($event) {
              $event.preventDefault();
              $event.stopPropagation();

              $scope.datepicker.opened = true;
            };

            function initCreation(){
              $scope.firstCreate = true;
              $scope.workspace = {
                name: null,
                description: null,
                expiration: new Date()
              };
              $scope.today();
            }

            if(preset.workspacesCount === 0){
              initCreation();
              $scope.flipTrigger = 'flip';
            }else{
              $scope.flipTrigger = '';
            }

            $scope.enterAddMode = function(){
              if($scope.flipTrigger === ''){
                initCreation();
                $scope.flipTrigger = 'flip';
              }else{
                if(preset.workspacesCount === 0) {
                  initCreation();
                }else{
                  $scope.flipTrigger = '';
                }
              }
            };

            $scope.createWorkspace = function(){
              $scope.firstCreate = false;

              if($scope.createWorkspaceForm.$valid){
                console.log('valid data!');
              }
            };

            $scope.workspaceData = new WorkspaceData(null, new Workspace(null, null, null, null, 4, 5));
          }
        ]
      };
    }
  ]);

}(angular.module('presetsApp')));

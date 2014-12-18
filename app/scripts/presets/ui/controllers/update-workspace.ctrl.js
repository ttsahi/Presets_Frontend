/**
 * Created by tzachit on 15/12/14.
 */

(function(app){

  'use strict';

  app.controller('updateWorkspaceController', ['$scope',
    function($scope){

      var preset = $scope.preset;

      $scope.workspace = {
        name: null,
        description: null,
        expires: new Date()
      };

      $scope.datepicker = {
        minDate: new Date(),
        format: 'dd-MM-yyyy',
        dateOptions: {
          formatYear: 'yy',
          startingDay: 1
        }
      };

      $scope.firstUpdate = true;
      $scope.formErrors = [];
      var selectedWorkspacePos = null;

      $scope.today = function() {
        $scope.workspace.expires = new Date();
      };

      $scope.nextWeek = function(){
        $scope.workspace.expires = new Date((new Date().getTime() + 1000 * 60 * 60 * 24 * 7));
      };

      $scope.clear = function () {
        $scope.workspace.expires = null;
      };

      $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.datepicker.opened = true;
      };

      $scope.$on('initUpdate', function(event, currentWorkspace){
        $scope.firstUpdate = true;

        for(var i = 0; i < preset.workspacesList.length; i++){
          if(preset.workspacesList[i].id === currentWorkspace.id){
            selectedWorkspacePos = i;
            break;
          }
        }

        $scope.workspace = {
          id: currentWorkspace.id,
          name: currentWorkspace.name,
          description: currentWorkspace.description,
          expires: currentWorkspace.expires
        };
        $scope.formErrors = [];
      });

      $scope.updateWorkspace = function(form, workspace){
        $scope.firstUpdate = false;

        if(form.$valid){
          preset.updateWorkspaceAsync(workspace.id, workspace, preset.useCache ? false : true).then(
            function success(){
              $scope.firstUpdate = true;
              $scope.setSelectedWorkspace(preset.workspacesList[selectedWorkspacePos]);
              $scope.enterUpdateMode();
            }, function error(result){
              console.log(result);
              $scope.formErrors = result.errors;
            }
          );
        }
      };

      $scope.delete = function(workspace){
        preset.removeWorkspaceAsync(workspace.id, preset.useCache ? false : true).then(
          function success(){
            $scope.firstUpdate = true;
            $scope.setSelectedWorkspace(null);
            $scope.enterUpdateMode();
          }, function error(result){
            console.log(result);
            $scope.formErrors = result.errors;
          }
        );
      };

      $scope.cancel = function(){
        $scope.firstUpdate = true;
        $scope.enterUpdateMode();
      };
    }
  ]);

}(angular.module('presetsApp')));

/**
 * Created by tzachit on 15/12/14.
 */

(function(app){

  'use strict';

  app.controller('addWorkspaceController', ['$scope',
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

      $scope.firstCreate = true;
      $scope.formErrors = [];

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

      $scope.$on('initCreation', function(){
        $scope.firstCreate = true;
        $scope.workspace = {
          name: null,
          description: null,
          expires: new Date()
        };
        $scope.nextWeek();
        $scope.formErrors = [];
      });

      $scope.createWorkspace = function(form, worksapce){
        $scope.firstCreate = false;

        if(form.$valid){
          worksapce.id = 'xxx';
          worksapce.modified = new Date();
          worksapce.rows = 4;
          worksapce.cols = 5;

          preset.addWorkspaceAsync(worksapce, true).then(
            function success(){
              $scope.setSelectedWorkspace(preset.workspacesArr[preset.workspacesArr.length - 1]);
              $scope.firstCreate = true;
              $scope.enterAddMode();
            }, function error(result){
              $scope.formErrors = result.errors;
            }
          );
        }
      };

      $scope.cancel = function(){
        $scope.firstCreate = true;
        $scope.enterAddMode();
      };
    }
  ]);

}(angular.module('presetsApp')));

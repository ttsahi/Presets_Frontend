/**
 * Created by tzachit on 22/12/14.
 */

(function(app){

  'use strict';

  app.controller('updateTileController', ['$scope', '$q',
    function($scope, $q){

      var workspaceData = $scope.workspaceData;
      var preset = $scope.workspaceData.preset;
      var validationCallback = function(){ return true; };

      var tile = workspaceData.tiles[$scope.position - 1];
      var tileType = preset.types[tile.type];
      $scope.model = tile.model;


      $scope.isUpdateTemplateLoaded = false;
      $scope.loadTemplateDeferred = $q.defer();

      $scope.loadTemplateDeferred.promise.then(
        function resolveSuccess(result){
          $scope.isUpdateTemplateLoaded = true;
        }, function resolveError(reason){
          console.log('can\'t load update tile template ' + reason);
        }
      );

      $scope.creationInfo = tileType.creationInfo;

      $scope.onModelValidation = function(callback){
        if(typeof callback !== 'function'){
          return;
        }
        validationCallback = callback;
      };

      $scope.update = function(){
        if(validationCallback() !== true){
          return;
        }

        workspaceData.updateTileByPositionAsync($scope.position, $scope.model, preset.useCache ? false : true).then(
          function resolveSuccess(result){
            workspaceData.enterDragDropMode();
          }, function resolveError(reason){
            console.log('tile update failed' + reason);
          }
        );
      };

      $scope.delete = function(){
        workspaceData.removeTileByPositionAsync($scope.position, preset.useCache ? false : true).then(
          function resolveSuccess(result){
            workspaceData.enterDragDropMode();
          }, function resolveError(reason){
            console.log('tile delete failed' + reason);
          }
        );
      };

      $scope.cancel = function(){
        workspaceData.enterDragDropMode();
      };
    }
  ]);


}(angular.module('presetsApp')));

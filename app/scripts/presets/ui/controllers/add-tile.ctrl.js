/**
 * Created by tzachit on 22/12/14.
 */

(function(app){

  'use strict';

  app.controller('addTileController', ['$scope',
    function($scope){

      $scope.typeSelected = false;

      var workspaceData = $scope.workspaceData;
      var preset = $scope.workspaceData.preset;

      var tile = {
        id: workspaceData.preset.generateId(),
        position: $scope.position,
        size: { width: 1, height: 1}
      };

      $scope.tilesTypes = [];
      angular.forEach(preset.types, function(value){
        $scope.tilesTypes.push(value);
      });

      $scope.next = function(tileType){
        tile.type = tileType.name;
        $scope.creationInfo = tileType.creationInfo;
        $scope.typeSelected = true;
      };

      $scope.create = function(){
        tile.model = $scope.model;
        workspaceData.addTileAsync(tile, preset.useCache ? false : true).then(
          function resolveSuccess(result){
            workspaceData.enterEditMode();
          }, function resolveError(reason){
            console.log('tile creation failed' + reason);
          }
        );
      };

      $scope.cancel = function(){
        workspaceData.enterEditMode();
      };

    }
  ]);

}(angular.module('presetsApp')));

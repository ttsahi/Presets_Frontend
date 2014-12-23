/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict'

  app.controller('presetsController', ['$scope', 'Preset',
    function($scope, Preset){

      $scope.preset = new Preset();

      $scope.preset.registerType({
        name: 'person',
        creationInfo: {
          template: '<div><h1>Person creation template</h1></div>',
          controller: ['$scope', function($scope){
            $scope.model.latName = 'tal';
          }]
        },
        presentationInfo: {
          template: '<div><h1>Person presentation info</h1></div>' +
                    '<div><h2>name: {{name}}</h2></div>' +
                    '<div><h2>age: {{age}}</h2></div>'
        }
      });

      /*
      $scope.preset.registerType({
        name: 'web',
        creationInfo: {},
        presentationInfo: {}
      });

      $scope.preset.registerTypes([{
        name: 'workspaceDescriptor',
        creationInfo: {},
        presentationInfo: {}
      }]);

      console.log($scope.preset.types);

      $scope.preset.addWorkspaceAsync({
        id: 'jdsfsd9sdf4',
        name: 'tsahi',
        modified: new Date(),
        expires: new Date(),
        description: 'blblblblblbaaa',
        rows: 4,
        cols: 5
      }, true).then(
        function(result){
          console.log(result);
          var workspaceId = result.data.id;
          $scope.preset.updateWorkspaceAsync(result.data.id, { name: 'omri'}, true).then(
            function(result){
              console.log(result);
              $scope.preset.addTileAsync(result.data.id, {
                id: 'dfsk4kdfdsf',
                position: 1,
                size: { width: 2, height: 2},
                type: 'web',
                model: { name: 'bar'}
              }).then(
                function(result){
                  console.log(result);
                  $scope.preset.updateTileAsync(workspaceId, result.data.id, {}).then(
                    function(result){
                      console.log(result);
                      $scope.preset.removeTileAsync(workspaceId, result.data.id).then(
                        function(result){
                          console.log(result);
                        }, function(reason){
                          console.log(reason);
                        }
                      );
                    }, function(reason){
                      console.log(reason);
                    }
                  );
                },function(reason){
                  console.log(reason);
                }
              );
            }
          );
        }
      );
      */

    }
  ]);

}(angular.module('presetsApp')));

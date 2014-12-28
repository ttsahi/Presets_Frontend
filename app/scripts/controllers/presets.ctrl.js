/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict'

  app.controller('presetsController', ['$scope', 'Preset',
    function($scope, Preset){

      $scope.preset = new Preset();

      $scope.preset.registerType({
        name: 'workspaceDescriptor',
        creationInfo: {
          templateUrl: 'scripts/tiles/workspace-descriptor/creation-template.html',
          controller: ['$scope', 'workspace',
            function($scope, workspace){
              $scope.model = {
                name: workspace.name,
                description: workspace.description,
                modified: workspace.modified,
                expired: workspace.expires
              };
            }
          ],
          resolve: {
            workspace: function(){
              return $scope.preset.currentWorkspace;
            }
          }
        },
        presentationInfo: {
          templateUrl: 'scripts/tiles/workspace-descriptor/presentation-template.html',
          controller: ['$scope', 'description',
            function($scope, description){
              $scope.model = description;
            }
          ],
          resolve: {
            description: function(){
              var workspace = $scope.preset.currentWorkspace;
              return {
                name: workspace.name,
                description: workspace.description,
                modified: workspace.modified,
                expired: workspace.expires
              }
            }
          }
        }
      });
    }
  ]);

}(angular.module('presetsApp')));

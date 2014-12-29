/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  app.controller('presetsController', ['$scope', 'Preset',
    function($scope, Preset){

      $scope.preset = new Preset();

      $scope.preset.registerType({
        name: 'workspace descriptor',
        creationInfo: {
          templateUrl: 'views/tiles/workspace-descriptor/creation-template.html',
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
          templateUrl: 'views/tiles/workspace-descriptor/presentation-template.html',
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

      $scope.preset.registerType({
        name: 'web page',
        creationInfo: {
          templateUrl: 'views/tiles/web-page/creation-template.html',
          controller: ['$scope',
            function($scope){
              $scope.onModelValidation(function(){
                return angular.isDefined($scope.model.pageUrl) && $scope.webPageForm.$valid;
              });
            }
          ]
        },
        presentationInfo: {
          templateUrl: 'views/tiles/web-page/presentation-template.html',
          controller: ['$scope', '$sce',
            function($scope, $sce){
              $scope.$watch('model.pageUrl', function(newUrl){
                $scope.url = $sce.trustAsResourceUrl(newUrl);
              });
            }
          ]
        }
      });

      $scope.preset.registerType({
        name: 'file',
        creationInfo: {
          templateUrl: 'views/tiles/file/creation-template.html',
          controller: ['$scope',
            function($scope){
              $scope.onModelValidation(function(){
                return angular.isDefined($scope.model.fileUrl) && $scope.fileForm.$valid;
              });
            }
          ]
        },
        presentationInfo: {
          templateUrl: 'views/tiles/file/presentation-template.html',
          controller: ['$scope', '$sce',
            function($scope, $sce){
              $scope.url = $sce.trustAsResourceUrl($scope.model.fileUrl);
            }
          ]
        }
      });

      var maps = {};

      $scope.preset.registerType({
        name: 'map',
        creationInfo: {
          templateUrl: 'views/tiles/map/creation-template.html',
          controller: ['$scope', 'preset',
            function($scope, preset){
              $scope.model.mapId = preset.generateId();
            }
          ],
          resolve: {
            preset: function(){
              return $scope.preset;
            }
          }
        },
        presentationInfo: {
          templateUrl: 'views/tiles/map/presentation-template.html',
          controller: ['$scope', 'Map',
            function($scope, Map){
              $scope.mapId = $scope.model.mapId;

              $scope.ready = function(){
                maps[$scope.mapId] = new Map($scope.mapId);
              };
            }
          ]
        }
      });

      $scope.preset.onWorkspaceChanged = function(){
        angular.forEach(maps, function(map){
          map._viewer.destroy();
        });
        maps = {};
      };

      $scope.preset.onRemoveTile = function(workspace, tile){
        if(tile.type === 'map'){
          maps[tile.model.mapId]._viewer.destroy();
          delete maps[tile.model.mapId];
        }
      };
    }
  ]);

}(angular.module('presetsApp')));

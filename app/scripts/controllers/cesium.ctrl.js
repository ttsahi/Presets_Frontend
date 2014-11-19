/**
 * Created by tzachit on 18/11/14.
 */

(function(app){

  'use strict';

  app.controller('cesiumController', ['$scope', '$http', '$distribution', 'tracksRepository', 'Map', 'TracksFactory', 'CollectionManager',
    function($scope, $http, $distribution, tracksRepository, Map, TracksFactory, CollectionManager){

      var map = new Map('cesiumContainer');

      var tracksFactory = new TracksFactory(map, 'images/airplane-4-256.png', 500);

      $scope.manager = new CollectionManager();

      $scope.manager.setCapacity(20);

      $scope.manager.onready = function(){

        tracksRepository.onupdate = function(tracks){

          for(var i = 0; i < tracks.length; i++){
            var track = tracks[i];
            tracksFactory.createOrUpdate(track.id, track.status, track.location, 50, 50);
          }

          for(var i = 0; i < tracks.length; i++){
            $scope.manager.addOrUpdate(tracks[i]);
          }
        };

      };

      $scope.startDistribution = function(){
        $http.get('http://localhost:9000/api/distribution/start').
          success(function(data, status, headers, config) {
            //alert(data);
          }).
          error(function(data, status, headers, config) {
            alert('Error while tray to start distribution!');
          });
      };

      $scope.stopDistribution = function(){
        $http.get('http://localhost:9000/api/distribution/stop').
          success(function(data, status, headers, config) {
            //alert(data);
          }).
          error(function(data, status, headers, config) {
            alert('Error while tray to stop distribution!');
          });
      };

      $scope.openConnection = function(){
        $distribution.start();
      };

      $scope.closeConnection = function(){
        $distribution.stop();
      };
    }
  ]);

}(angular.module('presetsApp')));

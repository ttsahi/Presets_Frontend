/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict'

  app.controller('presetsController', ['$scope', 'Preset',
    function($scope, Preset){

      $scope.preset = new Preset({
        cache: true,
        lifetime: Number.MAX_VALUE
      });

    }
  ]);

}(angular.module('presetsApp')));

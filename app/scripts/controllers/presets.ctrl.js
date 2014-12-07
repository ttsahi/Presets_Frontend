/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict'

  app.controller('presetsController', ['$scope',
    function($scope){

      $scope.tileExampModel = {
        name: 'TTT'
      };

      $scope.tileExamp = {
        template: '<div><h1>{{name}}</h1></div>',
        controller: ['$scope',
          function($scope){
            //$scope.name = 'Tsahi';
          }
        ]
      };
    }
  ]);

}(angular.module('presetsApp')));

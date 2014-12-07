/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  app.directive('presets', [
    function(){
      return {
        restrict: 'EA',
        replace: true,
        templateUrl: 'templates/presets.drv.tmp.html',
        controller: ['$scope',
          function($scope){

          }
        ]
      };
    }
  ]);

}(angular.module('presetsApp')));

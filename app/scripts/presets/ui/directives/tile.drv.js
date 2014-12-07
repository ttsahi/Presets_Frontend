/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  app.directive('tile', [
    function(){
      return {
        restrict: 'EA',
        replace: true,
        require: '^workspace',
        template: '<div style="background-color: gainsboro; width: 100%; height: 100%"></div>'
      };
    }
  ]);

}(angular.module('presetsApp')));

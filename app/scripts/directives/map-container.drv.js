/**
 * Created by tzachit on 28/12/14.
 */

(function(app){

  'use strict';

  app.directive('mapContainer', [
    function(){
      return {
        restrict: 'EA',
        replace: true,
        template: '<div></div>',
        link: function(scope, element, attrs){
          var id = attrs.mapContainer;

          if(typeof id !== 'string' || id.trim() === ''){
            throw 'invalid map id';
          }

          element.append('<div id="' + id + '"></div>');
          setTimeout(function(){
            scope.$evalAsync(attrs.onready);
          }, 0);
        }
      };
    }
  ]);

}(angular.module('presetsApp')));

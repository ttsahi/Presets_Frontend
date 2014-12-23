/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  app.directive('tile', ['MVC',
    function(MVC){

      return {
        restrict: 'EA',
        replace: true,
        template: '<div class="presets-tile"></div>',
        scope:{
          tile: '='
        },
        link: function(scope, element){

          var tileInstance = null;

          scope.$watch('tile', function(tile){
            if(!angular.isObject(tile)){
              if(tileInstance !== null){
                tileInstance.element.remove();
                tileInstance.scope.$destroy();
                tileInstance = null;
              }
            }
          });

          scope.$watch('tile.presentationInfo', function(creationInfo){
            if(angular.isObject(creationInfo)){

              if(tileInstance !== null){
                tileInstance.element.remove();
                tileInstance.scope.$destroy();
                tileInstance = null;
              }

              MVC.create(scope, creationInfo, scope.tile.model, true, true).then(
                function(instance){
                  tileInstance = instance;
                  element.append(tileInstance.element);
                },
                function(failed){
                  console.log('Tail creation failed, info: ' + failed);
                }
              );
            }

          }, true);

          scope.$watch('tile.model', function(model){
            if(tileInstance !== null && angular.isObject(model)){
              angular.forEach(model, function(value, property){
                tileInstance.scope[property] = value;
              });
            }

          }, true);
        }
      };
    }
  ]);

}(angular.module('presetsApp')));

/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  function DeveloperError(message){
    this.message = message;
  }

  app.directive('tile', ['MVC',
    function(MVC){

      return {
        restrict: 'EA',
        replace: true,
        //require: '^workspace',
        template: '<div class="presets-tile"></div>',
        scope:{
          tile: '=',
          model: '='
        },
        link: function(scope, element){

          var creationInfo = scope.tile;
          var model = scope.model;
          var tile = null;

          var create = function(){

            MVC.create(scope, creationInfo, model).then(
              function(instance){
                tile = instance;
                console.log(tile);
                element.append(tile.element);
              },
              function(failed){
                console.log(failed);
              }
            );
          };

          if(angular.isObject(creationInfo)){
            create();
          }
        }
      };
    }
  ]);

}(angular.module('presetsApp')));

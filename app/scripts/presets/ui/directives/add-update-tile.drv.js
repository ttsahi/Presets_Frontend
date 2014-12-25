/**
 * Created by tzachit on 22/12/14.
 */

(function(app){

  'use strict';

  app.directive('addUpdateTile', ['MVC',
    function(MVC){

      return {
        restrict: 'EA',
        replace: true,
        template: '<div></div>',
        link: function(scope, element){

          var createInstance = null;

          scope.$watch('creationInfo', function(creationInfo){

            if(angular.isObject(creationInfo)){

              if(createInstance !== null){
                createInstance.element.remove();
                createInstance.scope.$destroy();
                createInstance = null;
              }

              MVC.create(scope, creationInfo, {model: scope.model, onModelValidation: scope.onModelValidation}, true, true).then(
                function(instance){
                  createInstance = instance;
                  element.append(createInstance.element);
                  scope.loadTemplateDeferred.resolve(instance);
                },
                function(reason){
                  console.log('unable to load tile creation or update template: ' + reason);
                  scope.loadTemplateDeferred.reject(reason);
                }
              );
            }

          });
        }
      };
    }
  ]);

}(angular.module('presetsApp')));

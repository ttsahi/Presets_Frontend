/**
 * Created by tzachit on 08/12/14.
 */

(function(app){

  'use strict';

  app.factory('MVC', ['$injector', '$q', '$http', '$templateCache', '$controller', '$compile',
    function($injector, $q, $http, $templateCache, $controller, $compile){

      function DeveloperError(message){
        this.message = message;
      }

      function getTemplatePromise(creationInfo) {
        return creationInfo.template ? $q.when(creationInfo.template) :
          $http.get(angular.isFunction(creationInfo.templateUrl) ? (creationInfo.templateUrl)() : creationInfo.templateUrl,
            {cache: $templateCache}).then(function (result) {
              return result.data;
            });
      }

      function getResolvePromises(resolves) {
        var promisesArr = [];
        angular.forEach(resolves, function (value) {
          if (angular.isFunction(value) || angular.isArray(value)) {
            promisesArr.push($q.when($injector.invoke(value)));
          }
        });
        return promisesArr;
      }

      function create(scope, creationInfo, model, newScope, isolate, compile){

        var creationDeferred = $q.defer();

        if(!angular.isObject(creationInfo)){
          throw new DeveloperError('Bad creation info!');
        }

        if (!creationInfo.template && !creationInfo.templateUrl) {
          throw new DeveloperError('One of template or templateUrl options is required.');
        }

        var templateAndResolvePromise =
          $q.all([getTemplatePromise(creationInfo)].concat(getResolvePromises(creationInfo.resolve)));

        templateAndResolvePromise.then(function resolveSuccess(tplAndVars) {

          var childScope = null;

          if(newScope === true) {
            if (isolate === true) {
              childScope = scope.$new(true);
            } else {
              childScope = scope.$new();
            }
          }else{
            childScope = scope;
          }

          var dataModel = model;

          if(angular.isObject(dataModel)){
            angular.forEach(dataModel, function(value, property){
              childScope[property] = value;
            });
          }

          var controllerInstance = null;
          var controllerLocals = {};
          var resolveIter = 1;

          if (creationInfo.controller) {
            controllerLocals.$scope = childScope;
            angular.forEach(creationInfo.resolve, function (value, key) {
              controllerLocals[key] = tplAndVars[resolveIter++];
            });

            controllerInstance = $controller(creationInfo.controller, controllerLocals);
            if (creationInfo.controllerAs) {
              childScope[creationInfo.controllerAs] = controllerInstance;
            }
          }

          var element = null;

          if(compile === false){
            element = angular.element(tplAndVars[0]);
          }else{
            element = $compile(tplAndVars[0])(childScope);
          }

          creationDeferred.resolve({
            scope: childScope,
            element: element
          });

        }, function resolveError(reason) {
          creationDeferred.reject(false);
        });

        return creationDeferred.promise;
      }

      return {
        create: create
      };
    }
  ]);

}(angular.module('presetsApp')));

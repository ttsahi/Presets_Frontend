/**
 * Created by tzachit on 25/11/14.
 */

(function(app){

  'use strict';

  function DeveloperError(message){
    this.message = message;
  }

  app.directive('tile', ['$injector', '$q', '$http', '$templateCache', '$controller', '$compile',
    function($injector, $q, $http, $templateCache, $controller, $compile){

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

      function createTile(scope, element, creationInfo, model){

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

          var tileScope = scope.$new();

          var dataModel = model;

          if(angular.isObject(dataModel)){
            angular.forEach(dataModel, function(value, property){
              tileScope[property] = value;
            });
          }

          var controllerInstance = null;
          var controllerLocals = {};
          var resolveIter = 1;

          if (creationInfo.controller) {
            controllerLocals.$scope = tileScope;
            angular.forEach(creationInfo.resolve, function (value, key) {
              controllerLocals[key] = tplAndVars[resolveIter++];
            });

            controllerInstance = $controller(creationInfo.controller, controllerLocals);
            if (creationInfo.controllerAs) {
              tileScope[creationInfo.controllerAs] = controllerInstance;
            }
          }

          var html = $compile(tplAndVars[0])(tileScope);

          element.append(html);

          creationDeferred.resolve(tileScope);

        }, function resolveError(reason) {
          console.log(reason);
          creationDeferred.reject(false);
        });

        return creationDeferred.promise;
      }

      return {
        restrict: 'EA',
        replace: true,
        //require: '^workspace',
        template: '<div class="presets-tile"></div>',
        scope:{
          tile: '=',
          model: '='
        },
        link: function(scope, element, attrs){

          var creationInfo = scope.tile;
          var model = scope.model;
          var tileScope = null;

          var creationResult = createTile(scope, element, creationInfo, model);

          creationResult.then(
            function(scope){
              tileScope = scope;
              console.log(tileScope);
            },
            function(failed){
              console.log(failed);
            }
          );
        }
      };
    }
  ]);

}(angular.module('presetsApp')));

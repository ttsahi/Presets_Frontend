/**
 * Created by tzachit on 14/12/14.
 */

(function(app){

  'use strict';

  app.directive('date', function (){
    return {
      require: 'ngModel',
      link: function(scope, elem, attr, ngModel) {

        //For DOM -> model validation
        ngModel.$parsers.unshift(function(value) {
          var valid = (value instanceof Date) || ((new Date(value)) instanceof Date);
          ngModel.$setValidity('date', valid);
          return valid ? value : undefined;
        });

        //For model -> DOM validation
        ngModel.$formatters.unshift(function(value) {
          ngModel.$setValidity('date', (value instanceof Date) || ((new Date(value)) instanceof Date));
          return value;
        });
      }
    };
  });

}(angular.module('presetsApp')));

'use strict';

/**
 * @ngdoc function
 * @name presetsApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the presetsApp
 */
angular.module('presetsApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });

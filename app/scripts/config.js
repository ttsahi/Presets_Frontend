/**
 * Created by tzachit on 16/11/14.
 */

(function(app){

    'use strict';

    app.config(['$stateProvider', '$urlRouterProvider',
        function($stateProvider, $urlRouterProvider){

          $urlRouterProvider.otherwise('/');

          $stateProvider
            .state('cesium', {
              url: '/',
              templateUrl: 'views/cesium.html',
              controller: 'cesiumController'
            })
            .state('presets', {
              url: '/presets',
              templateUrl: 'views/presets.html',
              controller: 'presetsController'
            });
        }
    ]).config(['$distributionProvider',
      function($distributionProvider){

        $distributionProvider.setSocketUrl('ws://localhost:9000/api/sockets/add');
        $distributionProvider.allowNotifications (false);
      }
    ]);

}(angular.module('presetsApp')));

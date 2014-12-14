(function(){

    'use strict';

    /**
     * @ngdoc overview
     * @name presetsApp
     * @description
     * # presetsApp
     *
     * Main module of the application.
     */
    angular
        .module('presetsApp', [
            'ngAnimate',
            'ngSanitize',
            'ngMessages',
            'ui.router',
            'ui.bootstrap',
            'restangular',
            'annapolis-data',
            'annapolis-map',
            'annapolis-ui'
        ]);

}());

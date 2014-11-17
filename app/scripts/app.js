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
            'ui.router',
            'restangular',
            'annapolis-data',
            'annapolis-map'
        ]);

}());

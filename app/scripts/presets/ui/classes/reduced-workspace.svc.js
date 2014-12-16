/**
 * Created by tzachit on 16/12/14.
 */

(function(app){

  'use strict';

  app.factory('ReducedWorkspace', [
    function(){

      function ReducedWorkspace(id, name){
        this._id = id;
        this._name = name;
      }

      ReducedWorkspace.prototype.init = function(args){
        if(typeof args !== 'object') return;
        this._id = args.id;
        this._name = args.name;
      };

      Object.defineProperties(ReducedWorkspace.prototype, {
        id: {
          get: function(){ return this._id ;},
          set: function(val){ this._id = val; }
        },
        name: {
          get: function(){ return this._name ;},
          set: function(val){ this._name = val; }
        }
      });

      return ReducedWorkspace;
    }
  ]);

}(angular.module('presetsApp')));

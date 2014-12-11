/**
 * Created by tzachit on 11/12/14.
 */

(function(app){

  'use strict';

  app.factory('CRUDResult', [
    function(){

      function CRUDResult(succeeded, data, errors){
        this._succeeded = succeeded || false;
        this._data = data || {};
        this._errors = errors || [];
      }

      Object.defineProperties(CRUDResult.prototype, {
        succeeded: {
          get: function(){ return this._succeeded; },
          set: function(val) { this._succeeded = val; }
        },
        data: {
          get: function(){ return this._data; },
          set: function(val) { this._data = val; }
        },
        errors: {
          get: function(){ return this._errors; },
          set: function(val) { this._errors = val; }
        }
      });

      return CRUDResult;
    }
  ]);

}(angular.module('presetsApp')));

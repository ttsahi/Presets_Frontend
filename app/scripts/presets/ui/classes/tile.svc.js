/**
 * Created by tzachit on 09/12/14.
 */

(function(app){

  'use strict';

  app.factory('Tile', [
    function(){

      function Tile(id, position, size, type, model){
        this._id = id;
        this._position = position;
        this._size = size;
        this._type = type;
        this._model = model;
      }

      Tile.prototype.init = function(args){
        if(typeof args !== 'object') return;
        this._id = args.id;
        this._position = args.position;
        this._size = args.size;
        this._type = args.type;
        this._model = args.model;
      };

      Object.defineProperties(Tile.prototype, {
        id: {
          get: function(){ return this._id; },
          set: function(val){ this._id = val; }
        },
        position: {
          get: function(){ return this._position; },
          set: function(val){ this._position = val; }
        },
        size: {
          get: function(){ return this._size; },
          set: function(val){ this._size = val; }
        },
        type: {
          get: function(){ return this._type; },
          set: function(val){ this._type = val; }
        },
        model: {
          get: function(){ return this._model; },
          set: function(val){ this._model = val; }
        }
      });

      return Tile;
    }
  ]);

}(angular.module('presetsApp')));

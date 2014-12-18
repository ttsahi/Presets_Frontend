/**
 * Created by tzachit on 17/12/14.
 */

(function(app){

  'use strict';

  app.factory('TileSize', [
    function(){

      function TileSize(width, height){
        this._width = width;
        this._height = height;
      }

      TileSize.prototype.init = function(args){
        this._width = args.width;
        this._height = args.height;
      };

      Object.defineProperties(TileSize.prototype, {
        width: {
          get: function(){ return this._width; },
          set: function(val) { this._width = val; }
        },
        height: {
          get: function(){ return this._height; },
          set: function(val) { this._height = val}
        }
      });

      return TileSize;
    }
  ]);

}(angular.module('presetsApp')));

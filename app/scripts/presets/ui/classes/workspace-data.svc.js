/**
 * Created by tzachit on 08/12/14.
 */

(function(app){

  'use strict';

  app.factory('WorkspaceData', ['$q', 'CRUDResult', 'Tile',
    function($q, CRUDResult, Tile){

      function DeveloperError(message){
        this.message = message;
      }

      function WorkspaceData(preset, rows, cols, tiles){
        this._cols = cols;
        this._rows = rows;
        this._tilesMap = {};
        this._tiles = [];
        this._panels = [];
        this._preset = preset;
        this._initTiles = tiles || [];

        //this._enterEditMode = function(){};

        this._enterAddMode = function(){};
        this._enterUpdateMode = function(){};
        this._enterPresentationMode = function(){};
      }

      WorkspaceData.prototype.init = function(){

        var tilesCount = this._rows * this._cols;

        for(var i = 0; i < tilesCount; i++){
          this._tiles[i] = null;
        }

        while(this._initTiles.length !== 0){
          this.addTileAsync(this._initTiles.pop());
        }
      };

      Object.defineProperties(WorkspaceData.prototype,{
        rows: {
          get: function(){ return this._rows; }
        },
        cols: {
          get: function(){ return this._cols; }
        },
        tiles: {
          get: function(){ return this._tiles; }
        },
        panels: {
          get: function(){ return this._panels; }
        },
        presets: {
          get: function(){ return this._preset; }
        }
      });

      Object.defineProperties(WorkspaceData.prototype,{
        enterAddMode: {
          set: function(val) { this._enterAddMode = val; },
          get: function() { return this._enterAddMode; }
        },
        enterUpdateMode: {
          set: function(val) { this._enterUpdateMode = val; },
          get: function() { return this._enterUpdateMode; }
        },
        enterPresentationMode: {
          set: function(val) { this._enterPresentationMode = val; },
          get: function() { return this._enterPresentationMode; }
        }
      });

      function isNullOrUndefined(value){
        return value === null || value === undefined;
      }

      function isNullEmptyOrWhiteSpaces(str){
        return typeof str !== 'string' || str.trim() === '';
      }

      function validateTile(tile){
        if(typeof tile !== 'object') {
          throw new DeveloperError('invalid tile!');
        }

        if(!tile instanceof Tile){
          var temp = new Tile();
          temp.init(tile);
          tile = temp;
        }

        if(isNullEmptyOrWhiteSpaces(tile.id)){
          throw new DeveloperError('tile id must be non empty string!');
        }

        if(typeof this._panels[tile.position - 1] === 'undefined' || this._panels[tile.position - 1].inUse){
          throw new DeveloperError('invalid tile position!');
        }

        if(isNullEmptyOrWhiteSpaces(tile.type) || isNullOrUndefined(this._preset.types[tile.type])){
          throw new DeveloperError('invalid tile type!');
        }

        tile.id = tile.id.trim();
        return tile;
      }

      WorkspaceData.prototype.addTileAsync = function(tile, confirm){
        tile = validateTile(tile);
        var self = this;
        var deferred = $q.defer();

        if(this._preset.types[tile.type] === undefined){
          deferred.reject(new CRUDResult(false, {}, ['tile type: ' + tile.type + 'not found!']));
          return deferred.promise;
        }

        var type = this._preset.types[tile.type];

        $q.when(confirm === true ? type.confirmAdd(tile) : new CRUDResult(true)).then(
          function resolveSuccess(result){

            if(!result instanceof CRUDResult){
              throw new DeveloperError('confirm add must return CRUDResult!');
            }

            if(result.succeeded === true){
              if(self._tilesMap[tile.id] !== undefined){
                deferred.reject(new CRUDResult(false, {}, ['tile id: ' + tile.id + ' already exist!']));
              }

              self._tiles[tile.position -1] = angular.copy(validateTile(tile));
              self._tilesMap[tile.id] = (tile.position -1);
              self._panels[tile.position - 1].inUse = true;
              deferred.resolve(new CRUDResult(true, tile));
            }else{
              deferred.reject(result);
            }

          },function resolveError(reason){
            deferred.reject(new CRUDResult(false, reason, ["can't add tile!"]));
          });

        return deferred.promise;
      };

      WorkspaceData.prototype.removeTileByIdAsync = function(id, confirm){

        for(var i = 0; i < this._tiles.length; i++){
          if(this._tiles[i].id === id){
            this._panels[this._tiles[i].position - 1].inUse = false;
            this._tiles[i] = null;
            return true;
          }
        }

        return false;
      };

      WorkspaceData.prototype.removeTileByPositionAsync = function(position, confirm){

        if(!isNullOrUndefined(this._tiles[position -1])){
          this._panels[position -1].inUse = false;
          this._tiles[position -1] = null;
          return true;
        }

        return false;
      };

      WorkspaceData.prototype.updateTileByIdAsync = function(id, model, confirm){

        if(!angular.isObject(model)){
          throw new DeveloperError('model must be object!');
        }

        for(var i = 0; i < this._tiles.length; i++){
          if(this._tiles[i].id === id){
            this._tiles[i].model = model;
            return true;
          }
        }

        return false;
      };

      WorkspaceData.prototype.updateTileByPositionAsync = function(position, model, confirm){

        if(!angular.isObject(model)){
          throw new DeveloperError('model must be object!');
        }

        if(!isNullOrUndefined(this._tiles[position -1])){
          this._tiles[position -1].model = model;
          return true;
        }

        return false;
      };

      return WorkspaceData;
    }
  ]);

}(angular.module('presetsApp')));

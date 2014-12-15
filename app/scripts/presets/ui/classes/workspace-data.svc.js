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

      function WorkspaceData(preset, workspace, tiles){
        this._tilesMap = {};
        this._tiles = [];
        this._panels = [];
        this._preset = preset;
        this._workspace = workspace;
        this._cols = workspace.cols;
        this._rows = workspace.rows;
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

        if(isNullEmptyOrWhiteSpaces(tile.type)){
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

        var clonedWorkspace = angular.copy(this._workspace);
        var type = this._preset.types[tile.type];

        $q.when(confirm === true ? type.confirmAdd(clonedWorkspace, tile) : new CRUDResult(true)).then(
          function resolveSuccess(result){

            if(!result instanceof CRUDResult){
              throw new DeveloperError('confirm add must return CRUDResult!');
            }

            if(result.succeeded === true){
              tile = validateTile(tile);

              if(tile.type !== type.name){
                deferred.reject(new CRUDResult(false, {}, ['invalid tile type!']));
                return deferred.promise;
              }

              tile.creationInfo = type.creationInfo;
              self._tiles[tile.position -1] = angular.copy(tile);
              self._tilesMap[tile.id] = (tile.position -1);
              self._panels[tile.position - 1].inUse = true;
              delete tile.creationInfo;
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
        var self = this;
        var deferred = $q.defer();

        if(this._tilesMap[id] === undefined){
          deferred.reject(new CRUDResult(false, {}, ['tile id: ' + id + 'not found!']));
          return deferred.promise;
        }

        var tile = this._tiles[this._tilesMap[id]];
        var type = this._preset.types[tile.type];

        $q.when(confirm === true ? type.confirmRemove(angular.copy(tile)) : new CRUDResult(true)).then(
          function resolveSuccess(result){

            if(!result instanceof CRUDResult){
              throw new DeveloperError('confirm remove must return CRUDResult!');
            }

            if(result.succeeded === true){
              self._tiles[tile.position - 1] = null;
              delete self._tilesMap[tile.id];
              delete tile.creationInfo;
              deferred.resolve(new CRUDResult(true, tile));
            }else{
              deferred.reject(result);
            }

          },function resolveError(reason){
            deferred.reject(new CRUDResult(false, reason, ["can't remove tile!"]));
          });

        return deferred.promise;
      };

      WorkspaceData.prototype.removeTileByPositionAsync = function(position, confirm){
        var self = this;
        var deferred = $q.defer();

        if(this._tiles[position - 1] === null){
          deferred.reject(new CRUDResult(false, {}, ['tile already removed!']));
          return deferred.promise;
        }

        var tile = this._tiles[position -1];
        var type = this._preset.types[tile.type];

        $q.when(confirm === true ? type.confirmRemove(angular.copy(tile)) : new CRUDResult(true)).then(
          function resolveSuccess(result){

            if(!result instanceof CRUDResult){
              throw new DeveloperError('confirm remove must return CRUDResult!');
            }

            if(result.succeeded === true){
              self._tiles[tile.position - 1] = null;
              delete self._tilesMap[tile.id];
              delete tile.creationInfo;
              deferred.resolve(new CRUDResult(true, tile));
            }else{
              deferred.reject(result);
            }

          },function resolveError(reason){
            deferred.reject(new CRUDResult(false, reason, ["can't remove tile!"]));
          });

        return deferred.promise;
      };

      WorkspaceData.prototype.updateTileByIdAsync = function(id, model, confirm){
        var self = this;
        var deferred = $q.defer();

        if(this._tilesMap[id] === undefined){
          deferred.reject(new CRUDResult(false, {}, ['tile id: ' + id + 'not found!']));
          return deferred.promise;
        }

        var tile = this._tiles[this._tilesMap[id]];
        var clonedTile = angular.copy(tile);

        if(typeof model !== 'object'){
          deferred.reject(new CRUDResult(false, clonedTile, ['nothing to update!']));
          return deferred.promise;
        }

        clonedTile.model = model;
        var clonedWorkspace = angular.copy(this._workspace);
        var type = this._preset.types[tile.type];

        $q.when(confirm === true ? type.confirmUpdate(clonedWorkspace, clonedTile) : new CRUDResult(true)).then(
          function resolveSuccess(result){

            if(!result instanceof CRUDResult){
              throw new DeveloperError('confirm update must return CRUDResult!');
            }

            if(result.succeeded === true){
              tile.model = angular.copy(model);
              delete clonedTile.creationInfo;
              deferred.resolve(new CRUDResult(true, clonedTile));
            }else{
              deferred.reject(result);
            }

          },function resolveError(reason){
            deferred.reject(new CRUDResult(false, reason, ["can't update tile!"]));
          });

        return deferred.promise;
      };

      WorkspaceData.prototype.updateTileByPositionAsync = function(position, model, confirm){
        var self = this;
        var deferred = $q.defer();

        if(this._tiles[position - 1] === null){
          deferred.reject(new CRUDResult(false, {}, ['tile not found!']));
          return deferred.promise;
        }

        var tile = this._tiles[position - 1];
        var clonedTile = angular.copy(tile);

        if(typeof model !== 'object'){
          deferred.reject(new CRUDResult(false, clonedTile, ['nothing to update!']));
          return deferred.promise;
        }

        clonedTile.model = model;
        var clonedWorkspace = angular.copy(this._workspace);
        var type = this._preset.types[tile.type];

        $q.when(confirm === true ? type.confirmUpdate(clonedWorkspace, clonedTile) : new CRUDResult(true)).then(
          function resolveSuccess(result){

            if(!result instanceof CRUDResult){
              throw new DeveloperError('confirm update must return CRUDResult!');
            }

            if(result.succeeded === true){
              tile.model = angular.copy(model);
              delete clonedTile.creationInfo;
              deferred.resolve(new CRUDResult(true, clonedTile));
            }else{
              deferred.reject(result);
            }

          },function resolveError(reason){
            deferred.reject(new CRUDResult(false, reason, ["can't update tile!"]));
          });

        return deferred.promise;
      };

      return WorkspaceData;
    }
  ]);

}(angular.module('presetsApp')));

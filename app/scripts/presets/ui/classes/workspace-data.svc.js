/**
 * Created by tzachit on 08/12/14.
 */

(function(app){

  'use strict';

  app.factory('WorkspaceData', ['$q', 'presetValidators', 'CRUDResult',
    function($q, presetValidators, CRUDResult){

      function DeveloperError(message){
        this.message = message;
      }

      function WorkspaceData(preset, workspace){
        this._tilesMap = {};
        this._tiles = [];
        this._panels = [];
        this._preset = preset;
        this._workspace = workspace;
        this._cols = workspace.cols;
        this._rows = workspace.rows;
        this._initTiles = workspace.tiles;

        this._applyNewTile = function(){};
        this._resetTile = function(){};
        this._updateTile = function(){};

        this._enterAddMode = function(){};
        this._enterUpdateMode = function(){};
        this._enterPresentationMode = function(){};

        this._enterEditMode = function(){};
        this._triggerEditMode = function(){};

        this._onadddListener = function(){};
        this._onremoveListener = function(){};
        this._onupdateListener = function(){};

        this._onTileSizeChanged = function(){};
      }

      WorkspaceData.prototype.init = function(){

        var tilesCount = this._rows * this._cols;

        for(var i = 0; i < tilesCount; i++){
          this._tiles[i] = null;
        }

        while(this._initTiles.length !== 0){
          var tile = this._initTiles.pop();
          tile = validateTile(tile, this);
          var type = this._preset.types[tile.type];

          tile.presentationInfo = type.presentationInfo;
          this._tiles[tile.position -1] = angular.copy(tile);
          this._tilesMap[tile.id] = (tile.position -1);
          this._applyNewTile(tile, this._rows, this._cols, this._panels);
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
        preset: {
          get: function(){ return this._preset; }
        },
        workspaceId: {
          get: function(){ return this._workspace.id; }
        }
      });

      Object.defineProperty(WorkspaceData.prototype, 'tilesCount', {
        get: function(){
          var count = 0;
          for(var i = 0; i < this._tiles.length; i++){
            if(this._tiles[i] !== null){
              count++;
            }
          }
          return count;
        }
      });

      Object.defineProperties(WorkspaceData.prototype,{
        applyNewTile: {
          set: function(val) { this._applyNewTile = val; },
          get: function() { return this._applyNewTile; }
        },
        resetTile: {
          set: function(val) { this._resetTile = val; },
          get: function() { return this._resetTile; }
        },
        updateTile: {
          set: function(val) { this._updateTile = val; },
          get: function() { return this._updateTile; }
        },
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
        },
        enterEditMode: {
          set: function(val) { this._enterEditMode = val; },
          get: function() { return this._enterEditMode; }
        },
        triggerEditMode: {
          set: function(val) { this._triggerEditMode = val; },
          get: function() { return this._triggerEditMode; }
        }
      });

      Object.defineProperties(WorkspaceData.prototype,{
        onadd: {
          set: function(val) { this._onadddListener = val; }
        },
        onremove: {
          set: function(val) { this._onremoveListener = val; }
        },
        onupdate: {
          set: function(val) { this._onupdateListener = val; }
        },
        onTileSizeChanged: {
          get: function(){ return this._onTileSizeChanged; },
          set: function(val) { this._onTileSizeChanged = val; }
        }
      });

      var validateTile = presetValidators.validateTileByWorkspaceData;

      WorkspaceData.prototype.addTileAsync = function(tile, confirm){
        tile = validateTile(tile, this);
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
              tile = validateTile(tile, self);

              if(tile.type !== type.name){
                deferred.reject(new CRUDResult(false, {}, ['invalid tile type!']));
                return deferred.promise;
              }

              tile.presentationInfo = type.presentationInfo;
              self._tiles[tile.position -1] = angular.copy(tile);
              self._tilesMap[tile.id] = (tile.position -1);
              self._applyNewTile(tile, self._rows, self._cols, self._panels);
              delete tile.presentationInfo;
              self._onadddListener(tile);
              self._preset._onAddTile(clonedWorkspace, tile);
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
        var clonedWorkspace = angular.copy(this._workspace);
        var type = this._preset.types[tile.type];

        $q.when(confirm === true ? type.confirmRemove(clonedWorkspace, angular.copy(tile)) : new CRUDResult(true)).then(
          function resolveSuccess(result){

            if(!result instanceof CRUDResult){
              throw new DeveloperError('confirm remove must return CRUDResult!');
            }

            if(result.succeeded === true){
              self._tiles[tile.position - 1] = null;
              delete self._tilesMap[tile.id];
              delete tile.creationInfo;
              self._resetTile(tile);
              self._onremoveListener(tile);
              self._preset._onRemoveTile(clonedWorkspace, tile);
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
        var clonedWorkspace = angular.copy(this._workspace);
        var type = this._preset.types[tile.type];

        $q.when(confirm === true ? type.confirmRemove(clonedWorkspace, angular.copy(tile)) : new CRUDResult(true)).then(
          function resolveSuccess(result){

            if(!result instanceof CRUDResult){
              throw new DeveloperError('confirm remove must return CRUDResult!');
            }

            if(result.succeeded === true){
              self._tiles[tile.position - 1] = null;
              delete self._tilesMap[tile.id];
              delete tile.creationInfo;
              self._resetTile(tile);
              self._onremoveListener(tile);
              self._preset._onRemoveTile(clonedWorkspace, tile);
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
              self._updateTile(tile, angular.copy(model));
              delete clonedTile.creationInfo;
              self._onupdateListener(clonedTile);
              self._preset._onUpdateTile(clonedWorkspace, clonedTile);
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
              self._updateTile(tile, angular.copy(model));
              delete clonedTile.creationInfo;
              self._onupdateListener(clonedTile);
              self._preset._onUpdateTile(clonedWorkspace, clonedTile);
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

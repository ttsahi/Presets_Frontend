/**
 * Created by tzachit on 08/12/14.
 */

(function(app){

  'use strict';

  app.factory('WorkspaceData', ['Tile',
    function(Tile){

      function DeveloperError(message){
        this.message = message;
      }

      function WorkspaceData(presets, rows, cols, tiles){
        this._cols = cols;
        this._rows = rows;
        this._tiles = [];
        this._panels = [];
        this._presets = presets;
        this._initTiles = tiles || [];

        //this._enterEditMode = function(){};

        this._enterAddMode = function(){};
        this._enterUpdateMode = function(){};
        this._enterPresentationMode = function(){};

        this._onadd = function(){ return true; };
        this._onremove = function(){ return true; };
        this._onupdate = function(){ return true; };
      }

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
          get: function(){ return this._presets; }
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

      Object.defineProperties(WorkspaceData.prototype,{
        onadd: {
          set: function(val) {
            if(typeof val !== 'function'){
              throw new DeveloperError('on add must be function!');
            }

            this._onadd = val;
          },
          get: function() { return this._onadd; }
        },
        onremove: {
          set: function(val) {
            if(typeof val !== 'function'){
              throw new DeveloperError('on remove must be function!');
            }

            this._onaremove = val;
          },
          get: function() { return this._onremove; }
        },
        onupdate: {
          set: function(val) {
            if(typeof val !== 'function'){
              throw new DeveloperError('on update must be function!');
            }

            this._onupdate = val;
          },
          get: function() { return this._onupdate; }
        }
      });

      function isNullOrUndefined(value){
        return value === null || value === undefined;
      }

      function isNullEmptyOrWhiteSpaces(str){
        return typeof str !== 'string' || str.trim() === '';
      }

      function validateTile(tile){
        if(!tile instanceof Tile){
          throw new DeveloperError('tile must be instance of Tile!');
        }
        if(isNullEmptyOrWhiteSpaces(tile.id)){
          throw new DeveloperError('tile id must be non empty string!');
        }
        if(typeof this._panels[tile.position - 1] === 'undefined' || this._panels[tile.position - 1].inUse){
          throw new DeveloperError('invalid tile position!');
        }
        if(isNullEmptyOrWhiteSpaces(tile.type) || isNullOrUndefined(this._presets.types[tile.type])){
          throw new DeveloperError('invalid tile type!');
        }
      }

      WorkspaceData.prototype.init = function(){

        var tilesCount = this._rows * this._cols;

        for(var i = 0; i < tilesCount; i++){
          this._tiles[i] = null;
        }

        while(this._initTiles.length !== 0){
          this.addTile(this._initTiles.pop());
        }
      };

      WorkspaceData.prototype.addTile = function(tile){
        validateTile(tile);
        tile.id = tile.id.trim();
        tile.creationInfo = this._presets.types[tile.type].creationInfo;
        this._panels[tile.position - 1].inUse = true;
        this.tiles[tile.position - 1] = tile;
      };

      WorkspaceData.prototype.removeTileById = function(id){

        for(var i = 0; i < this._tiles.length; i++){
          if(this._tiles[i].id === id){
            this._panels[this._tiles[i].position - 1].inUse = false;
            this._tiles[i] = null;
            return true;
          }
        }

        return false;
      };

      WorkspaceData.prototype.removeTileByPosition = function(position){

        if(!isNullOrUndefined(this._tiles[position -1])){
          this._panels[position -1].inUse = false;
          this._tiles[position -1] = null;
          return true;
        }

        return false;
      };

      WorkspaceData.prototype.updateTileById = function(id, model){

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

      WorkspaceData.prototype.updateTileByPosition = function(position, model){

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

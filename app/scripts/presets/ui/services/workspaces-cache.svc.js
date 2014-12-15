/**
 * Created by tzachit on 15/12/14.
 */

(function(app){

  'use strict';

  app.factory('WorkspacesCache', ['$localStorage',
    function($localStorage){

      function Storage(){
        this.created = new Date();
        this.workspaces = {};
      }

      function Item(workspace, tiles){
        this.created = new Date();
        this.workspace = workspace;
        this.tiles = tiles || [];
      }

      function WorkspacesCache(presetId, lifetime){
        this._lifetime = lifetime;
        $localStorage[presetId] = new Storage();
        this._storage = $localStorage[presetId];
      }

      Object.defineProperties(WorkspacesCache.prototype, {
        lifetime: {
          get: function(){ return this._lifetime; }
        },
        count: {
          get: function(){ return Object.keys(this._workspaces).length; }
        }
      });

      WorkspacesCache.prototype.put = function(workspaceId, workspace, tiles){
        this._storage.workspaces[workspaceId] = new Item(workspace, tiles);
      };

      WorkspacesCache.prototype.delete = function(workspaceId){
        delete this._storage.workspaces[workspaceId];
      };

      WorkspacesCache.prototype.addTile = function(workspaceId, tile){
        this._storage.workspaces[workspaceId].tiles.push(tile);
      };

      WorkspacesCache.prototype.removeTile = function(workspaceId, tileId){
        for(var i = 0; i < this._storage.workspaces[workspaceId].tiles.length; i++){
          if(this._storage.workspaces[workspaceId].tiles[i].id === tileId){
            delete this._storage.workspaces[workspaceId].tiles[i];
            return;
          }
        }
      };

      WorkspacesCache.prototype.updateTile = function(workspaceId, tileId, tile){
        for(var i = 0; i < this._storage.workspaces[workspaceId].tiles.length; i++){
          if(this._storage.workspaces[workspaceId].tiles[i].id === tileId){
            this._storage.workspaces[workspaceId].tiles[i] = tile;
            return;
          }
        }
      };

      return WorkspacesCache;
    }
  ]);

}(angular.module('presetsApp')));

/**
 * Created by tzachit on 15/12/14.
 */

(function(app){

  'use strict';

  app.factory('WorkspacesCache', ['$q', '$localStorage',
    function($q, $localStorage){

      $localStorage.$reset();

      function Storage(){
        this.created = new Date().valueOf();
        this.workspaces = {};
      }

      function Item(workspace, tiles){
        this.created = new Date().valueOf();
        this.workspace = workspace;
        this.tiles = tiles;
      }

      function GetResult(fresh, worksspace){
        this.fresh = fresh;
        this.workspace = worksspace;
      }

      function WorkspacesCache(presetId, lifetime, refreshCallback){
        this._presetId = presetId;
        this._lifetime = lifetime;
        this._refreshCallback = refreshCallback;
        $localStorage[presetId] = new Storage();
        this._storage = $localStorage[presetId];
      }

      Object.defineProperties(WorkspacesCache.prototype, {
        lifetime: {
          get: function(){ return this._lifetime; }
        },
        count: {
          get: function(){ return Object.keys(this._storage.workspaces).length; }
        }
      });

      WorkspacesCache.prototype.info = function(){
        var count = 0;
        var keys = [];

        for(var workspaceId in this._storage.workspaces){
          keys.push(workspaceId);
          count++;
        }
        return {
          presetId: this._presetId,
          lifetime: this._lifetime,
          count: count,
          keys: keys
        }
      };

      WorkspacesCache.prototype.getAsync = function(workspaceId, includeTiles, fresh){
        var deferred = $q.defer();
        var self = this;

        if(!angular.isDefined(this._storage.workspaces[workspaceId])){
          $q.when(this._refreshCallback(workspaceId, true)).then(
            function success(result){
              self._storage.workspaces[workspaceId] = new Item(angular.copy(result.data));
              if(includeTiles !== true){
                result.data.tiles = [];
              }
              deferred.resolve(new GetResult(true, result.data));
            }, function error(reason){
              deferred.reject(reason);
            }
          );
        }else{
          var item  = this._storage.workspaces[workspaceId];

          if(fresh === true || ((new Date().valueOf() - item.created) / 1000 > this._lifetime)){
            $q.when(this._refreshCallback(workspaceId, true)).then(
              function success(result){
                self._storage.workspaces[workspaceId] = new Item(angular.copy(result.data));
                if(includeTiles !== true){
                  result.data.tiles = [];
                }
                deferred.resolve(new GetResult(true, result.data));
              }, function error(reason){
                deferred.reject(reason);
              }
            );
          }else{
            var workspace = angular.copy(item.workspace);
            if(includeTiles === true){
              workspace.tiles = angular.copy(item.tiles);
            }
            deferred.resolve(new GetResult(false, workspace));
          }
        }

        return deferred.promise;
      };

      WorkspacesCache.prototype.put = function(workspace){
        var tiles = workspace.tiles;
        workspace.tiles = [];
        this._storage.workspaces[workspace.id] = new Item(workspace, tiles);
      };

      WorkspacesCache.prototype.delete = function(workspaceId){
        delete this._storage.workspaces[workspaceId];
      };

      WorkspacesCache.prototype.update = function(workspace){
        if(workspace.tiles.length !== 0){
          this.put(workspace);
        }else{
          this._storage.workspaces[workspace.id].workspace = workspace;
        }
      };

      WorkspacesCache.prototype.addTile = function(workspaceId, tile){
        this._storage.workspaces[workspaceId].tiles.push(tile);
      };

      WorkspacesCache.prototype.removeTile = function(workspaceId, tileId){
        for(var i = 0; i < this._storage.workspaces[workspaceId].tiles.length; i++){
          if(this._storage.workspaces[workspaceId].tiles[i].id === tileId){
            this._storage.workspaces[workspaceId].tiles.splice(i,1);
            return;
          }
        }
      };

      WorkspacesCache.prototype.updateTile = function(workspaceId, tile){
        for(var i = 0; i < this._storage.workspaces[workspaceId].tiles.length; i++){
          if(this._storage.workspaces[workspaceId].tiles[i].id === tile.id){
            this._storage.workspaces[workspaceId].tiles[i] = tile;
            return;
          }
        }
      };

      return WorkspacesCache;
    }
  ]);

}(angular.module('presetsApp')));

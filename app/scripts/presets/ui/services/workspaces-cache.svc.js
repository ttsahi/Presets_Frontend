/**
 * Created by tzachit on 15/12/14.
 */

(function(app){

  'use strict';

  app.factory('WorkspacesCache', ['$q', '$localStorage', 'CRUDResult',
    function($q, $localStorage, CRUDResult){

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

      function WorkspacesCache(presetId, lifetime, loadWorkspaceCallback, loadTileCallback, localOnly){
        this._presetId = presetId;
        this._lifetime = lifetime;
        this._loadWorkspaceCallback = loadWorkspaceCallback;
        this._loadTileCallback = loadTileCallback;
        this._localOnly = localOnly;

        $localStorage[presetId] = new Storage();
        this._storage = $localStorage[presetId];

        this._onadd = function(worksqapce){};
        this._onrefresh = function(worksqapce){};
      }

      Object.defineProperties(WorkspacesCache.prototype, {
        lifetime: {
          get: function(){ return this._lifetime; },
          set: function(val){ this._lifetime = val; }
        },
        count: {
          get: function(){ return Object.keys(this._storage.workspaces).length; }
        }
      });

      Object.defineProperties(WorkspacesCache.prototype, {
        onadd: {
          get: function(){ return this._onadd; },
          set: function(val){ this._onadd = val; }
        },
        onrefresh: {
          get: function(){ return this._onrefresh; },
          set: function(val){ this._onrefresh = val; }
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

        if(!this.exist(workspaceId)){
          $q.when(this._loadWorkspaceCallback(workspaceId, true)).then(
            function success(result){
              self.put(angular.copy(result.data));
              self._onadd(angular.copy(result.data));
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

          if(this._localOnly === false && (fresh === true || ((new Date().valueOf() - item.created) / 1000 > this._lifetime))){
            $q.when(this._loadWorkspaceCallback(workspaceId, true)).then(
              function success(result){
                self.update(angular.copy(result.data));
                self._onrefresh(angular.copy(result.data));
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

      WorkspacesCache.prototype.exist = function(workspaceId){
        return typeof this._storage.workspaces[workspaceId] !== 'undefined';
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

      function findTile(workspaceId, tileId){
        var tiles  = this._storage.workspaces[workspaceId].tiles;

        for(var i = 0; i < tiles.length; i++){
          if(tiles[i].id === tileId){
            return tiles[i];
          }
        }

        return null;
      }

      WorkspacesCache.prototype.getTileAsync = function(workspaceId, tileId, fresh){
        var deferred = $q.defer();
        var self = this;

        if(this._localOnly === false && !this.exist(workspaceId)){
          $q.when(this._loadWorkspaceCallback(workspaceId, true)).then(
            function success(result){
              self.put(angular.copy(result.data));
              self._onadd(angular.copy(result.data));
              var freshTile = findTile(workspaceId, tileId);
              if(freshTile === null){
                deferred.reject(new CRUDResult(false, {}, ['tile id: ' + tileId + ' not longer exist!']));
              }else{
                deferred.resolve(new GetResult(true, angular.copy(freshTile)));
              }
            }, function error(reason){
              deferred.reject(reason);
            }
          );
        }else{
          var item  = this._storage.workspaces[workspaceId];
          var tile = findTile(workspaceId, tileId);

          if((tile === null && this._localOnly === true) || (tile === null && fresh !== true)){
            deferred.reject(new CRUDResult(false, {}, ['tile id: ' + tileId + ' not exist!']));
          }

          if(this._localOnly === false && (fresh === true || ((new Date().valueOf() - item.created) / 1000 > this._lifetime))){
            $q.when(this._loadWorkspaceCallback(workspaceId, true)).then(
              function success(result){
                self.update(angular.copy(result.data));
                self._onrefresh(angular.copy(result.data));
                var freshTile = findTile(workspaceId, tileId);
                if(freshTile === null){
                  deferred.reject(new CRUDResult(false, {}, ['tile id: ' + tileId + ' not longer exist!']));
                }else{
                  deferred.resolve(new GetResult(true, angular.copy(freshTile)));
                }
              }, function error(reason){
                deferred.reject(reason);
              }
            );
          }else if(tile === null){
            deferred.reject(new CRUDResult(false, {}, ['tile id: ' + tileId + ' not exist!']));
          }else{
            deferred.resolve(new GetResult(false, angular.copy(tile)));
          }
        }

        return deferred.promise;
      };

      WorkspacesCache.prototype.tileExist = function(workspaceId, tileId){
        if(!angular.isDefined(this._storage.workspaces[workspaceId])){
          return false;
        }

        return findTile(workspaceId, tileId) !== null;
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

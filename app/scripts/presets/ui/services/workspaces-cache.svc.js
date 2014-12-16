/**
 * Created by tzachit on 15/12/14.
 */

(function(app){

  'use strict';

  app.factory('WorkspacesCache', ['$q', '$localStorage',
    function($q, $localStorage){

      function Storage(){
        this.created = new Date().valueOf();
        this.workspaces = {};
      }

      function Item(workspace){
        this.created = new Date().valueOf();
        this.workspace = workspace;
      }

      function GetResult(fresh, worksspace){
        this.fresh = fresh;
        this.workspace = worksspace;
      }

      function WorkspacesCache(presetId, lifetime, refreshCallback){
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

      WorkspacesCache.prototype.getAsync = function(workspaceId){
        var deferred = $q.defer();
        var self = this;

        if(!angular.isDefined(this._storage.workspaces[workspaceId])){
          $q.when(this._refreshCallback(workspaceId)).then(
            function success(workspace){
              self._storage.workspaces[workspaceId] = new Item(workspace);
              deferred.resolve(new GetResult(true, workspace));
            }, function error(reason){
              deferred.reject(reason);
            }
          );
        }else{
          var item  = this._storage.workspaces[workspaceId];

          if((new Date().valueOf() - item.created) / 1000 > this._lifetime){
            $q.when(this._refreshCallback(workspaceId)).then(
              function success(workspace){
                self._storage.workspaces[workspaceId] = new Item(workspace);
                deferred.resolve(new GetResult(true, workspace));
              }, function error(reason){
                deferred.reject(reason);
              }
            );
          }else{
            deferred.resolve(new GetResult(false, item.workspace));
          }
        }

        return deferred.promise;
      };

      WorkspacesCache.prototype.put = function(workspace){
        this._storage.workspaces[workspace.id] = new Item(workspace);
      };

      WorkspacesCache.prototype.delete = function(workspaceId){
        delete this._storage.workspaces[workspaceId];
      };

      WorkspacesCache.prototype.update = function(workspace){
        this._storage.workspaces[workspace.id] = new Item(workspace);
      };

      WorkspacesCache.prototype.addTile = function(workspaceId, tile){
        this._storage.workspaces[workspaceId].workspace.tiles.push(tile);
      };

      WorkspacesCache.prototype.removeTile = function(workspaceId, tileId){
        for(var i = 0; i < this._storage.workspaces[workspaceId].workspace.tiles.length; i++){
          if(this._storage.workspaces[workspaceId].workspace.tiles[i].id === tileId){
            this._storage.workspaces[workspaceId].workspace.tiles.splice(i,1);
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

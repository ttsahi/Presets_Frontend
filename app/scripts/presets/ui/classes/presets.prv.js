/**
 * Created by tzachit on 08/12/14.
 */

(function(app){

  'use strict';

  app.provider('Preset', [
    function(){

      var _templatesDir = 'scripts/presets/ui/';
      var _defaultRows = 4;
      var _defaultCols = 5;

      Object.defineProperties(this, {
        templatesDir: {
          set: function(val){ _templatesDir = val; }
        },
        defaultRows: {
          set: function(val){ _defaultRows = val; }
        },
        defaultCols: {
          set: function(val){ _defaultCols = val; }
        }
      });

      var guid = (function() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return function() {
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        };
      })();

      function DeveloperError(message){
        this.message = message;
      }

      this.$get = ['$q', 'presetValidators', 'CRUDResult', 'ReducedWorkspace', 'WorkspacesCache',
        function($q, presetValidators, CRUDResult, ReducedWorkspace, WorkspacesCache) {

          function Preset(options) {
            this._id = guid();
            this._types = [];
            this._workspacesList = {};
            this._workspacesListArr = [];
            this._currentWorkspace = null;
            this._currentWorkspaceData = null;
            this._workspacesCache = null;

            this._useCache = true;
            this._lifetime = Number.MAX_VALUE;

            this._loadWorkspacesList = function(){ return new CRUDResult(true); };
            this._loadWorkspace = function(workspaceId, includeTiles){ return new CRUDResult(true); };
            this._loadTile = function(workspaceId, tileId){ return new CRUDResult(true); };

            this._confirmAdd = function(workspace){ return new CRUDResult(true); };
            this._confirmRemove = function(workspace){ return new CRUDResult(true); };
            this._confirmUpdate = function(workspace){ return new CRUDResult(true); };
            this._commitChanges = function(workspace){ return new CRUDResult(true); };

            this._onAddToCacheListeners = [];
            this._onRefreshCacheListeners = [];

            this.construct(options);
          }

          Object.defineProperties(Preset, {
            templatesDir: { value: _templatesDir },
            defaultRows: { value: _defaultRows },
            defaultCols: { value: _defaultCols }
          });

          Preset.prototype.construct = function(options){

            //set cache on by default
            this._workspacesCache = new WorkspacesCache(
              this._id,
              this._lifetime,
              this._wrappedLoadWorkspace,
              true //set cache local only by default
            );

            var self = this;

            this._workspacesCache.onadd = function(workspace){
              for(var i = 0; i < self._onAddToCacheListeners.length; i++){
                self._onAddToCacheListeners[i](workspace);
              }
            };

            this._workspacesCache.onrefresh = function(workspace){
              for(var i = 0; i < self._onRefreshCacheListeners.length; i++){
                self._onRefreshCacheListeners[i](workspace);
              }
            };

            if(angular.isObject(options)){
              if(options.cache === true && angular.isNumber(options.lifetime)){
                this._useCache = true;
                this._lifetime = Math.abs(Math.round(options.lifetime));

                this._workspacesCache.lifetime = this._lifetime;
              }

              if(options.cache === false){
                this._useCache = false;
              }
            }

            this._confirmAdd = function(workspace){
              workspace.id = guid();
              return new CRUDResult(true);
            };

            this.loadWorkspacesList();
          };

          Object.defineProperties(Preset.prototype, {
            id: {
              get: function(){ return this._id; }
            },
            types: {
              get: function(){ return this._types; }
            },
            useCache: {
              get: function(){ return this._useCache; }
            },
            currentWorkspace: {
              get: function(){ return angular.copy(this._currentWorkspace); },
              set: function(val){ this._currentWorkspace = val; }
            },
            workspacesCount: {
              get: function(){ return Object.keys(this._workspacesList).length; }
            },
            workspacesList: {
              get: function(){ return this._workspacesListArr; }
            }
          });

          Object.defineProperties(Preset.prototype, {
            loadWorkspacesList: {
              get: function(){ return this._loadWorkspacesList; },
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('load workspaces list must be function!');
                }

                this._loadWorkspacesList = val;
              }
            },
            loadWorkspace: {
              get: function(){ return this._loadWorkspace; },
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('load workspace must be function!');
                }

                this._loadWorkspace = val;
              }
            },
            loadTile: {
              get: function(){ return this._loadTile; },
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('load tile must be function!');
                }

                this._loadTile = val;
              }
            },
            confirmAdd: {
              get: function(){ return this._confirmAdd; },
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('confirm add must be function!');
                }

                this._confirmAdd = val;
              }
            },
            confirmRemove: {
              get: function(){ return this._confirmRemove; },
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('confirm remove must be function!');
                }

                this._confirmRemove = val;
              }
            },
            confirmUpdate: {
              get: function(){ return this._confirmUpdate; },
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('confirm update must be function!');
                }

                this._confirmUpdate = val;
              }
            },
            commitChanges: {
              get: function(){ return this._commitChanges; },
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('commit changes must be function!');
                }

                this._commitChanges = val;
              }
            },
            onAddToCache: {
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('on add to cache must be function!');
                }

                this._onAddToCacheListeners.push(val);
              }
            },
            onRefreshCache: {
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('on refresh cache must be function!');
                }

                this._onRefreshCacheListeners.push(val);
              }
            }
          });

          Preset.prototype.generateId = function(){
            return guid();
          };

          var validateWorkspacesList = presetValidators.validateWorkspacesList;
          var validateWorkspace = presetValidators.validateWorkspace;
          var validateTileType = presetValidators.validateTileType;
          var validateTileByWorkspace = presetValidators.validateTileByWorkspace;
          var validateTile = presetValidators.validateTile;

          Preset.prototype._wrappedLoadWorkspace = function(workspaceId, includeTiles){
            var deferred = $q.defer();

            $q.when(this._loadWorkspace(workspaceId, includeTiles)).then(
              function resolveSuccess(result){

                if(!result instanceof CRUDResult){
                  throw new DeveloperError('load workspace must return CRUDResult!');
                }

                if(result.succeeded === true){
                  try{
                    result.data = validateWorkspace(result.data);
                  }catch(exception){
                    throw new DeveloperError('bad load workspace event implementation!');
                  }
                  deferred.resolve(result);
                }else{
                  deferred.reject(result);
                }

              },function resolveError(reason){
                deferred.reject(new CRUDResult(false, reason, ["can't load workspace id: " + workspaceId]));
              });

            return deferred.promise;
          };

          Preset.prototype._wrappedLoadTile = function(workspaceId, tileId){
            var deferred = $q.defer();

            $q.when(this._loadTile(workspaceId, tileId)).then(
              function resolveSuccess(result){

                if(!result instanceof CRUDResult){
                  throw new DeveloperError('load tile must return CRUDResult!');
                }

                if(result.succeeded === true){
                  try{
                    result.data = validateTile(result.data);
                  }catch(exception){
                    throw new DeveloperError('bad load tile event implementation!');
                  }
                  deferred.resolve(result);
                }else{
                  deferred.reject(result);
                }

              },function resolveError(reason){
                deferred.reject(new CRUDResult(false, reason, ["can't load tile id: " + tileId]));
              });

            return deferred.promise;
          };

          Preset.prototype.loadWorkspacesList = function(){
            var self = this;

            $q.when(this._loadWorkspacesList()).then(
              function resolveSuccess(result){

                if(!result instanceof CRUDResult){
                  throw new DeveloperError('load workspaces list must return CRUDResult!');
                }

                if(result.succeeded === true){

                  if(result.data instanceof Array){
                    var list = validateWorkspacesList(angular.copy(result.data));

                    for(var i = 0; i < list.length; i++){
                      self._workspacesList[list[i].id] = list[i];
                    }

                    if(this._useCache === true){
                      var keys = self._workspacesCache.info().keys;

                      for(i = 0; i < keys.length; i++){
                        if(self._workspacesList[keys[i]] === undefined){
                          self._workspacesCache.delete(keys[i]);
                        }
                      }
                    }

                    this.refreshWorkspacesListArr();
                  }

                }else{
                  console.log('error while loading workspaces list!');
                }

              },function resolveError(reason){
                throw new DeveloperError('error while loading workspaces list!');
              });
          };

          Preset.prototype.refreshWorkspacesListArr = function(){

            while(this._workspacesListArr.length !== 0){
              this._workspacesListArr.pop();
            }

            for(var id in this._workspacesList){
              this._workspacesListArr.push(angular.copy(this._workspacesList[id]));
            }
          };

          Preset.prototype.getWorkspaceAsync = function(workspaceId, includeTiles, fresh){
            includeTiles = typeof includeTiles === 'boolean' ? includeTiles : false;
            fresh = typeof fresh === 'boolean' ? fresh : false;
            var deferred = $q.defer();

            if(this._useCache === true){
              this._workspacesCache.getAsync(workspaceId, includeTiles, fresh).then(
                function resolveSuccess(result){
                  deferred.resolve(new CRUDResult(true, result.workspace));
                },function resolveError(reason){
                  deferred.reject(reason);
                });
            }else{
              this._wrappedLoadWorkspace(workspaceId, includeTiles).then(
                function resolveSuccess(result){
                  deferred.resolve(result);
                },function resolveError(reason){
                  deferred.reject(reason);
                });
            }

            return deferred.promise;
          };

          Preset.prototype.getTileAsync = function(workspaceId, tileId, fresh){
            fresh = typeof fresh === 'boolean' ? fresh : false;
            var deferred = $q.defer();

            if(this._useCache === true){
              this._workspacesCache.getTileAsync(workspaceId, tileId, fresh).then(
                function resolveSuccess(result){
                  deferred.resolve(new CRUDResult(true, result.workspace));
                },function resolveError(reason){
                  deferred.reject(reason);
                });
            }else{
              this._wrappedLoadTile(workspaceId, tileId).then(
                function resolveSuccess(result){
                  deferred.resolve(result);
                },function resolveError(reason){
                  deferred.reject(reason);
                });
            }

            return deferred.promise;
          };

          Preset.prototype.addWorkspaceAsync = function(workspace, confirm){
            workspace = validateWorkspace(workspace);
            var self = this;
            var deferred = $q.defer();

            $q.when(confirm === true ? this.confirmAdd(workspace) : new CRUDResult(true)).then(
              function resolveSuccess(result){

                if(!result instanceof CRUDResult){
                  throw new DeveloperError('confirm add must return CRUDResult!');
                }

                if(result.succeeded === true){
                  var cloned = validateWorkspace(angular.copy(workspace));
                  if(self._useCache === true){
                    self._workspacesCache.put(cloned);
                  }
                  self._workspacesList[workspace.id] = new ReducedWorkspace(cloned.id, cloned.name);
                  self.refreshWorkspacesListArr();
                  deferred.resolve(new CRUDResult(true, angular.copy(workspace)));
                }else{
                  deferred.reject(result);
                }

              },function resolveError(reason){
                deferred.reject(new CRUDResult(false, reason, ["can't add workspace!"]));
              });

            return deferred.promise;
          };

          Preset.prototype.removeWorkspaceAsync = function(id, confirm){
            var self = this;
            var deferred = $q.defer();

            if(this._workspacesList[id] === undefined){
              deferred.reject(new CRUDResult(false, {}, ['workspace id: ' + id + 'not found!']));
              return deferred.promise;
            }

            this.getWorkspaceAsync(id).then(
              function resolveSuccess(result) {
                if(result.succeeded === true) {

                  var workspace = result.data;

                  $q.when(confirm === true ? self.confirmRemove(angular.copy(workspace)) : new CRUDResult(true)).then(
                    function resolveSuccess(result){

                      if(!result instanceof CRUDResult){
                        throw new DeveloperError('confirm remove must return CRUDResult!');
                      }

                      if(result.succeeded === true){
                        delete self._workspacesList[workspace.id];
                        if(self._useCache === true){
                          self._workspacesCache.delete(workspace.id);
                        }
                        self.refreshWorkspacesListArr();
                        deferred.resolve(new CRUDResult(true, workspace));
                      }else{
                        deferred.reject(result);
                      }

                    },function resolveError(reason){
                      deferred.reject(new CRUDResult(false, reason, ["can't remove workspace!"]));
                    });

                }else{
                  result.errors.push("can't remove workspace!");
                  deferred.reject(result);
                }

              },function resolveError(reason){
              deferred.reject(reason);
            });

            return deferred.promise;
          };

          Preset.prototype.updateWorkspaceAsync = function(id, data, confirm){
            var self = this;
            var deferred = $q.defer();

            if(this._workspacesList[id] === undefined){
              deferred.reject(new CRUDResult(false, {}, ['workspace id: ' + id + 'not found!']));
              return deferred.promise;
            }

            this.getWorkspaceAsync(id).then(
              function resolveSuccess(result) {
                if(result.succeeded === true) {

                  var clonedWorkspace = angular.copy(result.data);

                  if(typeof data !== 'object'){
                    deferred.reject(new CRUDResult(false, workspace, ['nothing to update!']));
                    return deferred.promise;
                  }

                  var isUpdated = false;
                  angular.forEach(data, function(value, property){
                    if(property === 'id' && value !== id){
                      deferred.reject(new CRUDResult(false, workspace, ["can't change id property!"]));
                      return deferred.promise;
                    }

                    if(property === 'tiles'){
                      deferred.reject(new CRUDResult(false, workspace, ["can't change tiles property!"]));
                      return deferred.promise;
                    }

                    if(clonedWorkspace[property] !== undefined){
                      clonedWorkspace[property] = value;
                      isUpdated = true;
                    }
                  });

                  if(isUpdated === false){
                    deferred.reject(new CRUDResult(false, workspace, ['nothing to update!']));
                    return deferred.promise;
                  }

                  clonedWorkspace = validateWorkspace(clonedWorkspace);

                  $q.when(confirm === true ? self.confirmUpdate(clonedWorkspace) : new CRUDResult(true)).then(
                    function resolveSuccess(result){

                      if(!result instanceof CRUDResult){
                        throw new DeveloperError('confirm update must return CRUDResult!');
                      }

                      if(result.succeeded === true){

                        if(clonedWorkspace.id !== id){
                          deferred.reject(new CRUDResult(false, clonedWorkspace, ["can't change id property!"]));
                          return deferred.promise;
                        }

                        clonedWorkspace.tiles = [];
                        clonedWorkspace.modified = new Date();
                        var cloned = validateWorkspace(angular.copy(clonedWorkspace));
                        self._workspacesList[clonedWorkspace.id].name = cloned.name;
                        if(self._useCache === true){
                          self._workspacesCache.update(cloned);
                        }
                        self.refreshWorkspacesListArr();
                        deferred.resolve(new CRUDResult(true, clonedWorkspace));
                      }else{
                        deferred.reject(result);
                      }

                    },function resolveError(reason){
                      deferred.reject(new CRUDResult(false, reason, ["can't update workspace!"]));
                    });

                }else{
                  result.errors.push("can't update workspace!");
                  deferred.reject(result);
                }

              },function resolveError(reason){
                deferred.reject(reason);
              });

            return deferred.promise;
          };

          Preset.prototype.addTileAsync = function(workspaceId, tile, confirm){
            var deferred = $q.defer();
            var self = this;

            tile = validateTile(tile);

            if(!angular.isDefined(this._types[tile.type])){
              deferred.reject(new CRUDResult(false, {}, ["can't add tile, invalid tile type!"]));
              return deferred.promise;
            }

            if(!angular.isDefined(this._workspacesList[workspaceId])){
              deferred.reject(new CRUDResult(false, {}, ["can't add tile workspace id: " + workspaceId + " not found!"]));
              return deferred.promise;
            }

            var type = this._types[tile.type];

            if(this._currentWorkspaceData !== null && workspaceId === this._currentWorkspaceData.workspaceId){

               return this._currentWorkspaceData.addTileAsync(tile, confirm);

            }else {

              if(this._useCache && this._workspacesCache.tileExist(workspaceId, tile.id)){
                deferred.reject(new CRUDResult(false, {}, ["can't add tile, tile id: " + tile.id + "already exist"]));
                return deferred.promise;
              }

              this.getWorkspaceAsync(workspaceId, true).then(
                function resolveSuccess(result){

                  var workspace = result.data;
                  var clonedWorkspace = angular.copy(workspace);
                  clonedWorkspace.tiles = [];

                  if(confirm === true){
                    $q.when(type.confirmAdd(clonedWorkspace, tile)).then(
                      function resolveSuccess(result){

                        if(!result instanceof CRUDResult){
                          throw new DeveloperError('confirm add must return CRUDResult!');
                        }

                        if(result.succeeded === true){
                          if(self._useCache){
                            var cloned = angular.copy(validateTileByWorkspace(tile, workspace));
                            self._workspacesCache.addTile(workspaceId, cloned);
                          }
                          deferred.resolve(new CRUDResult(true, tile));
                        }else{
                          deferred.reject(result);
                        }

                      }, function resolveError(reason){
                        deferred.reject(new CRUDResult(false, reason, ["can't add tile!"]));
                      }
                    );
                  }else{
                    if(self._useCache){
                      var cloned = angular.copy(validateTileByWorkspace(tile, workspace));
                      self._workspacesCache.addTile(workspaceId, cloned);
                      deferred.resolve(new CRUDResult(true, tile));
                    }else{
                      deferred.reject(new CRUDResult(true, tile, ['no workspace storage to add to!']));
                    }
                  }
                }, function resolveError(reason){
                  deferred.reject(reason);
                }
              );

            }

            return deferred.promise;
          };

          Preset.prototype.removeTileAsync = function(workspaceId, tileId, confirm){
            var deferred = $q.defer();
            var self = this;

            if(!angular.isDefined(this._workspacesList[workspaceId])){
              deferred.reject(new CRUDResult(false, {}, ["can't remove tile workspace id: " + workspaceId + " not found!"]));
              return deferred.promise;
            }

            if(this._currentWorkspaceData !== null && workspaceId === this._currentWorkspaceData.workspaceId){

              return this._currentWorkspaceData.removeTileByIdAsync(tileId, confirm);

            }else {

              if(this._useCache && !this._workspacesCache.tileExist(workspaceId, tileId)){
                deferred.reject(new CRUDResult(false, {}, ["can't remove tile, tile not found!"]));
                return deferred.promise;
              }

              $q.all([this.getWorkspaceAsync(workspaceId), this.getTileAsync(workspaceId, tileId)]).then(
                function resolveSuccess(workspaceAndTile){

                  var workspace = workspaceAndTile[0].data;
                  var tile = workspaceAndTile[1].data;
                  var type = self._types[tile.type];

                  if(confirm === true){
                    $q.when(type.confirmRemove(angular.copy(workspace), angular.copy(tile))).then(
                      function resolveSuccess(result){

                        if(!result instanceof CRUDResult){
                          throw new DeveloperError('confirm remove must return CRUDResult!');
                        }

                        if(result.succeeded === true){
                          if(self._useCache){
                            self._workspacesCache.removeTile(workspaceId, tileId);
                          }
                          deferred.resolve(new CRUDResult(true, tile));
                        }else{
                          deferred.reject(result);
                        }

                      }, function resolveError(reason){
                        deferred.reject(new CRUDResult(false, reason, ["can't remove tile!"]));
                      }
                    );
                  }else {
                    if(self._useCache) {
                      self._workspacesCache.removeTile(workspaceId, tileId);
                      deferred.resolve(new CRUDResult(true, tile));
                    } else {
                      deferred.reject(new CRUDResult(true, tile, ['no workspace storage to remove from!']));
                    }
                  }

                }, function resolveError(reason){
                  deferred.reject(new CRUDResult(false, reason, ["can't remove tile id: " + tileId]));
                }
              );

            }

            return deferred.promise;
          };

          Preset.prototype.updateTileAsync = function(workspaceId, tileId, model, confirm){
            var deferred = $q.defer();
            var self = this;

            if(!angular.isDefined(this._workspacesList[workspaceId])){
              deferred.reject(new CRUDResult(false, {}, ["can't update tile workspace id: " + workspaceId + " not found!"]));
              return deferred.promise;
            }

            if(this._currentWorkspaceData !== null && workspaceId === this._currentWorkspaceData.workspaceId){

              return this._currentWorkspaceData.updateTileByIdAsync(tileId, model, confirm);

            }else {

              if(this._useCache && !this._workspacesCache.tileExist(workspaceId, tileId)){
                deferred.reject(new CRUDResult(false, {}, ["can't update tile, tile not found!"]));
                return deferred.promise;
              }

              $q.all([this.getWorkspaceAsync(workspaceId), this.getTileAsync(workspaceId, tileId)]).then(
                function resolveSuccess(workspaceAndTile){

                  var workspace = workspaceAndTile[0].data;
                  var tile = workspaceAndTile[1].data;
                  tile.model = model;
                  var clonedTile = angular.copy(tile);
                  var type = self._types[tile.type];

                  if(confirm === true){
                    $q.when(type.confirmUpdate(angular.copy(workspace), clonedTile)).then(
                      function resolveSuccess(result){

                        if(!result instanceof CRUDResult){
                          throw new DeveloperError('confirm update must return CRUDResult!');
                        }

                        if(result.succeeded === true){
                          if(self._useCache){
                            self._workspacesCache.updateTile(workspaceId, tile);
                          }
                          deferred.resolve(new CRUDResult(true, clonedTile));
                        }else{
                          deferred.reject(result);
                        }

                      }, function resolveError(reason){
                        deferred.reject(new CRUDResult(false, reason, ["can't update tile!"]));
                      }
                    );
                  }else {
                    if(self._useCache){
                      self._workspacesCache.updateTile(workspaceId, tile);
                      deferred.resolve(new CRUDResult(true, clonedTile));
                    } else {
                      deferred.reject(new CRUDResult(true, tile, ['no workspace storage to update into!']));
                    }
                  }

                }, function resolveError(reason){
                  deferred.reject(new CRUDResult(false, reason, ["can't update tile id: " + tileId]));
                }
              );

            }

            return deferred.promise;
          };

          Preset.prototype.registerType = function(tileType){
            tileType = validateTileType(tileType);

            if (this._types[tileType.name] !== undefined) {
              throw new DeveloperError('tile type already exist!');
            }

            this._types[tileType.name] = tileType;
            return true;
          };

          Preset.prototype.registerTypes = function(types){
            if(!(types instanceof Array)){
              console.log('no types to register!');
              return false;
            }

            for(var i = 0; i < types.length; i++){
              this.registerType(types[i]);
            }

            return true;
          };

          return Preset;
        }];
    }
  ]);

}(angular.module('presetsApp')));

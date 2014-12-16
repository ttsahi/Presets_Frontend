/**
 * Created by tzachit on 08/12/14.
 */

(function(app){

  'use strict';

  app.provider('Preset', [
    function(){

      var _templatesDir = 'scripts/presets/ui/';

      Object.defineProperty(this, 'templatesDir', {
        templatesDir: {
          set: function(val) { _templatesDir = val; }
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

      this.$get = ['$q', 'presetValidators', 'CRUDResult',
        function($q, presetValidators, CRUDResult) {

          function Preset(workspaces, options) {
            this._id = guid();
            this._types = [];
            this._workspaces = {};
            this._workspacesArr = [];
            this._currentWorkspace = null;

            this._useCache = false;
            this._lifetime = null;

            this._loadWorkspace = function(workspace){ return new CRUDResult(true); };
            this._loadTiles = function(workspace){ return new CRUDResult(true); };
            this._confirmAdd = function(workspace){ return new CRUDResult(true); };
            this._confirmRemove = function(workspace){ return new CRUDResult(true); };
            this._confirmUpdate = function(workspace){ return new CRUDResult(true); };

            this.construct(workspaces, options);
          }

          Preset.prototype.construct = function(workspaces, options){

            if(angular.isObject(options)){
              if(options.cache === true && angular.isNumber(options.lifetime)){
                this._useCache = true;
                this._lifetime = Math.abs(Math.round(options.lifetime));
              }
            }

            this._confirmAdd = function(workspace){
              workspace.id = guid();
              return new CRUDResult(true);
            };

            if (!(workspaces instanceof Array)) {
              return;
            }

            for(var i = 0; i < workspaces.length; i++){
              this.addWorkspaceAsync(workspaces[i]);
            }
          };

          Object.defineProperty(Preset, 'templatesDir', {
            value: _templatesDir
          });

          Object.defineProperties(Preset.prototype, {
            id: {
              get: function(){ return this._id; }
            },
            types: {
              get: function(){ return this._types; }
            },
            workspaces: {
              get: function(){ return this._workspaces; }
            },
            workspacesCount: {
              get: function(){ return Object.keys(this._workspaces).length; }
            },
            workspacesArr: {
              get: function(){ return this._workspacesArr; }
            }
          });

          Object.defineProperties(Preset.prototype, {
            loadWorkspace: {
              get: function(){ return this._loadWorkspace; },
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('load tiles must be function!');
                }

                this._loadWorkspace = val;
              }
            },
            loadTiles: {
              get: function(){ return this._loadTiles; },
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('load tiles must be function!');
                }

                this._loadTiles = val;
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
              get: function(){ return this._confirmUpdate;},
              set: function(val){
                if (typeof val !== 'function') {
                  throw new DeveloperError('confirm update must be function!');
                }

                this._confirmUpdate = val;
              }
            }
          });

          Preset.prototype.getWorkspace = function(id){
            return angular.copy(this._workspaces[id]);
          };

          Preset.prototype.refreshWorkspacesArr = function(){

            while(this._workspacesArr.length !== 0){
              this._workspacesArr.pop();
            }

            for(var id in this._workspaces){
              this._workspacesArr.push(angular.copy(this._workspaces[id]));
            }
          };

          var validateWorkspace = presetValidators.validateWorkspace;
          var validateTileType = presetValidators.validateTileType;

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
                  self._workspaces[workspace.id] = validateWorkspace(angular.copy(workspace));
                  self.refreshWorkspacesArr();
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

            if(this._workspaces[id] === undefined){
              deferred.reject(new CRUDResult(false, {}, ['workspace id: ' + id + 'not found!']));
              return deferred.promise;
            }

            var workspace = this._workspaces[id];

            $q.when(confirm === true ? this.confirmRemove(angular.copy(workspace)) : new CRUDResult(true)).then(
              function resolveSuccess(result){

                if(!result instanceof CRUDResult){
                  throw new DeveloperError('confirm remove must return CRUDResult!');
                }

                if(result.succeeded === true){
                  delete self._workspaces[workspace.id];
                  self.refreshWorkspacesArr();
                  deferred.resolve(new CRUDResult(true, workspace));
                }else{
                  deferred.reject(result);
                }

              },function resolveError(reason){
                deferred.reject(new CRUDResult(false, reason, ["can't remove workspace!"]));
              });

            return deferred.promise;
          };

          Preset.prototype.updateWorkspaceAsync = function(id, data){
            var self = this;
            var deferred = $q.defer();

            if(this._workspaces[id] === undefined){
              deferred.reject(new CRUDResult(false, {}, ['workspace id: ' + id + 'not found!']));
              return deferred.promise;
            }

            var clonedWorkspace = angular.copy(this._workspaces[id]);

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

            $q.when(confirm === true ? this.confirmUpdate(clonedWorkspace) : new CRUDResult(true)).then(
              function resolveSuccess(result){

                if(!result instanceof CRUDResult){
                  throw new DeveloperError('confirm update must return CRUDResult!');
                }

                if(result.succeeded === true){

                  if(clonedWorkspace.id !== id){
                    deferred.reject(new CRUDResult(false, clonedWorkspace, ["can't change id property!"]));
                    return deferred.promise;
                  }

                  self._workspaces[clonedWorkspace.id] = validateWorkspace(angular.copy(clonedWorkspace));
                  self.refreshWorkspacesArr();
                  deferred.resolve(new CRUDResult(true, clonedWorkspace));
                }else{
                  deferred.reject(result);
                }

              },function resolveError(reason){
                deferred.reject(new CRUDResult(false, reason, ["can't update workspace!"]));
              });

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

          return Preset;
        }];
    }
  ]);

}(angular.module('presetsApp')));

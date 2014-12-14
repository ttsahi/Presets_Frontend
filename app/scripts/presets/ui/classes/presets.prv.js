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

      function isNullOrUndefined(value){
        return value === null || value === undefined;
      }

      function isNullEmptyOrWhiteSpaces(str){
        return typeof str !== 'string' || str.trim() === '';
      }

      function DeveloperError(message){
        this.message = message;
      }

      this.$get = ['$q', 'CRUDResult', 'Workspace', 'Tile', 'TileType',
        function($q, CRUDResult, Workspace, Tile, TileType) {

          function Preset(workspaces) {
            this._id = guid();
            this._types = [];
            this._workspaces = {};
            this._currentWorkspace = null;

            this._loadTiles = function(workspace){ return new CRUDResult(true); };
            this._confirmAdd = function(workspace){ return new CRUDResult(true); };
            this._confirmRemove = function(workspace){ return new CRUDResult(true); };
            this._confirmUpdate = function(workspace){ return new CRUDResult(true); };

            this.construct(workspaces);
          }

          Preset.prototype.construct = function(workspaces){
            if (!workspaces instanceof Array) {
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
            }
          });

          Object.defineProperties(Preset.prototype, {
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

          function validateWorkspace(workspace) {
            if(typeof workspace !== 'object') {
              throw new DeveloperError('invalid workspace!');
            }

            if(!workspace instanceof Workspace){
              var temp = new Workspace();
              temp.init(workspace);
              workspace = temp;
            }

            if(isNullEmptyOrWhiteSpaces(workspace.id)){
              throw new DeveloperError('workspace id must be non empty string!');
            }

            if(isNullEmptyOrWhiteSpaces(workspace.name)){
              throw new DeveloperError('invalid workspace name!');
            }

            if(!isNullOrUndefined(workspace.modified) && !workspace.modified instanceof Date){
              throw new DeveloperError('invalid workspace modified value!');
            }

            if(!isNullOrUndefined(workspace.expires) && !workspace.expires instanceof Date){
              throw new DeveloperError('invalid workspace expires value!');
            }

            if(typeof workspace.rows !== 'number' || workspace.rows <= 0){
              throw new DeveloperError('invalid workspace rows value!');
            }

            if(typeof workspace.cols !== 'number' || workspace.cols <= 0){
              throw new DeveloperError('invalid workspace cols value!');
            }

            workspace.id = workspace.id.trim();
            workspace.name = workspace.name.trim();
            workspace.rows = Math.round(workspace.rows);
            workspace.cols = Math.round(workspace.cols);
            return workspace;
          }

          function validateTileType(tileType){
            if(typeof tileType !== 'object') {
              throw new DeveloperError('invalid tile type!');
            }

            if(!tileType instanceof TileType){
              var temp = new TileType();
              temp.init(tileType);
              tileType = temp;
            }

            if(isNullEmptyOrWhiteSpaces(tileType.name)){
              throw new DeveloperError('invalid tile type name!');
            }

            if(typeof tileType.creationInfo !== 'object'){
              throw new DeveloperError('invalid tile type creation info!');
            }

            if(typeof tileType.presentationInfo !== 'object'){
              throw new DeveloperError('invalid tile type presentation info!');
            }

            tileType.name = tileType.name.trim();
            return tileType;
          }

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
                  deferred.resolve(new CRUDResult(true, clonedWorkspace));
                }else{
                  deferred.reject(result);
                }

              },function resolveError(reason){
                deferred.reject(new CRUDResult(false, reason, ["can't add workspace!"]));
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

/**
 * Created by tzachit on 10/12/14.
 */

(function(app){

  app.factory('Workspace', [
    function(){

      function Workspace(id, name, modified, expires, rows, cols){
        this._id = id;
        this._name = name;
        this._modified = modified;
        this._expires = expires;
        this._rows = rows;
        this._cols = cols;
      }

      Workspace.prototype.init = function(args){
        if(typeof args !== 'object') return;
        this._id = args.id;
        this._name = args.name;
        this._modified = args.modified;
        this._expires = args.expires;
        this._rows = args.rows;
        this._cols = args.cols;
      };

      Object.defineProperties(Workspace.prototype, {
        id: {
          get: function(){ return this._id; },
          set: function(val) { this._id = val; }
        },
        name: {
          get: function(){ return this._name; },
          set: function(val) { this._name = val; }
        },
        modified: {
          get: function(){ return this._modified; },
          set: function(val) { this._modified = val; }
        },
        expires: {
          get: function(){ return this._expires; },
          set: function(val) { this._expires = val; }
        },
        rows: {
          get: function(){ return this._rows; },
          set: function(val) { this._rows = val; }
        },
        cols: {
          get: function(){ return this._cols; },
          set: function(val) { this._cols = val; }
        }
      });

      return Workspace;
    }
  ]);

}(angular.module('presetsApp')));

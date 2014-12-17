/**
 * Created by tzachit on 09/12/14.
 */

(function(app){

  'use strict';

  app.factory('TileType', ['CRUDResult',
    function(CRUDResult){

      function DeveloperError(message){
        this.message = message;
      }

      function TileType(name, creationInfo, presentationInfo, confirmAdd, confirmRemove, confirmUpdate){
        this._name = name;
        this._creationInfo = creationInfo;
        this._presentationInfo = presentationInfo;

        this._confirmAdd = null;
        this._confirmRemove = null;
        this._confirmUpdate = null;

        this.confirmAdd = confirmAdd || function(workspace, tile){ return new CRUDResult(true); };
        this.confirmRemove = confirmRemove || function(workspace, tile){ return new CRUDResult(true); };
        this.confirmUpdate = confirmUpdate || function(workspace, tile){ return new CRUDResult(true); };
      }

      TileType.prototype.init = function(args){
        if(typeof args !== 'object') return;
        this._name = args.name;
        this._creationInfo = args.creationInfo;
        this._presentationInfo = args.presentationInfo;
        this.confirmAdd = args.confirmAdd || function(workspace, tile){ return new CRUDResult(true); };
        this.confirmRemove = args.confirmRemove || function(workspace, tile){ return new CRUDResult(true); };
        this.confirmUpdate = args.confirmUpdate || function(workspace, tile){ return new CRUDResult(true); };
      };

      Object.defineProperties(TileType.prototype, {
        name:{
          get: function(){ return this._name; },
          set: function(val){ this._name = val; }
        },
        creationInfo: {
          get: function(){ return this._creationInfo;}
        },
        presentationInfo: {
          get: function(){ return this._presentationInfo; }
        }
      });

      Object.defineProperties(TileType.prototype, {
        confirmAdd: {
          get: function(){ return this._confirmAdd; },
          set: function (val) {
            if (typeof val !== 'function') {
              throw new DeveloperError('confirm add must be function!');
            }

            this._confirmAdd = val;
          }
        },
        confirmRemove: {
          get: function(){ return this._confirmRemove; },
          set: function (val) {
            if (typeof val !== 'function') {
              throw new DeveloperError('confirm remove must be function!');
            }

            this._confirmRemove = val;
          }
        },
        confirmUpdate: {
          get: function(){ return this._confirmUpdate; },
          set: function (val) {
            if (typeof val !== 'function') {
              throw new DeveloperError('confirm update must be function!');
            }

            this._confirmUpdate = val;
          }
        }
      });

      return TileType;
    }
  ]);

}(angular.module('presetsApp')));

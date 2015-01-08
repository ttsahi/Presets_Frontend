/**
 * Created by tzachit on 07/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('services', function(){
      describe('WorkspacesCache', function(){

        var WorkspacesCache, $rootScope, $q, $localStorage, CRUDResult;
        var presetId, lifetime, loadWorkspaceCallback, localOnly;

        beforeEach(inject(function(_WorkspacesCache_, _$rootScope_, _$q_, _$localStorage_, _CRUDResult_){
          WorkspacesCache = _WorkspacesCache_;
          $rootScope = _$rootScope_;
          $localStorage = _$localStorage_;
          CRUDResult = _CRUDResult_;
          $q = _$q_;

          presetId = '###-###-###';
          lifetime = 5000;
          loadWorkspaceCallback = angular.noop;
          localOnly = true;
        }));

        describe('construct', function(){
          it('should initialize some private members.', function(){
            var workspacesCache = new WorkspacesCache(presetId, lifetime, loadWorkspaceCallback, localOnly);

            expect(workspacesCache._presetId).toBe(presetId);
            expect(workspacesCache._lifetime).toBe(lifetime);
            expect(workspacesCache._loadWorkspaceCallback).toBe(loadWorkspaceCallback);
            expect(workspacesCache._localOnly).toBe(localOnly);
            expect(typeof $localStorage[presetId].created === 'number').toBeTruthy();
            expect(typeof $localStorage[presetId].workspaces === 'object').toBeTruthy();
            expect(typeof workspacesCache._onadd === 'function').toBeTruthy();
            expect(typeof workspacesCache._onrefresh === 'function').toBeTruthy();
          });
        });

        describe('properties', function(){

          var workspacesCache;

          beforeEach(function(){
            workspacesCache = new WorkspacesCache(presetId, lifetime, loadWorkspaceCallback, localOnly);
          });

          describe('storage', function(){
            it('should equals to $localStorage in key like presetId after initialization.', function(){
              expect(workspacesCache.storage).toBe($localStorage[presetId]);
            });
          });

          describe('lifetime', function(){
            it('should equals to _lifetime private member value.', function(){
              workspacesCache.lifetime = lifetime;
              expect(workspacesCache._lifetime).toBe(lifetime);
              expect(workspacesCache.lifetime).toBe(lifetime);
            });
          });

          describe('count', function(){
            it('should equals to the number of workspaces that in the cache.', function(){
              workspacesCache.storage.workspaces = { 1: {}, 2: {}, 3: {} };
              expect(workspacesCache.count).toBe(3);
            });
          });
        });

        describe('events', function(){
          var workspacesCache;

          beforeEach(function(){
            workspacesCache = new WorkspacesCache(presetId, lifetime, loadWorkspaceCallback, localOnly);
          });

          describe('onadd', function(){
            it('should equals to _onadd private member value.', function(){
              var callback = angular.noop;
              workspacesCache.onadd = callback;
              expect(workspacesCache._onadd).toBe(callback);
              expect(workspacesCache.onadd).toBe(callback);
            });
          });

          describe('onrefresh', function(){
            it('should equals to _refresh private member value.', function(){
              var callback = angular.noop;
              workspacesCache.onrefresh = callback;
              expect(workspacesCache._onrefresh).toBe(callback);
              expect(workspacesCache.onrefresh).toBe(callback);
            });
          });
        });

        describe('methods', function(){

          var workspacesCache;

          beforeEach(function(){
            workspacesCache = new WorkspacesCache(presetId, lifetime, loadWorkspaceCallback, localOnly);
          });

          describe('info', function(){
            it('should return object that describe presetId, lifetime, count and keys of the cache.', function(){
              workspacesCache.storage.workspaces = { 1: {}, 2: {}, 3: {} };
              var info = { presetId: presetId, lifetime: lifetime, count: 3, keys: ['1', '2', '3'] };
              expect(workspacesCache.info()).toEqual(info);
            });
          });

          describe('getAsync', function(){

            var workspace;

            beforeEach(function(){
              workspace = { id: '###-###-###', name: 'workspace1'};
              spyOn(workspacesCache, '_loadWorkspaceCallback').and.returnValue(
                $q(function(resolve, reject){
                  resolve(new CRUDResult(true, workspace, []));
                })
              );
            });

            it('should invoke exist(...) when called', function(){
              spyOn(workspacesCache, 'exist');
              workspacesCache.getAsync('###-###-###');
              expect(workspacesCache.exist).toHaveBeenCalled();
            });

            it('should invoke _loadWorkspaceCallback(...), put(...) and _onadd(...) when exist(...) return false.', function(){
              spyOn(workspacesCache, 'exist').and.returnValue(false);
              spyOn(workspacesCache, 'put');
              spyOn(workspacesCache, '_onadd');
              workspacesCache.getAsync('###-###-###');
              $rootScope.$digest();
              expect(workspacesCache.exist).toHaveBeenCalled();
              expect(workspacesCache._loadWorkspaceCallback).toHaveBeenCalled();
              expect(workspacesCache.put).toHaveBeenCalled();
              expect(workspacesCache._onadd).toHaveBeenCalled();
            });

            it('should invoke _loadWorkspaceCallback(...), update(...) and _onrefresh(...) when exist(...) return true and update needed.', function(){
              spyOn(workspacesCache, 'exist').and.returnValue(true);
              spyOn(workspacesCache, 'update');
              spyOn(workspacesCache, '_onrefresh');
              workspacesCache._localOnly = false;
              workspacesCache.getAsync('###-###-###', false, true);
              $rootScope.$digest();
              expect(workspacesCache.exist).toHaveBeenCalled();
              expect(workspacesCache._loadWorkspaceCallback).toHaveBeenCalled();
              expect(workspacesCache.update).toHaveBeenCalled();
              expect(workspacesCache._onrefresh).toHaveBeenCalled();
            });

            it('should return resolved promise with workspace when exist(...) return true and no update needed.', function(){
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [] } };
              spyOn(workspacesCache, 'exist').and.returnValue(true);
              var success = jasmine.createSpy('success');
              workspacesCache.getAsync('###-###-###').then(function(result){
                success();
                expect(result.workspace).toEqual(workspace);
              });
              $rootScope.$digest();
              expect(workspacesCache.exist).toHaveBeenCalled();
              expect(success).toHaveBeenCalled();
            });
          });

          describe('exist', function(){
            it('should check if storage.workspaces[workspaceId] exist.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1'};
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [] } };
              expect(workspacesCache.exist('###-###-###')).toBeTruthy();
            });
          });

          describe('put', function(){
            it('should add the given workspace to storage.workspaces.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1'};
              workspacesCache.put(workspace);
              expect(workspacesCache.storage.workspaces[workspace.id].workspace).toBe(workspace);
            });
          });

          describe('delete', function(){
            it('should delete the workspace with the given key from storage.workspaces.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1'};
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [] } };
              workspacesCache.delete('###-###-###');
              expect(workspacesCache.storage.workspaces[workspace.id]).toBeUndefined();
            });
          });

          describe('update', function(){
            it('should invoke put(...) when called with workspace that have tiles.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1', tiles: [1, 2, 3] };
              spyOn(workspacesCache, 'put');
              workspacesCache.update(workspace);
              expect(workspacesCache.put).toHaveBeenCalled();
            });

            it('should storage.workspaces[workspace.id] equals to the given workspace.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1', tiles: [] };
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [] } };
              spyOn(workspacesCache, 'put');
              workspacesCache.update(workspace);
              expect(workspacesCache.storage.workspaces[workspace.id].workspace).toEqual(workspace);
            });
          });

          describe('findTile', function(){
            it('should return tile details if existing in the cache.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1', tiles: [] };
              var tile = { id: '###-###-###', position: 1, size: { width: 1, height: 1 }, type: 'tile1', model: {} };
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [tile] } };
              expect(workspacesCache.findTile(workspace.id, tile.id)).toBe(tile);
            });

            it('should return null if tile not exist in the cache.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1', tiles: [] };
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [] } };
              expect(workspacesCache.findTile('###-###-###', '###-###-###')).toBeNull()
            });
          });

          describe('getTileAsync', function(){

            var workspace, tile;

            beforeEach(function(){
              tile = { id: '###-###-###', position: 1, size: { width: 1, height: 1 }, type: 'tile1', model: {} };
              workspace = { id: '###-###-###', name: 'workspace1', tiles: [tile]};
              spyOn(workspacesCache, '_loadWorkspaceCallback').and.returnValue(
                $q(function(resolve, reject){
                  resolve(new CRUDResult(true, workspace, []));
                })
              );
            });

            it('should invoke exist(...) when called and _localOnly = false', function(){
              workspacesCache._localOnly = false;
              spyOn(workspacesCache, 'exist');
              workspacesCache.getTileAsync('###-###-###', '###-###-###');
              expect(workspacesCache.exist).toHaveBeenCalled();
            });

            it('should invoke _loadWorkspaceCallback(...), put(...) and _onadd(...) when exist(...) return false and _localOnly = false.', function(){
              workspacesCache._localOnly = false;
              spyOn(workspacesCache, 'exist').and.returnValue(false);
              spyOn(workspacesCache, 'put').and.callThrough();
              spyOn(workspacesCache, '_onadd');
              workspacesCache.getTileAsync('###-###-###', '###-###-###');
              $rootScope.$digest();
              expect(workspacesCache.exist).toHaveBeenCalled();
              expect(workspacesCache._loadWorkspaceCallback).toHaveBeenCalled();
              expect(workspacesCache.put).toHaveBeenCalled();
              expect(workspacesCache._onadd).toHaveBeenCalled();
            });

            it('should invoke _loadWorkspaceCallback(...), update(...) and _onrefresh(...) when exist(...) return true and update needed.', function(){
              workspacesCache._localOnly = false;
              workspacesCache.put(workspace);
              spyOn(workspacesCache, 'exist').and.returnValue(true);
              spyOn(workspacesCache, 'update').and.callThrough();
              spyOn(workspacesCache, '_onrefresh');
              workspacesCache.getTileAsync('###-###-###', '###-###-###', true);
              $rootScope.$digest();
              expect(workspacesCache.exist).toHaveBeenCalled();
              expect(workspacesCache._loadWorkspaceCallback).toHaveBeenCalled();
              expect(workspacesCache.update).toHaveBeenCalled();
              expect(workspacesCache._onrefresh).toHaveBeenCalled();
            });

            it('should return resolved promise with workspace when exist(...) return true and no update needed.', function(){
              workspacesCache.put(workspace);
              var success = jasmine.createSpy('success');
              workspacesCache.getTileAsync('###-###-###', '###-###-###').then(function(result){
                success();
                expect(result.workspace).toEqual(tile);
              });
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });
          });

          describe('tileExist', function(){
            it('should return true when the requested tile exist in cache.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1', tiles: [] };
              var tile = { id: '###-###-###', position: 1, size: { width: 1, height: 1 }, type: 'tile1', model: {} };
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [tile] } };
              expect(workspacesCache.tileExist(workspace.id, tile.id)).toBeTruthy();
            });

            it('should return false when the requested tile not exist in cache.', function(){
              expect(workspacesCache.tileExist('###-###-###', '###-###-###')).toBeFalsy();
            });
          });

          describe('addTile', function(){
            it('should add the tile to cache when called.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1', tiles: [] };
              var tile = { id: '###-###-###', position: 1, size: { width: 1, height: 1 }, type: 'tile1', model: {} };
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [] } };
              workspacesCache.addTile(workspace.id, tile);
              expect(workspacesCache.storage.workspaces[workspace.id].tiles[0]).toEqual(tile);
            });
          });

          describe('removeTile', function(){
            it('should remove the tile from the cache.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1', tiles: [] };
              var tile = { id: '###-###-###', position: 1, size: { width: 1, height: 1 }, type: 'tile1', model: {} };
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [tile] } };
              workspacesCache.removeTile(workspace.id, tile.id);
              expect(workspacesCache.storage.workspaces[workspace.id].tiles.length).toBe(0)
            });
          });

          describe('updateTile', function(){
            it('should update tile by workspace id in cache.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1', tiles: [] };
              var oldTile = { id: '###-###-###', position: 1, size: { width: 1, height: 1 }, type: 'tile1', model: {} };
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [oldTile] } };
              var newTile = { id: '###-###-###', position: 1, size: { width: 2, height: 2 }, type: 'tile2', model: {} };
              workspacesCache.updateTile(workspace.id, newTile);
              expect(workspacesCache.storage.workspaces[workspace.id].tiles[0]).toBe(newTile);
            });
          });

          describe('updateTileSize', function(){
            it('should update the requested tile position and size.', function(){
              var workspace = { id: '###-###-###', name: 'workspace1', tiles: [] };
              var tile = { id: '###-###-###', position: 1, size: { width: 1, height: 1 }, type: 'tile1', model: {} };
              workspacesCache.storage.workspaces = { '###-###-###': { workspace: workspace, tiles: [tile] } };
              var resizeInfo = { position: 2, size: { width: 2, height: 2 } };
              workspacesCache.updateTileSize(workspace.id, tile.id, resizeInfo);
              expect(tile.position).toBe(resizeInfo.position);
              expect(tile.size.width).toBe(resizeInfo.size.width);
              expect(tile.size.height).toBe(resizeInfo.size.height);
            });
          });
        });
      });
    });
  });
});

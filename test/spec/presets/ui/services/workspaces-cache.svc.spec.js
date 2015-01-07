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
        });
      });
    });
  });
});

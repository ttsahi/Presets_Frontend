/**
 * Created by tzachit on 30/12/14.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  beforeEach(function(){
    jasmine.addMatchers({
      toBeInstanceOf: function(){
        return {
          compare: function(actual, expected){
            var result = {};
            result.message = "Expected " + actual.constructor.name + " to be is instance of " + expected.name;
            result.pass = actual instanceof expected;
            return result;
          }
        };
      },
      toHaveTheSameValuesAs: function(util, customEqualityTesters){
        return {
          compare: function(actual, expected){
            var result = {};
            result.message = "Expected " + actual + " to have the same values as " + expected;
            result.pass = true;
            for(var i = 0; i < expected.length; i++){
              if(!util.contains(actual, expected[i], customEqualityTesters)){
                result.pass = false;
              }
            }
            return result;
          }
        };
      }
    });
  });

  describe('ui', function(){
    describe('classes', function(){
      describe('Preset', function(){

        var Preset = null;
        beforeEach(inject(function(_Preset_){
          Preset = _Preset_;
        }));

        describe('initialize', function(){
          it('should run construct function when new Preset instance created.', function(){
            spyOn(Preset.prototype, 'construct');

            var preset = new Preset();
            expect(preset.construct).toHaveBeenCalled();

            var options = {};
            preset = new Preset(options);
            expect(preset.construct).toHaveBeenCalledWith(options);
          });

          it('should run _initWorkspacesList function when construct function have been called.', function(){
            spyOn(Preset.prototype, '_initWorkspacesList');

            var preset = new Preset();
            expect(preset._initWorkspacesList).toHaveBeenCalled();
          });
        });

        describe('properties', function(){

          describe('id', function(){
            it('should id property value equals _id private member value.', function(){
              var preset = new Preset();
              expect(preset.id).toBe(preset._id);
            });
          });

          describe('types', function(){
            it('should types property equals _types private member.', function(){
              var preset = new Preset();
              expect(preset.types).toBe(preset._types);
            });
          });

          describe('useCache', function(){
            it('should useCache property value equals _useCache private member value.', function(){
              var preset = new Preset();
              expect(preset.useCache).toBe(preset._useCache);
            });
          });

          describe('currentWorkspace', function(){
            it('should currentWorkspace property value equals _currentWorkspace private member value.', function(){
              var preset = new Preset();
              preset.currentWorkspace = {};
              expect(preset.currentWorkspace).toEqual(preset._currentWorkspace);
            });
          });

          describe('workspaceCount', function(){
            it('should workspacesCount property value equals _workspacesList private member length.', function(){
              var preset = new Preset();
              preset._workspacesList = {a: 1, b: 2, c: 3};
              expect(preset.workspacesCount).toBe(3);
            });
          });

          describe('workspaceList', function(){
            it('should workspacesList property equals _workspacesListArr private member.', function(){
              var preset = new Preset();
              preset._workspacesListArr = [1, 2, 3, 4];
              expect(preset.workspacesList).toBe(preset._workspacesListArr);
            });
          });

        });

        describe('events', function(){

          describe('loadWorkspaceList', function(){
            it('should loadWorkspacesList property return _loadWorkspacesList private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.loadWorkspacesList = callback;
              expect(preset._loadWorkspacesList).toBe(callback);
              expect(function(){ preset.loadWorkspacesList = {}; }).toThrow();
            });
          });

          describe('loadWorkspace', function(){
            it('should loadWorkspace property return _loadWorkspace private member or throw an exception if set to non function value', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.loadWorkspace = callback;
              expect(preset._loadWorkspace).toBe(callback);
              expect(function(){ preset.loadWorkspace = {}; }).toThrow();
            });
          });

          describe('loadTile', function(){
            it('should loadTile property return _loadTile private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.loadTile = callback;
              expect(preset._loadTile).toBe(callback);
              expect(function(){ preset.loadTile = {}; }).toThrow();
            });
          });

          describe('confirmAdd', function(){
            it('should confirmAdd property return _confirmAdd private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.confirmAdd = callback;
              expect(preset._confirmAdd).toBe(callback);
              expect(function(){ preset.confirmAdd = {}; }).toThrow();
            });
          });

          describe('confirmRemove', function(){
            it('should confirmRemove property return _confirmRemove private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.confirmRemove = callback;
              expect(preset._confirmRemove).toBe(callback);
              expect(function(){ preset.confirmRemove = {}; }).toThrow();
            });
          });

          describe('confirmUpdate', function(){
            it('should confirmUpdate property return _confirmUpdate private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.confirmUpdate = callback;
              expect(preset._confirmUpdate).toBe(callback);
              expect(function(){ preset.confirmUpdate = {}; }).toThrow();
            });
          });

          describe('commitChanges', function(){
            it('should commitChanges property return _commitChanges private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.commitChanges = callback;
              expect(preset._commitChanges).toBe(callback);
              expect(function(){ preset.commitChanges = {}; }).toThrow();
            });
          });

          describe('onAddToCache', function(){
            it('should onAddToCache property add _onAddToCacheListeners onAddToCache listener or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.onAddToCache = callback;
              expect(preset._onAddToCacheListeners).toContain(callback);
              expect(function(){ preset.onAddToCache = {}; }).toThrow();
            });
          });

          describe('onRefreshCache', function(){
            it('should onRefreshCache property add _onRefreshCacheListeners onRefreshCache listener or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.onRefreshCache = callback;
              expect(preset._onRefreshCacheListeners).toContain(callback);
              expect(function(){ preset.onRefreshCache = {}; }).toThrow();
            });
          });

          describe('onAddWorkspace', function(){
            it('should onAddWorkspace property return _onAddWorkspace private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.onAddWorkspace = callback;
              expect(preset._onAddWorkspace).toBe(callback);
              expect(function(){ preset.onAddWorkspace = {}; }).toThrow();
            });
          });

          describe('onRemoveWorkspace', function(){
            it('should onRemoveWorkspace property return _onRemoveWorkspace private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.onRemoveWorkspace = callback;
              expect(preset._onRemoveWorkspace).toBe(callback);
              expect(function(){ preset.onRemoveWorkspace = {}; }).toThrow();
            });
          });

          describe('onUpdateWorkspace', function(){
            it('should onUpdateWorkspace property return _onUpdateWorkspace private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.onUpdateWorkspace = callback;
              expect(preset._onUpdateWorkspace).toBe(callback);
              expect(function(){ preset.onUpdateWorkspace = {}; }).toThrow();
            });
          });

          describe('onWorkspaceChanged', function(){
            it('should onWorkspaceChanged property return _onWorkspaceChanged private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.onWorkspaceChanged = callback;
              expect(preset._onWorkspaceChanged).toBe(callback);
              expect(function(){ preset.onWorkspaceChanged = {}; }).toThrow();
            });
          });

          describe('onAddTile', function(){
            it('should onAddTile property return _onAddTile private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.onAddTile = callback;
              expect(preset._onAddTile).toBe(callback);
              expect(function(){ preset.onAddTile = {}; }).toThrow();
            });
          });

          describe('onRemoveTile', function(){
            it('should onRemoveTile property return _onRemoveTile private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.onRemoveTile = callback;
              expect(preset._onRemoveTile).toBe(callback);
              expect(function(){ preset.onRemoveTile = {}; }).toThrow();
            });
          });

          describe('onUpdateTile', function(){
            it('should onUpdateTile property return _onUpdateTile private member or throw an exception if set to non function value.', function(){
              var preset = new Preset();
              var callback = function(){};
              preset.onUpdateTile = callback;
              expect(preset._onUpdateTile).toBe(callback);
              expect(function(){ preset.onUpdateTile = {}; }).toThrow();
            });
          });

        });

        describe('methods', function(){
          var $rootScope, $q, CRUDResult;

          beforeEach(inject(function(_$rootScope_, _$q_, _CRUDResult_){
            $rootScope = _$rootScope_;
            $q = _$q_;
            CRUDResult = _CRUDResult_;
          }));

          describe('generateId', function(){
            it('should return valid guid string.', function(){
              expect(new Preset().generateId()).toMatch('^(\\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\\}{0,1})$');
            });
          });

          describe('_wrappedLoadWorkspace', function(){
            it('should return instance of CRUDResult when _loadWorkspace func implemented correctly.', function(){
              var preset = new Preset();
              spyOn(preset, '_loadWorkspace').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, {
                    id: preset.generateId(),
                    name: 'some workspace',
                    modified: new Date(),
                    expires: new Date(),
                    description: '',
                    rows: 4,
                    cols: 5,
                    tiles: []
                  }, []));
                });
              });

              var success = jasmine.createSpy('success');
              preset._wrappedLoadWorkspace().then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
              });

              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });

            it('should throw DeveloperError when _loadWorkspace func not implemented correctly.', function(){
              var preset = new Preset();
              spyOn(preset, '_loadWorkspace').and.callFake(angular.noop);
              preset._wrappedLoadWorkspace();
              expect(function(){ $rootScope.$digest(); }).toThrow();
            });
          });

          describe('_wrappedLoadTile', function(){
            it('should return instance of CRUDResult when _loadTile func implemented correctly.', function(){
              var preset = new Preset();
              spyOn(preset, '_loadTile').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, {
                    id: preset.generateId(),
                    position: 1,
                    size: { width: 1, height: 1},
                    type: 'web page',
                    model: {}
                  }, []));
                });
              });

              var success = jasmine.createSpy('success');
              preset._wrappedLoadTile().then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
              });

              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });

            it('should throw DeveloperError when _loadTile func not implemented correctly.', function(){
              var preset = new Preset();
              spyOn(preset, '_loadTile').and.callFake(angular.noop);
              preset._wrappedLoadTile();
              expect(function(){ $rootScope.$digest(); }).toThrow();
            });
          });

          describe('_initWorkspacesList', function(){
            it('should invoke refreshWorkspacesListArr func when _loadWorkspacesList func implemented correctly.', function(){
              var preset = new Preset();
              spyOn(preset, '_loadWorkspacesList').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, [], []));
                });
              });

              spyOn(preset, 'refreshWorkspacesListArr');

              preset._initWorkspacesList();
              $rootScope.$digest();

              expect(preset.refreshWorkspacesListArr).toHaveBeenCalled();
            });

            it('should throw DeveloperError when _loadWorkspacesList func not implemented correctly.', function(){
              var preset = new Preset();
              spyOn(preset, '_loadWorkspacesList').and.callFake(angular.noop);
              preset._initWorkspacesList();
              expect(function(){ $rootScope.$digest(); }).toThrow();
            });
          });

          describe('_workspacesListArr', function(){
            it('_workspacesListArr should have the same values as _workspacesList when call to refreshWorkspacesListArr func.', function(){
              var preset = new Preset();
              preset._workspacesList = { 0: 'A', 1: 'B', 2: 'C' };
              var workspaceListArr = ['A', 'B', 'C'];
              preset.refreshWorkspacesListArr();
              expect(preset._workspacesListArr).toHaveTheSameValuesAs(workspaceListArr);
            });
          });

          describe('getWorkspaceAsync', function(){
            it('should invoke _workspacesCache.getAsync(...) when _useCache = true and return instance of CRUDResult.', function(){
              var preset = new Preset();
              preset._useCache = true;

              spyOn(preset._workspacesCache, 'getAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve({workspace: 5});
                });
              });

              var success = jasmine.createSpy('success');
              preset.getWorkspaceAsync().then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
                expect(result.data).toBe(5);
              });

              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });

            it('should invoke _wrappedLoadWorkspace(...) when _useCache = false and return instance of CRUDResult.', function(){
              var preset = new Preset();
              preset._useCache = false;

              spyOn(preset, '_wrappedLoadWorkspace').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, 5, []));
                });
              });

              var success = jasmine.createSpy('success');
              preset.getWorkspaceAsync().then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
                expect(result.data).toBe(5);
              });

              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });
          });

          describe('getTileAsync', function(){
            it('should invoke _workspacesCache.getTileAsync(...) when _useCache = true and return instance of CRUDResult.', function(){
              var preset = new Preset();
              preset._useCache = true;

              spyOn(preset._workspacesCache, 'getTileAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve({workspace: 5});
                });
              });

              var success = jasmine.createSpy('success');
              preset.getTileAsync().then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
                expect(result.data).toBe(5);
              });

              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });

            it('should invoke _wrappedLoadTile(...) when _useCache = false and return instance of CRUDResult.', function(){
              var preset = new Preset();
              preset._useCache = false;

              spyOn(preset, '_wrappedLoadTile').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, 5, []));
                });
              });

              var success = jasmine.createSpy('success');
              preset.getTileAsync().then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
                expect(result.data).toBe(5);
              });

              $rootScope.$digest();
              expect(preset._wrappedLoadTile).toHaveBeenCalled();
              expect(success).toHaveBeenCalled();
            });
          });

          describe('addWorkspaceAsync', function(){
            var preset, workspace;

            beforeEach(function(){
              preset = new Preset();
              workspace = {
                id: preset.generateId(),
                name: 'some workspace',
                modified: new Date(),
                expires: new Date(),
                description: '',
                rows: 4,
                cols: 5,
                tiles: []
              };
            });

            it('should throw exception when called with invalid workspace.', function(){
              expect(function(){ preset.addWorkspaceAsync({})}).toThrow();
            });

            it('should invoke confirmAdd(...) when called with confirm = true.', function(){
              spyOn(preset, 'confirmAdd').and.callFake(function(){
                return new CRUDResult(true, workspace, []);
              });
              preset.addWorkspaceAsync(workspace, true);
              $rootScope.$digest();
              expect(preset.confirmAdd).toHaveBeenCalled();
            });

            it('should throw exception when confirmAdd(...) not implemented correctly', function(){
              spyOn(preset, 'confirmAdd').and.callFake(angular.noop);
              preset.addWorkspaceAsync(workspace, true);
              expect(function(){ $rootScope.$digest(); }).toThrow();
            });

            it('should return instance of CRUDResult when called with valid workspace', function(){
              spyOn(preset, 'confirmAdd').and.callFake(function(){
                return new CRUDResult(true, workspace, []);
              });
              var success = jasmine.createSpy('success');
              preset.addWorkspaceAsync(workspace).then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
              });
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });
          });

          describe('removeWorkspaceAsync', function(){
            var preset, workspace;

            beforeEach(function(){
              preset = new Preset();
              workspace = {
                id: preset.generateId(),
                name: 'some workspace',
                modified: new Date(),
                expires: new Date(),
                description: '',
                rows: 4,
                cols: 5,
                tiles: []
              };
              spyOn(preset, 'getWorkspaceAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, workspace, []));
                });
              });
            });

            it('should return rejected promise when called with id that doesn\'t exist in _workspacesList.', function(){
              var error = jasmine.createSpy('error');
              preset.removeWorkspaceAsync('gfjdj-dkfkld-dfsd').then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should invoke confirmRemove(...) when called with confirm = true.', function(){
              spyOn(preset, 'confirmRemove').and.callFake(function(){
                return new CRUDResult(true, {}, []);
              });
              preset._workspacesList['gfjdj-dkfkld-dfsd'] = {};
              preset.removeWorkspaceAsync('gfjdj-dkfkld-dfsd', true);
              $rootScope.$digest();
              expect(preset.confirmRemove).toHaveBeenCalled();
            });

            it('should throw exception when confirmRemove(...) not implemented correctly.', function(){
              spyOn(preset, 'confirmRemove').and.callFake(function(){
                return {};
              });
              preset._workspacesList['gfjdj-dkfkld-dfsd'] = {};
              preset.removeWorkspaceAsync('gfjdj-dkfkld-dfsd', true);
              expect(function(){ $rootScope.$digest(); }).toThrow();
            });

            it('should return resolved CRUDResult promise when called with valid workspace id.', function(){
              preset._workspacesList['gfjdj-dkfkld-dfsd'] = {};
              var success = jasmine.createSpy('success');
              preset.removeWorkspaceAsync('gfjdj-dkfkld-dfsd').then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
              });
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });
          });

          describe('updateWorkspaceAsync', function(){
            var preset, workspace;

            beforeEach(function(){
              preset = new Preset();
              preset._useCache = false;
              workspace = {
                id: preset.generateId(),
                name: 'some workspace',
                modified: new Date(),
                expires: new Date(),
                description: '',
                rows: 4,
                cols: 5,
                tiles: []
              };
              spyOn(preset, 'getWorkspaceAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, workspace, []));
                });
              });
            });

            it('should return rejected promise when called with id that doesn\'t exist in _workspacesList.', function(){
              var error = jasmine.createSpy('error');
              preset.updateWorkspaceAsync(workspace.id).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should return rejected promise when called with data that isn\'t object.', function(){
              var error = jasmine.createSpy('error');
              preset._workspacesList[workspace.id] = {};
              preset.updateWorkspaceAsync(workspace.id, null).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should return rejected promise when called with data.id that not match id.', function(){
              var error = jasmine.createSpy('error');
              preset._workspacesList[workspace.id] = {};
              preset.updateWorkspaceAsync(workspace.id, {id: '4534-45m5m5-435345'}).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should return rejected promise when called with data that try to change tiles property.', function(){
              var error = jasmine.createSpy('error');
              preset._workspacesList[workspace.id] = {};
              preset.updateWorkspaceAsync(workspace.id, {tiles: [1, 2, 3]}).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should invoke confirmUpdate(...) when called with confirm = true.', function(){
              spyOn(preset, 'confirmUpdate').and.callFake(function(){
                return new CRUDResult(true, {}, []);
              });
              preset._workspacesList[workspace.id] = {};
              preset.updateWorkspaceAsync(workspace.id, {name: 'anonymous'}, true);
              $rootScope.$digest();
              expect(preset.confirmUpdate).toHaveBeenCalled();
            });

            it('should invoke refreshWorkspacesListArr() and _onUpdateWorkspace() when called with valid params', function(){
              spyOn(preset, 'refreshWorkspacesListArr');
              spyOn(preset, '_onUpdateWorkspace');
              preset._workspacesList[workspace.id] = {};
              preset.updateWorkspaceAsync(workspace.id, {name: 'anonymous'});
              $rootScope.$digest();
              expect(preset.refreshWorkspacesListArr).toHaveBeenCalled();
              expect(preset._onUpdateWorkspace).toHaveBeenCalled();
            });

            it('should return resolved CRUDResult promise when called with valid params.', function(){
              var success = jasmine.createSpy('success');
              preset._workspacesList[workspace.id] = {};
              preset.updateWorkspaceAsync(workspace.id, {name: 'anonymous'}).then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
              });
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });

          });

          describe('addTileAsync', function(){
            var WorkspaceData, preset, workspace, tile;

            beforeEach(inject(function(_WorkspaceData_){
              WorkspaceData = _WorkspaceData_;
            }));

            beforeEach(function(){
              preset = new Preset();
              preset._useCache = false;
              workspace = {
                id: preset.generateId(),
                name: 'some workspace',
                modified: new Date(),
                expires: new Date(),
                description: '',
                rows: 4,
                cols: 5,
                tiles: []
              };
              tile = {
                id: preset.generateId(),
                position: 1,
                size: { width: 1, height: 1},
                type: 'type1',
                model: {}
              };
              spyOn(preset, 'getWorkspaceAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, workspace, []));
                });
              });
            });

            it('should return rejected promise when called with tile.type that doesn\'t exist.', function(){
              var error = jasmine.createSpy('error');
              preset._workspacesList[workspace.id] = {};
              preset.addTileAsync(workspace.id, tile).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should return rejected promise when called with workspace id that doesn\'t exist in _workspacesList.', function(){
              var error = jasmine.createSpy('error');
              preset._types[tile.type] = {};
              preset.addTileAsync(workspace.id, tile).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should invoke _currentWorkspaceData.addTileAsync(...) when workspaceId = _currentWorkspaceData.id.', function(){
              preset._currentWorkspaceData = new WorkspaceData(preset, workspace);
              spyOn(preset._currentWorkspaceData, 'addTileAsync');
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = {};
              preset.addTileAsync(workspace.id, tile);
              $rootScope.$digest();
              expect(preset._currentWorkspaceData.addTileAsync).toHaveBeenCalled();
            });

            it('should return rejected promise when _useCache = true and tile already exist in cache.', function(){
              preset._useCache = true;
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = {};
              workspace.tiles.push(tile);
              preset._workspacesCache.put(workspace);
              var error = jasmine.createSpy('error');
              preset.addTileAsync(workspace.id, tile).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should invoke tile.type.confirmAdd(...) when confirm = true', function(){
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = { confirmAdd: function(){ return new CRUDResult(true, {}, []); } };
              spyOn(preset._types[tile.type], 'confirmAdd').and.callThrough();
              preset.addTileAsync(workspace.id, tile, true);
              $rootScope.$digest();
              expect(preset._types[tile.type].confirmAdd).toHaveBeenCalled();
            });

            it('should throw exception when tile.type.confirmAdd(...) not implemented correctly.', function(){
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = { confirmAdd: angular.noop };
              preset.addTileAsync(workspace.id, tile, true);
              expect(function(){ $rootScope.$digest(); }).toThrow();
            });

            it('should invoke _onAddTile(...) and return resolved CRUDResult promise when called with valid params.', function(){
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = { confirmAdd: function(){ return new CRUDResult(true, {}, []); } };
              spyOn(preset, '_onAddTile');
              var success = jasmine.createSpy('success');
              preset.addTileAsync(workspace.id, tile, true).then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
              });
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
              expect(preset._onAddTile).toHaveBeenCalled();
            });

          });

          describe('removeTileAsync', function(){
            var WorkspaceData, preset, workspace, tile;

            beforeEach(inject(function(_WorkspaceData_){
              WorkspaceData = _WorkspaceData_;
            }));

            beforeEach(function(){
              preset = new Preset();
              preset._useCache = false;
              workspace = {
                id: preset.generateId(),
                name: 'some workspace',
                modified: new Date(),
                expires: new Date(),
                description: '',
                rows: 4,
                cols: 5,
                tiles: []
              };
              tile = {
                id: preset.generateId(),
                position: 1,
                size: { width: 1, height: 1},
                type: 'type1',
                model: {}
              };
              spyOn(preset, 'getWorkspaceAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, workspace, []));
                });
              });
              spyOn(preset, 'getTileAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, tile, []));
                });
              });
            });

            it('should return rejected promise when called with workspace id that doesn\'t exist in _workspacesList.', function(){
              var error = jasmine.createSpy('error');
              preset._types[tile.type] = {};
              preset.removeTileAsync(workspace.id, tile.id).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should invoke _currentWorkspaceData.removeTileByIdAsync(...) when workspaceId = _currentWorkspaceData.id.', function(){
              preset._currentWorkspaceData = new WorkspaceData(preset, workspace);
              spyOn(preset._currentWorkspaceData, 'removeTileByIdAsync');
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = {};
              preset.removeTileAsync(workspace.id, tile.id);
              $rootScope.$digest();
              expect(preset._currentWorkspaceData.removeTileByIdAsync).toHaveBeenCalled();
            });

            it('should return rejected promise when _useCache = true and tile doesn\'t exist in cache.', function(){
              preset._useCache = true;
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = {};
              var error = jasmine.createSpy('error');
              preset.removeTileAsync(workspace.id, tile.id).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should invoke tile.type.confirmRemove(...) when confirm = true', function(){
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = { confirmRemove: function(){ return new CRUDResult(true, {}, []); } };
              spyOn(preset._types[tile.type], 'confirmRemove').and.callThrough();
              preset.removeTileAsync(workspace.id, tile.id, true);
              $rootScope.$digest();
              expect(preset._types[tile.type].confirmRemove).toHaveBeenCalled();
            });

            it('should throw exception when tile.type.confirmRemove(...) not implemented correctly.', function(){
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = { confirmRemove: angular.noop };
              preset.removeTileAsync(workspace.id, tile.id, true);
              expect(function(){ $rootScope.$digest(); }).toThrow();
            });

            it('should invoke _onRemoveTile(...) and return resolved CRUDResult promise when called with valid params.', function(){
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = { confirmRemove: function(){ return new CRUDResult(true, {}, []); } };
              spyOn(preset, '_onRemoveTile');
              var success = jasmine.createSpy('success');
              preset.removeTileAsync(workspace.id, tile.id, true).then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
              });
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
              expect(preset._onRemoveTile).toHaveBeenCalled();
            });

          });

          describe('updateTileAsync', function(){
            var WorkspaceData, preset, workspace, tile;

            beforeEach(inject(function(_WorkspaceData_){
              WorkspaceData = _WorkspaceData_;
            }));

            beforeEach(function(){
              preset = new Preset();
              preset._useCache = false;
              workspace = {
                id: preset.generateId(),
                name: 'some workspace',
                modified: new Date(),
                expires: new Date(),
                description: '',
                rows: 4,
                cols: 5,
                tiles: []
              };
              tile = {
                id: preset.generateId(),
                position: 1,
                size: { width: 1, height: 1},
                type: 'type1',
                model: {}
              };
              spyOn(preset, 'getWorkspaceAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, workspace, []));
                });
              });
              spyOn(preset, 'getTileAsync').and.callFake(function(){
                return $q(function(resolve, reject){
                  resolve(new CRUDResult(true, tile, []));
                });
              });
            });

            it('should return rejected promise when called with workspace id that doesn\'t exist in _workspacesList.', function(){
              var error = jasmine.createSpy('error');
              preset._types[tile.type] = {};
              preset.updateTileAsync(workspace.id, tile.id, {}).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should invoke _currentWorkspaceData.updateTileByIdAsync(...) when workspaceId = _currentWorkspaceData.id.', function(){
              preset._currentWorkspaceData = new WorkspaceData(preset, workspace);
              spyOn(preset._currentWorkspaceData, 'updateTileByIdAsync');
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = {};
              preset.updateTileAsync(workspace.id, tile.id, {});
              $rootScope.$digest();
              expect(preset._currentWorkspaceData.updateTileByIdAsync).toHaveBeenCalled();
            });

            it('should return rejected promise when _useCache = true and tile doesn\'t exist in cache.', function(){
              preset._useCache = true;
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = {};
              var error = jasmine.createSpy('error');
              preset.updateTileAsync(workspace.id, tile.id, []).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should invoke tile.type.confirmUpdate(...) when confirm = true', function(){
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = { confirmUpdate: function(){ return new CRUDResult(true, {}, []); } };
              spyOn(preset._types[tile.type], 'confirmUpdate').and.callThrough();
              preset.updateTileAsync(workspace.id, tile.id, {}, true);
              $rootScope.$digest();
              expect(preset._types[tile.type].confirmUpdate).toHaveBeenCalled();
            });

            it('should throw exception when tile.type.confirmUpdate(...) not implemented correctly.', function(){
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = { confirmUpdate: angular.noop };
              preset.updateTileAsync(workspace.id, tile.id, {}, true);
              expect(function(){ $rootScope.$digest(); }).toThrow();
            });

            it('should invoke _onUpdateTile(...) and return resolved CRUDResult promise when called with valid params.', function(){
              preset._workspacesList[workspace.id] = {};
              preset._types[tile.type] = { confirmUpdate: function(){ return new CRUDResult(true, {}, []); } };
              spyOn(preset, '_onUpdateTile');
              var success = jasmine.createSpy('success');
              preset.updateTileAsync(workspace.id, tile.id, {}, true).then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
              });
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
              expect(preset._onUpdateTile).toHaveBeenCalled();
            });

          });

          describe('registerType', function(){

            var TileType, preset;

            beforeEach(inject(function(_TileType_){
              TileType = _TileType_;
              preset = new Preset();
            }));

            it('should throw exception when called with invalid type.', function(){
              expect(function(){ preset.registerType({}); }).toThrow();
            });

            it('should throw exception if when called with type that his name already exist.', function(){
              preset._types['type1'] = {};
              var type = new TileType('type1', {}, {});
              expect(function(){ preset.registerType(type); }).toThrow();
            });

            it('should set _types with new type info when called with valid type.', function(){
              var type = new TileType('type1', {}, {});
              preset.registerType(type);
              expect(preset._types[type.name]).toEqual(type);
            });
          });

          describe('registerTypes', function(){

            var TileType, preset;

            beforeEach(inject(function(_TileType_){
              TileType = _TileType_;
              preset = new Preset();
            }));

            it('should return false when called with non array value.', function(){
              expect(preset.registerTypes({})).toBeFalsy();
            });

            it('should invoke registerType(...) types.length times when called with valid types array.', function(){
              spyOn(preset, 'registerType');
              var types = [new TileType('type1', {}, {}), new TileType('type2', {}, {}), new TileType('type3', {}, {})];
              preset.registerTypes(types);
              expect(preset.registerType.calls.count()).toEqual(3);
            });
          });
        });
      });
    });
  });
});

/**
 * Created by tzachit on 30/12/14.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

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

          it('should id property value equals _id private member value.', function(){
            var preset = new Preset();
            expect(preset.id).toBe(preset._id);
          });

          it('should types property equals _types private member.', function(){
            var preset = new Preset();
            expect(preset.types).toBe(preset._types);
          });

          it('should useCache property value equals _useCache private member value.', function(){
            var preset = new Preset();
            expect(preset.useCache).toBe(preset._useCache);
          });

          it('should currentWorkspace property value equals _currentWorkspace private member value.', function(){
            var preset = new Preset();
            preset.currentWorkspace = {};
            expect(preset.currentWorkspace).toEqual(preset._currentWorkspace);
          });

          it('should workspacesCount property value equals _workspacesList private member length.', function(){
            var preset = new Preset();
            preset._workspacesList = {a: 1, b: 2, c: 3};
            expect(preset.workspacesCount).toBe(3);
          });

          it('should workspacesList property equals _workspacesListArr private member.', function(){
            var preset = new Preset();
            preset._workspacesListArr = [1, 2, 3, 4];
            expect(preset.workspacesList).toBe(preset._workspacesListArr);
          });
        });

        describe('events', function(){

          it('should loadWorkspacesList property return _loadWorkspacesList private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.loadWorkspacesList = callback;
            expect(preset._loadWorkspacesList).toBe(callback);
            expect(function(){ preset.loadWorkspacesList = {}; }).toThrow();
          });

          it('should loadWorkspace property return _loadWorkspace private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.loadWorkspace = callback;
            expect(preset._loadWorkspace).toBe(callback);
            expect(function(){ preset.loadWorkspace = {}; }).toThrow();
          });

          it('should loadTile property return _loadTile private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.loadTile = callback;
            expect(preset._loadTile).toBe(callback);
            expect(function(){ preset.loadTile = {}; }).toThrow();
          });

          it('should confirmAdd property return _confirmAdd private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.confirmAdd = callback;
            expect(preset._confirmAdd).toBe(callback);
            expect(function(){ preset.confirmAdd = {}; }).toThrow();
          });

          it('should confirmRemove property return _confirmRemove private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.confirmRemove = callback;
            expect(preset._confirmRemove).toBe(callback);
            expect(function(){ preset.confirmRemove = {}; }).toThrow();
          });

          it('should confirmUpdate property return _confirmUpdate private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.confirmUpdate = callback;
            expect(preset._confirmUpdate).toBe(callback);
            expect(function(){ preset.confirmUpdate = {}; }).toThrow();
          });

          it('should commitChanges property return _commitChanges private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.commitChanges = callback;
            expect(preset._commitChanges).toBe(callback);
            expect(function(){ preset.commitChanges = {}; }).toThrow();
          });

          it('should onAddToCache property add _onAddToCacheListeners onAddToCache listener or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.onAddToCache = callback;
            expect(preset._onAddToCacheListeners).toContain(callback);
            expect(function(){ preset.onAddToCache = {}; }).toThrow();
          });

          it('should onRefreshCache property add _onRefreshCacheListeners onRefreshCache listener or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.onRefreshCache = callback;
            expect(preset._onRefreshCacheListeners).toContain(callback);
            expect(function(){ preset.onRefreshCache = {}; }).toThrow();
          });

          it('should onAddWorkspace property return _onAddWorkspace private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.onAddWorkspace = callback;
            expect(preset._onAddWorkspace).toBe(callback);
            expect(function(){ preset.onAddWorkspace = {}; }).toThrow();
          });

          it('should onRemoveWorkspace property return _onRemoveWorkspace private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.onRemoveWorkspace = callback;
            expect(preset._onRemoveWorkspace).toBe(callback);
            expect(function(){ preset.onRemoveWorkspace = {}; }).toThrow();
          });

          it('should onUpdateWorkspace property return _onUpdateWorkspace private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.onUpdateWorkspace = callback;
            expect(preset._onUpdateWorkspace).toBe(callback);
            expect(function(){ preset.onUpdateWorkspace = {}; }).toThrow();
          });

          it('should onWorkspaceChanged property return _onWorkspaceChanged private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.onWorkspaceChanged = callback;
            expect(preset._onWorkspaceChanged).toBe(callback);
            expect(function(){ preset.onWorkspaceChanged = {}; }).toThrow();
          });

          it('should onAddTile property return _onAddTile private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.onAddTile = callback;
            expect(preset._onAddTile).toBe(callback);
            expect(function(){ preset.onAddTile = {}; }).toThrow();
          });

          it('should onRemoveTile property return _onRemoveTile private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.onRemoveTile = callback;
            expect(preset._onRemoveTile).toBe(callback);
            expect(function(){ preset.onRemoveTile = {}; }).toThrow();
          });

          it('should onUpdateTile property return _onUpdateTile private member or throw an exception if set to non function value', function(){
            var preset = new Preset();
            var callback = function(){};
            preset.onUpdateTile = callback;
            expect(preset._onUpdateTile).toBe(callback);
            expect(function(){ preset.onUpdateTile = {}; }).toThrow();
          });
        });

        describe('methods', function(){

          it('should generateId return valid guid string', function(){
            expect(new Preset().generateId()).toMatch('^(\\{{0,1}([0-9a-fA-F]){8}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){4}-([0-9a-fA-F]){12}\\}{0,1})$');
          });
        });
      });
    });
  });
});

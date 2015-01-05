/**
 * Created by tzachit on 04/01/15.
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
      describe('WorkspaceData', function(){

        var Preset, Workspace, WorkspaceData, presetValidators, preset, workspace;

        beforeEach(inject(function(_Preset_, _Workspace_, _WorkspaceData_, _presetValidators_){
          Preset = _Preset_;
          Workspace = _Workspace_;
          WorkspaceData = _WorkspaceData_;
          presetValidators = _presetValidators_;

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
        }));

        describe('initialize', function(){
          it('should initialize some private properties when construct.', function(){
            var workspaceData = new WorkspaceData(preset, workspace);
            expect(workspaceData._preset).toBe(preset);
            expect(workspaceData._workspace).toBe(workspace);
            expect(workspaceData._cols).toBe(workspace.cols);
            expect(workspaceData._rows).toBe(workspace.rows);
            expect(workspaceData._initTiles).toBe(workspace.tiles);
          });

          it('should set all events to function that performs no operations.', function(){
            var workspaceData = new WorkspaceData(preset, workspace);
            expect(workspaceData._applyNewTile()).toBe(undefined);
            expect(workspaceData._resetTile()).toBe(undefined);
            expect(workspaceData._updateTile()).toBe(undefined);
            expect(workspaceData._enterAddMode()).toBe(undefined);
            expect(workspaceData._enterUpdateMode()).toBe(undefined);
            expect(workspaceData._enterPresentationMode()).toBe(undefined);
            expect(workspaceData._enterEditMode()).toBe(undefined);
            expect(workspaceData._triggerEditMode()).toBe(undefined);
            expect(workspaceData._onadddListener()).toBe(undefined);
            expect(workspaceData._onremoveListener()).toBe(undefined);
            expect(workspaceData._onupdateListener()).toBe(undefined);
            expect(workspaceData._onTileSizeChanged()).toBe(undefined);
          });

          it('should initialize _tiles and _tilesMap and invoke applyNewTile when called to init().', function(){
            workspace.tiles = [
              {
                id: preset.generateId(),
                position: 1,
                size: { width: 1, height: 1},
                type: 'type1',
                model: {}
              },
              {
                id: preset.generateId(),
                position: 2,
                size: { width: 1, height: 1},
                type: 'type1',
                model: {}
              }
            ];
            preset._types['type1'] = { presentationInfo: {} };
            var workspaceData = new WorkspaceData(preset, workspace);
            workspaceData._panels = [{inUse: false}, {inUse: false}];
            var tempTiles = [
              presetValidators.validateTileByWorkspaceData(workspace.tiles[0], workspaceData),
              presetValidators.validateTileByWorkspaceData(workspace.tiles[1], workspaceData),
            ];
            tempTiles[0].presentationInfo  = {};
            tempTiles[1].presentationInfo  = {};
            spyOn(workspaceData, '_applyNewTile');
            workspaceData.init();
            expect(workspaceData._tiles[0]).toEqual(tempTiles[0]);
            expect(workspaceData._tiles[1]).toEqual(tempTiles[1]);
            expect(workspaceData._tilesMap[tempTiles[0].id]).toEqual(tempTiles[0].position - 1);
            expect(workspaceData._tilesMap[tempTiles[1].id]).toEqual(tempTiles[1].position - 1);
            expect(workspaceData._applyNewTile).toHaveBeenCalled();
          });

        });

        describe('properties', function(){
          describe('rows', function(){
            it('should equal to workspace.rows.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              expect(workspaceData.rows).toBe(workspace.rows);
            });
          });

          describe('cols', function(){
            it('should equal to workspace.cols.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              expect(workspaceData.cols).toBe(workspace.cols);
            });
          });

          describe('tiles', function(){
            it('should contains workspace.tiles.', function(){
              workspace.tiles = [
                {
                  id: preset.generateId(),
                  position: 1,
                  size: { width: 1, height: 1},
                  type: 'type1',
                  model: {}
                },
                {
                  id: preset.generateId(),
                  position: 2,
                  size: { width: 1, height: 1},
                  type: 'type1',
                  model: {}
                }
              ];
              preset._types['type1'] = { presentationInfo: {} };
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData._panels = [{inUse: false}, {inUse: false}];
              var tempTiles = [
                presetValidators.validateTileByWorkspaceData(workspace.tiles[0], workspaceData),
                presetValidators.validateTileByWorkspaceData(workspace.tiles[1], workspaceData),
              ];
              tempTiles[0].presentationInfo  = {};
              tempTiles[1].presentationInfo  = {};
              workspaceData.init();
              expect(workspaceData.tiles[0]).toEqual(tempTiles[0]);
              expect(workspaceData.tiles[1]).toEqual(tempTiles[1]);
            });
          });

          describe('preset', function(){
            it('should equal to preset.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              expect(workspaceData.preset).toBe(preset);
            });
          });

          describe('workspaceId', function(){
            it('should equals to workspace.id.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              expect(workspaceData.workspaceId).toBe(workspace.id);
            });
          });

          describe('tileCount', function(){
            it('should return the current workspace tiles count.', function(){
              workspace.tiles = [
                {
                  id: preset.generateId(),
                  position: 1,
                  size: { width: 1, height: 1},
                  type: 'type1',
                  model: {}
                },
                {
                  id: preset.generateId(),
                  position: 2,
                  size: { width: 1, height: 1},
                  type: 'type1',
                  model: {}
                }
              ];
              preset._types['type1'] = { presentationInfo: {} };
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData._panels = [{inUse: false}, {inUse: false}];
              var tempTiles = [
                presetValidators.validateTileByWorkspaceData(workspace.tiles[0], workspaceData),
                presetValidators.validateTileByWorkspaceData(workspace.tiles[1], workspaceData),
              ];
              tempTiles[0].presentationInfo  = {};
              tempTiles[1].presentationInfo  = {};
              workspaceData.init();
              expect(workspaceData.tilesCount).toBe(2);
            });
          });
        });

        describe('delegate methods', function(){
          describe('applyNewTile', function(){
            it('should applyNewTile equal to _applyNewTile.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData.applyNewTile = function(){ return 5; };
              expect(workspaceData.applyNewTile).toBe(workspaceData._applyNewTile);
            });
          });

          describe('resetTile', function(){
            it('should resetTile equal to _resetTile.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData.resetTile = function(){ return 5; };
              expect(workspaceData.resetTile).toBe(workspaceData._resetTile);
            });
          });

          describe('updateTile', function(){
            it('should updateTile equal to _updateTile.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData.updateTile = function(){ return 5; };
              expect(workspaceData.updateTile).toBe(workspaceData._updateTile);
            });
          });

          describe('enterAddMode', function(){
            it('should enterAddMode equal to _enterAddMode.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData.enterAddMode = function(){ return 5; };
              expect(workspaceData.enterAddMode).toBe(workspaceData._enterAddMode);
            });
          });

          describe('enterUpdateMode', function(){
            it('should enterUpdateMode equal to _enterUpdateMode.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData.enterUpdateMode = function(){ return 5; };
              expect(workspaceData.enterUpdateMode).toBe(workspaceData._enterUpdateMode);
            });
          });

          describe('enterPresentationMode', function(){
            it('should enterPresentationMode equal to _enterPresentationMode.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData.enterPresentationMode = function(){ return 5; };
              expect(workspaceData.enterPresentationMode).toBe(workspaceData._enterPresentationMode);
            });
          });

          describe('enterEditMode', function(){
            it('should enterEditMode equal to _enterEditMode.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData.enterEditMode = function(){ return 5; };
              expect(workspaceData.enterEditMode).toBe(workspaceData._enterEditMode);
            });
          });

          describe('triggerEditMode', function(){
            it('should triggerEditMode equal to _triggerEditMode.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData.triggerEditMode = function(){ return 5; };
              expect(workspaceData.triggerEditMode).toBe(workspaceData._triggerEditMode);
            });
          });
        });

        describe('events', function(){
          describe('onAdd', function(){
            it('should _onadddListener to be equal to onnadd when set value.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              var callback = angular.noop;
              workspaceData.ondd = callback;
              workspaceData.onadd = callback;
              expect(workspaceData._onadddListener).toBe(callback);
            });
          });

          describe('onadd', function(){
            it('should _onadddListener to be equal to onnadd when set value.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              var callback = angular.noop;
              workspaceData.ondd = callback;
              workspaceData.onadd = callback;
              expect(workspaceData._onadddListener).toBe(callback);
            });
          });

          describe('onremove', function(){
            it('should _onremoveListener to be equal to onremove when set value.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              var callback = angular.noop;
              workspaceData.onremove = callback;
              workspaceData.onremove = callback;
              expect(workspaceData._onremoveListener).toBe(callback);
            });
          });

          describe('onupdate', function(){
            it('should _onupdateListener to be equal to onupdate when set value.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              var callback = angular.noop;
              workspaceData.onupdate = callback;
              workspaceData.onupdate = callback;
              expect(workspaceData._onupdateListener).toBe(callback);
            });
          });

          describe('onTileSizeChanged', function(){
            it('should onTileSizeChanged equal to _onTileSizeChanged.', function(){
              var workspaceData = new WorkspaceData(preset, workspace);
              workspaceData.onTileSizeChanged = function(){ return 5; };
              expect(workspaceData.onTileSizeChanged).toBe(workspaceData._onTileSizeChanged);
            });
          });
        });

        describe('methods', function(){

          var $rootScope, CRUDResult, presetValidators, workspaceData, tile;

          beforeEach(inject(function(_$rootScope_, _CRUDResult_, _presetValidators_){
            $rootScope = _$rootScope_;
            CRUDResult = _CRUDResult_;
            presetValidators = _presetValidators_;
          }));

          beforeEach(function(){
            preset._types['type1'] = { name: 'type1', presentationInfo: {}, confirmAdd: angular.noop };
            workspaceData = new WorkspaceData(preset, workspace);
            workspaceData._panels = [];
            var panelsCount = workspaceData.rows * workspaceData.cols;
            for(var i = 0; i < panelsCount; i++){
              workspaceData._panels[i] = { inUse: false };
            }

            tile = {
              id: preset.generateId(),
              position: 1,
              size: { width: 1, height: 1},
              type: 'type1',
              model: {}
            };
          });

          describe('addTileAsync', function(){
            it('should throw exception when called with invalid tile.', function(){
              var tile = {};
              expect(function(){ workspaceData.addTileAsync(tile); }).toThrow();
            });

            it('should return rejected promise when called with tile,type that doesn\'t exist.', function(){
              tile.type = 'type';
              var error = jasmine.createSpy('error');
              workspaceData.addTileAsync(tile).then(angular.noop, error);
              $rootScope.$digest();
              expect(error).toHaveBeenCalled();
            });

            it('should invoke confirmAdd when called with confirm = true.', function(){
              spyOn(preset._types['type1'], 'confirmAdd').and.callFake(function(){
                return new CRUDResult(true, tile, []);
              });
              workspaceData.addTileAsync(tile, true);
              $rootScope.$digest();
              expect(preset._types['type1'].confirmAdd).toHaveBeenCalled();
            });

            it('should throw exception when confirmAdd not implemented correctly.', function(){
              spyOn(preset._types['type1'], 'confirmAdd');
              workspaceData.addTileAsync(tile, true);
              expect(function(){ $rootScope.$digest(); }).toThrow();
            });

            it('should set _tiles and _tilesMap with the new tile info when called with valid tile.', function(){
              workspaceData.addTileAsync(tile);
              $rootScope.$digest();
              var tempTile = presetValidators.validateTile(tile);
              tempTile.presentationInfo = {};
              expect(workspaceData._tiles[tile.position - 1]).toEqual(tempTile);
              expect(workspaceData._tilesMap[tile.id]).toBe(tile.position - 1);
            });

            it('should invoke _applyNewTile and _onadddListener and return resolved CRUDResult promise when called with valid tile.', function(){
              spyOn(workspaceData, '_applyNewTile');
              spyOn(workspaceData, '_onadddListener');
              var success = jasmine.createSpy('success');
              workspaceData.addTileAsync(tile).then(function(result){
                success();
                expect(result).toBeInstanceOf(CRUDResult);
              });
              $rootScope.$digest();
              expect(workspaceData._applyNewTile).toHaveBeenCalled();
              expect(workspaceData._onadddListener).toHaveBeenCalled();
              expect(success).toHaveBeenCalled();
            });
          });

          describe('removeTileAsync', function(){

          });
        });
      });
    });
  });
});


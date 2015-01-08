/**
 * Created by tzachit on 08/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('services', function(){
      describe('presetValidators', function(){

        var presetsValidators, Workspace, Tile;

        beforeEach(inject(function(_presetValidators_, _Workspace_, _Tile_){
          presetsValidators = _presetValidators_;
          Workspace = _Workspace_;
          Tile = _Tile_;
        }));

        describe('methods', function(){
          describe('isNullOrUndefined', function(){
            it('should return true when called with null or undefined.', function(){
              expect(presetsValidators.isNullOrUndefined(null)).toBeTruthy();
              expect(presetsValidators.isNullOrUndefined(undefined)).toBeTruthy();
            });

            it('should return false when called with non null or undefined value.', function(){
              expect(presetsValidators.isNullOrUndefined({})).toBeFalsy();
            });
          });

          describe('isNullEmptyOrWhiteSpaces', function(){
            it('should return true when called with null or empty or white spaces string.', function(){
              expect(presetsValidators.isNullEmptyOrWhiteSpaces(null)).toBeTruthy();
              expect(presetsValidators.isNullEmptyOrWhiteSpaces('')).toBeTruthy();
              expect(presetsValidators.isNullEmptyOrWhiteSpaces('   ')).toBeTruthy();
            });

            it('should return false when called with non null or empty or white spaces string.', function(){
              expect(presetsValidators.isNullEmptyOrWhiteSpaces('good value')).toBeFalsy();
            });
          });

          describe('validateTile', function(){

            var tile;

            beforeEach(function(){
              tile = { id: '###-###-###', position: 1, size: { width: 1, height: 1 }, type: 'tile1', model: {} };
            });

            it('should throw exception when called with non object value.', function(){
              expect(function(){ presetsValidators.validateTile(5); }).toThrow();
            });

            it('should throw exception when called with null or white spaces tile.id,', function(){
              tile.id = null;
              expect(function(){ presetsValidators.validateTile(tile); }).toThrow();
              tile.id = '   ';
              expect(function(){ presetsValidators.validateTile(tile); }).toThrow();
            });

            it('should throw exception when called with non number or value less then 1 tile.position,', function(){
              tile.position = {};
              expect(function(){ presetsValidators.validateTile(tile); }).toThrow();
              tile.position = 0;
              expect(function(){ presetsValidators.validateTile(tile); }).toThrow();
            });

            it('should throw exception when called with invalid tile.size,', function(){
              tile.size = {};
              expect(function(){ presetsValidators.validateTile(tile)}).toThrow();
            });

            it('should throw exception when called with null or white spaces tile.type,', function(){
              tile.type = null;
              expect(function(){ presetsValidators.validateTile(tile); }).toThrow();
              tile.type = '   ';
              expect(function(){ presetsValidators.validateTile(tile); }).toThrow();
            });

            it('should return instance of Tile when called with valid tile.', function(){
              expect(presetsValidators.validateTile(tile) instanceof Tile).toBeTruthy();
            });
          });

          describe('validateTileByWorkspace', function(){

            var tile, workspace;

            beforeEach(function(){
              workspace = { id: '###-###-###', name: 'workspace1', rows: 4, cols: 5, tiles: [] };
              tile = { id: '###-###-###', position: 1, size: { width: 1, height: 1 }, type: 'tile1', model: {} };
            });

            it('should throw exception when called with non object value.', function(){
              expect(function(){ presetsValidators.validateTileByWorkspace(5, workspace); }).toThrow();
            });

            it('should throw exception when called with null or white spaces tile.id,', function(){
              tile.id = null;
              expect(function(){ presetsValidators.validateTileByWorkspace(tile, workspace); }).toThrow();
              tile.id = '   ';
              expect(function(){ presetsValidators.validateTileByWorkspace(tile, workspace); }).toThrow();
            });

            it('should throw exception when called with non number or value less then 1 or grater then max tiles count tile.position,', function(){
              tile.position = {};
              expect(function(){ presetsValidators.validateTileByWorkspace(tile, workspace); }).toThrow();
              tile.position = 0;
              expect(function(){ presetsValidators.validateTileByWorkspace(tile, workspace); }).toThrow();
              tile.position = 40;
              expect(function(){ presetsValidators.validateTileByWorkspace(tile, workspace); }).toThrow();
            });

            it('should throw exception when called with invalid tile.size,', function(){
              tile.size = {};
              expect(function(){ presetsValidators.validateTileByWorkspace(tile, workspace); }).toThrow();
            });

            it('should throw exception when called with tile.position that already in use,', function(){
              workspace.tiles.push(tile);
              expect(function(){ presetsValidators.validateTileByWorkspace(tile, workspace); }).toThrow();
            });

            it('should throw exception when called with null or white spaces tile.type,', function(){
              tile.type = null;
              expect(function(){ presetsValidators.validateTileByWorkspace(tile, workspace); }).toThrow();
              tile.type = '   ';
              expect(function(){ presetsValidators.validateTileByWorkspace(tile, workspace); }).toThrow();
            });

            it('should return instance of Tile when called with valid tile.', function(){
              expect(presetsValidators.validateTileByWorkspace(tile, workspace) instanceof Tile).toBeTruthy();
            });
          });

          describe('validateTileByWorkspaceData', function(){
            var tile, workspace, workspaceData;

            beforeEach(inject(function(_Preset_, _WorkspaceData_){
              workspace = { id: '###-###-###', name: 'workspace1', rows: 4, cols: 5, tiles: [] };
              tile = { id: '###-###-###', position: 1, size: { width: 1, height: 1 }, type: 'tile1', model: {} };
              workspaceData = new _WorkspaceData_(new _Preset_(), workspace);
              var tilesCount = workspaceData.rows * workspaceData.cols;
              workspaceData._panels = [];
              for(var i = 0; i < tilesCount; i++){
                workspaceData._panels.push({ isUse: false });
              }
            }));

            it('should throw exception when called with non object value.', function(){
              expect(function(){ presetsValidators.validateTileByWorkspaceData(5, workspaceData); }).toThrow();
            });

            it('should throw exception when called with null or white spaces tile.id,', function(){
              tile.id = null;
              expect(function(){ presetsValidators.validateTileByWorkspaceData(tile, workspaceData); }).toThrow();
              tile.id = '   ';
              expect(function(){ presetsValidators.validateTileByWorkspaceData(tile, workspaceData); }).toThrow();
            });

            it('should throw exception when called with non number or value less then 1 or grater then max tiles count tile.position,', function(){
              tile.position = {};
              expect(function(){ presetsValidators.validateTileByWorkspaceData(tile, workspaceData); }).toThrow();
              tile.position = 0;
              expect(function(){ presetsValidators.validateTileByWorkspaceData(tile, workspaceData); }).toThrow();
              tile.position = 40;
              expect(function(){ presetsValidators.validateTileByWorkspaceData(tile, workspaceData); }).toThrow();
            });

            it('should throw exception when called with invalid tile.size,', function(){
              tile.size = {};
              expect(function(){ presetsValidators.validateTileByWorkspaceData(tile, workspaceData); }).toThrow();
            });

            it('should throw exception when called with tile.position that already in use,', function(){
              workspaceData._panels[0].inUse = true;
              expect(function(){ presetsValidators.validateTileByWorkspaceData(tile, workspaceData); }).toThrow();
            });

            it('should throw exception when called with null or white spaces tile.type,', function(){
              tile.type = null;
              expect(function(){ presetsValidators.validateTileByWorkspaceData(tile, workspaceData); }).toThrow();
              tile.type = '   ';
              expect(function(){ presetsValidators.validateTileByWorkspaceData(tile, workspaceData); }).toThrow();
            });

            it('should return instance of Tile when called with valid tile.', function(){
              expect(presetsValidators.validateTileByWorkspaceData(tile, workspaceData) instanceof Tile).toBeTruthy();
            });
          });

          describe('validateReducedWorkspace', function(){

            var ReducedWorkspace, reducedWorkspace;

            beforeEach(inject(function(_ReducedWorkspace_){
              ReducedWorkspace = _ReducedWorkspace_;
              reducedWorkspace = { id: '###-###-###', name: 'workspace1'};
            }));

            it('should throw exception when called with non object value.', function(){
              expect(function(){ presetsValidators.validateReducedWorkspace(5); }).toThrow();
            });

            it('should throw exception when called with null or white spaces reducedWorkspace.id,', function(){
              reducedWorkspace.id = null;
              expect(function(){ presetsValidators.validateReducedWorkspace(reducedWorkspace); }).toThrow();
              reducedWorkspace.id = '   ';
              expect(function(){ presetsValidators.validateReducedWorkspace(reducedWorkspace); }).toThrow();
            });

            it('should throw exception when called with null or white spaces reducedWorkspace.name,', function(){
              reducedWorkspace.name = null;
              expect(function(){ presetsValidators.validateReducedWorkspace(reducedWorkspace); }).toThrow();
              reducedWorkspace.name = '   ';
              expect(function(){ presetsValidators.validateReducedWorkspace(reducedWorkspace); }).toThrow();
            });

            it('should return instance of ReducedWorkspace when called with valid reduced workspace.', function(){
              expect(presetsValidators.validateReducedWorkspace(reducedWorkspace) instanceof ReducedWorkspace).toBeTruthy();
            });
          });

          describe('validateWorkspacesList', function(){
            var ReducedWorkspace, reducedWorkspaces;

            beforeEach(inject(function(_ReducedWorkspace_){
              ReducedWorkspace = _ReducedWorkspace_;
              reducedWorkspaces = [
                { id: '###-###-##0', name: 'workspace1'},
                { id: '###-###-##1', name: 'workspace2'},
                { id: '###-###-##2', name: 'workspace3'}
              ];
            }));

            it('should throw exception when called with non array value.', function(){
              expect(function(){ presetsValidators.validateWorkspacesList(5); }).toThrow();
            });

            it('should throw exception when one of the reduced workspace is invalid.', function(){
              reducedWorkspaces[0] = null;
              expect(function(){ presetsValidators.validateWorkspacesList(reducedWorkspaces); }).toThrow();
            });

            it('should throw exception when two of the reduced workspaces have the same id.', function(){
              reducedWorkspaces[0].id = '###-###-###';
              reducedWorkspaces[1].id = '###-###-###';
               expect(function(){ presetsValidators.validateWorkspacesList(reducedWorkspaces); }).toThrow();
            });

            it('should return array of instances of ReducedWorkspace when called with valid reduced workspaces array.', function(){
              var results = presetsValidators.validateWorkspacesList(reducedWorkspaces);
              expect(results instanceof Array).toBeTruthy();
              for(var i = 0; i < results.length; i++){
                expect(results[i] instanceof ReducedWorkspace).toBeTruthy();
              }
            });
          });

          describe('validateWorkspace', function(){

            var workspace;

            beforeEach(function(){
              workspace = {
                id: '###-###-###',
                name: 'workspace1',
                modified: new Date(),
                expires: new Date(),
                rows: 4,
                cols: 5,
                tiles: []
              };
            });

            it('should throw exception when called with non object value.', function(){
              expect(function(){ presetsValidators.validateWorkspace(5); }).toThrow();
            });

            it('should throw exception when called with null or white spaces workspace.id,', function(){
              workspace.id = null;
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
              workspace.id = '   ';
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
            });

            it('should throw exception when called with null or white spaces workspace.name,', function(){
              workspace.name = null;
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
              workspace.name = '   ';
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
            });

            it('should throw exception when called with null or undefined workspace.modified,', function(){
              workspace.modified = null;
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
              workspace.modified = undefined;
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
            });

            it('should throw exception when called with null or undefined workspace.expires,', function(){
              workspace.expires = null;
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
              workspace.expires = undefined;
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
            });

            it('should throw exception when called with non null and non undefined and non string workspace.description,', function(){
              workspace.description = {};
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
            });

            it('should throw exception when called with non number or value that less or equals 0 workspace.rows,', function(){
              workspace.rows = null;
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
              workspace.rows = 0;
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
            });

            it('should throw exception when called with non number or value that less or equals 0 workspace.cols,', function(){
              workspace.cols = null;
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
              workspace.cols = 0;
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
            });

            it('should throw exception when called with non Array workspace.tiles,', function(){
              workspace.tiles = {};
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
            });

            it('should throw exception when called invalid workspace tiles array,', function(){
              workspace.tiles.push({});
              expect(function(){ presetsValidators.validateWorkspace(workspace); }).toThrow();
            });

            it('should return instance of Workspace when called with valid workspace.', function(){
              expect(presetsValidators.validateWorkspace(workspace) instanceof Workspace).toBeTruthy();
            });
          });

          describe('validateTileType', function(){

            var TileType, tileType;

            beforeEach(inject(function(_TileType_){
              TileType = _TileType_;
              tileType = { name: 'type1', creationInfo: {}, presentationInfo: {} };
            }));

            it('should throw exception when called with non object value.', function(){
              expect(function(){ presetsValidators.validateTileType(5); }).toThrow();
            });

            it('should throw exception when called with null or white spaces tileType.name,', function(){
              tileType.name = null;
              expect(function(){ presetsValidators.validateTileType(tileType); }).toThrow();
              tileType.name = '   ';
              expect(function(){ presetsValidators.validateTileType(tileType); }).toThrow();
            });

            it('should throw exception when called with non object tileType.creationInfo.', function(){
              tileType.creationInfo = null;
              expect(function(){ presetsValidators.validateTileType(tileType); }).toThrow();
            });

            it('should throw exception when called with non object tileType.presentationInfo.', function(){
              tileType.presentationInfo = null;
              expect(function(){ presetsValidators.validateTileType(tileType); }).toThrow();
            });

            it('should return instance of TileType when called with valid tile type.', function(){
              expect(presetsValidators.validateTileType(tileType) instanceof TileType).toBeTruthy();
            });
          });
        });
      });
    });
  });
});

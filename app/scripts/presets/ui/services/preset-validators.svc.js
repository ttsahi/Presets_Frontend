/**
 * Created by tzachit on 16/12/14.
 */

(function(app){

  'use strict';

  app.factory('presetValidators', ['Workspace', 'Tile',
    function(Workspace, Tile){

      function DeveloperError(message){
        this.message = message;
      }

      function isNullOrUndefined(value){
        return value === null || value === undefined;
      }

      function isNullEmptyOrWhiteSpaces(str){
        return typeof str !== 'string' || str.trim() === '';
      }

      function validateTileByWorkspaceData(tile, workspaceData){
        if(typeof tile !== 'object') {
          throw new DeveloperError('invalid tile!');
        }

        if(!(tile instanceof Tile)){
          var temp = new Tile();
          temp.init(tile);
          tile = temp;
        }

        if(isNullEmptyOrWhiteSpaces(tile.id)){
          throw new DeveloperError('tile id must be non empty string!');
        }

        if(typeof workspaceData.panels[tile.position - 1] === 'undefined' || workspaceData.panels[tile.position - 1].inUse){
          throw new DeveloperError('invalid tile position!');
        }

        if(isNullEmptyOrWhiteSpaces(tile.type)){
          throw new DeveloperError('invalid tile type!');
        }

        tile.id = tile.id.trim();
        return tile;
      }

      function validateTileByWorkspace(tile, workspace){
        if(typeof tile !== 'object') {
          throw new DeveloperError('invalid tile!');
        }

        if(!(tile instanceof Tile)){
          var temp = new Tile();
          temp.init(tile);
          tile = temp;
        }

        var maxPosition = workspace.rows * workspace.cols;

        if(isNullEmptyOrWhiteSpaces(tile.id)){
          throw new DeveloperError('tile id must be non empty string!');
        }

        if(tile.position < 1 || tile.position > maxPosition){
          throw new DeveloperError('invalid tile position!');
        }

        var positionsCount = 0;

        for(var i = 0; i < workspace.tiles; i++){
          if(workspace.tiles[i].position === tile.position){
            positionsCount++;
          }
        }

        if(positionsCount > 1){
          throw new DeveloperError('invalid tile position!');
        }

        if(isNullEmptyOrWhiteSpaces(tile.type)){
          throw new DeveloperError('invalid tile type!');
        }

        tile.id = tile.id.trim();
        return tile;
      }

      function validateWorkspace(workspace) {
        if(typeof workspace !== 'object') {
          throw new DeveloperError('invalid workspace!');
        }

        if(!(workspace instanceof Workspace)){
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

        if(!(workspace.tiles instanceof Array)){
          throw new DeveloperError('workspace tiles must be instance of array');
        }

        for(var i = 0; i < workspace.tiles.length; i++){
          workspace.tiles[i] = validateTileByWorkspace(workspace.tiles[i], workspace);
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

        if(!(tileType instanceof TileType)){
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

      return {
        isNullOrUndefined: isNullOrUndefined,
        isNullEmptyOrWhiteSpaces: isNullEmptyOrWhiteSpaces,
        validateTileByWorkspace: validateTileByWorkspace,
        validateTileByWorkspaceData: validateTileByWorkspaceData,
        validateWorkspace: validateWorkspace,
        validateTileType: validateTileType
      }
    }
  ]);

}(angular.module('presetsApp')));

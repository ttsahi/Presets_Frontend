/**
 * Created by tzachit on 16/12/14.
 */

(function(app){

  'use strict';

  app.factory('presetValidators', ['ReducedWorkspace', 'Workspace', 'Tile', 'TileType', 'TileSize',
    function(ReducedWorkspace, Workspace, Tile, TileType, TileSize){

      function DeveloperError(message){
        this.message = message;
      }

      function isNullOrUndefined(value){
        return value === null || value === undefined;
      }

      function isNullEmptyOrWhiteSpaces(str){
        return typeof str !== 'string' || str.trim() === '';
      }

      function validateTileSize(size){
        if(typeof size !== 'object'){
          throw new DeveloperError('invalid tile size!');
        }

        if(!(size instanceof TileSize)){
          var temp = new TileSize();
          temp.init(size);
          size = temp;
        }

        if(isNullOrUndefined(size.width) || typeof size.width !== 'number' || size.width < 1){
          throw new DeveloperError('invalid tile size width value!');
        }

        if(isNullOrUndefined(size.height) || typeof size.height !== 'number' || size.height < 1){
          throw new DeveloperError('invalid tile size height value!');
        }

        size.width = Math.round(size.width);
        size.height = Math.round(size.height);
        return size;
      }

      function validateTile(tile){
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

        if(typeof tile.position !== 'number' || tile.position < 1){
          throw new DeveloperError('invalid tile position!');
        }

        tile.size = validateTileSize(tile.size);

        if(isNullEmptyOrWhiteSpaces(tile.type)){
          throw new DeveloperError('invalid tile type!');
        }

        tile.id = tile.id.trim();
        tile.position = Math.round(tile.position);
        return tile;
      }

      function calculateTileCoverPositions(tile, cols){
        var positions = [];
        var firstPosition = tile.position;

        for(var y = 0; y < tile.size.height; y++){
          for(var x = 0; x < tile.size.width; x++){
            positions.push(firstPosition++);
          }
          firstPosition += (cols - (tile.size.width - 1) - 1);
        }

        return positions;
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

        if(typeof tile.position !== 'number'){
          throw new DeveloperError('invalid tile position!');
        }

        tile.position = Math.round(tile.position);

        if(tile.position < 1 || tile.position > (workspaceData.rows * workspaceData.cols)){
          throw new DeveloperError('invalid tile position!');
        }

        tile.size = validateTileSize(tile.size);

        var tileCoverPositions = calculateTileCoverPositions(tile, workspaceData.cols);

        for(var i = 0; i < tileCoverPositions.length; i++){
          if(workspaceData.panels[tileCoverPositions[i] - 1].inUse){
            throw new DeveloperError('invalid tile position!');
          }
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

        if(isNullEmptyOrWhiteSpaces(tile.id)){
          throw new DeveloperError('tile id must be non empty string!');
        }

        if(typeof tile.position !== 'number'){
          throw new DeveloperError('invalid tile position!');
        }

        tile.position = Math.round(tile.position);
        var maxPosition = workspace.rows * workspace.cols;

        if(tile.position < 1 || tile.position > maxPosition){
          throw new DeveloperError('invalid tile position!');
        }

        tile.size = validateTileSize(tile.size);

        var tilesPositionsMap = [];
        for(var i = 0; i < maxPosition; i++){
          tilesPositionsMap.push(false);
        }

        for(i = 0; i < workspace.tiles.length; i++){
          var positions  = calculateTileCoverPositions(workspace.tiles[i], workspace.cols);
          for(var j = 0; j < positions.length; j++){
            tilesPositionsMap[positions[j] - 1] = true;
          }
        }

        var tileCoverPositions = calculateTileCoverPositions(tile, workspace.cols);

        for(i = 0; i < tileCoverPositions.length; i++){
          if(tilesPositionsMap[tileCoverPositions[i] - 1] === true){
            throw new DeveloperError('invalid tile position!');
          }
        }

        if(isNullEmptyOrWhiteSpaces(tile.type)){
          throw new DeveloperError('invalid tile type!');
        }

        tile.id = tile.id.trim();
        return tile;
      }

      function validateReducedWorkspace(reducedWorkspace){
        if(typeof reducedWorkspace !== 'object') {
          throw new DeveloperError('invalid reduced workspace!');
        }

        if(!(reducedWorkspace instanceof ReducedWorkspace)){
          var temp = new ReducedWorkspace();
          temp.init(reducedWorkspace);
          reducedWorkspace = temp;
        }

        if(isNullEmptyOrWhiteSpaces(reducedWorkspace.id)){
          throw new DeveloperError('reduced workspace id must be non empty string!');
        }

        if(isNullEmptyOrWhiteSpaces(reducedWorkspace.name)){
          throw new DeveloperError('invalid reduced workspace name!');
        }

        reducedWorkspace.id = reducedWorkspace.id.trim();
        reducedWorkspace.name = reducedWorkspace.name.trim();
        return reducedWorkspace;
      }

      function validateWorkspacesList(list){
        if(!(list instanceof Array)){
          throw new DeveloperError('workspaces list must be instance of array!');
        }

        var idsMap = {};

        for(var i = 0; i < list.length; i++){
          var reducedWorkspace = validateReducedWorkspace(list[i]);
          if(angular.isDefined(idsMap[reducedWorkspace.id])){
            throw new DeveloperError('workspace item id: ' + reducedWorkspace.id + ' already exist!');
          }
          idsMap[reducedWorkspace.id] = true;
          list[i] = reducedWorkspace;
        }

        return list;
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

        if(!isNullOrUndefined(workspace.modified) && !(workspace.modified instanceof Date)){
          throw new DeveloperError('invalid workspace modified value!');
        }

        if(!isNullOrUndefined(workspace.expires) && !(workspace.expires instanceof Date)){
          throw new DeveloperError('invalid workspace expires value!');
        }

        if(!isNullOrUndefined(workspace.description) && typeof workspace.description !== 'string'){
          throw new DeveloperError('invalid workspace description value!');
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
        validateTile: validateTile,
        isNullOrUndefined: isNullOrUndefined,
        isNullEmptyOrWhiteSpaces: isNullEmptyOrWhiteSpaces,
        validateTileByWorkspace: validateTileByWorkspace,
        validateTileByWorkspaceData: validateTileByWorkspaceData,
        validateReducedWorkspace: validateReducedWorkspace,
        validateWorkspacesList: validateWorkspacesList,
        validateWorkspace: validateWorkspace,
        validateTileType: validateTileType
      }
    }
  ]);

}(angular.module('presetsApp')));

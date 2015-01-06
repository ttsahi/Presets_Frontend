/**
 * Created by tzachit on 06/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('classes', function(){
      describe('workspace', function(){

        var Workspace;

        beforeEach(inject(function(_Workspace_){
          Workspace = _Workspace_;
        }));

        describe('initialize', function(){

          var id, name, modified, expires, description, rows, cols, tiles;

          beforeEach(function(){
            id = '###-###-###';
            name = 'workspace1';
            modified = new Date();
            expires = new Date();
            description = 'about';
            rows = 4;
            cols = 5;
            tiles = [];
          });

          it('should initialize some private properties when construct.', function(){

            var workspace = new Workspace(id, name, modified, expires, description, rows, cols, tiles);

            expect(workspace._id).toBe(id);
            expect(workspace._name).toBe(name);
            expect(workspace._modified).toBe(modified);
            expect(workspace._expires).toBe(expires);
            expect(workspace._description).toBe(description);
            expect(workspace._rows).toBe(rows);
            expect(workspace._cols).toBe(cols);
            expect(workspace._tiles).toBe(tiles);
          });

          it('should initialize some private properties when invoke init(...).', function(){

            var workspace = new Workspace();
            workspace.init({
              id: id,
              name: name,
              modified: modified,
              expires: expires,
              description: description,
              rows: rows,
              cols: cols,
              tiles: tiles
            });

            expect(workspace._id).toBe(id);
            expect(workspace._name).toBe(name);
            expect(workspace._modified).toBe(modified);
            expect(workspace._expires).toBe(expires);
            expect(workspace._description).toBe(description);
            expect(workspace._rows).toBe(rows);
            expect(workspace._cols).toBe(cols);
            expect(workspace._tiles).toBe(tiles);
          });
        });

        describe('properties', function(){
          describe('id', function(){
            it('should equals to _id private member value', function(){
              var id = '###-###-###';
              var workspace = new Workspace();
              workspace.id = id;
              expect(workspace.id).toBe(workspace._id);
              expect(workspace.id).toBe(id);
            });
          });

          describe('name', function(){
            it('should equals to _id private member value', function(){
              var name = 'workspace1';
              var workspace = new Workspace();
              workspace.name = name;
              expect(workspace.name).toBe(workspace._name);
              expect(workspace.name).toBe(name);
            });
          });

          describe('modified', function(){
            it('should equals to _id private member value', function(){
              var modified = new Date();
              var workspace = new Workspace();
              workspace.modified = modified;
              expect(workspace.modified).toBe(workspace._modified);
              expect(workspace.modified).toBe(modified);
            });
          });

          describe('expires', function(){
            it('should equals to _id private member value', function(){
              var expires = new Date();
              var workspace = new Workspace();
              workspace.expires = expires;
              expect(workspace.expires).toBe(workspace._expires);
              expect(workspace.expires).toBe(expires);
            });
          });

          describe('description', function(){
            it('should equals to _id private member value', function(){
              var description = 'about';
              var workspace = new Workspace();
              workspace.description = description;
              expect(workspace.description).toBe(workspace._description);
              expect(workspace.description).toBe(description);
            });
          });

          describe('rows', function(){
            it('should equals to _id private member value', function(){
              var rows = 4;
              var workspace = new Workspace();
              workspace.rows = rows;
              expect(workspace.rows).toBe(workspace._rows);
              expect(workspace.rows).toBe(rows);
            });
          });

          describe('cols', function(){
            it('should equals to _id private member value', function(){
              var cols = 5;
              var workspace = new Workspace();
              workspace.cols = cols;
              expect(workspace.cols).toBe(workspace._cols);
              expect(workspace.cols).toBe(cols);
            });
          });

          describe('tiles', function(){
            it('should equals to _id private member value', function(){
              var tiles = [];
              var workspace = new Workspace();
              workspace.tiles = tiles;
              expect(workspace.tiles).toBe(workspace._tiles);
              expect(workspace.tiles).toBe(tiles);
            });
          });
        });
      });
    });
  });
});

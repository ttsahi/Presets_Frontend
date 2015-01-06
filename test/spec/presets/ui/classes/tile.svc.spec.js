/**
 * Created by tzachit on 05/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('tile', function(){

      var Tile;

      beforeEach(inject(function(_Tile_){
        Tile = _Tile_;
      }));

      describe('initialize', function(){
        it('should private members equals to init values.', function(){
          var id = 'hfh747-djd34-dfkd';
          var position = 1;
          var size = { width: 1, height: 1};
          var type = 'tile1';
          var model = {};

          var tile  = new Tile(id, position, size, type, model);
          expect(tile.id).toBe(id);
          expect(tile.position).toBe(position);
          expect(tile.size).toBe(size);
          expect(tile.type).toBe(type);
          expect(tile.model).toBe(model);

          tile.init({ id: id, position: position, size: size, type: type, model: model });
          expect(tile.id).toBe(id);
          expect(tile.position).toBe(position);
          expect(tile.size).toBe(size);
          expect(tile.type).toBe(type);
          expect(tile.model).toBe(model);
        });
      });

      describe('properties', function(){
        describe('id', function(){
          it('should equals to _id private member value', function(){
            var id = 'hfh747-djd34-dfkd';
            var tile = new Tile();
            tile.id = id;
            expect(tile.id).toBe(tile._id);
            expect(tile.id).toBe(id);
          });
        });

        describe('position', function(){
          it('should equals to _position private member value', function(){
            var position = 1;
            var tile = new Tile();
            tile.position = position;
            expect(tile.position).toBe(tile.position);
            expect(tile.position).toBe(position);
          });
        });

        describe('size', function(){
          it('should equals to _size private member value', function(){
            var size = { width: 1, height: 1};
            var tile = new Tile();
            tile.size = size;
            expect(tile.size).toBe(tile._size);
            expect(tile.size).toBe(size);
          });
        });

        describe('type', function(){
          it('should equals to _type private member value', function(){
            var type = 'tile1';
            var tile = new Tile();
            tile.type = type;
            expect(tile.type).toBe(tile._type);
            expect(tile.type).toBe(type);
          });
        });

        describe('model', function(){
          it('should equals to _model private member value', function(){
            var model = {};
            var tile = new Tile();
            tile.model = model;
            expect(tile.model).toBe(tile._model);
            expect(tile.model).toBe(model);
          });
        });
      });
    });
  });
});

/**
 * Created by tzachit on 05/01/15.
 */

'use strict';

describe('presets', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('classes', function(){
      describe('TileSize', function(){

        var TileSize;

        beforeEach(inject(function(_TileSize_){
          TileSize = _TileSize_;
        }));

        describe('initialize', function(){
          it('should private members equals to init values.', function(){
            var tileSize = new TileSize(1, 1);
            expect(tileSize._width).toBe(1);
            expect(tileSize._height).toBe(1);

            tileSize.init({ width: 1, height: 1 });
            expect(tileSize._width).toBe(1);
            expect(tileSize._height).toBe(1);
          });
        });

        describe('properties', function(){
          describe('width', function(){
            it('should equals to _width private member value.', function(){
              var tileSize = new TileSize();
              tileSize.width = 1;
              expect(tileSize.width).toBe(tileSize._width);
              expect(tileSize.width).toBe(1);
            });
          });

          describe('height', function(){
            it('should equals to _height private member value.', function(){
              var tileSize = new TileSize();
              tileSize.height = 1;
              expect(tileSize.height).toBe(tileSize._height);
              expect(tileSize.height).toBe(1);
            });
          });
        });
      });
    });
  });
});

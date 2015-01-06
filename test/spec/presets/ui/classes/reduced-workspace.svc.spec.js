/**
 * Created by tzachit on 05/01/15.
 */

'use strict';

describe('prests', function(){

  beforeEach(module('presetsApp'));

  describe('ui', function(){
    describe('classes', function(){
      describe('reducedWorkspace', function(){

        var ReducedWorkspace;

        beforeEach(inject(function(_ReducedWorkspace_){
          ReducedWorkspace = _ReducedWorkspace_;
        }));

        describe('initialize', function(){
          it('should private members equals to init values.', function(){
            var reducedWorkspace = new ReducedWorkspace('eg47-egr4-rkg4kf', 'workspace1');
            expect(reducedWorkspace.id).toBe('eg47-egr4-rkg4kf');
            expect(reducedWorkspace.name).toBe('workspace1');

            reducedWorkspace.init({ id: 'eg47-egr4-rkg4kf', name: 'workspace1'});
            expect(reducedWorkspace.id).toBe('eg47-egr4-rkg4kf');
            expect(reducedWorkspace.name).toBe('workspace1');
          });
        });

        describe('properties', function(){
          describe('id', function(){
            it('should equals to _id private member value.', function(){
              var reducedWorkspace = new ReducedWorkspace();
              reducedWorkspace.id = 'id';
              expect(reducedWorkspace.id).toBe(reducedWorkspace._id);
              expect(reducedWorkspace.id).toBe('id');
            });
          });

          describe('name', function(){
            it('should equals to _name private member value.', function(){
              var reducedWorkspace = new ReducedWorkspace();
              reducedWorkspace.name = 'name';
              expect(reducedWorkspace.name).toBe(reducedWorkspace._name);
              expect(reducedWorkspace.name).toBe('name');
            });
          });
        });
      });
    });
  });
});

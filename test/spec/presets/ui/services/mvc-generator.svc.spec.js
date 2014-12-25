'use strict';

describe('Presets', function() {
  beforeEach(module('presetsApp'));

  describe('UI', function() {
    describe('Services', function() {
      var MVCGeneratorService;

      beforeEach(inject(function (MVC) {
        MVCGeneratorService = MVC;
      }));

      describe('MVC Generator', function() {
        it('Should throw exception when non-onject as creationInfo sent', function() {
          var scope = {};
          var creationInfo = 'THIS IS NOT AN OBJECT';

          expect(function() {
            MVCGeneratorService.create(scope, creationInfo);
          }).toThrow();
        });
      });
    });
  });
});

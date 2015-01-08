'use strict';

describe('presets', function() {

  beforeEach(module('presetsApp'));

  describe('ui', function() {
    describe('services', function() {
      describe('MVC', function(){

        var $rootScope, $httpBackend, $tempalteCahce, $scope, MVC, creationInfo;

        beforeEach(inject(function (_$rootScope_, _$httpBackend_, _$templateCache_, _MVC_) {
          $rootScope = _$rootScope_;
          $httpBackend = _$httpBackend_;
          $httpBackend.whenGET('views/template.html').respond(200, '<div></div>');
          $tempalteCahce = _$templateCache_;
          $scope = $rootScope.$new();
          MVC = _MVC_;
          creationInfo = {
            templateUrl: 'views/template.html',
            controller: ['$scope', function($scope){
              $scope.myName = 'Tashi';
            }]
          };
        }));

        describe('methods', function(){
          describe('create', function(){
            it('should throw exception when called with non object creationInfo.', function(){
              var creationInfo = 'THIS IS NOT AN OBJECT';
              expect(function(){ MVC.create({}, creationInfo); }).toThrow();
            });

            it('should throw exception when called with creationInfo that not contains template or templateUrl info.', function(){
              var creationInfo = {};
              expect(function(){ MVC.create({}, creationInfo); }).toThrow();
            });

            it('should store the creation info template in $templateCache', function(){
              MVC.create($scope, creationInfo);
              $httpBackend.flush();
              expect($tempalteCahce.get('views/template.html')[1]).toBe('<div></div>');
            });

            it('should return resolved promise { scope: .., element: .. } when called with valid params.', function(){
              var success = jasmine.createSpy('success');
              MVC.create($scope, creationInfo).then(function(result){
                success();
                expect(result !== null && typeof result === 'object').toBeTruthy();
                expect(result.scope).toBeDefined();
                expect(result.element).toBeDefined();
              });
              $httpBackend.flush();
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });

            it('should create new scope when called with newScope = true and valid params.', function(){
              var success = jasmine.createSpy('success');
              MVC.create($scope, creationInfo, {}, true).then(function(result){
                success();
                expect(result !== null && typeof result === 'object').toBeTruthy();
                expect(result.scope).toBeDefined();
                expect(result.element).toBeDefined();
                result.scope.isNew = 'IM NOT NEW SCOPE!!!';
                expect($scope.isNew).toBeUndefined();
              });
              $httpBackend.flush();
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });

            it('should create new isolated scope when called with newScope = true and isolate = true and valid params.', function(){
              var success = jasmine.createSpy('success');
              $scope.isIsolated = angular.noop;
              MVC.create($scope, creationInfo, {}, true, true).then(function(result){
                success();
                expect(result !== null && typeof result === 'object').toBeTruthy();
                expect(result.scope).toBeDefined();
                expect(result.element).toBeDefined();
                expect(result.scope.isIsolated).toBeUndefined();
              });
              $httpBackend.flush();
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });

            it('should add the model properties to the new scope when called with valid params.', function(){
              var success = jasmine.createSpy('success');
              MVC.create($scope, creationInfo, { go: 'pro' }, true).then(function(result){
                success();
                expect(result !== null && typeof result === 'object').toBeTruthy();
                expect(result.scope).toBeDefined();
                expect(result.element).toBeDefined();
                expect(result.scope.go).toBe('pro');
              });
              $httpBackend.flush();
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });

            it('should return non compiled element when called with compile = false and valid params.', function(){
              var success = jasmine.createSpy('success');
              MVC.create($scope, creationInfo, {} , true, false, false).then(function(result){
                success();
                expect(result !== null && typeof result === 'object').toBeTruthy();
                expect(result.scope).toBeDefined();
                expect(result.element).toBeDefined();
                expect(result.element.scope()).toBeUndefined();
              });
              $httpBackend.flush();
              $rootScope.$digest();
              expect(success).toHaveBeenCalled();
            });
          });
        });
      })
    });
  });
});

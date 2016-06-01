describe('haikuFactory', function (service) {
	
	beforeEach(angular.mock.module('haikuForYou'));
	
	var $controller;
	var service;
	var httpBackend;
	
	beforeEach(angular.mock.inject(function(_$controller_){
		$controller = _$controller_;
	}));
	
	beforeEach(function () {
		angular.mock.inject(function ($injector) {
			httpBackend = $injector.get('$httpBackend');
			service = $injector.get('service');
		})
	});
	
	describe('getAll', function () {
		it("should return list of all haikus", inject(function () {
			httpBackend.expectGET('/haukus').respond(['haiku 1', 'haiku 2', 'haiku 3']);
			service.getAll(function (result) {
				expect(result).toEqual(['haiku 1', 'haiku 2', 'haiku 3']);
			});
			httpBackend.flush();
		}))
	});

});
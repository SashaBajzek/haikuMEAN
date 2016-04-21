var app = angular.module('haikuForYou', ['ui.router']);

app.config([
	'$stateProvider',
	'$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		$stateProvider
			.state('home', {
				url: '/home',
				templateUrl: '/home.html',
				controller: 'MainCtrl',
				resolve: {
					postPromise: ['haikus', function(haikus){
						return haikus.getAll();
					}]
				}
			})
			.state('show', {
				url: '/home/{id}',
				templateUrl: '/home.html',
				controller: 'ShowCtrl'
			})
			.state('haikus', {
				url: '/home/{id}',
				templateUrl: '/home.html',
				controller: 'ShowCtrl'
			})
			.state('new', {
				url:'/new',
				templateUrl: '/new.html',
				controller: 'createHaikuCtrl'
			});
		
		$urlRouterProvider.otherwise('home');
	}
]); 

app.controller('MainCtrl', [
	'$scope', 
	'haikus',
	
	function($scope, haikus) {
		
		$scope.haikus = haikus.haikus;
	}
]);


app.controller('ShowCtrl', [
	'$scope', 
	'haikus',
	'$stateParams',
	function($scope, $stateParams, haikus) {
		
		$scope.haikus = haikus.haikus;
		
	}
]);

app.controller('createHaikuCtrl', [
	'$scope',
	'$stateParams',
	'haikus',
	function($scope, $stateParams, haikus){
		$scope.haikus = haikus.haikus;
		
		$scope.addHaiku = function(){
			if(!$scope.haikuBody || $scope.haikuBody === '')
				{return;}
			haikus.create({
				haikuBody: $scope.haikuBody
			});
		
			$scope.haikuBody = '';
		};		
	}
]);

app.factory('haikus', ['$http', function($http){
	var o = {
		haikus: []
	};
	
	o.getAll = function() {
		return $http.get('/haikus').success(function(data) {
			angular.copy(data, o.haikus);
		});
	};
	
	o.create = function(haiku) {
		return $http.post('/haikus', haiku).success(function(data){
			o.haikus.push(data);
		});
	};
	
	return o;
}]);
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
		
		//$scope.haikus = [{"_id":"5718531a8b8eb98602a37483","haikuBody":"test","__v":0},{"_id":"57185d4e990671ea0252e718","haikuBody":"First Haiku","__v":0},{"_id":"57185e68990671ea0252e719","haikuBody":"second","__v":0}]
		
		$scope.shuffle = function (array) {
			var currentIndex = array.length, temporaryValue, randomIndex;
			
			//While there remain elements to shuffle
			while (0 !== currentIndex) {
				
				//Pick a remaining element...
				randomIndex = Math.floor(Math.random() * currentIndex);
				currentIndex -=1;
				
				//And swap it with the current element
				temporaryValue = array[currentIndex];
				array[currentIndex] = array[randomIndex];
				array[randomIndex] = temporaryValue;
			}
			
			return array;
		};
		
		$scope.haikusRandom = $scope.shuffle($scope.haikus);

		$scope.currentHaiku = 0;
		
		$scope.nextHaiku = function(){
			$scope.currentHaiku +=1;
			if($scope.currentHaiku>=$scope.haikusRandom.length)
			{$scope.currentHaiku = 0;}
				 
		};
		
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
	
	o.get = function(id) {
		return $http.get('/haikus/' + id).then(function(res){
			return res.data;
		});
	};
	
	return o;
}]);
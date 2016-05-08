var app = angular.module('haikuForYou', ['ui.router', 'ui.bootstrap']);

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
						return haikus.getAllRandomized();
					}]
				}
			})
			.state('admin', {
				url:'/admin',
				templateUrl: '/admin.html',
				controller: 'manageHaikuCtrl',
				resolve: {
					postPromise: ['haikus', function(haikus){
						return haikus.getAll();
					}]
				}
			});
		
		$urlRouterProvider.otherwise('home');
	}
]); 

app.controller('MainCtrl', [
	'$scope', 
	'haikus',
	'$uibModal',
	function($scope, haikus, $uibModal) {
		
		$scope.haikus = haikus.haikus;
		
		$scope.currentIndex = function() {
			return haikus.currentHaiku;
		};
		
		$scope.incrementIndex = function() {
			haikus.nextHaiku();
		};
		
		// Create New Haiku Modal
		$scope.animationsEnabled = true;

  	$scope.open = function (size) {
    	var modalInstance = $uibModal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'myModalContent.html',
				controller: 'ModalInstanceCtrl',
				size: size,
			});
		};
	}
]);


app.controller('ModalInstanceCtrl', [
	'$scope',
	'$uibModalInstance',
	'haikus',
	function ($scope, $uibModalInstance, haikus) {

  $scope.haikus = haikus.haikus;

	$scope.addHaiku = function(){
		haikus.create({
			haikuLine1: $scope.haikuLine1,
			haikuLine2: $scope.haikuLine2,
			haikuLine3: $scope.haikuLine3,
			haikuTheme: $scope.haikuTheme
		});
	};		

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
		
}]);


app.controller('manageHaikuCtrl', [
	'$scope',
	'$stateParams',
	'haikus',
	function($scope, $stateParams, haikus){
		$scope.haikus = haikus.haikus;
		
		$scope.deleteHaiku = function(haiku){
			//Splicing haiku out of mongoDB
			haikus.delete(haiku);
			//Splicing haiku out of the $scope.haikus array to not disturb any previous view changes
			for(var i = 0; i < $scope.haikus.length; i++) {
				if($scope.haikus[i]._id === haiku._id){
					$scope.haikus.splice(i, 1);
					break;
				}
			};	
		};	
		
}]);


app.factory('haikus', [
	'$http', 
	function($http){
	var o = {
		haikus: []  //storing haikus in mongoDB 
	};
		
	o.currentHaiku = 0;
		
	o.nextHaiku = function() {
		o.currentHaiku +=1;
		if(o.currentHaiku >= o.haikus.length)
		{
			o.currentHaiku = 0;
		}	 
	};	
		
	//get all haikus
	o.getAll = function() {
		return $http.get('/haikus')
			.success(function(data) {
				angular.copy(data, o.haikus);
		});
	};
		
	//get all haikus randomized
	o.getAllRandomized = function() {
		return $http.get('/haikus')
			.success(function(data) {
				angular.copy(data, o.haikus);
				o.haikus = shuffle(o.haikus);
		});
	};
	
	//get single haiku
	o.get = function(id) {
		return $http.get('/haikus/' + id)
			.then(function(res){
				return res.data;
		});
	};
	
	//create new haiku
	o.create = function(haiku) {
		return $http.post('/haikus', haiku)
			.success(function(data){
				o.haikus.splice(o.currentHaiku + 1, 0, data);
				o.currentHaiku++;
		});
	};
	
	//delete single haiku
	o.delete = function(haiku) {
		$http.delete('/haikus/'+haiku._id);
	};
		
	var shuffle = function (array) {
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
	
	return o;
}]);
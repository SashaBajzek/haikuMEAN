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
						return haikus.getAll();
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
		
		$scope.haikusRandom = shuffle($scope.haikus);

		$scope.currentHaiku = 0;
		
		$scope.nextHaiku = function(){
			$scope.currentHaiku +=1;
			if($scope.currentHaiku >= $scope.haikusRandom.length)
			{
				$scope.currentHaiku = 0;
			}	 
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
			
		haikus.delete(haiku);

		};		
	}
]);



app.factory('haikus', [
	'$http', 
	function($http){
	var o = {
		haikus: []  //storing haikus in mongoDB 
	};
	
	//get all haikus
	o.getAll = function() {
		return $http.get('/haikus').success(function(data) {
			angular.copy(data, o.haikus);
		});
	};
	
	//get single haiku
	o.get = function(id) {
		return $http.get('/haikus/' + id).then(function(res){
			return res.data;
		});
	};
	
	//create new haiku
	o.create = function(haiku) {
		return $http.post('/haikus', haiku).success(function(data){
			o.haikus.push(data);
		});
	};
	
	//delete single haiku
	o.delete = function(haiku) {
		return $http.delete('/haikus/'+haiku._id).success(function(data) {
			angular.copy(data, o.haikus); //recommended to not refresh haiku list since this would erase anything you changed in views.  Instead, should return nothing & you should splice out the deleted haiku
		});
	};
	
	return o;
}]);
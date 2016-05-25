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
			})
			.state('login', {
				url:'/login',
				templateUrl: '/login.html',
				controller: 'AuthCtrl',
				onEnter: ['$state', 'auth', function($state, auth) {
					if(auth.isLoggedIn()){
						$state.go('admin');
					}
				}]
			})
			.state('register', {
				url: '/register',
				templateUrl: '/register.html',
				controller: 'AuthCtrl',
				onEnter: ['$state', 'auth', function($state, auth){
					if(auth.isLoggedIn()) {
						$state.go('admin');
					}
				}]
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
	'auth',
	function($scope, $stateParams, haikus, auth){
		$scope.haikus = haikus.haikus;
		$scope.isLoggedIn = auth.isLoggedIn;
		
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

app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth) {
		$scope.user = {};
		
		$scope.register = function() {
			auth.register($scope.user)
				.then(function(){
					$state.go('admin');
				})
				.error(function(error){
					$scope.error = error;	
				});
		};
		
		$scope.logIn = function() {
			auth.logIn($scope.user)
				.then(function(){
				$state.go('admin');
				})
				.error(function(error){
					$scope.error = error;
				});
		};
}]);

app.controller('NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth) {
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
}]);


app.factory('haikus', [
	'$http', 
	'auth',
	function($http, auth){
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
		$http.delete('/haikus/'+haiku._id, {
			headers: {Authorization: 'Bearer '+auth.getToken()}
		});
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


app.factory('auth', [
	'$http', 
	'$window', 
	function($http, $window){
	var auth = {};
	
	auth.saveToken = function (token) {
		$window.localStorage['haikuForYou-token'] = token;
	};
	
	auth.getToken = function () {
		return $window.localStorage['haikuForYou-token'];
	};
	
	auth.isLoggedIn = function () {
		var token = auth.getToken();
		
		if(token){ 
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		}
		else {
			return false;
		}
	};
	
	auth.currentUser = function() {
		if(auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			
			return payload.username;
		}
	};
	
	auth.register = function(user) {
		return $http.post('/register', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};
	
	auth.logIn = function(user) {
		return $http.post('/login', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};
	
	auth.logOut = function() {
		$window.localStorage.removeItem('haikuForYou-token');
	};
	
	return auth;
}]);
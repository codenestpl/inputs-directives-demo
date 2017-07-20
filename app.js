	// create the module and name it routeApp
	var routeApp = angular.module('routeApp', ['ngRoute','ngMap','dndLists']);
	var geocoder= new google.maps.Geocoder();

	routeApp.config(['$sceDelegateProvider', function($sceDelegateProvider) {
	   $sceDelegateProvider.resourceUrlWhitelist([
	    'self',
	    'https://maps.googleapis.com/maps/api/distancematrix/**'
	  ]);
	}])

	// configure our routes
	routeApp.config(function($routeProvider) {
		$routeProvider

			// route for the About page
			.when('/', {
				templateUrl : 'pages/about.html',
				controller  : 'mainController'
			})

			// route for the Points page
			.when('/points', {
				templateUrl : 'pages/points.html',
				controller  : 'pointsController'
			})

			// route for the Routes page
			.when('/routes', {
				templateUrl : 'pages/routes.html',
				controller  : 'routesController'
			});
	});

	// create the controller and inject Angular's $scope
	routeApp.controller('mainController', function($scope) { 

		$scope.points = [
			{
				address: 'Kraków',
				location:[50.06465009999999,19.94497990000002],
				stopover:true,
				toEdit:false
			},
			{
				address: 'Warszawa',
				location:[52.2296756,21.012228700000037],
				stopover:true,
				toEdit:false
			}
			,
			{
				address: 'Kielce',
				location:[50.866077,20.628568],
				stopover:true,
				toEdit:false
			}
				]; 
		 
		$scope.mapCenter=[20,20];
		$scope.routesPage=false;
		$scope.selected=null;
		$scope.wayPointsArray=[];
		$scope.startPoint=$scope.points[0].location;
		$scope.endPoint=$scope.points[$scope.points.length-1].location;

		$scope.$watch('points', function(){ 
		    wayPoints(); 
		    $scope.startPoint=$scope.points[0].location;
			$scope.endPoint=$scope.points[$scope.points.length-1].location;
		}, true);

		function wayPoints() { 
			$scope.wayPointsArray = angular.copy($scope.points);
			$scope.wayPointsArray.pop();
			$scope.wayPointsArray.shift();

			for (var i = 0; i < $scope.wayPointsArray.length; i++) {
				 delete $scope.wayPointsArray[i].address;
				 delete $scope.wayPointsArray[i].toEdit;
				 $scope.wayPointsArray[i].location = {lat: $scope.wayPointsArray[i].location[0], 
				 	lng: $scope.wayPointsArray[i].location[1]};
			};
		};

	});

	routeApp.controller('pointsController', function($scope) {

		$scope.deletePoint = function(indexPoint){ 
			$scope.points.splice(indexPoint, 1);
		}; 	

		$scope.editPoint = function(indexPoint){			 
			$scope.pointAddress = $scope.points[indexPoint].address; 
			$scope.points.splice(indexPoint, 1);
		}; 	

		$scope.addPoint = function(){
			var address = $scope.pointAddress;

			if(address){ 

				$scope.points.push({
					address: address,
					location:[],
					stopover:true,
					toEdit:false 
				}); 

				geocodeAddress(address,$scope.points.length-1)
			};

			$scope.pointAddress='';
			
		};

		function geocodeAddress(address, pointIndex){
			var location;

			geocoder.geocode({address: address}, function(result,status) {	     
			    
			    if (status == google.maps.GeocoderStatus.OK) {

			        location = [
				    	result[0].geometry.location.lat(),
				    	result[0].geometry.location.lng(), 
				    ]; 

				     
				    $scope.points[pointIndex].location = location;  
			    	 

			    } else {
			         
			    	$scope.points[pointIndex].toEdit = true;		    	 

			    };

			    $scope.$apply(); 

			});

		}; 

	});

	routeApp.controller('routesController',  function($scope, $http) { 
		$scope.routesPage=true; 
		$scope.pointsOpt =  $scope.points; 

		$scope.optimizeRoute = function() {
			for (var i = 0; i < $scope.points.length-1; i++) {
				nextOptimazedPoint(i); 
			}; 

			$scope.points=$scope.pointsOpt;
		};

		function nextOptimazedPoint(idexPoint) { 
			var fromPoint = [{lat: $scope.points[idexPoint].location[0], 
				 	lng: $scope.points[idexPoint].location[1]}]; 
			var toPoints =[]; 

			for (var i = idexPoint+1; i < $scope.points.length; i++) {

				toPoints.push({
					lat: $scope.points[i].location[0], 
				 	lng: $scope.points[i].location[1]
				 }); 
			};

			getDurations(fromPoint, toPoints, idexPoint);
		};

		function getDurations(fromPoint, toPoints,idexPoint){ 
			 
			$scope.routeInfo = null;
	        var distanceMatrix = new google.maps.DistanceMatrixService();
	        var distanceRequest = { region: "il", origins: fromPoint, destinations: toPoints, travelMode: google.maps.TravelMode.DRIVING, unitSystem: google.maps.UnitSystem.METRIC};
	        distanceMatrix.getDistanceMatrix(distanceRequest, function (response, status) {
	            if (status != google.maps.DistanceMatrixStatus.OK) {
	                console.log('An error occured: ' + status);
	            }
	            else {	                
	                  
	                   findNextPoint(response,idexPoint);               
	                
	            }
	        });

		};

		function findNextPoint(pointsCalculation,idexPoint){

			var directionsDurations = [];
			  
			for (var i = 0; i < pointsCalculation.rows[0].elements.length; i++) {
				directionsDurations[i]=pointsCalculation.rows[0].elements[i].duration.value;			   
			}; 

			pointToMove =smallestNumberInArray(directionsDurations);

			movePointOnList(pointToMove, idexPoint);

		};

		function smallestNumberInArray(array) {

			var smallestNumberIndex = 0;
			var smallestNumberValue = array[0];

			for (var i = 0; i < array.length; i++) {
				if(smallestNumberValue>array[i]) {					
					smallestNumberValue=array[i];
					smallestNumberIndex = i;
				};
			};


			return smallestNumberIndex;

		};

		function movePointOnList(pointToMove, idexPoint) {
			 move($scope.pointsOpt,pointToMove+idexPoint+1,idexPoint+1);  
		};
 

		function move(arr, old_index, new_index) {
		    while (old_index < 0) {
		        old_index += arr.length;
		    }
		    while (new_index < 0) {
		        new_index += arr.length;
		    }
		    if (new_index >= arr.length) {
		        var k = new_index - arr.length;
		        while ((k--) + 1) {
		            arr.push(undefined);
		        }
		    }
		     arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);  
		   return arr;
		}

	});


 



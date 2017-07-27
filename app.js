// create the module and name it routeApp
var app = angular.module('app', []);

// create the controller and inject Angular's $scope
app.controller('mainController', function($scope) { 
		$scope.textinput ='';
      $scope.plusNumberInput = function(){ 
        console.log("+");
      };

     $scope.minusNumberInput = function(){ 
        console.log("-");
      };

});


app.directive("ngInput", function(){
  return {
  	restrict: "E",
    require: ["?ngModel", "?type", "?name"],
    scope: {
    	model: '=ngModel'
	},

    template: function(elem, attr){ 
    	return inputTypeRouter( attr);        
    }, 

    link: function(scope, element, attrs, ngModel){
     	linkFunctions(scope, element, attrs, ngModel);
    }

  };
});


app.directive("ngTextarea", function(){
  return {
  	restrict: "E",
    require: ["?ngModel", "?type", "?name"],
    scope: {
    	model: '=ngModel'
	},

    template: function(elem, attr){ 
    	return textarea(attr);       
    }, 

    link: function(scope, element, attrs, ngModel){
     	linkFunctions(scope, element, attrs, ngModel);
    }
    
  };
});		 

function linkFunctions(scope, element, attrs, ngModel ){
	//ngModel =attrs.ngModel;

	 if (!ngModel) return;   

		scope.$watch(attrs.ngModel, function(val) {  
		  scope.model = val;
		});

 };

function inputTypeRouter(attr) {

	switch (attr.type) {
		case 'text':
			return textInput(attr);
			break;
		case 'number':
			return numberInput(attr);
			break;
		default:
			return textInput(attr);

		//More cases... cdn
	};
};

function textInput(attr, nextParams=false) {
	var inputLabel = (attr.name)?createLabel(attr.name, attr.label):'';	 

	var input = '<input ng-model="'+attr.ngModel+'" ng-change="onChange()" type="'+attr.type+'"';
	input += ' name="'+attr.name+'"';
	input += ' id="'+attr.name+'"';
	input += (attr.placeholder)?' placeholder="'+attr.placeholder+'"':'';
	input += (attr.value)?' value="'+attr.value+'"':''; 
	input += (attr.required!==undefined)?' required':'';
	input += (nextParams)?' nextparams':'';
	input += ' >'

	input = inputLabel+input;
	return input;
};

function numberInput(attr) {
	var input = textInput(attr, true);
	var numberParams = '';
	var buttons='<button type=button ng-click="plusNumberInput('+attr.ngModel+')">+</button><button type=button ng-click="minusNumberInput('+attr.ngModel+')">-</button>';

	numberParams += (attr.min)?' min="'+attr.min+'"':'';
	numberParams += (attr.max)?' max="'+attr.max+'"':'';
	numberParams += (attr.step)?' step="'+attr.step+'"':'';
	input += (attr.custombuttons!==undefined)?buttons:'';

	input = input.replace('nextparams', numberParams)
	return input;
};

function textarea(attr) {
	var inputLabel = (attr.name)?createLabel(attr.name, attr.label):'';	 

	var input = '<textarea ng-model="'+attr.ngModel+'" ng-change="onChange()" type="'+attr.type+'"';
	input += ' name="'+attr.name+'"';
	input += ' id="'+attr.name+'"';
	input += (attr.placeholder)?' placeholder="'+attr.placeholder+'"':'';	
	input += (attr.required!==undefined)?' required':'';
	input += ' >';
	input += (attr.value)?' value="'+attr.value+'"':''; 
	input += '</textarea>'

	input = inputLabel+input;
	return input;
};

//More inputs types and params.... cdn

function createLabel(inputId, inputLabel) {
	return '<label for="'+inputId+'">'+inputLabel+': </label><br>'
};

 
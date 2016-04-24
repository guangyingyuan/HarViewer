var app = angular.module("app", ['ngRoute']).config(function($routeProvider) {

	$routeProvider.when('/home', {
		templateUrl: 'home.html',
		controller: 'HomeController'
	});

	$routeProvider.otherwise({ redirectTo: '/home'});

});

app.controller('HomeController', function($scope, $http) {

	var doc = document.getElementById("drophere");

	doc.ondragover = function() {
		this.className = 'file';
		return false;
	};

	doc.ondragleave = function() {
		this.className = '';
		return false;
	}

	doc.ondragend = function() {
		this.className = '';
		return false;
	}

	doc.ondrop = function(event) {
		event.preventDefault && event.preventDefault();

		this.className = '';
		var files = event.dataTransfer.files;

		if (files.length != 1) {
			alert("Only uplaod one http archive at a time.");
			return;
		}

		theFiles = files;

		var formData = new FormData();
		formData.append('file', files[0]);

		$http({
			method: 'POST',
			url: '/har',
			headers : {
				'Content-Type' : undefined
			},
			data: formData
		}).
		then(function(result) {
			$scope.harData = result.data.har;
			$scope.transferred = result.data.transferred;
			$scope.onload = Math.floor(result.data.har.log.pages[0].pageTimings.onLoad);
			mydata = result.data;

			var labels = [];
			var categoryData = [];
			var colors = [];
			var max = result.data.categories[result.data.categories.length - 1][1];

			result.data.categories.forEach(function (category) {
				labels.push(category[0]);
				categoryData.push(category[1]);
				colors.push(getPieSliceColor(max, category[1]));
			});

			var data = {
				labels: labels,
				datasets: [{
					label: 'Response Type',
					data: categoryData,
					backgroundColor: colors,
					hoverBackgroundColor: []
				}]
			};

			console.log(data);


			var ctx = $("#chart").get(0).getContext("2d");
			var myPieCharet = new Chart(ctx, {
				type: 'pie',
				data: data
			});

		});

		return false;
	}

});

function getPieSliceColor(max, val) {

	var scale = Math.floor(255/max);

	var color = 255 - (val * scale)
	var hex = color.toString(16);

	if (hex.length == 1) {
		hex = "0" + hex;
	}


	return "#D8" + hex + hex;
}
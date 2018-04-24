//Recipe API vars
const appID = "ed3ccab7";
const appKey = "55fc72bbb6b5716033f6cc1d04f92ffe";
var baseURL = "https://api.edamam.com/search?app_id=" + appID + "&app_key=" + appKey + "&q=";
var apiFrom = 0;
var apiTo = 9;
var apiImg;
var label;
var ui;

var recipe_name;
var temp_data;

/*
$(document).ready(function(){
	$(document).ajaxStart(function(){
		$('#loading').show();
	}).ajaxStop(function(){
		$('#loading').hide();
	});
});*/

//    <div class="recipe-c" id=id="recipe-content"></div>
$("#but").on("click", function (e) {
	alert("hello");
});

//account.html search
$("#submit1").on("click", function (e) {
	// Prevent form from submitting
	e.preventDefault();

	//Grab the user input from the main word search text box.
	var userInput = $("#user-input1").val().trim().toLowerCase();
	userInput = userInput.replace(/ /g, "+");
	ui = userInput;
	// Integrate user input into our ajax request
	var searchURL = baseURL + userInput;
	var w = window.open("/home", "_self");
	w.onload = function() {
		$("#recipe-content", w.document).append("HELLO!");
		searchRecipe(searchURL);
	};
	/*$.ajax({
		url: "/home#home",
		type: "GET",
		success: function(data) {
			searchRecipe(searchURL);

			// Clear previous search
			$("#recipe-content").empty();
			$("#user-input1").val("");
			alert("/hello");
		}
	});*/
		
});

//recipe.html search
$("#submit2").on("click", function (e) {
	//alert("hello");
	// Prevent form from submitting
	e.preventDefault();

	//Grab the user input from the main word search text box.
	var userInput = $("#user-input2").val().trim().toLowerCase();
	userInput = userInput.replace(/ /g, "+");
	ui = userInput;
	// Integrate user input into our ajax request
	var searchURL = baseURL + userInput;
	searchRecipe(searchURL);

	// Clear previous search
	$("#recipe-content").empty();
	$("#user-input2").val("");
});

$("#submit3").on("click", function (e) {
	//alert("hello");
	// Prevent form from submitting
	e.preventDefault();

	//Grab the user input from the main word search text box.
	var userInput = $("#user-input3").val().trim().toLowerCase();
	userInput = userInput.replace(/ /g, "+");
	ui = userInput;
	// Integrate user input into our ajax request
	var searchURL = baseURL + userInput;
	searchRecipe(searchURL);

	// Clear previous search
	$("#recipe-content").empty();
	$("#user-input3").val("");
});

$("#submit4").on("click", function (e) {
	//alert("hello");
	// Prevent form from submitting
	e.preventDefault();

	//Grab the user input from the main word search text box.
	var userInput = $("#user-input4").val().trim().toLowerCase();
	userInput = userInput.replace(/ /g, "+");
	ui = userInput;
	// Integrate user input into our ajax request
	var searchURL = baseURL + userInput;
	searchRecipe(searchURL);

	// Clear previous search
	$("#recipe-content").empty();
	$("#user-input4").val("");
});


//myrecipes.html search
$("#submit5").on("click", function (e) {
	//alert("hello");
	// Prevent form from submitting
	e.preventDefault();

	//Grab the user input from the main word search text box.
	var userInput = $("#user-input5").val().trim().toLowerCase();
	userInput = userInput.replace(/ /g, "+");
	ui = userInput;
	// Integrate user input into our ajax request
	var searchURL = baseURL + userInput;
	searchRecipe(searchURL);

	// Clear previous search
	$("#recipe-content").empty();
	$("#user-input5").val("");
	$("#load-more").css("display","initial");
});

$("#load-more").on("click", function (e) {
	//alert("loading more:" + baseURL + ui);
	// Prevent form from submitting
	e.preventDefault();
	from+=10;
	to+=10;
	searchRecipe(baseURL + ui + "&from=" + apiFrom + "&to=" + apiTo);
});

function searchRecipe(queryURL) {
	console.log("searching recipe " + queryURL);
	fetch(queryURL)
	.then((resp) => resp.json())
	.then(function (data) {
		//for each recipe
		temp_data = data;
		for(var i = apiFrom; i < apiTo; i++) {
			//create card for this recipe
			var c = $("<div>");
			//change display depending on screen size for smaller mobile devices
			c.addClass("card col s12 m6 14");

			var cimg = $("<div>");

			var cardContent = $("<div>");
			cardContent.addClass("card-content");

			//Recipie Name/Label
			var spanTitle = $("<p>");
			spanTitle.addClass("card-title");
			label = data.hits[i].recipe.label;
			spanTitle.text(label);

			//Append Name/Label to recipe image
			cimg.append(spanTitle);

			cimg.addClass("card-image recipe-image");
			var img = $("<img>"); //card for recipe image
			apiImg = data.hits[i].recipe.image; //recipe image URL
			img.attr("src", apiImg);
			img.attr("width", 160);
			img.attr("height", 160);
			cimg.append(img);
			c.append(cimg);

			
			var collapse = $("<button>");
			collapse.attr("type"," button");
			collapse.addClass("btn btn-link text-left").text("Ingredients");
			collapse.attr("data-toggle", "collapse");
			collapse.attr("data-target", "#demo" + i);
			collapse.css("width", "20%");
			//collapse.attr("data-target", "#demo");

			var pRecipe = $("<p>");
			pRecipe.addClass("collapse");
			pRecipe.attr("id", "demo" + i);
			for (var j = 0; j < data.hits[i].recipe.ingredients.length; j++) {
				var ingreds = data.hits[i].recipe.ingredients[j].text;
				var newIng = $("<p>");
				newIng.text(ingreds);
				pRecipe.append(newIng);
			};
			cimg.after(cardContent);

			c.append(collapse);
			c.append(pRecipe);

			// Create link to foreign recipie URL for now
			//needs to take 
			var link = $("<a>");
			link.text("More info");
			sourceLink = data.hits[i].recipe.url;
			link.attr("href", sourceLink);
			// Open recipie in new tab
			link.attr("target", "_blank");
			

			var viewIngredients = $("<button>");
			viewIngredients.addClass("btn btn-success").text("Find Ingredients");
			viewIngredients.attr("data-name", [i]);
			viewIngredients.css("width", "20%");
			viewIngredients.attr("data-toggle", "modal");
			viewIngredients.attr("data-target", "#modalIngredients");
			c.append(viewIngredients);	
			c.append(link);
			$("#recipe-content").append(c);
			$("#recipe-content").append("<br/>");

			viewIngredients.on("click", function(e) {
				var n = $(e.target).data("name");
				recipe_name = n;
				$('#ingredient-dropdown').empty();
				$.ajax({
					url: "/findIngredients",
					method: "POST",
					data: {
						"name": data.hits[n].recipe.label,
						"ingredients": data.hits[n].recipe.ingredientLines,	//this is an array of ingredients
						"image": data.hits[n].recipe.image
						
						//"url": data.hits[n].recipe.url,
						//"calories": data.hits[n].recipe.calories,
						//"servings": data.hits[n].recipe.yield
					},
					success: function(data){
						var object = JSON.parse(data);

						for (var j = 0; j < Object.keys(object).length; j++) {
						var text = '<select class="form-control" id="sel1">';
							var ob = object[Object.keys(object)[j]];
							for (index in ob[0]) {
								text += '<option id="sel1" src="' + ob[0][index].image + '">Meijer: ' + ob[0][index].name + ", Cost: " + ob[0][index].cost + '</option>';
							}
							j++;
							ob = object[Object.keys(object)[j]];
							for (index in ob[0]) {
								text += '<option id="sel1" src="' + ob[0][index].image + '">Sam\'s Club: ' + ob[0][index].name + ", Cost: " + ob[0][index].cost + '</option>';
							}
					

							text += '</select>';
							$('#ingredient-dropdown').append(text);
						}
					},
					error: function(error){
						alert(error.responseText);
					}
				});
			});
		};
	});
};

function submit_ingredients(){
	var object = [];
	$('#ingredient-dropdown').children('select').each(function(){
		object.push(this.value);
		alert(this.value);
	});
	$.ajax({
		url: "/rec",
		method: "POST",
		data: {
			"name": temp_data.hits[recipe_name].recipe.label,
			"ingredients": object,
			"recipe-image": temp_data.hits[recipe_name].recipe.image,
			"calories": temp_data.hits[recipe_name].recipe.calories,
			"servings": temp_data.hits[recipe_name].recipe.servings,
			"url": temp_data.hits[recipe_name].recipe.url
		},
		success: function(data){
			document.open('text/html');
			document.write(data);
			document.close();
		},
		error: function(error) {
			alert(error.responseText);
		}
	});

	alert(temp_data.hits[recipe_name].recipe.label);
}

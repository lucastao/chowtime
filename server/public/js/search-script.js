//Recipe API vars
const appID = "ed3ccab7";
const appKey = "55fc72bbb6b5716033f6cc1d04f92ffe";
var baseURL = "https://api.edamam.com/search?app_id=" + appID + "&app_key=" + appKey + "&q=";
var apiFrom = 0;
var apiTo = 9;
var apiImg;
var label;
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

	// Integrate user input into our ajax request
	var searchURL = baseURL + userInput;
	searchRecipe(searchURL);

	// Clear previous search
	$("#recipe-content").empty();
	$("#user-input5").val("");
});

function searchRecipe(queryURL) {
	console.log("searching recipe " + queryURL);
	fetch(queryURL)
	.then((resp) => resp.json())
	.then(function (data) {
		//for each recipe
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

			//var table = "<table><tr><td>Jill</td><td>Smith</td><td>50</td></tr><tr><td>Eve</td><td>Jackson</td><td>94</td></tr><tr><td>John</td><td>Doe</td><td>80</td></tr></table>"

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

			//On search page, reveal recipe list on button click
			img.addClass("activator");
			activateIngredients = $("<span>");
			activateIngredients.addClass("card-title activator").text("Ingredients");
			revealIngredientsIcon = $("<i>"); //button to open ingredients card
			//Add tooltip text
			revealIngredientsIcon.addClass("material-icons right tooltipped").attr("data-position", "top").attr("data-tooltip", "Click to view ingredients.");
			//Init tooltip
			$('.tooltipped').tooltip({ delay: 30 });
			activateIngredients.append(revealIngredientsIcon);
			
			//Add button to reveal card to the card
			//cardContent.append(activateIngredients);
			
			
			var cardReveal = $("<div>");
			cardReveal.addClass("card-reveal");
			
			var cardRevealTitle = $("<span>");
			cardRevealTitle.addClass("card-title").text("Ingredients");
			
			var closeRevealIcon = $("<i>"); //Allows for closing of card
			
			closeRevealIcon.addClass("material-icons right").text("close");
			cardRevealTitle.append(closeRevealIcon);
			cardReveal.append(cardRevealTitle);
			
			//Add reveal to the main card
			
			c.append(collapse);
			c.append(pRecipe);
			//Add the ingredients to the cardReveal card
			//cardReveal.append(pRecipe);
			/*var cardAction = $("<div>");
			cardAction.addClass("card-action");*/

			// Create link to foreign recipie URL for now
			//needs to take 
			var link = $("<a>");
			link.text("More info");
			sourceLink = data.hits[i].recipe.url;
			link.attr("href", sourceLink);
			// Open recipie in new tab
			link.attr("target", "_blank");
			
			/*
			//Create button to favorite a recipe
			var favoriteButton = $("<i>");
			favoriteButton.addClass("small fa fa-cutlery tooltipped");
			favoriteButton.attr("data-name", [i]).attr("data-position", "top").attr("data-tooltip", "Click to save recipe for later.");
			$('.tooltipped').tooltip({ delay: 30 });
			*/
			//cardContent.after(cardAction);
			

			var viewIngredients = $("<button>");
			viewIngredients.addClass("btn btn-success").text("Find Ingredients");
			viewIngredients.attr("data-name", [i]);
			viewIngredients.css("width", "20%");
			viewIngredients.attr("data-toggle", "modal");
			viewIngredients.attr("data-target", "#modalIngredients");
			c.append(viewIngredients);	
			c.append(link);
			$("#recipe-content").append(c);

			/*
			favoriteButton.on("click", function(e) {
				var n = $(e.target).data("name");
				var newFavorite = {
					name: data.hits[n].recipe.label,
					ingredients: data.hits[n].recipe.ingredientLines,
					image: data.hits[n].recipe.image
				};
				//add newFavorite to database 
			});
			*/

			viewIngredients.on("click", function(e) {
				var n = $(e.target).data("name");
				$.ajax({
					url: "/findIngredients",
					method: "POST",
					data: {
						"name": data.hits[n].recipe.label,
						"ingredients": data.hits[n].recipe.ingredientLines,
						"image": data.hits[n].recipe.image
					},
					success: function(data){
						var object = JSON.parse(data);
						alert(object);
						alert(Object.keys(object).length);
						for (var j = 0; j < Object.keys(object).length; j++) {
							var ob = object[Object.keys(object)[j]];
							for (index in ob[0]) {
								
								alert(ob[0][index].image);
								alert(ob[0][index].name);
								alert(ob[0][index].cost);
							}
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

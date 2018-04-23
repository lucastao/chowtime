//Recipe API vars
const appID = "ed3ccab7";
const appKey = "55fc72bbb6b5716033f6cc1d04f92ffe";
var baseURL = "https://api.edamam.com/search?app_id=" + appID + "&app_key=" + appKey + "&q=";
var apiFrom = 0;
var apiTo = 9;
var apiImg;
var label;

$("#submit").on("click", function (e) {

	// Prevent form from submitting
	e.preventDefault();

	//Grab the user input from the main word search text box.
	var userInput = $("#user-input").val().trim().toLowerCase();
	userInput = userInput.replace(/ /g, "+");

	// Integrate user input into our ajax request
	var searchURL = baseURL + userInput;
	searchRecipe(searchURL);

	// Clear previous search
	$("#recipe-content").empty();
	$("#user-input").val("");
});

$("#submit2").on("click", function (e) {

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

	// Prevent form from submitting
	e.preventDefault();

	//Grab the user input from the main word search text box.
	var userInput = $("#user-input3").val().trim().toLowerCase();
	userInput = userInput.replace(/ /g, "+");

	// Integrate user input into our ajax request
	var searchURL = baseURL + userInput;
	searchRecipe(searchURL);

	// Clear previous search
	$("#recipe-content2").empty();
	$("#user-input3").val("");
});

$("#submit4").on("click", function (e) {

	// Prevent form from submitting
	e.preventDefault();

	//Grab the user input from the main word search text box.
	var userInput = $("#user-input4").val().trim().toLowerCase();
	userInput = userInput.replace(/ /g, "+");

	// Integrate user input into our ajax request
	var searchURL = baseURL + userInput;
	searchRecipe(searchURL);

	// Clear previous search
	$("#recipe-content2").empty();
	$("#user-input4").val("");
});

function searchRecipe(queryURL) {
	fetch(queryURL)
	.then((resp) => resp.json())
	.then(function (data) {
		console.log(queryURL);
		//for each recipe
		for(var i = apiFrom; i < apiTo; i++) {
			//create card for this recipe
			var c = $("<div>");
			//change display depending on screen size for smaller mobile devices
			c.addClass("card col s12 m6 14");

			var cimg = $("<div>");
			cimg.addClass("card-image recipe-image");
			var img = $("<img>"); //card for recipe image
			apiImg = data.hits[i].recipe.image; //recipe image URL
			img.attr("src", apiImg);
			cimg.append(img);
			c.append(cimg);

			var cardContent = $("<div>");
			cardContent.addClass("card-content");

			//Recipie Name/Label
			var spanTitle = $("<span>");
			spanTitle.addClass("card-title");
			label = data.hits[i].recipe.label;
			spanTitle.text(label);
			//Append Name/Label to recipe image
			cimg.append(spanTitle);

			var pRecipe = $("<p>");
			for (var j = 0; j < data.hits[i].recipe.ingredients.length; j++) {
				var ingreds = data.hits[i].recipe.ingredients[j].text;
				var newIng = $("<p>");
				newIng.text(ingreds)
				pRecipe.append(newIng);
			};
			cimg.after(cardContent);

			//On search page, reveal recipe list on button click
			img.addClass("activator");
			activateIngredients = $("<span>");
			activateIngredients.addClass("card-title activator").text("Ingredients");
			revealIngredientsIcon = $("<i>"); //button to open ingredients card
			//Add tooltip text
			revealIngredientsIcon.addClass("material-icons right tooltipped").text("more_vert").attr("data-position", "top").attr("data-tooltip", "Click to view ingredients.");
			//Init tooltip
			$('.tooltipped').tooltip({ delay: 30 });
			activateIngredients.append(revealIngredientsIcon);
			
			//Add button to reveal card to the card
			cardContent.append(activateIngredients);
			
			var cardReveal = $("<div>");
			cardReveal.addClass("card-reveal");
			
			var cardRevealTitle = $("<span>");
			cardRevealTitle.addClass("card-title").text("Ingredients");
			
			var closeRevealIcon = $("<i>"); //Allows for closing of card
			
			closeRevealIcon.addClass("material-icons right").text("close");
			cardRevealTitle.append(closeRevealIcon);
			cardReveal.append(cardRevealTitle);
			
			//Add reveal to the main card
			c.append(cardReveal);
			//Add the ingredients to the cardReveal card
			cardReveal.append(pRecipe);
			var cardAction = $("<div>");
			cardAction.addClass("card-action");

			// Create link to foreign recipie URL for now
			//needs to take 
			var link = $("<a>");
			link.text("More info");
			sourceLink = data.hits[i].recipe.url;
			link.attr("href", sourceLink);
			// Open recipie in new tab
			link.attr("target", "_blank");

			//Create button to favorite a recipe
			var favoriteButton = $("<i>");
			favoriteButton.addClass("button-action");
			favoriteButton.attr("data-name", [i]).attr("data-position", "top").attr("data-tooltip", "Click to save recipe for later.");
			$('.tooltipped').tooltip({ delay: 30 });
			cardAction.append(link, favoriteButton);
			cardContent.after(cardAction);
			
			$("#recipe-content").append(card);
			$("#recipe-content2").append(card);
			
			favoriteButton.on("click", function(e)) {
				var n = $(e.target).data("name");
				var newFavorite = {
					name: data.hits[n].recipe.label,
					ingredients: data.hits[n].recipe.ingredientLines,
					image: data.hits[n].recipe.image
				};
				//add newFavorite to database 
			}
		}
	});
}
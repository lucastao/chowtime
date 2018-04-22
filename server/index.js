var express = require('express');
var body_parser = require('body-parser');
var admin = require('firebase-admin');
var path = require('path');
var serviceAccount = require('./keys/chowtime-cs252-firebase-adminsdk-ug28y-6799120ca9.json');
var axios = require('axios');		// promise based HTTP client
var cheerio = require('cheerio');	// jQuery for the server; get content from axios results
var fs = require('fs');			// write fetched content into json file

var app = express();
app.use(body_parser.urlencoded({extended: true}));

const { exec } = require('child_process');

// Constants used for verifying JSON subsmission by users
const username = "username";
const password = "password";
const email = "email";
const newPassword = "newPassword";
const newEmail = "newEmail";
const host = "localhost";

// Database constants
const db_username = "username";
const db_password = "password";
const db_name = "database";
const db_table = "accounts";

// HTML directory constants
const html = "/src/html/";

//Recipe API vars
const appID = "ed3ccab7";
const appKey = "55fc72bbb6b5716033f6cc1d04f92ffe";
var baseURL = "https://api.edamam.com/search?app_id=" + appID + "&app_key=" + appKey + "&q=";
var apiFrom = 0;
var apiTo = 9;

// URLs used for web scraping
const meijer = "https://www.meijer.com/catalog/search_command.cmd?keyword=";
const meijer_location = "https://www.meijer.com/atstores/main.jsp?icmpid=HeaderYourStores";
const sams = "https://www.samsclub.com/sams/search/searchResults.jsp?searchCategoryId=all&searchTerm=";

// Dynamic scraping allows for parsing based on location
const dynamic_scrape = false;

const port = process.env.PORT || 6211;

// Serve 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initializing Firebase SDK
admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: 'https://chowtime-cs252.firebaseio.com',
	databaseAuthVariableOverride: {
		uid: "chowtime-server-worker"
	}
});

var db = admin.database();
var accounts = db.ref('users');

accounts.on('child_added', function(snapshot){
	var post = snapshot.val();

});

// Sample for writing to database
/*var users = db.ref('users');
users.set({
	test_user: {
		name: "Jack",
		email: "jack@gmail.com"
	}
});*/

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname + html + "login.html"));
});

app.get('/homeGuest', function(request, response) {
	response.sendFile(path.join(__dirname + html + "home-guest.html"));
});

// Called when a POST request is made to /registerAccount
app.post('/register', function(request, response) {
	console.log(request.body);
	if (!request.body) return response.sendStatus(400);
	if (Object.keys(request.body).length != 3 || !request.body.regEmail || !request.body.regPassword || !request.body.confPassword) {
		return response.status(400).send("Invalid POST request\n");
	}
	if (request.body.regPassword.localeCompare(request.body.confPassword) != 0) {
		return response.status(400).send("Passwords do not match.");
	}
	
	console.log("Register request received.");
	register(request, response);
});

// Called when a POST request is made to /login
app.post('/login', function(request, response) {
	if (!request.body) return response.sendStatus(400);
	if (Object.keys(request.body).length != 2 || !request.body.email || !request.body.password) {
		return response.status(400).send("Invalid POST request\n");
	}
	console.log("Login request received.");
	console.log(request.body);

	login(request, response);
});

// Called when a POST request is made to /deleteAccount
app.post('/deleteAccount', function(request, response) {

});

// Called when a POST request is made to /changePassword
app.post('/changePassword', function(request, response) {

});

// Called when a POST request is made to /changeEmail
app.post('/changeEmail', function(request, response) {
});

// Called when a POST request is made to /forgotPassword
app.post('/forgotPassword', function(request, response) {
});

// Helper function that registers a user if username and email does not already exist
function register(request, response) {
	console.log("Request.ip: " +request.ip);
	console.log(request.headers['x-forwarded-for'] || request.connection.remoteAddress);
	accounts.once("value", snapshot => {
		const users = snapshot.val();
		var counter = 0;
		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.val().email;
			if (key === request.body.regEmail) {
				response.status(400).send("User already exists.");
				return;
			}
			if (counter === snapshot.numChildren() - 1) {
				createAccount(request, response);
			}
			counter++;
		});
	});
}

function createAccount(request, response) {
			var newPostRef = accounts.push();
			newPostRef.set({
				email: request.body.regEmail,
				password: request.body.regPassword
			}, function(error){
				if (error) {
					console.log("Error in registering user.");
				} else {
					response.status(200).send("Account registered.");
				}
			});

}

// Helper function that verifies user has an account and logs them in
function login(request, response) {
	accounts.once("value", snapshot => {
		const users = snapshot.val();
		var counter = 0;
		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.val().email;
			if (key === request.body.email) {
				if (request.body.password === childSnapshot.val().password) {
					return response.sendFile(path.join(__dirname + html + "home-user.html"));
				}
				return response.status(400).send("Wrong email/password.")
				//return response.sendFile(path.join(__dirname + html + "login.html"));
			}
			if (counter === snapshot.numChildren() - 1) {
				return response.status(400).send("Account does not exist.");
				//return response.sendFile(path.join(__dirname + html + "login.html"));
			}
			counter++;
		});
	});
}

// Helper function that deletes an account
function deleteAccount(u, p, e, response) {
}

// Helper function that changes the password of an account
function changePassword(u, p, e, n, response) {
}

// Helper function that changes the email of an account
function changeEmail(u, p, e, n, response) {
}

// Helper function for forgotten password
function forgotPassword(u, e, response) {
}

var apiImg;
var label;
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
				var ingreds = data.hits[i].recipe.ingredients[j];
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
			var link = $("<a>");
			link.text("More info");
			sourceLink = data.hits[i].recipe.url;
			link.attr("href", sourceLink);
			// Open recipie in new tab
			link.attr("target", "_blank");

			$("#recipe-list").append(card);

		}
	});
}

// Scrape meijer for food information
// Their website might use javascript to edit core html after screen has loaded, so prices may vary slightly
function scrape(food, ip) {
	food = food.replace(/ /g, "+");		// replacing words with spaces with + (ex. ice cream -> ice+cream)
	var full_url = meijer + food;
	var file_name = "./data/" + food + '-meijer' + ".json";
	axios({
		method: 'get',
		url: full_url,
		headers: {'X-Forwarded-For': ip}
	})
		.then((response) => {
			if (response.status === 200) {
				var $;
				if (dynamic_scrape) {
					var command = 'casperjs.exe dynamic_scrape.js ' + food;
					console.log("command: " + command);
					exec(command, (err, stdout, stderr) => {
						console.log('stdout: ' + stdout);
						console.log('stderr: ' + stderr);
						if (err !== null) {
							console.log('exec error: ' + err);
						}

						console.log("Finished");
						$ = cheerio.load(fs.readFileSync('./scraped.html'));
						parse($, file_name);
					});
					console.log("temp");
				} else {
					const html = response.data;
					$ = cheerio.load(html);
					parse($, file_name);
				}
			}
		}, (error) => console.log(error) );
}

function scrape_sams(food, ip) {
	var full_url = sams + food;
	food = food.replace(/ /g, "+");		// replacing words with spaces with + (ex. ice cream -> ice+cream)
	var file_name = "./data/" + food + "-sams" + ".json";
	axios({
		method: 'get',
		url: full_url,
		headers: {'X-Forwarded-For': ip}
	})
		.then((response) => {
			if (response.status === 200) {
				var $;
					const html = response.data;
					$ = cheerio.load(html);
					parse_sams($, file_name);
			}
		}, (error) => console.log(error) );
}

function parse($, file_name) {
	var product_cost;
	var product_name;
	var product_image;
	var list = [];

	var item = $('.add-product').each(function(i, elem){
		if ($(this).find('.product-price').find('.prod-price-sort').length) {
			product_cost = $(this).find('.product-price').find('.prod-price-sort').text();
		} else if ($(this).find('.product-price').find('.prodDtlRegPrice').length) {
			product_cost = $(this).find('.product-price').find('.prodDtlRegPrice').text();
		} else if ($(this).find('.product-price').length) {
			product_cost = $(this).find('.product-price').text();
		}
		product_cost = product_cost.replace(/\s/g,'');
		product_name = $(this).find('.mjr-product-name').find('a').text();
		product_image = $(this).find('.prod-img').attr('src');
		list[i] = {
			name: product_name,
			cost: product_cost,
			image: product_image
			}
		});
		fs.writeFile(file_name, JSON.stringify(list), (err) => console.log("Successfully wrote to file."));
}

function parse_sams($, file_name) {
	var product_cost;
	var product_name;
	var product_image;
	var list = [];

	var item = $('.products-card').each(function(i, elem){
		product_cost = $(this).find('.sc-dollars-v2').text() + "." + $(this).find('.sc-cents-v2').text();
		product_name = $(this).find('.img-text').text();
		product_image = $(this).find('.cardProdImg').attr('src');
		list[i] = {
			name: product_name,
			cost: product_cost,
			image: product_image
		}
	});
	fs.writeFile(file_name, JSON.stringify(list), (err) => console.log("Successfully wrote to file."));
}

// Obtains the address of the store that meijers believes you are closest to via ip address
// Will most likely have issues when the server is running from a location different than the user
function get_location(ip) {
	axios({
		method: 'get',
		url: meijer_location,
		headers: {'X-Forwarded-For': ip}
	})
	.then((response) => {
		if (response.status === 200) {
			const html = response.data;
			const $ = cheerio.load(html);
			var address = $('[itemprop="streetAddress"]').text();
			var city = $('[itemprop="addressLocality"]').text();
			var state = $('[itemprop="addressRegion"]').text();
			var post_code = $('[itemprop="postalCode"]').text();
			var phone = $('[itemprop="telephone"]').text();
			console.log(address);
			console.log(city);
			console.log(state);
			console.log(post_code);
			console.log(phone);
		}
	}, (error) => console.log(error));
}

app.listen(port, (err) => {
  if (err) {
    return console.log('Listen error!', err);
  }
  console.log(`Server listening on port ${port}`);
  //scrape("celery", '128.210.106.57');
	//scrape_sams("celery", '128.210.106.57');
	//var ip = '64.119.240.0';
	//var ip = '128.210.106.57';
	//get_location(ip);
});

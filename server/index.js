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

<<<<<<< HEAD
//Recipe API vars
const appID = "ed3ccab7";
const appKey = "55fc72bbb6b5716033f6cc1d04f92ffe";
var baseURL = "https://api.edamam.com/search?app_id=ed3ccab7&app_key=55fc72bbb6b5716033f6cc1d04f92ffe&q=";
var apiFrom = 0;
var apiTo = 9;
=======
// URLs used for web scraping
const meijer = "https://www.meijer.com/catalog/search_command.cmd?keyword=";
const meijer_location = "https://www.meijer.com/atstores/main.jsp?icmpid=HeaderYourStores";
>>>>>>> 08fbf7a2ed3638be4681f1945f53a16c6900e124

// Dynamic scraping allows for parsing based on location
const dynamic_scrape = false;

const port = 3000;

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
var accounts = db.ref('accounts');

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


// Called when a POST request is made to /registerAccount
app.post('/register', function(request, response) {
	if (!request.body) return response.sendStatus(400);
	if (Object.keys(request.body).length != 3 || !request.body.email || !request.body.password) {
		return response.status(400).send("Invalid POST request\n");
	}
	console.log("Register request received.");
	console.log(request.body);
});

// Called when a POST request is made to /login
app.post('/login', function(request, response) {
	if (!request.body) return response.sendStatus(400);
	if (Object.keys(request.body).length != 3 || !request.body.email || !request.body.password) {
		return response.status(400).send("Invalid POST request\n");
	}
	console.log("Login request received.");
	console.log(request.body);

	var exists = checkIfUserExists(request.body.email);
	if (exists) {
		//response.sendFile();

	} else {
		return response.status(400).send("Account does not exist.")
	}
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
function register(u, p, e, response) {
}

// Helper function that verifies user has an account and logs them in
function login(u, p, response) {
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

// Function to check if user already exists
function checkIfUserExists(email) {
	accounts.orderByChild("email").equalTo(email).once('value', function(snapshot){
		if (snapshot.val() !== null) {
			return true;
		}
		return false;
	});
}

<<<<<<< HEAD
function searchRecipe(queryURL) {
	fetch(queryURL)
	.then((resp) => resp.json())
	.then(function (data) {
		console.log(queryURL);
		//for each recipe
		for(var i = apiFrom; i < apiTo; i++) {
			var c = $("<div>");
			c.addClass("card col s12 m6 14");
			var cimg = $("<img>");
			cimg.addClass("card-image recipe-image");
			var img = $("<img>");
			apiImg = data.hits[i].recipe.image; //recipe image URL
			img.attr("src", apiImg);
			cimg.append(img);
			c.append(cimg);
		}
	});
=======
// Scrape meijer for food information
// Their website might use javascript to edit core html after screen has loaded, so prices may vary slightly
function scrape(food) {
	food = food.replace(/ /g, "+");		// replacing words with spaces with + (ex. ice cream -> ice+cream)
	var full_url = meijer + food;
	var file_name = "./data/" + food + ".json";
	axios.get(full_url)
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

function parse($, file_name) {
				var product_cost;
				var product_name;
				var list = [];

				var item = $('.product-info').each(function(i, elem){
					if ($(this).find('.product-price').find('.prod-price-sort').length) {
						product_cost = $(this).find('.product-price').find('.prod-price-sort').text();
					} else if ($(this).find('.product-price').find('.prodDtlRegPrice').length) {
						product_cost = $(this).find('.product-price').find('.prodDtlRegPrice').text();
					} else if ($(this).find('.product-price').length) {
						product_cost = $(this).find('.product-price').text();
					}
					product_cost = product_cost.replace(/\s/g,'');
					product_name = $(this).find('.mjr-product-name').find('a').text();
					list[i] = {
						name: product_name,
						cost: product_cost
					}
				});
				fs.writeFile(file_name, JSON.stringify(list), (err) => console.log("Successfully wrote to file."));

}

// Obtains the address of the store that meijers believes you are closest to via ip address
// Will most likely have issues when the server is running from a location different than the user
function get_location() {
	axios.get(meijer_location)
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
<<<<<<< HEAD

>>>>>>> 08fbf7a2ed3638be4681f1945f53a16c6900e124
=======
>>>>>>> 3f8f661e25b1d2027a45604983fdfd657ee928d0
}

app.listen(port, (err) => {
  if (err) {
    return console.log('Listen error!', err);
  }
  console.log(`Server listening on port ${port}`);
  scrape("celery");
});

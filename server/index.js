var express = require('express');
var session = require('express-session');
var body_parser = require('body-parser');
var admin = require('firebase-admin');
var path = require('path');
var serviceAccount = require('./keys/chowtime-cs252-firebase-adminsdk-ug28y-6799120ca9.json');
var axios = require('axios');		// promise based HTTP client
var cheerio = require('cheerio');	// jQuery for the server; get content from axios results
var fs = require('fs');			// write fetched content into json file

var app = express();
app.use(body_parser.urlencoded({extended: true}));
app.use(session({
	name: 'chowtime-cookie',
	secret: 'test-secret',
	proxy: false,
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false,
		httpOnly: false,
		maxAge: null
	}
}));

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

// URLs used for web scraping
const meijer = "https://www.meijer.com/catalog/search_command.cmd?keyword=";
const meijer_location = "https://www.meijer.com/atstores/main.jsp?icmpid=HeaderYourStores";
const sams = "https://www.samsclub.com/sams/search/searchResults.jsp?searchCategoryId=all&searchTerm=";
const sams_location = "https://www.samsclub.com/sams/homepage.jsp"; 

var closest_meijer = "";

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
var recipes = db.ref('recipes');

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

app.get('/home', function(request, response) {
	response.sendFile(path.join(__dirname + html + "home-user.html"));
});

app.get('/account', function(request, response) {
	console.log(request.session.email);
	var $doc = cheerio.load(fs.readFileSync(path.join(__dirname + html + "account.html")));
	$doc('#my-email').text(request.session.email);
	response.send($doc.html());
});

app.get('/myrecipes', function(request, response) {
	var list = [];
	recipes.once("value", snapshot => {
		const recipe = snapshot.val();
		var counter = 0;
		var num_recipes = 0;
		console.log(request.session.email);
		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.val().email;
			if (key === request.session.email) {
				var object = {
					title: childSnapshot.key,
					description: childSnapshot.val().description,
					ingredients: childSnapshot.val().ingredients,
					procedure: childSnapshot.val().procedure
				};
				num_recipes++;
				list.push(object);
				//response.status(400).send("User already exists.");
				//return;
			}
			if (counter === snapshot.numChildren() - 1) {
				//createAccount(request, response);
				//console.log(list);
				var $doc = cheerio.load(fs.readFileSync(path.join(__dirname + html + "myrecipes.html")));
				console.log("Num Recipes: " + num_recipes);
				for (var j = 0; j < num_recipes; j++) {
					//$doc('.card').append
					var text = '<div class="card-body" id=card' + j  + '><h4 class="card-text">Recipe Title: ' + list[j].title + '</h4><p class="card-text">Description:</p><p class="card-text card">' + list[j].description +'</p><p class="card-text">Ingredients:</p><p class="card-text"><ul class="list-group">';
					var arr = list[j].ingredients.split(",");
					for (var k = 0; k < arr.length; k++) {
						text += '<li class="list-group-item">' + arr[k];
						text += '</li>'
					}
					text += '</ul></p><p class="card-text">Procedure:</p><p class="card-text card">' + list[j].procedure + '</p></div>';
					if (j == 0)
						$doc('.card').append(text);
					else {
						var previous = "#card" + (j-1)
						console.log(previous);
						$doc(text).insertAfter(previous);
						text = "";
					}
				}
				console.log($doc.html());
				response.send($doc.html());
			}
			counter++;
		});
	});
	//response.sendFile(path.join(__dirname + html + "myrecipes.html"));
});

app.post('/rec', function(request, response) {
	console.log(request.body);
	if (!request.body) return response.sendStatus(400);
	if (Object.keys(request.body).length != 6 || !request.body.calories || !request.body.ingredients || !request.body.name) {
		return response.status(400).send("Invalid POST request\n");
	}

	recipe(request, response);
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
		return response.status(400).send("Invalid POST request");
	}
	console.log("Login request received.");
	console.log(request.body);

	login(request, response);
});

// Called when a POST request is made to /login
app.post('/submit_recipe', function(request, response) {
	if (!request.body) return response.sendStatus(400);

	if (Object.keys(request.body).length != 4 || !request.body.name || !request.body.description || !request.body.ingredients || !request.body.procedure) {
		return response.status(400).send("Please fill out all fields");
	}
	console.log("Submit recipe request");
	submit_recipe(request, response);
});

app.post('/findIngredients', function(request, response){
	if (!request.body) return response.sendStatus(400);

	if (Object.keys(request.body).length != 3 || !request.body.name || !request.body.ingredients || !request.body.image) {
		return response.status(400).send("Invalid request");
	}
	console.log("Find ingredients request");
	find_ingredients(request, response);
});

// Called when a POST request is made to /deleteAccount
app.post('/deleteAccount', function(request, response) {
	if (!request.body) return response.sendStatus(400);

	if (Object.keys(request.body).length != 0) {
		return response.status(400).send("Invalid request");
	}
	deleteAccount(request, response);
});

// Called when a POST request is made to /changePassword
app.post('/changePassword', function(request, response) {
	if (!request.body) return response.sendStatus(400);

	if (Object.keys(request.body).length != 2 || !request.body.old || !request.body.pwd) {
		return response.status(400).send("Invalid request");
	}
	changePassword(request, response);
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
					request.session.email = request.body.email;
	
					get_location(request,request.headers['x-forwarded-for'] || request.connection.remoteAddress || request.socket.remoteAddress);
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

function submit_recipe(request, response) {
	recipes.once("value", snapshot => {
		var counter = 0;
		if (!snapshot.hasChildren()) {
			save_recipe(request, response);
			return;
		}
		snapshot.forEach(function(child) {
			var recipe = child.key;
			if (request.body.name === recipe) {
				return response.status(400).send("Recipe name already exists.");
			}
			if (counter === snapshot.numChildren() - 1) {
				save_recipe(request, response);
			}
			counter++;
		});
	});
}

function recipe(request, response) {
	var description = "None Available";
	var cost = 0.0;
	var price_accuracy = true;
	var $doc = cheerio.load(fs.readFileSync(path.join(__dirname + html + "recipe.html")));
	var text = '<div class="card-body"><h4 class="card-text">Recipe Title: ' + request.body.name + '</h4><img src="' + request.body.image + '" alt="Recipe Image" /><p class="card-text">Descriptioni:</p><p class="card-text card">' + description + '</p><p class="card-text">Ingredients:</p><p class="card-text"><ul class="list-group">';
	for (var j = 0; j < Object.keys(request.body.ingredients).length; j++) {
		text += '<li class="list-group-item">' + request.body.ingredients[j] + '</li>';
		var index = request.body.ingredients[j].indexOf('Cost: ') + 6;
		var money = request.body.ingredients[j].substring(index);
		money = money.replace(/[^0-9.]/g,'');
		var converted = parseFloat(money);
		console.log(converted);
		if (!isNaN(converted)) {
			cost += parseFloat(converted); 
		} else {
			price_accuracy = false;
		}
	}
	cost = Math.round(cost*100)/100;
	var word_format;
	if (!price_accuracy) {
		word_format = "~$" + cost.toString() + " (1 or more items did not have a price)"
	} else 
		word_format = "~$" + cost.toString();
/*
	if (!price_accuracy) {
		cost = "~$" + cost + " (One or more items did not contain a price)";
	} else {
		cost = "~$" + cost;
	}*/
	text += '</ul></p><p class="card-text">Total Cost: ' + word_format + '</p><p class="card-text">Calories: ' + request.body.calories + '</p><p class="card-text">Number of Servings: ' + request.body.servings + '</p><p class="card-text">Procedure:</p><p class="card-text card">' + request.body.url + '</p><p class="card-text">Closest Meijer:</p><p class="card-text card">' + request.session.meijer + '</p></div>';
	$doc('.bg-primary').append(text);
	return response.status(200).send($doc.html());
}

function save_recipe(request, response) {
	recipes.child(request.body.name).set({
		email: request.session.email,
		description: request.body.description,
		ingredients: request.body.ingredients,
		procedure: request.body.procedure
	}, function(error){
		if (error) {
			console.log("Error in storing recipe");
		} else {
			return response.status(200).send("Recipe stored.");
		}
	});
}

function find_ingredients(request, response) {
	//var test_ip = '128.210.106.57';
	test_ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
	console.log(request.body.ingredients);
	console.log(request.body.name);
	console.log(request.body.image);
	var object = {};
	var scraped = false;
	var promises = [];

	function go(i){
		var n = parseIngredient(request.body.ingredients[i]);
		var check_n = n.replace(/ /g, "+");
		var url_meijer = "./data/" + check_n + "-meijer.json";
		var url_sams = "./data/" + check_n + "-sams.json";
		console.log(url_meijer);
		console.log(url_sams);
		if (fs.existsSync(url_meijer) && fs.existsSync(url_sams)) {
			var data = fs.readFileSync(url_meijer);
			var data2 = fs.readFileSync(url_sams);
			var obj = JSON.parse(data);
			var obj2 = JSON.parse(data2);
			object[check_n + "-meijer"] = [];
			object[check_n + "-meijer"].push(obj);
			object[check_n + "-sams"] = [];
			object[check_n + "-sams"].push(obj2);
			console.log("No scrape");
			if (i === request.body.ingredients.length - 1) {
				//console.log(object);
/*
				console.log(Object.keys(object).length);
				for (var l = 0; l < Object.keys(object).length; l++) {
					console.log(Object.keys(object)[l])
					var ob = object[Object.keys(object)[l]];
					for (index in ob[0]) {
						console.log(ob[0][index].image);
						console.log(ob[0][index].name);
						console.log(ob[0][index].cost);
					}
				}*/
				//console.log(test);
				return response.status(200).send(JSON.stringify(object));
			} else {
				go(i+1);
			}
		} else {
			scraped = true;
			scrape(n, test_ip, function(){
				scrape_sams(n, test_ip, function(){
					var data = fs.readFileSync(url_meijer);
					var data2 = fs.readFileSync(url_sams);
					var obj = JSON.parse(data);
					var obj2 = JSON.parse(data2);
					object[check_n + "-meijer"] = [];
					object[check_n + "-meijer"].push(obj);
					object[check_n + "-sams"] = [];
					object[check_n + "-sams"].push(obj2);
					console.log("Scrape");
					if (i === request.body.ingredients.length - 1) {
/*
						console.log(Object.keys(object).length);
							for (var j = 0; j < Object.keys(object).length; j++) {
								console.log(Object.keys(object)[j])
								var ob = object[Object.keys(object)[j]];
								for (index in ob[0]) {

									console.log(ob[0][index].image);
					accounts.child()
									console.log(ob[0][index].name);
									console.log(ob[0][index].cost);
								}
							}*/
						return response.status(200).send(JSON.stringify(object));
					} else {
						go(i+1);
					}

				});
			});
		}
	}
	go(0);
}

// Helper function that deletes an account
function deleteAccount(request, response) {
	accounts.once("value", snapshot => {
		const users = snapshot.val();
		var counter = 0;
		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.val().email;
			if (key === request.session.email) {
					accounts.child(childSnapshot.key).remove();
					return response.status(200).sendFile(path.join(__dirname + html + "login.html"));
			}
			if (counter === snapshot.numChildren() - 1) {
				return response.status(400).send("Account does not exist.");
				//return response.sendFile(path.join(__dirname + html + "login.html"));
			}
			counter++;
		});
	});

}

// Helper function that changes the password of an account
function changePassword(request, response) {
	accounts.once("value", snapshot => {
		const users = snapshot.val();
		var counter = 0;
		snapshot.forEach(function(childSnapshot){
			var key = childSnapshot.val().email;
			if (key === request.session.email) {
				if (request.body.old === childSnapshot.val().password) {
					accounts.child(childSnapshot.key).update({password: request.body.pwd});
					return response.status(200).send("Changed");
				}
				return response.status(400).send("Incorrect account information.")
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

// Helper function that changes the email of an account
function changeEmail(u, p, e, n, response) {
}

// Helper function for forgotten password
function forgotPassword(u, e, response) {
}

//parses ingredients to use for price scraping
function parseIngredient(i) {
	/*
	 * Notes for parsing:
	 * If there is a comma or parenthesis, ignore what is after it
	 * Ignore everything before and includeing first word that is not 0-9 or '.' or '/'
	 * trim at end to remove whitespace
	 * If there is an "or", remove word before, after, and including
	 * Ignore up to and including words:
	 *		-chopped
	 *		-shredded
	 *		-sliced
	 *		-diced
	 *		-of
	 *		-ripe
	 *		-fresh
	 *		-cloves
	 *		-head
	 *		-ground
	 *		-pinch
	 *		-large
	 *		-small
	 *		-medium
	 *		-whole
	 */

    var txt = i.replace(/(([0-9]|[ ]|[/]|[.])+)/,""); //remove nuumbers, space, /, and .
    txt = txt.trim();	//trim whitespce
    txt = txt.substr(txt.indexOf(" ") + 1);	//remove next word after (units of measurement)

	//remove before and after "or"
    txt = txt.replace(/[^ ]+ or [^ ]+/, "");

    //remove words and everything before them
    txt = txt.replace(/[^]*(chopped|shredded|sliced|diced|of|ripe|fresh|cloves|head|ground|pinch|large|small|medium|whole)+/, "");

    //remove everything after and including comma or parenthesis
    txt = txt.replace(/([,]|[(])[^]*/, "");

    return txt.trim();
}

// Scrape meijer for food information
// Their website might use javascript to edit core html after screen has loaded, so prices may vary slightly
function scrape(food, ip, callback) {
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
					callback();
				}
			}
		}, (error) => console.log(error) );
}

function scrape_sams(food, ip, callback) {
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
					callback();
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
		//fs.writeFile(file_name, JSON.stringify(list), (err) => console.log("Successfully wrote to file."));
		fs.writeFileSync(file_name, JSON.stringify(list), (err) => console.log("Successfully wrote to file."));
		return list;
}

function parse_sams($, file_name) {
	var product_cost;
	var product_name;
	var product_image;
	var list = [];

	var item = $('.products-card').each(function(i, elem){
		product_cost = $(this).find('.sc-dollars-v2').text() + "." + $(this).find('.sc-cents-v2').text();
		//	product_cost = $(this).find('.Price-currency').text() + $(this).find('.Price-characteristic').text() + $(this).find('.Price-mark').text() + $(this).find('.Price-mantissa').text();
		product_name = $(this).find('.img-text').text();
		product_image = $(this).find('.cardProdImg').attr('src');
		if (product_image === undefined) {
			product_image = $(this).find('.sc-product-card-image').attr('src');
		}
		list[i] = {
			name: product_name,
			cost: product_cost,
			image: product_image
		}
	});
	//fs.writeFile(file_name, JSON.stringify(list), (err) => console.log("Successfully wrote to file."));
	fs.writeFileSync(file_name, JSON.stringify(list), (err) => console.log("Successfully wrote to file."));
	return list;
}

// Obtains the address of the store that meijers believes you are closest to via ip address
// Will most likely have issues when the server is running from a location different than the user
function get_location(request, ip) {
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
			//console.log(address);
			//console.log(city);
			//console.log(state);
			//console.log(post_code);
			//console.log(phone);
			request.session.meijer = address + "\n" + city + ", " + state + " " + post_code + "\n" + phone;
			request.session.save();
		}
	}, (error) => console.log(error));
}

function get_location_sams(ip) {
	axios({
		method: 'get',
		url: sams_location
		//headers: {'X-Forwarded-For': ip}
	})
	.then((response) => {
		if (response.status === 200) {
			const html = response.data;
			const $ = cheerio.load(html);	
			//console.log(address);
			//var address = $('#street_address').text();
			//console.log(address);
			//var city = $('#city').text();
			//console.log(city);
			//var phone = $('#phone').text();
			//console.log(phone);
			//console.log(address + city + phone);


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
	//get_location_sams(ip);
	//get_location(ip);
});

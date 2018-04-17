var casper = require('casper').create({
	viewportSize: {
		width:1280,
		height:10000
	},
	pageSettings: {
		loadImages: true,
		loadPlugs: true,
		userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.97 Safari/537.11"
	},
	logLevel: "info",
	verbose: true
});
var mouse = require('mouse').create(casper);
var x = require('casper').selectXPath;
var fs = require('fs');		// phantomjs module, not nodejs module

casper.options.waitTimeout = 10000;
/*
casper.on("remote.message", function(msg) {
    this.echo("Console: " + msg);
});

casper.on("page.error", function(msg, trace) {
    this.echo("Error: " + msg);
});

casper.on("resource.error", function(msg, trace) {
    this.echo("Res.Error: " + msg);
});
*/
const zip_code = 47906;
const city = "Lafayette";
const state = "Ohio";

var grocery_item = "apple";

if (casper.cli.has(0)) {
	grocery_item = casper.cli.get(0);
}

var meijer = "https://www.meijer.com/catalog/search_command.cmd?keyword=";

casper.start('https://www.meijer.com/');

casper.then(function() {
	this.echo('First Page: ' + this.getTitle());
	this.waitForSelector("#nav_store", function(){
		this.mouse.move(x('//*[@id="js-mj_ds_dropdown-heading-19"]'));
	});
});

casper.then(function(){
	this.waitForSelector(x('//*[@id="nav_store_button"]/ul/li[2]/a'), function(){
		console.log("Loaded");
		this.capture("initial.png");
	});
});


casper.then(function(){
	this.thenClick(x('//*[@id="mj_ds_store_drop_change"]')).then(function(){
		console.log("OK 2");
		this.waitFor(function(){
			return this.exists(x('//*[@id="storeLocatorLayerMainContainer"]'));
		}, function then(){
			console.log("Got here!");
		});
	});
});

casper.then(function() {
	// zip code can be replaced with city or state
	this.sendKeys(x('//*[@id="locate-search-wrapper"]/div[1]/div/div/div/div/div[1]/input'), state).then(function(){
		this.evaluate(function(){
			$('#range_miles > option:nth-child(1)').remove();
			$('#range_miles > option:nth-child(1)').remove();
		});
		//this.capture("50-miles.png");
	});
});

casper.then(function(){
	this.thenClick(x('//*[@id="locate-search-wrapper"]/div[1]/div/div/div/div/div[2]/button')).then(function(){
		this.waitFor(function(){
			return this.exists(x('//*[@id="save-store"]'));
		}, function then(){
			console.log("Finished finding store!");
			this.capture('found_stores.png');
		});
	});
});

casper.then(function(){
	this.thenClick(x('//*[@id="save-store"]')).then(function(){
		this.waitFor(function(){
			return !this.exists(x('//*[@id="storeLocatorLayerMainContainer"]'));
		}, function then(){
			this.waitFor(function(){
				return this.evaluate(function(){
					if ($('#js-mj_ds_dropdown-heading-19 > span.mj_ds_dropdown-sub').text().length > 0) {
						return true;
					}
					return false;
				});
			}, function then(){
				this.capture("final.png");
				console.log("Got here!");
			});
		});
	})
});

casper.thenOpen(meijer + grocery_item, function() {
	this.waitFor(function(){
		return this.exists(x('//*[@id="thumbFlexWrapper"]'));
	}, function then(){
		fs.write('scraped.html', this.getHTML(x('//*[@id="thumbFlexWrapper"]')), 'w');
		this.capture("search.png");
	});

});

casper.run();

var express = require('express');
var body_parser = require('body-parser');
var admin = require('firebase-admin');
var path = require('path');
var serviceAccount = require('./keys/chowtime-cs252-firebase-adminsdk-ug28y-6799120ca9.json');

//var db = admin.database();
var app = express();
app.use(body_parser.json());

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

const port = 3000;

// Serve 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Initializing Firebase SDK
//admin.initializeApp({
//	credential: firebase.credential.cert(serviceAccount),
//	databaseURL: 'https://chowtime-cs252.firebaseio.com'
//});

app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname + html + "login.html"));
});


// Called when a POST request is made to /registerAccount
app.post('/registerAccount', function(request, response) {

});

// Called when a POST request is made to /login
app.post('/login', function(request, response) {

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

app.listen(port, (err) => {
  if (err) {
    return console.log('Listen error!', err);
  }
  console.log(`Server listening on port ${port}`);
});

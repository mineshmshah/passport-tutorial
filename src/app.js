const express = require('express');
const path = require('path');
const getUserData = require('./model/getUserData');
const postFBData = require('./model/postUserData');


// const favicon = require('serve-favicon');

// Import cookie-sessions to handle cookie and body parser to deal with request object


// Import Passport and strategy

// Import Routes


// Start new passport strategy with key api variables, callback URL and a verify callback
// profile field are optional

// Start Express and body parser
const app = express();

// Set cookie with a secret


//app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, '..', 'public')));
module.exports = app;

const express = require('express');
const path = require('path');
//const cookieSession = require('cookie-session');

const bodyParser = require('body-parser');

//const favicon = require('serve-favicon');


const app = express();


//app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, '..', 'public')));
module.exports = app;

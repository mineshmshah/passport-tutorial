const express = require('express');
const path = require('path');
const getUserData = require('./model/getUserData');
const postFBData = require('./model/postUserData');
const env = require('env2')('./config.env');

// const favicon = require('serve-favicon');

// Import cookie-sessions to handle cookie and body parser to deal with request object
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');

// Import Passport and strategy
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
// Import Routes
const routes = require('./routes/authRoutes');

// Start new passport strategy with key fb api variables, callback URL and a verify callback
// profile field are optional
passport.use(new Strategy({

  clientID: process.env.FB_CLIENTID,
  clientSecret: process.env.FB_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['email','displayName','profileUrl','picture.type(large)']
},(accessToken,refreshToken,profile,done)=>{
  // Check data with postgreSQL
  getUserData.fb_id(profile._json.id,(err,userObj)=>{
    // This is an error coming from pg
    if(err) {
      console.log('Database error',err);
    }
    // The search as successful but an empty string was returned so add profile
    if(!userObj){
      postFBData.users(profile._json.id, profile._json.name, profile._json.email, profile._json.picture.data.url, 'true' , profile._json.link,(err,userObj)=>{
        if (err){
          console.log(err);
          return done(err);
        }else{
          done(null,userObj);
        }
      });
    } else{

      //we have found a matching record so user exists in the DB
      done(null,userObj);

    }
  });

}));

// Serialize user - add identifying info to the cookie
// user is the user object from the db
passport.serializeUser((user, done)=> {
  done(null, user.id);
});

// Get info from cookie to give user details to handle when logged in
passport.deserializeUser((id, done) => {
  getUserData.id(id,(err,userObj)=>{
    if (err){throw err;}
    done(null,userObj);
  });
});

const app = express();
app.use(bodyParser.json());
// Set cookie with a secret
app.use(
  cookieSession({
    maxAge:30 * 24 * 60 * 60* 1000,
    keys: [process.env.COOKIEKEY]
  })
);
// Initialise passport and add routess
app.use(passport.initialize());
app.use(passport.session());
app.use('/',routes)

// This is another quicker way to import the routes in
// require('./routes/authRoutes')(app);


//app.use(favicon(path.join(__dirname, '..', 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, '..', 'public')));
module.exports = app;

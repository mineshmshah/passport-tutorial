# Passport instructions
## Set up Server
1.	Start node js
2.	Install scripts:
a.	Nodemon
b.	Body-parser
c.	Express
3.	Start up basic server
4.	Make src folder with index and app and start basic server
## Set up database
5.	Create database elements
6.	Create config.env file and install env2 and pg-promise. Add the database URL for postgreSQL into the env file.
6.	Create the following schema for the database:
```sql
BEGIN;

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    fb_id BIGINT UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(300) ,
    avatar VARCHAR(8000) NOT NULL,
    newUser BOOLEAN DEFAULT 'false' NOT NULL,
    profile_url VARCHAR(8000) NOT NULL
);

-- Test cases
INSERT INTO users (fb_id,name,email,avatar,newUser,profile_url) VALUES
  (12,'Aisha','aisha@fac.com','pig.png', 'true','facebook.com') ,
  (13,'Yahia','yahia@fac.com','cow.png', 'true', 'facebook.com');

COMMIT;

```

8. Create Database methods to get fb data. The get method needs to have two get methods: to get the fb ID and the database ID - explained later
```js
const connect = require('../../db/db_connections');

const getUser = {};

getUser.fb_id = (fb_id, callback) => {
	const sqlQuery = `
    SELECT *
      FROM users
      WHERE fb_id = '${fb_id}'
  `;

	connect.query(sqlQuery, (err, response) => {
		if (err) {
			return callback(new Error('Database error while fetching user'));
		}

		callback(null, response.rows[0]);
	});
};

getUser.id = (id, callback) => {
	const sqlQuery = `
    SELECT *
      FROM users
      WHERE id = '${id}'
  `;

	connect.query(sqlQuery, (err, response) => {
		if (err) {
			return callback(new Error('Database error while fetching user'));
		}

		callback(null, response.rows[0]);
	});
};
module.exports = getUser;

```

9. Create post method to get all the facebook data back
```js
const connect = require('../../db/db_connections');

const getUser = {};

getUser.fb_id = (fb_id, callback) => {
	const sqlQuery = `
    SELECT *
      FROM users
      WHERE fb_id = '${fb_id}'
  `;

	connect.query(sqlQuery, (err, response) => {
		if (err) {
			return callback(new Error('Database error while fetching user'));
		}

		callback(null, response.rows[0]);
	});
};

getUser.id = (id, callback) => {
	const sqlQuery = `
    SELECT *
      FROM users
      WHERE id = '${id}'
  `;

	connect.query(sqlQuery, (err, response) => {
		if (err) {
			return callback(new Error('Database error while fetching user'));
		}

		callback(null, response.rows[0]);
	});
};
module.exports = getUser;

```
10. Create database URL

## Set up passport and the strategy
For passport to run we are going to need to import two different node packages. Firstly we need to get the npm package 'passport' to run all the passport methods and middleware. We also need the passport strategy.

A passport strategy allows us to implement some form authentification flow. This can be through OAuth like we will use or though a local database, called a 'passport-local' strategy. we are going to use the facebook OAuth flow.

11. Import 'passport' and 'passport-facebook' npm modules. Passport-facebook is the strategy.
12. Import 'cookie-session' npm module. This will deal with cookie handling later as passport doesnt handle cookies outside of the box.
13.  Require in passport and the strategy in app.js as the following code shows. Node that the variation in how to write the require statement for the strategy to pull out the strategy only.
```js
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
```
## Get Facebook OAuth login details

14. from Facebook.com sign up an app to get a facebook client ID and a secret.
15. Add these to the config.env file.
16. Require in the config file into app.js.

## Launch Passport strategy

14. We are now ready to fire up the passport middleware and use it.
```js
passport.use()
```
15. We pass a new Strategy to the pasport middleware which takes two arguments:
- An object with the facebook specific keys foryour request
- A callback that passport uses to deliver the requested information.
```js
passport.use(new Strategy())
```
16. The first parameter in htes strategy is an object with the settings for the request:
- clientID: The facebook client ID
- clientSecret: The facebook secret ID
- callbackURL: A callback URL facebook will send back when the request is made.
- profileFields (optional): The particual fields of interest that you would like extracted
17. The second argument is a callback which has the following arguments supplied by facebook:
- accessToken
- refreshToken
- profile - this is the profile information
- done - this will be the callback to alert passport to move to the the next area of the code.

```js
passport.use(new Strategy({

  clientID: process.env.FB_CLIENTID,
  clientSecret: process.env.FB_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['email','displayName','profileUrl','picture.type(large)']
},(accessToken,refreshToken,profile,done)=>{
}));
```
## Check for existing users

In the callback we created previously we can add code to check if the user exists or not in the database. Using the format that the model is set in the database we need to make a few checks:
- We need to check firstly there is not error with the database and that it is running so we can handle it
- We need to check if there is an entry in the database. If an empty string is returned without a user object string then we need to add the user to the database.
- If there is a user move forward to the next step

Notice how we use done to progress through stages of the middleware. The code should now look as follows:
``` js
passport.use(new Strategy({

  clientID: process.env.FB_CLIENTID,
  clientSecret: process.env.FB_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['email','displayName','profileUrl','picture.type(large)']
},(accessToken,refreshToken,profile,done)=>{

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
```

## Create auth routes
We are now at a place that we should create the routes that passport requires. We shall have four routes:
18. In a new directory routes, create an authRoutes.js.
19. Require in passport to this file

```js
const passport = require('passport');
```
20. Export all the routes with module.exports
```js
module.exports = app =>{

};
```
21. Add all routes to the function app that is being epxorted
22. The first route should be the route that a user from the client will click on from the front end. This is a message from the front end to our server to startthe OAuth flow.
``` js

app.get('/auth/facebook',
        passport.authenticate('facebook',
            {  scope: ['email']}));
```
The callback for the get method is where passport is used to authenticated the user. The authenticate method on passport sends a message to fcebook where the user must verify that they wish to approve the app. the type of authentication, in this case facebook must be passed as string as the first parameter.  The additonal object is what objects you are requesting that is not part of the default response given by facebook.

23. The callback function was specified in when the passport settings were set in app.js. When Facebook authenticated the user it is the URL the response is sent back to the server. A code will be added by facebook with the user.
``` js
app.get('/auth/facebook/callback',
		passport.authenticate('facebook'),
		(req,res)=>{
				res.redirect('/home')
		}
	);
```
A request is sent back to facebook with the code to request the user information Facebook will see the code in the url and replies with the user details.

24. We will create a route to check authentication:
``` js
app.get('/api/current_user',(req,res)=>{
    res.send(req.user);

  });
```

25. Create a routes to logout. Logout is a special methid that exists in the request function now.
``` js
app.get('/api/logout',(req,res)=>{
    //removes the cookie
    req.logout();
    res.redirect('/');
  });
};

```
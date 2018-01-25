# PassportJS Workshop 

Passport is authentication middleware for Node.js. It is extremely flexible and modular and can be unobtrusively integrated into any Express-based web application. Passport uses 'strategies' to handle different types of authentication.  We will be using the Facebook authentication here.

## Initial Setup

The starting file that is provided with this repo has a few things set up for you ready to go. The modelling is done in postgreSQL. Before going forward there are a few items to point out:
* Please make sure you have a database set up so you can use it here, prior to starting this workshop.
* The config.env file is not included. This is where that private Facebook info will be stored. The steps to add the relevant pieces of information will be outlined in the workshop.
* The database model methods will be explained below.
* A basic server has been set up for you.

1. Clone this repo 
```git
git clone https://github.com/mineshmshah/passport-tutorial.git
```
2. Run npm install.


## Set up config file and start up server up
1. The npm install would have added env2.  We need to require this into into app.js.
```js
const env = require('env2')('./config.env');
```
2. Create a config.env file in the root directory.
3.	To test the server with nodemon, use **npm run devStart**
4.  Navigate to your text editor. In the /src folder you will see an index.js which will start the basic server,  and app.js which holds the relevant files needed for express and the passport middleware.

## Build the database

1. Pg-Promise has been installed for you for the postgreSQL database. We need  to add the database URL in the following format, adding your database's details:
```js
DATABASE_URL = postgres://[username]:[password]@localhost:5432/[database]
```
2. Build the database with:
```js
node db/db_build.js
```
3. The database will have test cases added to check if it is working in the SQL file.
4. The database that has been made has three methods. Two get methods and a post method. The reasoning behind it is explained later in terms of passport below. The get methods are used to retrieve the facebook id and the id of the entry in the database. The post method will be used to post the data recieved from facebook to our database. We should now be ready to start adding the passport elements.

## Passport overview

![passportimage](/diagrams/Passport_Flow.png)

The diagram above shows the flow that passport goes through from the client to the server and includes the steps done by Facebook. Facebook is only reponsible for authorising the OAuth flow. The rest of the authentication and cookie handling will be done by passport.

## Set up passport and the strategy
For passport to run we are going to need to import two different node packages. Firstly we need to get the npm package 'passport' to run all the passport methods and middleware. We also need the passport strategy.

A **passport strategy** allows us to implement a form of authentication flow. This can be through OAuth like we will use or though a local database, called a 'passport-local' strategy. We are going to use the facebook OAuth flow.

1. Install **'passport'** and **'passport-facebook'** npm modules. Passport-facebook is the strategy we will use.
1. Install **'body-parser'** npm package. This will parse the body of the request data. This is necessary for passport to get the correct information out of the request.
1. Install  **'cookie-session'** npm module. This will deal with cookie handling later as passport doesnt handle cookies out of the box.
1. Require in cookie-session and body parse:
```
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
```
1. Require in passport and the strategy in app.js as the following code shows.
```js
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
```
(Note that the variation in how to write the require statement for the strategy to pull out the strategy only.)
## Get Facebook OAuth login details

1. Sign up to developer.facebook.com.
2. Once registered in My Apps click on add new app.
3. Add a suitable name and description for your app.
4. Navigate to the dashboard. From here copy the app ID and app secrete and store it in yor config.env file.
```js
FB_CLIENTID = [your facebook app id]
FB_SECRET = [your facebook app secret]
```
2. Require in the env file into app.js with the other imports:
```js
const env = require('env2')('./config.env');
```

## Launch Passport strategy

1. We are now ready to fire up the passport middleware and use it. Add the following code to use passport in app.js under your imports. It MUST be BEFORE the code where express starts (const app).
```js
passport.use()
```
2. We next create a new strategy within this code to start the passport-facebook strategy
```js
passport.use(new Strategy())
```
We pass a new Strategy to the passport middleware which takes two arguments:
- An **object** with the facebook specific keys for your request
- A **verify callback** that passport uses to deliver the requested information to the database.

3. The first parameter in the strategy is an object with the settings for the request:
- **clientID**: The facebook client ID
- **clientSecret**: The facebook secret ID
- **callbackURL**: A callback URL facebook will send back when the request is made.
- **profileFields** *(optional)*: The particular fields of interest that you would like extracted
4. The second argument is a callback which has the following arguments supplied by facebook:
- **accessToken**
- **refreshToken**
- **profile** - this is the profile information sent from Facebook
- **done** - this will be the callback to alert passport to move to the the next area of the code.

The code is as follows. We will add the database method after:
```js
passport.use(new Strategy({

  clientID: process.env.FB_CLIENTID,
  clientSecret: process.env.FB_SECRET,
  callbackURL: '/auth/facebook/callback',
  profileFields: ['email','displayName','profileUrl','picture.type(large)']
},(accessToken,refreshToken,profile,done)=>{
}));
```
## Check for Existing Users

In the callback we created previously we can add code to check if the user exists or not in the database. Using the format that the model is set in the database we need to make a few checks:
- We need to check firstly there is no error with the database and that it is running so we can handle it
- We need to check if there is an entry in the database. This will use the **getUser.fb_id** database method to check for a unique match of the facebook ID.  This is the unique info supplied by facebook for any user account. If an empty string is returned without a user object string then we need to add the user to the database. This will use the **post.users** method found in the database to add the details.
- If there is a user that exists, move forward with the code using **done** to the next step

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
      return done(err)
    }
    // The search as successful but an empty string was returned so add profile
    if(!userObj){
      postFBData.users(profile._json.id, profile._json.name, profile._json.email, profile._json.picture.data.url, 'true' , profile._json.link,(err,userObj)=>{
        if (err){
          console.log(err);
          done(err)
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

## Create Auth Routes
We are now at a place where we should create the routes that passport requires. We shall have four routes that are outlined below.
1. Navigate to the **src/routes/** and create an **authRoutes.js** file file and add the following code to app.js:
```js
const routes = require('./routes/authRoutes');
```

2. Require in **passport** and **express Router** to this authRoutes.js

```js
const passport = require('passport');
const routes = require('express').Router()

```
3. Export all the routes with module.exports at the bottom of the file.
```js
module.exports = routes;
```

4. Now add the routes after the imports in the file. The first route should be the route that a user from the client will click on in the front end. This is a message from the front end to our server to **start the OAuth flow**.
``` js

app.get('/auth/facebook',
        passport.authenticate('facebook',
            {  scope: ['email']}));
```
The callback for the get method is where **passport is used to authenticated the user**. The authenticate method on passport sends a message to facebook where the user must verify that they wish to approve the app. The passport callback here has two parameters:
* The **strategy** and the type of authentication - in this case facebook.
*  **Additional data** is an object you are requesting back from facebook that is not part of the default response given by facebook. (More info on the facebook API).

5. A callback function was specified in  the Facebook strategy in app.js. When Facebook has authenticated the user, **Facebook will redirect back to server** with this URL and add a unique code at the end of it back to the server to indicate the person has been authenticated. The route for this is as follows:
``` js
app.get('/auth/facebook/callback',
		passport.authenticate('facebook'),
		(req,res)=>{
				res.redirect('/home')
		}
	);
```
A request is sent back to facebook with the code automatically by passport to request the user information. Facebook will now see the code in the url, and replies again with the user details and is sent back to our server.

6. We will create a route to **check authentication**:
``` js
app.get('/api/current_user',(req,res)=>{
    res.send(req.user);

  });
```

7. Create a routes to **logout**. Logout is a special method that exists in the request function now thanks to PassportJS.
``` js
app.get('/api/logout',(req,res)=>{
    //removes the cookie
    req.logout();
    res.redirect('/');
  });
};

```

## How passport works

When a user clicks logon from the client side the the user is redirected to the route  ```auth/facebook``` , which has a passport function as a callback (see route above) to forward the user's request to the  Facebook site.

Facebook will then **ask the user if they grant permission**, and further action is done by the user to accept the request.

Once this is done **facebook returns the information with the callback URL** that was declared in the passport.use statement that contains an additonal parameter with a code at the end of the URL. This **unique code** is supplied by Facebook that indicates the user has granted permission.

The user is briefly then put on hold as the code is taken from the URL. Passport then sends a **follow up request to Facebook**, where Facebook will see the request code in the URL now and will reply with **user details**. The user will not be kicked into the OAuth flow again, as it has this code when it goes back to Facebook. The job by facebook is now done.

The second argument we passed to the Facebook strategy was the **verify callback**. When we are out of the OAuth flow and the credentials have been verified we add/check this user with our database. The **done** function is called with the user object model **(userObj)** and is sent to the next section of the passport flow.

See the diagram of the flow above to get a picture of what is handled by Passport.

## Cookie based authentication

**HTTP is stateless**. As a result when we move from one page to another in a browser it will not remember the state of the application. So how does passport help the browser remember we are now logged in?

#### We use cookie based authentication.

The done function that was send by the **verify callback** method with a user object passed from our database is passed to another function called **serializeUser** that is used by PassportJS. This creates an **identifying piece of information** from this object and Passport stuffs it into a **cookie** for us. (Note Facebook OAuth was only used to sign a user in, we are now just using our internal identification methods.)

1. Add the following code under the strategy in the app.js file:

```js
passport.serializeUser((user, done)=> {
	done(null, user.id);
});
```

A follow up request is made and the cookie is automatically set and is passed in the header request to the browser. The browser will strip this token and add it to the browser memory and will append the cookie for follow up requests.


2. Passport will later be passed that identifying information out of the cookie when a request by the user is made, and it will use the final ***get.id*** database model function using a passport function called **deserializeUser** function from our database.  Add this code under the serialize method in the app.js file:



``` js

passport.deserializeUser((id, done) => {
	getUserData.id(id,(err,userObj)=>{
		if (err){throw err;}
		done(null,userObj);
	});
});
```

## Add Express and deal with cookies

We now need to handle cookies.

1. Under the passport strategy ensure we have the  the **express app** starting off. This would have been supplied in the code:
```js
const app = express()
```
The position of this below the passport methods is crucial.

2. We must have **body parser** started up now to be able to deal with the cookie and requests effectively.
```js
app.use(bodyParser.json());
```
3.  We will now make use of the **cookie-sessions** module by adding the following code:
```js
app.use(
  cookieSession({
    maxAge:30 * 24 * 60 * 60* 1000,
    keys: [process.env.COOKIEKEY]
  })
);
```
The cookie needs two pieces of info:
* We add a **max age** here which indicates a max life of the cookie.
* We also supply a **secret key** so our cookie has a secret. Add a string to the config.env file to COOKIEKEY to act as the secret.
```js
COOKIEKEY = '[Add a secret string]'
```

Cookie sessions will now deal with the cookie and what passport will add the relevant information through the OAuth flow.

## Start Passport
 We are almost ready to start passport up!
1. Add the following lines after where the cookie-sessions function is used in app.js (but before the static files are served) to initialise passport.
```js
app.use(passport.initialize());
app.use(passport.session());
```
2. Add the code below to use the routes we have added under the passport initialisation code in app.js.

```js
app.use('/',routes)
```

3. In your terminal make sure npm run devStart is running.
4. Navigate to http://localhost:5000/ and test out your new passportJS facebook app!


## Now Your turn

The methods for other strategies are very similar.  the main difference is the way the strategy is written out and how to log in to the sites and get the relevant app Ids and secret.

Try out the same process for a **Google OAuth flow.**



I hope you find this tutorial helpful and informative. If you spot any issues or have questions please let me know :D!

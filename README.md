# OAuth and PassportJS Workshop

## Contents
1. [Learning Outcomes](#learning-outcomes)
2. [Introduction](#introduction)
3. [What is OAuth](#what-is-oauth-and-how-does-it-work)
4. [What is Passport.js](#so-what-is-passportjs-and-why-is-it-helpful-)
5. [How does Passport work?](#how-does-passport-work)
6. [Workshop](#passport-workshop-using-postgresql)

## Learning Outcomes
* To understand the principles of OAuth and how it works
* To implement OAuth using PassportJS middleware
* To use more advanced middleware
* To gain authorisation to get information from a resource server and 
* To save user data to a database as part of OAuth flow

## Introduction
You may have come across many applications that ask you to do use a 'social login' e.g. such as 'Sign in with Facebook'. There is a common misconception where people think you are are giving an application like this your social login details.

#### This is not the case!!!


The process involved is called OAuth and is a lot more complicated and safer than having your passwords distributed. This workshop goes over the high level processes and ideas involved for this to work, and will allow you to implement your very own social logins using PassportJS.



## What is OAuth and how does it work?

### So what really is OAuth?
OAuth is an open standard for access delegation, commonly used as a way for Internet users to grant websites or applications access to their information on other websites but without giving them the passwords.

So it is a process to allow applications, or an **OAuth Client** to gain access to information from and **OAuth Provider** such as Facebook, Twitter, Github etc

Before we go jumping into the process it may be wise to get some terminology out of the way...

### Authentication and Authorisation

Two terms that come up a lot in this process are authentication and authorisation so let's start of my defining and differentiating the two:

* **Authentication** is the process of verifying who you are. When you log on to a PC with a user name and password you are authenticating.
* **Authorization** is the process of verifying that you have access to something. Gaining access to a resource (e.g. directory on a hard disk) because the permissions configured on it allow you access is authorization.

So in a more simple way:

* Authentication is about who somebody is.
* Authorisation is about what they're allowed to do.

OAuth actually is an authorisation client but frameworks that use it often deal with the Authentication process usually with Open ID Connect which deals with the authentication by passing ID tokens.

### How does OAuth work?
![passportimage](/diagrams/OAuth.png)

There are 4 main players involved with the OAuth process.

* The **user** (A person)
* The **OAuth Client** - some application using OAuth e.g. Spotify
* The **OAuth Provider** (Authentication Server) - This is the server that will deal with getting you access to the information you want. e.g. Facebook
* The **OAuth Provider** (Resource Server) - This is where your data is stored that will send back the information that is requested.

1. Before anything can happen the OAuth client must sign up to the provider and get credentials to verify the OAuth client. They will get a **client ID** and a **client secret**.

    So a company like Spotify may go to Facebook, and sign up to their developer site to get this information at a page like this:

    ![facebook dev site](https://www.scirra.com/images/articles/capture_18.png)

    2. A user will then navigate to the site and request to login via some social login.
    3. The OAuth client sends a request to the OAuth provider's authorisation server. A get request with the **Client ID**, **Client secret** and **Redirect URL** is sent. The redirect URL lets the provider know where to send the response back.
    4.  The provide will then ask the user to login with their details and authorise the various permissions being requested. A page like this will be shown:
    ![Authorise page](https://heimdalsecurity.com/blog/wp-content/uploads/log-in-with-facebook-permissions.png)

    5.  The provider deals with the authentication process to verify the user. This is not actually done by OAuth but under the hood uses tools such as Open ID connect to deal with this.
    6.  The provider then redirects to the OAuth client using redirect URL. A one time token for authorisation will be sent back.
    7.  The OAuth Client receives the newly created authorisation token. Now that the user is authenticated the OAuth client must get authetnicated too. It sends the same request that it made before to the OAuth provider, but this time attatching the authorisation token. This stage happens in the background and the user wont see this.
    8.  If all the details are valid then the OAuth provider will now send an access token. This is the token that will now allow access to the information requested and given permission by the user.
    9.  The OAuth client then sends a request to the resource server with the access token and will get the requested information.( Note: There is usually a time restriction for how long this token is valid for)
    10.  The user will now be logged in / application(OAuth client) would have the information requested.

So **NO PASSWORDS were exchanged** in the process. It is a long process but the OAuth framework effectively deals with this.

## So what is PassportJS and why is it helpful ?

So why are we using PassportJS? Because it deals with the entire OAuth process for you. It is trickt to set up, but it allows us to easily add multiple sign in methods / OAuth processes quickly once set up, and it deals with alot of what happens in the background for you in a very similar process for all types of providers. Just pass in the relevant Ids and secrets, tell it what you want out and you're good to go.

### What is Passport?

Passport is authentication middleware for Node.js. It is extremely flexible and modular and can be unobtrusively integrated into any Express-based web application. Passport uses 'strategies' to handle different types of authentication.  We will be using the Facebook authentication here.

It also effectively deals with cookie session management for you so keeps track of sessions effectivly.

## How Does Passport work?

![passportimage](/diagrams/Passport_Flow.png)

The diagram above shows the flow that passport goes through from the client to the server and includes the steps done by Facebook. Facebook is only reponsible for authorising the OAuth flow. The rest of the authentication and cookie handling will be done by passport.


1. When a user clicks logon from the client side, the the user is redirected to the route auth/facebook , which has a passport function as a callback (see route above) to forward the user’s request to the Facebook site.

2. Facebook will then ask the user if they grant permission, and further action is done by the user to accept the request.

3. Once this is done facebook returns the information with the callback(redirect) URL that will be declared in a passport.use statement. Itcontains an additonal parameter - an authorisation code at the end of the URL. This unique code is supplied by Facebook that indicates the user has been granted permission.

4. The user is briefly then put on hold as the code is taken from the URL. Passport then sends a follow up request to Facebook now with the authorisation token.  Facebook will see the request code in the URL now and will reply with user details requested from their resource servers. The user will not be kicked into the OAuth flow again, as it now has this authorisation code when it goes back to Facebook. The job by Facebook  is now done.

5. A second argument will be passed to the Facebook strategy called the verify callback. When we are out of the OAuth flow and the credentials have been verified we add/check this user with our database. A calback  'done' function is called with the user object model (userObj in our case) and is sent to the next section of the passport flow. This will deal with the cookie session aspect introduced in a bit.

See the diagram of the flow above to get a picture of what is handled by Passport.

## Passport Workshop (using PostgreSQL)
We have finally made it! A few inital things are needed to be setup:

### Initial Setup

The starting file that is provided with this repo has a few things set up for you ready to go. (Instructuons given below as a reminder). The modelling is done in postgreSQL. Before going forward there are a few items to point out:
* Please make sure you have a database set up so you can use it here.
* The config.env file is not included. This is where that private Facebook info will be stored. The steps to add the relevant pieces of information will be outlined in the workshop.
* The database model methods will be explained below.
* A basic server has been set up for you.

1. Clone this repo
```git
git clone https://github.com/mineshmshah/passport-tutorial.git
```
2. Run ```npm install```.


## Set up config file and start up server up
1. The npm install would have added ```env2```.  We need to now create a ```config.env``` file in the root directory.
3.	To test the server with nodemon, use **npm run devStart**
4.  Navigate to your text editor. In the /src folder you will see an index.js which will start the basic server,  and app.js which holds the relevant files needed for express and the passport middleware.

## Build the database
**Note**: Here are some quick instructions to remind you how to set up a database:

In terminal type psql, or pgcli if installed. Within psql/pcli enter the following commands each followed by a return. Things in square brackets are for your desired values. Note that password is a string inside '' (NOT double quotes ""):
```
CREATE DATABASE [db_name];
CREATE USER [user_name] WITH SUPERUSER PASSWORD ['password'];
ALTER DATABASE [db_name] OWNER TO [user_name];
```

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



## Set up passport and the strategy
For passport to run we are going to need to import two different node packages. Firstly we need to get the npm package 'passport' to run all the passport methods and middleware. We also need the passport strategy.

A **passport strategy** allows us to implement a form of authentication flow. This can be through OAuth like we will use or through a local database, called a 'passport-local' strategy. We are going to use the Facebook OAuth flow.

1. Install **'passport'** and **'passport-facebook'** npm modules. Passport-facebook is the strategy we will use.
1. Install **'body-parser'** npm package. This will parse the body of the request data. This is necessary for passport to get the correct information out of the request.
1. Install  **'cookie-session'** npm module. This will deal with cookie handling later as passport doesnt handle cookies out of the box.
1. Require in cookie-session and body parser:
```js
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
```
5. Require in passport and the strategy in app.js as the following code shows.
```js
const passport = require('passport');
const Strategy = require('passport-facebook').Strategy;
```
(Note that the variation in how to write the require statement for the strategy to pull out the strategy only.)
## Get Facebook OAuth login details

1. Sign up to developer.facebook.com.
2. Once registered in My Apps click on add new app.
3. Add a suitable name and description for your app.
4. Navigate to the dashboard. From here copy the app ID and app secret and store it in yor config.env file.
```js
FB_CLIENTID = [your facebook app id]
FB_SECRET = [your facebook app secret]
```
5. Add your domain to facebook so it knows where to expect the request from. On the dashboard go to `settings` > `+ add platform`> `choose website` > Enter your domain e.g. http://localhost:5000
6. Add your callback url. On the dashboard go to `Facebook login` > `Settings` > Enter your callback url into `Valid OAuth redirect URIs` e.g. `http://localhost:5000/auth/facebook/callback`

## Launch Passport Strategy

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
- **profileFields** *(optional)*: The particular fields of interest that you would like extracted. This is beyondthe default.
4. The second argument is a callback which has the following arguments supplied by Facebook:
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
const router = require('express').Router()

```
3. Export all the routes with module.exports at the bottom of the file.
```js
module.exports = routes;
```

4. Now add the routes after the imports in the file. The first route should be the route that a user from the client will click on in the front end. This is a message from the front end to our server to **start the OAuth flow**.
``` js

router.get('/auth/facebook',
        passport.authenticate('facebook',
            {  scope: ['email']}));
```
The callback for the get method is where **passport is used to authenticated the user**. The authenticate method on passport sends a message to facebook where the user must verify that they wish to approve the app. The passport callback here has two parameters:
* The **strategy** and the type of authentication - in this case facebook.
*  **Additional data** is an object you are requesting back from facebook that is not part of the default response given by facebook. (More info on the facebook API).

5. A callback function was specified in  the Facebook strategy in app.js. When Facebook has authenticated the user, **Facebook will redirect back to server** with this URL and add a unique code at the end of it back to the server to indicate the person has been authenticated. The route for this is as follows:
``` js
router.get('/auth/facebook/callback',
		passport.authenticate('facebook'),
		(req,res)=>{
				res.redirect('/')
		}
	);
```
A request is sent back to facebook with the code automatically by passport to request the user information. Facebook will now see the code in the url, and replies again with the user details and is sent back to our server.

6. We will create a route to **check authentication**:
``` js
router.get('/api/current_user',(req,res)=>{
    res.send(req.user);

  });
```

7. Create a routes to **logout**. Logout is a special method that exists in the request function now thanks to PassportJS.
``` js
router.get('/api/logout',(req,res)=>{
    //removes the cookie
    req.logout();
    res.redirect('/');
  });
};

```

## Cookie based authentication

**HTTP is stateless**. As a result when we move from one page to another in a browser it will not remember the state of the application. So how does passport help the browser remember we are now logged in?

#### We use cookie based authentication.

The done function that was sent by the **verify callback** method with a user object passed from our database is passed to another function called **serializeUser** that is used by PassportJS. This creates an **identifying piece of information** from this object and Passport stuffs it into a **cookie** for us. (Note Facebook OAuth was only used to sign a user in, we are now just using our internal identification methods.)

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

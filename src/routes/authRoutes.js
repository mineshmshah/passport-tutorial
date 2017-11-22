const passport = require('passport');
const routes = require('express').Router()


  routes.get('/auth/facebook', passport.authenticate('facebook',{  scope: ['email']}));

  //add parameter hre to tell if new user from the database
  routes.get('/auth/facebook/callback',
    passport.authenticate('facebook'),
    (req,res)=>{
        res.redirect('/')

    }
  );

  routes.get('/api/current_user',(req,res)=>{
    res.send(req.user);

  });

  routes.get('/api/logout',(req,res)=>{
    //removes the cookie
    req.logout();
    res.redirect('/');
  });

  module.exports = routes;
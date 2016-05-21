'use strict';
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;
const knex = require("../db/knex.js");
const bcrypt = require('bcrypt');

// only allow AJAX calls to prevent tampering in the browser bar
function checkHeaders(req,res,next){
  if(!req.headers["x-requested-with"]) {
    res.json({error: 'Not requested with a proper ajax call'});
  }
  else {
    next();
  }
}

// middleware to check the token in general
function checkTokenForAll(req,res,next){
  try {
    var decoded = jwt.verify(req.headers.authorization.split(" ")[1], process.env.SECRET);
    next();
  }
  catch(err) {
    res.status(500).json(err.message);
  }
}

router.use(checkHeaders);

router.post('/signup', (req, res, next) => {

  //hash password before insertion into the database
  const password_hash = bcrypt.hashSync(req.body.password, 4);

  //validate that email username and password were sent over and that they are the correct datatype
  if (
    req.body.email && req.body.username && req.body.password
    && typeof req.body.email == 'string'
    && typeof req.body.username == 'string'
    && typeof req.body.password == 'string') {

      //validate that the email doesn't already exist in the database
      knex('users')
      .where({email: req.body.email})
      .then((user) => {
        //if it does exist already, respond wth an error
        if (user.length > 0) {
          console.log(user.length, 'user in checking email signup');
          res.status(200).json({error: 'Email already exists in the database'});
        } else {
          //otherwise validate that the username doesn't already exist in the database
          knex('users')
          .where({username: req.body.username})
          .then((user) => {
            //if it does exist already, respond with an error
            if (user.length > 0) {
              console.log(user.length, 'user in checking username signup');
              res.status(200).json({error: 'Username already exists in the database'});
            } else {
              //if both the email and username do not exist in the database, insert user
              knex('users')
              .insert({
                email: req.body.email,
                username: req.body.username,
                password_hash: password_hash
              })
              .returning('*')
              .then((user) => {
                //sign a token before responding back with the user's id and username
                //along with their login jwt token
                var user_obj = {id: user[0].id, username: user[0].username};
                var token = jwt.sign({ id: user[0].id}, process.env.SECRET);
                res.status(200).json({token: token, user: user_obj});
              })
              .catch((err) => {
                //if knex throws an error, console.log it and respond with that error
                console.log('error in signup insertion', err);
                res.status(400).json({error: err});
              });
            }
          })
        }
      })


    }

  });

  router.post('/login', (req, res, next) => {
    if (
      req.body.usernameOrEmail
      && req.body.password
      && typeof req.body.usernameOrEmail == 'string'
      && typeof req.body.password == 'string') {

        knex("users")
        .where({username: req.body.usernameOrEmail})
        .orWhere({email: req.body.usernameOrEmail})
        .first()
        .then((user) => {
          if (user && bcrypt.compareSync(req.body.password, user.password_hash)) {
            var user_obj = {id: user.id, username: user.username};
            var token = jwt.sign({ id: user.id}, process.env.SECRET);
            res.status(200).json({token: token, user: user_obj});
          } else {
            console.log('invalid login');
            res.status(200).json({error: 'Invalid username, email, or password'});
          }
        })
        .catch((err) => {
          console.log('error in login', err);
        })

      } else {
        res.status(200).json({error: 'Please completely fill out the login form'});
      }

    });

    router.post('/thought_spots', (req,res,next) => {
      console.log(req.body);
      if (
        req.body.requestToken
        && req.body.thoughtSpotCreator
        && req.body.thoughtSpotName
        && req.body.thoughtSpotDescription
        && typeof req.body.requestToken == 'string'
        && typeof req.body.thoughtSpotDescription == 'string'
        && typeof req.body.thoughtSpotCreator == 'object'
        && typeof req.body.thoughtSpotName == 'string') {
          knex('thought_spots')
          .where({thought_spot_name: req.body.thoughtSpotName})
          .first()
          .then((thought_spot) => {
            if (!thought_spot) {
              console.log('in the if ! ',req.body.thoughtSpotName);
              try {
                var decoded = jwt.verify(req.body.requestToken, process.env.SECRET);
                console.log('in the try');
                knex('thought_spots')
                .insert({
                  thought_spot_name: req.body.thoughtSpotName,
                  thought_spot_description: req.body.thoughtSpotDescription,
                  creator_id: req.body.thoughtSpotCreator.id
                }).then(() => {
                  res.status(200).json({success: thought_spot});
                })
                .catch((err) => {
                  console.log('err in insert thought spot', err);
                  res.status(200).json({error: err.message});
                })
              }
              catch(err) {
                console.log('err in insert thought spot catch', err);
                res.status(200).json({error: err.message});
              }
            }
          })

        }

      });

      router.get('/thought_spots', (req,res,next) => {
        knex('thought_spots')
        .then((thought_spots) => {
          res.status(200).json(thought_spots);
        })
        .catch((err) => {
          console.log('err in get thought spots', err);
        });
      })

      module.exports = router;

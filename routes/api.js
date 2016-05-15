var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var secret = process.env.SECRET;

// only allow AJAX calls to prevent tampering in the browser bar
function checkHeaders(req,res,next){
  if(!req.headers["x-requested-with"]) {
    res.status(403).json({error: "Not requested with an ajax call"});
  }
  else {
    next();
  }
}

router.use(checkHeaders);

router.post('/signup', function(req, res, next) {
  console.log(req.body);
  res.status(200).json({ signup: req.body });
});

router.post('/login', function(req, res, next) {
  console.log(req.body);
  res.status(200).json({ login: req.body });
});

module.exports = router;

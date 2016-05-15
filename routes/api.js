var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var secret = process.env.SECRET;

/* GET home page. */
router.get('/something', function(req, res, next) {
  res.json({ test: 'TEST!!!' });
});

module.exports = router;

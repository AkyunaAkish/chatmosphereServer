require('dotenv').config();

var environment = process.env.DATABASE_ENV || 'development';
var config = require('../knexfile.js')[environment];
module.exports = require('knex')(config);

var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  const data = {
    title: 'Express',
    message: 'Welcome to Express',
  };
  res.json(data);
});

module.exports = router;

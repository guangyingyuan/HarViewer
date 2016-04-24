var express = require('express');
var router = express.Router();
var path = require('path');

router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname+'/../views/index.html'));
});

router.use(express.static('views'));
router.use(express.static('app'));
router.use('/bower_components', express.static('bower_components'));

module.exports = router;

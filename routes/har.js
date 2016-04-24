var express = require('express');
var router = express.Router();
var path = require('path');
var multer  = require('multer');
var upload = multer({dest: '../uploads/'});
var fs = require('fs');

router.post('/', upload.single('file'), function(req, res) {

	fs.readFile(req.file.path, 'utf8', function(err, data) {
		if (err) throw err;

		var har = JSON.parse(data);

		var response = {
			har: har,
			categories: categorizeRequests(har.log.entries),
			transferred: formatSizeUnits(sumSizes(har.log.entries))
		};

		res.send(response);

	});

});

/**
 * Sums the number of each type of file requested from a list of HAR entries
 * @param  {Array} entries array of entries from the http archive
 * @return {Object} categories of requests, a sorted array of the number of occurences of each response type
 */
function categorizeRequests(entries) {

	var categories = {};

	entries.forEach(function (entry) {

		if (!categories[entry.response.content.mimeType]) {
			categories[entry.response.content.mimeType] = 1;
		} else {
			categories[entry.response.content.mimeType]++;
		}

	});

	var result = [];

	for (var type in categories) {
		result.push([type, categories[type]]);
	}

	result.sort(function (a,b){return a[1] - b[1]})

	return result;

}

/**
 * calculates the total number of bytes transferred given the list of entries from the HAR
 * @return {number} total number of bytes transferred
 */
function sumSizes(entries) {

	var total = 0;

	entries.forEach(function (entry) {
		total += entry.response.content.size;
	});

	return total;

}

function formatSizeUnits(bytes){
	
	if (bytes>=1073741824) {
		bytes=(bytes/1073741824).toFixed(2)+' GB';
	} else if (bytes>=1048576)    {
		bytes=(bytes/1048576).toFixed(2)+' MB';
	} else if (bytes>=1024) {
		bytes=(bytes/1024).toFixed(2)+' KB';
	} else if (bytes>1) {
		bytes=bytes+' bytes';
	} else if (bytes==1) {
		bytes=bytes+' byte';
	} else {
		bytes='0 byte';
	}

	  return bytes;
}

module.exports = router;
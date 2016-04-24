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
			chartData: generateChartData(har.log.entries),
			transferred: formatSizeUnits(sumSizes(har.log.entries))
		};

		res.send(response);

	});

});

/**
 * Generates metrics grouped by content type of the requested data for the list
 * of entries of an HTTP archive.
 * @param  {Array} entries array of entries from the http archive
 * @return {Array} categories of requests with metrics. Sorted by the number of requests a given type had.
 */
function generateChartData(entries) {

	var types = {};

	entries.forEach(function (entry) {

		var mimeType = entry.response.content.mimeType;

		if (!types[mimeType]) {
			types[mimeType] = {
				name: mimeType,
				num : 0,
				totalSize : 0
			};
		}

		types[mimeType].num++;
		types[mimeType].totalSize += entry.response.content.size;

	});

	var result = [];

	for (var type in types) {
		result.push(types[type]);
	}

	result.sort(function (a,b){return a.num - b.num})

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
	
	if (bytes >= 1073741824) {
		bytes = (bytes/1073741824).toFixed(2) + ' GB';
	} else if (bytes >= 1048576)    {
		bytes = (bytes/1048576).toFixed(2) + ' MB';
	} else if (bytes >= 1024) {
		bytes = (bytes/1024).toFixed(2) + ' KB';
	} else if (bytes > 1) {
		bytes = bytes + ' bytes';
	} else if (bytes == 1) {
		bytes = bytes + ' byte';
	} else {
		bytes = '0 byte';
	}

	  return bytes;
}

module.exports = router;
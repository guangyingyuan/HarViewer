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

		res.send(generateMetrics(har));

	});

});

/**
 * Generates metrics grouped by content type of the requested data for the list
 * of entries of an HTTP archive.
 * @param  {Object} The HTTP archive
 * @return {Array} categories of requests with metrics.
 */
function generateMetrics(har) {

	var entries = har.log.entries;
	var requestDomain = extractDomain(har.log.pages[0].title);
	var totalSize = 0;
	var types = {};
	var timings = {
		blocked: 0,
		connect: 0,
		dns: 0,
		receive: 0,
		send: 0,
		ssl: 0,
		wait: 0
	}


	entries.forEach(function (entry) {

		var mimeType = entry.response.content.mimeType;

		if (!types[mimeType]) {
			types[mimeType] = {
				name: mimeType,
				crossOriginReqs : 0,
				sameOriginReqs : 0,
				totalSize : 0
			};
		}

		types[mimeType].num++;
		types[mimeType].totalSize += entry.response.content.size;

		if (requestDomain == extractDomain(entry.request.url)) {
			types[mimeType].sameOriginReqs++;
		} else {
			types[mimeType].crossOriginReqs++;
		}

		totalSize += entry.response.content.size;


		timings.blocked = addIfPositive(timings.blocked, entry.timings.blocked);
		timings.connect = addIfPositive(timings.connect, entry.timings.connect);
		timings.dns = addIfPositive(timings.dns, entry.timings.dns);
		timings.receive = addIfPositive(timings.receive, entry.timings.receive);
		timings.send = addIfPositive(timings.send, entry.timings.send);
		timings.ssl = addIfPositive(timings.ssl, entry.timings.ssl);
		timings.wait = addIfPositive(timings.wait, entry.timings.wait);

	});

	var chartData = [];

	for (var type in types) {
		chartData.push(types[type]);
	}

	return {
		har: har,
		chartData: chartData,
		transferred: formatSizeUnits(totalSize),
		timings: timings
	};

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

function extractDomain(url) {
	var domain;
	//find & remove protocol (http, ftp, etc.) and get domain
	if (url.indexOf("://") > -1) {
		domain = url.split('/')[2];
	}
	else {
		domain = url.split('/')[0];
	}

	//find & remove port number
	domain = domain.split(':')[0];

	return domain;
}

/**
 * returns a + b if b is positive, otherwise just a is returned
 */
function addIfPositive(a, b) {

	if (b > 0) {
		return a + b;
	}

	return a;

}

module.exports = router;


var prependZeros = function(number, desiredStringLength){
    var numberAsString = number + "";
    var numberOfZerosToPrepend = desiredStringLength - numberAsString.length;
    if (numberOfZerosToPrepend < 0) {
    	throw new Error("number too big");
    }
    
    for (var i = 0; i < numberOfZerosToPrepend; i++) {
    	numberAsString = "0" + numberAsString;
    }
    return numberAsString;
};

exports.prependZeros = prependZeros;

var parseLatLng = function(latlng) {
	return  /^(-)?([0-9]*)\.([0-9]*)$/i.exec(latlng + "");
};

var calculateMinutes = function(degDec) {
	return parseFloat("0." + degDec) * 60;
};

var calculateSeconds = function(minutes) {
	return (minutes - Math.floor(minutes)) * 60;
};

var calculateDecimal = function(val, noOfDecimalPlaces) {
	var stringVal = ((val- Math.floor(val)).toFixed(noOfDecimalPlaces) + "").substr(2);
	return prependZeros(stringVal, noOfDecimalPlaces);
};

var getLongitudeHemisphere = function(positiveNumber) {
	if (positiveNumber) {
		return "E";
	} else {
		return "W";
	}
};

var getLatitudeHemisphere = function(positiveNumber) {
	if (positiveNumber) {
		return "N";
	} else {
		return "S";
	}
};

var parseMinsAndSeconds = function(result, parsedLatLng) {
	var minutes = calculateMinutes(result[3]);
	parsedLatLng.minutes = prependZeros(Math.floor(minutes), 2);
	var seconds = calculateSeconds(minutes);
	parsedLatLng.seconds = prependZeros(Math.floor(seconds), 2);
	parsedLatLng.secondsFraction = calculateDecimal(seconds, 2);
};

exports.parseLongitude = function(longitude) {
	var parsedLongitude = {};
	var result = parseLatLng(longitude);
	parsedLongitude.degrees = prependZeros(result[2], 3);
	parseMinsAndSeconds(result, parsedLongitude);	
	var isPositiveNumber = result[1] == undefined;
	parsedLongitude.hemisphere = getLongitudeHemisphere(isPositiveNumber);
	//var longitude = degrees + minutes + seconds + secondsFraction + getLongitudeHemisphere(isPositiveNumber);
	return parsedLongitude;
};

exports.parseLatitude = function(latitude) {
	var parsedLatitude = {};
	var result = parseLatLng(latitude);
	parsedLatitude.degrees = prependZeros(result[2], 2);
	parseMinsAndSeconds(result, parsedLatitude);
	var isPositiveNumber = result[1] == undefined;
	parsedLatitude.hemisphere = getLatitudeHemisphere(isPositiveNumber);
	return parsedLatitude;
};

var parseLatLngMinDec = function(latlng, degreeDecimalPlaces, getHemesphere) {
	var parsedLatLng = {};
	var result = parseLatLng(latlng);
	parsedLatLng.degrees = prependZeros(result[2], degreeDecimalPlaces);

	var minutes = calculateMinutes(result[3]);
	parsedLatLng.minutes = prependZeros(Math.floor(minutes), 2);
	parsedLatLng.minutes = parsedLatLng.minutes + "." + calculateDecimal(minutes, 3);
	var isPositiveNumber = result[1] == undefined;
	parsedLatLng.hemisphere = getHemesphere(isPositiveNumber);
	return parsedLatLng;
}

exports.parseLongitudeMinDec = function(longitude) {
	return parseLatLngMinDec(longitude, 3, getLongitudeHemisphere);
};

exports.parseLatitudeMinDec = function(latitude) {
	return parseLatLngMinDec(latitude, 2, getLatitudeHemisphere);
};

function isArray(o) {
	  return Object.prototype.toString.call(o) === '[object Array]';
}

/**
 * @param args can be a single argument or an array of arguments to pass to parseFunction
 */
exports.executeParseFunctionAndCatchException = function(parseFunction, args) {	
	// if argument is not array it inside an array
	if (!isArray(args)) {
		args = [args];
	}
	
	try {
		return parseFunction.apply(this, args);
	} catch (e) {
		console.log('could not parse data ' + args + ' exception ' + e.message);
	}
};

exports.assertValidCommand = function(commandName, commandParameters, capabilities) {
	var command = capabilities.commands[commandName];
	
	if (command == undefined) {
		throw new Error('command ' + commandName + ' is not defined in capabilities file');
	}
	
	if (command.parameters == undefined) {
		throw new Error('command ' + commandName + ' has no parameters defined in capabilities file');
	}
	
	for (var parameter in command.parameters) {
		var regexp = new RegExp(command.parameters[parameter].pattern);
		var parameterValue = commandParameters[parameter];
		var match = regexp.test(parameterValue);
		if (!match) {
			var message = "parameterValue " + parameterValue + " does not match expression " + command.parameters[parameter].pattern;
			throw new Error(message);
		}
	}
};

exports.parseTimeInterval = function(interval) {

	var result = /^([0-9]{1,3})(s)?(m)?(h)?$/i.exec(interval);
	
	var intervalInSeconds;
	
	var intervalInt = parseInt(result[1], 10);
			
	if (result[2] != undefined) {
		intervalInSeconds = intervalInt
	}
	if (result[3] != undefined) {
		intervalInSeconds = intervalInt * 60;
	}
	if (result[4] != undefined) {
		intervalInSeconds = intervalInt * 60 * 60;
	}
	return intervalInSeconds;
};


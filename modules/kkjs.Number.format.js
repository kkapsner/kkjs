(function(){

"use strict";

/**
 * Predefined formats for easier use of the formatting function.
 */
var predefinedFormats = {
	weird: {
		name: "weird",
		decimalSeparator: "|",
		decimalCount: null,
		decimalGrouping: {
			start: "left",
			sequence: [
				{
					type: "force",
					padding: "~",
					remainingLength: 2
				},
				5,
				" k ",
				{
					type: "repeat",
					start: 0,
					repeatCount: 2
				}
			]
			
		},
		grouping: {
			start: "left",
			sequence: [
				{
					type: "force",
					remainingLength: 2,
					padding: " "
				},
				1,
				"#",
				{
					type: "repeat",
					start: -1,
					repeatCount: 4
				},
				" ui ",
				2,
				"$",
				{
					type: "repeat",
					start: 0,
					repeatCount: 3
				}
			]
		}
	}
};
var europeanFormats = {
	"DE-de": [",", "."],
	"EN-us": [".", ","],
	"EN-gb": [".", ","],
}
Object.keys(europeanFormats).forEach(function(key){
	predefinedFormats[key] = {
		name: key,
		decimalSeparator: europeanFormats[key][0],
		grouping: "european",
		thousandSeparator: europeanFormats[key][1]
	};
});

/**
 * Predefined number groupings for easier use of the formatting function.
 */
var predefinedGroupings = {
	"european": function(format){
		return {
			start: "right",
			sequence: [
				3,
				format.thousandSeparator || " ",
				{
					type: "repeat",
					start: 0,
					repeatCount: Number.POSITIVE_INFINITY
				}
			]
		}
	}
};

function getParts(str){
	/**
	 * Function getParts
	 * @name: getParts
	 * @author: Korbinian Kapsner
	 * @description: Splits a string representing a number (output from js) in
	 *    the parts before and after the decimal separator.
	 * @param str String 
	 * @return Object Returns an object with the attributes "left" adn "right"
	 *    that contain the part left resp. right to the decimal separator.
	 */
	
	var leftPart;
	var rightPart;
	if (str.indexOf("e") !== -1){
		var match = /^(\d+)(?:\.(\d*))?e(.*)$/.exec(str);
		match[2] = match[2] || "";
		var exponent = parseInt(match[3], 10);
		if (exponent < 0){
			leftPart = "0";
			rightPart = "0".repeat(-exponent - 1) + match[1] + match[2];
		}
		else {
			leftPart = match[1] + (match[2] + "0".repeat(exponent - match[2].length)).substring(0, exponent);
			rightPart = match[2].substring(exponent);
		}
	}
	else {
		var parts = str.split(".", 2);
		leftPart = parts[0];
		rightPart = parts[1] || "";
	}
	return {
		left: leftPart,
		right: rightPart
	};
}

Number.prototype.format = function format(formatDefinition){
	/**
	 * Function Number.prototype.format
	 * @name: Number.prototype.format
	 * @author: Korbinian Kapsner
	 * @description: Formats the number in a given way.
	 * @param formatDefinition String|Object Definition of the format. It can be
	 *    either a predefined format string (e.g. "DE-de") or a complex object
	 *    to describe the formating.
	 *    The complect object must have the attribute "decimalSeparator" to
	 *    specify the decimal separator. Additional the following attributes
	 *    can be used:
	 *        - decimalCount: the number of diggits after the decimal separator
	 *        - grouping: a string of the name of a predefined grouping or a
	 *             complex object (see Number.prototype.format.group for further
	 *             information). This grouping is used for the part before the
	 *             decimal separator.
	 *        - decimalGrouping: same as grouping but for the part after the
	 *             decimal separator.
	 * @return String The formated number string.
	 */
	if (predefinedFormats[formatDefinition]){
		formatDefinition = predefinedFormats[formatDefinition];
	}
	var isNegative = this < 0;
	var num = isNegative? -this: this;
	var str;
	if (typeof formatDefinition.decimalCount === "number"){
		str = num.toFixed(formatDefinition.decimalCount);
	}
	else {
		str = num.toString(10);
	}
	var parts = getParts(str);
	
	if (typeof formatDefinition.decimalCount === "number"){
		while (parts.right.length < formatDefinition.decimalCount){
			parts.right += "0";
		}
	}
	
	return (isNegative? "-": "") +
		format.group(
			parts.left,
			format.getGrouping(formatDefinition.grouping, formatDefinition)
		) +
		(
			parts.right?
			formatDefinition.decimalSeparator +
			format.group(
				parts.right,
				format.getGrouping(formatDefinition.decimalGrouping, formatDefinition)
			):
			""
		);
}

Number.prototype.format.getFormat = function getFormat(name){
	/**
	 * Function Number.prototype.format.getFormat
	 * @name: Number.prototype.format.getFormat
	 * @author: Korbinian Kapsner
	 * @description: Returns a predefined format.
	 * @param name String The name of the predefined format
	 * @return Object|undefined The complex formating object of the predefined
	 *    format. If the name is not known undefined is returned.
	 */
	return Object.create(predefinedFormats[name]);
}
Number.prototype.format.getGrouping = function getGrouping(name, format){
	/**
	 * Function Number.prototype.format.getGrouping
	 * @name: Number.prototype.format.getGrouping
	 * @author: Korbinian Kapsner
	 * @description: Returns a predefined grouping.
	 * @param name String The name of the predefined grouping
	 * @param format Object The complex format object using the grouping. Some
	 *    attributes of the groupings may be defined in the format object.
	 * @return Object|undefined The complex grouping object of the predefined
	 *    grouping. If the name is not known undefined is returned.
	 */
	if (typeof name !== "string"){
		return name;
	}
	var grouping = predefinedGroupings[name];
	if (typeof grouping === "function"){
		grouping = grouping(format || {});
	}
	else if (grouping){
		grouping = Object.create(grouping);
	}
	return grouping;
}

Number.prototype.format.group = function group(inputStr, grouping){
	/**
	 * Function Number.prototype.format.group
	 * @name: Number.prototype.format.group
	 * @author: Korbinian Kapsner
	 * @description: Groups a string according to a grouping.
	 * @param inputStr String The string to group
	 * @param grouping Object The complex grouping object. It has to contain the
	 *    property "sequence" which defines the grouping sequence.
	 *    This sequence is an array of strings, numbers or objects. The sequence
	 *    entries are processed one by the other.
	 *     String entry: this string will be inserted in the output string
	 *     Number entry: the number of diggits will be transfered from the input
	 *         to the output string
	 *     Object entry: special operation depending on the "type" property:
	 *      stop type: stop the grouping entirely
	 *      force type: forces the a minimum remaining length of the input and
	 *          if not met pads with a given character (or "0" on default). The
	 *          length is determined by the "remainingLength" property and the
	 *          character by the "padding" property.
	 *      repeat type: repeats some part of the sequence a certain number of
	 *          times. The start point of the repeat is determined by the
	 *          "start" property (positive number will give the absolute index
	 *          in the sequence array and a negative will give a relative index)
	 *          and the repeat count is specified by "repeatCount" (defaults to 
	 *          infinity).
	 *    The optional property "start" can have the values "right" or "left"
	 *    (default) which indicate where the grouping starts. For groupings that
	 *    format the part before the decimal separator you usualy use "right".
	 * @return String The grouped string.
	 */
	
	if (!grouping){
		return inputStr;
	}
	var diggits = inputStr.split("");
	var output = [];
	if (grouping.start === "right"){
		diggits = diggits.reverse();
	}
	var currentDiggitsIndex = 0;
	var currentGroupIndex = 0;
	var repeatStack = [];
	var repeatStackCounts = [];
	while (diggits[currentDiggitsIndex] && grouping.sequence[currentGroupIndex]){
		var group = grouping.sequence[currentGroupIndex];
		switch (typeof group){
			case "number":
				for (var i = 0; i < group && diggits[currentDiggitsIndex]; i += 1){
					output.push(diggits[currentDiggitsIndex]);
					currentDiggitsIndex += 1;
				}
				currentGroupIndex += 1;
				break;
			case "string":
				output.push(group);
				currentGroupIndex += 1;
				break;
			default:
				if (group.type === "repeat"){
					var repeatIndex = repeatStack.indexOf(group);
					if (repeatIndex === -1){
						repeatIndex = repeatStack.length;
						repeatStack.push(group);
						repeatStackCounts.push((group.repeatCount || Number.POSITIVE_INFINITY) - 1);
					}
					if (repeatStackCounts[repeatIndex] > 0){
						repeatStackCounts[repeatIndex] -= 1;
						if (group.start < 0){
							currentGroupIndex += group.start;
						}
						else {
							currentGroupIndex = group.start;
						}
					}
					else {
						repeatStack.splice(repeatIndex);
						repeatStackCounts.splice(repeatIndex);
						currentGroupIndex += 1;
					}
				}
				else if (group.type === "force"){
					while (group.remainingLength > diggits.length - currentDiggitsIndex){
						diggits.push(group.padding || "0");
					}
					currentGroupIndex += 1;
				}
				else if (group.type === "stop"){
					currentDiggitsIndex = diggits.length;
				}
				else {
					currentGroupIndex += 1;
				}
		}
	}
	
	while (diggits[currentDiggitsIndex]){
		output.push(diggits[currentDiggitsIndex]);
		currentDiggitsIndex += 1;
	}
	
	
	if (grouping.start === "right"){
		output = output.reverse();
	}
	return output.join("");
}


})();
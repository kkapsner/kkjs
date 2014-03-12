(function(){

"use strict";

/**
 * prototype-extension for String
 *
 **/

var constTable = require("./kkjs.constTabelle");
var utf16 = require("./kkjs.utf16");

/**
 * Function String.prototype.firstToUpperCase
 * @name: String.prototype.firstToUpperCase
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 12.04.2012
 * @description: Macht den ersten Buchstaben zu einem Großbuchstaben
 * @parameter:
 *	restToLowerCase: Boolean, ob der Rest in Kleinbuchstaben umgewandelt werden soll
 *
 */

String.prototype.firstToUpperCase = function firstToUpperCase(restToLowerCase){
	var str;
	if (restToLowerCase){
		str = this.toLowerCase();
	}
	else {
		str = this;
	}
	return str.charAt(0).toUpperCase() + str.substring(1);
};

/**
 * Function String.prototype.toFixedLength
 * @name: String.prototype.toFixedLength
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 17.01.2010
 * @description: Gibt einen String zurück mit der angegebenen Länge
 * @parameter:
 *	length. gewünschte Länge
 *	fill: Füllzeichen - wenn nicht gegeben wird ein " " verwendet
 *	right: ob die Verlängerung auf der rechten Seite angefügt oder gekürzt werden soll - Standard links
 *
 */

String.prototype.toFixedLength = function toFixedLength(length, fill, right){
	if (!fill){
		fill = " ";
	}
	if (this.length > length){
		if (right){
			return this.substr(0, length);
		}
		else {
			return this.substr(this.length - length);
		}
	}
	var pad = "";
	for (var i = 0; i < length - this.length; i++){
		pad += fill;
	}
	if (right){
		return this + pad;
	}
	else {
		return pad + this;
	}
};

/**
 * Function String.prototype.reverse
 * @name: String.prototype.reverse
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description: dreht den String um
 * @parameter:
 *	block: Größe der "Umdrehblöcke" z.B. ("hilfe").reverse(2) == "feilh"
 *
 */

String.prototype.reverse = function reverse(block){
	if (!block){
		block = 1;
	}
	var ret = "";
	for (var i = this.length - block; i >= 0; i -= block){
		ret += this.substr(i, block);
	}
	if (i !== block*-1){
		ret += this.substr(0, -i);
	}
	return ret;
};

/**
 * Function String.prototype.translate
 * @name: String.prototype.translate
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 11.04.2012
 * @description: This function returns a copy of the string , translating all occurrences of each character in from to the corresponding character in to .
 * @parameter:
 *	from:
 *	to:
 *
 */

String.prototype.translate = function translate(from, to){
	var ret = "";
	for (var i = 0; i < this.length; i++){
		var chr = this.charAt(i);
		if (from.indexOf(chr) !== -1){
			chr = to.charAt(from.indexOf(chr));
		}
		ret += chr;
	}
	return ret;
};

/**
 *
 */

String.prototype.quoteRegExp = function quoteRegExp(){
	return this.replace(/[\\\+\*\?\[\^\]\$\(\)\{\}\=\!\|\.]/g, "\\$1");
};

/**
 * Function String.prototype.repeat
 * @name: String.prototype.repeat
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description: returns a string x times the original string
 * @parameter:
 *	x:
 *
 */

String.prototype.repeat = function repeat(x){
	var ret = "";
	for (var i = 0; i < x; i++){
		ret += this;
	}
	return ret;
};

/**
 * Function String.prototype.decodeHTMLentities
 * @name: String.prototype.decodeHTMLentities
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description: replaces all HTML-entities by there normal characters
 * @parameter:
 *
 */

String.prototype.decodeHTMLentities = String.prototype.decodeHTMLEntities = function decodeHTMLentities(){
	return this.replace(/&([^;]+);/g, function(m, c){
		if (constTable.HTMLentities.hasOwnProperty(c)){
			return utf16.fromCharCode(constTable.HTMLentities[c]);
		}
		if (/^#\d+$/.test(c)){
			return utf16.fromCharCode(parseInt(c.substring(1), 10));
		}
		if (/^#x[a-f0-9]+$/i.test(c)){
			return utf16.fromCharCode(parseInt(c.substring(2), 16));
		}
		return "&" + c + ";";
	});
};

/**
 * Function String.prototype.encodeHTMLentities
 * @name: String.prototype.encodeHTMLentities
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 11.04.2012
 * @description: replaces all special characters by there HTML-entities
 * @parameter:
 *
 */

String.prototype.encodeHTMLentities = String.prototype.encodeHTMLEntities = function encodeHTMLentities(){
	return this.replace(/((?:[^\t\n\r\x21-\x7E]|["'<>&])+)/ig, function(m, c){
		return utf16.toCharCodeArray(c).reduce(function(str, code){
			return str + "&#" + code + ";";
		}, "");
	});
};

/**
 * Function String.prototype.isEMailAddress
 * @name: String.prototype.isEMailAddress
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 01.01.2011
 * @description: checks whether the string is a valid E-Mail-Address (as defined in html5)
 * @parameter:
 *
 */

String.prototype.isEMailAddress = function isEMailAddress(){
	return (/(?:[a-zA-Z0-9!#$%&'*+-\/=?\^_`{|}~]|\.)+@[a-zA-Z0-9\-]+(?:\.[a-zA-Z0-9\-]+)+\.?/).test(this);
};

/**
 * Function String.prototype.isValidURL
 * @name: String.prototype.isValidURL
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 01.01.2011
 * @description: checks whether the string is a valid URL (as defined in html5)
 * @parameter:
 *
 */

String.prototype.isValidURL = function isValidURL(){
	return true;
};


/**
 * Take some fuctions from Array.prototype
 */

["forEach", "some", "every", "reduce", "reduceRight", "indexOf", "lastIndexOf"].forEach(function(name){
	if (!(name in String.prototype)){
		String.prototype[name] = Array.prototype[name];
	}
});

})();
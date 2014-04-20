(function(){
"use strict";
/**
 * Object cookie
 * @name: cookie
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 15.10.2013
 * @description:  Provides cookie functionality
 */

var isString = function(str){
	/**
	 * Validation function if str is a string.
	 */
	switch (typeof str){
		case "string":
			return true;
		case "object":
			return Object.prototype.toString.call(str) === "[object String]";
		default:
			return false;
	}
};

var cookie = {
	// return value if the name is not stored in document.cookie
	defaultReturnValue: null,
	// this should be true if you want to be sure, that all your special characters (like ä, ö ü ², µ, €, \n, \t, ...) are treated in a safe way - but with this option enabled the string stored in the cookie can get much longer
	secureEncoding: true,
	
	update: function(){
		/**
		 * Function cookie.update
		 * @name: cookie.update
		 * @description: updates the cookie object.
		 */
		
		var cString = document.cookie.toString();
		var werte = cString.split(";");
		for (var i = 0; i < werte.length; i++){
			var wert = werte[i].split("=");
			var name = this.decode(wert[0].replace(/^\s+/, ""));
			var value = this.decode(wert.slice(1).join("="));
			this[name] = value;
		}
		return this;
	},
	
	getValue: function(name){
		/**
		 * Function cookie.getValue
		 * @name: cookie.getValue
		 * @description: Returns the value of a cookie.
		 * @parameter:
		 *	name: name of the cookie
		 * @return value: value stored in the cookie
		 */
		
		this.update();
		if (isString(this[name])){
			return this[name];
		}
		return this.defaultReturnValue;
	},
	
	setValue: function(name, value, att){
		/**
		 * Function cookie.setValue
		 * @name: cookie.setValue
		 * @description: Sets the value of a cookie.
		 * @parameter:
		 *	name: name of the cookie
		 *	value: value to be stored in the cookie
		 *	att: attributes of the cookie. This is an object with these keys:
		 *		expires: expiration date. Either a Date-object or a GMT formated
		 *			string
		 *		domain: domain for the cookie
		 *		path: path for the cookie
		 *		secure: if the cookie should be secure
		 */
		
		if (!isString(name)){
			throw new TypeError("Invalid argument. Name must be a string.");
		}
		if (!isString(value)){
			throw new TypeError("Invalid argument. Value must be a string.");
		}
		//att can contain this attributes: expire, domain, path, secure
		var insert = this.encode(name) + "=" + this.encode(value);
		if (att){
			if (att.expires){
				if (att.expires instanceof Date){
					insert += ";expires=" + att.expires.toGMTString();
				}
				if (isString(att.expires)){
					insert += ";expires=" + att.expires;
				}
			}
			if (isString(att.domain) && att.domain){
				insert += ";domain=" + att.domain;
			}
			if (isString(att.path) && att.path){
				insert += ";path=" + att.path;
			}
			if (att.secure){
				insert += ";secure";
			}
		}
		document.cookie = insert + ";";
		return this;
	},
	
	deleteValue: function(name, att){
		/**
		 * Function cookie.deleteValue
		 * @name: cookie.deleteValue
		 * @description: deletes a cookie
		 * @parameter:
		 *	name: name of the cookie
		 *	att: attributes for the cookie (see cookie.setValue)
		 */
		
		if (!att){
			att = {};
		}
		att.expire = new Date(0);
		this.setValue(name, "", att);
		delete this[name];
		return this;
	},
	
	
	encode: function encode(str){
		/**
		 * Function cookie.encode
		 * @name: cookie.encode
		 * @description: Encoding function for cookie values as some characters
		 *	can not be stored in cookies
		 * @parameter:
		 *	str: the string to get encoded
		 */
		if (this.secureEncoding){
			return str.replace(/([^a-z0-9])/ig, function(m, f){return "+" + f.charCodeAt(0).toString(36) + "/";});
		}
		return str.replace(/(%|=|;)/g, function(match, f){return "%" + {"%": "%%", "=": "%_", ";": "%."}[f];});
	},
	decode: function decode(str){
		/**
		 * Function cookie.decode
		 * @name: cookie.decode
		 * @description: Decoding function for cookie values as some characters
		 *	can not be stored in cookies
		 * @parameter:
		 *	str: the string to get decoded
		 */
		if (this.secureEncoding){
			return str.replace(/\+([a-z0-9]+?)\//ig, function(m, f){return String.fromCharCode(parseInt(f, 36));});
		}
		return str.replace(/%(%|_|\.)/g, function(match, f){return {"%": "%", "_": "=", ".": ";"}[f];});
	}
};

if (typeof exports !== "undefined"){
	for (var i in cookie){
		if (cookie.hasOwnProperty(i)){
			exports[i] = cookie[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.cookie = cookie;
}

}());
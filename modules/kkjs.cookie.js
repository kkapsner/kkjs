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
	
	/**
	 * Function cookie.update
	 * @name: cookie.update
	 */
	
	update: function(){
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
	
	/**
	 * Function cookie.getValue
	 * @name: cookie.getValue
	 */
	
	getValue: function(name){
		this.update();
		if (isString(this[name])){
			return this[name];
		}
		return this.defaultReturnValue;
	},
	
	/**
	 * Function cookie.setValue
	 * @name: cookie.setValue
	 */
	
	setValue: function(name, value, att){
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
	
	/**
	 * Function cookie.deleteValue
	 * @name: cookie.deleteValue
	 */
	
	deleteValue: function(wert, att){
		if (!att){
			att = {};
		}
		att.expire = new Date(0);
		this.setValue(wert, "", att);
		delete this[wert];
		return this;
	},
	
	
	encode: function encode(str){
		if (this.secureEncoding){
			return str.replace(/([^a-z0-9])/ig, function(m, f){return "+" + f.charCodeAt(0).toString(36) + "/";});
		}
		return str.replace(/(%|=|;)/g, function(match, f){return "%" + {"%": "%%", "=": "%_", ";": "%."}[f];});
	},
	decode: function decode(str){
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
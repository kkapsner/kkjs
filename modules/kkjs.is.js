/*global Element: true*/
(function(){

"use strict";
/**
 * @name: is
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 09.04.2013
 * @description: Eine Funktionen-/Variablensammlung mit welcher man auf gewisse Eigenschaften prüfen kann - meisten sind selbsterklärend:
 *	is.array: selbsterklärend
 *	is.object: se.
 *	is.number: se.
 *	is.string: se.
 *	is.boolean: se.
 *	is.undefined: se.
 *	is["null"]: se.
 *	is.key: benötigt als einziger 2 Argumente - 1.: Objekt, in dem gesucht werden soll, 2.: String mit dem Keynamen
 *	is.node: se.
 *
 *	Browserüberprüfung (Variablen):
 *	is.opera
 *	is.ie
 *	is.version: Versionsnummer des Browsers
 *	is.gecko
 *	is.ff
 */

var OptS = Object.prototype.toString;

var is = {
	"array": function(obj){
		return OptS.call(obj) === "[object Array]";
	},
	"object": function(obj){
		return (typeof obj === "object" && obj !== null);
	},
	"number": function(num){
		switch (typeof num){
			case "number": return !isNaN(num);
			case "object": return OptS.call(num) === "[object Number]" && !isNaN(num);
			default: return false;
		}
	},
	"string": function(str){
		switch (typeof str){
			case "string": return true;
			case "object": return OptS.call(str) === "[object String]";
			default: return false;
		}
	},
	"boolean": function(bool){
		switch (typeof bool){
			case "boolean": return true;
			case "object": return OptS.call(bool) === "[object Boolean]";
			default: return false;
		}
	},
	"function": function(func){
		switch (typeof func){
			case "function": return true;
			case "object": return OptS.call(func) === "[object Function]";
			default: return false;
		}
	},
	"undefined": function(un){
		return (un === null || (typeof un === "undefined"));
	},
	"defined": function(def){
		return !is["undefined"](def);
	},
	"null": function(nu){
		return (nu === null);
	},
	"key": function(array, key){
		if (is["undefined"](array)){
			return false;
		}
		if (key in array){
			return true;
		}
		return (typeof array[key] !== "undefined");
	},
	"node": function(node){
		if (!is.object(node)){
			return false;
		}
		try {
			/*problem in IE6/7 with DOM.compatible created Element*/
			if (typeof Element !== "undefined" && node instanceof Element){
				return true;
			}
		}catch(e){}
		return (
			is.key(node, "nodeName") &&
			is.key(node, "nodeType") &&
			is.key(node, "nodeValue")
		);
	},
	"browser": (typeof window !== "undefined" && typeof navigator !== "undefined")
};
if (is.browser){
	is.opera = !!window.opera && window.opera.toString() === "[object Opera]"; // /opera/i.test(navigator.userAgent),
	is.safari = /safari/i.test(navigator.userAgent);
	is.ie = /*@cc_on @if (@_jscript) true; @else @*/ false; /*@end @*/
	is.version = (/(msie|firefox|opera)[\/\s]((\d+\.?)+)/i.exec(navigator.userAgent))?/(msie|firefox|opera)[\/\s]((\d+\.?)+)/i.exec(navigator.userAgent)[2]: Number.NaN;
	is.gecko = /gecko/i.test(navigator.userAgent);
	is.ff = /firefox/i.test(navigator.userAgent);
	is.chrome = /\bchrome\b/i.test(navigator.userAgent);
}

/*if (is.ie && is.version < 7){
	window.onload = function(){
		alert("You use an old and insecure Internet Explorer");
	};
}*/

if (typeof exports !== "undefined"){
	for (var i in is){
		if (is.hasOwnProperty(i)){
			exports[i] = is[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.is = is;
}

})();
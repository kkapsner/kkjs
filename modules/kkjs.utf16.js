(function(){
/*jshint bitwise: false*/
"use strict";

/**
 * Object utf16
 * @name: utf16
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @last modify: 11.04.2012
 * @description:
 */


 
var utf16 = {
	toCharCodeArray: function toCharCodeArray(str, removeErrorChar){
		/**
		 * Function utf16.toCharCodeArray
		 * @name: utf16.toCharCodeArray
		 * @description: Takes a JS-String (which is UTF-16 encoded) and returns an array of the character codes (unicode). If an error is detected (low surrogate before high surrogate
		 *	or high surrogate without low surrogate) the current character is ignored an the next (possibliy the second surrogate from the error) is processed.
		 * @parameter:
		 *	str:
		 *	removeErrorChar:
		 */
		
		var l = str.length;
		var ret = new Array(l), retI = 0;
		var code, high, low, ok;
		for (var i = 0; i < l; i++){
			ok = true;
			code = str.charCodeAt(i);
			if ((code >= 0xD800 && code <= 0xDBFF) || (code >= 0xDC00 && code <= 0xDFFF)){
				// code is high surrogate
				if (code < 0xDC00){
					high = code;
					low = str.charCodeAt(i + 1);
					// low is a low surrogate
					if (low >= 0xDC00 || low <= 0xDFFF){
						code = (((high & 0x03FF) << 10) | (low & 0x03FF)) + 0x10000;
						i++;
					}
					else {
						ok = false;
					}
				}
				else {
					ok = false;
				}
			}
			if (ok || !removeErrorChar){
				ret[retI] = code;
				retI++;
			}
		}
		ret.length = retI;
		return ret;
	},
	
	fromCharCodeArray: function fromCharCodeArray(arr){
		/**
		 * Function utf16.fromCharCodeArray
		 * @name: utf16.fromCharCodeArray
		 * @description:
		 * @parameter:
		 *	arr:
		 */
		
		return utf16.fromCharCode.apply(utf16, arr);
	},
	
	fromCharCode: (function(){
		/**
		 * Function utf16.fromCharCode
		 * @name: utf16.fromCharCode
		 * @description:
		 * @parameter:
		 *	code:
		 *	code2:
		 *	...
		 */
		
		function encode(code){
			/* single charactor code encoding function */
			
			if (code > 0xFFFF){
				code -= 0x10000;
				var high = ((code >>> 10) & 0x03FF) | 0xD800;
				var low = (code & 0x03FF) | 0xDC00;
				return String.fromCharCode(high, low);
			}
			else {
				return String.fromCharCode(code);
			}
		}
		return function fromCharCode(code/*, code2, code3, ...*/){
			/**
			 * Function utf16.fromCharCode
			 * @name: utf16.fromCharCode
			 * @description:
			 * @parameter:
			 *	code:
			 *	code2:
			 *	...
			 */
			
			var l = arguments.length;
			var ret = "";
			for (var i = 0; i < l; i++){
				ret += encode(arguments[i]);
			}
			return ret;
		};
	})(),
	
	toByteStream: function(str, littleEndian){
		/**
		 * Function utf16.toByteStream
		 * @name: utf16.toByteStream
		 * @description:
		 * @parameter:
		 *	str:
		 *	littleEndian: Boolean, default false (BOM is prepended)
		 */
		
		var l = str.length;
		var ret = "";
		if (typeof littleEndian === "undefined"){
			ret = "\xFE\xFF";
		}
		var firstMask = littleEndian? 0x00FF: 0xFF00;
		var firstShift = littleEndian? 0: 8;
		var secondMask = littleEndian? 0xFF00: 0x00FF;
		var secondShift = littleEndian? 8: 0;
		for (var i = 0; i < l; i++){
			var code = str.charCodeAt(i);
			ret += String.fromCharCode(
				(firstMask & code) >>> firstShift,
				(secondMask & code) >>> secondShift
			);
		}
		return ret;
	},
	
	fromByteStream: function(str, littleEndian){
		/**
		 * Function utf16.fromByteStream
		 * @name: utf16.fromByteStream
		 * @description:
		 * @parameter:
		 *	str:
		 *	littleEndian: Boolean, default: look at BOM
		 */
		
		var ret = "";
		if (typeof littleEndian === "undefined"){
			switch (str.substring(0, 2)){
				case "\xFF\xFE":
					littleEndian = true;
					str = str.substring(2);
					break;
				case "\xFE\xFF":
					littleEndian = false;
					str = str.substring(2);
					break;
				default:
					littleEndian = false;
			}
		}
		var l = str.length;
		var firstShift = littleEndian? 0: 8;
		var secondShift = littleEndian? 8: 0;
		for (var i = 0; i < l - 1; i += 2){
			var code1 = str.charCodeAt(i);
			var code2 = str.charCodeAt(i + 1);
			ret += String.fromCharCode(
				(code1 << firstShift) | (code2 << secondShift)
			);
		}
		return ret;
	}
};

if (typeof exports !== "undefined"){
	for (var i in utf16){
		if (utf16.hasOwnProperty(i)){
			exports[i] = utf16[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.utf16 = utf16;
}

})();
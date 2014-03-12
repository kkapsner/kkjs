(function(){
/*jshint bitwise: false*/
"use strict";

/**
 * Object utf8
 * @name: utf8
 * @author: Korbinian Kapsner
 * @version: 1.1
 * @last modify: 11.04.2012
 * @description:
 */

var utf16 = require("kkjs.utf16");

var utf8 = {
	/**
	 * String utf8.BOM
	 */
	
	BOM: "\xEF\xBB\xBF",
	
	/**
	 * Function utf8.toCharCodeArray
	 * @name: utf8.toCharCodeArray
	 * @description: takes a utf8-coded string!
	 * @parameter:
	 *	str:
	 *	errorCode: (optional) defaults to 0xFFFD;
	 */
	
	toCharCodeArray: function(str, errorCode){
		if (typeof errorCode === "undefined"){
			errorCode = 0xFFFD;
		}
		
		var l = str.length;
		var ret = new Array(l), retI = 0;
		var code, ok;
		for (var i = 0; i < l; i++){
			code = str.charCodeAt(i);
			if (code > 0x7F){
				if (code >= 0xC0 && code <= 0xFF){
					ok = true;
					var mask = 0x80;
					var dataMask = 0x7F;
					var byteLength = 0;
					while (code & mask){
						mask >>>= 1;
						byteLength ++;
						dataMask &= ~mask;
					}
					code &= dataMask;
					for (var j = 1; j < byteLength; j++){
						code <<= 6;
						var tailing = str.charCodeAt(i + j);
						if ((tailing >>> 6) !== 2){
							code = errorCode;
							j = 0;
							break;
						}
						code |= tailing & 0x3F;
					}
					if (j !== 0){
						i += j - 1;
					}
					
				}
				else {
					code = errorCode;
				}
			}
			
			ret[retI] = code;
			retI++;
		}
		ret.length = retI;
		return ret;
	},
	
	/**
	 * Function utf8.fromCharCodeArray
	 * @name: utf8.fromCharCodeArray
	 * @description:
	 * @parameter:
	 *	arr
	 */
	
	fromCharCodeArray: function(arr){
		return utf8.fromCharCode.apply(utf8, arr);
	},
	 
	/**
	 * Function utf8.fromCharCode
	 * @name: utf8.fromCharCode
	 * @description:
	 * @parameter:
	 *	code:
	 *	code2:
	 *	...
	 */
	
	fromCharCode: (function(){
		function encode(code){
			if (code <= 0x7F){
				return String.fromCharCode(code);
			}
			else {
				var blocks = [];
				var start = 0x80;
				var plus = 0x40;
				while (start + code > 0xFF - plus){
					blocks.push((0x3F & code) + 0x80);
					code >>= 6;
					start += plus;
					plus >>= 1;
				}
				blocks.push(start + code);
				blocks.reverse();
				
				return String.fromCharCode.apply(String, blocks);
			}
		}
		return function(code/*, code2, code3, ...*/){
			var l = arguments.length;
			var ret = "";
			for (var i = 0; i < l; i++){
				ret += encode(arguments[i]);
			}
			return ret;
		};
	})(),
	
	/**
	 * Function utf8.encode
	 * @name: utf8.encode
	 * @description:
	 * @parameter:
	 *	str:
	 *
	 */

	encode: function encodeUTF8(str){
		return utf8.fromCharCode.apply(utf8, utf16.toCharCodeArray(str));
	},
	
	/**
	 * Function utf8.decode
	 * @name: utf8.decode
	 * @description:
	 * @parameter:
	 *	str:
	 *
	 */

	decode: function decodeUTF8(str){
		return utf16.fromCharCodeArray(utf8.toCharCodeArray(str));
	}
};

if (typeof exports !== "undefined"){
	for (var i in utf8){
		if (utf8.hasOwnProperty(i)){
			exports[i] = utf8[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.utf8 = utf8;
}

})();
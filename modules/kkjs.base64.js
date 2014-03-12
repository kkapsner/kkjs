/*jshint bitwise: false*/
(function(){

"use strict";

/**
 * Object base64
 * @name base64
 * @version 1.0
 * @author Korbinian Kapsner
 *
 */

var base = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

var base64 = {
	/**
	 * Function base64.encode
	 * @name: base64.encode
	 * @version: 1.0
	 * @author: Korbinian Kapsner
	 * @last modify: 09.04.2012
	 * @description:
	 * @parameter:
	 *	str:
	 * @used parts of kkjs:
	 *
	 */

	encode: function encodeBase64(str){
		var addedNull = 0;
		while (str.length % 3 !== 0){
			addedNull++;
			str += String.fromCharCode(0);
		}
		var ret = "";
		for (var i = 0; i < str.length; i += 3){
			var bytes = [];
			for (var j = 0; j < 3; j++){
				bytes.push(str.charCodeAt(i + j) & 0xFF);
			}
			
			ret +=
				base.charAt(bytes[0] >> 2 & 0x3F) +
				base.charAt((bytes[0] << 4 | bytes[1] >> 4) & 0x3F) +
				base.charAt((bytes[1] << 2 | bytes[2] >> 6) & 0x3F) +
				base.charAt(bytes[2] & 0x3F);
		}
		
		ret = ret.substring(0, ret.length - addedNull);
		for (var i = 0; i < addedNull; i++){
			ret += "=";
		}
		return ret;
	},
	
	/**
	 * Function base64.decode
	 * @name: base64.decode
	 * @version: 1.0
	 * @author: Korbinian Kapsner
	 * @last modify: 17.01.2010
	 * @description:
	 * @parameter:
	 *	str:
	 * @used parts of kkjs:
	 *
	 */

	decode: function decodeBase64(str){

		str = str.replace(/[\s\n\r]+/g, "");
		var addedNull = 0;
		str = str.replace(/\=+$/, function(match){
			addedNull = match.length;
			var ret = "";
			while(ret.length < addedNull){
				ret += "A";
			}
			return ret;
		});
		
		if (str.match(/[^a-zA-Z0-9+\/]/) || str.length % 4 !== 0){
			return false;
		}
		
		var ret = "";
		for (var i = 0; i < str.length; i += 4){
			var bytes6 = [];
			for (var j = 0; j < 4; j++){
				bytes6.push(base.indexOf(str.charAt(i + j)));
			}
			
			ret +=
				String.fromCharCode((bytes6[0] << 2 | bytes6[1] >> 4) & 0xFF) +
				String.fromCharCode((bytes6[1] << 4 | bytes6[2] >> 2) & 0xFF) +
				String.fromCharCode((bytes6[2] << 6 | bytes6[3] >> 0) & 0xFF);
		}
		return ret.substring(0, ret.length - addedNull);
	}
};


if (typeof exports !== "undefined"){
	for (var i in base64){
		if (base64.hasOwnProperty(i)){
			exports[i] = base64[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.base64 = base64;
}
})();
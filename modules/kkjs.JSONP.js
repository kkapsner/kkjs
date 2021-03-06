(function(){
"use strict";

/**
 * Object kkjs.JSONP
 * @name: kkjs.JSONP
 * @author: Korbinian Kapsner
 * @description: provides JSONP functionality
 */

var node = require("kkjs.node");
var JSONP = {
	process: function(url, parameter){
		/**
		 * Function JSONP.process
		 * @name: JSONP.process
		 * @author: Korbinian Kapsner
		 * @description: Initiates an JSONP request
		 * @parameter:
		 *	url: The URL were the request should be sent to.
		 *	parameter: GET-Parameter that should be sent with the request.
		 */
		
		var script = node.create({
			tag: "script",
			type: "text/javascript"
		});
		var value;
		if (parameter){
			for (var name in parameter){
				if (parameter.hasOwnProperty(name)){
					value = parameter[name];
					if (typeof value === "function"){
						value = this.createCallback(value, script);
					}
					else if (Array.isArray(value)){
						name += "[]";
						for (var i = 0; i < value.length; i++){
							url += "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value[i]);
						}
						continue;
					}
					
					url += "&" + encodeURIComponent(name) + "=" + encodeURIComponent(value);
				}
			}
		}
		script.src = url;
		document.getElementsByTagName("head")[0].appendChild(script);
	},
	
	callback: {},
	createCallback: function(callbackFn, script){
		/**
		 * Function JSONP.createCallback
		 * @name: JSONP.createCallback
		 * @author: Korbinian Kapsner
		 * @description: Creates and registers a callback for a JSONP.
		 *	Should only be used by JSONP.process().
		 * @parameter:
		 *	callbackFn: The callback function for the JSONP.
		 *	script: the <script> node
		 * @return value: A string with the JS-"path" to the function.
		 */
		
		var callback = "_" + this.callbackCount.toString(36);
		this.callbackCount++;
		this.callback[callback] = function(jobj){
			callbackFn(jobj);
			if (script.parentNode){
				script.parentNode.removeChild(script);
			}
			delete this[callback];
		};
		return "require.JSONP.callback." + callback;
	},
	callbackCount: 0
};

// bad, bad, bad - but some JSONP APIs do not support braces in the callback-parameter
require.JSONP = {callback: JSONP.callback};

if (typeof exports !== "undefined"){
	for (var i in JSONP){
		if (JSONP.hasOwnProperty(i)){
			exports[i] = JSONP[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.JSONP = JSONP;
}

})();
(function(){
"use strict";

/**
 * Object kkjs.JSONP
 * @name: kkjs.JSONP
 * @author: Korbinian Kapsner
 * @description: provides JSONP functionality
 */

var is = require("kkjs.is");
var node = require("kkjs.node");
var JSONP = {
	process: function(url, parameter){
		var script = node.create({
			tag: "script",
			type: "text/javascript"
		});
		var value;
		if(is.object(parameter)){
			for (var name in parameter){
				if (parameter.hasOwnProperty(name)){
					value = parameter[name];
					if (is["function"](value)){
						value = this.createCallback(value, script);
					}
					else if (is.array(value)){
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
		var callback = "_" + this.callbackCount.toString(36);
		this.callbackCount++;
		this.callback[callback] = function (jobj){
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
/*global kkjs:true*/

(function(){
"use strict";

/**
 * Object kkjs
 * @super Object
 * @author Korbinian Kapsner
 * @version 1.0
 */
window.kkjs = {
	window: window,
	url: {}
};


/**
 * Object kkjs.load
 * @super Object
 * @author Korbinian Kapsner
 * @version 1.0
 */
kkjs.load = {
	node: false,
	module: function(module, callback, forceLoad){
		/**
		 * Function kkjs.load.module
		 * @name: kkjs.load.module
		 * @description: Module loading function. Should only be used before
		 *	DOMReady. Deprecated. Use require() instead.
		 * @parameter:
		 *	module: the module name to be loaded
		 *	callback: a callback function to be executed after the module is
		 *		loaded.
		 *	forceLoad: if a new loading should be forced. Otherwise caching will
		 *		be in place.
		 */
		
		if (!kkjs[module] || forceLoad){
			return kkjs.load.script(kkjs.url.load + "kkjs." + module + ".js", callback);
		}
		return false;
	},
	documentClosed: false,
	onscriptload: function(node, callbackID){
		/**
		 * Function kkjs.load.onscripload
		 * @name: kkjs.load.onscripload
		 * @description: Callback for onload-Events. Should only be used in
		 *	kkjs.load.script().
		 * @parameter:
		 *	node: <script>-node that fired the event.
		 *	callbackID: ID of the callback function.
		 */
		
		if (node && node.readyState && node.readyState !== "complete"){
			return;
		}
		if (kkjs.load.callbacks[callbackID]){
			kkjs.load.callbacks[callbackID]();
			kkjs.load.callbacks[callbackID] = null;
		}
		if (node){
			node.onload = node.onreadystatechange = null;
		}
	},
	callbacks: [],
	script: function(url, callback){
		/**
		 * Function kkjs.load.script
		 * @name: kkjs.load.script
		 * @description: Arbitraty script loading function. Should only be used
		 *	before DOMReady.
		 * @parameter:
		 *	url: URL of the script to be loaded
		 *	callback: a callback function to be executed after the module is
		 *		loaded.
		 */
		
		var callbackID = false;
		if (typeof callback === "function"){
			callbackID = kkjs.load.callbacks.push(callback) - 1;
		}
		
		if (!kkjs.load.documentClosed){
			document.write(
				"<script type='text/javascript' src='" + url + "'" +
					((callbackID !== false)? " onload='kkjs.load.onscriptload(this, " + callbackID + ")' onreadystatechange='kkjs.load.onscriptload(this, " + callbackID + ")'": "") +
				"></script>"
			);
		}
		else {
			var sc = document.createElement("script");
			sc.type = "text/javascript";
			if (callbackID){
				sc.onload = sc.onreadystatechange = function(){
					/* onload-event callback */
					kkjs.load.onscriptload(this, callbackID);
				};
			}
			sc.src = url;
			document.getElementsByTagName("head")[0].appendChild(sc);
		}
	}
};

var sc = document.getElementsByTagName("script"),
	scLength = sc.length,
	scTextRE = /^\s*\/\*kkjs\.load\.js node\*\/\s*$/i,
	scSrcRE = /kkjs\.load\.js(?:\?.*|)$/,
	getDirRE = /^(.*?\/)(?:[^\/]+?(?:\?.+)?)?$/;

// get <script>-node for kkjs.load.js by text
for (var i = scLength - 1; i >= 0; i--){
	if (sc[i].text && scTextRE.test(sc[i].text)){
		if (sc[i].src){
			kkjs.load.node = sc[i];
			break;
		}
	}
}
// get <script>-node for kkjs.load.js by src
if (!kkjs.load.node){
	for (var i = scLength - 1; i >= 0; i--){
		if (sc[i].src){
			if (scSrcRE.test(sc[i].src)){
				kkjs.load.node = sc[i];
				break;
			}
		}
	}
}
// take last <script>-node
/*if (!kkjs.load.node){
	kkjs.load.node = sc[scLength - 1];
}*/

if (kkjs.load.node){
	kkjs.url.load = getDirRE.exec(kkjs.load.node.src)[1];
	kkjs.url.images = kkjs.url.load + "images/";
	kkjs.url.css = kkjs.url.load + "css/";
	
	var basicModules = [
		"es5",
		"require", "requireInjection",
		"utf16",
		"oo", "Math", "DOM", "$", "sprintf",

		"Number.prototype",	"String.prototype", "Function.prototype",
		
		"scroll", "URL", "ajax", "color", "dataset", "node", "css", "DOM.compatible",
		{
			 "name": "event",
			 "callback": function(){
			    if (kkjs.event){
					kkjs.event.onDOMReady(function(){
						kkjs.load.documentClosed = true;
					});
				}
			}
		}
	];//
	
	for (var i = 0; i < basicModules.length; i++){
		var m = basicModules[i];
		if (typeof m === "string"){
			kkjs.load.module(m);
		}
		else {
			kkjs.load.module(m.name, m.callback);
		}
	}
	
	var search = /^[^\?]+\?([^#]+)/.exec(kkjs.load.node.src);
	if (search){
		var elements = search[1].split("&");
		for (var i = 0; i < elements.length; i++){
			var el = elements[i].split("=");
			switch (el[0]){
				case "modules":
					var modules = decodeURIComponent(el.slice(1).join("=")).split(/\s*,\s*/);
					for (var j = 0; j < modules.length; j++){
						kkjs.load.module(modules[j]);
					}
					break;
				case "scripts":
					var scripts = decodeURIComponent(el.slice(1).join("=")).split(/\s*,\s*/);
					for (var j = 0; j < scripts.length; j++){
						kkjs.load.script(scripts[j]);
					}
					break;
			}
			
		}
	}
}

})();
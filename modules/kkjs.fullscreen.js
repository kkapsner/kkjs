(function(){
"use strict";

/**
 * Object fullscreen
 * @name: fullscreen
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: provides cross-browser access to the fullscreen API
 */

var event = require("kkjs.event");

var pre = ["moz", "webkit", "o", "ms", "khtml"];

function getName(obj, name, event){
	/**
	 * Function getName
	 * @name: getName
	 * @author: Korbinian Kapsner
	 * @description: tries to find the real name for a base name.
	 * @parameter:
	 *	obj: object where the name should be searched
	 *	name: base name to be found
	 *	event: if the name is an event
	 * @return value: the found name or null.
	 */
	
	var ePre = (event? "on": "");
	if (ePre + name in obj){
		return ePre + name;
	}
	else {
		var uName = event? name:  name.firstToUpperCase();
		for (var i = 0; i < pre.length; i++){
			var pName = pre[i] + uName;
			if (ePre + pName in obj){
				return pName;
			}
		}
	}
	if (!event && name.indexOf("screen") + 1){
		return getName(obj, name.replace("screen", "Screen"));
	}
	return null;
}

var name = {
	request: getName(document.documentElement, "requestFullscreen"),
	cancel: getName(document, "cancelFullscreen") || getName(document, "exitFullscreen"),
	windowStatus: getName(window, "fullscreen") || getName(window, "isFullscreen"),
	documentStatus: getName(document, "fullscreen") || getName(document, "isFullscreen"),
	element: getName(document, "fullscreenElement"),
	
	event: {
		change: getName(document, "fullscreenchange", true),
		error: getName(document, "fullscreenerror", true) || getName(document, "fullscreendenied", true)
	}
};

var fullscreen = {
	/**
	 * Boolean fullscreen.isSupported
	 * @name: fullscreen.isSupported
	 * @author: Korbinian Kapsner
	 * @description: boolean that indicates if the fullscreen API is supported
	 *	by the current browser.
	 */
	isSupported: !!(name.request && name.cancel && (name.windowStatus || name.documentStatus || name.element)),
	
	request: function(el){
		/**
		 * Function fullscreen.request
		 * @name: fullscreen.request
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: starts a fullscreen request if the API is supported.
		 *	If the request is accepted by the user the website is displayed fullscreen.
		 * @parameter:
		 *	el (optional): HTML-node that should be displayed fullscreen
		 */
		
		if (fullscreen.isSupported){
			el = el || document.documentElement;
			return el[name.request]();
		}
		return null;
	},
	
	cancel: function(){
		/**
		 * Function fullscreen.cancel
		 * @name: fullscreen.cancel
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: exits the fullscreen mode.
		 * @parameter:
		 */
		
		if (fullscreen.isSupported){
			return document[name.cancel]();
		}
		return null;
	},
	
	toggle: function(el){
		/**
		 * Function fullscreen.toggle
		 * @name: fullscreen.toggle
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: toggles between fullscreen and normal mode.
		 * @parameter:
		 *	el (optional): HTML-node that should be displayed fullscreen
		 */
		
		if (fullscreen.is()){
			fullscreen.cancel();
		}
		else {
			fullscreen.request(el);
		}
	},
	
	is: function(globalFullscreenCheck){
		/**
		 * Function fullscreen.is
		 * @name: fullscreen.is
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: checks if the site runs in fullscreen mode.
		 * @parameter:
		 * @return value: boolean: true if the website runs in fullscreen mode
		 */
		
		if (globalFullscreenCheck){
			var wName = name.windowStatus;
			if (wName){
				return window[wName];
			}
		}
		var dName = name.documentStatus || name.element;
		if (dName){
			return !!document[dName];
		}
		return false;
	}
};

// add fullscreen events to the kkjs.event API.
event.add.fullscreenchange = function(el, func, amAnfang){
	/* Add fullscreenchange event */
	return event.add(el, name.event.change, func, amAnfang);
};
event.add.fullscreenerror = function(el, func, amAnfang){
	/* Add fullscreenerror event */
	return event.add(el, name.event.error, func, amAnfang);
};
event.remove.fullscreenchange = function(el, func){
	/* Remove fullscreenchange event */
	return event.remove(el, name.event.change, func);
};
event.remove.fullscreenerror = function(el, func){
	/* Remove fullscreenerror event */
	return event.remove(el, name.event.error, func);
};

if (typeof exports !== "undefined"){
	for (var i in fullscreen){
		if (fullscreen.hasOwnProperty(i)){
			exports[i] = fullscreen[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.fullscreen = fullscreen;
}

})();
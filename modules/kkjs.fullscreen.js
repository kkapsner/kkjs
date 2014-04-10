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
	
	/**
	 * Function fullscrren.request
	 * @name: fullscrren.request
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: starts a fullscreen request if the API is supported.
	 *	If the request is accepted by the user the website is displayed fullscreen.
	 * @parameter:
	 *	el (optional): HTML-node that should be displayed fullscreen
	 */
	request: function(el){
		if (fullscreen.isSupported){
			el = el || document.documentElement;
			return el[name.request]();
		}
		return null;
	},
	
	/**
	 * Function fullscrren.cancel
	 * @name: fullscrren.cancel
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: exits the fullscreen mode.
	 * @parameter:
	 */
	cancel: function(){
		if (fullscreen.isSupported){
			return document[name.cancel]();
		}
		return null;
	},
	
	/**
	 * Function fullscrren.toggle
	 * @name: fullscrren.toggle
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: toggles between fullscreen and normal mode.
	 * @parameter:
	 *	el (optional): HTML-node that should be displayed fullscreen
	 */
	toggle: function(el){
		if (fullscreen.is()){
			fullscreen.cancel();
		}
		else {
			fullscreen.request(el);
		}
	},
	
	/**
	 * Function fullscrren.is
	 * @name: fullscrren.is
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: checks if the site runs in fullscreen mode.
	 * @parameter:
	 * @return value: boolean: true if the website runs in fullscreen mode
	 */
	is: function(globalFullscreenCheck){
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
	return event.add(el, name.event.change, func, amAnfang);
};
event.add.fullscreenerror = function(el, func, amAnfang){
	return event.add(el, name.event.error, func, amAnfang);
};
event.remove.fullscreenchange = function(el, func){
	return event.remove(el, name.event.change, func);
};
event.remove.fullscreenerror = function(el, func){
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
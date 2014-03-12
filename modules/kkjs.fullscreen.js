(function(){
"use strict";

/**
 * Object fullscreen
 * @name: fullscreen
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: fullscreen description
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
	isSupported: !!(name.request && name.cancel && (name.windowStatus || name.documentStatus || name.element)),
	request: function(el){
		if (fullscreen.isSupported){
			el = el || document.documentElement;
			return el[name.request]();
		}
		return null;
	},
	cancel: function(){
		if (fullscreen.isSupported){
			return document[name.cancel]();
		}
		return null;
	},
	toggle: function(el){
		if (fullscreen.is()){
			fullscreen.cancel();
		}
		else {
			fullscreen.request(el);
		}
	},
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
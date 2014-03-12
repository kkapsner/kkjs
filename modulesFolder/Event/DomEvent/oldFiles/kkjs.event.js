(function(){
"use strict";

/**
 * Object event
 * @super Object
 * @author Korbinian Kapsner
 * @version 1.0
 */

var is = require("kkjs.is");
var oo = require("kkjs.oo");
//var ajax = require("kkjs.ajax");
var kkjsscroll = require("kkjs.scroll");
var DOM = require("kkjs.DOM");
var kMath = require("kkjs.Math");

var event = {
	/**
	 * Function event.add
	 * @name: event.add
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description:
	 * @parameter:
	 *	node:
	 *	eventType:
	 *	func:
	 *	amAnfang:
	 */

	add: function addEvent(node, eventType, func, amAnfang){
		if (!event.supported(eventType) && event.add[eventType]){
			return event.add[eventType](node, func, amAnfang);
		}
		return event.Handler.get(node).addEvent(eventType, func, amAnfang);
	}.makeArrayCallable([0, 1, 2]).makeObjectCallable(1, 1, 2),
	
	/**
	 * Function event.remove
	 * @name: event.remove
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description:
	 * @parameter:
	 *	node:
	 *	eventType:
	 *	func:
	 */
	
	remove: function removeEvent(node, eventType, func){
		if (!event.supported(eventType) && event.remove[eventType]){
			return event.remove[eventType](node, func);
		}
		if (!event.Handler.has(node)){
			return false;
		}
		return event.Handler.get(node).removeEvent(eventType, func);
	}.makeArrayCallable([0, 1, 2]),
	
	
	/**
	 * Object event.FunctionWrapper
	  *@name: event.FunctionWrapper
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description:
	 * @parameter:
	 *	node: the node to handle
	 */
	FunctionWrapper: oo.Base.extend(function FunctionWrapper(event, func, wrapper){
		this.originalEvent = event;
		this.originalFunction = func;
		this.wrapperFunction = wrapper;
	}).implement({
		equal: function equal(wrapper){
			if (!(wrapper instanceof event.FunctionWrapper)){
				return false;
			}
			return this.originalEvent === wrapper.originalEvent && this.originalFunction === wrapper.originalFunction;
		},
		call: function call(thisArg){
			var args = Array.prototype.slice.call(arguments, 1);
			return this.wrapperFunction.apply(thisArg, args);
		}
	}),
	
	/**
	 * Function event.fire
	 * @name: event.fire
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description:
	 * @parameter:
	 *	node:
	 *	event:
	 *	cancelBubble:
	 *
	 */
	fire: function fireEvent(node, event, cancelBubble){
		if (!node){
			node = document;
		}
		if (!event){
			event = "click";
		}
		if (!cancelBubble){
			cancelBubble = false;
		}
		if (document.createEvent){
			var ev = event;
			if (typeof(event) === "string"){
				ev = document.createEvent("UIEvents");
				ev.initEvent(event,true,true);
			}
			
			ev.cancelBubble = cancelBubble;
			return node.dispatchEvent(ev);
		}
		if (node.fireEvent){
			if (typeof (event) === "string"){
				node.fireEvent("on" + event);
			}
			else {
				node.fireEvent("on" + event.type, event);
				event.cancelBubble = cancelBubble;
			}
			return true;
		}
		return false;
	},
	
	/**
	 * Function event.fireOwn
	 * @name: event.fireOwn
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description:
	 * @parameter:
	 *	node:
	 *	eventType:
	 *	ev:
	 *	cancelBubble:
	 *
	 */
	fireOwn: function fireOwnEvent(node, eventType, ev, cancelBubble){
		var ret = true;
		var handler = event.Handler.get(node);
		if (handler){
			if (handler._events[eventType]){
				if (!ev){
					if (document.createEvent){
						ev = document.createEvent("UIEvents");
						ev.initEvent(eventType, true, true);
						node.dispatchEvent(ev);
					}
				}
				ret = handler._events[eventType].func(ev, node);
			}
		}
		if (!cancelBubble && node.parentNode){
			ret = ret && event.fireOwn(node.parentNode, eventType, ev);
		}
		return ret;
	},
	
	/**
	 * Function event.propagateByPosition
	 * @name: event.propagateByPosition
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 15.11.2012
	 * @description: propagaties the event by the position of the mouse position. This function has to run in the context of the node that fired the event initially.
	 *     Best way is to register this function direcly as event listener.
	 *     Until now only event listener registered with this framework are considered by propagation - native methods do not work due to a bug in FF...
	 * @parameter:
	 *	ev:
	 */
	propagateByPosition: function propagateByPosition(ev){
		var oldDisplay = this.style.display;
		this.style.display = "none";
		event.fireOwn(event.getElementFromMousePosition(ev), ev.type, ev);
		this.style.display = oldDisplay;
	},

	/**
	 * Function event.onWindowLoad
	 * @name: event.onWindowLoad
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description:
	 * @parameter:
	 *	func:
	 *	win:
	 */
	onWindowLoad: function onWindowLoad(func, win){
		if (!win){
			win = window;
		}
		else {
			win = DOM.getWindow(win);
		}
		if (/loaded|complete/.test(win.document.readyState)){
			func();
		}
		else {
			event.add(win, "load", func, false);
		}
	},
	
	/**
	 * Function event.onDOMReady
	 * @name: event.onDOMReady
	 * @version: 1.0
	 * @author: Korbinian Kapsner
	 * @last modify: 09.03.2010
	 * @description:
	 * @parameter:
	 *	func:
	 *	doc:
	 */
	onDOMReady: function onDOMReady(func, doc){
		doc = DOM.getDocument(doc);
		var win = DOM.getWindow(doc);
		if (/loaded|complete/.test(win.readyState)){
			func.apply(doc);
		}
		else {
			var eventFunction = function(){
				event.remove(doc, "DOMContentLoaded", eventFunction);
				event.remove(win, "load", eventFunction);
				func.apply(doc, arguments);
			};
			event.add(doc, "DOMContentLoaded", eventFunction);
			event.add(win, "load", eventFunction);
			if (!doc.DOMReadyBehaviorAdded && is.ie && is.version < 9){
				//ajax.preload(kkjs.url.htc + "onDOMReady.htc"); //seems to be unneccessary
				//document.write("<script type=\"text/javascript\" defer>require('kkjs.event').fireOwn(require('kkjs.DOM').window.document, 'DOMContentLoaded')<\/script>");
				document.getElementsByTagName("HTML")[0].style.behavior += " url(" + kkjs.url.htc + "onDOMReady.htc)";
				doc.DOMReadyBehaviorAdded = true;
			}
		}
	},
	
	/**
	 * Function event.getMousePosition
	 * @name: event.getMousePosition
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: returns the mousepoisition within den document of an event
	 * @parameter:
	 *	ev:
	 * @return value: an object with attributes left and top
	 */
	getMousePosition: function getMousePosition(ev, scroll, relative){
		if (!ev){
			if (window.event){
				ev = window.event;
			}
			else {
				return false;
			}
		}
		if (!relative){
			relative = {left: 0, top: 0};
		}
		scroll = (scroll !== false)? true: false;
		if (scroll){
			if (is.key(ev, "pageX")){
				return new kMath.Position(
					ev.pageX - relative.left,
					ev.pageY - relative.top
				);
			}
			scroll = kkjsscroll.getPosition();
			var HTMLOffset = [
				document.body.clientLeft + document.body.parentNode.clientLeft,
				document.body.clientLeft + document.body.parentNode.clientTop
			];
			return new kMath.Position(
				ev.clientX + scroll.left - HTMLOffset[0] - relative.left,
				ev.clientY + scroll.top - HTMLOffset[1] - relative.top
			);
		}
		else {
			return new kMath.Position(
				ev.clientX - relative.left,
				ev.clientY - relative.top
			);
		}
	},
	
	/**
	 * Function event.getElementFromMousePosition
	 * @name: event.getElementFromMousePosition
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: returns the node the mouse is over
	 * @parameter:
	 *	ev:
	 * @return value: the node
	 * @problems:
	 *	IE: if you are over window-scrollbar the function returns an empty object
	 *	Safari + Opera: needs pageX/Y
	 */
	getElementFromMousePosition: function getElementFromMousePosition(ev){
		if (document.elementFromPoint){
			var pos = {x: ev.clientX, y: ev.clientY};
			if (is.safari || is.opera){
				pos = {x: ev.pageX, y: ev.pageY};
			}
			
			var node = document.elementFromPoint(pos.x, pos.y);
			if (node && node.nodeType === 3){
				node = node.parentNode;
			}
			return node;
		}
		return null;
	},
	
	/**
	 * Function event.supported
	 * @name: event.supported
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @thanks to: http://perfectionkills.com/detecting-event-support-without-browser-sniffing/
	 * @description: detects whether the used browser supports the event given by the parameter eventName
	 * @parameters:
	 *	eventName:
	 */
	supported: (function(){
		var tags = {
			"select":"input","change":"input",
			"submit":"form","reset":"form",
			"error":"img","load":"img","abort":"img"
		};
		var supported = {};

		function eventSupported(eventName){
			if (/[^a-z0-9_\-]/i.test(eventName)){
				return false;
			}
			if (supported.hasOwnProperty(eventName)){
				return supported[eventName];
			}
			
			var el = document.createElement(tags[eventName]|| "div");
			eventName = "on" + eventName;
			var sup = is.key(el, eventName);
			if (!sup){
				el.setAttribute(eventName, "return");
				sup = is.key(el, eventName) && is["function"](el[eventName]);
			}
			supported[eventName] = sup;
			return sup;
		}
		return eventSupported;
	})(),
};


// some special Events
var saveKeyCodes = {
	BACK_SPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17, ALT: 18, PAUSE: 19, CAPS_LOCK: 20, ESCAPE: 27,
	SPACE: 32, PAGE_UP: 33, PAGE_DOWN: 34, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, INSERT: 45, DELETE: 46,
	F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123,
	//wrong in Safari/Chrome: NUM_LOCK: 144,
	SCOLL_LOCK: 145,
	//WIN: {oldOpera: 219, rest: 91} CONTEXT_MENU: {oldOpera: 57351, rest: 93}
	WIN: 91, CONTEXT_MENU: 93z
};
event.keyCodes = saveKeyCodes;

event.add.key = function addKeyEvent(node, key, eventType, func, amAnfang){
	var wrapper = null;
	switch (eventType){
		case "press":
			if (key.length === 1 && key !== "\t\x08"){
				wrapper = function(ev, node){
					/*jshint validthis: true*/
					if (String.fromCharCode(ev.charCode || ev.keyCode) === key){
						//ev.key = key;
						return func.call(this, ev, node);
					}
					return null;
				};
			}
			else {
				throw new Error("Keypress is not detectable for non printable keys in some browsers.");
			}
			break;
		case "down":
		case "up":
			key = key.replace(/([a-z])([A-Z])/, "$1_$2").toUpperCase();
			if (key.length === 1){
				if (/^[A-Z0-9]$/.test(key)){
					wrapper = function(ev, node){
						/*jshint validthis: true*/
						if (String.fromCharCode(ev.keyCode).toUpperCase() === key){
							//ev.key = key;
							return func.call(this, ev, node);
						}
						return null;
					};
				}
				else {
					throw new Error("Key" + eventType + " is not savely detectable for printable keys excluding a-z and 0-9.");
				}
			}
			else {
				if (key in saveKeyCodes){
					wrapper = function(ev, node){
						/*jshint validthis: true*/
						if (ev.keyCode === saveKeyCodes[key]){
							//ev.key = key;
							return func.call(this, ev, node);
						}
						return null;
					};
				}
				else {
					throw new Error("Key " + key + " is not savely detectable in all browsers.");
				}
			}
			
			break;
		default:
			throw new Error("Unknown key event");
	}
	return event.add(node, "key" + eventType, new event.FunctionWrapper("key" + key + eventType, func, wrapper), amAnfang);
}.makeArrayCallable([0, 1, 2, 3]);
event.remove.key = function removeKeyEvent(node, key, eventType, func){
	return event.remove(node, "key" + eventType, new event.FunctionWrapper("key" + key + eventType, func));
}.makeArrayCallable([0, 1, 2, 3]);

event.add.advancedChange = function addAdvancedChangeEvent(node, func, amAnfang, delay){
	if (!delay){
		delay = 200;
	}
	var timeout = false;
	var oldValue = node.value || null;
	function wrapper(ev, node){
		if (timeout){
			window.clearTimeout(timeout);
		}
		timeout = window.setTimeout(function(){
			timeout = false;
			if (oldValue === null || oldValue !== node.value){
				func.call(node, ev, node);
				oldValue = node.value || null;
			}
		}, delay);
	}
	var timedChange = new event.FunctionWrapper("advancedChange", func, wrapper);
	var normalChange = new event.FunctionWrapper("advancedChange", func, func);
	
	event.add(node, ["change", "mouseup", "drop", "paste"], normalChange, amAnfang);
	return event.add(node, ["keydown", "keyup", "keypress"], timedChange, amAnfang);
};
event.remove.advancedChange = function removeAdvancedChangeEvent(node, func){
	return event.remove(
		node,
		["change", "mouseup", "drop", "paste", "keydown", "keyup", "keypress"],
		new event.FunctionWrapper("advancedChange", func)
	);
};


// compatibilty issues
event.add.mouseenter = function addMouseEnterEvent(node, func, amAnfang){
	if (event.supported("mouseenter")){
		return event.add(node, "mouseenter", func, amAnfang);
	}
	
	function wrapper(ev, node){
		/*jshint validthis: true*/
		if (!node.contains(ev.relatedTarget)){
			func.call(this, ev, node);
		}
	}
	return event.add(node, "mouseover", new event.FunctionWrapper("mouseenter", func, wrapper), amAnfang);
};
event.remove.mouseenter = function removeMouseEnterEvent(node, func){
	if (event.supported("mouseenter")){
		return event.remove(node, "mouseenter", func);
	}
	return event.remove(node, "mouseover", new event.FunctionWrapper("mouseenter", func));
};
event.add.mouseleave = function addMouseLeaveEvent(node, func, amAnfang){
	if (event.supported("mouseleave")){
		return event.add(node, "mouseleave", func, amAnfang);
	}
	
	function wrapper(ev, node){
		/*jshint validthis: true*/
		if (!node.contains(ev.relatedTarget)){
			func.call(this, ev, node);
		}
	}
	return event.add(node, "mouseout", new event.FunctionWrapper("mouseleave", func, wrapper), amAnfang);
};
event.remove.mouseleave = function removeMouseLeaveEvent(node, func){
	if (event.supported("mouseleave")){
		return event.remove(node, "mouseleave", func);
	}
	return event.remove(node, "mouseout", new event.FunctionWrapper("mouseleave", func));
};

event.add.mousewheel = function addMouseWheelEvent(node, func, amAnfang){
	if (event.supported("mousewheel")){
		return event.add(node, "mousewheel", func, amAnfang);
	}
	if (is.ff){
		return event.add(node, "DOMMouseScroll", func, amAnfang);
	}
	return false;
};
event.remove.mousewheel = function addMouseWheelEvent(node, func){
	if (event.supported("mousewheel")){
		return event.remove(node, "mousewheel", func);
	}
	if (is.ff){
		return event.remove(node, "DOMMouseScroll", func);
	}
	return false;
};

event.add.hashchange = function addHashChangeEvent(node, func, amAnfang){
	var handler = event.Handler.get(node);
	if (is.ie && is.version < 8 && !(handler._events.hashchange)){
		var oldURL = location.toString();
		window.setInterval(function(){
			if (location.toString() !== oldURL){
				event.fireOwn(node, "hashchange", {type: "hashchange", oldURL: oldURL, newURL: location.toString()});
				oldURL = location.toString();
			}
		}, 200);
	}
	handler.addEvent("hashchange", func, amAnfang);
};

event.add.contextmenu = function addContextMenuEvent(node, func, amAnfang){
	if (event.supported("contextmenu")){
		return event.add(node, "contextmenu", func, amAnfang);
	}
	event.add(node, "mousedown", new event.FunctionWrapper("contextmenu", func, function(ev, node){
		if (ev.button === 2){
			return func.call(this, ev, node);
		}
		return null;
	}), amAnfang);
	return event.add(document, "keypress", new event.FunctionWrapper("contextmenu", func, function(ev){
		if (ev.keyCode === saveKeyCodes.CONTEXT_MENU){
			return func.call(this, ev, node);
		}
		return null;
	}), amAnfang);
};
event.remove.contextmenu = function removeContextMenuEvent(node, func){
	if (event.supported("contextmenu")){
		return event.remove(node, "contextmenu", func);
	}
	event.remove(node, "mousedown", new event.FunctionWrapper("contextmenu", func));
	return event.remove(node, "keypress", new event.FunctionWrapper("contextmenu", func));
};

if (typeof exports !== "undefined"){
	for (var i in event){
		if (event.hasOwnProperty(i)){
			exports[i] = event[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.event = event;
}
})();
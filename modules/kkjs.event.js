(function(){
"use strict";

/**
 * Object event
 * @super Object
 * @author Korbinian Kapsner
 * @version 1.0
 */

var oo = require("kkjs.oo");
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
	 * Constructor event.Handler
	  *@name: event.Hanlder
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description:
	 * @parameter:
	 *	node: the node to handle
	 */
	Handler: oo.Base.extend(function EventHandler(node){
		this._events = {};
		this.node = node;
	}).implement({
		getAllEvents: function(type){
			return this._events[type] || [];
		},
		addEvent: function(type, func, amAnfang){
			
			if (typeof func !== "function" && !(func instanceof event.FunctionWrapper)){
				return this;
			}
			// if listener is already added
			if (this.getEventIndex(type, func) !== false){
				return this;
			}
			
			// if this is the first listener of that event-type
			if (!(type in this._events)){
				this._events[type] = [];
				this._events[type].func = (function(eventObj){
					eventObj = event._unifyEvent(eventObj, this.node);
					var currRet, ret = null;
					if (this._events[type]){
						var toCall = this._events[type].slice(0);
						for (var i = 0; i < toCall.length; i++){
							try {
								currRet = toCall[i].call(this.node, eventObj, this.node);
							}
							catch (e){
								if (window.console && window.console.log){
									window.console.log(e.message);
									window.console.error(e);
									if (e.stack){
										window.console.log(e.stack);
									}
								}
							}
							if (currRet !== null){
								if (ret === null){
									ret = currRet;
								}
								else {
									ret = ret && currRet;
								}
							}
						}
					}
					return ret;
				}).bind(this);
				event.addEvent(this.node, type, this._events[type].func);
			}
			
			// add listener at correct position
			if (!amAnfang){
				this._events[type].push(func);
			}
			else{
				this._events[type].unshift(func);
			}
			return this;
		},
		removeEvent: function(type, func){
			if (this._events[type]){
				var i = this.getEventIndex(type, func);
				if (i !== false){
					this._events[type].splice(i, 1);
				}
				if (!this._events[type].length){
					event.removeEvent(this.node, type, this._events[type].func);
					delete this._events[type];
				}
			}
			return this;
		},
		getEventIndex: function(type, func){
			var functs = this._events[type];
			if (functs){
				for (var i = functs.length - 1; i >= 0; i--){
					if (functs[i] === func || (functs[i].equal && functs[i].equal(func))){
						return i;
					}
				}
			}
			return false;
		},
		fireEvent: function(eventType, ev){
			if (!ev){
				if (document.createEvent){
					ev = document.createEvent("UIEvents");
					ev.initEvent(eventType, true, true);
					// node.dispatchEvent(ev);
				}
			}
			return this._events[eventType].func(ev, this.node);
		}
	}).implementStatic({
		has: function hasHandler(node){
			return !!node["kkjs:eventHandler"];
		},
		get: function getHandler(node){
			if (!node["kkjs:eventHandler"]){
				node["kkjs:eventHandler"] = new event.Handler(node);
			}
			return node["kkjs:eventHandler"];
		}
	}),
	
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
	}.makeArrayCallable([0, 1]),
	
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
						// node.dispatchEvent(ev);
					}
				}
				ret = handler._events[eventType].func(ev, node);
			}
		}
		if (!cancelBubble && node.parentNode){
			ret = ret && event.fireOwn(node.parentNode, eventType, ev);
		}
		return ret;
	}.makeArrayCallable([0, 1]),
	
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
		if (/loaded|complete/.test(doc.readyState)){
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
			if (typeof ev.pageX !== "undefined"){
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
	 */
	getElementFromMousePosition: function getElementFromMousePosition(ev){
		if (document.elementFromPoint){
			var node = document.elementFromPoint(ev.clientX, ev.clientY);
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
			
			var el = document.createElement(tags[eventName] || "div");
			eventName = "on" + eventName;
			var sup = eventName in el;
			if (!sup){
				el.setAttribute(eventName, "return");
				sup = !!el[eventName] && (typeof el[eventName] === "function");
			}
			supported[eventName] = sup;
			return sup;
		}
		return eventSupported;
	})(),
	
	
	/****private functions*****/
	_eventProperties: {
		CAPTURING_PHASE: 1,
		AT_TARGET: 2,
		BUBBLING_PHASE: 3,
		
		target: {
			toCall: function(){
				if (!this.target){
					this.target = this.srcElement;
				}
				if (this.target && this.target.nodeType === 3){
					this.target = this.target.parentNode;
				}
			}
		},
		currentTarget: {
			toCall: function(node){
				if (!this.currentTarget && node){
					this.currentTarget = node;
				}
				if (this.currentTarget && this.currentTarget.nodeType === 3){
					this.currentTarget = this.currentTarget.parentNode;
				}
			}
		},
		which: {
			reqireType: /key/i,
			toCall: function(){
				if (typeof this.which === "undefined"){
					this.which = this.keyCode || this.charCode;
				}
			}
		},
		button: {
			requreType: /mouse/i,
			toCall: function(){
				if (!("button" in this)){
					this.button = this.which;
				}
			}
		},
		wheelDelta: {
			requireType: /mouse(wheel|scroll)/i,
			toCall: function(){
				if (!("detail" in this) && ("wheelDelta" in this)){
					this.detail = this.wheelDelta / -40;
				}
				if (("detail" in this) && !("wheelDelta" in this)){
					this.wheelDelta = this.detail * -40;
				}
			}
		},
		eventPhase: 3,
		bubbles: true,
		cancelable: true,
		timestamp: 0,
		
		stopPropagation: function(){
			if (this.cancelable){
				this.cancelBubble = true;
			}
		},
		preventDefault: function(){
			this.returnValue = false;
		}
	},
	_unifyEvent: function unifyEvent(event, node){
		if (!event){
			event = window.event || {};
		}
		
		for (var index in this._eventProperties){
			if (this._eventProperties.hasOwnProperty(index)){
				try {
					var value = this._eventProperties[index];
					if (value.toCall){
						if (!value.requireType || value.requireType.test(event.type)){
							value.toCall.call(event, node);
						}
					}
					else{
						if (!(index in event)){
							event[index] = value;
						}
					}
				}
				catch(e){}
			}
		}
		
		return event;
	},
	addEvent: function addEvent(node, event, func, useCapture){
		if (!useCapture){
			useCapture = false;
		}
		
		if (node.addEventListener){
			return node.addEventListener(event, func, useCapture);
		}
		if (node.attachEvent){
			return node.attachEvent("on" + event, func);
		}
		return false;
	},
	removeEvent: function removeEvent(node, event, func, useCapture){
		if (!useCapture){
			useCapture = false;
		}
		
		if (node.addEventListener){
			return node.removeEventListener(event, func, useCapture);
		}
		if (node.attachEvent){
			return node.detachEvent("on" + event, func);
		}
		return false;
	}
};


// some special Events
var saveKeyCodes = {
	BACK_SPACE: 8, TAB: 9, ENTER: 13, SHIFT: 16, CTRL: 17, ALT: 18, PAUSE: 19, CAPS_LOCK: 20, ESCAPE: 27,
	SPACE: 32, PAGE_UP: 33, PAGE_DOWN: 34, END: 35, HOME: 36, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, INSERT: 45, DELETE: 46,
	F1: 112, F2: 113, F3: 114, F4: 115, F5: 116, F6: 117, F7: 118, F8: 119, F9: 120, F10: 121, F11: 122, F12: 123,
	//wrong in Safari/Chrome: NUM_LOCK: 144,
	SCOLL_LOCK: 145,
	//WIN: {oldOpera: 219, rest: 91} CONTEXT_MENU: {oldOpera: 57351, rest: 93}
	WIN: 91, CONTEXT_MENU: 93,
	NUM0: 96, NUM1: 97, NUM2: 98, NUM3: 99, NUM4: 100, NUM5: 101, NUM6: 102, NUM7: 103, NUM8: 104, NUM9: 105 
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

event.add.wheel = event.add.mousewheel = function addMouseWheelEvent(node, func, amAnfang){
	if (event.supported("wheel")){
		return event.add(node, "wheel", func, amAnfang);
	}
	if (event.supported("mousewheel")){
		return event.add(node, "mousewheel", func, amAnfang);
	}
	// only old firefox left over
	return event.add(node, "MozMousePixelScroll", func, amAnfang);
};
event.remove.wheel = event.remove.mousewheel = function addMouseWheelEvent(node, func){
	if (event.supported("wheel")){
		return event.remove(node, "wheel", func, amAnfang);
	}
	if (event.supported("mousewheel")){
		return event.remove(node, "mousewheel", func);
	}
	// only old firefox left over
	return event.remove(node, "MozMousePixelScroll", func);
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
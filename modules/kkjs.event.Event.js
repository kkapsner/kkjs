(function(){

"use strict";


/**
 * Constructor event.Event
  *@name: event.Event
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 26.01.2013
 * @description:
 * @parameter:
 *	node: the node to handle
 */

var event = require("kkjs.event");

event.Event = oo.Base.extend(function Event(ev){
	if (!ev){
		ev = window.event || {type: "click"};
	}
	if (is.string(ev)){
		ev = {type: ev};
	}
	this._originalEvent = ev;
}).implement({
	_originalEvent: null,
	
	_defaultPrevented: false,
	isDefaultPrevented: function(){
		return this._defaultPrevented;
	},
	preventDefault: function(){
		this._defaultPrevented = true;
		if (this._originalEvent){
			if (this._originalEvent.preventDefault){
				this._originalEvent.preventDefault();
			}
			else {
				this._originalEvent.returnValue = false;
			}
		}
	},
	
	cancelable: true,
	_propagationStopped: false,
	isPropagationStopped: function(){
		return this._propagationStopped;
	},
	stopPropagation: function(){
		if (this.cancelable){
			this._propagationStopped = true;
			if (this._originalEvent){
				if (this._originalEvent.stopPropagation){
					this._originalEvent.stopPropagation();
				}
				else {
					this._originalEvent.cancelBubble = true;
				}
			}
		}
	},
	
	type: null,
	target: null,
	currentTarget: null
}).implementStatic({
	create: function(ev){
		if (!ev){
			ev = window.event || {type: "click"};
		}
		var event = new event.Event(ev.type);
		event._originalEvent = ev;
		[].forEach(function(name){
			if (name in ev){
				event[name] = ev[name];
			}
		});
	}
});

if (typeof exports !== "undefined"){
	module.exports = event.Event;
}
else if (typeof kkjs !== "undefined"){
	kkjs.event.Event = event.Event;
}

})();
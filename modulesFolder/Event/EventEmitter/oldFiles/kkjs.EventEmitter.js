(function(){
"use strict";

var EventEmitter = require("./kkjs.oo").Base.extend().implement({
	emit: function(eventType){
		if (this.eventParent && this.eventParent instanceof EventEmitter){
			this.eventParent.emit.apply(this.eventParent, arguments);
		}
		if (eventType === "error" && (!this.hasListenerFor("error") || this._events.error.length === 0)){
			var error = arguments[1];
			if (error instanceof Error) {
				throw error;
			}
			else {
				if (typeof error !== "string" && !(error instanceof String)){
					error = "Uncaught, unspecified 'error' event.";
				}
				throw new Error(error);
			}
			return false;
		}
		var args = Array.prototype.slice.call(arguments, 1);
		if (typeof this["on" + eventType] === "function"){
			this["on" + eventType].apply(this, args);
		}
		if (this._events && this._events[eventType]){
			var listeners = this._events[eventType].slice(0);
			for (var i = 0; i < listeners.length; i++){
				try {
					listeners[i].apply(this, args);
				}
				catch(e){
					if (window.console && console.log){
						console.log(e);
					}
				}
			}
			return true;
		}
		return false;
	},
	on: function(eventType, eventListener){
		if (!(typeof eventListener === "function" || eventListener instanceof Function)){
			throw new Error("eventListener must be an function");
		}
		this.emit("newListener", eventType, eventListener);
		if (!this._events){
			this._events = {};
		}
		if (!this._events[eventType]){
			this._events[eventType] = [];
		}
		this._events[eventType].push(eventListener);
	}.makeArrayCallable([0, 1]),
	onOnce: function(eventType, eventListener){
		this.on(eventType, function wrapper(){
			this.removeListener(eventType, wrapper);
			eventListener.apply(this, arguments);
		});
	}.makeArrayCallable([0, 1]),
	listeners: function(eventType){
		if (!this._events){
			this._events = {};
		}
		if (!this._events[eventType]){
			this._events[eventType] = [];
		}
		return this._events[eventType];
	},
	hasListenerFor: function(eventType){
		return !!(this._events && this._events[eventType]);
	},
	removeListener: function(eventType, eventListener){
		if (this._events && this._events[eventType]){
			var eventList = this._events[eventType];
			for (var i = 0; i < eventList.length; i++){
				if (eventListener === eventList[i]){
					eventList.splice(i, 1);
					if (!eventList.length){
						delete this._events[eventType];
					}
					break;
				}
			}
		}
		return this;
	},
	removeAllListeners: function(eventType){
		if (!eventType){
			delete this._events;
		}
		if (this._events && this._events[eventType]){
			delete this._events[eventType];
		}
		return this;
	}
});

if (typeof exports !== "undefined"){
	module.exports = EventEmitter;
}
else if (typeof kkjs !== "undefined"){
	kkjs.EventEmitter = EventEmitter;
}
})();
(function(){
	"use strict";
	
	/**
	 * Parent class for other classes that want to emit events.
	 */
	
	var oo = require("./kkjs.oo");
	
	/**
	 * Object EventEmitter
	 * @name: EventEmitter
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: Super class for event driven classes
	 */
	
	var EventEmitter = oo.Base.extend().implement({
		
		emit: function(eventType){
			/**
			 * Function EventEmitter.emit
			 * @name: EventEmitter.emit
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: Emits an event on the instance. If the instance has a eventParent-Attribut
			 *	that is also an EventEmitter the event bubbles.
			 * @parameter:
			 *	eventType: the specific fired event type
			 *	argument1: additional arguments passed to the event listener
			 *	arugment2: ...
			 *	...
			 * @return value: The instance of the EventEmitter.
			 */
			
			if (this.eventParent && this.eventParent instanceof EventEmitter){
				this.eventParent.emit.apply(this.eventParent, arguments);
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
			}
			return this;
		}.makeArrayCallable([0], {mapReturnValues: false}),
		
		on: function(eventType, eventListener){
			/**
			 * Function EventEmitter.on
			 * @name: EventEmitter.on
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: Registers an event listener on the instance. Every time a
			 *	listener is registered the "newListener"-event is fired.
			 *	
			 *	Both parameter can be arrays. Then the .on() method will be called for
			 *	every element in the arrays. E.g.:
			 *		INSTANCE.on(["change", "undo"], [func1, func2]);
			 *			<-->
			 *		INSTANCE.on("change", func1);
			 *		INSTANCE.on("change", func2);
			 *		INSTANCE.on("undo", func1);
			 *		INSTANCE.on("undo", func2]);
			 * @parameter:
			 *	eventType: The specific event type the listener is registered to.
			 *	eventListener: The listener function to be registered
			 * @return value: The instance of the EventEmitter.
			 */
			
			if (!(
				typeof eventListener === "function" ||
				eventListener instanceof Function
			)){
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
			
			return this;
		}.makeArrayCallable([0, 1], {mapReturnValues: false}),
		
		onOnce: function(eventType, eventListener){
			/**
			 * Function EventEmitter.onOnce
			 * @name: EventEmitter.onOnce
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: Registers a one time event listener on the instance. 
			 *	
			 *	Both parameter can be arrays. Then the .on() method will be called for
			 *	every element in the arrays. E.g.:
			 *		INSTANCE.on(["change", "undo"], [func1, func2]);
			 *			<-->
			 *		INSTANCE.on("change", func1);
			 *		INSTANCE.on("change", func2);
			 *		INSTANCE.on("undo", func1);
			 *		INSTANCE.on("undo", func2]);
			 * @parameter:
			 *	eventType: The specific event type the listener is registered to.
			 *	eventListener: The listener function to be registered
			 * @return value: The instance of the EventEmitter.
			 */
			
			this.on(eventType, function wrapper(){
				/* wrapper function that removes the listener before first call */
				this.removeListener(eventType, wrapper);
				eventListener.apply(this, arguments);
			});
			return this;
		}.makeArrayCallable([0, 1], {mapReturnValues: false}),
		
		listeners: function(eventType){
			/**
			 * Function EventEmitter.listeners
			 * @name: EventEmitter.listeners
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: Returns all listeners for a specific event type.
			 *	By modifying the returned array the actual listener queue is modified.
			 * @parameter:
			 *	eventType: The specific event type for that all listeners should be
			 *		returned
			 * @return value: Array containing all listeners.
			 */
			
			if (!this._events){
				this._events = {};
			}
			if (!this._events[eventType]){
				this._events[eventType] = [];
			}
			return this._events[eventType];
		},
		
		hasListenerFor: function(eventType){
			/**
			 * Function EventEmitter.hasListenerFor
			 * @name: EventEmitter.hasListenerFor
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: Checks if the instance has a registered listener for the
			 *	specified event type.
			 * @parameter:
			 *	eventType: The specific event type that is checked
			 * @return value: Boolean if a listener is registered.
			 */
			
			return !!(
				this._events &&
				this._events[eventType] &&
				this._events[eventType].length
			);
		},
		
		removeListener: function(eventType, eventListener){
			/**
			 * Function EventEmitter.removeListener
			 * @name: EventEmitter.removeListener
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: A specific event listener.
			 * @parameter:
			 *	eventType: The specific event type in which the listener is searched.
			 *	eventListener: The specific listener to be removed.
			 * @return value: The instance of the EventEmitter.
			 */
			
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
			/**
			 * Function EventEmitter.removeAllListeners
			 * @name: EventEmitter.removeAllListeners
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: Removes all event listener
			 * @parameter:
			 *	[eventType: The specific event type for that all listeners should be
			 *		removed. If this parameter is not provided or falsy all listeners
			 *		for all event types will get removed.]
			 * @return value: The instance of the EventEmitter.
			 */
			
			if (!eventType){
				delete this._events;
			}
			if (this._events && this._events[eventType]){
				delete this._events[eventType];
			}
			return this;
		}
	});
	
	
	// exporting variable to the right environment
	if (typeof exports !== "undefined" && typeof module !== "undefined"){
		module.exports = EventEmitter;
	}
	else if (typeof kkjs !== "undefined"){
		kkjs.EventEmitter = EventEmitter;
	}
}());
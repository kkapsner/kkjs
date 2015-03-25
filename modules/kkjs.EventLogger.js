(function(){
	"use strict";
	
	/**
	 * Mixin to log events.
	 */
	
	var oo = require("./kkjs.oo");
	var EventEmitter = require("./kkjs.EventEmitter");
	
	/**
	 * Object EventLogger
	 * @name: EventLogger
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: Mixin to log events.
	 */
	
	var EventLogger = oo.Base.extend().implement({
		
		emit: function(eventType){
			if (this._eventLogger){
				var This = this;
				var args = arguments;
				this._eventLogger.forEach(function(logger){
					logger.apply(This, args);
				});
			}
			return EventEmitter.prototype.emit.apply(this, arguments);;
		}.makeArrayCallable([0], {mapReturnValues: false}),
		
		onEvent: function(eventListener){
			/**
			 * Function EventLogger.onEvent
			 * @name: EventLogger.onEvent
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: Registers an listener for any event.
			 * @parameter:
			 *	eventListener: The listener function to be registered
			 * @return value: The instance of the EventLogger.
			 */
			if (!(
				typeof eventListener === "function" ||
				eventListener instanceof Function
			)){
				throw new Error("eventListener must be an function");
			}
			if (!this._eventLogger){
				this._eventLogger = [];
			}
			this._eventLogger.push(eventListener);
			
			return this;
		}.makeArrayCallable([0, 1], {mapReturnValues: false}),
	});
	
	// exporting variable to the right environment
	if (typeof exports !== "undefined" && typeof module !== "undefined"){
		module.exports = EventLogger;
	}
	else if (typeof kkjs !== "undefined"){
		kkjs.EventLogger = EventLogger;
	}
}());
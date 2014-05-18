(function(){
	"use strict";
	
	/**
	 * Parent class for other classes that want to make/fulfill/deny promises.
	 */
	
	var oo = require("./kkjs.oo");
	
	/**
	 * Object Promise
	 * @name: Promise
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: Super class for event driven classes
	 */
	
	var Promise = oo.Base.extend().implement({
		
		fulfill: function(promiseType){
			/**
			 * Function Promise.fulfill
			 * @name: Promise.fulfill
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: Fulfills a specific promise type.
			 * @parameter:
			 *	promiseType: the specific fulfilled promise
			 * @return value: The instance of the Promise.
			 */
			
			if (this._promises && this._promises[promiseType]){
				if (this._promises[promiseType].status !== "pending"){
					return;
				}
				var listeners = this._promises[promiseType].promiseListeners.slice(0);
				this._promises[promiseType].status = "fulfilled";
				for (var i = 0; i < listeners.length; i++){
					try {
						listeners[i].apply(this);
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
		
		deny: function(promiseType){
			/**
			 * Function Promise.deny
			 * @name: Promise.deny
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: Denys a specific promise type.
			 * @parameter:
			 *	promiseType: the specific denied promise
			 * @return value: The instance of the Promise.
			 */
			
			if (this._promises && this._promises[promiseType]){
				if (this._promises[promiseType].status !== "pending"){
					return;
				}
				var listeners = this._promises[promiseType].denyListeners.slice(0);
				this._promises[promiseType].status = "denied";
				for (var i = 0; i < listeners.length; i++){
					try {
						listeners[i].apply(this);
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
		
		promise: function(promiseType, promiseListener, denyListener){
			/**
			 * Function Promise.promise
			 * @name: Promise.promise
			 * @author: Korbinian Kapsner
			 * @version: 1.0
			 * @description: Registers an promise listener on the instance.
			 *	
			 *	All three parameter can be arrays. Then the .promise() method will be
			 *	called for every element in the arrays. E.g.:
			 *		INSTANCE.promise(["change", "undo"], [func1, func2], [func3, func4]);
			 *			<-->
			 *		INSTANCE.promise("change", func1, func3);
			 *		INSTANCE.promise("change", func2, func3);
			 *		INSTANCE.promise("undo", func1, func3);
			 *		INSTANCE.promise("undo", func2, func3);
			 *		INSTANCE.promise("change", func1, func4);
			 *		INSTANCE.promise("change", func2, func4);
			 *		INSTANCE.promise("undo", func1, func4);
			 *		INSTANCE.promise("undo", func2, func4);
			 * @parameter:
			 *	promiseType: The specific promise type the listener is registered to.
			 *	promiseListener: The listener function to be registered on fulfilling.
			 *	denyListener: The listener function to be registered on denying.
			 * @return value: The instance of the Promise.
			 */
			
			if (!this._promises){
				this._promises = {};
			}
			if (!this._promises[promiseType]){
				this._promises[promiseType] = {
					status: "pending",
					promiseListeners: [],
					denyListeners: []
				};
			}
			
			switch (this._promises[promiseType].status){
				case "pending":
					if (promiseListener){
						this._promises[promiseType].promiseListeners.push(promiseListener);
					}
					if (denyListener){
						this._promises[promiseType].denyListeners.push(denyListener);
					}
					break;
				case "fulfilled":
					if (promiseListener){
						promiseListener.call(this);
					}
					break;
				case "denied":
					if (denyListener){
						denyListener.call(this);
					}
					break;
			}
			
			return this;
		}.makeArrayCallable([0, 1, 2], {mapReturnValues: false})
	});
	
	
	// exporting variable to the right environment
	if (typeof exports !== "undefined" && typeof module !== "undefined"){
		module.exports = Promise;
	}
	else if (typeof kkjs !== "undefined"){
		kkjs.Promise = Promise;
	}
}());
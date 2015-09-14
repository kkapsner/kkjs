(function(undefined){
	"use strict";
	
	/**
	 * Parent class for other classes that want to make/fulfill/deny promises.
	 * Compliant with https://promisesaplus.com/
	 */
	
	var oo = require("./kkjs.oo");
	var event = require("./kkjs.event");
	
	var callAsync = (function(){
		if (window.setImmediate){
			return window.setImmediate;
		}
		else {
			if (window.postMessage){
				var syncTest = true;
				var syncMessage = Date.now() + " - " + Math.random();
				kkjs.event.add(window, "message", function listener(ev){
					if (ev.data === syncMessage){
						kkjs.event.remove(window, "message", listener);
						syncTest = false;
					}
				});
				window.postMessage(syncMessage, "*");
				if (syncTest){
					return function(func){
						var args = Array.prototype.slice.call(arguments, 1);
						var syncMessage = Date.now() + " - " + Math.random();
						kkjs.event.add(window, "message", function listener(ev){
							if (ev.data === syncMessage){
								kkjs.event.remove(window, "message", listener);
								func.apply(undefined, args);
							}
						});
						window.postMessage(syncMessage, "*");
					};
				}
			}
			
			return function (func){
				var args = Array.prototype.slice.call(arguments);
				args.splice(1, 0, 0.1);
				window.setTimeout.apply(window, args);
			};
		}
	}());
	
	var deepForEach = (function(){
		function deep(array, func, index){
			array.forEach(function(item, i){
				var currentIndex = index.slice();
				currentIndex.push(i);
				if (Array.isArray(item)){
					deep(item, func, currentIndex);
				}
				else {
					func(item, currentIndex);
				}
			});
		};
		return function deepForEach(array, func){
			deep(array, func, []);
		};
	}());
	
	function setArrayValue(array, index, value){
		if (index.length === 1){
			array[index[0]] = value;
		}
		else {
			if (!array[index[0]]){
				array[index[0]] = [];
			}
			setArrayValue(array[index[0]], index.slice(1), value);
		}
	}
	
	var Resolver = oo.Base.extend(function Resolver(){
		this.resetBindings();
	}).implement({
		bind: function(resolve, reject){
			if (typeof resolve === "function"){
				this.bindings.resolve.push(resolve);
			}
			if (typeof reject === "function"){
				this.bindings.reject.push(reject);
			}
		},
		resetBindings: function(){
			this.bindings = {
				resolve: [],
				reject: []
			}
		},
		resolve: function(value){
			this.bindings.resolve.forEach(function(resolve){
				try {
					resolve(value);
				}
				catch (e){}
			});
			this.resetBindings();
		},
		reject: function(reason){
			this.bindings.reject.forEach(function(reject){
				try {
					reject(reason);
				}
				catch (e){}
			});
			this.resetBindings();
		}
	});
	
	/**
	 * Object PromiseAPus
	 * @name: PromiseAPlus
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: Super class for event driven classes
	 */
	
	var Promise = oo.Base.extend(function Promise(resolver){
		var value = null;
		var reason = null;
		var status = "pending";
		
		this.isFulfilled = function(){return status === "fulfilled";};
		this.isRejected = function(){return status === "rejected";};
		this.isPending = function(){return status === "pending";};
		this.getValue = function(){
			if (status !== "fulfilled"){
				throw new ReferenceError();
			}
			return value;
		};
		this.getReason = function(){
			if (status !== "rejected"){
				throw new ReferenceError();
			}
			return reason;
		};
		this.getStatus = function(){return status;};
		
		var onFulfilleds = [];
		var onRejecteds = [];
		var onFinallys = [];
		
		var promise = this;
		function fulfill(actualValue){
			if (status === "pending"){
				status = "fulfilled";
				value = actualValue;
				onFulfilleds.forEach(function(onFulfilled){
					onFulfilled(value);
				});
				onFinallys.forEach(function(onFinally){
					onFinally(value);
				});
			}
		}
		function reject(actualReason){
			if (status === "pending"){
				status = "rejected";
				reason = actualReason;
				onRejecteds.forEach(function(onRejected){
					onRejected(reason);
				});
				onFinallys.forEach(function(onFinally){
					onFinally(value);
				});
			}
		}
		function resolve(value){
			if (status === "pending"){
				if (value === promise){
					return reject(new TypeError());
				}
				else if (value instanceof Promise){
					switch (value.getStatus()){
						case "pending":
							value["done"](fulfill, reject);
							break;
						case "fulfilled":
							fulfill(value.getValue());
							break;
						case "rejected":
							reject(value.getReason());
							break;
					}
				}
				else if (typeof value === "object" || typeof value === "function"){
					try {
						var then = value.then
					}
					catch (e){
						return reject(e);
					}
					if (typeof then === "function"){
						try {
							x.then(resolve, reject);
						}
						catch (e){
							return reject(e);
						}
					}
					else {
						fulfill(value);
					}
				}
				else {
					fulfill(value);
				}
			}
		}
		
		if (typeof resolver === "function"){
			resolver(resolve, reject);
		}
		else if (resolver instanceof Resolver) {
			resolver.bind(resolve,reject);
		}
		else {
			throw new TypeError();
		}
		
		this.done = function(onFulfilled, onRejected){
			this["catch"](onRejected);
			if (typeof onFulfilled === "function"){
				switch (status){
					case "pending":
						onFulfilleds.push(function(value){
							callAsync(onFulfilled, value);
						});
						break;
					case "fulfilled":
						callAsync(onFulfilled, value);
						break;
				}
			}
			return this;
		};
		
		this["catch"] = function(onRejected){
			if (typeof onRejected === "function"){
				switch (status){
					case "pending":
						onRejecteds.push(function(reason){
							callAsync(onRejected, reason);
						});
						break;
					case "rejected":
						callAsync(onRejected, reason);
						break;
				}
			}
			return this;
		};
		
		this["finally"] = function(onFinally){
			if (typeof callback === "function"){
				switch (status){
					case "pending":
						onFinallys.push(function(){
							callAsync(onRejected);
						});
						break;
					case "fulfilled":
					case "rejected":
						callAsync(onFinally);
						break;
				}
			}
			return this;
		}
		
		this.then = function(onFulfilled, onRejected){
			var funcType = {ful: typeof onFulfilled === "function", rej: typeof onRejected === "function"};
			if (!funcType.ful && !funcType.rej){
				return this;
			}
			var resolver = new Resolver();
			var returnThen = new Promise(resolver);
			
			var onFulfilledWrapper = funcType.ful? function(value){
				try {
					var value = onFulfilled(value);
					resolver.resolve(value);
				}
				catch(e){
					resolver.reject(e);
				}
			}: function(value){resolver.resolve(value)};
			var onRejectedWrapper = funcType.rej? function(reason){
				try {
					var value = onRejected(reason);
					resolver.resolve(value);
				}
				catch(e){
					resolver.reject(e);
				}
			}: function(reason){resolver.reject(reason)};
			
			this["done"](onFulfilledWrapper, onRejectedWrapper);
			return returnThen;
		};
	}).implementStatic({
		some: function(){
			var resolver = new Resolver();
			var promises = Array.prototype.slice.call(arguments);
			var reasons = [];
			var numPromises = 0;
			var rejectedPromises = 0;
			deepForEach(promises, function(promise, index){
				if (!(promise instanceof Promise)){
					throw new TypeError();
				}
				numPromises += 1;
				promise["done"](function(value){
					resolver.resolve(value);
				}, function(reason){
					rejectedPromises += 1;
					setArrayValue(reasons, index, reason);
					if (numPromises == rejectedPromises){
						resolver.reject(reasons);
					}
				});
			});
			return new Promise(resolver);
		},
		every: function(){
			var resolver = new Resolver();
			var promises = Array.prototype.slice.call(arguments);
			var values = []
			var numPromises = promises.length;
			var fulfilledPromises = 0;
			deepForEach(promises, function(promise, index){
				if (!(promise instanceof Promise)){
					throw new TypeError();
				}
				promise["done"](function(value){
					fulfilledPromises += 1;
					setArrayValue(values, index, value);
					if (numPromises == fulfilledPromises){
						resolver.resolve(values);
					}
				}, function(reason){
					resolver.reject(reason);
				});
			});
			return new Promise(resolver);
		}
	});
	
	Promise.Resolver = Resolver;
	
	
	// exporting variable to the right environment
	if (typeof exports !== "undefined" && typeof module !== "undefined"){
		module.exports = Promise;
	}
	else if (typeof kkjs !== "undefined"){
		kkjs.PromiseAPlus = Promise;
	}
}());
(function(){
	"use strict";
	
	/**
	 * create ECMAScript 5 methods that are not provided by the environment
	 */
	
	// if something is not completely implementable in ES3 show a warning in the console
	var c = typeof console === "undefined"? {warn: function(){}}: console;
	function warn(str){
		c.warn(str);
	}
	
	// often used functions
	var slice = Array.prototype.slice;
	var objectToString = Object.prototype.toString;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	
	// the internal register function
	function register(obj, name, func){
		if (!obj[name]){
			obj[name] = func;
		}
	}
	
	// Object methods
	register(Object, "getPrototypeOf", function getPrototypeOf(obj){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		if (obj.constructor){
			return obj.constructor.prototype;
		}
		else {
			return null;
		}
	});
	
	register(Object, "getOwnPropertyDescriptor", function getOwnPropertyDescriptor(obj, name){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		warn("Object.getOwnPropertyDescriptor(): enumerable, configureable and writeable can not be read.");
		return {
			value: obj.name,
			enumerable: true,
			configureable: true,
			writeable: true
		};
	});
	
	register(Object, "getOwnPropertyNames", function getOwnPropertyNames(obj){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		warn("Object.getOwnPropertyNames() can not do something different than Object.keys().");
		return Object.keys(obj);
	});
	
	register(Object, "create", function create(proto, properties){
		if (typeof proto !== "object" && proto !== null){
			throw new TypeError();
		}
		var T = function(){};
		T.prototype = proto;
		var obj = new T();
		if (properties){
			Object.defineProperties(properties);
		}
	});
	
	register(Object, "defineProperty", function defineProperty(obj, name, descriptor){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		warn("Object.defineProperty(): enumerable, configureable, writeable, get and set can not be set.");
		obj.name = descriptor.value;
		return obj;
	});
	
	register(Object, "defineProperties", function defineProperties(obj, properties){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		Object.keys(properties).forEach(function(name){
			Object.defineProperty(obj, name, properties[name]);
		});
		return obj;
	});
	
	register(Object, "seal", function seal(obj){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		warn("Object.seal() is not implementable.");
		return obj;
	});
	
	register(Object, "freeze", function freeze(obj){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		warn("Object.freeze() is not implementable.");
		return obj;
	});
	
	register(Object, "preventExtensions", function preventExtensions(obj){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		warn("Object.preventExtensions() is not implementable.");
		return obj;
	});
	
	register(Object, "isSealed", function isSealed(obj){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		warn("Object.isSealed() is not implementable.");
		return false;
	});
	
	register(Object, "isFrozen", function isFrozen(obj){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		warn("Object.isFrozen() is not implementable.");
		return false;
	});
	
	register(Object, "isExtensible", function siExtensible(obj){
		if (typeof obj !== "object" || obj === null){
			throw new TypeError();
		}
		warn("Object.isExtensible() is not implementable.");
		return true;
	});
	
	// Object.keys is a little bit complicated to catch the bad for..in behaviour of old IEs.
	register(Object, "keys", (function(){
		var normalKeys = function keys(o){
			if (typeof o !== "object" || o === null){
				throw new TypeError();
			}
			
			var array = [];
			for (var name in o){
				if (
					hasOwnProperty.call(o, name) &&
					(
						!Object.prototype.propertyIsEnumerable ||
						Object.prototype.propertyIsEnumerable.call(o, name)
					)
				){
					array.push(name);
				}
			}
			return array;
		};
		// determine if the for..in loop is not broken for some built-in property names
		var specialNames = ["constructor", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "toLocaleString", "toString", "valueOf"];
		var testObject = specialNames.reduce(function(o, name, i){
			o[name] = i;
			return o;
		}, {});
		var testKeys = normalKeys(testObject);
		var notCatched = specialNames.filter(function(name){
			return testKeys.indexOf(name) === -1;
		});
		if (notCatched.length === 0){
			return normalKeys;
		}
		else {
			// console.log("some missing");
			return function(o){
				var array = normalKeys(o);
				
				notCatched.forEach(function(name){
					if (
						Object.prototype.hasOwnProperty.call(o, name) &&
						(
							!Object.prototype.propertyIsEnumerable ||
							Object.prototype.propertyIsEnumerable.call(o, name)
						) &&
						(array.indexOf(name) === -1)
					){
						array.push(name);
					}
				});
				
				return array;
			};
		}
	}()));
	
	// Function methods
	
	register(Function.prototype, "bind", function bind(obj){
		var boundArgs = slice.call(arguments, 1);
		var func = this;
		return function(){
			// if (!obj){
				// obj = this;
			// }
			return func.apply(obj, boundArgs.concat(slice.call(arguments)));
		};
	});
	
	// Array methods
	
	register(Array, "isArray", function isArray(arg){
		//referring to http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		return Object.prototype.toString.call(arg) === "[object Array]";
	});
	
	register(Array.prototype, "indexOf", function arrayIndexOf(searchElement/*, fromIndex*/){
		var len = this.length;
		if (len === 0){
			return -1;
		}
		var n = arguments.length > 1? arguments[1]: 0;
		if (n >= len){
			return -1;
		}
		if (n < 0){
			n += len;
			if (n < 0){
				n = 0;
			}
		}
		for (;n < len; n++){
			if (this[n] === searchElement){
				return n;
			}
		}
		return -1;
	});
	
	register(Array.prototype, "lastIndexOf", function arrayLastIndexOf(searchElement/*, fromIndex*/){
		var len = this.length;
		if (len === 0){
			return -1;
		}
		var n = arguments.length > 1? arguments[1]: len;
		if (n >= 0){
			n = Math.min(n, len - 1);
		}
		else {
			n += len;
		}
		for (;n >= 0; n--){
			if (this[n] === searchElement){
				return n;
			}
		}
		return -1;
	});
	
	register(Array.prototype, "every", function arrayEvery(callbackFn/*, thisArg*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var T;
		if (arguments.length > 1){
			T = arguments[1];
		}
		for (var k = 0; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				if (!callbackFn.call(T, this[k], k, this)){
					return false;
				}
			}
		}
		return true;
	});
	
	register(Array.prototype, "some", function arraySome(callbackFn/*, thisArg*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var T;
		if (arguments.length > 1){
			T = arguments[1];
		}
		for (var k = 0; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				if (callbackFn.call(T, this[k], k, this)){
					return true;
				}
			}
		}
		return false;
	});
	
	register(Array.prototype, "forEach", function arrayForEach(callbackFn/*, thisArg*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var T;
		if (arguments.length > 1){
			T = arguments[1];
		}
		for (var k = 0; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				callbackFn.call(T, this[k], k, this);
			}
		}
	});
	
	register(Array.prototype, "map", function arrayMap(callbackFn/*, thisArg*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var T;
		if (arguments.length > 1){
			T = arguments[1];
		}
		var A = new Array(len);
		for (var k = 0; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				A[k] = callbackFn.call(T, this[k], k, this);
			}
		}
		return A;
	});
	
	register(Array.prototype, "filter", function arrayFilter(callbackFn/*, thisArg*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var T;
		if (arguments.length > 1){
			T = arguments[1];
		}
		var A = [];
		for (var k = 0; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				var V = this[k];
				if (callbackFn.call(T, this[k], k, this)){
					A.push(V);
				}
			}
		}
		return A;
	});
	
	register(Array.prototype, "reduce", function arrayReduce(callbackFn/*, initialValue*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var k = 0;
		var accumulator;
		if (arguments.length > 1){
			accumulator = arguments[1];
		}
		else {
			if (len === 0){
				throw new TypeError();
			}
			var kPresent = false;
			for (; !kPresent && k < len; k++){
				if ((kPresent = (!this.hasOwnProperty || this.hasOwnProperty(k))) === true){
					accumulator = this[k];
				}
			}
			if (!kPresent){
				throw new TypeError();
			}
		}
		for (; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				accumulator = callbackFn.call(undefined, accumulator, this[k], k, this);
			}
		}
		return accumulator;
	});
	
	register(Array.prototype, "reduceRight", function arrayReduceRight(callbackFn/*, initialValue*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var k = len - 1;
		var accumulator;
		if (arguments.length > 1){
			accumulator = arguments[1];
		}
		else {
			if (len === 0){
				throw new TypeError();
			}
			var kPresent = false;
			for (; !kPresent && k >= 0; k--){
				if ((kPresent = (!this.hasOwnProperty || this.hasOwnProperty(k))) === true){
					accumulator = this[k];
				}
			}
			if (!kPresent){
				throw new TypeError();
			}
		}
		for (; k >= 0; k--){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				accumulator = callbackFn.call(undefined, accumulator, this[k], k, this);
			}
		}
		return accumulator;
	});

	
	// String methods
	
	register(String.prototype, "trim", (function(){
		var regExp = /^\s*(.*?)\s*$/;
		return function trim(){
			return this.replace(regExp, "$1");
		}
	}()));
	
	// Boolean methods
	// no new methods here
	
	// Number methods
	// no new methods here
	
	// Math methods
	// no new methods here
	
	// Date methods
	
	register(Date, "now", function dateNow(){
		return (new Date()).getTime();
	});
	
	function diggits(nr, z){
		nr = nr.toString();
		while (nr.length < z){
			nr = "0" + nr;
		}
		return nr;
	}
	
	register(Date.prototype, "toISOString", function toISOString(){
		return diggits(this.getFullYear(), 4) + "-" +
			diggits(this.getMonth() + 1, 2) + "-" +
			diggits(this.getDate(), 2) + "T" +
			diggits(this.getHours(), 2) + ":" +
			diggits(this.getMinutes(), 2) + ":" +
			diggits(this.getSeconds(), 2) +
			//"." + diggits(this.getMilliseconds(), 3) +
			"Z";
	});
	
	register(Date.prototype, "toJSON", function toJSON(){
		if (!isFinite(this.getTime())){
			return null;
		}
		if (typeof this.toISOString !== "function"){
			throw new TypeError();
		}
		return this.toISOString();
	});
	
	// RegExp methods
	// no new methods here
	
	// Error methods
	// no new methods here
	
	// JSON
}());
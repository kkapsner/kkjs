	// Object methods
	register(Object, "getPrototypeOf", function getPrototypeOf(obj){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		if (obj.constructor){
			return obj.constructor.prototype;
		}
		else {
			return null;
		}
	});
	
	register(Object, "getOwnPropertyDescriptor", function getOwnPropertyDescriptor(obj, name){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		warn("Object.getOwnPropertyDescriptor(): enumerable, configurable and writable can not be read.");
		return {
			value: obj.name,
			enumerable: true,
			configurable: true,
			writable: true
		};
	});
	
	register(Object, "getOwnPropertyNames", function getOwnPropertyNames(obj){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		warn("Object.getOwnPropertyNames() can not do something different than Object.keys().");
		return Object.keys(obj);
	});
	
	register(Object, "create", function create(proto, properties){
		// if (typeof proto !== "object" && proto !== null){
			// throw new TypeError();
		// }
		var T = function(){};
		T.prototype = proto;
		var obj = new T();
		if (properties){
			Object.defineProperties(obj, properties);
		}
		return obj;
	});
	
	register(Object, "defineProperty", function defineProperty(obj, name, descriptor){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		warn("Object.defineProperty(): enumerable, configurable, writable, get and set can not be set.");
		obj.name = descriptor.value;
		return obj;
	});
	
	register(Object, "defineProperties", function defineProperties(obj, properties){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		warn("Object.defineProperties(): enumerable, configurable, writable, get and set can not be set.");
		Object.keys(properties).forEach(function(name){
			obj.name = properties[name].value;
			// Object.defineProperty(obj, name, properties[name]);
		});
		return obj;
	});
	
	register(Object, "seal", function seal(obj){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		warn("Object.seal() is not implementable.");
		return obj;
	});
	
	register(Object, "freeze", function freeze(obj){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		warn("Object.freeze() is not implementable.");
		return obj;
	});
	
	register(Object, "preventExtensions", function preventExtensions(obj){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		warn("Object.preventExtensions() is not implementable.");
		return obj;
	});
	
	register(Object, "isSealed", function isSealed(obj){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		warn("Object.isSealed() is not implementable.");
		return false;
	});
	
	register(Object, "isFrozen", function isFrozen(obj){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		warn("Object.isFrozen() is not implementable.");
		return false;
	});
	
	register(Object, "isExtensible", function siExtensible(obj){
		// if (typeof obj !== "object" || obj === null){
			// throw new TypeError();
		// }
		warn("Object.isExtensible() is not implementable.");
		return true;
	});
	
	// Object.keys is a little bit complicated to catch the bad for..in behaviour of old IEs.
	register(Object, "keys", (function(){
		var normalKeys = function keys(o){
			// if (typeof o !== "object" || o === null){
				// throw new TypeError();
			// }
			
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
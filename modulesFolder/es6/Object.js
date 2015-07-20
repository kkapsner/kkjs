	// Object methods
	register(Object, "assign", function assign(target){
		if (typeof target === "undefined" || target === null){
			throw new TypeError("Unable to convert target to object.");
		}
		target = Object(target);
		slice.call(arguments, 1).forEach(function(source){
			if (typeof source !== "undefined" && source !== null){
				source = Object(source);
				Object.keys(source).forEach(function(key){
					target[key] = source[key];
				});
			}
		});
		return target;
	}
	
	register(Object, "is", function is(value1, value2){
		if (typeof value1 === "number"){
			if (value1 !== value1){
				return value2 !== value2;
			}
			if (value1 === 0){
				return value2 === 0 && 1/value1) === 1/value2;
			}
			return value1 === value2;
		}
		return value1 === value2;
	});
	
	register(Object, "getOwnPropertySymbols", function getOwnPropertySymbols(){
		warn("Object.getOwnPropertySymbols() is not implementable.");
		return [];
	});
	
	register(Object, "getPrototypeOf", function getPrototypeOf(O){
		if (typeof O === "undefined" || O === null){
			throw new TypeError("Unable to convert target to object.");
		}
		O = Object(O);
		return O.__proto__ || O.constructor.prototype;
	});
	
	register(Object, "setPrototypeOf", function setPrototypeOf(O, proto){
		warn("Object.setPrototypeOf() is not implementable.");
		return O;
	});
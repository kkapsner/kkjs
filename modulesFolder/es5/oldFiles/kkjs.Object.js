(function(){
	"use strict";
	
	/**
	 * extension of the Object-constructor
	 * referring EMCA-262 5th Edition
	 **/
	
	// Check if the JS-Engine supports Object.keys
	if (typeof Object.keys !== "function"){
		var normalKeys = function keys(o){
			if (typeof o !== "object"){
				throw new TypeError();
			}
			
			var array = [];
			for (var name in o){
				if (
					Object.prototype.hasOwnProperty.call(o, name) &&
					(
						!Object.prototype.propertyIsEnumerable ||
						Object.prototype.propertyIsEnumerable.call(o, name)
					)
				){
					array.push(name);
				}
			}
			return array;
		}
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
			console.log("all catched");
			Object.keys = normalKeys;
		}
		else {
			// console.log("some missing");
			Object.keys = function(o){
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
			}
		}
	}
}());
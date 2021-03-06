(function(){
//"use strict";

/**
 * Object ooLight
 * @name: ooLight
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: provides some reduced object-orientated functionality (compared to original oo
 */

var oo = {
	/**
	 * Function oo.extend
	 * @name: oo.extend
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: extends a given class by a second one
	 * @parameter:
	 *	parentClass:
	 *	childClass:
	 * @return value: the childClass
	 */
	
	extend: function extend(parentClass, childClass){
		
		oo._forIn(parentClass, function(i){
			if (!is.key(childClass, i)){
				childClass[i] = parentClass[i];
			}
		});
		
		function T(){}
		if (Object.create){
			childClass.prototype = Object.create(
				parentClass.prototype,
				{
					constructor: {
						value: childClass,
						enumerable: false
					}
				}
			);
		}
		else {
			T.prototype = parentClass.prototype;
			childClass.prototype = new T();
			childClass.prototype.constructor = childClass;
		}
		
		return childClass;
	},
	
	/**
	 * Function oo.implement
	 * @name: oo.implement
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: implements functionality to a class
	 *	targetClass:
	 *	implemention1: can be the constructor of a class or a object (instance)
	 *	implemention2:
	 *	...
	 *	implementionN:
	 * @parameter:
	 * @return value: the target-class
	 */
	
	implement: function implement(targetClass){
		for (var i = 1; i < arguments.length; i++){
			oo._implement(targetClass.prototype, arguments[i]);
		}
		return targetClass;
	},
	
	/**
	 * Function oo.implementStatic
	 * @name: oo.implementStatic
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: implements static functionality to a class
	 *	targetClass:
	 *	implemention1: can be the constructor of a class or a object (instance)
	 *	implemention2:
	 *	...
	 *	implementionN:
	 * @parameter:
	 * @return value: the target-class
	 */
	
	implementStatic: function implementStatic(targetClass){
		for (var i = 1; i < arguments.length; i++){
			oo._implement(targetClass, arguments[i]);
		}
		return targetClass;
	},
	
	/**
	 * Class oo.Base
	 * @name: oo.Base
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: a wrapper-class to make the functions of oo directly accessable by oo
	 * @parameter:
	 * @return value:
	 */
	
	Base: function BaseClass(){
	},
	
	/** interieur functions**/
	
	// functionality to implement things - not to be user alone
	_implement: function _implement(target, obj){
		// if we want to implement a interface
		if (typeof obj === "function"){
			obj = obj.prototype;
		}
		
		oo._forIn(obj, function(name, value){
			target[name] = value;
		});
	},
	
	// set toString and valueOf
	_pretendOther: function pretendOther(value, other){
		value.valueOf = function(){
			return other.valueOf.apply(other, arguments);
		};
		value.toString = function(){
			return other.toString.apply(other, arguments);
		};
		return value;
	},
	
	// a valid for ... in loop over EVERY entry (also toString in IE)
	_forIn: function forIn(obj, func){
		var missedNames = ["constructor", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "toLocaleString", "toString", "valueOf"];
		var missed = {
			prototype: true,
			constructor: true,
			propertyIsEnumerable: true,
			isPrototypeOf: true,
			hasOwnProperty: true,
			toLocaleString: true,
			toString: true,
			valueOf: true
		};
		for (var i in obj){
			func(i, obj[i], obj);
			if (missed[i]){
				missed[i] = false;
			}
		}
		
		// in some Implementions some function are not accessable via for ... in so we have to add them by hand (i.e. IE misses all of them)
		
		for (var j = 0; j < missedNames.length; j++){
			/* var */ i = missedNames[j];
			if (obj[i] !== Object.prototype[i] && missed[i]){
				func(i, obj[i], obj);
			}
		}
		
	}
};

oo.Base.extend = function(childClass){
	if (typeof childClass === "undefined"){
		var parentConstructor = this;
		childClass = function noConstructorDummy(){
			parentConstructor.apply(this, arguments);
		};
	}
	return oo.extend(this, childClass);
};
oo.Base.implement = function(){
	var args = [this];
	for (var i = 0; i < arguments.length; i++){
		args.push(arguments[i]);
	}
	return oo.implement.apply(oo, args);
};
oo.Base.implementStatic = function(){
	var args = [this];
	for (var i = 0; i < arguments.length; i++){
		args.push(arguments[i]);
	}
	return oo.implementStatic.apply(oo, args);
};
oo.Base = oo.Base.extend(function BaseClass(){});

if (typeof exports !== "undefined"){
	for (var i in oo){
		if (oo.hasOwnProperty(i)){
			exports[i] = oo[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.ooLight = ooLight;
}

})();
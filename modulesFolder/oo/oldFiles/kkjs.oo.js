(function(){
//"use strict";

/**
 * Object oo
 * @name: oo
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: provides some object-orientated functionality
 */
var is = require("./kkjs.is");

var oo = {
	/**
	 * Function oo.overload
	 * @name: oo.overload
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: returns an overloaded function
	 * @parameter:
	 *	funcDef: an array those elements represents the different overloadings: the elements are also arrays (first item: argument definition, second item: function reference)
	 *		argument definition: either an Integer(number of parameters given) or an array of Klasses or none of them (this defines a default-function which is executet everytime it will be looked at)
	 * @return value: the overloaded function
	 */
	
	overload: function overload(funcDef){
		return function(){
			var fD = funcDef;
			main: for (var i = 0; i < fD.length; i++){
				var currFD = fD[i];
				if (is.number(currFD[0])){
					if (arguments.length === currFD[0]){
						return currFD[1].apply(this, arguments);
					}
				}
				else if (is.array(currFD[0])){
					if (arguments.length === currFD[0].length){
						for (var j = 0; j < currFD[0].length; j++){
							var type = currFD[0][j];
							if (is.string(type)){
								if ((typeof arguments[j]) !== type && is[type] && !is[type](arguments[j])){
									continue main;
								}
							}
							else {
								if (!(arguments[j] instanceof type)){
									continue main;
								}
							}
						}
						return currFD[1].apply(this, arguments);
					}
				}
				else {
					return currFD[1].apply(this, arguments);
				}
			}
			return null;
		};
	},
	
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
		
		// super for static functions
		function staticSuper(name){
			/*jshint validthis: true*/
			if (is.key(staticSuper, name)){
				return staticSuper[name];
			}
			if (is.key(parentClass, name)){
				var value = parentClass[name];
				if (is["function"](value)){
					var This = this;
					var ret = function(){
						var Super = This.Super;
						This.Super = This.Super("Super");
						var ret = value.apply(This, arguments);
						This.Super = Super;
						return ret;
					};
					staticSuper[name] = oo._pretendOther(ret, value);
					return staticSuper[name];
				}
				else {
					return value;
				}
			}
			return null;
		}
		staticSuper.Super = parentClass.Super;
		
		oo._forIn(parentClass, function(i){
			if (!is.key(childClass, i)){
				childClass[i] = parentClass[i];
			}
		});
		childClass.Super = staticSuper;
		
		// Super for methods
		function Super(name){
			var caller = Super.caller;
			var callerName = null;
			var nSuper = this.constructor.prototype.Super;
			while (callerName === null && nSuper){
				oo._forIn(nSuper.child.prototype, function(name, value){
					if (caller === value){
						callerName = name;
					}
				});
				if (callerName === null){
					nSuper = nSuper.Super;
				}
			}
			//var nSuper = this.Super;
			if (callerName !== null){
				while (nSuper && caller === nSuper.parent.prototype[callerName]){
					nSuper = nSuper.Super;
				}
			}
			
			/*if (name !== "constructor"){
				console.log(caller);
				console.log(callerName);
				console.log(caller === nSuper.child.prototype[callerName]);
				console.log(caller === nSuper.parent.prototype[callerName]);
				console.log(nSuper.child);
			}*/
			
			if (nSuper && is.key(nSuper.parent.prototype, name)){
				var value = nSuper.parent.prototype[name];
				if (is["function"](value)){
					var This = this;
					var ret = function(){
						var Super = This.Super;
						This.Super = nSuper.Super;
						var ret = value.apply(This, arguments);
						This.Super = Super;
						return ret;
					};
					return oo._pretendOther(ret, value);
				}
				else {
					return value;
				}
			}
			return null;
		}
		Super.Super = parentClass.prototype.Super;
		Super.parent = parentClass;
		Super.child = childClass;
		
		function T(){}
		if (Object.create){
			childClass.prototype = Object.create(
				parentClass.prototype,
				{
					constructor: {
						value: childClass,
						enumerable: false
					},
					Super: {
						value: Super,
						enumerable: false
					}
				}
			);
		}
		else {
			T.prototype = parentClass.prototype;
			childClass.prototype = new T();
			
			childClass.prototype.Super = Super;
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
		if (is["function"](obj)){
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
	kkjs.oo = oo;
}

})();
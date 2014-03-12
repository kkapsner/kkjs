(function(){
	"use strict";
	
	/**
	 * Module for simpler object inheritance.
	 */
	
	// a valid for ... in loop over EVERY entry (also toString in IE)
	function forIn(obj, func){
		Object.keys(obj).forEach(function(name){
			func(name, obj[name], obj);
		});
	}
	
	// functionality to implement things
	function implementFunction(target, obj){
		// if we want to implement a interface
		if (typeof obj === "function"){
			obj = obj.prototype;
		}
		
		forIn(obj, function(name, value){
			target[name] = value;
		});
	}
	
	/**
	 * Object oo
	 * @name: oo
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: provides some object-orientated functionality
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
			forIn(parentClass, function(i){
				if (!(i in childClass)){
					childClass[i] = parentClass[i];
				}
			});
			
			childClass.prototype = Object.create(
				parentClass.prototype,
				{
					constructor: {
						value: childClass,
						configureable: true,
						writeable: true,
						enumerable: false
					}
				}
			);
			
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
			for (var i = 1; i < arguments.length; i += 1){
				implementFunction(targetClass.prototype, arguments[i]);
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
			for (var i = 1; i < arguments.length; i += 1){
				implementFunction(targetClass, arguments[i]);
			}
			return targetClass;
		}
	};
	
	/**
	 * Class oo.Base
	 * @name: oo.Base
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: a wrapper-class to make the functions of oo directly accessable by oo
	 * @parameter:
	 * @return value:
	 */
	
	oo.Base = function BaseClass(){};
	
	
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
}());
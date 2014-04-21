(function(){
	"use strict";
	
	/**
	 * Module for simpler object inheritance.
	 */
	
	function forIn(obj, func){
		/* a valid for ... in loop over EVERY entry (also toString in IE) */
		Object.keys(obj).forEach(function(name){
			func(name, obj[name], obj);
		});
	}
	
	function implementFunction(target, obj){
		/* functionality to implement things */
		
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
		extend: function extend(parentClass, childClass){
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
		
		implement: function implement(targetClass){
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
			
			for (var i = 1; i < arguments.length; i += 1){
				implementFunction(targetClass.prototype, arguments[i]);
			}
			return targetClass;
		},
		
		implementStatic: function implementStatic(targetClass){
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
		/**
		 * Function oo.Base.extend
		 * @name: oo.Base.extend
		 * @author: Korbinian Kapsner
		 * @description: Creates a new child-class of the class. See oo.extend().
		 * @parameter:
		 *	childClass (optional): The constructor implementation of the new "Class"
		 * @return value: The new construtor
		 */
		
		if (typeof childClass === "undefined"){
			var parentConstructor = this;
			childClass = function noConstructorDummy(){
				/**
				 * Constructor noConstructorDummy
				 * @name: noConstructorDummy
				 * @author: Korbinian Kapsner
				 * @description: Auto generated constructor that only calles the
				 *	parent class constructor.
				 */
				
				parentConstructor.apply(this, arguments);
			};
		}
		return oo.extend(this, childClass);
	};
	oo.Base.implement = function(){
		/**
		 * Function oo.Base.implement
		 * @name: oo.Base.implement
		 * @author: Korbinian Kapsner
		 * @description: Implements an interface/mixin or creates new members.
		 *	See oo.implement().
		 * @parameter:
		 *	implementation1: implementation that will be added.
		 *	...
		 * @return value: this.
		 */
		
		var args = [this];
		for (var i = 0; i < arguments.length; i++){
			args.push(arguments[i]);
		}
		return oo.implement.apply(oo, args);
	};
	oo.Base.implementStatic = function(){
		/**
		 * Function oo.Base.implementStatic
		 * @name: oo.Base.implementStatic
		 * @author: Korbinian Kapsner
		 * @description: Implements an interface/mixin or creates new static members.
		 *	See oo.implementStatic().
		 * @parameter:
		 *	implementation1: implementation that will be added.
		 *	...
		 * @return value: this.
		 */
		
		var args = [this];
		for (var i = 0; i < arguments.length; i++){
			args.push(arguments[i]);
		}
		return oo.implementStatic.apply(oo, args);
	};
	oo.Base = oo.Base.extend(function BaseClass(){});
	
	// exporting variable to the right environment
	if (typeof exports !== "undefined" && typeof module !== "undefined"){
		module.exports = oo;
	}
	else if (typeof kkjs !== "undefined"){
		kkjs.oo = oo;
	}
}());
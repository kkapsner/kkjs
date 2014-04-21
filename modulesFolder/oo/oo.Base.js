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
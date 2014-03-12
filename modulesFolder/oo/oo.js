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
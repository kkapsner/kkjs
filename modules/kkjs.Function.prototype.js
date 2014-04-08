(function(){
"use strict";

/**
 * prototype-extension for Function
 *
 **/

/**
 * Function Function.prototype.makeArrayCallable
 * @name:: Function.prototype.makeArrayCallable
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 09.04.2013
 * @description: returns a function reference that is array callable. That means
 *	if you call the function like:
 *		var fun = function(a){alert(a);};
 *		var arrFun = fun.makeArrayCallable([0]);
 *		arrFun([1, 2, 3]); //will call fun(1), fun(2) and fun(3)
 *		arrFun(4); //will call fun(4);
 * @parameter:
 *	argNumbers: array of the arguments to be calling arrays
 *	[flags: object controlling the exact behaviour. One can specify the 
 *		following properties:
 *			arrayLike: boolean if parameter with attribute "length" should be
 *				treated as an array. Default false.
 *			mapReturnValues: boolean if the return values of the individual
 *				function calls should be mapped to an array that is output at
 *				the end. Default true.
 *	]
 */


Function.prototype.makeArrayCallable = function(argNumbers, flags){
	var func = this;
	if (!flags){
		flags = {
			arrayLike: false,
			mapReturnValues: true
		}
	}
	if (!("mapReturnValues" in flags)){
		flags.mapReturnValues = true;
	}
	
	var arrFunc = function arrayCallableWrapper(){
		var This = this;
		var args = Array.prototype.slice.call(arguments);
		for (var i = 0, l = argNumbers.length; i < l; i++){
			var index = argNumbers[i];
			var argValue = args[index];
			if (
				Array.isArray(argValue) ||
				(
					flags.arrayLike &&
					argValue && typeof argValue === "object" &&
					("length" in argValue) &&
					!("options" in argValue && "nodeName" in argValue)
				)
			){
				var lastReturnValue = null;
				var map = Array.prototype.map.call(
					args[index],
					function(arg){
						var newArgs = args.slice();
						newArgs[index] = arg;
						lastReturnValue = arrFunc.apply(This, newArgs);
						return lastReturnValue;
					}
				);
				if (flags.mapReturnValues){
					return map;
				}
				else {
					return lastReturnValue;
				}
			}
		}
		return func.apply(This, arguments);
	};
	arrFunc.toString = func.toString.bind(func);
	arrFunc.valueOf = func.valueOf.bind(func);
	//arrFunc.length = func.length;
	return arrFunc;
};

/**
 * Function Function.prototype.makeObjectCallable
 * @name:: Function.prototype.makeObjectCallable
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 27.09.2013
 * @description: returns a function reference that is object callable. That means if you call the funktion like:
 *	var fun = function(a, b){alert(a + " -> " + b);};
 *	var arrFun = fun.makeObjectCallable(0, 0, 1);
 *	arrFun({first: 1, second: 2, third: 3}); //will call fun("first", 1), fun("second", 2) and fun("third", 3)
 *	arrFun("fourth", 4); //will call fun("fourth", 4);
 *	WARNING: This will not work properly if the argument usually takes a non native parameter!
 * @parameter:
 *	argNumber: argument number to be calling objects
 *	keyIndex: argument number were the key should be passed to
 *	valueIndex: argument number were the value should be passed to
 *	returnObject: boolean if the function should generate an object out of each function call.
 *		If not the function will return the last return value.
 */

Function.prototype.makeObjectCallable = function(argNumber, keyIndex, valueIndex, returnObject){
	var func = this;
	var objFunc = function objectCallableWrapper(){
		var args = Array.prototype.slice.call(arguments);
		var argValue = args[argNumber];
		if (typeof argValue === "object" && !Array.isArray(argValue)){
			var ret = returnObject? {}: null;
			for (var name in argValue){
				if (argValue.hasOwnProperty(name)){
					args[keyIndex] = name;
					args[valueIndex] = argValue[name];
					if (returnObject){
						ret[name] = objFunc.apply(this, args);
					}
					else {
						ret = objFunc.apply(this, args);
					}
				}
			}
			return ret;
		}
		return func.apply(this, arguments);
	};
	objFunc.toString = func.toString.bind(func);
	objFunc.valueOf = func.valueOf.bind(func);
	//objFunc.length = func.length;
	return objFunc;
};


/**
 * Function Function.prototype.setDefaultParameter
 * @name:: Function.prototype.setDefaultParameter
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 13.04.2013
 * @description: set the default parameter for a function.
 *	Parameter have to be instances of Function.DefaultParameter or the default value that should be returned.
 *	If a parameter should not have a default value pass NULL as default parameter.
 * @parameter:
 *	param1: default parameter for the first parameter
 *	param2: default parameter fot the second parameter
 *	...
 */

Function.prototype.setDefaultParameter = function(){
	var defaultParameterDefinition = Array.prototype.slice.call(arguments);
	
	var func = this;
	var sDFunc =  function setDefaultWrapper(){
		var args = Array.prototype.slice.call(arguments);
		for (var i = defaultParameterDefinition.length - 1; i >= 0; i--){
			var def = defaultParameterDefinition[i];
			if (def !== null){
				if (def.process){
					args[i] = def.process(args[i], this);
				}
				else if (typeof args[i] === "undefined"){
					args[i] = def;
				}
			}
		}
		return func.apply(this, args);
	};
	
	sDFunc.toString = func.toString.bind(func);
	sDFunc.valueOf = func.valueOf.bind(func);
	//sDFunc.length = func;
	return sDFunc;
};

/**
 * Constructor Function.DefaultParameter
 * @name:: Function.DefaultParameter
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 13.04.2013
 * @description: constructor for default parameter
 * @parameter:
 *	value: 
 */

Function.DefaultParameter = function DefaultParameter(value, params){
	this.value = value;
	if (params){
		for (var name in params){
			if (params.hasOwnProperty(name)){
				this[name] = params[name];
			}
		}
	}
};
Function.DefaultParameter.prototype.checkFunction = null;
Function.DefaultParameter.prototype.allowNull = false;
Function.DefaultParameter.prototype.checkType = false;
Function.DefaultParameter.prototype.returnFunction = null;
Function.DefaultParameter.prototype.returnClone = false;
Function.DefaultParameter.prototype.objectDeepInspection = true;

Function.DefaultParameter.prototype.process = function(arg, thisArg){
	if (
		this.value !== null && (
			this.checkFunction && !this.checkFunction(arg, thisArg) ||
			typeof arg === "undefined" ||
			(!this.allowNull && arg === null) ||
			(this.checkType && typeof arg !== typeof this.value)
		)
	){
		if (this.returnFunction){
			return this.returnFunction(thisArg);
		}
		else if (this.returnClone && typeof this.value === "object"){
			if (typeof this.value.clone === "function"){
				return this.value.clone();
			}
			else {
				var F = function(){};
				F.prototype = this.value;
				var ret = new F();
				return ret;
			}
		}
		else {
			return this.value;
		}
	}
	else {
		if (this.objectDeepInspection && typeof arg === "object"){
			var value = this.value;
			for (var name in value){
				if (value.hasOwnProperty(name)){
					this.value = value[name];
					arg[name] = this.process(arg[name], thisArg);
				}
			}
			this.value = value;
		}
		return arg;
	}
};

/**
 * Function Function.prototype.getName
 * @name:: Function.prototype.getName
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 17.1.2010
 * @description: returns the name of the function
 * @parameter:
 */

Function.prototype.getName = function getName(){
	var m = this.toString().match(/function\s+([^\(\)\s]+)\s*\(/);
	if (m){
		return m[1];
	}
	else {
		return "{anonymous}";
	}
};

})();
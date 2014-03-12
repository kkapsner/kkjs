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
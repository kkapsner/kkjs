(function(){
"use strict";
/**
 * Function setDefault
 * @name: setDefault
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @description: kann zum setzen von Defaultwerten verwendet werden
 * @parameter:
 *	value: übergebener Wert
 *	Default: Defaultwert - dabei werden auch Tiefendefaults übernommen (z.B. value = {hallo: 1}; default = {hallo: 0, test: {ja: 4}} -> Rückgabewert {hallo: 1, test: {ja: 4}})
 */

var setDefault = function setDefault(value, Default){
	if (Default === setDefault.spacer){
		return value;
	}
	if (typeof value === "undefined"){
		return Default;
	}
	if (typeof value !== typeof Default){
		return Default;
	}
	if (Default && (typeof Default === "object") && Object.prototype.toString.call(Default) === "[object Object]"){
		for (var i in Default){
			if (Default.hasOwnProperty(i)){
				value[i] = setDefault(value[i], Default[i]);
			}
		}
	}
	return value;
};
setDefault.spacer = function(){throw "This function is just a spacer.";};

if (typeof exports !== "undefined"){
	exports.setDefault = setDefault;
}
else if (typeof kkjs !== "undefined"){
	kkjs.setDefault = setDefault;
}

})();
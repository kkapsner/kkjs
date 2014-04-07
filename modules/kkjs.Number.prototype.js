(function(){
"use strict";

/**
 * prototype-extension for Number
 *
 **/

/**
 * Function Number.prototype.isInRange
 * @name: Number.prototype.isInRange
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description: Überprüft, ob die Zahl in einem bestimmten Bereich liegt
 * @parameter:
 *	lower: untere Grenze
 *	upper: obere Grenze
 *
 */

Number.prototype.isInRange = function isInRange(lower, upper){

	if (this >= lower && this <= upper){
		return true;
	}
	if (this <= lower && this >= upper){
		return true;
	}
	return false;
};

/**
 * Function Number.prototype.setInRange
 * @name: Number.prototype.setInRange
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description: Bsp.: (2).setInRange(0, 1) == 1; (2).setInRange(-3, 0) == 0
 * @parameter:
 *	lower: untere Grenze
 *	upper: obere Grenze
 */

Number.prototype.setInRange = function setInRange(lower, upper){

	if (typeof lower === "undefined" || lower === null){
		lower = this;
	}
	if (typeof upper === "undefined" || upper === null){
		upper = this;
	}
	lower = parseFloat(lower) || 0;
	upper = parseFloat(upper) || 0;
	
	if (this < lower){
		return lower;
	}
	if (this > upper){
		return upper;
	}
	return this;
};

/**
 * Function Number.prototype.setInCircle
 * @name: Number.prototype.setInCircle
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description: "zwängt" eine Zahl in einen Ring, Bsp: Winkel -60° == 300°
 * @parameter:
 *	lower: untere Grenze
 *	upper: obere Grenze
 *
 */

Number.prototype.setInCircle = function setInCircle(lower, upper){

	var zahl = this;
	if (lower === upper){
		return lower;
	}
	if (lower > upper){
		var l = lower;
		lower = upper;
		upper = l;
	}
	var diff = Math.abs(upper - lower);
	while (zahl < lower){
		zahl += diff;
	}
	while (zahl > upper){
		zahl -= diff;
	}
	return zahl;
};

})();
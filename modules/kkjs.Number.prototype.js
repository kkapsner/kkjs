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

/**
 * Function Number.prototype.toHex
 * @name: Number.prototype.toHex
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description: Wandelt die Zahl in einen Hex-String um
 * @parameter:
 *	anzahl: Anzahl der Stellen (z.B. (10).toHex(2) == "0A")
 *
 */

Number.prototype.toHex = function toHex(anzahl){

	var ret = this.toString(16);
	while (ret.length < anzahl){
		ret = "0" + ret;
	}
	return ret;
	/*
	var stellen = new Array();
	stellen[0] = this;
	if (!isNaN(anzahl)) for (var i = 1; i<anzahl; i++) stellen[i] = 0;

	var ziffer = new Array(0,1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F");

	for (var i=0; i < stellen.length; i++){
		var rest = stellen[i]%16;
		var erg = parseInt(stellen[i]/16);
		stellen[i] = rest;
		if (erg>0) stellen[i+1] = erg;
	}
	var text = "";
	for (var i = 0; i< stellen.length; i++) text = ziffer[stellen[i]] + text;
	return text;*/
};

/**
 * Function Number.prototype.toRoman
 * @name: Number.prototype.toRoman
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description: Wandelt die Zahl in eine römische um
 * @parameter:
 *	:
 *
 */

Number.prototype.toRoman = function toRoman(){

	var h = ["", "C", "CC", "CCC", "CD", "D", "DC", "DCC", "DCCC", "CM"];
	var z = ["", "X", "XX", "XXX", "XL", "L", "LX", "LXX", "LXXX", "XC"];
	var e = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
	
	var ret = "";
	var tausend = Math.floor(this/1000);
	for (var i = 0; i < tausend; i++){
		ret += "M";
	}
	var hundert = Math.floor(this/100) - 10*tausend;
	ret += h[hundert];
	var zehn = Math.floor(this/10) - 10*hundert - 100*tausend;
	ret += z[zehn];
	var eins = this%10;
	ret += e[eins];
	return ret;
};

/**
 * Function Number.prototype.toZeros
 * @name: Number.prototype.toZeros
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description: Formatiert eine Zahl
 * @parameter:
 *	vorKomma: Anzahl der Ziffern vor dem Komma
 *	nachKomma: ANzahl der Ziffern nach dem Komma
 *	fill: String, mit dem aufgefüllt werden soll (default: "0")
 *
 */

Number.prototype.toZeros = function toZeros(vorKomma, nachKomma, fill){

	if (!fill){
		fill = "0";
	}
	fill = fill.toString();
	if (fill.length > 1){
		fill = fill.substring(0,1);
	}
	var zahl = Math.abs(this);
	var minus = (this < 0);
	if (isNaN(nachKomma)){
		nachKomma = 0;
	}
	zahl = zahl.toFixed(nachKomma);
	
	while (zahl.replace(/[\.,]\d+/, "").length < vorKomma){
		zahl = fill + zahl.toString();
	}
	if (minus){
		zahl = "-" + zahl;
	}
	return zahl;
};

})();
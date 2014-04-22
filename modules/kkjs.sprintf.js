(function(){
"use strict";

var sprintf = function sprintf(formatStr){
	/**
	 * Function sprintf
	 * @name: sprintf
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description: like all sprintf
	 * @parameter:
	 *	formatStr:
	 *	[parameter1, ...]
	 */
	
	var argIndex = 0;
	var args = Array.prototype.slice.call(arguments, 1);
	return formatStr.replace(
		/%(?:(\d+)\$)?(\+?)([ 0]|'.|)(-?)(\d*)(\.\d+)?([%bqcdeEufFGosxX])/g,
		function(m, argument, sign, padding, alignment, width, precision, type){
			var variable;
			if (!argument || !argument.length){
				variable = args[argIndex];
				argIndex++;
			}
			else {
				argument = parseInt(argument, 10);
				if (argument <= 0){
					throw new Error("Argument number must be greater than zero");
				}
				if (argument > args.length){
					throw new Error("Too few arguments");
				}
				variable = args[argument - 1];
			}
			sign = !!sign;
			switch (padding.length){
				case 0:
					padding = " ";
					break;
				case 2:
					padding = padding.substring(1);
			}
			var alignLeft = (alignment === "-");
			width = (width && width.length)? parseInt(width, 10): false;
			precision = (precision && precision.length)? parseInt(precision.substring(1), 10): false;
			switch (type){
				case "%":
					argIndex--;
					return "%";
				case "b":
				case "q":
				case "c":
				case "d":
				case "u":
				case "o":
				case "x":
				case "X":
					variable = parseInt(variable, 10);
					if (isNaN(variable)){
						variable = 0;
					}
					switch (type){
						case "u":
							variable = Math.abs(variable).toString(10);
							break;
						case "d":
							variable = variable.toString(10);
							break;
						case "b":
							variable = variable.toString(2);
							break;
						case "q":
							variable = variable.toString(4);
							break;
						case "c":
							return String.fromCharCode(variable);
						case "o":
							variable = variable.toString(8);
							break;
						case "x":
							variable = variable.toString(16).toLowerCase();
							break;
						case "X":
							variable = variable.toString(16).toUpperCase();
							break;
					}
					if (sign && variable.substr(0, 1) !== "-"){
						variable = "+" + variable;
					}
					if (width !== false && width > variable.length){
						padding = padding.repeat(width - variable.length);
						if (alignLeft){
							variable += padding;
						}
						else {
							variable = padding + variable;
						}
					}
					return variable;
				case "s":
					variable = "" + variable;
					if (width !== false && width > variable.length){
						padding = padding.repeat(width - variable.length);
						if (alignLeft){
							variable += padding;
						}
						else {
							variable = padding + variable;
						}
					}
					if (precision !== false && precision < variable.length){
						if (alignLeft){
							variable = variable.substr(0, precision);
						}
						else {
							variable = variable.substr(variable.length - precision);
						}
					}
					return variable;
				case "e":
				case "E":
					variable = parseFloat(variable);
					if (isNaN(variable)){
						variable = 0;
					}
					var e = Math.floor(Math.log(variable) / Math.LN10);
					variable /= Math.pow(10, e);
					e = ((e >= 0)? "+": "") + e.toString(10);
					if (precision !== false){
						variable = variable.toFixed(precision);
					}
					variable = variable + type + e;
					if (sign && variable.substr(0, 1) !== "-"){
						variable = "+" + variable;
					}
					if (width !== false && width > variable.length){
						padding = padding.repeat(width - variable.length);
						if (alignLeft){
							variable += padding;
						}
						else {
							variable = padding + variable;
						}
					}
					return variable;
				case "f":
				case "F":
				case "g":
				case "G":
					variable = parseFloat(variable);
					if (isNaN(variable)){
						variable = 0;
					}
					if (precision !== false){
						variable = variable.toFixed(precision);
					}
					else {
						variable = variable.toString(10);
					}
					if (sign && variable.substr(0, 1) !== "-"){
						variable = "+" + variable;
					}
					if (width !== false && width > variable.length){
						padding = padding.repeat(width - variable.length);
						if (alignLeft){
							variable += padding;
						}
						else {
							variable = padding + variable;
						}
					}
					return variable;
			}
			return "";
		}
	);
};

if (typeof exports !== "undefined"){
	module.exports = sprintf;
}
else if (typeof kkjs !== "undefined"){
	kkjs.sprintf = sprintf;
}

})();
	// if something is not completely implementable in ES3 show a warning in the console
	var c = typeof console === "undefined"? {warn: function(){}}: console;
	function warn(str){
		c.warn(str);
	}
	
	// often used functions
	var slice = Array.prototype.slice;
	var objectToString = Object.prototype.toString;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	
	// the internal register function
	function register(obj, name, func){
		if (!obj[name]){
			Object.defineProperty(obj, name, {
				enumerable: false,
				configurable: true,
				writable: true,
				value: func
			});
		}
	}
	
	function assert(expr, msg){
		if (!expr){
			throw new Error(msg);
		}
	}
	
	function todo(str){
		throw new Error(str || "There is something to do...");
	}
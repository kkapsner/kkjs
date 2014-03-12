	// Array methods
	
	register(Array, "isArray", function isArray(arg){
		//referring to http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
		return Object.prototype.toString.call(arg) === "[object Array]";
	});
	
	register(Array.prototype, "indexOf", function arrayIndexOf(searchElement/*, fromIndex*/){
		var len = this.length;
		if (len === 0){
			return -1;
		}
		var n = arguments.length > 1? arguments[1]: 0;
		if (n >= len){
			return -1;
		}
		if (n < 0){
			n += len;
			if (n < 0){
				n = 0;
			}
		}
		for (;n < len; n++){
			if (this[n] === searchElement){
				return n;
			}
		}
		return -1;
	});
	
	register(Array.prototype, "lastIndexOf", function arrayLastIndexOf(searchElement/*, fromIndex*/){
		var len = this.length;
		if (len === 0){
			return -1;
		}
		var n = arguments.length > 1? arguments[1]: len;
		if (n >= 0){
			n = Math.min(n, len - 1);
		}
		else {
			n += len;
		}
		for (;n >= 0; n--){
			if (this[n] === searchElement){
				return n;
			}
		}
		return -1;
	});
	
	register(Array.prototype, "every", function arrayEvery(callbackFn/*, thisArg*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var T;
		if (arguments.length > 1){
			T = arguments[1];
		}
		for (var k = 0; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				if (!callbackFn.call(T, this[k], k, this)){
					return false;
				}
			}
		}
		return true;
	});
	
	register(Array.prototype, "some", function arraySome(callbackFn/*, thisArg*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var T;
		if (arguments.length > 1){
			T = arguments[1];
		}
		for (var k = 0; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				if (callbackFn.call(T, this[k], k, this)){
					return true;
				}
			}
		}
		return false;
	});
	
	register(Array.prototype, "forEach", function arrayForEach(callbackFn/*, thisArg*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var T;
		if (arguments.length > 1){
			T = arguments[1];
		}
		for (var k = 0; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				callbackFn.call(T, this[k], k, this);
			}
		}
	});
	
	register(Array.prototype, "map", function arrayMap(callbackFn/*, thisArg*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var T;
		if (arguments.length > 1){
			T = arguments[1];
		}
		var A = new Array(len);
		for (var k = 0; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				A[k] = callbackFn.call(T, this[k], k, this);
			}
		}
		return A;
	});
	
	register(Array.prototype, "filter", function arrayFilter(callbackFn/*, thisArg*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var T;
		if (arguments.length > 1){
			T = arguments[1];
		}
		var A = [];
		for (var k = 0; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				var V = this[k];
				if (callbackFn.call(T, this[k], k, this)){
					A.push(V);
				}
			}
		}
		return A;
	});
	
	register(Array.prototype, "reduce", function arrayReduce(callbackFn/*, initialValue*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var k = 0;
		var accumulator;
		if (arguments.length > 1){
			accumulator = arguments[1];
		}
		else {
			if (len === 0){
				throw new TypeError();
			}
			var kPresent = false;
			for (; !kPresent && k < len; k++){
				if ((kPresent = (!this.hasOwnProperty || this.hasOwnProperty(k))) === true){
					accumulator = this[k];
				}
			}
			if (!kPresent){
				throw new TypeError();
			}
		}
		for (; k < len; k++){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				accumulator = callbackFn.call(undefined, accumulator, this[k], k, this);
			}
		}
		return accumulator;
	});
	
	register(Array.prototype, "reduceRight", function arrayReduceRight(callbackFn/*, initialValue*/){
		var len = this.length;
		if (typeof callbackFn !== "function"){
			throw new TypeError();
		}
		var k = len - 1;
		var accumulator;
		if (arguments.length > 1){
			accumulator = arguments[1];
		}
		else {
			if (len === 0){
				throw new TypeError();
			}
			var kPresent = false;
			for (; !kPresent && k >= 0; k--){
				if ((kPresent = (!this.hasOwnProperty || this.hasOwnProperty(k))) === true){
					accumulator = this[k];
				}
			}
			if (!kPresent){
				throw new TypeError();
			}
		}
		for (; k >= 0; k--){
			if (!this.hasOwnProperty || this.hasOwnProperty(k)){
				accumulator = callbackFn.call(undefined, accumulator, this[k], k, this);
			}
		}
		return accumulator;
	});

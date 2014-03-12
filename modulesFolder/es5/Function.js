	// Function methods
	
	register(Function.prototype, "bind", function bind(obj){
		var boundArgs = slice.call(arguments, 1);
		var func = this;
		return function(){
			// if (!obj){
				// obj = this;
			// }
			return func.apply(obj, boundArgs.concat(slice.call(arguments)));
		};
	});
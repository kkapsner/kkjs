	// String methods
	
	register(String.prototype, "trim", (function(){
		var regExp = /^\s\s*|\s*\s$/g;
		return function trim(){
			return this.replace(regExp, "");
		};
	}()));
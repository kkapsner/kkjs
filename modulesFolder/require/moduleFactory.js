	// module creation package
	var moduleFactory = (function(){
		var callbacks = {};
		
		function addCallback(moduleName, callback){
			/* registers a callback for a specific module */
			if (!Object.prototype.hasOwnProperty.call(callbacks, moduleName)){
				callbacks[moduleName] = [];
			}
			callbacks[moduleName].push(callback);
		}
		function fireCallback(moduleName){
			/* fires all registered callbacks for a module */
			if (callbacks[moduleName]){
				callbacks[moduleName].forEach(function(callback){
					try {
						callback();
					}
					catch (e){
						if (typeof console !== "undefined" && console.error){
							console.error("Error in " + module.filename + " callback...");
						}
					}
				});
				delete callbacks[moduleName];
			}
		}
		function createModule(moduleName){
			/* creates and returns the module object */
			return {
				exports: {},
				filename: moduleName,
				exited: false
			};
		}
		
		return {
			addCallback: addCallback,
			fireCallback: fireCallback,
			create: createModule
		};
	}());
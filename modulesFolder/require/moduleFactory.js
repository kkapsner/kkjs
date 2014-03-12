	// module creation package
	var moduleFactory = (function(){
		var callbacks = {};
		
		function addCallback(moduleName, callback){
			if (!Object.prototype.hasOwnProperty.call(callbacks, moduleName)){
				callbacks[moduleName] = [];
			}
			callbacks[moduleName].push(callback);
		}
		function fireCallback(moduleName){
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
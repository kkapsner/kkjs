	// actual require function only joining point between the packages
	var require = (function(){
		return function(moduleName, callback){
			// resolve absolute name
			moduleName = names.resolve(moduleName);
			
			// check in cache
			var cached = cache.get(moduleName);
			
			// distinguish between synchronous and asynchronous call
			var asynch;
			if (typeof callback === "function"){
				// asynch
				if (cached){
					if (cached.exited){
						// call callback in the next tick
						window.setTimeout(function(){
							callback(cached.exports);
						}, 0.1);
					}
					else {
						moduleFactory.addCallback(moduleName, function(){
							callback(cached.exports);
						});
					}
					return;
				}
				asynch = true;
			}
			else {
				// synch
				if (cached){
					// all done...
					return cached.exports;
				}
				asynch = false;
			}
			
			// we have to create the module
			var module = moduleFactory.create(moduleName);
			cache.store(moduleName, module);
			
			if (asynch){
				moduleFactory.addCallback(moduleName, function(){
					callback(module.exports);
				});
			}
			
			XHR.read(
				moduleName,
				asynch,
				function(code){
					names.pushPath(moduleName.replace(/\/[^\/]+(?:\?.+)?$/, ""));
					executeCode(code, module);
					moduleFactory.fireCallback(moduleName);
					names.popPath();
				},
				function(errorStatus){
					throw new Error("Module not found at: " + moduleName + " (" + errorStatus + ")");
				}
			);
			
			if (!asynch){
				return module.exports;
			}
		};
	}());
	
	require.addCacheSearchFunction = cache.addSearchFunction;
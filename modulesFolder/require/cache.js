	// caching package
	var cache = (function(){
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		var modules = {};
		
		var searchFunctions = [];
		
		function getModule(modulePath){
			/* returns desired module */
			for (var i = 0; i < searchFunctions.length; i += 1){
				var module = searchFunctions[i](modulePath);
				if (module){
					storeModule(modulePath, module);
					return module;
				}
			}
		}
		
		function storeModule(modulePath, module){
			/* stores the module in the module cache */
			modules[modulePath] = module;
		}
		
		function addSearchFunction(func){
			/* adds a search function to the cache */
			searchFunctions.push(func);
		}
		
		addSearchFunction(function(modulePath){
			if (hasOwnProperty.call(modules, modulePath)){
				return modules[modulePath];
			}
		});
		
		return {
			addSearchFunction: addSearchFunction,
			get: function(modulePath){
				/* returns the module if it is in the cache */
				return getModule(modulePath);
			},
			store: storeModule
		};
	}());
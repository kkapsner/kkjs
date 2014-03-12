	// caching package
	var cache = (function(){
		var hasOwnProperty = Object.prototype.hasOwnProperty;
		var modules = {};
		
		var searchFunctions = [];
		
		function getModule(modulePath){
			for (var i = 0; i < searchFunctions.length; i += 1){
				var module = searchFunctions[i](modulePath);
				if (module){
					storeModule(modulePath, module);
					return module;
				}
			}
		}
		
		function storeModule(modulePath, module){
			modules[modulePath] = module;
		}
		
		function addSearchFunction(func){
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
				return getModule(modulePath);
			},
			store: storeModule
		};
	}());
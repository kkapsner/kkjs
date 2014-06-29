(function(){
	/**
	 * Browser implementation for the module framework.
	 */
	
	var executeCode = function(code, module){
		/*jshint evil: true, strict: false, unused: false*/
		// globals from node.js
		var global = window;
		// module wide "globals"
		var __filename = module.filename,
		    __dirname = module.filename.replace(/\/[^\/]*$/, ""),
			exports = module.exports;
		try {
			eval(code);
		}
		catch(e){
			if (typeof console !== "undefined" && console.error){
				console.error("Error in " + module.filename);
			}
			e.fileName = e.source = e.href = module.filename;
			throw e;
		}
	};
	
	window.require = (function(){
		"use strict";
	
		// XHR package
		var XHR = (function(){
			var useableXHRObjects = [];
			function createXHR(){
				/* creates and returns a native XHR object*/
				var req;
				if (typeof XMLHttpRequest !== "undefined"){
					req = new XMLHttpRequest();
				}
				else if (typeof ActiveXObject !== "undefined"){
					var tries = ["Msxml2.XMLHTTP.7.0", "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
					for (var i = 0; i < tries.length; i += 1){
						try{
							req = new ActiveXObject(tries[i]);
							break;
						}
						catch (e){}
					}
				}
				if (!req){
					throw new Error("Error creating request object!");
				}
				return req;
			}
			function getXHR(){
				/* returns a recycled XHR or creates a new one */
				if (useableXHRObjects.length){
					return useableXHRObjects.pop();
				}
				else {
					return createXHR();
				}
			}
			function depositXHR(xhr){
				/* stores the XHR for recycling */
				useableXHRObjects.push(xhr);
			}
			function createCallback(callback, successCallback, failCallback){
				/* creates the onreadystatechange event callback */
				return function(){
					/*jshint validthis: true*/
					if (this.readyState === 4){
						var code = this.responseText;
						
						callback();
						try {
							this.responseText = "";
							this.responseXML = null;
						} catch(e){}
						
						if (this.status !== 0 && this.status !== 200 && this.status !== 304){
							failCallback(this.status);
						}
						else {
							successCallback(code);
						}
					}
				}
			}
			
			return {
				read: function(url, asynch, successCallback, failCallback){
					/* reads the URL and executes the appropriate callback */
					var xhr = getXHR();
					var callback = createCallback(
						function(){
							depositXHR(xhr);
						},
						successCallback,
						failCallback
					);
					xhr.open("GET", url, asynch);
					if (asynch){
						xhr.onreadystatechange = callback;
					}
					xhr.send(null);
					if (!asynch){
						callback.call(xhr);
					}
				}
			};
		}());
	
		// name resolution package
		var names = (function(){
			
			function canonicalise(url){
				/* function to bring urls in a canonical form*/
				var protocol, host, path, search;
				var separatorIndex = url.indexOf("//");
				if (separatorIndex === -1){
					protocol = window.location.protocol;
					host = window.location.host;
				}
				else {
					protocol = url.substr(0, separatorIndex) || window.loaction.protocol;
					url = url.substr(separatorIndex + 2);
					
					separatorIndex = url.indexOf("/");
					if (separatorIndex === -1){
						host = url;
						url = "";
					}
					else {
						host = url.substr(0, separatorIndex);
						url = url.substr(separatorIndex);
					}
				}
				
				separatorIndex = url.indexOf("?");
				if (separatorIndex === -1){
					search = "";
				}
				else {
					search = url.substr(separatorIndex);
					url = url.substr(0, separatorIndex);
				}
				
				path = url
					// replace backslash by normal slash
					.replace(/\\+/g, "/")
					// remove double slashes
					.replace(/\/+/g, "/")
					// remove leading dots and slashes
					.replace(/^(?:\.{0,2}\/)+/, "")
					// resolce double dot references
					.replace(/\/[^\/]+\/\.{2}\//g, "/")
					// remove dot self references
					.replace(/\/\.\//g, "/");
				
				return protocol + "//" + host + "/" + path + (search? "?" + search: "");
			}
			
			// get base-url (the url of this script)
			var scripts = document.getElementsByTagName("script");
			var checkRE = /(^.*?)[^\/]*require\.js(?:$|\?|#)/, match;
			
			var moduleBase = "";
			for (var i = scripts.length - 1; i >= 0; i--){
				if ((match = checkRE.exec(scripts[i].src)) !== null){
					moduleBase = match[1];
					break;
				}
			}
			moduleBase = canonicalise(moduleBase);
			
			var pathStack = [];
			
			var root = window.location.protocol + "//" + window.location.host;
			
			function getPath(){
				/* returns the current path to look for the scripts */
				if (pathStack.length){
					return pathStack[pathStack.length - 1];
				}
				else {
					return moduleBase;
				}
			}
			function getRoot(){
				/* returns the root directory */
				return root;
			}
			function getModuleBase(){
				/* returns the base directory for modules */
				return moduleBase;
			}
			
			return {
				resetPath: function(){
					/* resets the path stack */
					pathStack = [];
				},
				pushPath: function(path){
					/* add a directory to the path stack */
					pathStack.push(canonicalise(path));
				},
				popPath: function(){
					/* removes the last entry in the path stack */
					return pathStack.pop();
				},
				resolve: function(modulePath){
					/* resolve a module path to the complete path */
					
					// if we do not have a .js
					if (!modulePath.match(/\.js$/)){
						modulePath += ".js";
					}
					// root pattern: "/some.file.name"
					if (modulePath.match(/^\/[^\/]/)){
						return canonicalise(getRoot() + modulePath);
					}
					// path pattern: "./some.file.name"
					if (modulePath.match(/^\.{1,2}\//)){
						return canonicalise(getPath() + "/" + modulePath);
					}
					// direct url pattern: "http://domain.org/some.file.name"
					if (modulePath.match(/^(?:https?:)?\/\//)){
						return canonicalise(modulePath);
					}
					// none of the others === module base pattern: "some.file.name"
					return canonicalise(getModuleBase() + "/" + modulePath);
				}
			};
		}());
	
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
	
		return require;
	}());
}());
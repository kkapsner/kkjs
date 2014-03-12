var require = (function(){
	"use strict";
	
	// XHR package
	function LoadingModule(name){
		this.name = name;
		this.queue = [];
	}
	LoadingModule.prototype = {
		constructor: LoadingModule,
		addOnload: function(func){
			this.queue.push(func);
		},
		onload: function(module){
			for (var i = 0; i < this.queue.length; i++){
				this.queue[i](module);
			}
			this.queue = [];
			delete loadingModules[this.name];
		}
	};
	
	var loadingModules = {};
	
	var useableXHRObjects = [];
	
	function finishRequest(module, code){
		require.executeCode(code, module);
		module.loaded = true;
		if (loadingModules.hasOwnProperty(module.id)){
			loadingModules[module.id].onload(module);
		}
		module.exited = true;
		return module;
	}
	
	function getXHRObject(){
		if (useableXHRObjects.length){
			return useableXHRObjects.pop();
		}
		var req;
		if (typeof XMLHttpRequest !== "undefined"){
			req = new XMLHttpRequest();
		}
		else if(typeof ActiveXObject !== "undefined"){
			var tries = ["Msxml2.XMLHTTP.7.0", "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
			for (var i = 0; i < tries.length; i++){
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
	
	// perform XHR-request
	function doRequest(path, asynch){
		var req = getXHRObject();
		req.open(
			"GET",
			path,
			asynch
		);
		
		var module = cache.createModuleObject(path);
		module.filename = path;
		
		function onRSChange(){
			/*jshint validthis: true*/
			if (this.readyState === 4){
				var code = this.responseText;
				
				useableXHRObjects.push(req);
				try {
					this.responseText = "";
					this.responseXML = null;
				} catch(e){}
				
				if (this.status !== 0 && this.status !== 200 && this.status !== 304){
					delete require.cache[module.id];
					throw new Error("Module " + path + " not found! (HTTP status code " + this.status + ")");
				}
				else {
					return finishRequest(module, code);
				}
			}
			return null;
		}
		if (asynch){
			req.onreadystatechange = onRSChange;
		}
		req.send(null);
		if (!asynch){
			return onRSChange.call(req);
		}
		return req;
	}
	
	
	// asynchronous package
	function asynchRequire(module, callbackFn){
		var reqFinished = 0;
		var exportsArr = [];
		function getOnloadFunction(i){
			return function(m){
				exportsArr[i] = m.exports;
				reqFinished++;
				if (reqFinished === module.length){
					// perform in next tic to avoid synchronity-problems
					window.setTimeout(function(){
						callbackFn.apply(undefined, exportsArr);
					}, 1);
				}
			};
		}
		
		// asynchronous loading
		if (!(module instanceof Array)){
			module = [module];
		}
		var path, ret;
		for (var i = 0; i < module.length; i++){
			if (typeof module[i] !== "string" && !(module[i] instanceof String)){
				throw new TypeError("module parameter is not a string");
			}
			path = require.resolve(module[i]);
			if ((ret = cache.getModule(module[i], path)) !== false){
				getOnloadFunction(i)(ret);
				continue;
			}
			if (!loadingModules.hasOwnProperty(path)){
				loadingModules[path] = new LoadingModule(path);
				loadingModules[path].addOnload(getOnloadFunction(i));
				doRequest(path, true);
			}
			else {
				loadingModules[path].addOnload(getOnloadFunction(i));
			}
		}
		return exportsArr;
	}
	
	
	// actual function
	var require = function(module, callbackFn){
		// asynchronous loading
		if (typeof callbackFn === "function" || callbackFn instanceof Function){
			return asynchRequire(module, callbackFn);
		}
		
		// synchronous loading
		if (typeof module !== "string" && !(module instanceof String)){
			throw new TypeError("module parameter is not a string");
		}
		var path = require.resolve(module);
		var ret = cache.getModule(module, path);
		if (!ret){
			ret = doRequest(path, false);
		}
		return ret.exports;
	};
	
	// require.resolve package
	// get base-url (the url of this script)
	var scripts = document.getElementsByTagName("script");
	var checkRE = /(^.*?)[^\/]*require\.js(?:$|\?|#)/, match;
	
	var requireBase = "";
	for (var i = scripts.length - 1; i >= 0; i--){
		if ((match = checkRE.exec(scripts[i].src)) !== null){
			requireBase = match[1] + requireBase;
			break;
		}
	}
	requireBase = canonicalise(requireBase);
	
	function canonicalise(url, base){
		url = url.replace(/\\/g, "/");
		if (!base){
			base = location.href;
		}
		else {
			base = canonicalise(base);
		}
		// If not absolute path
		if (/^(?:[a-z+.\-]+:)?\/\//i.test(url)){
		}
		else {
			if (url.charAt(0) === "/"){
				
			}
		}
		
		// remove relative dots
		url = url.replace(/\/[^\/]+\/\.\.\//g, "/").replace(/\/\.\//g, "/");
		
		return url
	}
	
	require.resolve = function(modulePath){
		if (!modulePath.match(/^\.{0,2}\//)){
			modulePath = requireBase + modulePath;
		}
		if (!modulePath.match(/\.js$/)){
			modulePath += ".js";
		}
		return canonicalise(modulePath);
	};
	
	
	// require.cache package
	require.cache = {};
	
	var cache = {
		createModuleObject: function(id){
			require.cache[id] = {
				id: id,
				exports: {},
				parent: null,
				filename: null,
				loaded: false,
				exited: false,
				children: [],
				paths: [requireBase]
			};
			return require.cache[id];
		},
		searchFunctions: [],
		addSearchFunction: function(func){
			if (typeof func !== "function" && !(func instanceof Function)){
				throw new TypeError();
			}
			cache.searchFunctions.push(func);
			
		},
		getModule: function(module, path){
			for (var i = this.searchFunctions.length - 1; i >= 0; i--){
				var ret = this.searchFunctions[i](module, path);
				if (ret){
					return ret;
				}
			}
			return false;
		}
	};
	cache.addSearchFunction(function(module, path){
		if (require.cache.hasOwnProperty(path)){
			return require.cache[path];
		}
		return false;
	});
	require.addCacheSearchFunction = cache.addSearchFunction;
	
	return require;
})();

require.executeCode = function(code, module){
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
		e.fileName = e.source = e.href = module.filename;
		throw e;
	}
	return exports;
};
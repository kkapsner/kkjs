(function(evaluate){
"use strict";

var scripts = document.getElementsByTagName("script");
var rootScript = scripts[scripts.length - 1];
var corePath = rootScript.src.replace(/[^\/]+$/, "");
var rootPath = corePath.replace(/[^\/]+\/$/, "");
var modulePath = rootPath + "module/";

function unifyPath(path, base){
	base = base || modulePath;
	
	if (!path.match(/\.js$/)){
		path += ".js";
	}
	if (path.charAt(0) === "/"){
		return path;
	}
	if (path.substring(0, 2) === "./"){
		return base + path.substring(2);
	}
	return rootPath + path;
}

var modulesCache = Object.create(null);
function getModulePromise(path){
	if (!modulesCache[path]){
		modulesCache[path] = new Promise(function(resolve, reject){
			var xhr = new XMLHttpRequest();
			xhr.open("GET", path, true);
			xhr.onreadystatechange = function(){
				if (this.readyState === 4){
					try{
						// IE9 bug
						var status = 0;
						try {
							status = this.status;
						} catch(error){}
						if (status === 0 || status === 200 || status === 304){
							var directory = path.replace(/[^\/]+$/, "");
							var module = {
								load: function(modules){
									return loadModule(modules, directory);
								},
								resolve: resolve,
								info: {
									path: path,
									directory: directory
								}
							};
							evaluate(this.responseText, module);
						}
						else {
							reject(status);
						}
					}
					catch(e){
						reject(e);
					}
				}
			};
			xhr.send();
		});
	}
	
	return modulesCache[path];
}
function loadModule(modules, base){
	if (!Array.isArray(modules)){
		modules = [modules];
	}
	var promises = modules.map(function(module){
		return unifyPath(module, base);
	}).map(function(path){
		return getModulePromise(path);
	});
	return Promise.all(promises);
}
window.module = {
	info: {
		
	},
	load: function (modules){
		var scripts = document.getElementsByTagName("script");
		var rootScript = scripts[scripts.length - 1];
		var base = rootScript.src.replace(/[^\/]+$/, "");
		return loadModule(modules, base);
	}
};
}(
	function(js, module){
		eval(js);
	}
));
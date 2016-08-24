(function(){
"use strict";

var scripts = document.getElementsByTagName("script");
var rootScript = scripts[scripts.length - 1];
var corePath = rootScript.src.replace(/[^\/]+$/, "");
var rootPath = corePath.replace(/[^\/]+\/$/, "");
var modulePath = rootPath + "module/";

function unifyPath(path){
	if (!path.match(/\.js$/)){
		path += ".js";
	}
	return rootPath + path;
}

var modulesCache = Object.create(null);
function getModulePromise(path){
	if (!modulesCache[path]){
		modulesCache[path] = new Promise(function(resolve, reject){
			var xhr = new XMLHttpRequest();
			xhr.open("GET", path, true);
			xhr.onreadystatechange = function(js){
				if (this.readyState === 4){
					try{
						if (status === 0 || status === 200 || status === 304){
							var moduleInfo = {
								path: path
							};
							var exports = {};
							eval(js);
							resolve(exports);
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
window.module = function(modules){
	if (!Array.isArray(modules)){
		modules = [modules];
	}
	var promises = modules.map(function(module){
		return unifyPath(module);
	}).map(function(path){
		return getModulePromise(path);
	});
	return Promise.all(promises);
}
}());
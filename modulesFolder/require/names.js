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
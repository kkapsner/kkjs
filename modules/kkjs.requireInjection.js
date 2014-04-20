/* no module
 * just enables the faster HTML loading cache.
 * This cannot be done in the callback-function of the kkjs.require.js because
 * the execution of the following modules starts in IE before the callback is
 * fired.
 */

require.addCacheSearchFunction(function(module){
	"use strict";
	
	module = module.replace(/\.js$/, "");
	var m;
	if ((m = /kkjs\.([^\/]+)$/.exec(module)) !== null){
		var path = m[1].split(".");
		var obj = kkjs;
		for (var i = 0; i < path.length && obj; i++){
			obj = obj[path[i]];
		}
		if (obj){
			return {
				exited: true,
				filename: module,
				exports: obj
			};
		}
	}
	return false;
});
(function(){
"use strict";

/**
 * Object QueryString
 * @name: QueryString
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: Representation of an QueryString - url-encoded data...
 */

var oo = require("./kkjs.oo");

var objToString = Object.prototype.toString;
function isObject(obj){
	/* check function is a variable is an object */
	return typeof obj === "object" && obj !== null;
}

var QueryString = oo.Base.extend(function(str){
	this.readData(str);
}).implement({
	
	put: function(key, value){
		/**
		 * Function QueryString.prototype.put
		 * @name: QueryString.prototype.put
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: sets a key-value pair in the QueryString-object
		 * @parameter:
		 *
		 */
		
		this.data[key] = value;
	},
	get: function(key){
		/**
		 * Function QueryString.prototype.get
		 * @name: QueryString.prototype.get
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: gets the value of a key in the QueryString-object
		 * @parameter:
		 *	key:
		 * @return value: the value of the key or null.
		 */
		
		return (key in this.data)? this.data[key]: null;
	},
	getKeys: function(){
		/**
		 * Function QueryString.prototype.getKeys
		 * @name: QueryString.prototype.getKeys
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: gets all keys in the QueryString-object
		 * @return value: array of all found keys.
		 */
		
		var ret = [];
		for (var i in this.data){
			if (this.data.hasOwnProperty(i)){
				ret.push(i);
			}
		}
		return ret;
	},
	del: function(name){
		/**
		 * Function QueryString.prototype.del
		 * @name: QueryString.prototype.del
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: deletes a key in the QueryString-object
		 * @parameter:
		 *	name: the name of the key
		 */
		
		delete this.data[name];
	},
	readData: function(str){
		/**
		 * Function QueryString.prototype.readData
		 * @name: QueryString.prototype.readData
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: reads all data from the string
		 * @parameter:
		 *	str: the string to be parsed
		 * @return value: this
		 */
		
		this.data = QueryString.parse(str);
		return this;
	},
	toString: function(){
		/**
		 * Function QueryString.prototype.toString
		 * @name: QueryString.prototype.toString
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: produces a query string from the object
		 * @return value: the string.
		 */
		
		return QueryString.stringify(this.data);
	}
}).implementStatic({
	parse: function(str){
		/**
		 * Function QueryString.parse
		 * @name: QueryString.parse
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: parses a string of query-parameter (e.g. dd=2&df=2)
		 *	into an object or array (if possible).
		 * @parameter:
		 *	str: the string to parse
		 * @return value: the parsed object.
		 */
		
		var ret = {};
		var retInfo = {};
		if (str.charAt(0) === "?"){
			str = str.substr(1);
		}
		str.split("&").forEach(function(param){
			var par = param.split("=");
			switch (par.length){
				case 1:
					par[1] = "";
					break;
				case 2:
					break;
				default:
					par[1] = par.slice(1).join("=");
			}
			var parts = [];
			var name = decodeURIComponent(par[0]).replace(/\][^\[].+/, "]").replace(/\[([^\]]*)\]/g, function(m, c){parts.push(c); return "";});
			var value = decodeURIComponent(par[1]);
			if (!name){
				return;
			}
			var partsLength = parts.length;
			if (!partsLength){
				ret[name] = value;
			}
			else {
				if (!isObject(ret[name])){
					ret[name] = {};
					retInfo[name] = {nextIndex: 0, subObjects: {}, onlyDiggits: true};
				}
				var obj = ret[name];
				var objInfo = retInfo[name];
				parts.forEach(function(name, i){
					if (!name){
						name = objInfo.nextIndex;
						objInfo.nextIndex++;
					}
					
					var diggitName = /^\d+$/.test(name);
					if (!diggitName){
						objInfo.onlyDiggits = false;
					}
					
					if (i === partsLength - 1){
						obj[name] = value;
					}
					else {
						if (!isObject(obj[name])){
							obj[name] = {};
							objInfo.subObjects[name] = {nextIndex: 0, subObjects: {}, onlyDiggits: true};
						}
						if (diggitName){
							if (name > objInfo.nextIndex){
								objInfo.nextIndex = parseInt(name, 10) + 1;
							}
						}
						obj = obj[name];
						objInfo = objInfo.subObjects[name];
					}
				});
			}
		});
		function toArrayIfPossible(obj, objInfo){
			/* Converts to an array if it is possible */
			
			if (!isObject(obj)){
				return obj;
			}
			var ret = objInfo.onlyDiggits? []: obj;
			for (var i in obj){
				if (obj.hasOwnProperty(i)){
					ret[i] = toArrayIfPossible(obj[i], objInfo.subObjects[i]);
				}
			}
			return ret;
		}
		return toArrayIfPossible(ret, {onlyDiggits: false, subObjects: retInfo});
	},
	stringify: function stringify(value){
		/**
		 * Function QueryString.parse
		 * @name: QueryString.parse
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: creates a query string out of an array or object.
		 * @parameter:
		 *	value: the string to parse
		 * @return value: the query string
		 */
		
		var stringifyStack = [];
		function process(value, namescope){
			/* procession function */
			// recursion detection
			if (stringifyStack.indexOf(value) > -1){
				throw new TypeError("recursive structure");
			}
			stringifyStack.push(value);
			
			namescope = (namescope || "");
			var ret = [];
			if (namescope && Array.isArray(value)){
				var name = namescope + "[";
				value.forEach(function(value, i){
					ret.push(process(value, name + i + "]"));
				});
			}
			else if (isObject(value)){
				for (var name in value){
					if (value.hasOwnProperty(name)){
						var v = value[name];
						if (namescope){
							name = namescope + "[" + name + "]";
						}
						ret.push(process(v, name));
					}
				}
			}
			else {
				stringifyStack.pop();
				return encodeURIComponent(namescope) + "=" + encodeURIComponent(value);
			}
			
			stringifyStack.pop();
			return ret.join("&");
		}
		
		return process(value);
	}
});


if (typeof exports !== "undefined"){
	module.exports = QueryString;
}
else if (typeof kkjs !== "undefined"){
	kkjs.QueryString = QueryString;
}

})();
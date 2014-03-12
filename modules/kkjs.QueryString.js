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
var is = require("./kkjs.is");

var QueryString = oo.Base.extend(function(str){
	this.readData(str);
}).implement({
	
	/**
	 * Function QueryString.prototype.put
	 * @name: QueryString.prototype.put
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: sets a key-value pair in the QueryString-object
	 * @parameter:
	 *
	 */
	put: function(key, value){
		this.data[key] = value;
	},
	get: function(key){
		return (key in this.data)? this.data[key]: null;
	},
	getKeys: function(){
		var ret = [];
		for (var i in this.data){
			if (this.data.hasOwnProperty(i)){
				ret.push(i);
			}
		}
		return ret;
	},
	del: function(name){
		delete this.data[name];
	},
	readData: function(str){
		this.data = QueryString.parse(str);
		return this;
	},
	toString: function(){
		return QueryString.stringify(this.data);
	}
}).implementStatic({
	parse: function(str){
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
				if (!is.object(ret[name])){
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
						if (!is.object(obj[name])){
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
			if (!is.object(obj)){
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
		var stringifyStack = [];
		function process(value, namescope){
			// recursion detection
			if (stringifyStack.indexOf(value) > -1){
				throw new TypeError("recursive structure");
			}
			stringifyStack.push(value);
			
			namescope = (namescope || "");
			var ret = [];
			if (namescope && is.array(value)){
				var name = namescope + "[";
				value.forEach(function(value, i){
					ret.push(process(value, name + i + "]"));
				});
			}
			else if (is.object(value)){
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
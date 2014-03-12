/*global JSON: true */
(function(){
"use strict";

function forEach(arr, callbackFn){
	var thisArg = (arguments.length > 2)? arguments[2]: undefined;
	var l = arr.length;
	for (var i = 0; i - l; ++i){
		if (callbackFn.call(thisArg, arr[i], i, arr) === false){
			return true;
		}
	}
	return false;
}

if (typeof JSON === "undefined"){
	
	var is = require("kkjs.is");
	
	JSON = {
		parse: (function(){
			var reviver;
			function walk(holder, name){
				var val = holder[name];
				if (typeof val === "object"){
					if (is.array(val)){
						forEach(val, function(el, i){
							var newElement = walk(val, i);
							if (newElement === undefined){
								delete val[i];
							}
							else {
								val[i] = newElement;
							}
						});
					}
					else {
						for (var P in val){
							if (val.hasOwnProperty(P)){
								var newElement = walk(val, P);
								if (newElement === undefined){
									delete val[P];
								}
								else {
									val[P] = newElement;
								}
							}
						}
					}
				}
				return reviver.call(holder, name, val);
			}
			return function(text /*, reviver*/){
				/*jshint evil: true*/
				reviver = (arguments.length > 1)? arguments[1]: undefined;
				
				// check grammar
				var value = (text.match(/(\x1A+)/)? RegExp.$1: "") + "\x1A";
				var key = (text.match(/(\x1B+)/)? RegExp.$1: "") + "\x1B";
				var check = text
					.replace(/"(?:[^"\\\n\r]|\\.)*"\s*:/g, key)									//keys in objects
					.replace(/"(?:[^"\\\n\r]|\\.)*"/g, value)									//strings
					.replace(/(?:null|true|false)/g, value)										//null, true and false
					.replace(/-?(?:(?:[1-9]\d*|0)(?:\.\d*)?|\.\d+)(?:[eE][+\-]?\d+)?/g, value)	//numbers
					.replace(/\s+/g, "");														//remove any formating spaces
				
				// remove arrays and objects
				var structRegExp = new RegExp("\\[(?:\\x1A{" + value.length + "}(?:,\\x1A{" + value.length + "})*)?\\]|\\{(?:\\x1B{" + key.length + "}\\x1A{" + value.length + "}(?:,\\x1B{" + key.length + "}\\x1A{" + value.length + "})*)?\\}", "g");
				
				while (check !== (check = check.replace(structRegExp, value))){}
				
				if (check !== value){
					throw new SyntaxError("invalid JSON structure");
				}
				
				var unfiltered = eval("(" + text + ")");
				
				if (is["function"](reviver)){
					return walk({"": unfiltered}, "");
				}
				else{
					return unfiltered;
				}
			};
		})(),
		stringify: (function(){
			var space, stack, indent, PropertyList, ReplacerFunction, gap;
			function str(key, holder){
				var value = holder[key];
				
				if (is.object(value)){
					if (is["function"](value.toJSON)){
						value = value.toJSON(key);
					}
				}
				if (ReplacerFunction !== undefined){
					value = ReplacerFunction.call(holder, key, value);
				}
				if (value === null){
					return "null";
				}
				if (is["boolean"](value)){
					return value? "true": "false";
				}
				if (is.string(value)){
					return quote(value);
				}
				if ((typeof value === "number") || value instanceof Number){
					return isFinite(value)? value.toString(): "null";
				}
				if (is.array(value)){
					return ja(value);
				}
				if (typeof value === "object" && !is["function"](value)){
					return jo(value);
				}
				return undefined;
			}
			
			var strQuotes = {
				"\"": "\\\"",
				"\\": "\\\\",
				"/": "\\/",
				"\b": "\\b",
				"\n": "\\n",
				"\r": "\\r",
				"\f": "\\f",
				"\t": "\\t"
			};
			function quote(value){
				var product = "\"";
				var l = value.length;
				for (var i = 0; i - l; i++){
					var C = value.charAt(i);
					if (strQuotes[C]){
						product += strQuotes[C];
					}
					else if (C < " "){
						var hex = C.charCodeAt(0).toString(16).toUpperCase();
						while(hex.length < 4){
							hex = "0" + hex;
						}
						product += "\\u" + hex;
					}
					else {
						product += C;
					}
				}
				return product + "\"";
			}
			
			function jo(value){
				if (stack.indexOf(value) !== -1){
					throw new TypeError("recursive structure");
				}
				stack.push(value);
				
				var stepback = indent;
				indent += gap;
				var partial = [];
				if (PropertyList){
					forEach(PropertyList, function(P){
						var strP = str(P, value);
						if (strP !== undefined){
							partial.push(quote(P) + ":" + (gap.length? space: "") + strP);
						}
					});
				}
				else {
					for (var i in value){
						if (value.hasOwnProperty(i)){
							var strP = str(i, value);
							if (strP !== undefined){
								partial.push(quote(i) + ":" + (gap.length? space: "") + strP);
							}
						}
					}
				}
				var finaly;
				if (partial.length === 0){
					finaly = "{}";
				}
				else {
					if (gap.length === 0){
						finaly = "{" + partial.join(",") + "}";
					}
					else {
						finaly = "{\n" + indent + partial.join(",\n" + indent) + "\n" + stepback + "}";
					}
				}
				stack.pop();
				indent = stepback;
				return finaly;
			}
			
			function ja(value){
				if (stack.indexOf(value, stack) !== -1){
					throw new TypeError("recursive structure");
				}
				stack.push(value);
				
				var stepback = indent;
				indent += gap;
				var partial = [];
				forEach(value, function(v, i){
					var strP = str(i.toString(), value);
					if (strP === undefined){
						partial.push("null");
					}
					else {
						partial.push(strP);
					}
				});
					
				var finaly;
				if (partial.length === 0){
					finaly = "[]";
				}
				else {
					if (gap.length === 0){
						finaly = "[" + partial.join(",") + "]";
					}
					else {
						finaly = "[\n" + indent + partial.join(",\n" + indent) + "\n" + stepback + "]";
					}
				}
				stack.pop();
				indent = stepback;
				return finaly;
			}
			
			
			
			return function(value /*, replacer, space*/){
				var replacer = (arguments.length > 1)? arguments[1]: undefined;
				space = (arguments.length > 2)? arguments[2]: undefined;
				
				stack = [];
				indent = "";
				PropertyList = undefined;
				ReplacerFunction = undefined;
				
				if (is["function"](replacer)){
					ReplacerFunction = replacer;
				}
				if (is.array(replacer)){
					PropertyList = [];
					forEach(replacer, function(v){
						var item;
						if (is.string(v)){
							item = v;
						}
						else if (is.number(v)){
							item = v.toString();
						}
						if (typeof v !== "undefined" && PropertyList.indexOf(v) === -1){
							PropertyList.push(v);
						}
					});
				}
				if (is.number(space)){
					space = Math.min(10, parseInt(space, 10));
					gap = "";
					for (var i = 0; i < space; i++){
						gap += " ";
					}
				}
				else if (is.string(space)){
					gap = (space.length > 10)? space.substring(0, 10): space;
				}
				else {
					gap = "";
				}
				return str("", {"": value});
			};
		})()
	};
}

if (typeof kkjs !== "undefined"){
	/** Object kkjs.JSON
	 * @name: kkjs.JSON
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: provides functionality to de- and encode JSON-strings
	 */
	
	kkjs.JSON = {
		/**
		 * Function kkjs.JSON.encode
		 * @name kkjs.JSON.encode
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: encodes a given object to JSON
		 * @parameter:
		 *	obj:
		 * @return value: the encoded JSON-string
		 */
		
		encode: function encodeJSON(obj){
			return JSON.stringify(obj);
		},
		
		/**
		 * Function kkjs.JSON.decode
		 * @name kkjs.JSON.decode
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: decodes a given JSON-string
		 * @parameter:
		 *	str:
		 * @return value: the decoded object
		 */
		
		decode: function decodeJSON(str){
			return JSON.parse(str);
		}
	};
}

}).apply();
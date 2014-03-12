	// JSON

	if (typeof JSON === "undefined"){
		
		JSON = {
			parse: (function(){
				var reviver;
				function walk(holder, name){
					var val = holder[name];
					if (typeof val === "object"){
						if (Array.isArray(val)){
							val.forEach(function(el, i){
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
					
					if (typeof reviver === "function" || objectToString.call(reviver) === "[object Function]"){
						return walk({"": unfiltered}, "");
					}
					else{
						return unfiltered;
					}
				};
			})(),
			stringify: (function(){
				var stack, indent, PropertyList, ReplacerFunction, gap;
				function str(key, holder){
					var value = holder[key];
					
					var str = objectToString.call(value);
					var type = typeof value;
					
					if (value === null){
						return "null";
					}
					if (type === "object"){
						if (typeof value.toJSON === "function"){
							value = value.toJSON(key);
						}
					}
					if (ReplacerFunction !== undefined){
						value = ReplacerFunction.call(holder, key, value);
					}
					if (type === "boolean" || str === "[object Boolean]"){
						return value? "true": "false";
					}
					if (type === "string" || str === "[object String]"){
						return quote(value);
					}
					if (type === "number" || str === "[object Number]"){
						return isFinite(value)? value.toString(): "null";
					}
					if (Array.isArray(value)){
						return ja(value);
					}
					if (type === "object" && str !== "[object Function]"){
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
					if (!PropertyList){
						PropertyList = Object.keys(value);
					}
					PropertyList.forEach(function(P){
						var strP = str(P, value);
						if (strP !== undefined){
							partial.push(quote(P) + ":" + (gap.length? " ": "") + strP);
						}
					});
					
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
					value.forEach(function(v, i){
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
					var space = (arguments.length > 2)? arguments[2]: undefined;
					
					stack = [];
					indent = "";
					PropertyList = undefined;
					ReplacerFunction = undefined;
					
					if (typeof replacer === "function" || objectToString.call(replacer) === "[object Function]"){
						ReplacerFunction = replacer;
					}
					if (Array.isArray(replacer)){
						PropertyList = [];
						replacer.forEach(function(v){
							var item;
							var type = typeof v;
							var str = objectToString.call(v);
							if (type === "string" || str === "[object String]"){
								item = v;
							}
							else if (type === "number" || str === "[object Number]"){
								item = v.toString(10);
							}
							if (typeof v !== "undefined" && PropertyList.indexOf(v) === -1){
								PropertyList.push(v);
							}
						});
					}
					if (typeof space === "number" || objectToString.call(space) === "[object Number]"){
						space = Math.min(10, parseInt(space, 10));
						gap = "";
						for (var i = 0; i < space; i++){
							gap += " ";
						}
					}
					else if (typeof space === "string" || objectToString.call(space) === "[object String]"){
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
/*jshint devel: true*/
(function(){
"use strict";

/* @name: Debug
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 12.05.2009
 * @description: sparsame Variante von Debug
 */

function createMessageReceiver(callbackFn){
	var rec = function(message){
		try{
			rec.messages.push(message);
			rec.clearMessageStack();
			callbackFn(message);
		}
		catch(e){
			rec.messageStack.push(message);
		}
	};
	rec.messages = [];
	rec.messageStack = [];
	rec.clearMessageStack = function(){
		for (var i = 0; i < rec.messageStack.length; i++){
			callbackFn(rec.messageStack[i]);
		}
	};
	return rec;
}

var Debug = {
	getFunctionName: function(func){
		return (("name" in func)? func.name: func.toString().match(/^\s*function(?:\s+([^\(\)]+))?\s*\(/)[1]) || "{anonymous}";
	},
	getCallingStack: function getCallingStack(maxDepth){
		if (!maxDepth){
			maxDepth = 10;
		}
		var stack = [];
		var caller = Debug.getCallingStack;
		var i = 0;
		while ((caller = caller.caller) && i < maxDepth){
			stack.push(caller);
			i++;
		}
		return stack;
	},

	status: true,
	
	getElements: function(obj, re, wre){
		if (!re){
			re = /./;
		}
		if (!wre){
			wre = /.*/;
		}
		
		var name = "[object]";
		if (typeof obj === "undefined"){
			name = "undefined";
		}
		else if (obj.toString){
			name = obj.toString();
		}
		
		if (name.length > 50){
			name = name.substring(0,50) + " ...";
		}
		
		var text = "Elemente von " + name + " :\n";
		for (var i in obj){
			if (re.test(i)){
				var wert = "nicht anzeigbar";
				try{
					wert = obj[i];
					if (wre.test(wert)){
						text += i + ": " + wert + "\n";
					}
				}
				catch(e){
					text += i + ": nicht anzeigbar\n";
				}
			}
		}
		return text;
	},
	
	alert: function(str){
		if (this.status){
			if (/\n/.test(str)){
				alert(str);
			}
			else{
				window.status = "Bereit";
				if (window.status === "Bereit"){
					window.status = str;
				}
				else{
					alert(str);
				}
			}
			return true;
		}
		else {
			window.status = "Debug.alert(" + str + ")";
		}
		return false;
	},
	
	print_r: function(obj, depth){
		if (!depth || isNaN(depth)){
			depth = 5;
		}
		switch (typeof obj){
			case "function":
				return "function(){ ... }";
			case "number":
				return obj.toString(10);
			case "string":
				return JSON.stringify(obj);
			case "undefined":
				return "undefined";
			case "boolean":
				return obj.toString();
			case "object":
				if (obj === null){
					return "null";
				}
				else if (Array.isArray(obj)){
					if (!depth){
						return "[ ... ]";
					}
					var ret = "[\n\t";
					obj.forEach(function(el, i){
						ret += Debug.print_r(el, depth - 1).replace(/\n/g, "\n\t");
						if (i !== obj.length - 1){
							ret += ",\n\t";
						}
					});
					return ret + "\n]";
				}
				else {
					if (!depth){
						return "{ ... }";
					}
					var ret = [];
					for (var i in obj){
						ret.push(Debug.print_r(i) + ": " + Debug.print_r(obj[i], depth - 1).replace(/\n/g, "\n\t"));
					}
					return "{\n\t" + ret.join("\n\t") + "\n}";
				}
		}
		return "";
	},
	
	elementAlert : function(obj,re, wre){
		return this.alert(this.getElements(obj,re, wre));
	},
	
	elementAlertWin: function(obj, re, wre){
		var win = window.open("", "_blank");
		var doc = win.document;
		doc.write("<!DocType html><html><head><title>Elementausgabe</title></head><body><pre id='alert'></pre></body></html>");
		doc.close();
		doc.getElementById("alert").appendChild(doc.createTextNode(this.getElements(obj, re, wre)));
	},
	
	errorList: ["Unbekannter Fehler", "Ihr Browser unterstützt diese Funktion nicht."],
	
	error: function(errorNumber){
		var name = this.getFunctionName(Debug.error.caller);
		
		if (typeof errorNumber !== "string"){
			if (typeof errorNumber !== "number" || errorNumber >= this.errorList.length){
				errorNumber = 0;
			}
			errorNumber = this.errorList[errorNumber];
		}
		throw new Error(name + "() -> Error: " + errorNumber);
	},
	
	warn: createMessageReceiver(function(warning){
			console.warn(warning);
	}),
	info: createMessageReceiver(function(info){
			console.info(info);
	})
};

if (typeof exports !== "undefined"){
	for (var i in Debug){
		if (Debug.hasOwnProperty(i)){
			exports[i] = Debug[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.Debug = Debug;
}

}).apply();
/*jshint devel: true*/
(function(){
"use strict";

/* @name: Debug
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 12.05.2009
 * @description: sparsame Variante von Debug
 */

var Debug = {
	getCallingStack: function getCallingStack(maxDepth){
		/**
		 * Function Debug.getCallingStack
		 * @name: Debug.getCallingStack
		 * @author: Korbinian Kapsner
		 * @description: generates a calling stack.
		 * @parameter:
		 *	maxDepth: the maximal search depth
		 * @return value: the calling stack
		 */
		
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
	
	getElements: function(obj, re, wre){
		/**
		 * Function Debug.getElements
		 * @name: Debug.getElements
		 * @author: Korbinian Kapsner
		 * @description: generates a overview of an object
		 * @parameter:
		 *	obj: the object to inspect
		 *	re (optional): regular expression that the name has to match
		 *	wre (optional): regular expressen that the value has to match
		 * @return value: the generated object overview string
		 */
		
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
	
	elementAlertWin: function(obj, re, wre){
		/**
		 * Function Debug.elementAlertWin
		 * @name: Debug.elementAlertWin
		 * @author: Korbinian Kapsner
		 * @description: opens a new window and outputs the result of
		 *	Debug.getElements() there. Same parameter than Debug.getElements().
		 * @parameter:
		 *	obj:
		 *	re:
		 *	wre: 
		 */
		
		var win = window.open("", "_blank");
		var doc = win.document;
		doc.write("<!DocType html><html><head><title>Elementausgabe</title></head><body><pre id='alert'></pre></body></html>");
		doc.close();
		doc.getElementById("alert").appendChild(doc.createTextNode(this.getElements(obj, re, wre)));
	}
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
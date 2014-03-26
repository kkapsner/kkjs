(function(){
"use strict";
/**
 * Object DOM
 * @author Korbinian kapsner
 * @name css
 * @version 1.0
 * @description provides some DOM-spezific functionality
 */

var kMath = require("kkjs.Math");

var DOM;
if (typeof exports !== "undefined"){
	DOM = exports;
}
else if (typeof kkjs !== "undefined"){
	kkjs.DOM = {};
	DOM = kkjs.DOM;
}
else {
	return;
}

DOM.window = window;
DOM.document = document;

/**
 * Function DOM.getDocument
 * @name: DOM.getDocument
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description:
 * @parameter:
 *	node:
 *
 */

DOM.getDocument = function getDocument(node){
	if (!node){
		return DOM.document;
	}
	if (!node.nodeType){
		if (node.document){
			return node.document;
		}
		else{
			return DOM.document;
		}
	}
	if (node.nodeType === 9){
		return node;
	}
	if (node.ownerDocument){
		return node.ownerDocument;
	}
	if (node.document){
		return node.document;
	}
	while (node.nodeType !== 9 && node.parentNode){
		node = node.parentNode;
	}
	if (node.nodeType !== 9){
		return null;
	}
	return node;
};

/**
 * Function DOM.getWindow
 * @name: DOM.getWindow
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.08.2009
 * @description:
 * @parameter:
 *	node:
 */

DOM.getWindow = function getWindow(node){
	var doc = DOM.getDocument(node);
	if (doc){
		if (doc.parentWindow){
			return doc.parentWindow;
		}
		if (doc.defaultView){
			return doc.defaultView;
		}
	}
	return null;
};

/**
 * Function DOM.getWindowSize
 * @name: DOM.getWindowSize
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 11.03.2010
 * @description:
 * @parameter:
 */

DOM.getWindowSize = function getWindowSize(){
	if ("innerWidth" in window){
		return new kMath.Dimension(window.innerWidth, window.innerHeight);
	}

	if (document.documentElement.clientWidth && document.compatMode !== "BackCompat"){
		return new kMath.Dimension(document.documentElement.clientWidth, document.documentElement.clientHeight);
	}
	else if (document.body.clientWidth){
		return new kMath.Dimension(document.body.clientWidth, document.body.clientHeight);
	}
	else if (document.body.offsetWidth){
		return new kMath.Dimension(document.body.offsetWidth, document.body.offsetHeight);
	}
	
	return new kMath.Dimension(0, 0);
};


})();
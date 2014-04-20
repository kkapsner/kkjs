(function(){

"use strict";

/**
 * Object scroll
 * @name: scroll
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: provides some scroll-functionality
 */

var Math = require("./kkjs.Math");
 
var scroll = {
	get: function getScrollPosition(node){
		/**
		 * Function scroll.get
		 * @name scroll.get
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: returns the scroll-position /-size of the node (default: window/document.documentElement)
		 * @parameter:
		 *	node
		 * @return value: a object with the attributes top, left, width and height
		 */
		
		return scroll.getPosition(node).toObject(
			scroll.getSize(node).toObject()
		);
	},
	
	getPosition: function getScrollPosition(node){
		/**
		 * Function scroll.getPosition
		 * @name scroll.getPosition
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: returns the scroll-position of the node (default: window)
		 * @parameter:
		 *	node
		 * @return value: a kkjs.Math.Position object (a Vector with the attributes top and left)
		 * Opera has Problems to detect scrollposition when page is reloaded - solved if page is scrolled DOWN once
		 */
		
		if (node){
			return new Math.Position(node.scrollLeft, node.scrollTop);
		}
		
		if ("pageXOffset" in window){
			return new Math.Position(
				window.pageXOffset,
				window.pageYOffset
			);
		}
		//IE
		return new Math.Position(
			document.body.scrollLeft || document.documentElement.scrollLeft,
			document.body.scrollTop  || document.documentElement.scrollTop
		);
	},
	
	getSize: function getScrollSize(node){
		/**
		 * Function scroll.getSize
		 * @name: scroll.getSize
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: returns the scroll-size of the node (default: document.documentElement)
		 * @parameter:
		 *	node:
		 * @return value: a kkjs.Math.Dimension-object (a Vector with the attributes width and height)
		 */
		
		if (!node){
			node = document.documentElement;
		}
		return new Math.Dimension(node.scrollWidth, node.scrollHeight);
	}
};

if (typeof exports !== "undefined"){
	for (var i in scroll){
		if (scroll.hasOwnProperty(i)){
			exports[i] = scroll[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.scroll = scroll;
}

})();
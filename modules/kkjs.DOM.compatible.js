/*global kkjs: true, Element: false*/
/*jshint bitwise: false*/

(function(){
"use strict";
/**
 * DOM compatibility wrappers
 *
 **/

// Do some compatibilty stuff

// FF<9 has no NODE.contains
if (window.Node && Node.prototype && !Node.prototype.contains && Element.prototype.compareDocumentPosition){
	Element.prototype.contains = function contains(node){
		/* Polyfill for NODE.contains for old FF */
		return ((this.compareDocumentPosition(node) & 16) === 16) || this.isSameNode(node);
	};
}

// IE < 9 has no getElementByClassName
if (!document.getElementsByClassName){
	// IE 8
	if (document.querySelectorAll){
		document.getElementsByClassName = Element.prototype.getElementsByClassName = function getElementsByClassName(str){
			/* Polyfill for NODE.getElementsByClassName for IE 8 */
			return this.querySelectorAll("." + str.replace(/^\s+/, "").replace(/\s+/, "."));
		};
	}
}

// for old IEs: create new HTML-Elements so they can be used

"article|aside|command|details|summary|figure|figcaption|footer|header|hgroup|mark|meter|nav|progress|ruby|rt|rp|section|time|wbr|audio|video|source|embed|canvas|datalist|keygen|output".split("|").forEach(function(element){
	document.createElement(element);
});
})();
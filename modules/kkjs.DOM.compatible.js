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
		return ((this.compareDocumentPosition(node) & 16) === 16) || this.isSameNode(node);
	};
}

// create kkjs namespace if not present
if (typeof kkjs === "undefined"){
	kkjs = {};
}

kkjs.createNodePrototype = function createNodePrototype(name, selector){
	if (!name){
		name = "Element";
		selector = "html, body, body *, head, head title, head base, head isindex, head link, head meta, head object, head object *, head style, head script";
	}
	if (!selector){
		selector = name;
	}
	
	// check if it exists already
	if (window[name]){
		return window[name];
	}
	var wrapper, style = document.createStyleSheet();
	if (document.createComment){
		wrapper = document.createComment("wrapper for " + name + ".prototype");
	}
	else {
		// I do NOT support IE5.5
		// just not to create an error
		window[name] = function(){};
		return false;
	}
	selector = selector.split(/\s*,\s*/);
	
	var properties = [];
	wrapper.onpropertychange = function(){
		var propertyName = window.event.propertyName;
		properties.push({
			name: propertyName,
			content: this[window.event.propertyName]
		});
		
		for (var i = 0; i < selector.length; i++){
			style.addRule(
				selector[i],
				"zoom: expression(kkjs.createNodePrototype.addProperties(this, false));"
			);
		}
	};
	
	var addProperties = kkjs.createNodePrototype.addProperties;
	kkjs.createNodePrototype.addProperties = function(node, setZoom){
		if (addProperties){
			addProperties(node, setZoom);
		}
		if (name === "Element" || node.nodeName.toLowerCase() === selector.toLowerCase()){
			wrapper._IEinitProperties(node, setZoom);
		}
	};
	wrapper._IEinitProperties = function(node, setZoom){
		for (var i = 0; i < properties.length; i++){
			node[properties[i].name] = properties[i].content;
		}
		if (setZoom){
			node.style.zoom = 1;
		}
	};
	document.getElementsByTagName("head")[0].appendChild(wrapper);
	
	var createElement = document.createElement;
	document.createElement = function(tag){
		var node = Function.prototype.apply.call(createElement, document, arguments); // IE6+7 Bug: createElement has no apply...
		if (name === "Element" || tag.toLowerCase() === selector.toLowerCase()){
			wrapper._IEinitProperties(node);
		}
		return node;
	};
	
	window[name] = function(){};
	window[name].prototype = wrapper;
	return window[name];
};

//IE<8 has no window.Element so you cannot extend nodes
kkjs.createNodePrototype();

// IE has no getElementByClassName
if (!document.getElementsByClassName){
	// IE 8
	if (document.querySelectorAll){
		document.getElementsByClassName = Element.prototype.getElementsByClassName = function getElementsByClassName(str){
			return this.querySelectorAll("." + str.replace(/^\s+/, "").replace(/\s+/, "."));
		};
	}
	else {
		var css = require("kkjs.css");
		document.getElementsByClassName = Element.prototype.getElementsByClassName = function getElementsByClassName(str){
			var ret = [];
			var k = this.childNodes;
			for (var i = 0; i < k.length; i++){
				if (css.className.has(k[i], str)){
					ret.push(k[i]);
				}
				if ("getElementsByClassName" in k[i]){
					ret = ret.concat(k[i].getElementsByClassName(str));
				}
			}
			
			return ret;
		};
	}
}

// for old IEs: create new HTML-Elements so they can be used

"article|aside|command|details|summary|figure|figcaption|footer|header|hgroup|mark|meter|nav|progress|ruby|rt|rp|section|time|wbr|audio|video|source|embed|canvas|datalist|keygen|output".split("|").forEach(function(element){
	document.createElement(element);
});
})();
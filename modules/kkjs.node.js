(function(){
"use strict";

/**
 * Object node
 * @name: node
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: provides functions for node-receiving, -manipulation and -generation
 */

var is = require("./kkjs.is");
var DOM = require("./kkjs.DOM");
var ajax = require("./kkjs.ajax");
var Math = require("./kkjs.Math");
var scroll = require("./kkjs.scroll");
//var css = require("./kkjs.css"); // exlicit in code to prevent circular dependencies, because kkjs.css also requires kkjs.node
//var event = require("./kkjs.event");
//var dataset = require("./kkjs.dataset");

var Node = {
	/**
	 * Function node.next
	 * @name: node.next
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: returns the next node in the DOM-Structure
	 * @parameter:
	 *	node
	 */

	next: function nextNode(node, noChildren){
		if (typeof node === "undefined" && is.node(this)){
			node = this;
		}
		if (node.firstChild && !noChildren){
			return node.firstChild;
		}
		if (node.nextSibling){
			return node.nextSibling;
		}
		if (node.parentNode){
			return Node.next(node.parentNode, true);
		}
		return null;
	},
	
	/**
	 * Function node.previous
	 * @name: node.previous
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: returns the previous node in the DOM-Structure
	 * @parameter:
	 *	node
	 */

	previous: function previousNode(node, noChildren){
		if (typeof node === "undefined" && is.node(this)){
			node = this;
		}
		
		if (node.previousSibling){
			node = node.previousSibling;
			while (!noChildren && node.lastChild){
				node = node.lastChild;
			}
			return node;
		}
		if (node.parentNode){
			return node.parentNode;
		}
		return null;
	},

	/**
	 * Function node.clear
	 * @name: node.clear
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: removes all childnodes from the given node
	 * @parameter:
	 *	node:
	 * @return value: a documentFragment with the deleted Nodes
	 */
	
	clear: function clearNode(node){
		var df = DOM.getDocument(node).createDocumentFragment();
		while (node.firstChild){
			df.appendChild(node.firstChild);
		}
		return df;
	},
	
	/**
	 * Function node.insertAfter
	 * @name: node.insertAfter
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: inserts a node AFTER a given childnode
	 * @parameter:
	 *	node:
	 *	toInsert:
	 *	childnode:
	 * @return value: node
	 */
	
	insertAfter: function insertAfter(node, toInsert, childnode){
		node.insertBefore(toInsert, childnode.nextSibling);
		return node;
	},
	
	/**
	 * Function node.appendHTML
	 * @name: node.appendHTML
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: appends HTML to node without effecting the existing childNodes
	 * @parameter:
	 *	node:
	 *	html:
	 * @return value: node
	 */
	
	appendHTML: function appendHTML(node, html){
		var help = node.cloneNode(false);
		help.innerHTML = html;
		while (help.firstChild){
			node.appendChild(help.firstChild);
		}
		return node;
	},
	
	/**
	 * Function node.ajaxUpdate
	 * @name: node.ajaxUpdate
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: updates a nodes innerHTML by performing an AJAX request
	 * @parameter:
	 *	node:
	 *	url:
	 */
	
	ajaxUpdate: function ajaxUpdateNode(node, url){
		return ajax.advanced({
			url: url,
			onload: function(txt){
				// in old IEs a beginning <script>-node is ignored
				if (txt.substring(0, 7).toLowerCase() === "<script" && is.ie && is.version < 9){
					txt = "&nbsp;" + txt;
				}
				node.innerHTML = txt;
				var scripts = node.getElementsByTagName("script");
				var scriptsL = scripts.length;
				for (var i = 0; i < scriptsL; i++){
					var script = scripts[i];
					var newScript = document.createElement("script");
					newScript.text = script.text;
					var attributes = scripts[i].attributes;
					for (var j = 0; j < attributes.length; j++){
						var att = attributes[j];
						if (att.name === "event"){
							continue; // IE7 - Bug
						}
						newScript.setAttribute(att.name, att.value);
					}
					script.parentNode.replaceChild(newScript, script);
				}
			}
		});
	},
	
	/**
	 * Function node.create
	 * @name: node.create
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: node creation
	 * @parameter:
	 *	att:
	 */

	create: function createNode(att){
		if (is.string(att)){
			return document.createTextNode(att);
		}
		
		if (!is.string(att.tag)) {
			return null;
		}
		
		if (is.key(att, "name") && is.ie && is.version < 9){
			att.tag = "<" + att.tag + " name='" + att.name + "'>";
			delete att.name;
		}
		
		var node;
		if (/^fragment\|[a-z]/i.test(att.tag)){
			att.fragmentAs = att.tag.replace(/^fragment\|/i, "");
			att.tag = "fragment";
		}
		switch (att.tag){
			case "fragment":
				node = document.createDocumentFragment();
				if (is.key(att, "innerHTML")){
					var div = document.createElement(att.fragmentAs || "div");
					div.innerHTML = att.innerHTML;
					delete att.innerHTML;
					while (div.firstChild){
						node.appendChild(div.firstChild);
					}
					//delete div;
				}
				break;
			case "textNode":
				node = document.createTextNode(att.text);
				break;
			default:
				node = document.createElement(att.tag);
		}
		delete att.tag;
		
		if (att.style){
			require("kkjs.css").set(node, att.style);
		}
		delete att.style;
		
		if (att.events){
			require("kkjs.event").add(node, att.events);
		}
		delete att.events;
		
		if (att.dataset){
			require("kkjs.dataset").set(node, att.dataset);
		}
		delete att.dataset
		
		var children = att.childNodes, i;
		delete att.childNodes;
		if (children){
			if (is.key(att, "innerHTML")){
				node.innerHTML = att.innerHTML;
				delete att.innerHTML;
			}
			for (var i = 0; i < children.length; i++){
				var child = is.node(children[i])? children[i]: Node.create(children[i]);
				node.appendChild(child);
			}
		}
		var parent = att.parentNode;
		delete att.parentNode;
		for (var i in att){
			if (att.hasOwnProperty(i)){
				try{
					node[i] = att[i];
				}
				catch(e){}
			}
		}
		if (parent){
			parent.appendChild(node);
		}
		return  node;
	},
	
	/**
	 * Function node.remove
	 * @name: node.remove
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: removes the given node from the DOMTree
	 * @parameter:
	 *	node:
	 * @return value: the node
	 */
	
	remove: function removeNode(node){
		if (node.parentNode){
			node.parentNode.removeChild(node);
		}
		return node;
	},
	
	/**
	 * Function node.getIndex
	 * @name: node.getIndex
	 * @author: Korbinian Kapsner
	 * @version; 1.0
	 * @description: returns the index of the node in node.parentNode.childNodes
	 * @parameter:
	 *	node:
	 * @return value: the index
	 */
	
	getIndex: function getNodeIndex(node, ancestor){
		if (!ancestor){
			ancestor = node.parentNode;
		}
		else {
			while (node.parentNode !== ancestor){
				node = node.parentNode;
				if (!node){
					return -1;
				}
			}
		}
		var c = 0;
		while ((node = node.previousSibling) !== null){
			c++;
		}
		return c;
	},
	
	/**
	 * Function node.getCommonAncestor
	 * @name: node.getCommonAncestor
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: returns the common ancestor of two nodes (if they are equal this node is returned - no matter which type it is)
	 * @parameter:
	 *	node1:
	 *	node2:
	 * @return value: the common ancestor on success, false on error
	 */
	
	getCommonAncestor: function getCommonAncestor(node1, node2){
		if (is.node(node1) && is.node(node2)){
			if (Node.contains(node1, node2)){
				return node1;
			}
			do {
				if (Node.contains(node2, node1)){
					return node2;
				}
				node2 = node2.parentNode;
			}
			while(node2);
		}
		return false;
	},
	
	/**
	 * Function node.contains
	 * @name: node.contains
	 * @author: Korbinian Kapsner
	 * @version. 1.0
	 * @description: returns whether node1 contains node2
	 * @parameter:
	 *	node1:
	 *	node2:
	 * @return value: a boolean
	 */
	
	contains: function contains(node1, node2){
		if (is.node(node1) && is.node(node2) && DOM.getDocument(node1) === DOM.getDocument(node2)){
			if (node1 === node2){
				return true;
			}
			if (node1.nodeType === 3){
				return false;
			}
			if (node2.nodeType === 3){
				return node1 === node2.parentNode || node1.contains(node2.parentNode);
			}
			else{
				return node1.contains(node2);
			}
		}
		return false;
	},
	
	/**
	 * Function node.getAttribute
	 * @name: node.getAttribute
	 * @version: 1.0
	 * @author: Korbinian Kapsner
	 * @description: returns the nodes attribute
	 * @parameter:
	 *	node:
	 *	att:
	 */
	
	getAttribute: function getAttribute(node, att){
		if (is.key(node, att)){
			return node[att];
		}
		return node.getAttribute(att);
	},
	
	/**
	 * Function node.getPosition
	 * @name: node.getPosition
	 * @version: 1.0
	 * @author: Korbinian Kapsner
	 * @description: returns the nodes x- and y-position
	 * @parameter:
	 *	node:
	 */
	
	getPosition: function getPosition(node){
		var v = new Math.Position(0, 0);
		
		if (node.getBoundingClientRect){
			try {
				var box = node.getBoundingClientRect();
				v.fromObject(box);
				if (Node.contains(document.documentElement, node)){
					v.add(scroll.getPosition());
				}
			}catch(e){}
		}
		else {
			var doc = DOM.getDocument(node);
			
			while (node.offsetParent){
				v.left += node.offsetLeft + node.offsetParent.clientLeft;
				v.top += node.offsetTop + node.offsetParent.clientTop;
				if (node !== doc.documentElement && node !== doc.body){
					v.left -= node.scrollLeft;
					v.top -= node.scrollTop;
				}
				node = node.offsetParent;
			}
			
		}
		
		return v;
	},
	
	/**
	 * Function node.getRange
	 * @name: node.getRange
	 * @version: 1.0
	 * @author: Korbinian Kapsner
	 * @description: returns the range that is ocupied by the node
	 * @parameter:
	 *	node:
	 */
	
	getRange: function getRange(node){
		var posTopLeft = Node.getPosition(node);
		var posBottomRight = posTopLeft.clone().add(new Math.Vector2D(node.offsetWidth, node.offsetHeight));
		return Math.Range2D.createFromVectors(posTopLeft, posBottomRight);
	}
};

Node.next.byTagName = function nextNodeByTagName(node, tagName, noChildren){
	tagName = tagName.toLowerCase();
	do {
		node = Node.next(node, noChildren);
	}
	while (node && node.nodeName.toLowerCase() !== tagName);

	return node;
};
Node.next.siblingByTagName = function nextSiblingByTagName(node, tagName){
	tagName = tagName.toLowerCase();
	do {
		node = node.nextSibling;
	}
	while (node && node.nodeName.toLowerCase() !== tagName);

	return node;
};
Node.next.element = function nextElement(node, noChildren){
	do {
		node = Node.next(node, noChildren);
	}
	while (node && node.nodeType === 3);
	
	return node;
};

Node.previous.element = function previousElement(node, noChildren){
	do {
		node = Node.previous(node, noChildren);
	}
	while (node && node.nodeType === 3);
	
	return node;
};

if (typeof exports !== "undefined"){
	for (var i in Node){
		if (Node.hasOwnProperty(i)){
			exports[i] = Node[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.node = Node;
}

})();
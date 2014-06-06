(function(){
"use strict";

/**
 * Object node
 * @name: node
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: provides functions for node-receiving, -manipulation and -generation
 */

var DOM = require("./kkjs.DOM");
var Math = require("./kkjs.Math");
var scroll = require("./kkjs.scroll");
//var css = require("./kkjs.css"); // exlicit in code to prevent circular dependencies, because kkjs.css also requires kkjs.node
//var event = require("./kkjs.event");
//var dataset = require("./kkjs.dataset");

var Node = {
	next: function nextNode(node, noChildren){
		/**
		 * Function node.next
		 * @name: node.next
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: returns the next node in the DOM-Structure
		 * @parameter:
		 *	node
		 */

		if (typeof node === "undefined" && this !== Node){
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
	
	previous: function previousNode(node, noChildren){
		/**
		 * Function node.previous
		 * @name: node.previous
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: returns the previous node in the DOM-Structure
		 * @parameter:
		 *	node
		 */

		if (typeof node === "undefined" && this !== Node){
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

	clear: function clearNode(node){
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
		
		var df = DOM.getDocument(node).createDocumentFragment();
		while (node.firstChild){
			df.appendChild(node.firstChild);
		}
		return df;
	},
	
	insertAfter: function insertAfter(node, toInsert, childnode){
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
		
		node.insertBefore(toInsert, childnode.nextSibling);
		return node;
	},
	
	appendHTML: function appendHTML(node, html){
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
		
		var help = node.cloneNode(false);
		help.innerHTML = html;
		while (help.firstChild){
			node.appendChild(help.firstChild);
		}
		return node;
	},
	
	set: function set(node, key, value){
		/**
		 * Function node.set
		 * @name: node.set
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: sets attributes of a node. Usually the value is just
		 *		assigned to the node:
		 *			node[key] = value
		 *		Any errors during the assigment will be ignored.
		 *		But there are some special cases:
		 *			parentNode: the node will be placed in that node
		 *			nextSibling: the node will be placed before that node
		 *			previousSibling: the node will be placed after that node
		 *			style: has to be an object that is than passed to stlye.set()
		 *			events: has to be an object that is than passed to event.add()
		 *			data: has to be an object that is than passed to dataset.set()
		 *			childNodes: has to be an array of either nodes (directly
		 *				inserted in the node), a string (inserted as textnode) or
		 *				an object (passed to node.create() and the returned node is
		 *				inserted). Before the new child nodes are inserted the node
		 *				is cleared.
		 *		This function is array callable on the first argument and object
		 *		callable on the second.
		 * @parameter:
		 *	node: the node where the attributes should be set
		 *	key: attribute name.
		 *	value: attribute value.
		 * @return value: the node.
		 */
		
		switch (key){
			case "parentNode":
				value.appendChild(node);
				break;
			case "nextSibling":
				value.parentNode.insertBefore(node, value);
				break;
			case "previousSibling":
				value.parentNode.insertBefore(node, value.nextSibling);
				break;
			case "style":
				require("kkjs.css").set(node, value);
				break;
			case "events":
				require("kkjs.event").add(node, value);
				break;
			case "dataset":
				require("kkjs.dataset").set(node, value);
				break;
			case "childNodes":
				Node.clear(node);
				for (var i = 0; i < value.length; i += 1){
					var child = (value[i] instanceof window.Node)? value[i]: Node.create(value[i]);
					node.appendChild(child);
				}
				break;
			default:
				try {
					node[key] = value;
				}
				catch(e){
					
				}
				
		}
		return node;
	}.makeArrayCallable(0, {arrayLike: true}).makeObjectCallable(1, 1, 2),
	
	create: function createNode(att){
		/**
		 * Function node.create
		 * @name: node.create
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: node creation
		 * @parameter:
		 *	att: attributes for the node to be created. Usually the value is just
		 *		assigned to the node:
		 *			node.className = att.className
		 *		Any errors during the assigment will be ignored.
		 *		But there are some special cases:
		 *			tag: required and used to create the node. If the tag starts
		 *				with "fragment" a documentFragement is created.
		 *			parentNode: the new node will be placed in that node
		 *			nextSibling: the new node will be placed before that node
		 *			previousSibling: the new node will be placed after that node
		 *			style: has to be an object that is than passed to stlye.set()
		 *			events: has to be an object that is than passed to event.add()
		 *			data: has to be an object that is than passed to dataset.set()
		 *			childNodes: has to be an array of either nodes (directly
		 *				inserted in the node), a string (inserted as textnode) or
		 *				an object (passed to node.create() and the returned node is
		 *				inserted).
		 * @return value: the created node.
		 */

		if (typeof att === "string"){
			return document.createTextNode(att);
		}
		
		if (typeof att.tag !== "string"){
			return null;
		}
		
		/*if (("name" in att) && is.ie && is.version < 9){
			att.tag = "<" + att.tag + " name='" + att.name + "'>";
			delete att.name;
		}*/
		
		var node;
		if (/^fragment\|[a-z]/i.test(att.tag)){
			att.fragmentAs = att.tag.replace(/^fragment\|/i, "");
			att.tag = "fragment";
		}
		switch (att.tag){
			case "fragment":
				node = document.createDocumentFragment();
				if ("innerHTML" in att){
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
		delete att.dataset;
		
		var children = att.childNodes, i;
		delete att.childNodes;
		if (children){
			if ("innerHTML" in att){
				node.innerHTML = att.innerHTML;
				delete att.innerHTML;
			}
			for (var i = 0; i < children.length; i++){
				var child = (children[i] instanceof window.Node)? children[i]: Node.create(children[i]);
				node.appendChild(child);
			}
		}
		var parent = att.parentNode;
		delete att.parentNode;
		var nextSibling = att.nextSibling;
		delete att.nextSibling;
		var previousSibling = att.previousSibling;
		delete att.previousSibling;
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
		else if (nextSibling){
			nextSibling.parentNode.insertBefore(node, nextSibling);
		}
		else if (previousSibling){
			previousSibling.parentNode.insertBefore(node, previousSibling.nextSibling);
		}
		return node;
	},
	
	remove: function removeNode(node){
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
		
		if (node.parentNode){
			node.parentNode.removeChild(node);
		}
		return node;
	},
	
	getIndex: function getNodeIndex(node, ancestor){
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
	
	getCommonAncestor: function getCommonAncestor(node1, node2){
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
		return false;
	},
	
	contains: function contains(node1, node2){
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
		
		if (DOM.getDocument(node1) === DOM.getDocument(node2)){
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
	
	getAttribute: function getAttribute(node, att){
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
		
		if (att in node){
			return node[att];
		}
		return node.getAttribute(att);
	},
	
	getPosition: function getPosition(node){
		/**
		 * Function node.getPosition
		 * @name: node.getPosition
		 * @version: 1.0
		 * @author: Korbinian Kapsner
		 * @description: returns the nodes x- and y-position
		 * @parameter:
		 *	node:
		 */
		
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
	
	getRange: function getRange(node){
		/**
		 * Function node.getRange
		 * @name: node.getRange
		 * @version: 1.0
		 * @author: Korbinian Kapsner
		 * @description: returns the range that is ocupied by the node
		 * @parameter:
		 *	node:
		 */
		
		var posTopLeft = Node.getPosition(node);
		var posBottomRight = posTopLeft.clone().add(new Math.Vector2D(node.offsetWidth, node.offsetHeight));
		return Math.Range2D.createFromVectors(posTopLeft, posBottomRight);
	}
};

Node.next.byTagName = function nextNodeByTagName(node, tagName, noChildren){
	/**
	 * Function node.next.byTagName
	 * @name: node.next.byTagname
	 * @author: Korbinian Kapsner
	 * @description: returns the next node that has a specific tag name.
	 * @parameter:
	 *	node: the node to start the search
	 *	tagName: the specific tag name
	 *	noChildren (optional): if child nodes should be inspected.
	 */
	
	tagName = tagName.toLowerCase();
	do {
		node = Node.next(node, noChildren);
	}
	while (node && node.nodeName.toLowerCase() !== tagName);

	return node;
};
Node.next.siblingByTagName = function nextSiblingByTagName(node, tagName){
	/**
	 * Function node.next.siblingByTagName
	 * @name: node.next.siblingByTagName
	 * @author: Korbinian Kapsner
	 * @description: returns the next sibling that has a specific tag name.
	 * @parameter:
	 *	node: the node to start the search
	 *	tagName: the specific tag name.
	 */
	
	tagName = tagName.toLowerCase();
	do {
		node = node.nextSibling;
	}
	while (node && node.nodeName.toLowerCase() !== tagName);

	return node;
};
Node.next.element = function nextElement(node, noChildren){
	/**
	 * Function node.next.element
	 * @name: node.next.element
	 * @author: Korbinian Kapsner
	 * @description: return the next element
	 * @parameter:
	 *	node: the node to start the search
	 *	noChildren (optional): if child nodes should be inspected
	 */
	
	do {
		node = Node.next(node, noChildren);
	}
	while (node && node.nodeType === 3);
	
	return node;
};

Node.previous.element = function previousElement(node, noChildren){
	/**
	 * Function node.previous.element
	 * @name: node.previous.element
	 * @author: Korbinian Kapsner
	 * @description: return the previous element
	 * @parameter:
	 *	node: the node to start the search
	 *	noChildren (optional): if child nodes should be inspected
	 */
	
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
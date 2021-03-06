(function(){
"use strict";

var NodeRepresentator = require("kkjs.EventEmitter").extend().implement({
	
	nodes: null,
	forEachNode: function forEachNode(callbackFn){
		/**
		 * Function NodeRepresentator.forEachNode
		 * @name: NodeRepresentator.forEachNode
		 * @description: Calls a function on every node of the representator.
		 * @parameter:
		 *	callbackFn: function that is called on every node. Context is always
		 *		the nodeRepresentator.
		 */
		
		if (this.nodes){
			this.nodes.forEach(callbackFn, this);
		}
	},
	_createNode: function _createNode(){throw new Error("Abstract function.");},
	createNode: function createNode(type){
		/**
		 * Function NodeRepresentator.createNode
		 * @name: NodeRepresentator.createNode
		 * @description: Creates a new node of the representator.
		 * @parameter:
		 *	type: the type of the node
		 * @return value: the new node.
		 */
		
		if (!this.nodes){
			this.nodes = [];
		}
		var funName = "_create" + (type || "").toLowerCase().firstToUpperCase() + "Node";
		if (typeof this[funName] !== "function"){
			funName = "_createNode";
		}
		var node = this[funName].apply(this, arguments);
		this.nodes.push(node);
		node.representator = this;
		node.type = type;
		this.emit("create.node", node);
		return node;
	},
	_updateNode: function _updateNode(){throw new Error("Abstract function.");},
	update: function(){
		/**
		 * Function NodeRepresentator.update
		 * @name: NodeRepresentator.update
		 * @description: Updates all nodes so they all are up to date.
		 */
		
		this.forEachNode(function(node){
			var funName = "_update" + (node.type || "").toLowerCase().firstToUpperCase() + "Node";
			if (typeof this[funName] !== "function"){
				funName = "_updateNode";
			}
			this[funName](node);
			this.emit("update.node", node);
		});
		this.emit("update");
	},
	replaceNode: function(node){
		/**
		 * Function NodeRepresentator.replaceNode
		 * @name: NodeRepresentator.replaceNode
		 * @description: Reokaces a node in the representators list and the
		 *	document.
		 * @parameter:
		 *	node: the node to be replaced.
		 */
		
		if (this.nodes){
			var i = this.nodes.indexOf(node);
			if (i >= 0){
				this.nodes.splice(i, 1);
				if (node.parentNode){
					node.parentNode.removeChild(node);
				}
				this.emit("remove.node", node);
			}
		}
	},
	removeNode: function(node){
		/**
		 * Function NodeRepresentator.removeNode
		 * @name: NodeRepresentator.removeNode
		 * @description: Removes a node from the representators list and the
		 *	document.
		 * @parameter:
		 *	node: the node to be removed.
		 */
		
		if (this.nodes){
			var i = this.nodes.indexOf(node);
			if (i >= 0){
				this.nodes.splice(i, 1);
				if (node.parentNode){
					node.parentNode.removeChild(node);
				}
				this.emit("remove.node", node);
			}
		}
	},
	removeAllNodes: function(){
		/**
		 * Function NodeRepresentator.removeAllNodes
		 * @name: NodeRepresentator.removeAllNodes
		 * @description: Removes all node from the representators list and the
		 *	document.
		 */
		
		if (this.nodes){
			var This = this;
			this.nodes.forEach(function(node){
				This.removeNode(node);
			});
			this.emit("remove.all.nodes");
			this.nodes = null;
		}
	}
});

if (typeof exports !== "undefined"){
	module.exports = NodeRepresentator;
}
else if (typeof kkjs !== "undefined"){
	kkjs.NodeRepresentator = NodeRepresentator;
}

})();
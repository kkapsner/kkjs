(function(){
"use strict";

var NodeRepresentator = require("kkjs.EventEmitter").extend().implement({
	
	nodes: null,
	forEachNode: function(callbackFn){
		if (this.nodes){
			this.nodes.forEach(callbackFn, this);
		}
	},
	_createNode: function _createNode(){throw new Error("Abstract function.");},
	createNode: function(){
		if (!this.nodes){
			this.nodes = [];
		}
		var node = this._createNode.apply(this, arguments);
		this.nodes.push(node);
		node.representator = this;
		this.emit("create.node", node);
		return node;
	},
	_updateNode: function _updateNode(){throw new Error("Abstract function.");},
	update: function(){
		this.forEachNode(function(node){
			this._updateNode(node);
			this.emit("update.node", node);
		});
		this.emit("update");
	},
	removeNode: function(node){
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
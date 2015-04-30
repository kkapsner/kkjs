(function(){

"use strict";

/**
 * Object NodeRepresentatorContainer
 * @name: NodeRepresentatorContainer
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: NodeRepresentatorContainer is a NodeRepresnatator that keeps a list of other NodeRepresentators.
 */

var NodeRepresentator = require("kkjs.NodeRepresentator");
var kNode = require("kkjs.node");

var NodeRepresentatorContainer = NodeRepresentator.extend().implement({
	items: null,
	addItem: function(item){
		/**
		 * Function NodeRepresentatorContainer.addItem
		 * @name: NodeRepresentatorContainer.addItem
		 * @description: Adds an item to the containers list.
		 * @parameter:
		 *	item: item to be added.
		 */
		
		if (!this.items){
			this.items = [];
		}
		var This = this;
		if (item instanceof NodeRepresentator){
			this.items.push(item);
			this.forEachNode(function(node){
				node["kkjs:nodeRepresentatorContainer:items"].appendChild(This.createItemLi(item));
			});
		}
	},
	removeItem: function(item){
		/**
		 * Function NodeRepresentatorContainer.removeItem
		 * @name: NodeRepresentatorContainer.removeItem
		 * @description: Removes an item from the containers list.
		 * @parameter:
		 *	item: item to be removed.
		 */
		
		if (!this.items){
			this.items = [];
		}
		
		if (item instanceof NodeRepresentator){
			var idx = this.items.indexOf(item);
			if (idx !== -1){
				this.items.splice(idx, 1);
				
				this.forEachNode(function(node){
					node["kkjs:nodeRepresentatorContainer:items"].removeChild(node["kkjs:nodeRepresentatorContainer:items"].childNodes[idx]);
				});
			}
		}
	},
	createNodeHead: function(){
		return null;
	},
	createNodeFoot: function(){
		return null;
	},
	createItemLi: function(item){
		var This = this;
		return kNode.create({
			tag: "li",
			"kkjs:nodeRepresentatorContainer:item": item,
			className: "item",
			childNodes: [
				{
					tag: "button",
					className: "remove",
					events: {click: function(){This.removeItem(item);}}
				},
				item.createNode()
			]
		});
	},
	appendItemsNode: function(node){
		var itemsNode = kNode.create({
			tag: "ol",
			className: "itemsList",
			childNodes: (this.items || []).map(this.createItemLi.bind(this))
		});
		node.appendChild(itemsNode);
		node["kkjs:nodeRepresentatorContainer:items"] = itemsNode;
		return itemsNode;
	},
	_createNode: function(){
		var node = kNode.create({
			tag: "article"
		});
		var head = this.createNodeHead();
		if (head){
			node.appendChild(head);
			node["kkjs:nodeRepresentatorContainer:head"] = head;
		}
		this.appendItemsNode(node);
		var foot = this.createNodeFoot();
		if (foot){
			node.appendChild(foot);
			node["kkjs:nodeRepresentatorContainer:foot"] = foot;
		}
		return node;
	},
	updateNodeHead: function(head){},
	updateItemsNode: function(itemsNode){
		var This = this;
		[].slice.call(itemsNode.childNodes).forEach(function(node){
			var item = node["kkjs:nodeRepresentatorContainer:item"];
			var idx = This.items.indexOf(item);
			if (idx === -1){
				item.removeNode(node);
			}
		});
		this.items.forEach(function(item, idx){
			var itemNodes = [].slice.call(itemsNode.childNodes);
			if (itemNodes[idx]["kkjs:nodeRepresentatorContainer:item"] !== item){
				var items = itemNodes.map(function(itemNode){
					return itemNode["kkjs:nodeRepresentatorContainer:item"];
				});
				var itemNode = itemNodes[items.indexOf(item)] || This.createItemLi(item);
				itemsNode.insertBefore(itemNode, itemsNode.childNodes[idx]);
			}
		});
		
	},
	updateNodeFoot: function(foot){},
	_updateNode: function(node){
		this.updateNodeHead(node["kkjs:nodeRepresentatorContainer:head"]);
		this.updateItemsNode(node["kkjs:nodeRepresentatorContainer:items"]);
		this.updateNodeFoot(node["kkjs:nodeRepresentatorContainer:foot"]);
	}
});

if (typeof exports !== "undefined"){
	exports = NodeRepresentatorContainer;
}
else if (typeof kkjs !== "undefined"){
	kkjs.NodeRepresentatorContainer = NodeRepresentatorContainer;
}

})();
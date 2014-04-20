(function(){
"use strict";

kkjs.ExpandableTree = kkjs.oo.Base.extend(function(node){
	/**
	 * Constructor ExpandableTree
	 * @author: Korbinian kapsner
	 * @name: ExpandableTree
	 * @version: 1.0
	 * @description: creates an expandable tree out of a nested List
	 */
	
	if (!/^[ou]l$/i.test(node.nodeName)){
		throw new TypeError("Invalid argument. Node must be a <ul> or <ol>.");
	}
	else {
		this.node = node;
		this.constructor._init(node, this);
	}
})
.implement({
	node: false,
	closeAll: function(){
		/**
		 * Function ExpandableTree.closeAll
		 * @author: Korbinian Kapsner
		 * @name: ExpandableTree.closeAll
		 * @version: 1.0
		 * @description: Closes all tree nodes and subtrees.
		 */
		
		var ind = kkjs.css.$("> li .indicator", {node: this.node});
		for (var i = 0; i < ind.length; i++){
			kkjs.css.className.remove(ind[i], "open");
			kkjs.css.className.add(ind[i], "closed");
			this.constructor._closeSublist(ind[i].parentNode, false);
		}
	},
	openAll: function(){
		/**
		 * Function ExpandableTree.openAll
		 * @author: Korbinian Kapsner
		 * @name: ExpandableTree.openAll
		 * @version: 1.0
		 * @description: Opens all tree nodes and subtrees.
		 */
		
		var ind = kkjs.css.$("> li .indicator", {node: this.node});
		for (var i = 0; i < ind.length; i++){
			kkjs.css.className.remove(ind[i], "open");
			kkjs.css.className.add(ind[i], "closed");
			this.constructor._closeSublist(ind[i].parentNode, true);
		}
	}
})
.implementStatic({
	_indicator: kkjs.node.create({
		tag: "div",
		className: "indicator open"
	}),
	_init: function(node){
		/**
		 * Function ExpandableTree._init
		 * @author: Korbinian Kapsner
		 * @name: ExpandableTree._init
		 * @version: 1.0
		 * @description: Static function that initialises the tree.
		 *	Should only be called by the constructor.
		 * @parameter:
		 *	node: the base node to build the tree
		 */
		
		
		var li = kkjs.css.$("> li", {node: node});
		
		for (var i = 0; i < li.length; i++){
			var ul = kkjs.css.$("> .expandableTree", {node: li[i]});
			if (ul.length){
				var ind = this._indicator.cloneNode(false);
				li[i].appendChild(ind);
				kkjs.event.add(ind, "click", function(){
					var open = kkjs.css.className.toggle(this, "open", "closed");
					kkjs.ExpandableTree._closeSublist(this.parentNode, open);
				});
				for (var j = 0; j < ul.length; j++){
					this._init(ul[j]);
				}
			}
		}
	},
	_closeSublist: function(li, open){
		/**
		 * Function ExpandableTree._closeSublist
		 * @author: Korbinian Kapsner
		 * @name: ExpandableTree._closeSublist
		 * @version: 1.0
		 * @description: Static function that closes/opens all subtrees.
		 *	Should only be called by ExpandableTree.closeAll().
		 * @parameter:
		 *	li: the <li> to search for a subtree
		 *	open: if the subtree should be opened or closed.
		 */
		
		var ul = kkjs.css.$("> .expandableTree", {node: li});
		for (var i = 0; i < ul.length; i++){
			ul[i].style.display = open? "block": "none";
		}
	}
});

}).apply();
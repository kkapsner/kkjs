(function(){
"use strict";

/**
 * Object kkjs.ExpandableTree
 * @author Korbinian kapsner
 * @name kkjs.ExpandableTree
 * @version 1.0
 * @description creates an expandable tree out of a nestede List
 */

kkjs.ExpandableTree = kkjs.oo.Base.extend(function(node){
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
		var ind = kkjs.css.$("> li .indicator", {node: this.node});
		for (var i = 0; i < ind.length; i++){
			kkjs.css.className.remove(ind[i], "open");
			kkjs.css.className.add(ind[i], "closed");
			this.constructor._closeSublist(ind[i].parentNode, false);
		}
	},
	openAll: function(){
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
		var ul = kkjs.css.$("> .expandableTree", {node: li});
		for (var i = 0; i < ul.length; i++){
			ul[i].style.display = open? "block": "none";
		}
	}
});

}).apply();
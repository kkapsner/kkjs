(function(){
"use strict";

/**
 * Object kkjs.sortable
 * @super Object
 * @author Korbinian Kapsner
 * @version 1.0
 */

var selection = require("kkjs.selection");
var css = require("kkjs.css");

kkjs.sortable = {
	dragNDrop: {
		set: function set(node, att){
			att = att || {};
			if (kkjs.is.array(node)){
				for (var i = 0; i < node.length; i++){
					set(node[i]);
				}
				return;
			}
			var children = node.childNodes;
			for (var j = 0; j < children.length; j++){
				var child = children[j];
				if (child.nodeType !== 3){
					var active = child;
					if (att.handleSelector){
						active = css.$(att.handleSelector, {node: children[j]});
						active.forEach(function(el){
							el.toMove = child;
						});
					}
					else {
						active.toMove = child;
					}
					if (att.onaftersort){
						child.onaftersort = att.onaftersort;
					}
					if (att.direction){
						child["kkjs:sortDirection"] = att.direction;
					}
					kkjs.event.add(active, "mousedown", DnDmouseDown);
				}
			}
		},
		unset: function unset(node, att){
			att = att || {};
			if (kkjs.is.array(node)){
				for (var i = 0; i < node.length; i++){
					unset(node[i]);
				}
				return;
			}
			var children = node.childNodes;
			for (var j = 0; j < children.length; j++){
				var child = children[j];
				if (child.nodeType !== 3){
					var active = child;
					if (att.handleSelector){
						active = css.$(att.handleSelector, {node: child});
					}
					kkjs.event.remove(active, "mousedown", DnDmouseDown);
				}
			}
		}
	}
};


// DnD-Stuff
var active = null;
var mouseStartPosition = {left: 0, top: 0};

var DnDmouseDown = function(ev){
	mouseStartPosition = kkjs.event.getMousePosition(ev);
	active = this.toMove;
	css.set(active, {position: "relative", top: "0px", left: "0px"});
	ev.preventDefault();
	ev.stopPropagation();
};
kkjs.event.add(document, "mouseup", function(){
	var lActive = active;
	if (lActive){
		active = null;
		css.set(lActive, {position: ""});
		if (lActive.onaftersort){
			lActive.onaftersort();
		}
	}
});
kkjs.event.add(document, "mousemove", function(ev){
	if (active){
		selection.collapse();
		var oVisibility = active.style.visibility;
		active.style.visibility = "hidden";
		//active.style.zIndex = "-1";
		var over = kkjs.event.getElementFromMousePosition(ev);
		//active.style.zIndex = "";
		active.style.visibility = oVisibility;

		while (over && over.parentNode !== active.parentNode){
			over = over.parentNode;
		}
		if (over && over !== active){
			var pos = {
				left: active.offsetLeft,
				top: active.offsetTop
			};
			var oldNext = active.nextSibling;
			over.parentNode.insertBefore(active, kkjs.node.getIndex(over) < kkjs.node.getIndex(active)? over: over.nextSibling);
			
			active.style.position = "";
			over = kkjs.event.getElementFromMousePosition(ev);
			while (over && over.parentNode !== active.parentNode){
				over = over.parentNode;
			}
			active.style.position = "relative";
			if (over !== active){
				active.parentNode.insertBefore(active, oldNext);
			}
			else {
				mouseStartPosition.left += active.offsetLeft - pos.left;
				mouseStartPosition.top += active.offsetTop - pos.top;
			}
		}
		
		var currentMousePosition = kkjs.event.getMousePosition(ev);
		switch (active["kkjs:sortDirection"]){
			case "both":
				css.set(active, {
					left: (currentMousePosition.left - mouseStartPosition.left) + "px",
					top: (currentMousePosition.top - mouseStartPosition.top) + "px"
				});
				break;
			case "horizontal":
				css.set(active, {
					left: (currentMousePosition.left - mouseStartPosition.left) + "px",
					// top: (currentMousePosition.top - mouseStartPosition.top) + "px"
				});
				break;
			case "vertical":
			default:
				css.set(active, {
					//left: (currentMousePosition.left - mouseStartPosition.left) + "px",
					top: (currentMousePosition.top - mouseStartPosition.top) + "px"
				});
		}
	}
});
}).apply();
(function(){
"use strict";

var selection = require("kkjs.selection");
var css = require("kkjs.css");
var event = require("kkjs.event");
var node = require("kkjs.node");

var resizeable = function makeResizeable(att){
	/**
	 * Function resizeable
	 * @name: resizeable
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: makes a node freely resizeable
	 * @parameter:
	 *	att: the configuration-object (must have the attibute node and borderNodes (array with the direction-Nodes - identification over the cursor-style))
	 * @return value: the moveable node
	 */
	
	var storage = makeResizeable;
	if (!storage.isInit){
		storage.activeNode = false;
		storage.startPosition = {left: 0, top: 0};
		storage.stop = function(ev){
			/* Stops the resizing */
			
			if (storage.activeNode){
				if (typeof storage.activeNode.onresizestop === "function"){
					storage.activeNode.onresizestop(ev, storage.activeNode);
				}
				storage.activeNode = false;
				selection.empty();
			}
		};
		storage.start =  function(ev, node, att){
			/* Starts the resizing */
			if (!att){
				return;
			}
			ev.cancelBubble = true;
			selection.empty();
			
			storage.direction = css.get(this, "cursor").replace("-resize", "");
			storage.restrictions = att.restrictions || {};
			storage.activeNode = att.node;
			storage.startPosition = event.getMousePosition(ev);
			storage.startDimension = {
				left: parseFloat(css.get(storage.activeNode, "left")) || 0,
				top: parseFloat(css.get(storage.activeNode, "top")) || 0,
				width: parseFloat(css.get(storage.activeNode, "width")) || 0,
				height: parseFloat(css.get(storage.activeNode, "height")) || 0
			};
			ev.preventDefault();
		};
		event.add(document, "mousemove", function(ev){
			if (!ev.which){
				storage.stop(ev);
			}
			if (storage.activeNode){
				var mPos = event.getMousePosition(ev);
				mPos.left -= storage.startPosition.left;
				mPos.top -= storage.startPosition.top;
				var change = {}, off;
				for (var i in storage.startDimension){
					if (storage.startDimension.hasOwnProperty8i){
						change[i] = storage.startDimension[i];
					}
				}
				if (/n/i.test(storage.direction)){
					change.height -= mPos.top;
					change.top += mPos.top;
					if (storage.restrictions.height){
						if (change.height < storage.restrictions.height[0]){
							off = storage.restrictions.height[0] - change.height;
							change.height += off;
							change.top -= off;
						}
						else if (change.height > storage.restrictions.height[1]){
							off = storage.restrictions.height[0] - change.height;
							change.height += off;
							change.top -= off;
						}
					}
				}
				else if (/s/i.test(storage.direction)){
					change.height = mPos.top;
				}
				
				if (/e/i.test(storage.direction)){
					change.width = mPos.left;
				}
				else if (/w/i.test(storage.direction)){
					change.width = -(change.left = mPos.left);
				}
				
				for (var i in change){
					if (change.hasOwnProperty(i)){
						change[i] += storage.startDimension[i];
					}
				}
				
				if (change.height < 0){
					change.height = 0;
					if (change.top !== storage.startDimension.top){
						change.top = storage.startDimension.top + storage.startDimension.height;
					}
				}
				if (change.width < 0){
					change.width = 0;
					if (change.left !== storage.startDimension.left){
						change.left = storage.startDimension.left + storage.startDimension.width;
					}
				}
				
				for (var i in change){
					if (change.hasOwnProperty(i)){
						storage.activeNode.style[i] = change[i] + "px";
					}
				}
			}
			ev.preventDefault();
		});
		event.add(document, "mouseup", storage.stop);
		storage.isInit = true;
	}
	
	if (att.borderNodes){
		for (var i = 0; i < att.borderNodes.length; i++){
			if (/resize/i.test(css.get(att.borderNodes[i], "cursor"))){
				event.add(att.borderNodes[i], "mousedown", function(ev, node){storage.start.call(this, ev, node, att);});
			}
		}
	}
	else {
		throw new Error("Resize without borderNodes not yet implemented!");
	}
	
	if (!css.get(att.node, "position").match(/absolute|fixed/i)){
		att.node.style.position = "relative";
	}
	else if(att.node.offsetParent){
		var pos = node.getPosition(att.node);
		att.node.style.left = pos.left + "px";
		att.node.style.top = pos.top + "px";
		att.node.style.right = "auto";
		att.node.style.bottom = "auto";
	}
	return att.node;
};


if (typeof exports !== "undefined"){
	exports.resizeable = resizeable;
}
else if (typeof kkjs !== "undefined"){
	kkjs.resizeable = resizeable;
}
})();
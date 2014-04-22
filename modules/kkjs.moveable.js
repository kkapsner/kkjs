(function(){

"use strict";

var event = require("kkjs.event");
var selection = require("kkjs.selection");
var css = require("kkjs.css");
var node = require("kkjs.node");
var kMath = require("kkjs.Math");

var moveable = function makeMoveable(att){
	/**
	 * Function moveable
	 * @name: moveable
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: makes a node freely moveable
	 * @parameter:
	 *	att: the configuration-object (must have the attibute node)
	 * @return value: the moveable node
	 */

	if (!att.activeNode){
		att.activeNode = att.node;
	}
	// make moveable in CSS an adjust position to left/top pixel values.
	if (!css.get(att.node, "position").match(/absolute|fixed|relative/i)){
		att.node.style.position = "relative";
	}
	else if(document.body.contains(att.node)){
		att.node.style.left = att.node.offsetLeft + "px";
		att.node.style.top = att.node.offsetTop + "px";
		att.node.style.right = "auto";
		att.node.style.bottom = "auto";
	}
	event.add(att.activeNode, "mousedown", function(ev){
		moveable.start(ev, att);
	});
};

var activeNode = null;
var movingNode = null;
var startPosition = new kMath.Position(0, 0);
var attributes = {};
moveable.startByScript = function(position, att){
	/**
	 * Function moveable.startByScript
	 * @name: moveable.startByScript
	 * @author: Korbinian Kapsner
	 * @description: starts the moving.
	 * @parameter:
	 *	position: start position of the mouse
	 *	att: the configuration-object. See moveable().
	 */
	
	activeNode = att.node;
	if (att.moveClone){
		movingNode = att.node.cloneNode(true);
		css.set(movingNode, {"position": "absolute", left: att.node.offsetLeft + "px", top: att.node.offsetTop + "px"});
		css.className.add(movingNode, "clone");
		att.node.parentNode.insertBefore(movingNode, att.node);
		if (att.onclone){
			att.onclone(movingNode);
		}
	}
	else {
		movingNode = att.node;
	}
	position.left -= parseFloat(css.get(movingNode, "left")) || 0;
	position.top -= parseFloat(css.get(movingNode, "top")) || 0;
	
	startPosition = position;
	attributes = att;
	
};
moveable.start = function(ev, att){
	/**
	 * Function moveable.start
	 * @name: moveable.start
	 * @author: Korbinian Kapsner
	 * @description: starts the moving by an event.
	 * @parameter:
	 *	ev: the event object
	 *	att: the configuration-object. See moveable().
	 */
	
	moveable.stop(ev, activeNode);
	if (att.onstart && att.onstart(ev, att.node) === false){
		return;
	}
	
	ev.stopPropagation();
	ev.preventDefault();
	selection.empty();
	
	moveable.startByScript(event.getMousePosition(ev, true), att);
};
moveable.stop = function(ev){
	/**
	 * Function moveable.stop
	 * @name: moveable.stop
	 * @author: Korbinian Kapsner
	 * @description: stops the moving.
	 * @parameter:
	 *	ev: the event object
	 */
	
	if (activeNode){
		if (attributes.onstop && attributes.onstop(ev, activeNode, movingNode) === false){
			return;
		}
		if (attributes.moveClone){
			node.remove(movingNode);
		}
		ev.stopPropagation();
		ev.preventDefault();
		selection.empty();
		
		activeNode = null;
	}
};
event.add(document, "mouseup", moveable.stop);

event.add(document, "mousemove", function(ev){
	if (activeNode){
		var mPos = event.getMousePosition(ev, true).sub(startPosition);
		if (attributes.allowedRange){
			mPos = attributes.allowedRange.restrict(mPos);
		}
		if (attributes.onmove && attributes.onmove(ev, activeNode, movingNode, mPos) === false){
			return;
		}
		ev.stopPropagation();
		ev.preventDefault();
		selection.empty();
		
		css.set(movingNode, mPos);
		
		if (attributes.onaftermove){
			attributes.onaftermove(ev, activeNode, movingNode, mPos);
		}
	}
});



if (typeof exports !== "undefined"){
	module.exports = moveable;
}
else if (typeof kkjs !== "undefined"){
	kkjs.moveable = moveable;
}

}).apply();
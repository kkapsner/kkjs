var oo = require("./kkjs.oo");


function addEvent(node, event, func){
	var useCapture = false;
	
	if (node.addEventListener){
		node.addEventListener(event, func, useCapture);
	}
	else if (node.attachEvent){
		node.attachEvent("on" + event, func);
	}
	else {
		throw new Error("This browser is to old and is not supported.");
	}
}

function removeEvent(node, event, func){
	var useCapture = false;
	
	if (node.addEventListener){
		node.removeEventListener(event, func, useCapture);
	}
	else if (node.attachEvent){
		node.detachEvent("on" + event, func);
	}
	else {
		throw new Error("This browser is to old and is not supported.");
	}
}
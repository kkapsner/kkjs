(function(){

"use strict";

/**
 * Object RingIndicator
 * @name: RingIndicator
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: RingIndicator description
 */

var kNode = require("kkjs.node");

var renderEngine = "canvas";
// enable VML in IE7/8
/*@cc_on @if (@_jscript){
	if (document.documentMode && document.documentMode <= 8){
		
		var style = kNode.create({
			tag: "style",
			type: "text/css",
			parentNode: document.getElementsByTagName("head")[0]
		});
		style.styleSheet.cssText = "v\\:shape {behavior:url(#default#VML);";// display:inline-block;}";
		
		if (document.namespaces && document.namespaces.add && !document.namespaces.v){
			document.namespaces.add("v","urn:schemas-microsoft-com:vml");
		}
		renderEngine = "VML";
	}
}@end @*/

var renderUpdate  = {
	VML: function(ring, node){
		/**
		 * VML rendering function
		 * @parameter:
		 *	ring: the ring instance
		 *	node: the display node
		 */
		
		var value = (ring.value - ring.range.min) / (ring.range.max - ring.range.min);
		var path = "ar -1311, -1311, 1311, 1311, 1311,     0, 1311, 0" +
			"ar  -851,  -851,  851,  851,  851,     0,  851, 0";
		if (value > 0){
			var x, y, od = "w";
			if (value >= 1){
				x = 0;
				y = -1;
				od = "a";
			}
			else {
				x = Math.sin(value * 2 * Math.PI);
				y = -Math.cos(value * 2 * Math.PI);
			}
			path +=
				od + "r -1181, -1181, 1181, 1181,    0, -1181, " + Math.round(x*1181) + ", " +Math.round(y*1181) +
				"at  -981,  -981,  981,  981,  " + Math.round(x*981) + ", " + Math.round(y*981) + ",    0, -981";
		}
		path += "ns e";
		node.path = path;
	},
	canvas: function(ring, node){
		/**
		 * canvas rendering function
		 * @parameter:
		 *	ring: the ring instance
		 *	node: the display node
		 */
		
		if (!node.getContext){
			return;
		}
		var ctx = node.getContext("2d");
		var w = node.width;
		var h = node.height;
		var min = Math.min(w, h);
		var outerLineWidth = min / 6;
		var innerLineWidth = outerLineWidth / 2.3;
		
		var r = (min - outerLineWidth - min / 20) / 2;
		var x = w / 2;
		var y = h / 2;
		
		ctx.lineCap = "round";
		
		var ratio = (ring.value - ring.range.min) / (ring.range.max - ring.range.min);
		
		// clear canvas
		ctx.clearRect(0, 0, w, h);
		
		// draw black circle
		ctx.strokeStyle = "#696969";
		ctx.lineWidth = outerLineWidth;
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.stroke();
		
		// cut "time" out
		ctx.strokeStyle = "rgb(0, 0, 0)";
		ctx.lineWidth = innerLineWidth;
		ctx.beginPath();
		var startAngle, endAngle;
		if (this.fillAndEmpty){
			ratio *= 2;
		}
		if (ratio <= 1){
			startAngle = -0.5 * Math.PI;
			endAngle = -0.5 * Math.PI + ratio * 2 * Math.PI;
		}
		else {
			startAngle = -0.5 * Math.PI + (ratio - 1) * 2 * Math.PI;
			endAngle = 1.5 * Math.PI;
		}
		ctx.arc(x, y, r, startAngle, endAngle, false);
		
		var oldGCO = ctx.globalCompositeOperation;
			ctx.globalCompositeOperation = "destination-out";
		ctx.stroke();
		ctx.globalCompositeOperation = oldGCO;
	}
};

var RingIndicator = require("kkjs.Progress").extend().implement(require("kkjs.NodeRepresentator")).implement({
	fillAndEmpty: false,
	updateDimensions: function(){
		/**
		 * Function RingIndicator.updateDimensions
		 * @name: RingIndicator.updateDimensions
		 * @author: Korbinian Kapsner
		 * @description: updates the <canvas> paint dimensions to match the
		 *	nodes real dimensions.
		 */
		
		if (this.nodes){
			this.nodes.forEach(function(node){
				if (renderEngine === "canvas"){
					node.width = node.offsetWidth;
					node.height = node.offsetHeight;
				}
			});
		}
	},
	_createNode: function(){
		/* Implementation of the NodeRepresentator API */
		var node;
		switch (renderEngine){
			case "VML":
				node = kNode.create({
					tag: "v:shape",
					fillcolor: "#696969",
					coordorigin:"1380 1380",
					coordsize: "2760 2760"
				});
				break;
			case "canvas":
				node = kNode.create({
					tag: "canvas"
				});
				break;
		}
		return node;
	},
	_updateNode: function(node){
		/* Implementation of the NodeRepresentator API */
		switch (renderEngine){
			case "VML":
					renderUpdate.VML(this, node);
				break;
			case "canvas":
				renderUpdate.canvas(this, node);
				break;
		}
	}
});

if (typeof exports !== "undefined"){
	module.exports = RingIndicator;
}
else if (typeof kkjs !== "undefined"){
	kkjs.RingIndicator = RingIndicator;
}

})();
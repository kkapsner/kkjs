(function(){
"use strict";

var Node = require("kkjs.node");

kkjs.layout = {
	create: {
		overlay: function createOverlay(){
			return Node.create({
				tag: "div",
				style: {
					position: "fixed",
					left: 0,
					top: 0,
					height: "100%",
					width: "100%",
					backgroundColor: "black",
					opacity: 0.5,
					zIndex: 2
				}
			});
		},
		border: function createBorder(){
			var border = [];
			var dim = {
				top: {
					n: {top: "-1px", height: "3px"},
					c: {top: "0px", height: "100%"},
					s: {bottom: "-1px", height: "3px"}
				},
				left: {
					w: {left: "-1px", width: "3px"},
					m: {width: "100%", left: "0px"},
					e: {right: "-1px", width: "3px"}
				}
			};
			var dir = [
				"nm", "ce", "sm", "cw",
				"nw", "sw", "se", "ne"
			];
			for (var i = 0; i < dir.length; i++){
				var style = "position: absolute; background-image: url('" + kkjs.url.images + "border_" + dir[i] + ".png');";
				var top = dir[i].charAt(0);
				var left = dir[i].charAt(1);
				for (var s in dim.top[top]){
					if (dim.top[top].hasOwnProperty(s)){
						style += ";" + s + ": " + dim.top[top][s];
					}
				}
				for (var s in dim.left[left]){
					if (dim.left[left].hasOwnProperty(s)){
						style += ";" + s + ": " + dim.left[left][s];
					}
				}
				
				border.push("<div style=\"" + style + "\"></div>");
			}
			return Node.create({
				tag: "fragment",
				innerHTML: border.join("")
			});
		}
	}
};


})();
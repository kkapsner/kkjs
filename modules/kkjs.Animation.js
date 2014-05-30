(function(){
"use strict";

var css = require("kkjs.css");
var oo = require("kkjs.oo");
var EventEmitter = require("kkjs.EventEmitter");
var Timer = require("kkjs.Timer");

var Animation = EventEmitter.extend(function Animation(node, property, tween, duration){
	/**
	 * Class Animation
	 * @author: Korbinian Kapsner
	 * @name: Animation
	 * @version: 1.0
	 * @description: 
	 * @parameter:
	 *	node: the node to be animated
	 *	property: the property of the node to be animated
	 *	tween: used transition tween
	 *	duration: duration of the animation.
	 */
	 
	this.node = node;
	this.property = property;
	this.tween = tween || function(x){return x;};
	this.duration = (parseFloat(duration, 10) || 1) * 1000;
	this.timer = new Timer(this.duration);
	this.timer.animation = true;
})
.implement({
	timeStep: 20,
	duration: 1000,
	delay: 0,
	timeout: false,
	timer: null,
	
	stop: function(){
		/**
		 * Function Animation.stop
		 * @name: Animation.stop
		 * @author: Korbinian Kapsner
		 * @description: stops the Animation immediately.
		 */
		window.clearTimeout(this.timeout);
		this.timer.stop();
		this.timer.removeAllListeners();
	},
	
	runCSSTo: function(toValue){
		/**
		 * Function Animation.runCSSTo
		 * @name: Animation.runCSSTo
		 * @author: Korbinian Kapsner
		 * @description: starts the animation of a CSS property.
		 * @parameter:
		 *	toValue: end value.
		 */
		this.runTo(toValue, true);
	},
	runTo: function(toValue, isCSS){
		/**
		 * Function Animation.runTo
		 * @name: Animation.runTo
		 * @author: Korbinian Kapsner
		 * @description: starts the animation.
		 * @parameter:
		 *	toValue: end value.
		 *	isCSS: if the property is CSS.
		 */
		this.stop();
		var timer = this.timer;
		timer.time = this.duration;
		timer.tickTime = this.timeStep;
		
		this.emit("start");
		
		var fromValue, postFix;
		if (isCSS){
			fromValue = this.node.style[this.property] || css.get(this.node, this.property);
			postFix = 0;
			if (typeof fromValue === "string"){
				postFix = fromValue.replace(/^-?\d*(?:\.\d+)?/, "");
				fromValue = parseFloat(fromValue.replace(/\D+$/, ""), 10) || 0;
			}
		}
		else {
			fromValue = this.node[this.property];
		}
		
		var distance = toValue - fromValue;
		var This = this;
		timer.on("tick", function(){
			var p = timer.getTime(true) / This.duration;
			This.emit("step", p);
			var value = fromValue + This.tween(p) * distance;
			if (isCSS){
				value = value + postFix;
				css.setSingle(This.node, This.property, value);
			}
			else {
				This.node[This.property] = value;
			}
		});
		timer.on("timeOver", function(){
			if (isCSS){
				css.setSingle(This.node, This.property, toValue + postFix);
			}
			else {
				This.node[This.property] = toValue;
			}
			This.emit("finish");
		});
		timer.onOnce("stop", function(){
			this.removeAllListeners("tick");
		});
		if (this.delay){
			this.timeout = window.setTimeout(function(){
				timer.start();
			}, this.delay);
		}
		else {
			timer.start();
		}
		return;
	}
});

if (typeof exports !== "undefined"){
	module.exports = Animation;
}
else if (typeof kkjs !== "undefined"){
	kkjs.Animation = Animation;
}

})();
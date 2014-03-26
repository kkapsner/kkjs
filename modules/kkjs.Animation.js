(function(){
"use strict";
/**
 * Class kkjs.Animation
 * @author: Korbinian Kapsner
 * @name: kkjs.Animation
 * @version: 1.0
 * @description:
 * @parameter
 *
 */

var css = require("kkjs.css");
var oo = require("kkjs.oo");
var EventEmitter = require("kkjs.EventEmitter");
var Timer = require("kkjs.Timer");

var Animation = EventEmitter.extend(function Animation(node, property, tween, duration){
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
		window.clearTimeout(this.timeout);
		this.timer.stop();
	},
	
	runCSSTo: function(toValue){
		this.runTo(toValue, true);
	},
	runTo: function(toValue, isCSS){
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
		timer.on("stop", function(){
			this.removeAllListeners();
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
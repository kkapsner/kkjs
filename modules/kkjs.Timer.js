(function(){

"use strict";

/**
 * Object Timer
 * @name: Timer
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: Class for a timer that counts back.
 */

var requestAnimationFrame =
	window.requestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	window.khtmlRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	function(callback){
		return window.setTimeout(callback, 50);
	} ||
	null;
var cancelAnimationFrame =
	window.cancelAnimationFrame ||
	window.mozCancelAnimationFrame ||
	window.webkitCancelAnimationFrame ||
	window.oCancelAnimationFrame ||
	window.khtmlCancelAnimationFrame ||
	window.msCancelAnimationFrame ||
	window.webkitCancelRequestAnimationFrame ||
	function(id){
		return window.clearTimeout(id);
	} ||
	null;

var NodeRepresentator = require("kkjs.NodeRepresentator");
var knode = require("kkjs.node");
//var sprintf = require("kkjs.sprintf");

var Timer = NodeRepresentator.extend(function Timer(time){
	this.time = time;
	this.tick = this.tick.bind(this);
}).implement({
	time: null,
	animation: false,
	getTime: function(elapsed){
		if (elapsed){
			return this.time - this.getTime(false);
		}
		
		if (this.isRunning()){
			return this.time - (new Date() - this.startTime);
		}
		else if (this.isPaused()){
			return this.time - (this.pauseTime - this.startTime);
		}
		else if (this.isStopped()){
			return 0;
		}
		else {
			return this.time;
		}
	},
	getTimeString: function(){
		var time = this.getTime() / 1000;
		var sign = "";
		if (time < 0){
			time *= -1;
			if (time < 1){
				time = 0;
			}
			else {
				sign = "-";
			}
		}
		return sign + require("kkjs.sprintf")("%02d:%02d", Math.floor(time / 60), Math.round(time % 60));
		//return sprintf("%02d:%02d", Math.floor(time / 60), Math.round(time % 60));
	},
	
	isRunning: function(){
		return !!this.timeout;
	},
	isPaused: function(){
		return !!this.pauseTime;
	},
	isStopped: function(){
		return !!this.stopTime;
	},
	
	startTime: null,
	pauseTime: null,
	stopTime: null,
	tickTime: 200,
	
	timeout: null,
	interval: null,
	animationFrame: null,
	
	start: function(){
		if (!this.isRunning()){
			this.stopTime = null;
			if (this.isPaused()){
				this.startTime = new Date() - (this.pauseTime - this.startTime);
				this.pauseTime = null;
				this.emit("resume");
			}
			else {
				this.startTime = new Date();
				this.emit("start");
			}
			this._setTicking();
			this.emit("run");
		}
	},
	pause: function(){
		if (this.isRunning()){
			this.pauseTime = new Date();
			this._clearTicking();
			this.emit("pause");
		}
	},
	stop: function(){
		if (this.isRunning()){
			this.stopTime = new Date();
			this._clearTicking();
			this.emit("stop.running");
			this.emit("stop");
		}
		else if (this.isPaused()){
			this.stopTime = new Date();
			this.pauseTime = null;
			this.emit("stop.paused");
			this.emit("stop");
		}
	},
	
	tick: function(){
		this.update();
		this.emit("tick");
		if (this.getTime() <= 0){
			this.stop();
			this.emit("timeOver");
		}
		else {
			if (this.animation){
				this.animationFrame = requestAnimationFrame(this.tick);
			}
		}
	},
	
	// "private" functions
	_setTicking: function(){
		this.timeout = window.setTimeout(this.tick, this.getTime());
		if (this.animation){
			this.animationFrame = requestAnimationFrame(this.tick);
		}
		else {
			this.interval = window.setInterval(this.tick, this.tickTime);
		}
	},
	_clearTicking: function(){
		window.clearTimeout(this.timeout);
		this.timeout = null;
		cancelAnimationFrame(this.animationFrame);
		this.animationFrame = null;
		window.clearInterval(this.interval);
		this.interval = null;
	},
	
	// NodeRepresentator required functions
	_createNode: function(){
		return knode.create({
			tag: "span",
			className: "timer",
			timer: this
		});
	},
	_updateNode: function(node){
		node.innerHTML = this.getTimeString().encodeHTMLEntities();
	}
});

if (typeof exports !== "undefined"){
	module.exports = Timer;
}
else if (typeof kkjs !== "undefined"){
	kkjs.Timer = Timer;
}

})();
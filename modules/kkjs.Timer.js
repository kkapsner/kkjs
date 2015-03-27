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
var sprintf = require("kkjs.sprintf");

var Timer = NodeRepresentator.extend(function Timer(time){
	/**
	 * Constructor Timer
	 * @name: Timer
	 * @author: Korbinian Kapsner
	 * @description: creates a timer instance
	 * @parameter:
	 *	time (optional): if provided the countdown time. If not provided
	 *		a "countup" timer is created.
	 * @return value: the timer instance
	 */
	
	this.countdown = !!time;
	this.displayElapsedTime = !this.countdown;
	if (this.countdown){
		this.time = time;
	}
	else {
		this.time = -1;
	}
	this.tick = this.tick.bind(this);
}).implement({
	time: null,
	countdown: true,
	displayElapsedTime: true,
	animation: false,
	getTime: function getTime(elapsed){
		/**
		 * Function Timer.getTime
		 * @name: Timer.getTime
		 * @author: Korbinian Kapsner
		 * @description: returns the time of the timer.
		 * @parameter:
		 *	elapsed: if the elapsed time should be returned
		 * @return value: the time of the timer
		 */
		
		if (elapsed){
			return this.getElapsedTime();
		}
		else {
			return this.time - this.getElapsedTime();
		}
	},
	getElapsedTime: function getElapsedTime(){
		/**
		 * Function Timer.getElapsedTime
		 * @name: Timer.getElapsedTime
		 * @author: Korbinian Kapsner
		 * @description: returns the elapsed time of the timer
		 * @return value: the elapsed time
		 */
		
		if (this.isRunning()){
			return (new Date() - this.startTime);
		}
		else if (this.isPaused()){
			return (this.pauseTime - this.startTime);
		}
		else if (this.isStopped()){
			return this.time;
		}
		else {
			return 0;
		}
	},
	setElapsedTime: function setElapsedTime(time){
		/**
		 * Function Timer.setElapsedTime
		 * @name: Timer.setElapsedTime
		 * @author: Korbinian Kapsner
		 * @description: sets the elapsed time of the timer
		 * @parameter:
		 *	time: the elapsed time
		 */
		if (this.isRunning() || this.isPaused()){
			this.startTime = this.startTime - time + this.getElapsedTime();
		}
		else if (this.isStopped()){
			throw new Error("Unable to set elapsed time of a stopped timer.");
		}
		else {
			throw new Error("Unable to set elapsed time of an unused timer.");
		}
		this.emit("setElapsedTime", time);
		this.emit("tick");
		this.update();
	},
	getTimeString: function getTimeString(elapsed){
		/**
		 * Function Timer.getTimeString
		 * @name: Timer.getTimeString
		 * @author: Korbinian Kapsner
		 * @description: returns the time of the timer as a mm:ss string
		 * @parameter:
		 *	elapsed: if the elapsed time should be returned
		 * @return value: the formated time string
		 */
		
		if (typeof elapsed === "undefined"){
			elapsed = this.displayElapsedTime;
		}
		var time = this.getTime(elapsed) / 1000;
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
		return sign + sprintf("%02d:%02d", Math.floor(time / 60), Math.round(time % 60));
	},
	
	isRunning: function isRunning(){
		/**
		 * Function Timer.isRunning
		 * @name: Timer.isRunning
		 * @author: Korbinian Kapsner
		 * @description: checks if the timer is currently running
		 * @return value: if the timer is running
		 */
		
		return !!this.timeout;
	},
	isPaused: function isPaused(){
		/**
		 * Function Timer.isPaused
		 * @name: Timer.isPaused
		 * @author: Korbinian Kapsner
		 * @description: checks if the timer is currently paused
		 * @return value: if the timer is paused
		 */
		
		return !!this.pauseTime;
	},
	isStopped: function isStopped(){
		/**
		 * Function Timer.isStopped
		 * @name: Timer.isStopped
		 * @author: Korbinian Kapsner
		 * @description: checks if the timer is currently stopped
		 * @return value: if the timer is stopped
		 */
		
		return !!this.stopTime;
	},
	
	startTime: null,
	pauseTime: null,
	stopTime: null,
	tickTime: 200,
	
	timeout: null,
	interval: null,
	animationFrame: null,
	
	start: function start(){
		/**
		 * Function Timer.start
		 * @name: Timer.start
		 * @author: Korbinian Kapsner
		 * @description: starts the timer
		 */
		
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
	pause: function pause(){
		/**
		 * Function Timer.pause
		 * @name: Timer.pause
		 * @author: Korbinian Kapsner
		 * @description: pauses the timer
		 */
		
		if (this.isRunning()){
			this.pauseTime = new Date();
			this._clearTicking();
			this.emit("pause");
		}
	},
	stop: function stop(){
		/**
		 * Function Timer.stop
		 * @name: Timer.stop
		 * @author: Korbinian Kapsner
		 * @description: stops the timer
		 */
		
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
	
	tick: function tick(){
		/**
		 * Function Timer.tick
		 * @name: Timer.tick
		 * @author: Korbinian Kapsner
		 * @description: tick function that is called in every timer tick.
		 *	Should only be used in Timer._setTicking().
		 */
		
		this.update();
		this.emit("tick");
		if (this.countdown && this.getTime() <= 0){
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
		/**
		 * Function Timer._setTicking
		 * @name: Timer._setTicking
		 * @author: Korbinian Kapsner
		 * @description: starts the ticking of the timer.
		 */
		
		this.tick();
		if (this.countdown){
			this.timeout = window.setTimeout(this.tick, this.getTime());
		}
		if (this.animation){
			this.animationFrame = requestAnimationFrame(this.tick);
		}
		else {
			this.interval = window.setInterval(this.tick, this.tickTime);
		}
	},
	_clearTicking: function(){
		/**
		 * Function Timer._clearTicking
		 * @name: Timer._clearTicking
		 * @author: Korbinian Kapsner
		 * @description: clears the ticking of the timer.
		 */
		
		window.clearTimeout(this.timeout);
		this.timeout = null;
		cancelAnimationFrame(this.animationFrame);
		this.animationFrame = null;
		window.clearInterval(this.interval);
		this.interval = null;
	},
	
	// NodeRepresentator required functions
	_createNode: function(displayRemaining){
		/* NodeRepresentator interface implementation */
		var className = "";
		if (typeof displayRemaining !== "undefined"){
			className = " " + (displayRemaining? "remaining": "elapsed");
		}
		return knode.create({
			tag: "span",
			className: "timer" + className,
			timer: this,
			displayRemaining: displayRemaining
		});
	},
	_updateNode: function(node){
		/* NodeRepresentator interface implementation */
		node.innerHTML = this.getTimeString(node.displayRemaining).encodeHTMLEntities();
	}
});

if (typeof exports !== "undefined"){
	module.exports = Timer;
}
else if (typeof kkjs !== "undefined"){
	kkjs.Timer = Timer;
}

})();
(function(){
"use strict";

var Slider = require("kkjs.Slider");
var knode = require("kkjs.node");
var event = require("kkjs.event");

var TraySlider = Slider.extend(function(att){
	//this.Super("constructor")(att); //not working in strict mode...
	Slider.call(this, att);
	
	this.tray = knode.create({tag: "div", className: "tray", childNodes: [this.slider], parentNode: this.container});
	var This = this;
	event.add(this.tray, "mousedown", function(ev){
		if (!This.disabled){
			var dir = (This.direction === "h")? "left": "top";
			var value = event.getMousePosition(ev, true, knode.getPosition(this))[dir] / This.slideLength * This.max;
			This.setValue(value);
			event.fireOwn(This.slider, "mousedown", ev);
		}
	});
	
}).implement({
	onset: function(){},
	_onset: function(){
		/**
		 * Implementation of the Slider Interface.
		 */
		var dir = (this.direction === "h")? "left": "top";
		kkjs.css.set(this.slider, dir, this.value / (this.max - this.min) * this.slideLength + "px");
		this.onset();
	}
});


if (typeof exports !== "undefined"){
	module.exports = TraySlider;
}
else if (typeof kkjs !== "undefined"){
	kkjs.TraySlider = TraySlider;
}

})();
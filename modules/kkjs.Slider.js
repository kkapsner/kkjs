(function(){
"use strict";

var oo = require("kkjs.oo");
var knode = require("kkjs.node");
var event = require("kkjs.event");
var css = require("kkjs.css");

var Slider = oo.Base.extend(
	function Slider(att){
		for (var i in att){
			if (att.hasOwnProperty(i)){
				this[i] = att[i];
			}
		}
		if (!this.container){
			this.container = knode.create({tag: "div", className: "kkjs_sliderContainer", style: {position: "relative"}});
			this.container.parentSlider = this;
		}
		this.slider = knode.create({tag: "div", className: "slider" + (this.disabled? " disabled": ""), parentNode: this.container});
		this.slider.parentSlider = this;
		event.add(this.slider, "mousedown", function(ev){
			if (!this.parentSlider.disabled){
				Slider.activeSlider = this.parentSlider;
				Slider.dragStartPosition = event.getMousePosition(ev);
				Slider.dragStartValue = this.parentSlider.getValue();
				ev.preventDefault();
			}
		});
		
		this.setValue(this.value);
	}
).implement({
	slideLength: 200,
	disabled: false,
	value: 5,
	min: 0,
	max: 10,
	direction: "h",
	showValueInTitle: false,
	slideDirection: 1,
	_onset: function(){},
	onchange: function(){},
	setDisabled: function setDisabled(disabled){
		this.disabled = !!disabled;
		css.className[this.disabled? "add": "remove"](this.slider, "disabled");
	},
	setValue: function setValue(value){
		if (typeof value !== "number"){
			value = this.value;
		}
		if (value < this.min){
			value = this.min;
		}
		if (value > this.max){
			value = this.max;
		}
		this.value = value;
		this._onset();
		if (this.showValueInTitle){
			this.slider.title = this.value;
		}
		return this;
	},
	changeValue: function changeValue(){
		this.onchange(this.value);
	},
	getValue: function getValue(){
		return this.value;
	},
	drag: function(){
		
	}
}).implementStatic({
	activeSlider: false,
	dragStart: {top: 0, left: 0}
});

event.add(document, "mousemove", function(ev){
	if (Slider.activeSlider){
		var slider = Slider.activeSlider;
		var mPos = event.getMousePosition(ev);
		var dir = (slider.direction === "h")? "left": "top";
		slider.setValue((mPos[dir] - Slider.dragStartPosition[dir]) * slider.slideDirection / slider.slideLength * (slider.max - slider.min) + Slider.dragStartValue);
		ev.preventDefault();
	}
	return null;
});
event.add(document, "mouseup", function(){
	if (Slider.activeSlider){
		Slider.activeSlider.changeValue();
		Slider.activeSlider = false;
	}
});

if (typeof exports !== "undefined"){
	module.exports = Slider;
}
else if (typeof kkjs !== "undefined"){
	kkjs.Slider = Slider;
}

})();
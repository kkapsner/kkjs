(function(){
"use strict";
/**
 *
 */



kkjs.ColumnSlider = kkjs.Slider.extend(
	function ColumnSlider(att){
		this.column = kkjs.node.create({tag: "div"});
		//this.Super("constructor")(att);
		kkjs.Slider.call(this, att);
		
		kkjs.css.set(this.column, this._getColumnStyle());
		kkjs.css.set(this.slider, this._getSliderStyle());
		this.container.insertBefore(this.column, this.slider);
		this._onset();
	}
).implement({
	_onset: function(){
		var pxValue = this.value / (this.max - this.min) * this.slideLength;
		var sliderStyle = {};
		var columnStyle = {};
		if (this.direction === "h") {
			sliderStyle.left = pxValue * this.slideDirection + "px";
			columnStyle.width = pxValue + "px";
			if (this.slideDirection < 0){
				columnStyle.marginLeft = (this.slideLength - pxValue) + "px";
			}
		}
		else {
			sliderStyle.top = pxValue * this.slideDirection + "px";
			columnStyle.height = pxValue + "px";
			if (this.slideDirection < 0){
				columnStyle.marginTop = (this.slideLength - pxValue) + "px";
			}
		}
		kkjs.css.set(this.slider, sliderStyle);
		kkjs.css.set(this.column, columnStyle);
		this.onset(this.getValue());
	},
	onset: function(){},
	getSliderStyle: function getSliderStyle(){
		return {height: "16px", width: "16px", backgroundColor: "black", margin: "-8px"};
	},
	_getSliderStyle: function getSliderStyle(){
		var ret = this.getSliderStyle();
		ret.position = "absolute";
		if (this.direction === "h"){
			ret.top = "50%";
			ret.left = "0";
		}
		else {
			ret.top = "0";
			ret.left = "50%";
		}
		return ret;
	},
	getColumnStyle: function getColumnStyle(){
		return {backgroundColor: "#999", width: "10px", height: "10px", margin: "-5px"};
	},
	_getColumnStyle: function getColumnStyle(){
		var ret = this.getColumnStyle();
		ret.position = "absolute";
		if (this.direction === "h"){
			ret.marginLeft = ret.marginRight = "0";
			ret.top = "50%";
			ret.left = (this.slideDirection > 0)? "0": -this.slideLength + "px";
		}
		else {
			ret.marginTop = ret.marginBottom = "0";
			ret.top = (this.slideDirection > 0)? "0": -this.slideLength + "px";
			ret.left = "50%";
		}
		return ret;
	}
	
});

}).apply();
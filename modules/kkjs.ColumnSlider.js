(function(){
"use strict";
/**
 *
 */



kkjs.ColumnSlider = kkjs.Slider.extend(
	function ColumnSlider(att){
		/**
		 * Constructor ColumnSlider
		 * @name: ColumnSlider
		 * @author: Korbinian Kapsner
		 * @description: A vertical slider that has a column.
		 * @parameter:
		 *	att:
		 */
		
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
		/**
		 * Implementation of the Slider-Interface.
		 */
		
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
		/**
		 * Function ColumnSlider.getSliderStyle
		 * @name: ColumnSlider.getSliderStyle
		 * @author: Korbinian Kapsner
		 * @description: Returns the default style of the slider.
		 * @return value: the default style for the slider.
		 */
		
		return {height: "16px", width: "16px", backgroundColor: "black", margin: "-8px"};
	},
	_getSliderStyle: function getSliderStyle(){
		/**
		 * Function ColumnSlider._getSliderStyle
		 * @name: ColumnSlider._getSliderStyle
		 * @author: Korbinian Kapsner
		 * @description: Returns the style of the slider.
		 * @return value: the style for the slider.
		 */
		
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
		/**
		 * Function ColumnSlider.getColumnStyle
		 * @name: ColumnSlider.getColumnStyle
		 * @author: Korbinian Kapsner
		 * @description: Returns the default style of the column.
		 * @return value: the default style for the column.
		 */
		
		return {backgroundColor: "#999", width: "10px", height: "10px", margin: "-5px"};
	},
	_getColumnStyle: function getColumnStyle(){
		/**
		 * Function ColumnSlider._getColumnStyle
		 * @name: ColumnSlider._getColumnStyle
		 * @author: Korbinian Kapsner
		 * @description: Returns the current style of the column.
		 * @return value: the current style for the column.
		 */
		
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
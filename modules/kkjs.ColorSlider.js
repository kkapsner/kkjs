(function(){
"use strict";
/**
 *
 */

kkjs.load.module("Slider");
kkjs.load.module("ColumnSlider");
kkjs.load.module("layout");
kkjs.load.module("moveable");

kkjs.ColorSlider = kkjs.oo.Base.extend(function ColorSlider(att){
	for (var i in att){
		if (att.hasOwnProperty(i)){
			this[i] = att[i];
		}
	}
	
	if (typeof this.value === "string"){
		var c = kkjs.color.hex.toRgb(this.value);
		this.value = {
			red: c.r,
			green: c.g,
			blue: c.b
		};
	}
	this.slider = {};
	var pos = 0;
	for (var i in this.value){
		if (this.value.hasOwnProperty(i)){
			this.slider[i] = this._createSlider();
			this.slider[i].setValue(this.value[i]);
			this.slider[i].container.style.position = "absolute";
			this.slider[i].container.style.left = pos? ((pos-1)? "95%": "50%"): "5%";
			this.slider[i].column.style.backgroundColor = i;
			pos++;
		}
	}
	this.valueInput = kkjs.node.create({
		tag: "input",
		value: this.getColor(),
		style: {
			fontSize: "9px",
			lineHeight: "12px",
			width: "38px",
			height: "12px",
			margin: "0",
			padding: "0",
			textAlign: "center",
			backgroundColor: "white",
			border: "0px none transparent"
		}
	});
	kkjs.event.add.advancedChange(this.valueInput, function(){
		this.setValue(this.valueInput.value);
	}.bind(this));
	this.container = kkjs.node.create({
		tag: "span",
		style: {
			backgroundColor: this.getColor(),
			position: "relative",
			width: "50px",
			height: "30px",
			display: "inline-block",
			margin: "2px"
		},
		childNodes:[
			{
				tag: "span",
				style: {
					display: "none",
					position: "absolute",
					left: "50%",
					top: "50%",
					width: "38px",
					height: "12px",
					margin: "-6px -19px"
				},
				childNodes: [
					this.valueInput,
					kkjs.layout.create.border()
				]
			},
			kkjs.layout.create.border(),
			{
				tag: "div",
				style: {
					position: "absolute",
					width: "80%",
					margin: "0 -40%",
					left: "50%",
					top: "5px"
				},
				childNodes: [
					this.slider.red.container,
					this.slider.green.container,
					this.slider.blue.container
				]
			}
		]
	});
	var _this = this.container.colorSlider = this;
	
	kkjs.event.add(this.container, "click", function(ev){
		ev.stopPropagation();
		ev.preventDefault();
		var slider = this.colorSlider;
		if (kkjs.ColorSlider.activeColorSlider && kkjs.ColorSlider.activeColorSlider !== slider){
			kkjs.ColorSlider.activeColorSlider.hideSliders();
		}
		kkjs.ColorSlider.activeColorSlider = slider;
		this.colorSlider.showSliders();
	});
	
	if (this.dragAndDrop){
		this._enableDragAndDrop();
	}
	
	kkjs.event.add(document, "click", function(){
		_this.hideSliders();
	});
	this.hideSliders();
	
})
.implement({
	value: {red: 0, green: 0, blue: 0},
	changeTimeout: false,
	dragTimeout: false,
	dragAndDrop: true,
	showValueInNode: false,
	setValue: function(value, g, b){
		var r;
		if (typeof value === "string"){
			value = kkjs.color.hex.toRgb(str);
		}
		if (typeof value === "object"){
			if (("r" in obj) && ("g" in obj) && ("b" in obj)){
				r = obj.r;
				g = obj.g;
				b = obj.b;
			}
			else {
				r = obj.red;
				g = obj.green;
				b = obj.blue;
			}
		}
		else {
			var r = value;
		}
		this.slider.red.setValue(r);
		this.slider.green.setValue(g);
		this.slider.blue.setValue(b);
	},
	getColor: function getColor(){
		return kkjs.color.rgb.toHex(this.value.red, this.value.green, this.value.blue);
	},
	getComplementaryColor: function getComplementaryColor(){
		return kkjs.color.rgb.toHex(kkjs.color.rgb.complementary(this.value.red, this.value.green, this.value.blue));
	},
	onset: function onset(){},
	_onset: function onset(){
		if (this.container){
			for (var i in this.slider){
				if (this.slider.hasOwnProperty(i)){
					this.value[i] = this.slider[i].getValue();
				}
			}
			this.container.style.backgroundColor = this.getColor();
			this.valueInput.value = this.getColor();
			this.onset();
			this._onchange();
		}
	},
	onchange: function onchange(){},
	_onchange: function onchange(){
		if (this.changeTimeout){
			window.clearTimeout(this.changeTimeout);
		}
		this.changeTimeout = window.setTimeout(this.onchange.bind(this), 250);
	},
	hideSliders: function hideSliders(){
		this.container.firstChild.style.display = this.slider.red.container.parentNode.style.display = "none";
	},
	showSliders: function showSliders(){
		this.slider.red.container.parentNode.style.display = "";
		this.container.firstChild.style.display = "inline-block";
	},
	
	_createSlider: function createSlider(){
		var slider = new kkjs.ColumnSlider({
			colorSlider: this,
			direction: "v",
			slideDirection: -1,
			showValueInTitle: false,
			min: 0,
			max: 255,
			slideLength: 100,
			onset: function(){this.value = Math.round(this.getValue()); this.colorSlider._onset();},
			onchange: function(){this.colorSlider._onchange();},
			getSliderStyle: function(){
				return {margin: "-4px -5px", height: "8px", width: "10px", backgroundImage: "url('" + kkjs.url.images + "sliderButton.png')", cursor: "n-resize"};
			},
			getColumnStyle: function(){
				return {margin: "0px -3px", height: "0px", width: "6px", backgroundImage: "url('" + kkjs.url.images + "sliderSlide.png')"};
			}
		});
		slider.column.appendChild(kkjs.node.create({
			tag: "div",
			style: {
				position: "absolute",
				bottom: "-1px",
				left: "50%",
				margin: "0 -4px",
				width: "8px",
				height: "4px",
				backgroundImage: "url('" + kkjs.url.images + "sliderSlideBottom.png')"
			}
		}));
		return slider;
	},
	
	_enableDragAndDrop: function enableDragAndDrop(){
		kkjs.ColorSlider.dropInstances.push(this);
		this.colorDrag = kkjs.node.create({
			tag: "div",
			style: {
				position: "fixed",
				width: "20px",
				height: "20px",
				margin: "-10px",
				cursor: "move",
				border: "1px solid black"
			},
			childNodes: [
				//kkjs.layout.create.border()
			],
			colorSlider: this,
			foundStyle: {width: "0px", height: "0px", margin: "0px", opacity: 0},
			notFoundStyle: {width: "2000px", height: "2000px", margin: "-1000px", opacity: 0},
			aimStyle: {},
			onmovestop: function(ev){
				this.aimStyle = this.notFoundStyle;
				var mousePos = kkjs.event.getMousePosition(ev);
				for (var i = 0; i < kkjs.ColorSlider.dropInstances.length; i++){
					var inst = kkjs.ColorSlider.dropInstances[i];
					var pos = kkjs.node.getPosition(inst.container);
					var x = pos.left;
					var y = pos.top;
					var w = inst.container.offsetWidth;
					var h = inst.container.offsetHeight;
					//alert([x, y, w, h]);
					
					if (mousePos.left.isInRange(x, x + w) && mousePos.top.isInRange(y, y + h)){
						if (inst !== this.colorSlider){
							inst.setValue(this.colorSlider.getColor());
						}
						this.aimStyle = this.foundStyle;
						break;
					}
				}
				
				kkjs.css.animate(this, this.aimStyle, {
					onstop: function(){
						this.parentNode.removeChild(this);
						kkjs.css.set(this,{
							width: "20px",
							height: "20px",
							margin: "-10px",
							opacity: 1
						});
					}.bind(this),
					duration: 0.2,
					timeConstant: 5
				});
			}
		});
		kkjs.moveable({node: this.colorDrag, noFixed: false});
		kkjs.event.add(this.container, "mousedown", function(ev){
			if (ev.target === this){
				var slider = this.colorSlider;
				var mousePos = kkjs.event.getMousePosition(ev, false);
				slider.dragTimeout = window.setTimeout(function(){
					kkjs.css.set(slider.colorDrag, {backgroundColor: slider.getColor(), top: mousePos.top + "px", left: mousePos.left + "px"});
					document.body.appendChild(slider.colorDrag);
					kkjs.moveable.startByScript(mousePos, {node: slider.colorDrag, onstop: function(ev){slider.colorDrag.onmovestop(ev);}});
					slider.dragTimeout = false;
				}, 100);
				return ev.preventDefault();
			}
			return null;
		});
		kkjs.event.add(this.container, "selectionstart", function(ev){ev.preventDefault();});
		var _this = this;
		kkjs.event.add(document, "mouseup", function(){
			if (_this.dragTimeout){
				window.clearTimeout(_this.dragTimeout);
			}
		});
	}

})
.implementStatic({
	activeColorSlider: false,
	dropInstances: []
});

})();
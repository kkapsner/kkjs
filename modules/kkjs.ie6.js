(function(){
"use strict"; // ;-)
/**
 * Object kkjs.ie6
 * @name: kkjs.ie6
 * @author: Korbinian Kapsner
 * @description: tries to remove the major disadvantages of ie6
 */

// erzeugt aus allen bei DOMReady vorhandenen Styleregeln mit Pseudoklasse eine entsprechende Wrapperklasse
function createPseudoWrapper(sheet){
	var rules = sheet.rules;
	for (var j = 0; j < rules.length; j++){
		if (/:([a-zA-Z\-]+)(?=\s|.|:|#|$)/.test(rules[j].selectorText)){
			var newSelector = rules[j].selectorText.replace(/(?:\.([a-zA-Z0-9_\-]+))?:([a-zA-Z\-]+)(?=\s|.|:|#|$)/, ".$1ie6$2");
			//alert(rules[j].selectorText + " -> " + newSelector);
			sheet.addRule(newSelector, rules[j].style.cssText, j + 1);
			j++;
		}
	}
}

if (kkjs.is.ie && kkjs.is.version < 7){
	var styleRule = require("./kkjs.styleRule");
	kkjs.ie6 = {
		init: function initElement(components){
			if (components.inited){
				return;
			}
			components.inited = true;
			var element = components.node;
			if (element.nodeType === 1){
				components.setInHandler(true);
				kkjs.ie6.style.positionChangeHandler(components);
				components.restoreInHandler();
			}
			
			var bgI = kkjs.css.get(element, "backgroundImage");
			if (bgI.search(".png") >= 0 && kkjs.css.get(element, "backgroundRepeat") === "no-repeat"){
				var src = bgI.replace(/^.*?url\(['"](.+?)['"]\)/, "$1");
				element.style.backgroundImage = "none";//"url('" + kkjs.url.images + "transparent.gif')";
				kkjs.css._setFilterProperties(element, "DXImageTransform.Microsoft.AlphaImageLoader", {
					src: src,
					sizingMethod: "crop"
				});
				//var pos = kkjs.css.get(element, "backgroundPosition").split(" ");
				
			}
		},
		
		propertyChangeHandler: function propertyChangeHandler(components){
			if (!components.getInHandler()){
				components.setInHandler(true);
				var ev = window.event;
				if (/^style\./i.test(ev.propertyName)){
					ev.styleAttribute = ev.propertyName.replace(/^style\./i, "");
					kkjs.ie6.style.changeHandler(components, ev);
				}
				if (kkjs.ie6[ev.propertyName + "ChangeHandler"]){
					kkjs.ie6[ev.propertyName + "ChangeHandler"](components, ev);
				}
				components.restoreInHandler();
			}
		},
		
		classNameChangeHandler: function classNameChangeHandler(components){
			kkjs.ie6.init(components);
		},
		
		style: {
			changeHandler: function styleChangeHandler(components, ev){
				if (kkjs.ie6.style[ev.styleAttribute + "ChangeHandler"]){
					kkjs.ie6.style[ev.styleAttribute + "ChangeHandler"](components, ev);
				}
			},
			positionChangeHandler: function positionChangeHandler(components, ev){
				var element = components.node;
				var style = element.style;
				if (!style){
					return;
				}
				
				if (style.isFixed){
					kkjs.event.remove(kkjs.window, "scroll", style._positionFixedScrollFunc);
					
					var mem = kkjs.ie6.style.offsetMember;
					for (var i = 0; i < mem.length; i++){
						style[mem[i]] = style.offset[mem[i]].realValue;
						if (components.node.style["_" + mem[i] + "PercentageForFixedResizeFunc"]){
							kkjs.event.remove(window, "resize", components.node.style["_" + mem[i] + "PercentageForFixedResizeFunc"]);
						}
					}
				}
				
				if ((!ev && style.isFixed) || kkjs.css.get(element, "position") === "fixed"){
					style.isFixed = true;
					style.position = "absolute";
					style._positionFixedFunc = function(){
						components.setInHandler(true);
						var mem = ["top", "left"],
							opposite = ["bottom", "right"],
							dim = ["height", "width"],
							parent,
							value,
							winSize = kkjs.DOM.getWindowSize();
						for (var i = 0; i < mem.length; i++){
							parent = element.parentNode["get" + mem[i].firstToUpperCase()]();
							style[mem[i]] = style.offset[mem[i]].realValue;
							
							value = - parent;
							if (style.offset[mem[i]].realValue !== "auto"){
								switch (style.offset[mem[i]].unit){
									case "px":
										value += parseFloat(style.offset[mem[i]].value);
										break;
									case "%":
										value += parseFloat(style.offset[mem[i]].value) / 100 * winSize[dim[i]];
										break;
									default:
										value += element["offset" + mem[i].firstToUpperCase()];
								}
							}
							else {
								if (style.offset[opposite[i]].realValue !== "auto"){
									value += winSize[dim[i]] - element["offset" + dim[i].firstToUpperCase()];
									switch (style.offset[opposite[i]].unit){
										case "px":
											value -= parseFloat(style.offset[opposite[i]].value);
											break;
										case "%":
											value -= parseFloat(style.offset[opposite[i]].value) / 100 * winSize[dim[i]];
											break;
										default:
											value -= element.parentNode["offset" + dim[i].firstToUpperCase()] -
												element["offset" + dim[i].firstToUpperCase()] -
												element["offset" + mem[i].firstToUpperCase()];
									}
								}
								else {
									value += element["offset" + mem[i].firstToUpperCase()] + parent;
								}
							}
							style[mem[i] + "WithoutScroll"] = value;
						}
						style._positionFixedScrollFunc();
						components.restoreInHandler();
					};
					style._positionFixedScrollFunc = function(){
						components.setInHandler(true);
						var scrollPos = kkjs.scroll.getPosition();
						for (var i in scrollPos){
							if (scrollPos.hasOwnProperty(i)){
								style[i] = style[i + "WithoutScroll"] + scrollPos[i] + "px";
							}
						}
						components.restoreInHandler();
					};
					kkjs.ie6.style.offsetChangeAll(components);
					kkjs.event.add(kkjs.window, "scroll", style._positionFixedScrollFunc);
					style._positionFixedFunc();
				}
				else {
					style.isFixed = false;
				}
			},
			
			offsetMember: ["top", "right", "bottom", "left", "width", "height"],
			topChangeHandler: function topChangeHandler(components){kkjs.ie6.style.offsetChange(components, "top");},
			rightChangeHandler: function rightChangeHandler(components){kkjs.ie6.style.offsetChange(components, "right");},
			bottomChangeHandler: function bottomChangeHandler(components){kkjs.ie6.style.offsetChange(components, "bottom");},
			leftChangeHandler: function leftChangeHandler(components){kkjs.ie6.style.offsetChange(components, "left");},
			
			widthChangeHandler: function widthChangeHandler(components){kkjs.ie6.style.offsetChange(components, "width");},
			heightChangeHandler: function heightChangeHandler(components){kkjs.ie6.style.offsetChange(components, "height");},
			
			offsetChangeAll: function offsetChangeAll(components){
				var mem = kkjs.ie6.style.offsetMember;
				for (var i = 0; i < mem.length; i++){
					kkjs.ie6.style.offsetChange(components, mem[i]);
				}
				kkjs.ie6.style.offsetChangeHandler(components);
			},
			offsetChange: function offsetChange(components, dim){
				var realValue = kkjs.css.get(components.node, dim);
				var split = /^(\d+\.?\d*)([a-z%]*)$/i.exec(realValue) || [false, false, false];
				if (!components.node.style.offset){
					components.node.style.offset = {};
				}
				components.node.style.offset[dim] = {
					realValue: realValue,
					value: split[1],
					unit: split[2],
					realOffset: components.node["offset" + dim.firstToUpperCase()]
				};
				if (offsetChange.caller !== kkjs.ie6.style.offsetChangeAll){
					kkjs.ie6.style.offsetChangeHandler(components);
				}
				if (dim === "width" || dim === "height"){
					if (components.node.style["_" + dim + "PercentageForFixedResizeFunc"]){
						kkjs.event.remove(window, "resize", components.node.style["_" + dim + "PercentageForFixedResizeFunc"]);
					}
					if (components.node.style.isFixed && components.node.style.offset[dim].unit === "%"){
						components.node.style["_" + dim + "PercentageForFixedResizeFunc"] = function(){
							components.setInHandler(true);
							components.node.style[dim] = parseFloat(components.node.style.offset[dim].value) / 100 * kkjs.DOM.getWindowSize()[dim];
							components.restoreInHandler();
						};
						components.node.style["_" + dim + "PercentageForFixedResizeFunc"]();
						kkjs.event.add(window, "resize", components.node.style["_" + dim + "PercentageForFixedResizeFunc"]);
					}
				}
			},
			offsetChangeHandler: function offsetChangeHandler(components){
				if (components.node.style.isFixed){
					components.node.style._positionFixedFunc();
				}
			}
		},
		
		addClass: function addClass(components, type){
			var element = components.node, addedClassName = components.addedClassName;
			components.setInHandler(true);
			addedClassName[type] = kkjs.css.className.get(element);
			addedClassName[type].push("");
			for (var i = 0; i < addedClassName[type].length; i++){
				addedClassName[type][i] += "ie6" + type;
				kkjs.css.className.add(element, addedClassName[type][i]);
			}
			kkjs.ie6.init(components);
			components.restoreInHandler();
		},
		removeClass: function removeClass(components, type){
			var addedClassName = components.addedClassName;
			if (addedClassName[type]){
				components.setInHandler(true);
				for (var i = 0; i < addedClassName[type].length; i++){
					kkjs.css.className.remove(components.node, addedClassName[type][i]);
				}
				components.addedClassName[type] = [];
				kkjs.ie6.init(components);
				components.restoreInHandler();
			}
		}
	};
	
	// bindet die .htc an alle Elemente
	styleRule.getBySelector("html *").style.behavior = "url(" + kkjs.url.htc + "ie6to7.htc)";
	styleRule.getBySelector("html").style.behavior = "url(" + kkjs.url.htc + "ie6to7.htc)";
	styleRule.getBySelector("body").style.behavior = "url(" + kkjs.url.htc + "ie6to7.htc)";
	
	kkjs.event.onDOMReady(function(){
		for (var i = 0; i < document.styleSheets.length; i++){
			var sheet = document.styleSheets[i];
			createPseudoWrapper(sheet);
			for (var j = 0; j < sheet.imports.length; j++){
				createPseudoWrapper(sheet.imports[j]);
			}
		}
	});
}

})();
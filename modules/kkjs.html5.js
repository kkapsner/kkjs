(function(){

"use strict";

/**
 * Object html5
 * @author Korbinian kapsner
 * @name html5
 * @version 1.0
 * @description enabled html5 specific featuren in older browsers
 */

var node = require("kkjs.node");
var event = require("kkjs.event");
var css = require("kkjs.css");
var ajax = require("kkjs.ajax");

function enableSub(){
	/*jshint validthis: true*/
	for (var name in this){
		if (this.hasOwnProperty(name)){
			var el = this[name];
			if (!el.nativeSupport && typeof el.enable === "function"){
				el.enable();
			}
		}
	}
}

var html5 = {
	enable: enableSub,
	input: {
		enable: enableSub,
		placeholder: {
			nativeSupport: (function(){
				return "placeholder" in document.createElement("input");
			})(),
			enable: function(){
				if (!this.nativeSupport){
					var inputs = document.getElementsByTagName("input");
					Array.prototype.forEach.call(inputs, function(input){
						if (input.getAttribute("placeholder") !== null){
							var value = input.getAttribute("placeholder");
							input.placeholder = node.create({
								tag: "span",
								innerHTML: value.encodeHTMLEntities(),
								toString: function(){return value;},
								style: css.get(input, ["font", "margin", "padding"]),
								onmousedown: function(){input.focus(); return false;}
							});
							css.set(input.placeholder, {
								border: "none",
								whiteSpace: "nowrap",
								overflow: "hidden",
								color: "lightgray",
								position: "absolute"
							});
							input.parentNode.insertBefore(input.placeholder, input.nextSibling);
							if (!/fixed|absolute|relative/.test(css.get(input.offsetParent, "position"))){
								input.offsetParent.style.position = "relative";
							}
							event.add(input, "focus", this.onfocus);
							event.add(input, "blur", this.onblur);
							event.fire(input, "blur");
							this.inputs.push(input);
						}
					}, this);
				}
			},
			disable: function(){
				Array.prototype.forEach.call(this.inputs, function(input){
					input.placeholder.parentNode.removeChild(this.placeholder);
					event.remove(input, "focus", this.onfocus);
					event.remove(input, "blur", this.onblur);
				});
				this.inputs = [];
			},
			inputs: [],
			onfocus: function(){
				this.placeholder.style.display = "none";
			},
			onblur: function(){
				var pos = node.getPosition(this);
				pos.sub(node.getPosition(this.placeholder.offsetParent));
				css.set(this.placeholder, {
					display: this.value? "none": "block",
					top: (function(){return pos.top + ((this.offsetHeight - this.placeholder.offsetHeight) / 2) + "px";}).bind(this),
					left: (pos.left + (this.offsetWidth - this.clientWidth) / 2) + "px",
					width: this.clientWidth - parseFloat(this.placeholder.style.paddingLeft) - parseFloat(this.placeholder.style.paddingRight) + "px"
				});
			}
		},
		autofocus: { //simplified by j-l-n (https://github.com/j-l-n), 2014/09/29
			nativeSupport: (function(){
				return "autofocus" in document.createElement("input");
			})(),
			enable: function(){
				var allInputElements = document.querySelectorAll("textarea, input");
        			for(var i = 0; i < allInputElements.length; i++){
            				var element = allInputElements[i];
            				var autofocus = element.hasAttribute("autofocus");
            				if(autofocus === true){
              					element.focus();
              					break;
        				}
          			}
			}
		},
		datalist: {
			nativeSupport: (function(){
				var inp = document.createElement("input");
				return !!(("list" in inp) && window.HTMLDataListElement);
			})(),
			enable: function(){
				if (!this.nativeSupport){return;
					[].forEach.call(
						document.getElementsByTagName("input"),
						function(input){
							var list = input.getAttribute("list") || input.list;
							if (list){
								list = document.getElementById(list);
								if (list){
									var options = [].slice.call(list.getElementsByTagName("option"));
									var sel = node.create({
										tag: "select",
										size: Math.min(6, options.length),
										onchange: function(){
											input.value = sel.value;
										},
										style: {position: "fixed", zIndex: 10000, display: "none"},
										parentNode: document.body,
										childNodes: options
									});
									event.add(input, ["change", "keypress", "keyup", "keydown", "paste", "mouseup"], function(){
										var regExp = new RegExp("\\b" + input.value.quoteRegExp(), "i");
										[].forEach.call(sel.options, function(option){
											option.disabled = !(!input.value || option.value.match(regExp));
										});
									});
									event.add([input, sel], "focus", function(){
										var pos = node.getPosition(input);
										css.set(sel, {
											left: pos.left,
											top: pos.top + input.offsetHeight,
											width: input.offsetWidth,
											display: ""
										});
										input.focus();
									});
									event.add([input, sel], "blur", function(ev){
										css.set(sel, {display: "none"});
									});
								}
							}
						}
					);
				}
			},
			disable: function(){}
		},
		
		alert: {
			messages: (function(){
				var messages = JSON.parse(ajax.get(kkjs.url.load + "kkjs.html5.messages.json"));
				var lang = navigator.language || navigator.browserLanguage;
				if (!messages[lang]){
					lang = "en";
				}
				return messages[lang];
			})(),
			alertBox: node.create({
				tag: "div",
				style: {
					border: "1px solid black",
					backgroundColor: "white",
					position: "absolute",
					padding: "4px",
					marginTop: "5px",
					borderRadius: "8px",
					textAlign: "center",
					whiteSpace: "pre-wrap"
				},
				childNodes: [
					"",
					{
						tag: "div",
						style: {
							position: "absolute",
							top: "-6px",
							left: "50%",
							marginLeft: "-6px",
							lineHeight: "0px",
							width: "0px",
							height: "0px",
							borderWidth: "0px 6px",
							borderColor: "transparent",
							borderStyle: "dashed",
							borderBottom: "black solid 6px"
						}
					},
					{
						tag: "div",
						style: {
							position: "absolute",
							top: "-5px",
							left: "50%",
							marginLeft: "-5px",
							lineHeight: "0px",
							width: "0px",
							height: "0px",
							borderWidth: "0px 5px",
							borderColor: "transparent",
							borderStyle: "dashed",
							borderBottom: "white solid 5px"
						}
					}
				]
			}),
			show: function(input, text, color){
				if (color){
					this.alertBox.style.backgroundColor = this.alertBox.lastChild.style.borderBottomColor = color;
				}
				this.alertBox.firstChild.data = text;
				css.set(this.alertBox, {
					top: input.offsetTop + input.offsetHeight + "px",
					left: input.offsetLeft - 4 + "px",
					width: input.offsetWidth - 2 + "px"
				});
				input.offsetParent.appendChild(this.alertBox);
				event.add(input, "blur", this.hide);
			},
			hide: function hideFn(ev){
				if (ev){
					event.remove(this, ev.type, hideFn);
				}
				node.remove(html5.input.alert.alertBox);
			},
			error: function(input, message, additionalInfo){
				if (this.messages.error[message]){
					message = this.messages.error[message];
				}
				this.show(input, message + (additionalInfo || ""), "#FF5555");
			}
		}
	},
	form: {
		enable: enableSub,
		validation: {
			nativeSupport: (function(){
				return ("required" in document.createElement("input")) && ("pattern" in document.createElement("input"));
			})(),
			enable: function(){
				if (!this.nativeSupport){
					Array.prototype.forEach.call(document.getElementsByTagName("form"), function(form){
						event.add(form, "submit", this.onsubmit);
					}, this);
				}
			},
			onsubmit: function(ev){
				if (Array.prototype.forEach.call(this.elements, function(element){
					return html5.form.validation.checkValidity.call(element);
				})){
					ev.preventDefault();
				}
			},
			checkValidity: function(){
				if (this.name){
					if (this.getAttribute("required") !== null && this.value === ""){
						html5.input.alert.error(this, "required");
						this.focus();
						return false;
					}
					if (this.value){
						if (this.getAttribute("pattern") !== null){
							var pattern = new RegExp("^(?:" + this.getAttribute("pattern") + ")$", "");
							if (!pattern.test(this.value)){
								html5.input.alert.error(this, "pattern", this.title);
								this.focus();
								return false;
							}
						}
						if (this.getAttribute("type") !== null){
							switch (this.getAttribute("type").toLowerCase()){
								case "url":
									if (!this.value.isURL()){
										html5.input.alert.error(this, "noValidURL");
										this.focus();
										return false;
									}
									break;
								case "email":
									if (!this.value.isEMailAddress()){
										html5.input.alert.error(this, "noEMailAddress");
										this.focus();
										return false;
									}
									break;
								case "date":
									var d = new Date(this.value);
									if (/^\d{4,}-\d{1,2}-\d{1,2}$/.test(this.value) || isNaN(d.getTime())){
										html5.input.alert.error(this, "noValidDate");
										this.focus();
										return false;
									}
									break;
							}
						}
					}
				}
				return true;
			}
		}
	}
};

event.onDOMReady(function(){
	html5.enable();
});


if (typeof exports !== "undefined"){
	for (var i in html5){
		if (html5.hasOwnProperty(i)){
			exports[i] = html5[i];
		}
	}
}
if (typeof kkjs !== "undefined"){
	kkjs.html5 = html5;
}

})();

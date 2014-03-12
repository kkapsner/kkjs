kkjs.load.module("styleRule");

kkjs.event.onDOMReady(function(){
	"use strict";
	// load CSS
	var css = kkjs.ajax.get(kkjs.url.css + "inputHint.css").split("}");
	for (var i = 0; i < css.length - 1; i++){
		kkjs.styleRule.create(css[i] + "}");
	}
	
	// html5 feature: placeholder
	/*
	Array.prototype.forEach.call(kkjs.$("<input>"), function(input){
		if (input.hasAttribute("placeholder") && !kkjs.is.key(input, "placeholder")){
			var wrapper = kkjs.node.create({
				tag: "a",
				className: "inputWrapper",
				childNodes: [
					{
						tag: "span",
						className: "hint",
						innerHTML: input.getAttribute("placeholder").encodeHTMLEntities()
					}
				]
			});
			input.parentNode.replaceChild(wrapper, input);
			wrapper.insertBefore(input, wrapper.firstChild);
		}
	});*/
	
	Array.prototype.forEach.call(kkjs.$(".inputWrapper"), function(wrapper){
		var hint = kkjs.$(".hint", wrapper);
		var input = wrapper.getElementsByTagName("input");
		if (hint.length && input.length){
			hint = hint[0];
			input = input[0];
			kkjs.css.set(hint, {
				display: "block",
				top: function(){return (wrapper.offsetHeight - hint.offsetHeight) / 2 + "px";},
				width: function(){return (input.clientWidth - hint.offsetLeft*2) + "px";}
			});
			kkjs.event.add(hint, "click", function(){
				input.focus();
			});
			kkjs.event.add(input, "focus", function(){
				hint.style.display = "none";
			});
			kkjs.event.add(input, "blur", function(){
				hint.style.display = this.value? "none": "block";
			});
			kkjs.event.fire(input, "blur");
		}
	});
});
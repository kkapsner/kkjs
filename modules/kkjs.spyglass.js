(function(){

"use strict";

/**
 * Object spyglass
 * @name: spyglass
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: spyglass description
 */

var spyglass = {
	enable: function(img, attr){
		var wrapper = kkjs.node.create({
			tag: "span",
			nextSibling: img,
			className: "kkjs_spyglassWrapper"
		 });
		wrapper.appendChild(img);
		var spy = kkjs.node.create({
			tag: "span",
			className: "spyglass",
			parentNode: wrapper,
			style: {
				backgroundImage: "url(\"" + img.src + "\")",
				width: attr.size,
				height: attr.size,
				margin: attr.size / -2
			}
		});
		kkjs.event.add(wrapper, ["mousemove", "mouseenter"], function(ev){
			var size = new kkjs.Math.Dimension(spy.offsetWidth, spy.offsetHeight);
			kkjs.css.set(spy, "display", "none");
			var pos = kkjs.event.getMousePosition(ev).sub(kkjs.node.getPosition(wrapper));
			var faktor = img.naturalWidth / img.width;
			kkjs.css.set(spy, pos);
			kkjs.css.set(spy, "backgroundPosition",
				kkjs.sprintf("%dpx %dpx", size.width / 2 - pos.left * faktor, size.height / 2 - pos.top * faktor)
			);
			kkjs.css.set(spy, "display", "");
		});
		return {
			wrapper: wrapper,
			spy: spy
		};
	}.setDefaultParameter(null, new Function.DefaultParameter(
		{
			size: 200
		},
		{
			checkType: true,
			deepObjectInspection: true,
			returnClone: true
		}
	))
};

if (typeof exports !== "undefined"){
	for (var i in spyglass){
		if (spyglass.hasOwnProperty(i)){
			exports[i] = spyglass[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.spyglass = spyglass;
}

})();
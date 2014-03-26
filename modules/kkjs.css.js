(function(){
"use strict";

/**
 * Object css
 * @author Korbinian kapsner
 * @name css
 * @version 1.0
 * @description Stellt Funktionen zur Verfügung, die mit CSS-Manipulation, -Ansprache und -Ansicht zu tun haben
 */

var is = require("kkjs.is");
var color = require("kkjs.color");
var kkjsnode = require("kkjs.node");
var DOM = require("kkjs.DOM");

function uniqueArray(arr){
	var i, _i, j, l = arr.length, v;
	for (i = l; i--;){
		v = arr[i];
		_i = i;
		for (j = i; j--;){
			if (v === arr[j]){
				arr.splice(_i, 1);
				_i = j;
				i--;
			}
		}
	}
	return arr;
}

var directions = ["Top", "Right", "Bottom", "Left"];
var browserPre = ["Moz", "O", "Webkit", "Ms"];

var css = {
	/**
	 * Function css.$
	 * @name: css.$
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 17.02.2010
	 * @description:
	 * @parameter:
	 *	id:
	 *	att:
	 * @used parts of kkjs:
	 *	kkjsnode
	 * @attention: this function may cause problems in IE < 8 if it is used in onDOMReady
	 */
	
	$: (function(){
		var attributeRe = /\[([^\[\]]+)\]/g,
			classRe = /\.([^\.\[#]+)/g,
			tagRe = /^([^\[\.#]*)/,
			idRe = /#([^\.\[#]+)/g;
		function getById(id, att){
			var node = att.node;
			var ret = [];
			
			var attribute = [];
			var el = "";
			while ((el = attributeRe.exec(id)) !== null){
				el = el[1].split("=");
				var attName = el[0];
				var value = (el.length > 1)? el.slice(1).join("="): ".+";
				if (/\|$/.test(attName)){
					value = new RegExp("^" + value + "(-|$)");
				}
				else if(/~$/.test(attName)){
					value = new RegExp("(^|\\s)" + value + "($|\\s)");
				}
				else if(/\^$/.test(attName)){
					value = new RegExp("^" + value);
				}
				else{
					value = new RegExp("^" + value + "$");
				}
				attribute.push({attName: attName.replace(/(\||~|\^|\*|\$)$/, ""), valueRe: value});
			}
			var pureId = id.replace(attributeRe, "[");
			
			var tag = tagRe.exec(id)[1].toLowerCase() || "*";
			
			var className = [];
			while ((el = classRe.exec(pureId)) !== null){
				className.push(el[1]);
			}
			className = className.join(" ");
			
			while((el = idRe.exec(pureId)) !== null){
				attribute.push({attName: "id", valueRe: new RegExp("^" + el[1] + "$")});
			}
			
			for (var i = 0; i < node.length; i++){
				var byClassName = true,
					match = false;
				if (att.directChild){
					var k = node[i].childNodes;
					match = [];
					for (var ck = 0; ck < k.length; ck++){
						if (k[ck].nodeType !== 3 && (tag === "*" || k[ck].nodeName.toLowerCase() === tag) && css.className.has(k[ck], className)){
							match.push(k[ck]);
						}
					}
				}
				else if (att.next){
					var next = kkjsnode.next.element(node[i]);
					match = (next && (tag === "*" || next.nodeName.toLowerCase() === tag) && css.className.has(next, className))? [next]: [];
				}
				else if (att.previous){
					var prev = kkjsnode.previous.element(node[i]);
					match = (prev && (tag === "*" || prev.nodeName.toLowerCase() === tag) && css.className.has(prev, className))? [prev]: [];
				}
				
				if (!match){
					var elementList;
					if (tag === "*" && className){
						elementList = node[i].getElementsByClassName(className);
					}
					else {
						elementList = node[i].getElementsByTagName(tag);
						byClassName = false;
					}
					match = [];
					Array.prototype.forEach.call(elementList, function(v, i){match[i] = v;});
				}
				
				for (var m = 0; m < match.length; m++){
					var mismatch = false;
					for (var j = 0; j < attribute.length; j++){
						if (!attribute[j].valueRe.test(match[m][attribute[j].attName] || match[m].getAttribute(attribute[j].attName))){
							mismatch = true;
							break;
						}
					}
					if (mismatch || (!byClassName && !css.className.has(match[m], className))){
						match.splice(m, 1);
						m--;
					}
				}
				
				ret = ret.concat(match);
			}
			return uniqueArray(ret);
		}
		
		function singleStrand(reihe, att){
			var node = att.node;
			var parAtt = {node: node};
			var startI = 0;
			switch (reihe[0]){
				case "+":
				case "-":
				case ">":
					parAtt[{"+": "next", "-": "previous", ">": "directChild"}[reihe[startI++]]] = true;
			}
			var par = getById(reihe[startI++], parAtt);
			if (par.length > 0){
				if (reihe.length > startI){
					return singleStrand(reihe.slice(startI), {node: par});
				}
				else{
					return par;
				}
			}
			return [];
		}
		
		function css$(id, att){
			id = id.replace(/^\s+|\s+$/, "").replace(/\s+/, " ");
			att = att || {};
			var node = att.node || document;
			var ret = [];
			if (!Array.isArray(node)){
				node = [node];
			}
			
			if (/,/.test(id)){
				var ids = id.split(/\s*,\s*/);
				for (var i = 0; i < ids.length; i++){
					ret = ret.concat(singleStrand(ids[i].split(" "), {node: node}));
				}
			}
			else {
				ret = singleStrand(id.split(" "), {node: node});
			}
			
			return uniqueArray(ret);
		}
		
		return css$;
	})(),

	/**
	 * Object css.className
	 * @author Korbinian Kapsner
	 * @name css.className
	 * @version 1.0
	 * @description Sammlung von Funktionen zum Manipulieren von Klassen
	 */
	
	className: {
		 /**
		  * Function css.class.add
		  * @name: css.class.add
		  * @version: 0.9
		  * @author: Korbinian Kapsner
		  * @last modify: 02.08.2009
		  * @description: Fügt der Node node die Klasse className hinzu
		  * @parameter:
		  *		node:
		  *		className:
		  */
		
		add: function addClass(node, className){
			className = className.trim().split(/\s+/);
			var classes = css.className.get(node);
			var i = className.length;
			var classesLength = classes.length;
			first: while (i--){
				var cl = className.pop();
				var j = classesLength;
				while (j--){
					if (classes[j] === cl){
						continue first;
					}
				}
				classes.push(cl);
				++classesLength;
			}
			node.className = classes.join(" ");
			return node;
		}.makeArrayCallable([0, 1], {arrayLike: true}),
		
		/**
		 * Function css.class.get
		 * @name: css.class.get
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 02.08.2009
		 * @description: Liefert alle CSS-Klassen der Node node zurück
		 * @parameter:
		 *		node:
		 *		array (= true): Art der Rückgabe.
		 *			true: Funktion liefert immer einen Array (ev. auch einen Leeren);
		 *			false: wenn keine Klasse vorhanden ist, wird ein leerer String zurückgegeben;
		 *				wenn nur eine Klasse vorhanden ist diese als String
		 *				sonst Array
		 */

		get: function getClasses(node, array){
			var ret;
			if (typeof node.className !== "string"){
				ret = [];
			}
			else {
				var c = node.className.trim();
				if (!c){
					ret = [];
				}
				else{
					ret = c.split(/\s+/);
				}
			}
			if(array === false){
				switch (ret.length){
					case 0: return "";
					case 1: return ret[0];
					default: return ret;
				}
			}
			return ret;
		},
		
		/**
		 * Function css.class.remove
		 * @name: css.class.remove
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 02.08.2009
		 * @description: Entfert von der Node node die CSS-Klasse className
		 * @parameter:
		 *		node:
		 *		className:
		 */

		remove: function removeClass(node, className){
			className = className.trim().split(/\s+/);
			var classNameLength = className.length;
			var c = css.className.get(node);
			var i = c.length;
			while (i--){
				var cl = c[i];
				var j = classNameLength;
				while (j--){
					if (cl === className[j]){
						c.splice(i, 1);
						break;
					}
				}
			}
			node.className = c.join(" ");
			return node;
		}.makeArrayCallable([0, 1], {arrayLike: true}),
		
		/**
		 * Function css.class.has
		 * @name: css.class.has
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 02.08.2009
		 * @description: Überprüft, ob die Node node die CSS-Klasse className hat
		 * @parameter:
		 *		node:
		 *		className:
		 */

		has: function hasClass(node, className){
			if (typeof node.className !== "string"){
				return false;
			}
			if (className === ""){
				return true;
			}
			className = className.trim().split(" ");
			var c = node.className;
			for (var i = className.length - 1; i >= 0; i--){
				if (!((new RegExp("(?:^|\\s)" + className[i] + "(?:\\s|$)")).test(c))){
					return false;
				}
			}
			return true;
		},
		
		/**
		 * Function css.className.toggle
		 * @name: css.classname.toggle
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: toggles a given className
		 */
		
		toggle: function toggleClass(node, className, otherClassName){
			if (css.className.has(node, className)){
				css.className.remove(node, className);
				if (otherClassName){
					css.className.add(node, otherClassName);
				}
				return false;
			}
			else {
				css.className.add(node, className);
				if (otherClassName){
					css.className.remove(node, otherClassName);
				}
				return true;
			}
		}.makeArrayCallable([0], {arrayLike: true})
	},
	
	/**
	 * Function css.set
	 * @name: css.set
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 02.08.2009
	 * @description: gibt der Node node die Style-attribute, die in dem Object styles definiert sind (z.B. {backgroundColor. "block"})
	 * @parameter:
	 *	node:
	 *	styles:
	 */
	
	set: function setStyle(node, styles, value){
		if (typeof styles === "string"){
			css.setSingle(node, styles, value);
		}
		else {
			for (var i in styles){
				if (styles.hasOwnProperty(i)){
					css.setSingle(node, i, styles[i]);
				}
			}
		}
		return node;
	}.makeArrayCallable([0], {arrayLike: true}),
	setSingle: function setSingelStyle(node, name, value){
		try{
			if (typeof value === "function"){
				value = value.call(node, name);
			}
		}
		catch(e){
			return;
		}
		name = name.replace(/-([a-z])/g, function(match, hit){ return hit.toUpperCase();});
		
		if (typeof value === "number" && ["top", "right", "bottom", "left", "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight"].indexOf(name) !== -1){
			var valueStr = value.toString(10);
			if (/e/i.test(valueStr)){
				if (Math.abs(value) < 1){
					valueStr = value.toFixed(20);
				}
				else {
					var sign = value < 0? "-": "";
					valueStr = "";
					value = Math.abs(value);
					while (value > 0){
						var diggit = Math.round(value % 10);
						value = Math.floor(value / 10);
						valueStr = diggit + valueStr;
					}
					valueStr = sign + valueStr;
				}
			}
			value = valueStr + "px";
		}
		
		if (name in node.style){
			try {
				node.style[name] = value;
			}
			catch(e){
				if (!/^(parentRule|length)$/.test(name)){
					throw e;
				}
			}
		}
		else if (!css.set.hasOwnProperty(name) || !css.set[name](node, value)){
			if (!css.set.regExp.some(function(re){
				var match = re.regExp.exec(name);
				if (match){
					return re.set(node, match, value);
				}
				return false;
			})){
				if (!browserPre.some(function(pre){
					var newName = pre + name.firstToUpperCase();
					if (newName in node.style){
						node.style[newName] = value;
						return true;
					}
					return false;
				})){
					// maybe we lost anything before...
					node.style[name] = value;
				}
			}
		}
	},
	
	/**
	 * Function css.get
	 * @name: css.get
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 02.08.2009
	 * @description:
	 * @parameter:
	 *	node: Node, deren CSS-Style gelesen werden soll
	 *	style: wenn nichts angegeben: alle CSS-Attribute werden als Object zurückgeliefert; ein String: der Wert dieses Attributs wird zurückgeliefert; ein Array: die einzelnen Einträge werden als Objekt zurückgeliefert
	 *	pseudo:
	 */
	
	get: function getStyle(node, name, pseudo){
		if (Array.isArray(name)){
			var ret = {};
			for (var i = 0; i < name.length; i++){
				ret[name[i]] = css.get(node, name[i], pseudo);
			}
			return ret;
		}
		
		if (!pseudo){
			pseudo = "";
		}
		var win = DOM.getWindow(node);
		var style;
		var realCalc = false;
		if (win.getComputedStyle){
			style = win.getComputedStyle(node, pseudo);
			// no correct style properties in opera/safari/chrome if the node is not in den DOM-tree
			if (!win.document.getElementsByTagName("html")[0].contains(node) && !is.ff){
				style = node.style;
			}
			else {
				realCalc = true;
			}
		}
		else if (node.currentStyle){
			// same in IE
			if (win.document.body && win.document.body.contains(node)){
				style = node.currentStyle;
				realCalc = true;
			}
			else {
				style = node.style;
			}
		}
		else {
			return null;
		}
		
		if (!name){
			return style;
		}
		
		name = name.replace(/-([a-z])/g, function(match, hit){ return hit.toUpperCase();});
		
		var value;
		if (name in style){
			value = style[name];
			if (color.rgbStringRE.test(value)){
				return color.rgbStringToHex(value);
			}
			if (typeof value !== "undefined" && value !== null && value.toString() !== ""){
				return value;
			}
		}
		
		if (name in css.get.combined){
			var temp = css.get.combined[name];
			if (name){
				temp = temp.replace(/\+/g, name);
			}
			return temp.replace(/\{([^\{\}]*)\}/g, function(m, name){
				return css.get(node, name, pseudo);
			});
		}
		if (css.get.hasOwnProperty(name)){
			value = css.get[name](node, style, pseudo);
			if (value !== false){
				return value;
			}
		}
		for (var i = css.get.regExp.length - 1; i >= 0; i--){
			var match = css.get.regExp[i].regExp.exec(name);
			if (match){
				value = css.get.regExp[i].get(node, style, pseudo, match);
				if (value !== false || css.get.regExp[i].canBeFalse){
					return value;
				}
			}
		}
		for (var i = browserPre.length - 1; i >= 0; i--){
			var newName = browserPre + name.firstToUpperCase();
			if (newName in style){
				return node.style[newName];
			}
		}
		
		//return false;
		if ((name in style) && !realCalc){
			return style[name];
		}
		return null;
	},
	
	/**
	 * Function css.animate
	 * @name: css.animate
	 * @version: 1.0
	 * @author: Korbinian kapsner
	 * @last modify: 13.10.2009
	 * @description: animiert eine CSS-Attributänderung
	 * @parameter:
	 *	node: die zu animierende Node
	 *	style: ein Objekt, dass angibt, wohin anmiert werden soll (z.B. {color: "#FFFFFF"})
	 *	att: Attributobjekt:
	 */
	
	animate: function animateStyle(node, style, att){
		var startTime, interval;
		
		var styleName = [];
		for (var i in style){
			if (style.hasOwnProperty(i)){
				styleName.push(i);
			}
		}
		var oldStyle = css.get(node, styleName);
		for (var i in oldStyle){
			if (/^\d+\.?\d*$/.test(oldStyle[i])){
				oldStyle[i] = parseFloat(oldStyle[i]);
			}
		}
		
		if (node["kkjs:CSSAnimateStop"] && att.stopOld){
			styleName.forEach(function(name){
				if (node["kkjs:CSSAnimateStop"][name]){
					node["kkjs:CSSAnimateStop"][name].forEach(function(func){func(name);});
					delete node["kkjs:CSSAnimateStop"][name];
				}
			});
		}
		
		function calculateValue(start, end, pos){
			if (typeof end === "function"){
				end = end.call(node);
			}
			if ((typeof start === "number") && (typeof end === "number")){
				return start + (end - start) * att.tween(pos);
			}
			if ((start.indexOf(" ") !== -1) && start.replace(/[^ ]/g, "").length === end.replace(/[^ ]/g, "").length){
				start = start.split(" ");
				end = end.split(" ");
				var ret = [];
				for (var i = 0; i < start.length; i++){
					ret.push(calculateValue(start[i], end[i], pos));
				}
				return ret.join(" ");
			}
			if (start.charAt(0) === "#" && end.charAt(0) === "#"){
				return color.mix(start, end, pos, att.rgb? "rgb": "hsl");
			}
			var units = ["px", "pt", "%", "em"];
			for (var i = 0; i < units.length; i++){
				var re = (new RegExp(units[i] + "$"));
				if (re.test(start) && ((typeof end === "number") || re.test(end))){
					return calculateValue(parseFloat(start), parseFloat(end), pos) + units[i];
				}
			}
			return end;
		}
		
		function stop(name){
			if (interval){
				if (!name){
					styleName = [];
				}
				else {
					for (var i = styleName.length - 1; i + 1; i--){
						if (styleName[i] === name){
							styleName.splice(i, 1);
							break;
						}
					}
				}
				if (!styleName.length){
					window.clearInterval(interval);
					interval = false;
					att.onstop();
				}
			}
		}
		
		
		function run(){
			var pos = (new Date() - startTime) / 1000 / att.duration;
			att.onbeforerun(pos);
			if (pos < 1){
				var currentStyle = {};
				for (var i = 0; i < styleName.length; i++){
					currentStyle[styleName[i]] = calculateValue(oldStyle[styleName[i]], style[styleName[i]], pos);
				}
				css.set(node, currentStyle);
				att.onrun(pos);
			}
			else {
				css.set(node, style);
				att.onrun(pos);
				att.onfinish(node);
				stop();
			}
		}
		
		if (att.stopOnNew){
			if (!node["kkjs:CSSAnimateStop"]){
				node["kkjs:CSSAnimateStop"] = {};
			}
			styleName.forEach(function(name){
				if (!node["kkjs:CSSAnimateStop"][name]){
					node["kkjs:CSSAnimateStop"][name] = [];
				}
				node["kkjs:CSSAnimateStop"][name].push(stop);
			});
		}
		
		startTime = new Date();
		interval = window.setInterval(run, att.timeConstant);
	}.setDefaultParameter(null, null, new Function.DefaultParameter(
		{
			duration: 1,
			rgb: true,
			timeConstant: 20,
			tween: function(x){return x;},
			stopOnNew: true,
			stopOld: true,
			onbeforerun: function(){},
			onrun: function(){},
			onfinish: function(){},
			onstop: function(){}
		},
		{
			checkType: true,
			deepObjectInspection: true,
			returnClone: true
		}
	)),
	
	//interieur functions
	
	_giveLayout: function IEgiveLayout(node){
		//Das hier hat eigentlich nichts mit CSS zu tun, aber der IE will den Filter nicht anwenden, wenn das Objekt keine "Layout" hat  - die eigenschaft zoom gibt ihm solches
		if (
			(node.currentStyle && !node.currentStyle.hasLayout) &&
			typeof node.style.zoom !== "undefined"
		){
			if (is.version < 8){
				node.style.zoom = "100%";
			}
			else {
				var display = css.get(node, "display");
				if (display === "inline"){
					node.style.display = "inline-block"; // im IE8 brauchen die inline-Elemente doch irgendwie Layout.
				}
				// if (/^ruby/.test(display)){} // diese beiden funktionieren auch nicht, aber ich hab' noch nichts Passendes gefunden
				// if (/^table-/.test(display) && display !== "table-cell"){}
			}
		}
		else if (!node.currentStyle && typeof(node.style.zoom) !== "undefined"){
			node.style.zoom = "100%";
		}
	},
	_setFilterProperties: function IESetFilterProperties(node, filterName, prop){
		//Das hier hat eigentlich nichts mit CSS zu tun, aber der IE will den Filter nicht anwenden, wenn das Objekt keine "Layout" hat  - die eigenschaft zoom gibt ihm solches
		css._giveLayout(node);
		
		// bei Nodes, die sich nicht im DOM-Baum befinden kann das einen Fehler werfen...
		try{
			if (node.filters && node.filters[filterName]){
				var filter = node.filters[filterName];
				for (var i in prop){
					if (prop.hasOwnProperty(i)){
						filter[i] = prop[i];
					}
				}
			}
			else{
				var propStr = [];
				for (var i in prop){
					if (prop.hasOwnProperty(i)){
						if (prop[i].match && prop[i].match(/\s/)){
							prop[i] = "\"" + prop[i] + "\"";
						}
						propStr.push(i + "=" + prop[i]);
					}
				}
				propStr = propStr.join(", ");
				node.style.filter += " progid:" + filterName + "(" + propStr + ")";
			}
		}
		catch(e){
			var propStr = [];
			for (var i in prop){
				if (prop.hasOwnProperty(i)){
					if (prop[i].match && prop[i].match(/\s/)){
						prop[i] = "\"" + prop[i] + "\"";
					}
					propStr.push(i + "=" + prop[i]);
				}
			}
			propStr = propStr.join(", ");
			
			var filterStr = node.style.filter;
			var pos = filterStr.indexOf("progid:" + filterName);
			if (pos >= 0){
				var filterProp = /^progid:[\w\.]+\((.+?)\)\s*(?:progid|$)/.exec(filterStr.substring(pos));
				filterStr = filterStr.substring(0, pos) + filterStr.substring(pos + filterProp[0].length);
				propStr += ", " + filterProp[1];
			}
			node.style.filter = filterStr + " progid:" + filterName + "(" + propStr + ")";
		}
	}
};

css.set["float"] = function(node, value){
	if ("cssFloat" in node.style){
		node.style.cssFloat = value;
	}
	else if ("layoutFloat" in node.style){
		node.style.layoutFloat = value;
	}
	else {
		return false;
	}
	return true;
};
css.set.opacity = function(node, value){
	if ("filter" in node.style){
		css._setFilterProperties(node, "DXImageTransform.Microsoft.BasicImage", {Opacity: value});
		return true;
	}
	return false;
};
css.set.rotation = function(node, value){
	function applyToTransform(name){
		var oldValue = node.style[name]; //css.get(node, prae[n] + "Transform");
		oldValue = (typeof oldValue === "string")? oldValue: "";
		node.style[name] = oldValue.replace(/\s*rotate\(\d+(?:\.\d*)?deg\)/, "") + " rotate(" + value + ")";
	}
	if ("transform" in node.style){
		applyToTransform("transform");
	}
	if (!browserPre.some(function(pre){
		var name = pre + "Transform";
		if (name in node.style){
			applyToTransform(name);
			return true;
		}
		return false;
	})){
		if ("filter" in node.style){
			var deg = parseInt(value.replace(/deg$/i, ""), 10);
			var rad = deg/180*Math.PI;
			var costheta = Math.cos(rad);
			var sintheta = Math.sin(rad);
			css._setFilterProperties(node, "DXImageTransform.Microsoft.Matrix", {
				SizingMethod: "auto expand",
				Dx: 0.5,
				Dy: 0.5,
				M11: costheta,
				M12: -sintheta,
				M21: sintheta,
				M22: costheta
			});
			return true;
		}
		else {
			return false;
		}
	}
	else {
		return true;
	}
};
css.set.regExp = [
	{regExp: /^backgroundPosition([XY])$/, set: function(node, match, value){
		var bP = (css.get(node, "backgroundPosition") || "0 0").split(/\s+/);
		if (bP.length === 1){
			bP[1] = bP[0];
		}
		bP[match[1] === "X"? 0: 1] = value;
		css.setSingle(node, "backgroundPosition", bP.join(" "));
		return true;
	}},
	{regExp: /^border((?:Top|Bottom)(?:Right|Left))?Radius$/, set: function(node, match, value){
		var name = "MozBorderRadius" + match[1].firstToUpperCase();
		if (name in node.style){
			node.style[name] = value;
			return true;
		}
		return false;
	}}
];

// css.get
css.get["float"] = function(node, style, pseudo){
	if ("cssFloat" in style){
		return style.cssFloat;
	}
	else if ("layoutFloat" in style){
		return style.layoutFloat;
	}
	else {
		return false;
	}
};
css.get.opacity = function(node, style, pseudo){
	if ("filter" in style){
		var value = 1;
		if ("filters" in node){
			for (var i in node.filters){
				if (node.filters.hasOwnProperty(i)){
					if (/BasicImage$/.test(i)){
						value *= node.filters[i].opacity;
					}
					if (/Alpha$/.test(i)){
						value *= node.filters[i].opacity / 100;
					}
				}
			}
		}
		return value;
	}
	return false;
};
css.get.rotation = function(node, style, pseudo){
	var angle = 0;
	if (!browserPre.some(function(pre){
		var name = pre + "Transform";
		if (name in node.style){
			var oldValue = node.style[name]; //css.get(node, prae[n] + "Transform");
			oldValue = (typeof oldValue === "string")? oldValue: "";
			oldValue.replace(/\s*rotate\(\d+(?:\.\d*)?deg\)/, function(m, d){
				
			});
			return true;
		}
		return false;
	})){
		if ("filter" in node.style){
			throw new Error("Not yet implemented");
			var deg = parseInt(value.replace(/deg$/i, ""), 10);
			var rad = deg/180*Math.PI;
			var costheta = Math.cos(rad);
			var sintheta = Math.sin(rad);
			css._setFilterProperties(node, "DXImageTransform.Microsoft.Matrix", {
				SizingMethod: "auto expand",
				Dx: 0.5,
				Dy: 0.5,
				M11: costheta,
				M12: -sintheta,
				M21: sintheta,
				M22: costheta
			});
			return true;
		}
		else {
			return false;
		}
	}
	else {
		return true;
	}
};
css.get.border = function(node, style, pseudo){
	var wert = [];
	for (var i = 0; i < directions.length; i++){
		wert[i] = css.get(node, "border" + directions[i], pseudo);
		if (wert[i] !== wert[0]){
			return "";
		}
	}
	return wert[0];
};

function checkDirections(pre, post, node, style, pseudo){
	var value = directions.map(function(value){
		var ret = style[pre + value + post];
		if (post === "Color" && color.rgbStringRE.test(ret)){
			ret = color.rgbStringToHex(ret);
		}
		return ret;
	});
	if (value[1] === value[3]){
		if (value[0] === value[2]){
			if (value[0] === value[1]){
				return value[0];
			}
			else {
				return value[0] + " " + value[1];
			}
		}
		else {
			return value[0] + " " + value[1] + " " + value[2];
		}
	}
	
	return value.join(" ");
}

css.get.margin = function(node, style, pseudo){
	return checkDirections("margin", "", node, style, pseudo);
};
css.get.padding = function(node, style, pseudo){
	return checkDirections("padding", "", node, style, pseudo);
};
css.get.regExp = [
	{regExp: /^backgroundPosition([XY])$/, get: function(node, style, pseudo, match){
		var bP = (css.get(node, "backgroundPosition") || "0 0").split(/\s+/);
		if (bP.length === 1){
			bP[1] = bP[0];
		}
		return bP[match[1] === "X"? 0: 1];
	}},
	{regExp: /^border((?:Top|Bottom)(?:Right|Left))?Radius$/, get: function(node, style, pseudo, match){
		var name = "MozBorderRadius" + match[1].firstToUpperCase();
		if (name in style){
			return style[name];
		}
		return false;
	}},
	{regExp: /^textDecoration([A-Z].+)$/, get: function(node, style, pseudo, match){
		var name = match[1].replace(/^[A-Z]/, function(match){return match.toLowerCase();}).replace(/[A-Z]/g, function(match){return "-" + match.toLowerCase();});
		return (style.textDecoration.split(/\s+/).indexOf(name) !== -1);
	}, canBeFalse: true},
	{regExp: /^border(Style|Width|Color)$/, get: function(node, style, pseudo, match){
		return checkDirections("border", match[1], node, style, pseudo);
	}}
];
css.get.combined = {
	borderTop: "{+Width} {+Style} {+Color}",
	borderRight: "{+Width} {+Style} {+Color}",
	borderBottom: "{+Width} {+Style} {+Color}",
	borderLeft: "{+Width} {+Style} {+Color}",
	outline: "{+Width} {+Style} {+Color}",
	listStyle: "{+Type} {+Position} {+Image}",
	wordWrap: "normal", // not combined, but a default if it cannot be read
	background: "{+Color} {+Image} {+Repeat} {+Attachment} {+Position}",
	backgroundPosition: "{+X} {+Y}",
	font: "{+Style} {+Variant} {+Weight} {+Size}/{lineHeight} {+Family}",
	clip: "rect({+Top} {+Right} {+Bottom} {+Left})"
};


if (typeof exports !== "undefined"){
	for (var i in css){
		if (css.hasOwnProperty(i)){
			exports[i] = css[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.css = css;
}

})();
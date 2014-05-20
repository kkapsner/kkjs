(function(){

"use strict";

/**
 * Object styleRule
 * @name: styleRule
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: provides some CSS-rule functionality
 */

var DOM = require("./kkjs.DOM");
var kkjsnode = require("./kkjs.node");

var styleRule = {
	create: function createCSSRule(rule, index, doc){
		/**
		 * Function styleRule.create
		 * @name: styleRule.create
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: fuegt eine CSS-Regel in das Dokument ein
		 * @parameter:
		 *	rule:
		 *	index:
		 *
		 */
		
		var match = /^([^{}]+?)\s*\{([^{}]*)\}/.exec(rule), bezeichner, regel;
		if (match){
			bezeichner = match[1];
			regel = match[2];
		}
		else {
			throw new Error("Invalid CSS rule syntax.");
		}
		
		if (bezeichner.indexOf(",") !== -1){
			return bezeichner.split(",").map(function(name){
				return styleRule.create(name + "{" + regel + "}", index, doc);
			});
		}
		
		var style = styleRule._getWriteableStyleSheet(doc);
		
		if (isNaN(index)){
			index = styleRule._getRules(style).length;
		}
		
		if (style.addRule){
			style.addRule(bezeichner, regel || "zoom: 1;", index);
		}
		else if (style.insertRule){
			style.insertRule(rule, index);
		}
		else {
			throw new Error("This browser does not support CSS-rule modification.");
		}
		
		// cannot use a local variable rules, because chrome creates a new rules-object when a new rule is added
		return styleRule._getRules(style)[index];
	},
	
	getBySelector: function getCSSRuleBySelector(selector, doc){
		/**
		 * Function styleRule.getBySelector
		 * @name: styleRule.getBySelector
		 * @author: Korbinian Kapsner
		 * @version: 0.9
		 * @description:
		 * @parameter:
		 *	selector:
		 *	doc:
		 */
		
		selector = selector.replace(/(^|\s+|,)([a-z]+)/i, function(m, s, t){return s + t.toUpperCase();});
		doc = DOM.getDocument(doc);
		var style = doc.styleSheets;
		for (var j = 0; j < style.length; j++){
			var rules = styleRule._getRules(style[j]);
			for (var i = 0; i < rules.length; i++){
				if (rules[i].selectorText === selector){
					return rules[i];
				}
			}
		}
		return styleRule.create(selector + "{ }", Number.NaN, doc);
	},
	
	// interieur functions
	_getWriteableStyleSheet: function getWriteableStyleSheet(doc){
		/**
		 * Function styleRule._getWriteableStyleSheet
		 * @name: styleRule._getWriteableStyleSheet
		 * @author: Korbinian Kapsner
		 * @version: 0.9
		 * @description:
		 * @parameter:
		 *	doc:
		 */
		
		doc = DOM.getDocument(doc);
		var style = doc.styleSheets;
		
		for (var i = style.length - 1; i >= 0 && (!styleRule._styleSheetWriteable(style[i]) || style[i].disabled);){
			i--;
		}
		if (i === -1){
			if (doc.createStyleSheet){
				style = doc.createStyleSheet();
			}
			else {
				style = kkjsnode.create({
					tag: "style",
					type: "text/css"
				});
				doc.getElementsByTagName("head")[0].appendChild(style);
				style = doc.styleSheets[doc.styleSheets.length - 1];
			}
		}
		else {
			style = style[i];
		}
		return style;
	},
	_styleSheetWriteable: function styleSheetWriteable(st){
		/**
		 * Function styleRule._styleSheetWriteable
		 * @name: styleRule._styleSheetWriteable
		 * @author: Korbinian Kapsner
		 * @version: 0.9
		 * @description:
		 * @parameter:
		 *	st:
		 */
		
		if ("readOnly" in st && st.readOnly){
			return false;
		}
		if ("rules" in st && !st.rules){
			return false;
		}
		try{
			if ("cssRules" in st && !st.cssRules){
				return false;
			}
		}
		catch(e){
			return false;
		}
		return true;
	},
	_getRules: function getRules(style){
		/**
		 * Function styleRule._getRules
		 * @name: styleRule._getRules
		 * @author: Korbinian Kapsner
		 * @version: 0.9
		 * @description:
		 * @parameter:
		 *	style:
		 */
		
		if (style.rules){
			return style.rules;
		}
		if (style.cssRules){
			return style.cssRules;
		}
		throw new Error("This Browser does not support CSS-rule modification.");
	},
	_getWriteableRules: function getWriteableRules(doc){
		/**
		 * Function styleRule._getWriteableRules
		 * @name: styleRule._getWriteableRules
		 * @author: Korbinian Kapsner
		 * @version: 0.9
		 * @description:
		 * @parameter:
		 *	doc:
		 */
		
		return styleRule._getRules(styleRule._getWriteableStyleSheet(doc));
	}
};

if (typeof exports !== "undefined"){
	for (var i in styleRule){
		if (styleRule.hasOwnProperty(i)){
			exports[i] = styleRule[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.styleRule = styleRule;
}

})();
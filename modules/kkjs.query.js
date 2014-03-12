(function(){
"use strict";

/**
 * Function query
 * @name: query
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 18.04.2013
 * @description: performs a CSS-syntax-like querysearch over all nodes
 * @parameter:
 *	queryString:
 *	[searchNode: ]
 *
 */

var oo = require("kkjs.oo");

var NodeAttributes = oo.Base.extend(function(str){
	this.parse(str);
}).implement({
	nodeName: "*",
	idNode: null,
	check: function(node){
		if (this.idNode && node !== this.idNode){
			return false;
		}
		if (this.nodeName !== "*" && node.nodeName !== this.nodeName){
			return false;
		}
		
		for (var i = 0; i < this.attributes.length; i++){
			if (!this.attributes[i].check(node)){
				return false;
			}
		}
		return true;
	},
	parse: function(str){
		
	}
});

function processQueryString(query){
	var strings = [];
	var rbrackets = [];
	var cbrackets = [];
	
	query = query.replace(/(['"])((?:\\.|[^\1])*)\1/g, function(m, q, s){strings.push(s); return "\x1As" + (strings.length - 1) + "\x1A";});
	
	var change = true;
	while (change){
		change = false;
		query = query.replace(/\(([^\(\)]*)\)/g, function(m, r){
			r = r.replace(/\x1As(\d+)\x1A/g, function(m, i){return "\"" + strings[i] + "\"";});
			r = r.replace(/\x1Ar(\d+)\x1A/g, function(m, i){return "(" + rbrackets[i] + ")";});
			rbrackets.push(r);
			change = true;
			return "\x1Ar" + (rbrackets.length - 1) + "\x1A";
		});
	}
	return {
		query: query,
		strings: strings,
		rbrackets: rbrackets
	};
}

function splitQueryStringGroups(query){
	return query.split(/\s*,\s*/g);
}
function splitQueryStringNodes(query){
	var l = query.length, i = 0;
	while (i - l){
		var connector = -1, con = -1, s = i;
		while ((con = query.connector.connectors.indexOf(query.charAt(i))) !== -1){
			if (connector > 0 && con !== 0){
				throw new SyntaxError("Invalid connector: " + query.substring(s, i + 1));
			}
			connector += con;
		}
		
	}
}

var query = function(queryString, searchNode){
	if (!searchNode){
		searchNode = document;
	}
};

query.match = function(node, queryString, baseNode){
	if (!baseNode){
		baseNode = document;
	}
};

query.connector = {
	connectors: " >+~",
	clearupFindRegExp: /\s*([ >+~])\s*/,
	clearupReplace: "$1",
	" ": function(node, baseNode){
		var ret = [];
		while (node.parentNode && node !== baseNode){
			node = node.parentNode;
			ret.push(node);
		}
		return ret;
	},
	">": function(node, baseNode){
		return (node === baseNode)? []: [node.parentNode];
	},
	"+": function(node, baseNode){
		var ret = node.previousSibling;
		while (ret && ret.nodeType === 3){
			ret = ret.previousSibling;
		}
		return ret? [ret]: [];
	},
	"~": function(node){
		node = node.previousSibling;
		var ret = [];
		while (node){
			if (node.nodeType !== 3){
				ret.push(node);
			}
			node = node.previousSibling;
		}
		return ret;
	}
};

query.attributeComparer = {
	"": function(expected, value){
		return value === expected;
	},
	"~": function(expected, value){
		if (!expected){
			return false;
		}
		value = value.split(/\s+/);
		
		for (var i = value.length - 1; i >= 0; i--){
			if (value[i] === expected){
				return true;
			}
		}
		return false;
	},
	"|": function(expected, value){
		return value === expected || value.substring(0, expected.length + 1) === expected + "-";
	},
	
	"^": function(expected, value){
		if (!expected){
			return false;
		}
		return value.substring(0, expected.length) === expected;
	},
	"$": function(expected, value){
		if (!expected){
			return false;
		}
		return value.substring(value.length - expected.length) === expected;
	},
	"*": function(expected, value){
		if (!expected){
			return false;
		}
		return !!(value.indexOf(expected) + 1);
	}
};

function nthParser(nth, i){
	nth = nth.replace(/\s+/g, "");
	nth = nth.replace(/(\D|^)0+([^n])/g, "$1$2");
	if (nth === "odd"){
		nth = "2n+1";
	}
	if (nth === "even"){
		nth = "2n";
	}
	if (!nthParser[nth]){
		var n = /^([+\-]?\d*)n/.exec(nth);
		n = n? parseInt(n[1] || 1, 10): 0;
		var p = /[+\-]?\d+$/.exec(nth);
		p = p? parseInt(p[0], 10): 0;
		nthParser[nth] = n?
			function(i){
				i -= p;
				return i % n === 0 && i / n >= 0;
			}:
			function(i){
				return i === p;
			};
	}
	return nthParser[nth](i);
}

query.pseudoClass = {
	root: {
		argument: false,
		check: function(node){
			return node.nodeName === "HTML";
		}
	},
	"nth-child": {
		argument: true,
		argumentRegExp: /^\s*(?:[+\-]?\d*n(?:\s*[+\-]\s*\d+)?|[+\-]?\d+|odd|even)\s*$/i,
		check: function(node, argument){
			var childNr = 1;
			var previous = node;
			while ((previous = previous.previousSibling) !== null){
				if (previous.nodeType === 1){
					childNr++;
				}
			}
			return nthParser(argument, childNr);
		}
	},
	"nth-last-child": {
		argument: true,
		argumentRegExp: /^\s*(?:[+\-]?\d*n(?:\s*[+\-]\s*\d+)?|[+\-]?\d+|odd|even)\s*$/i,
		check: function(node, argument){
			var childNr = 1;
			var next = node;
			while ((next = next.nextSibling) !== null){
				if (next.nodeType === 1){
					childNr++;
				}
			}
			return nthParser(argument, childNr);
		}
	},
	"nth-of-type": {
		argument: true,
		argumentRegExp: /^\s*(?:[+\-]?\d*n(?:\s*[+\-]\s*\d+)?|[+\-]?\d+|odd|even)\s*$/i,
		check: function(node, argument){
			var childNr = 1;
			var previous = node;
			while ((previous = previous.previousSibling) !== 0){
				if (previous.nodeType === 1 && previous.nodeName === node.nodeName){
					childNr++;
				}
			}
			return nthParser(argument, childNr);
		}
	},
	"nth-last-of-type": {
		argument: true,
		argumentRegExp: /^\s*(?:[+\-]?\d*n(?:\s*[+\-]\s*\d+)?|[+\-]?\d+|odd|even)\s*$/i,
		check: function(node, argument){
			var childNr = 1;
			var next = node;
			while ((next = next.nextSibling) !== null){
				if (next.nodeType === 1 && next.nodeName === node.nodeName){
					childNr++;
				}
			}
			return nthParser(argument, childNr);
		}
	},
	"first-child": {
		argument: false,
		check: function(node){
			if (!node.parentNode){
				return false;
			}
			var first = node.parentNode.firstChild;
			while (first && first.nodeType !== 1){
				first = first.nextSibling;
			}
			return node === first;
		}
	},
	"last-child": {
		argument: false,
		check: function(node){
			if (!node.parentNode){
				return false;
			}
			var last = node.parentNode.lastChild;
			while (last && last.nodeType !== 1){
				last = last.previousSibling;
			}
			return node === last;
		}
	},
	"first-of-type": {
		argument: false,
		check: function(node){
			if (!node.parentNode){
				return false;
			}
			var first = node.parentNode.firstChild;
			while (first && first.nodeName !== node.nodeName){
				first = first.nextSibling;
			}
			return node === first;
		}
	},
	"last-of-type": {
		argument: false,
		check: function(node){
			if (!node.parentNode){
				return false;
			}
			var last = node.parentNode.lastChild;
			while (last && last.nodeName !== node.nodeName){
				last = last.previousSibling;
			}
			return node === last;
		}
	},
	"only-child": {
		argument: false,
		check: function(node){
			if (!node.parentNode){
				return false;
			}
			var previous = node;
			while ((previous = previous.previousSibling) !== null){
				if (previous.nodeType === 1){
					return false;
				}
			}
			var next = node;
			while ((next = next.nextSibling) !== null){
				if (next.nodeType === 1){
					return false;
				}
			}
			return true;
		}
	},
	"only-of-type": {
		argument: false,
		check: function(node){
			if (!node.parentNode){
				return false;
			}
			var previous = node;
			while ((previous = previous.previousSibling) !== null){
				if (previous.nodeName === node.nodeName){
					return false;
				}
			}
			var next = node;
			while ((next = next.nextSibling) !== null){
				if (next.nodeName === node.nodeName){
					return false;
				}
			}
			return true;
		}
	},
	empty: {
		argument: false,
		check: function(node){
			var first = node.firstChild;
			while (first){
				if (first.nodeType !== 8){
					return false;
				}
				first = first.nextSibling;
			}
			return true;
		}
	},
	link: {
		argument: false,
		check: function(node){
			return node.nodeName === "A" && node.href;
		}
	},
	//visited - not implemented because of security reasons...
	hover: {
		argument: false,
		check: (function(){
			var hoverNode;
			kkjs.event.add(document, "mouseover", function(ev){
				hoverNode = ev.target;
			});
			return function(node){
				var par = hoverNode;
				while (par){
					if (node === par){
						return true;
					}
					par = par.parentNode;
				}
				return false;
			};
		})()
	},
	//active - not implementable
	//focus - dito
	target: {
		argument: false,
		check: function(node){
			return (node.nodeName === "A" && "#" + node.name === location.hash) || "#" + node.id === location.hash;
		}
	},
	lang: {
		argument: true,
		argumentRegExp: /^[a-z]+(?:-[a-z_\-]+)$/i,
		check: function(node, argument){
			var checkRegExp = new RegExp("^" + argument, "");
			while (node){
				if (checkRegExp.test(node.lang)){
					return true;
				}
				node = node.parentNode;
			}
			return false;
		}
	},
	enabled: {
		argument: false,
		check: function(node){
			return node.disabled === false;
		}
	},
	disabled: {
		argument: false,
		check: function(node){
			return node.disabled === true;
		}
	},
	checked: {
		argument: false,
		check: function(node){
			return node.checked === true;
		}
	},
	
	not: {
		argument: true,
		check: function(node, argument){
			return !query.match(node, argument);
		}
	}
};

kkjs.query = query;


function chunk(str){
	this.attributes = [];
	var i = 0, l = str.length;
	while (i - l){
		var character = str.charAt(i);
		if (character === "."){
			this.attributes.push({name: "class", comparer: "~", expected: ""});
		}
	}
}


})();
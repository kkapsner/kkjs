(function(){

"use strict";

var NodeRepresentator = require("kkjs.NodeRepresentator");
var kkjsNode = require("kkjs.node");
var css = require("kkjs.css");
var event = require("kkjs.event");

var Option = NodeRepresentator.extend(function(value, text){
	/*
	 * Class Option
	 * @description: representation of one option in the autocomplete select list
	 */

	this.value = value;
	this.text = value || text;
}).implement({
	active: false,
	disabled: false,
	list: null,
	
	deactivate: function(){
		this.emit("deactivate");
		this.active = false;
		this.update();
	},
	activate: function(){
		this.emit("activate");
		if (this.list){
			this.list.setCurrentOption(this);
		}
		this.active = true;
		this.update();
	},
	mark: function(){
		this.emit("mark");
		if (this.list){
			this.list.emit("mark", this);
		}
	},
	
	// NodeRepresentator Interface
	_createNode: function(){
		var This = this;
		return kkjsNode.create({
			tag: "li",
			className: "option" + (this.active? " active": ""),
			innerHTML: this.text.encodeHTMLEntities(),
			events: {
				mouseover: function(){
					This.activate();
				},
				mouseup: function(){
					if (This.list.mousedown){
						This.mark();
					}
				}
			}
		});
	},
	_updateNode: function(node){
		node.innerHTML = this.text.encodeHTMLEntities();
		css.className[this.active? "add": "remove"](node, "active");
		css.className[this.disabled? "add": "remove"](node, "disabled");
	}
});

var List = NodeRepresentator.extend(function(){
	/*
	 * Class List
	 * @description: representation of a autocomplete select list. Returned by the autocomplete.set-function.
	 */

	this.options = [];
	var This = this;
	event.add.key(document, "DOWN", "down", function(){
		if (This.active){
			This.next();
		}
	});
	event.add.key(document, "UP", "down", function(){
		if (This.active){
			This.previous();
		}
	});
	event.add.key(document, "ENTER", "down", function(ev){
		if (This.active && This.currentIndex !== -1){
			This.emit("mark", This.options[This.currentIndex]);
			This.deactivate();
			ev.preventDefault();
			ev.stopPropagation();
		}
	});
	event.add.key(document, "ESCAPE", "down", function(){
		if (This.active){
			This.deactivate();
		}
	});
}).implement({
	options: null,
	mousedown: false,
	active: false,
	
	filter: function(regExp){
		this.options.forEach(function(op){
			op.disabled = !regExp.test(op.value);
		});
		this.emit("filter");
		this.update();
	},
	
	activate: function(){
		if (!this.active){
			this.setCurrentIndex(-1);
			this.active = true;
			this.emit("activate");
			this.update();
		}
	},
	deactivate: function(){
		if (this.active){
			this.active = false;
			this.emit("deactivate");
			this.update();
		}
	},
	
	currentIndex: -1,
	next: function(){
		var i = this.currentIndex + 1;
		
		while (this.options[i] && this.options[i].disabled){
			i += 1;
		}
		this.setCurrentIndex(i);
		this.emit("next");
	},
	previous: function(){
		var i = this.currentIndex - 1;
		if (i === -2){
			i = this.options.length - 1;
		}
		
		while (this.options[i] && this.options[i].disabled){
			i -= 1;
		}
		this.setCurrentIndex(i);
		this.emit("previous");
	},
	setCurrentIndex: function(i){
		if (i < -1 || i >= this.options.length){
			i = -1;
		}
		if (i !== this.currentIndex){
			if (this.currentIndex !== -1){
				this.options[this.currentIndex].deactivate();
			}
			if (i !== -1 && this.options[i].disabled){
				i = -1;
			}
			this.currentIndex = i;
			if (this.currentIndex !== -1){
				var currentOption = this.options[this.currentIndex];
				currentOption.activate();
				currentOption.forEachNode(function(node){
					if (node.offsetTop < node.parentNode.scrollTop){
						node.parentNode.scrollTop = node.offsetTop;
					}
					else if (node.offsetTop + node.offsetHeight > node.parentNode.scrollTop + node.parentNode.clientHeight){
						node.parentNode.scrollTop = node.offsetTop + node.offsetHeight - node.parentNode.clientHeight;
					}
				});
			}
			this.emit("set.currentIndex", i);
			this.update();
		}
	},
	setCurrentOption: function(op){
		this.setCurrentIndex(this.options.indexOf(op));
	},
	
	addOption: function(op){
		if (!(op instanceof Option)){
			if (typeof op === "object"){
				op = new Option(op.value, op.text);
			}
			else {
				op = new Option(op);
			}
		}
		if (op.list){
			op.list.removeOption(op);
		}
		op.list = this;
		this.options.push(op);
		this.forEachNode(function(node){
			node.appendChild(op.createNode());
		});
		this.emit("add.option", op);
		this.update();
		
		return op;
	}.makeArrayCallable([0], {arrayLike: true}),
	removeOption: function(op){
		var i = this.options.indexOf(op);
		if (i >= 0){
			this.options.splice(i, 1);
			if (i === this.currentIndex){
				op.deactivate();
				this.currentIndex = -1;
			}
			else if (i < this.currentIndex){
				this.currentIndex -= 1;
			}
			op.removeAllNodes();
			this.emit("remove.option", op);
			this.update();
		}
	}.makeArrayCallable([0]),
	removeAllOptions: function(){
		if (this.currentIndex !== -1){
			this.options[this.currentIndex].deactivate();
			this.currentIndex = -1;
		}
		var This = this;
		this.options.forEach(function(op){
			op.removeAllNodes();
			This.emit("remove.option", op);
		});
		this.options = [];
		this.emit("remove.all.options");
	},
	
	// NodeRepresntator Interface
	_createNode: function(){
		var This = this;
		var node = kkjsNode.create({
			tag: "ol",
			className: "autocomplete list",
			events: {
				mousedown: function(ev){
					This.mousedown = true;
					ev.preventDefault();
				},
				mouseup: function(){
					This.mousedown = false;
				}
			}
		});
		this.options.forEach(function(op){
			node.appendChild(op.createNode());
		});
		return node;
	},
	_updateNode: function(node){
		var validOptions = this.options.reduce(function(v, op){
			if (!op.disabled){
				v += 1;
			}
			return v;
		}, 0);
		css.className[(this.active && validOptions)? "add": "remove"](node, "active");
		this.options.forEach(function(op){
			op.update();
		});
	}
});

/**
 * Object autocomplete
 * @name: autocomplete
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: autocomplete description
 */

var autocomplete = {
	set: function(input, options, att){
		input.autocomplete = "off";
		if (input.setAttribute){
			input.setAttribute("autocomplete", "off");
		}
		
		var l = new List();
		l.addOption(options);
		var node = l.createNode();
		input.parentNode.insertBefore(node, input.nextSibling);
		
		l.on("activate", function(){
			var p = kkjsNode.getPosition(input);
			p.sub(kkjsNode.getPosition(node.offsetParent || document.documentElement));
			css.set(node, {
				left: p.left,
				top: p.top + input.offsetHeight,
				minWidth: input.offsetWidth
			});
		});
		event.add(input, "focus", function(){
			if (att.openOnFocus){
				l.activate();
			}
		});
		event.add.key(input, ["UP", "DOWN"], "down", function(){
			l.activate();
		});
		event.add(input, "blur", function(ev){
			if (!l.mousedown){
				l.deactivate();
			}
			else {
				this.focus();
				ev.preventDefault();
			}
		});
		event.add(input, ["keyup", "keypress"], function(ev){
			if (att.filter){
				var regExpStr = 
					(att.filter.startAnywhere? "\\b": "^\\s*") +
					input.value.quoteRegExp();
				var flags =
					(att.filter.caseSensitive? "": "i");
				
				l.filter(new RegExp(regExpStr, flags));
			}
			if (ev.keyCode !== event.keyCodes.ENTER && ev.keyCode !== event.keyCodes.ESCAPE){
				l.activate();
			}
		});
		
		l.on("mark", function(op){
			input.value = op.value;
			input.focus();
			if (att.closeOnMark){
				l.deactivate();
			}
		});
		
		return l;
	}.setDefaultParameter(
		null,
		null,
		new Function.DefaultParameter({
			filter: {
				startAnywhere: false,
				caseSensitive: false
			},
			closeOnMark: true,
			openOnFocus: false
		})
	)
};

if (typeof exports !== "undefined"){
	for (var i in autocomplete){
		if (autocomplete.hasOwnProperty(i)){
			exports[i] = autocomplete[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.autocomplete = autocomplete;
}

})();
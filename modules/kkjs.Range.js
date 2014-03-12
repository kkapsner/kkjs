(function(){
"use strict";

/**
 * Class Range
 * @name: Range
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: A wrapper-class for cross-browser accessibility of w3C-ranges (as I know you just have to handle IEs textRanges).
 * @parameter:
 *	range
 * @used parts of kkjs:
 *	oo
 *	node
 *	DOM
 */

var oo = require("kkjs.oo");
var knode = require("kkjs.node");
var DOM = require("kkjs.DOM");

var Range = oo.Base.extend(function Range(){
})
.implement({
	commonAncestorNode: null,
	collapsed: true,
	startContainer: null,
	startOffset: 0,
	endContainer: null,
	endOffset: 0,
	_update: function update(){
		this.commonAncestorContainer = knode.getCommonAncestor(this.startContainer, this.endContainer);
		this.collapsed = (this.startContainer === this.endContainer && this.startOffset === this.endOffset);
	},
	_checkOffset: function checkOffset(node, offset){
		var length = ((node.nodeType !== 3)? node.childNodes: node.nodeValue).length;
		if (offset > length){
			offset = length;
		}
		if (offset < 0){
			offset = 0;
		}
		return offset;
	},
	setStart: function setEnd(refNode, offset){
		this.startContainer = refNode;
		this.startOffset = this._checkOffset(refNode, offset);
		if (this.endContainer){
			if (this.compareBoundaryPoints(this.START_TO_END, this) === 1){
				this.collapse(false);
			}
			else {
				this._update();
			}
		}
	},
	setEnd: function setEnd(refNode, offset){
		this.endContainer = refNode;
		this.endOffset = this._checkOffset(refNode, offset);
		if (this.startContainer){
			if (this.compareBoundaryPoints(this.START_TO_END, this) === 1){
				this.collapse(true);
			}
			else {
				this._update();
			}
		}
	},
	setStartBefore: function setEndBefore(refNode){
		this.setStart(refNode.parentNode, knode.getIndex(refNode));
	},
	setStartAfter: function setEndAfter(refNode){
		this.setStart(refNode.parentNode, knode.getIndex(refNode) + 1);
	},
	setEndBefore: function setEndBefore(refNode){
		this.setEnd(refNode.parentNode, knode.getIndex(refNode));
	},
	setEndAfter: function setEndAfter(refNode){
		this.setEnd(refNode.parentNode, knode.getIndex(refNode) + 1);
	},
	
	collapse: function collapse(toBegin){
		if (toBegin){
			this.endContainer = this.startContainer;
			this.endOffset = this.startOffset;
		}
		else{
			this.startContainer = this.endContainer;
			this.startOffset = this.endOffset;
		}
		this._update();
	},
	
	selectNode: function selectNode(node){
		this.startContainer = this.endContainer = node.parentNode;
		this.endOffset = 1 + (this.startOffset = knode.getIndex(node));
		this._update();
	},
	selectNodeContents: function selectNodeContents(node){
		this.startContainer = this.endContainer = node;
		this.startOffset = 0;
		this.endOffset = ((node.nodeType !== 3)? node.childNodes: node.nodeValue).length;
		this._update();
	},
	
	//  constants
	START_TO_START: 0, START_TO_END: 1, END_TO_END: 2, END_TO_START: 3,
	compareBoundaryPoints: function compareBoundaryPoints(how, sourceRange){
		var first, last;
		if (how === this.START_TO_START || how === this.START_TO_END){
			first = {container: this.startContainer, offset: this.startOffset};
		}
		else {
			first = {container: this.endContainer, offset: this.endOffset};
		}
		if (how === this.START_TO_START || how === this.END_TO_START){
			last = {container: sourceRange.startContainer, offset: sourceRange.startOffset};
		}
		else {
			last = {container: sourceRange.endContainer, offset: sourceRange.endOffset};
		}
		
		return comparePoints(first, last);
	},
	
	//the ...Contents-function are not ready yet.
	deleteContents: function deleteContents(){
		this.extractContents();
	},
	extractContents: function extractContents(){
		var dFrag = DOM.getDocument(this.commonAncestorContainer).createDocumentFragment(),
			firstPar, lastPar, start, end, par, parentNode, next, prev;
		if (this.collapsed){
			return dFrag;
		}
		if (this.commonAncestorContainer.nodeType === 3){
			var content = this.startContainer.splitText(this.startOffset);
			content.splitText(this.endOffset - this.startOffset);
			dFrag.appendChild(content);
			return dFrag;
		}
		
		if (this.startContainer.nodeType === 3){
			firstPar = start = this.startContainer.splitText(this.startOffset);
		}
		else {
			firstPar = start = this.startContainer.childNodes[this.startOffset];
		}
		
		while (start.parentNode !== this.commonAncestorContainer){
			par = start.parentNode.cloneNode(false);
			next = start.nextSibling;
			parentNode = start.parentNode;
			
			par.appendChild(firstPar);
			firstPar = par;
			while (next){
				start = next;
				next = start.nextSibling;
				firstPar.appendChild(start);
			}
			start = parentNode;
		}
		
		if (this.endContainer.nodeType === 3){
			if (this.endOffset !== this.endContainer.nodeValue.length){
				this.endContainer.splitText(this.endOffset);
			}
			lastPar = end = this.endContainer;
		}
		else {
			lastPar = end = this.endContainer.childNodes[this.endOffset - 1];
		}
		
		while (end.parentNode !== this.commonAncestorContainer){
			par = end.parentNode.cloneNode(false);
			prev = end.previousSibling;
			parentNode = end.parentNode;
			
			par.appendChild(lastPar);
			lastPar = par;
			while (prev){
				end = prev;
				prev = end.previousSibling;
				lastPar.insertBefore(end, lastPar.firstChild);
			}
			end = parentNode;
		}
		dFrag.appendChild(firstPar);
		next = start.nextSibling;
		while (next !== end){
			start = next;
			next = start.nextSibling;
			dFrag.appendChild(start);
		}
		dFrag.appendChild(lastPar);
		
		this.collapse(true);
		return dFrag;
	},
	cloneContents: function cloneContents(){
		return knode.create({tag: "fragment", innerHTML: this.htmlText});
	},
	
	insertNode: function insertNode(newNode){
		var before, parent, updateEndInTextNode = false;
		var startBefore = newNode;
		// if newNode is a documentFragment
		if (newNode.nodeType === 11){
			startBefore = newNode.firstChild;
		}
		
		if (this.startContainer === this.endContainer){
			if (this.startContainer.nodeType !== 3){
				this.endOffset += (newNode.nodeType === 11)? newNode.childNodes.length: 1;
			}
			else {
				this.endOffset -= this.startOffset;
				updateEndInTextNode = true;
			}
		}
		
		if (this.startContainer.nodeType === 3){
			before = this.startContainer.splitText(this.startOffset);
			parent = this.startContainer.parentNode;
		}
		else{
			before = this.startContainer.childNodes[this.startOffset] || null;
			parent = this.startContainer;
		}
		parent.insertBefore(newNode, before);
		
		if (updateEndInTextNode){
			this.endContainer = before;
		}
		
		this.setStartBefore(startBefore);
	},
	surroundContents: function surroundContents(newParent){
		newParent.appendChild(this.extractContents());
		this.insertNode(newParent);
	},
	
	cloneRange: function cloneRange(){
		var newRange = new this.constructor();
		newRange.setStart(this.startContainer, this.startOffset);
		newRange.setEnd(this.endContainer, this.endOffset);
		return newRange;
	},
	toString: function toString(){
		return this.constructor.toTextRange(this).text;
	},
	detach: function detach(){
		for (var i in this){
			if (this.hasOwnProperty(i)){
				delete this[i];
			}
		}
	},
	
	// Gecko Extensions
	
	comparePoint: function comparePoint(referenceNode, offset){
		offset = this._checkOffset(referenceNode, offset);
		return (comparePoints({container: this.startContainer, offset: this.startContainer}, {container: referenceNode, offset: offset}) < 0)?
					-1:
					(comparePoints({container: this.endContainer, offset: this.endOffset}, {container: referenceNode, offset: offset}) < 0)?
						0:
						1;
	}
})
.implementStatic({
	START_TO_START: 0, START_TO_END: 1, END_TO_END: 2, END_TO_START: 3,
	toTextRange: function rangeToTextRange(range){
		var doc = DOM.getDocument(range.startContainer);
		var textRange = doc.body.createTextRange();
		textRange.setEndPoint("StartToStart", getCursor(range.startContainer, range.startOffset));
		textRange.setEndPoint("EndToEnd", getCursor(range.endContainer, range.endOffset));
		return textRange;
	},
	fromTextRange: function rangeFromTextRange(textRange){
		/*jshint newcap: false*/
		var cursor, point, range = new this();
		for (var i = 0; i < 2; i++){
			cursor = textRange.duplicate();
			cursor.collapse(!i);
			point = getPoint(cursor);
			range["set" + (!i? "Start": "End")](point.container, point.offset);
		}
		return range;
	}
});

// interieur functions
function getCursor(node, offset){
	var doc = DOM.getDocument(node);
	var span = doc.createElement("span");
	var par, before;
	if (node.nodeType === 3){
		par = node.parentNode;
		before = node;
	}
	else {
		par = node;
		before = node.childNodes[offset] || null;
		offset = 0;
	}
	par.insertBefore(span, before);
	
	var cursor = doc.body.createTextRange();
	cursor.moveToElementText(span);
	par.removeChild(span);
	if (offset){
		cursor.move("character", offset);
	}
	return cursor;
}
function getPoint(cursor){
	var container, offset, par = cursor.parentElement(), k = par.childNodes;
	if (k.length === 0){
		return {container: par, offset: 0};
	}
	
	var doc = DOM.getDocument(par);
	var span = doc.createElement("span");
	var helpRange = cursor.duplicate();
	
	for (var i = k.length; i >= 0; i--){
		par.insertBefore(span, k[i] || null);
		helpRange.moveToElementText(span);
		if (helpRange.compareEndPoints("StartToStart", cursor) !== 1){
			break;
		}
	}
	par.removeChild(span);
	
	if (helpRange.compareEndPoints("StartToStart", cursor) === 0 || i === k.length){
		container = par;
		offset = i;
	}
	else {
		container = k[i];
		helpRange.setEndPoint("EndToEnd", cursor);
		offset = helpRange.text.length;
	}
	
	return {container: container, offset: offset};
}
function comparePoints(first, last){
	//first.index = getSourceIndex(first.container, first.offset);
	//last.index = getSourceIndex(last.container, last.offset);
	if (first.container === last.container){
		if (first.offset === last.offset){
			return 0;
		}
		return (first.offset < last.offset)? -1: 1;
	}
	var commonAncestor = knode.getCommonAncestor(first.container, last.container);
	if (commonAncestor !== first.container){
		first.offset = knode.getIndex(first.container, commonAncestor);
	}
	if (commonAncestor !== last.container){
		last.offset = knode.getIndex(last.container, commonAncestor);
	}
	return (first.offset < last.offset)? -1: 1;
}
/* function getSourceIndex(node, offset){
	if (node.nodeType === 3){
		var p = 0;
		var prev = node;
		while (prev.nodeType === 3 && (prev = knode.previous(prev))){
			p++;
		}
		
		var abs = p;
		var next = node;
		while (next.nodeType === 3 && (next = knode.next(next))){
			abs++;
		}
		return prev.sourceIndex + (p/abs);
	}
	else {
		if (offset < node.childNodes.length){
			return node.childNodes[offset].sourceIndex;
		}
		return node.sourceIndex;
	}
} */

if (!document.createRange){
	document.createRange = function createRange(){
		return new Range();
	};
}


if (typeof exports !== "undefined"){
	module.exports = Range;
}
else if (typeof kkjs !== "undefined"){
	kkjs.Range = Range;
}

})();
(function(){
"use strict";

/**
 * Object kkjs.Selection
 * @name: kkjs.Selection
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: provides the w3C-Selection-standard to IE
 */

kkjs.load.module("Range");

kkjs.Selection = kkjs.oo.Base.extend(function Selection(doc){
	this.doc = doc;
	this._realSelectionChanged = this.constructor.prototype._realSelectionChanged.bind(this);
	kkjs.event.add(this.doc, "selectionchange", this._realSelectionChanged);
	this._realSelectionChanged();
})
.implement({
	anchorNode: null,
	anchorOffset: 0,
	focusNode: null,
	focusOffset: null,
	isCollapsed: true,
	collapse: function collapse(parentNode, offset){
		this._ranges = [];
		var range = this.doc.createRange();
		range.setStart(parentNode, offset);
		range.endStart(parentNode, offset);
		this.addRange(range);
	},
	collapseToStart: function collapseToStart(){
		var range = this.getRangeAt(0);
		this.collapse(range.startContainer, range.startOffset);
	},
	collapseToEnd: function collapseToEnd(){
		var range = this.getRangeAt(this.rangeCount - 1);
		this.collapse(range.endContainer, range.endOffset);
	},
	selectAllChildren: function selectAllChildren(parentNode){
		this.collapse(parentNode, 0);
		this.getRangeAt(0).selectNodeContents(parentNode);
		this._update();
	},
	deleteFromDocument: function deleteFromDocument(){
		for (var i = 0; i < this.rangeCount; i++){
			this.getRangeAt(i).deleteContents();
		}
		this._update();
	},
	rangeCount: 0,
	getRangeAt: function getRangeAt(index){
		return this._ranges[index];
	},
	addRange: function addRange(range){
		this._ranges.push(range);
		this._update();
	},
	removeRange: function removeRange(range){
		for (var i = 0; i < this.rangeCount; i++){
			if (this.getRangeAt(i) === range){
				this._ranges.splice(i, 1);
				break;
			}
		}
		this._update();
	},
	removeAllRanges: function removeAllRanges(){
		this._ranges = [];
		this._update();
	},
	toString: function toString(){
		var string = "";
		for (var i = 0; i < this.rangeCount; i++){
			string += this.getRangeAt(i).toString();
		}
		return string;
	},
	
	_ranges: [],
	_update: function update(noRealChange){
		this.rangeCount = this._ranges.length;
		if (this.rangeCount){
			var range = this.getRangeAt(this.rangeCount - 1);
			this.anchorNode = range.startContainer;
			this.anchorOffset = range.startOffset;
			this.focusNode = range.endContainer;
			this.focusOffset = range.endOffset;
			this.isCollapsed = (this.rangeCount === 1 && range.collapsed);
		}
		else {
			this.anchorNode = null;
			this.anchorOffset = 0;
			this.focusNode = null;
			this.focusOffset = 0;
			this.isCollapsed = true;
		}
		if (!noRealChange){
			this._changeRealSelection();
		}
	},
	_realSelectionChanged: function selectionChanged(){
		this._ranges = [kkjs.Range.fromTextRange(this.doc.selection.createRange())];
		this._update(true);
	},
	_changeRealSelection: function changeRealSelection(){
		kkjs.event.remove(this.doc, "selectionchange", this._realSelectionChanged);
		
		if (this.rangeCount){
			var range = this.getRangeAt(this.rangeCount - 1).cloneRange();
			for (var i = this.rangeCount - 2; i >= 0; i--){
				range = expandRange(range, this.getRangeAt(i));
			}
			
			range = range.constructor.toTextRange(range);
			range.select();
		}
		else {
			this.doc.selection.empty();
		}
		
		kkjs.event.add(this.doc, "selectionchange", this._realSelectionChanged);
	}
});

function expandRange(range1, range2){
	var ss = range1.compareBoundaryPoints(range1.START_TO_START, range2);
	var se = range1.compareBoundaryPoints(range1.START_TO_END, range2);
	var es = range1.compareBoundaryPoints(range1.END_TO_START, range2);
	var ee = range1.compareBoundaryPoints(range1.END_TO_END, range2);
	
	if (se === 1 || es === -1 || (ss <= 0 && ee >= 0)){
		return range1;
	}
	if (ss === 1 && ee === -1){
		range1.setStart(range2.startContainer, range2.startOffset);
		range1.setEnd(range2.endContainer, range2.endOffset);
		return range1;
	}
	if (ss <= 0){//(es === 0 || (ss <= 0 && es === 1)){
		range1.setEnd(range2.endContainer, range2.endOffset);
		return range1;
	}
	if (ee >= 0){
		range1.setStart(range2.startContainer, range2.startOffset);
		return range1;
	}
	
}

if (!window.getSelection){
	var selection = false;
	window.getSelection = document.getSelection = function getSelection(){
		if (!selection){
			selection = new kkjs.Selection(document);
		}
		return selection;
	};
}

}).apply();
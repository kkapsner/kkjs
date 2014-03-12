(function(){
"use strict";

/**
 * Object selection
 * @name: selection
 * @author: Korbinian Kapsner
 + @version: 1.0
 * @description: provides some selection-functionality
 */

var DOM = require("kkjs.DOM");

var selection = {
	/**
	 * Function selection.get
	 * @name: selection.get
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 05.08.2009
	 * @description: gibt die Selektion zurück
	 * @parameter:
	 *	node:
	 */
	
	get: function getSelection(node){
		if (!node){
			node = document;
		}
		
		var doc = DOM.getDocument(node);
		var win = DOM.getWindow(node);
		
		if (win.getSelection){
			return win.getSelection();
		}
		else if (doc.selection){
			return doc.selection;
		}
		else{
			return null;
		}
	},
	
	/**
	 * Function selection.getRange
	 * @name: selection.getRange
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 05.08.2009
	 * @description: gibt den TextRange bzw. MozillaRange der Selektion zurück - bei mehrfachselektion wird ein Array der Ranges zurückgegeben
	 * @parameter:
	 *	node:
	 */

	getRange: function getSelectedRange(node){
		var sel = selection.get(node);
		if (sel.createRange){
			return sel.createRange();
		}
		else{
			var range;
			if (sel.rangeCount > 1){
				range = [sel.rangeCount];
				for (var i = 0; i < sel.rangeCount; i++){
					range[i] = sel.getRangeAt(i);
				}
			}
			else{
				if (sel.rangeCount === 1){
					range = sel.getRangeAt(0);
				}
				else {
					range = DOM.getDocument(node).createRange();
				}
			}
			return range;
		}
	},
	
	/**
	 * Function selection.selectNode
	 * @name: selection.selectNode
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 05.08.2009
	 * @description: selektiert die Node toSelect
	 * @parameter:
	 *	toSelect:
	 *	node:
	 */

	selectNode: function selectNode(toSelect, node){
		var sel = selection.empty(node), range;
		if (sel.addRange){
			range = DOM.getDocument(node).createRange();
			range.selectNode(toSelect);
			sel.addRange(range);
			return true;
		}
		if (sel.createRange){
			range = sel.createRange();
			range.moveToElementText(toSelect);
			range.select();
			return true;
		}
		
		return false;
	},
	
	/**
	 * Function selection.empty
	 * @name;: selection.empty
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: removes all selections
	 * @parameter:
	 *	node:
	 */
	
	empty: function emptySelection(node){
		var sel = selection.get(node);
		if (sel.removeAllRanges){
			sel.removeAllRanges();
		}
		else if (sel.empty){
			sel.empty();
		}
		return sel;
	},
	
	/**
	 * Function selection.collapse
	 * @name: selection.collapse
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 05.08.2009
	 * @description: lässt die aktuelle Selektion am vorderen (begin = true, default) oder hinteren "zusammenfallen"
	 * @parameter:
	 *	begin:
	 *	node:
	 */

	collapse: function selectionCollapse(begin, node){
		var sel = selection.get(node);
		
		if (typeof(begin) !== "boolean"){
			begin = true;
		}
		if (sel.collapseToStart){
			try{
				if (begin){
					sel.collapseToStart();
				}
				else{
					sel.collapseToEnd();
				}
			}
			catch(e){}
		}
		else if(sel.createRange){
			var range = sel.createRange();
			if (sel.type.toLowerCase() === "control"){
				selection.selectNode(range.item(0), node);
				range = selection.getRange(node);
			}
			range.collapse(begin);
			range.select();
		}
	}
};

selection.get.text = function getSelectedText(node){
	var sel = selection.get(node);
	if (sel.toString){
		return sel.toString();
	}
	if (sel.type === "control"){
		return "";
	}
	if (sel.createRange){
		var range = sel.createRange();
		if (typeof range.text !== "undefined"){
			return range.rext;
		}
	}
	return "";
};

if (typeof exports !== "undefined"){
	for (var i in selection){
		if (selection.hasOwnProperty(i)){
			exports[i] = selection[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.selection = selection;
}

}).apply();
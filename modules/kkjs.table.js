(function(){

"use strict";

/**
 * Object table
 * @name: table
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: table description
 */

var dataset = require("kkjs.dataset");
var node = require("kkjs.node");
var css = require("kkjs.css");
var event = require("kkjs.event");
var scroll = require("kkjs.scroll");
var styleRule = require("kkjs.styleRule");
var kMath = require("kkjs.Math");

function eachRow(table, callback){
	/**
	 * Function eachRow
	 * @name: eachRow
	 * @author: Korbinian Kapsner
	 * @description: calls a function on every row in all <tbody>s of a <table>.
	 * @parameter:
	 *	table: the <table>
	 *	callback: the function to be called.
	 */
	
	[].forEach.call(table.tBodies, function(body){
		[].forEach.call(body.rows, callback);
	});
}

function eachCellInColumn(table, columnIndex, callback, includeSpanning, includeHeadAndFoot){
	/**
	 * Function eachCellInColumn
	 * @name: eachCellInColumn
	 * @author: Korbinian Kapsner
	 * @description: calls a function on every cell in all specific column of a
	 *	<table>.
	 * @parameter:
	 *	table: the <table>
	 *	columnIndex: the column index
	 *	callback: the function to be called.
	 *	includeSpanning: if spanning cells should be processed.
	 *	includeHeadAndFoot: if cells in the <thead> or <tfoot> should also be
	 *		processed.
	 */
	
	if (includeHeadAndFoot){
		var col = getIthCol(table, columnIndex, includeSpanning);
		if (col){
			callback(col, -1);
		}
	}
	var rowIndexOffset = 0;
	if (includeHeadAndFoot && table.tHead){
		[].forEach.call(table.tHead.rows, function(row, rowIndex){
			var cell = getIthColumn(row, columnIndex, includeSpanning);
			if (cell){
				callback(cell, rowIndex);
			}
		});
		rowIndexOffset += table.tHead.rows.length;
	}
	
	[].forEach.call(table.tBodies, function(body){
		[].forEach.call(body.rows, function(row, rowIndex){
			var cell = getIthColumn(row, columnIndex, includeSpanning);
			if (cell){
				callback(cell, rowIndexOffset + rowIndex);
			}
		});
		rowIndexOffset += body.rows.length;
	});
	
	if (includeHeadAndFoot && table.tFoot){
		[].forEach.call(table.tFoot.rows, function(row, rowIndex){
			var cell = getIthColumn(row, columnIndex, includeSpanning);
			if (cell){
				callback(cell, rowIndexOffset + rowIndex);
			}
		});
	}
}

function getIthCol(table, columnIndex, returnSpanning){
	/**
	 * Function getIthCol
	 * @name: getIthCol
	 * @author: Korbinian Kapsner
	 * @description: returns the <col> at the specific column index.
	 * @parameter:
	 *	table: the <table>
	 *	columnIndex: the index of the column
	 *	returnSpanning: if a cell that spans over the column should be returned
	 */
	
	var cells = css.$("col", {node: table});
	for (var i = 0; i < cells.length; i += 1){
		if (columnIndex === 0){
			return cells[i];
		}
		columnIndex -= cells[i].realColSpan || cells[i].span;
		if (columnIndex < 0){
			return returnSpanning? cells[i]: null;
		}
	}
}
function getIthColumn(row, columnIndex, returnSpanning){
	/**
	 * Function getIthColumn
	 * @name: getIthColumn
	 * @author: Korbinian Kapsner
	 * @description: returns the cell at the specific column index.
	 * @parameter:
	 *	row: the <tr>
	 *	columnIndex: the index of the column
	 *	returnSpanning: if a cell that spans over the column should be returned
	 */
	
	var cells = row.cells;
	for (var i = 0; i < cells.length; i += 1){
		if (columnIndex === 0){
			return cells[i];
		}
		columnIndex -= cells[i].realColSpan || cells[i].colSpan;
		if (columnIndex < 0){
			return returnSpanning? cells[i]: null;
		}
	}
}

function getColumnIndex(cell){
	/**
	 * Function getColumnIndex
	 * @name: getColumnIndex
	 * @author: Korbinian Kapsner
	 * @description: returns the cells column index.
	 * @parameter:
	 *	cel: the <td> or <th>
	 */
	
	var columnIndex = 0;
	var cells = cell.parentNode.cells;
	for (var i = 0; i < cell.cellIndex; i += 1){
		columnIndex += cells[i].realColSpan || cells[i].colSpan;
	}
	return columnIndex;
}

function createHideStyle(){
	var name = "kkjsTableHide_" + Date.now().toString(36) + (Math.floor(Math.random() * 1296)).toString(36)
	styleRule.create("." + name + "{display: none !important;}");
	return name;
}

var table = {
	scrollableHead: function scrollableHead(table){
		/**
		 * Function table.scrollableHead
		 * @name: table.scrollableHead
		 * @author: Korbinian Kapsner
		 * @description: makes a table's head scrollable. This means that the
		 *	head will follow scroll movement to be visible all the time.
		 * @parameter:
		 *	table: the <table> to make the head scrollable
		 */
		
		var head = table.tHead;
		if (head){
			css.set(head, "position", "relative");
			if (css.get(head, "backgroundColor") === "transparent"){
				css.set(head, "backgroundColor", "white");
			}
			event.add(window, ["scroll", "resize"], function(){
				var nodePos = node.getPosition(table);
				var scrollPos = scroll.getPosition();
				var offset = scrollPos.top - nodePos.top;
				var range = new kMath.Range(
					0,
					table.offsetHeight -
					head.offsetHeight -
					Array.prototype.slice.call(table.rows).reduceRight(function(v, row){
						return v? v: row.offsetHeight;
					}, 0)
				);	
				css.set(head, "top", range.restrict(offset));
			}).fire("scroll");
		}
	}.makeArrayCallable([0]),
	
	forEachVisibleRow: function forEachVisibleRow(table, callback){
		/**
		 * Function table.forEachVisibleRow
		 * @name: table.forEachVisibleRow
		 * @author: Korbinian Kapsner
		 * @description: iterates over all visible rows of a table
		 * @parameter:
		 *	table: the <table> to iterate over
		 */
		
		var index = 0;
		eachRow(table, function(row){
			if (row.offsetHeight && row.offsetWidth){
				callback.call(undefined, row, index);
				index += 1;
			}
		});
	},
	
	sortable: function sortable(table, afterSortCallback){
		/**
		 * Function table.sortable
		 * @name: table.sortable
		 * @author: Korbinian Kapsner
		 * @description: makes a table sortable. Therefore the <thead> is
		 *	inspected for <th>s which have the data-sortable-attribute set.
		 *	In these <th>s a <span class="kkjs-table-sortControls"> with controls is injected.
		 *	The value of each row is taken from the data-value-attribute of the
		 *	cells in the ith column and is convernted to a number if possible.
		 * @parameter:
		 *	table: the <table> to make sortable
		 *	afterSortCallback: a callback after the sorting is performed
		 */
		
		css.$("th", {node: table.tHead}).forEach(function(th){
			if (dataset.get(th, "sortable")){
				var i = getColumnIndex(th);
				node.create({
					tag: "span",
					parentNode: th,
					className: "kkjs-table-sortControls",
					childNodes: [
						{
							tag: "span",
							innerHTML: "&#x25B2;",
							style: {cursor: "pointer"},
							events: {click: createSortEventListener(i, true)}
						},
						{
							tag: "span",
							innerHTML: "&#x25CF;",
							title: "original",
							style: {cursor: "pointer"},
							events: {click: createSortEventListener(i, 2)}
						},
						{
							tag: "span",
							innerHTML: "&#x25BC;",
							style: {cursor: "pointer"},
							events: {click: createSortEventListener(i, false)}
						}
					]
				});
			}
		});
		
		function createSortEventListener(i, up){
			/**
			 * Function createSortEventListener
			 * @name: createSortEventListener
			 * @author: Korbinian Kapsner
			 * @description: creates the sorting event listener
			 * @parameter:
			 *	i: the columns index
			 *	up: the the sorting should be ascending or not
			 * @return value: the sorting event listener
			 */
			
			var sortFunction;
			if (up){
				sortFunction = function(a, b){
					/* sorting ascending */
					
					if (a.value < b.value){
						return -1;
					}
					else if (a.value > b.value){
						return 1;
					}
					else {
						return 0;
					}
				};
			}
			else {
				sortFunction = function(a, b){
					/* sorting descending */
					if (a.value < b.value){
						return 1;
					}
					else if (a.value > b.value){
						return -1;
					}
					else {
						return 0;
					}
				};
			}
			return function(){
				var rows = [];
				eachRow(table, function(r, idx){
					if (typeof r.originalPosition === "undefined"){
						r.originalPosition = idx;
					}
					var value = dataset.get(getIthColumn(r, i), "value") || "";
					if (value.match(/^\d+(?:\.\d+)?(?:e[+-]?\d+)?$/i)){
						value = parseFloat(value);
					}
					rows.push(
						{
							node: r,
							value: (up && up !== true)? r.originalPosition: value
						}
					);
				});
				
				rows.sort(sortFunction);
				
				rows.forEach(function(r){
					table.tBodies[0].appendChild(r.node);
				});
				if (afterSortCallback){
					afterSortCallback.call(undefined, table);
				}
			};
		}
	}.makeArrayCallable([0]),
	
	filterable: function filterable(table, afterFilterCallback){
		/**
		 * Function table.filterable
		 * @name: table.filterable
		 * @author: Korbinian Kapsner
		 * @description: makes a table filterable. Therefore the <thead> is
		 *	inspected for <th>s which have the data-filterable-attribute set.
		 *	In these <th>s a <input class="kkjs-table-filter"> for the filter is injected.
		 *	The value of each row is taken from the data-value-attribute of the
		 *	cell in the ith column.
		 * @parameter:
		 *	table: the <table> to make filterable
		 *	afterFilterCallback: a callback after the filtering is done
		 */
		
		css.$("th", {node: table.tHead}).forEach(function(th){
			if (dataset.get(th, "filterable")){
				var i = getColumnIndex(th);
				var hideClassName = createHideStyle();
				node.create({
					tag: "input",
					className: "kkjs-table-filter",
					parentNode: th,
					events: {
						advancedChange: createFilterEventListener(i, hideClassName)
					}
				});
			}
		});
		
		function createFilterEventListener(i, hideClassName){
			/**
			 * Function createFilterEventListener
			 * @name: createFilterEventListener
			 * @author: Korbinian Kapsner
			 * @description: creates the filtering event listener
			 * @parameter:
			 *	i: the columns index
			 * @return value: the filtering event listener
			 */
			
			return function(){
				var regExp = new RegExp(this.value.quoteRegExp(), "i");
				eachRow(table, function(r){
					var cell = getIthColumn(r, i);
					if (!dataset.get(cell, "doNotHide")){
						css.className[
							(dataset.get(cell, "value") || "").match(regExp)?
							"remove":
							"add"
						](r, hideClassName);
					}
				});
				if (afterFilterCallback){
					afterFilterCallback.call(undefined, table);
				}
			};
		}
	}.makeArrayCallable([0]),
	
	selectable: function selectable(table, afterSelectCallback){
		/**
		 * Function table.selectable
		 * @name: table.selectable
		 * @author: Korbinian Kapsner
		 * @description: makes a table selectable. Therefore the <thead> is
		 *	inspected for <th>s which have the data-selectable-attribute set.
		 *	In these <th>s a <select class="kkjs-table-select"> for the selection is injected.
		 *	The value of each row is taken from the data-value-attribute of the
		 *	cell in the ith column.
		 * @parameter:
		 *	table: the <table> to make selectable
		 *	afterSelectCallback:  a callback after the filtering is done
		 */
		
		// iterate through all <th>-Nodes in the <thead>
		css.$("th", {node: table.tHead}).forEach(function(th){
			// if the <th> is marked as selectable by data-selectable
			if (dataset.get(th, "selectable")){
				var multiselect = !!dataset.get(th, "multiselect");
				var i = getColumnIndex(th);
				// create the options list
				var options = [];
				if (!multiselect){
					options.push(new Option("---", "", true, true));
				}
				var names = {};
				
				var predefinedNames = dataset.get(th, "names");
				if (predefinedNames){
					try {
						var predefinedNamesObj = JSON.parse(predefinedNames);
						Object.keys(predefinedNamesObj).forEach(function(key){
							names[key] = true;
							options.push(new Option(predefinedNamesObj[key], key, false, false));
						});
					}
					catch (e){
						console.warn("Invalid predefined names: \n" + predefinedNames);
					}
				}
				
				// iterate through all rows in <tbody>s in the table to get all
				// different values (stored in data-value in the <td>s)
				eachRow(table, function(r){
					var cell = getIthColumn(r, i);
					var value = dataset.get(cell, "value");
					if (value && !names[value]){
						names[value] = true;
						var name = dataset.get(cell, "text") || value;
						options.push(new Option(name, value, false, false));
					}
				});
				// create the <select> and insert into the DOM
				var hideClassName = createHideStyle();
				var changeListener = createSelectEventListener(i, multiselect, hideClassName);
				node.create({
					tag: "select",
					className: "kkjs-table-select",
					parentNode: th,
					childNodes: options,
					selectedIndex: multiselect? -1: 0,
					multiple: !!multiselect,
					events: {
						change: changeListener
					}
				});
			}
		});
		
		function createSelectEventListener(i, multiselect, hideClassName){
			/**
			 * Function createSelectEventListener
			 * @name: createSelectEventListener
			 * @author: Korbinian Kapsner
			 * @description: creates the selection event listener
			 * @parameter:
			 *	i: the columns index
			 * @return value: the selection event listener
			 */
			if (multiselect){
				return function(){
					var values = Array.prototype.map.call(this.selectedOptions, function(o){return o.value;});
					eachRow(table, function(r){
						var cell = getIthColumn(r, i);
						if (!dataset.get(cell, "doNotHide")){
							// hide all rows that don't have the right value
							css.className[
								(!values.length || values.indexOf(dataset.get(cell, "value")) !== -1)?
								"remove":
								"add"
							](r, hideClassName);
						}
					});
					if (afterSelectCallback){
						afterSelectCallback.call(undefined, table);
					}
				};
			}
			else {
				return function(){
					var value = this.value;
					eachRow(table, function(r){
						var cell = getIthColumn(r, i);
						if (!dataset.get(cell, "doNotHide")){
							// hide all rows that don't have the right value
							css.className[
								(!value || dataset.get(cell, "value") === value)?
								"remove":
								"add"
							](r, hideClassName);
						}
					});
					if (afterSelectCallback){
						afterSelectCallback.call(undefined, table);
					}
				};
			}
		}
	}.makeArrayCallable([0]),
	
	hideable: function hideable(table, controlsContainer){
		/**
		 * Function table.hideable
		 * @name: table.hideable
		 * @author: Korbinian Kapsner
		 * @description: makes a table hideable. Therefore the <thead> is
		 *	inspected for <th>s which have the data-hideable-attribute set.
		 *	For these <th>s a
		 *	<label class="kkjs-table-hide"><input type="checkbox"></label>
		 *	for the selection is injected in the controlsContainer.
		 * @parameter:
		 *	table: the <table> to make selectable
		 *	controlsContainer: a DOM-node that should hold the controls
		 */
		
		css.$("th", {node: table.tHead}).forEach(function(th){
			var hideableStatus = dataset.get(th, "hideable")
			if (hideableStatus){
				hideableStatus = hideableStatus !== "hidden";
				var i = getColumnIndex(th);
				var hideEventListener = createHideEventListener(i, th.colSpan);
				if (!hideableStatus){
					hideEventListener.call({checked: hideableStatus});
				}
				node.create({
					tag: "label",
					className: "kkjs-table-hide",
					parentNode: controlsContainer,
					childNodes: [
						{
							tag: "span",
							className: "group",
							childNodes: [
								{
									tag: "input",
									type: "checkbox",
									checked: hideableStatus,
									events: {
										change: hideEventListener
									}
								},
								{tag: "span", innerHTML: kkjs.dataset.get(th, "name") || th.innerHTML}
							]
						},
						" "
					],
				});
			}
		});
		
		function createHideEventListener(columnIndex, colSpan){
			/**
			 * Function createHideEventListener
			 * @name: createHideEventListener
			 * @author: Korbinian Kapsner
			 * @description: creates the hide event listener
			 * @parameter:
			 *	columnIndex: the columns index
			 *	colSpan: width of the span to hide
			 * @return value: the hide event listener
			 */
			
			return function(){
				var hidden = !this.checked;
				for (var i = 0; i < colSpan; i += 1){
					eachCellInColumn(
						table,
						columnIndex + i,
						function(cell){
							if ((cell.realColSpan || cell.colSpan || cell.span) === 1){
								css.set(cell, "display", hidden? "none": "");
							}
							else {
								if (typeof cell.realColSpan === "undefined"){
									cell.realColSpan = cell.colSpan || cell.span;
								}
								if (typeof cell.hiddenSpans === "undefined"){
									cell.hiddenSpans = {};
									for (var j = 0; j < (cell.colSpan || cell.span); j += 1){
										cell.hiddenSpans[j] = false;
									}
								}
								if (cell.hiddenSpans[columnIndex + i] !== hidden){
									cell.hiddenSpans[columnIndex + i] = hidden;
									
									if (hidden){
										var span = (cell.colSpan || cell.span) - 1;
										if (span === 0){
											css.set(cell, "display", "none");
										}
										else {
											if (cell.colSpan){
												cell.colSpan -= 1;
											}
											else {
												cell.span -= 1;
											}
										}
									}
									else {
										if (css.get(cell, "display") === "none"){
											css.set(cell, "display", "");
										}
										else {
											if (cell.colSpan){
												cell.colSpan += 1;
											}
											else {
												cell.span += 1;
											}
										}
									}
								}
								
							}
						},
						true,
						true
					);
				}
			};
		}
	}.makeArrayCallable([0])
};

if (typeof exports !== "undefined"){
	for (var i in table){
		if (table.hasOwnProperty(i)){
			exports[i] = table[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.table = table;
}

})();
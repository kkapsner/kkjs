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

var table = {
	sortable: function sortable(table){
		/**
		 * Function table.sortable
		 * @name: table.sortable
		 * @author: Korbinian Kapsner
		 * @description: makes a table sortable. Therefore the <thead> is
		 *	inspected for <th>s which have the data-sortable-attribute set.
		 *	In these <th>s a <span class="sortNode"> with controls is injected.
		 *	The value of each row is taken from the ith cells
		 *	data-value-attribute (there should be no colspan-attributes) and is
		 *	convernted to a number if possible.
		 * @parameter:
		 *	table: the <table> to make sortable
		 */
		
		css.$("th", {node: table.tHead}).forEach(function(th, i){
			if (dataset.get(th, "sortable")){
				node.create({
					tag: "span",
					parentNode: th,
					className: "sortNode",
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
					var value = dataset.get(r.cells[i], "value") || "";
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
			};
		}
	}.makeArrayCallable([0]),
	
	filterable: function filterable(table){
		/**
		 * Function table.filterable
		 * @name: table.filterable
		 * @author: Korbinian Kapsner
		 * @description: makes a table filterable. Therefore the <thead> is
		 *	inspected for <th>s which have the data-filterable-attribute set.
		 *	In these <th>s a <input> for the filter is injected.
		 *	The value of each row is taken from the ith cells
		 *	data-value-attribute (there should be no colspan-attributes).
		 * @parameter:
		 *	table: the <table> to make filterable
		 */
		
		css.$("th", {node: table.tHead}).forEach(function(th, i){
			if (dataset.get(th, "filterable")){
				node.create({
					tag: "input",
					parentNode: th,
					events: {
						advancedChange: createFilterEventListener(i)
					}
				});
			}
		});
		
		function createFilterEventListener(i){
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
					css.set(
						r,
						"display",
						(dataset.get(r.cells[i], "value") || "").match(regExp)?
							"":
							"none"
					);
				});
			};
		}
	}.makeArrayCallable([0]),
	
	selectable: function filterable(table){
		/**
		 * Function table.selectable
		 * @name: table.selectable
		 * @author: Korbinian Kapsner
		 * @description: makes a table selectable. Therefore the <thead> is
		 *	inspected for <th>s which have the data-selectable-attribute set.
		 *	In these <th>s a <select> for the selection is injected.
		 *	The value of each row is taken from the ith cells
		 *	data-value-attribute (there should be no colspan-attributes).
		 * @parameter:
		 *	table: the <table> to make selectable
		 */
		
		// iterate through all <th>-Nodes in the <thead>
		css.$("th", {node: table.tHead}).forEach(function(th, i){
			// if the <th> is marked as selectable by data-selectable
			if (dataset.get(th, "selectable")){
				// create the options list
				var options = [new Option("---", "", true, true)];
				var names = {};
				// iterate through all rows in <tbody>s in the table to get all
				// different values (stored in data-value in the <td>s)
				eachRow(table, function(r){
					var value = dataset.get(r.cells[i], "value");
					if (value && !names[value]){
						names[value] = true;
						var name = dataset.get(r.cells[i], "text") || value;
						options.push(new Option(name, value, false, false));
					}
				});
				// create the <select> and insert into the DOM
				node.create({
					tag: "select",
					parentNode: th,
					childNodes: options,
					events: {
						change: createSelectEventListener(i)
					}
				});
			}
		});
		
		function createSelectEventListener(i){
			/**
			 * Function createSelectEventListener
			 * @name: createSelectEventListener
			 * @author: Korbinian Kapsner
			 * @description: creates the selection event listener
			 * @parameter:
			 *	i: the columns index
			 * @return value: the selection event listener
			 */
			
			return function(){
				var value = this.value;
				eachRow(table, function(r){
					// hide all rows that don't have the right value
					css.set(
						r,
						"display",
						(!value || dataset.get(r.cells[i], "value") === value)?
							"":
							"none"
					);
				});
			};
		}
	}.makeArrayCallable([0]),
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
(function(){

"use strict";

var knode = require("kkjs.node");

/**
 * Object parser
 * @name: parser
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: parser description
 */

var p = (typeof DOMParser !== "undefined")? new DOMParser(): false;

var parser = {
	
	html: (function(){
		/**
		 * Function parser.html
		 * @name: parser.html
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: parses a HTML-string (also a fragment) to a HTML-documentFragment
		 * @parameter:
		 *	html: the html-string
		 * @return: the HTML-documentFragment is returned on success and null on failure.
		 */
		
		var validParents = {
			address   : {tag: "body"},
			area      : {tag: "map"},
			//base      : {tag: "head"},
			//body      : {tag: "html"},
			caption   : {tag: "table"},
			col       : {tag: "colgroup"},
			colgroup  : {tag: "table"},
			dd        : {tag: "dl"},
			dt        : {tag: "dl"},
			//head      : {tag: "html"},
			//html      : {tag: "html"},
			legend    : {tag: "fieldset"},
			li        : {tag: "ul"},
			//link      : {tag: "head"},
			//meta      : {tag: "head"},
			optgroup  : {tag: "select", multiple: true},
			option    : {tag: "select", multiple: true},
			param     : {tag: "object"},
			style     : {tag: "head"},
			tbody     : {tag: "table"},
			td        : {tag: "tr"},
			tfoot     : {tag: "table"},
			th        : {tag: "tr"},
			thead     : {tag: "table"},
			title     : {tag: "head"},
			tr        : {tag: "tbody"},
			
			others    : {tag: "div"}
		};
		var firstTagRE = /<([a-z]+)/i;
		return function(html){
			var doc = document.createDocumentFragment();
			var firstTag = (firstTagRE.exec(html) || ["",""])[1].toLowerCase();
			var wrapper = validParents[firstTag] || validParents.others;
			var wrapperOpenHTML = "<" + wrapper.tag;
			for (var i in wrapper){
				if (wrapper.hasOwnProperty(i) && i !== "tag"){
					if (wrapper[i]){
						wrapperOpenHTML += " " + i;
						if (wrapper[i] !== true){
							wrapperOpenHTML += "='" + encodeURIComponent(wrapper[i]) + "'";
						}
						else {
							wrapperOpenHTML += "='" + i + "'";
						}
					}
				}
			}
			
			var grandWrapper = knode.create({tag: (validParents[wrapper.tag] || validParents.others).tag});
			grandWrapper.innerHTML = "_" + wrapperOpenHTML + ">" + html + "</" + wrapper.tag + ">";
			wrapper = grandWrapper.getElementsByTagName(wrapper.tag)[0];
			
			while (wrapper.firstChild){
				doc.appendChild(wrapper.firstChild);
			}
			return doc;
		};
	})(),
	
	xml: function(xml){
		/**
		 * Function parser.xml
		 * @name: parser.xml
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: parses a XML-string to a XML-document
		 * @parameter:
		 *	xml: the XML-string
		 * @return: the XML-document is returned on success and null on failure.
		 */
		
		try {
			if (p){
				return p.parseFromString(xml, "text/xml");
			}
			else {
				var doc = new ActiveXObject("Microsoft.XMLDOM");
				doc.async = false;
				doc.loadXML(xml);
				return doc;
			}
		}
		catch (e){
			return null;
		}
	},
	
	csv: function(csv, att){
		/**
		 * Function parser.csv
		 * @name: parser.csv
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: parses a CSV-string to an array
		 * @parameter:
		 *	csv: the CSV-string
		 * @return: the array is returned on success and null on failure.
		 */
		
		var enclosedStrings = [];
		var enclose = att.enclose.quoteRegExp();
		csv = csv.replace(
			new RegExp(
				enclose + "((?:[^" + enclose + "]*|(?:" + enclose + "){2})*)" + "(?:" + enclose + "|$)",
				"g"
			),
			function (m, encloseMatch){
				if (att.removeEscaping){
					encloseMatch = encloseMatch.replace(new RegExp("(?:" + enclose + "){2}", "g"), att.enclose);
				}
				else {
					encloseMatch = m;
				}
				enclosedStrings.push(encloseMatch);
				return att.enclose + (enclosedStrings.length - 1);
			}
		);
		
		if (att.skipEmptyLines){
			csv = csv.replace(
				new RegExp("(^|\\r?\\n|\\r)(?:" + att.separator.quoteRegExp() + ")(?=\\r?\\n|\\r|$)+", "g"),
				""
			);
			if (csv.length === 0){
				return [];
			}
		}
		
		function splitLine(line, columnNames){
			/**
			 * splits a line and returns the row object
			 */
			
			var cells = line.split(att.separator);
			cells.forEach(function(cell, i){
				cells[i] = cell.replace(
					new RegExp(enclose + "(\\d+)", "g"),
					function(m, encloseNumber){
						return enclosedStrings[encloseNumber];
					}
				);
			});
			if (columnNames){
				cells.forEach(function(cell, i){
					if (columnNames[i]){
						cells[columnNames[i]] = cell;
					}
				});
			}
			return cells;
		}
		
		var lines = csv.split(/\r?\n|\r/g);
		if (att.header){
			var headerLine = lines.shift();
			att.columnNames = splitLine(headerLine);
		}
		lines.forEach(function(line, i){
			lines[i] = splitLine(line, att.columnNames);
		});
		return lines;
	}.setDefaultParameter(null, new Function.DefaultParameter(
		{
			separator: ",",
			enclose: "\"",
			removeEscaping: true,
			columnNames: null,
			header: false,
			skipEmptyLines: true,
		}
	))
};

if (typeof exports !== "undefined"){
	for (var i in parser){
		if (parser.hasOwnProperty(i)){
			exports[i] = parser[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.parser = parser;
}

})();
(function(){
"use strict";

/**
 * Object dataset
 * @name: dataset
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description:
 */

function camelCaseToAttributeName(str){
	if (str.indexOf("-") !== -1){
		throw new SyntaxError();
	}
	return "data-" + str.replace(/[A-Z]/g, function(c){
		return "-" + c.toLowerCase();
	});
}

var dataset = {
	/** Function dataset.set
	 * @name: dataset.set
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: wrapper for setting a dataset value (native NODE.dataset.key = value;)
	 */
	set: function set(node, key, value){
		if (node.dataset){
			node.dataset[key] = value;
		}
		else {
			var attName = camelCaseToAttributeName(key);
			node.setAttribute(attName, "" + value);
		}
	}.makeObjectCallable(1, 1, 2),
	
	/** Function dataset.get
	 * @name: dataset.get
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: wrapper for getting a dataset value (native value = NODE.dataset.key;)
	 */
	get: function get(node, key){
		if (node.dataset){
			return node.dataset[key];
		}
		else {
			var attName = camelCaseToAttributeName(key);
			var undef;
			if (node.hasAttribute){
				if (node.hasAttribute(attName)){
					return node.getAttribute(attName);
				}
				else {
					return undef;
				}
			}
			else {
				return node.getAttribute(attName);
			}
		}
	},
	
	/** Function dataset.del
	 * @name: dataset.del
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: wrapper for deleting a dataset value (native delete NODE.dataset.key;)
	 */
	del: function del(node, key){
		if (node.dataset){
			delete node.dataset[key];
		}
		else {
			var attName = camelCaseToAttributeName(key);
			node.removeAttribute(attName);
		}
	}
};

if (typeof exports !== "undefined"){
	for (var i in dataset){
		if (dataset.hasOwnProperty(i)){
			exports[i] = dataset[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.dataset = dataset;
}

})();
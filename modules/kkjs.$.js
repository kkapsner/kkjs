(function(){
"use strict";

var $ = function $(id, node){
	/**
	 * Function $
	 * @name: $
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description: gibt das Element mit der Id id im Document der Node node zurück, wenn id mit einem Punkt anfängt werden alle Nodes zurückgegeben, die den Klassennamen id haben; wenn id die form "<tag>" hat werden die nodes mit tag als Tagname zurückgegeben
	 * @parameter:
	 *	id:
	 *	node:
	 */
	
	if (!node){
		node = document;
	}
	
	if (typeof id !== "string"){
		return id;
	}
	if (id.charAt(0) === "."){
		return node.getElementsByClassName(id.substring(1, id.length));
	}
	var erg;
	if ((erg = /^<([^<>]+)>/.exec(id)) !== null){
		return node.getElementsByTagName(erg[1]);
	}
	
	return node.getElementById(id);
};

if (typeof exports !== "undefined"){
	module.exports = $;
}
else if (typeof kkjs !== "undefined"){
	kkjs.$ = $;
}

})();
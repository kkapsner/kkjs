(function(){
"use strict";
/**
 * Object URL
 * @name: URL
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: Representation of an URL - same stucture like window.location
 */

var oo = require("./kkjs.oo");

var URL = oo.Base.extend(function(url){
	this.setHref(url);
}).implement({
	toString: function(){
		/**
		 * Function URL.toString
		 * @name: URL.toString
		 * @description: String cast for the URL.
		 * @return value: the href of the URL.
		 */
		
		return this.getHref();
	},
	getHref: function(){
		/**
		 * Function URL.getHref
		 * @name: URL.getHref
		 * @description: Gets the href of the URL.
		 * @return value: the href of the URL.
		 */
		
		var searchJoin = (this.search === "" || this.search.charAt(0) === "?")? "": "?";
		var hashJoin = (this.hash === "" || this.hash.charAt(0) === "#")? "": "#";
		return this.protocol + "//" + (this.username? this.username + "@": "") + this.host + this.pathname + searchJoin + this.search + hashJoin + this.hash;
	},
	setHref: function(href){
		/**
		 * Function URL.setHref
		 * @name: URL.setHref
		 * @description: Sets the href of the URL.
		 * @parameter:
		 *	href: new href to be set
		 */
		
		if (!href) {
			href = location.href;
		}
		var match = /^([^:\/]*:)?(?:\/\/(?:([^@\/]*)@)?(([^:\/]*)(?::(\d*))?)(\/))?([^\?#]*)(\?[^#]*)?(#.*)?$/i.exec(href);
		this.protocol = match[1] || location.protocol;
		this.username = match[2] || "";
		this.host = match[3] || location.host;
		this.hostname = match[4] || location.hostname;
		this.port = match[5] || (match[4]? "": location.port);
		var hasHost = !!match[6];
		this.pathname = (hasHost? "/": "") + (match[7] || "");
		if (!hasHost && this.pathname.charAt(0) !== "/"){
			this.pathname = location.pathname.replace(/[^\/]+$/, "") + this.pathname;
		}
		this.search = match[8] || "";
		this.hash = match[9] || "";
	}
}).implementStatic({
	isSameOrigin: function(url1, url2){
		/**
		 * Function URL.isSameOrigin
		 * @name: URL.isSameOrigin
		 * @description: Checks if two URLs meet the SOP.
		 * @parameter:
		 *	url1: first URL to check
		 *	url2: second URL
		 * @return value: if the URLs have the same origin.
		 */
		
		return url1.protocol === url2.protocol &&
		       url1.host === url1.host &&
		       url1.hostname === url2.hostname &&
		       url1.port === url1.port;
	}
});

if (typeof exports !== "undefined"){
	module.exports = URL;
}
else if (typeof kkjs !== "undefined"){
	kkjs.URL = URL;
}

})();
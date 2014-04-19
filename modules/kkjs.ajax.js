(function(){
"use strict";
/**
 * Object ajax
 * @name: ajax
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: AJAX functionality
 */

var URL = require("kkjs.URL");

var ajax = {
	get: function AJAXget(url){
		/**
		 * Function ajax.get
		 * @name: ajax.get
		 * @version: 1.0
		 * @author: Korbinian Kapsner
		 * @description: starts a synchronous AJAX-Request and returns its responeText on succes and false on error
		 * @parameter:
		 *	url
		 */
		
		return ajax.advanced({
			url: url,
			asynch: false,
			onload: function(txt){return txt;},
			onerror: function(){return false;}
		});
	},
	
	preload: function AJAXpreload(url){
		/**
		 * Function ajax.preload
		 * @name: ajax.preload
		 * @version: 1.0
		 * @author: Korbinian Kapsner
		 * @description: starts a request to get the content in the cache
		 * @parameter:
		 *	url:
		 */
		
		return ajax.advanced({
			url: url,
			asynch: false,
			preventCaching: false
		});
	},
	
	simple: function simpleAJAX(ort, funktion, art, send, asynch){
		/**
		 * Function ajax.simple
		 * @name: ajax.simple
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 04.08.2009
		 * @description: wie oben, nur kann hier die Art der Anfrage art und derSendeparameter send gesetzt werden.
		 * @parameter:
		 *	ort:
		 *	funktion:
		 *	art:
		 *	send:
		 *	asynch:
		 */
		
		return ajax.advanced({
			url: ort,
			type: art,
			asynch: asynch,
			onload: funktion,
			send: send
		});
	},
	
	advanced: function advancedAJAX(att){
		/**
		 * Function ajax.advanced
		 * @name: ajax.advanced
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 04.03.2010
		 * @description: opens a HTTPRequest an you can set all parameter
		 * @parameter:
		 *	att: container for all the parameter (url, type, asynch, onload, onerror, onfunctionerror, send, preventCaching)
		 */
		
		if (att.preventCaching){
			att.url = att.url.replace(/#.*$/, "");
			att.url = att.url + ((att.url.indexOf("?") + 1)? "&": "?") + ((new Date()).getTime() + Math.random());
		}
		var url = new URL(att.url);
		att.xDomain = att.xDomain || !URL.isSameOrigin(url, location);
		
		//Request initialisieren
		var req = ajax._getRequest(att.xDomain);
		
		//request öffnen
		req.open(att.type, att.url, att.asynch, att.user, att.password);
		//Beim abschliessen des request wird diese Funktion ausgeführt
		var onready = ajax._getOnreadystatechange(att.onrequestfinished, att.onload, att.onerror, att.onfunctionerror).bind(req);
		if (att.asynch){
			req.onreadystatechange = onready;
		}
		ajax._setHeader(req, att.header);
		att.onbeforesend.call(req);
		req.send(att.send);
		
		if (!att.asynch){
			return onready();//return onready.call(req);
		}
		return req;
	}.setDefaultParameter(
		new Function.DefaultParameter(
			{
				url: null,
				type: "GET",
				xDomain: false,
				asynch: true,
				onbeforesend: function(){},
				onload: function(){},
				onerror: function(){},
				onfunctionerror: function(e){throw e;},
				onrequestfinished: function(){},
				send: null,
				preventCaching: true,
				user: null,
				password: null,
				header: null
			},
			{
				objectDeepInspection: true
			}
		)
	),
	
	// interieur functions
	_getRequest: function getRequest(xDomain){
		/**
		 * Generates the native XHR-object.
		 */
		var req;
		if (xDomain && window.XDomainRequest){
			req = new XDomainRequest();
			req.setRequestHeader = function(){};
		}
		else if (window.XMLHttpRequest){
			req = new XMLHttpRequest();
		}
		else if(window.ActiveXObject){
			["Msxml2.XMLHTTP.7.0", "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"].some(function(axo){
				try{
					req = new ActiveXObject(axo);
					return true;
				}
				catch (e){
					return false;
				}
			});
		}
		if (!req){
			throw new Error("Not able to create request object");
		}
		return req;
	},
	_getOnreadystatechange: function getOnreadystatechange(onrequestfinished, onload, onerror, onfunctionerror){
		/**
		 * Creates the onreadystatechange callback function
		 */
		if (typeof onrequestfinished !== "function"){
			onrequestfinished = function(){};
		}
		if (typeof onload !== "function"){
			onload = function(){};
		}
		if (typeof onerror !== "function"){
			onerror = function(){};
		}
		if (typeof onfunctionerror !== "function"){
			onfunctionerror = function(e){throw e;};
		}
		return function onreadystatechange(){
			/**
			 * Concrete event listener functions.
			 */
			if (this.readyState === 4){
				try{
					onrequestfinished.call(this);
					
					// IE9 bug
					var status = 0;
					try {
						status = this.status;
					} catch(error){}
					
					if (status === 0 || status === 200 || status === 304) {
						return onload.call(this, this.responseText, this.responseXML);
					}
					else {
						return onerror.call(this, status);
					}
				}
				catch(e){
					return onfunctionerror.call(this, e);
				}
			}
			return false;
		};
	},
	_setHeader: function setHeader(req, header){
		/**
		 * Sets the request headers.
		 */
		req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		for (var i in header){
			if (header.hasOwnProperty(i)){
				req.setRequestHeader(i, header[i]);
			}
		}
	}
};

if (typeof exports !== "undefined"){
	for (var i in ajax){
		if (ajax.hasOwnProperty(i)){
			exports[i] = ajax[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.ajax = ajax;
}
})();
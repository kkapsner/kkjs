/**
 * Function ajax.advanced
 * @name: ajax.advanced
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 04.03.2010
 * @description: opens a HTTPRequest an you can set all parameter.
 *	This function is deprecated. Use kkjs.ajax() directly.
 * @parameter:
 *	att: container for all the parameter (url, type, asynch, onload, onerror, onfunctionerror, send, preventCaching)
 */

ajax.advanced: function advancedAJAX(att){
	att = setDefault(att, {
		url: setDefault.spacer,
		type: "GET",
		xDomain: false,
		asynch: true,
		onbeforesend: function(){},
		onload: function(){},
		onerror: function(){},
		onfunctionerror: function(e){throw e;},
		onrequestfinished: function(){},
		send: setDefault.spacer,
		preventCaching: true,
		user: setDefault.spacer,
		password: setDefault.spacer,
		header: setDefault.spacer
	});
	
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
},
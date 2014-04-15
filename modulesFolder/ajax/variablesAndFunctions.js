// depenencies
var URL = require("kkjs.URL");
var QueryString = require("kkjs.QueryString");
var EventEmitter = require("kkjs.EventEmitter");

// interieur functions
var getRequest = function getRequest(xDomain){
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
};

var getOnreadystatechange = function getOnreadystatechange(onrequestfinished, onload, onerror, onfunctionerror){
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
};

var setHeader = function setHeader(req, header){
	req.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
	for (var i in header){
		if (header.hasOwnProperty(i)){
			req.setRequestHeader(i, header[i]);
		}
	}
};
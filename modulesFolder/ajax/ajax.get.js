/**
 * Function ajax.get
 * @name: ajax.get
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @description: starts a synchronous AJAX-Request and returns its responeText on succes and false on error
 * @parameter:
 *	url
 */
 
ajax.get = function ajaxGet(){
	var a = ajax({
		url: url,
		asynch: false,
		responseType: ""
	});
	return a.response;
};
/**
 * Class ajax.Request
 * @author: Korbinian Kapsner
 * @name: ajay.Request
 * @version: 1.0
 * @description: Unified wrapper for request objects.
 * @parameter
 *
 */

var Request = ajax.Request = EventEmitter.extend(function AjaxReqeust(nativeRequest){
	if (!nativeRequest){
		nativeRequest = getRequest();
	}
	this.nativeRequest = nativeRequest;
}).implement({
	nativeRequest: null,
	readyState: 0,
	
	
	open: function open(){},
	send: function send(){},
	abort: function(){},
}).implementStatic({
	STATE_UNSENT: 0,
	STATE_OPENED: 1,
	STATE_HEADERS_RECEIVED: 2,
	STATE_LOADING: 3,
	STATE_DONE: 4
});
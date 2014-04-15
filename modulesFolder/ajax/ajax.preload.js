/**
 * Function ajax.preload
 * @name: ajax.preload
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @description: starts a request to get the content in the cache
 * @parameter:
 *	url:
 */

ajax.preload = function ajaxPreload(url){
	return ajax.advanced({
		url: url,
		asynch: false,
		preventCaching: false
	});
};
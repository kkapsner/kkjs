	// XHR package
	var XHR = (function(){
		var useableXHRObjects = [];
		function createXHR(){
			/* creates and returns a native XHR object*/
			var req;
			if (typeof XMLHttpRequest !== "undefined"){
				req = new XMLHttpRequest();
			}
			else if (typeof ActiveXObject !== "undefined"){
				var tries = ["Msxml2.XMLHTTP.7.0", "Msxml2.XMLHTTP.6.0", "Msxml2.XMLHTTP.5.0", "Msxml2.XMLHTTP.4.0", "Msxml2.XMLHTTP.3.0", "Msxml2.XMLHTTP", "Microsoft.XMLHTTP"];
				for (var i = 0; i < tries.length; i += 1){
					try{
						req = new ActiveXObject(tries[i]);
						break;
					}
					catch (e){}
				}
			}
			if (!req){
				throw new Error("Error creating request object!");
			}
			return req;
		}
		function getXHR(){
			/* returns a recycled XHR or creates a new one */
			if (useableXHRObjects.length){
				return useableXHRObjects.pop();
			}
			else {
				return createXHR();
			}
		}
		function depositXHR(xhr){
			/* stores the XHR for recycling */
			useableXHRObjects.push(xhr);
		}
		function createCallback(callback, successCallback, failCallback){
			/* creates the onreadystatechange event callback */
			return function(){
				/*jshint validthis: true*/
				if (this.readyState === 4){
					var code = this.responseText;
					
					callback();
					try {
						this.responseText = "";
						this.responseXML = null;
					} catch(e){}
					
					if (this.status !== 0 && this.status !== 200 && this.status !== 304){
						failCallback(this.status);
					}
					else {
						successCallback(code);
					}
				}
			}
		}
		
		return {
			read: function(url, asynch, successCallback, failCallback){
				/* reads the URL and executes the appropriate callback */
				var xhr = getXHR();
				var callback = createCallback(
					function(){
						depositXHR(xhr);
					},
					successCallback,
					failCallback
				);
				xhr.open("GET", url, asynch);
				if (asynch){
					xhr.onreadystatechange = callback;
				}
				xhr.send(null);
				if (!asynch){
					callback.call(xhr);
				}
			}
		};
	}());
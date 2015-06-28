(function(){

"use strict";

var EventEmitter = require("./kkjs.EventEmitter");
var Promise = require("./kkjs.Promise");
var kNode = require("./kkjs.node");
var base64 = require("./kkjs.base64");

/**
 * Object localFile
 * @name: localFile
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: localFile description
 */

var FilePromise = EventEmitter.extend(function(){
	this.on("load", function(content){
		this.content = content;
		this.fulfill("load");
	});
	this.on("error", function(){
		this.deny("load");
	});
}).implement(Promise).implement({
	load: function(callback){
		return this.promise("load", callback);
	},
	error: function(){
		return this.promise("load", undefined, callback);
	}
});

var localFile = {
	load: function loadFile(loadCallback, errorCallback){
		var filePromise = new FilePromise();
		filePromise.promise("load", loadCallback, errorCallback);
		var input = kNode.create({
			tag: "input",
			type: "file",
			events: {
				change: function(){
					if (this.files.length){
						var file = this.files[0];
						filePromise.filename = this.value;
						filePromise.type = file.type;
						var reader = new FileReader();
						reader.onload = function(result){
							filePromise.emit("load", this.result);
						};
						reader.onerror = function(err){
							filePromise.emit("error", err);
						};
						reader.readAsText(this.files[0]);
					}
				}
			}
		});
		input.click();
		return filePromise;
	},
	enableFileDrop: function(node, loadCallback, errorCallback){
		var filePromise = new FilePromise();
		filePromise.promise("load", loadCallback, errorCallback);
		if (node && node !== document){
			kkjs.event.add(document, ["dragenter", "dragover"], function(ev){
				ev.preventDefault();
				ev.dataTransfer.dropEffect = "none";
			});
		}
		else {
			node = document;
		}
		
		kkjs.event.add(node, ["dragenter", "dragover"], dragenter)
			.addEvent(["dragenter", "dragover", "dragleave"], function(ev){
				filePromise.emit(ev.type, ev);
			})
			.addEvent("drop", function(ev){
				if (ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files.length){
					ev.preventDefault();
					var file = ev.dataTransfer.files[0];
					filePromise.filename = file.filename;
					filePromise.type = file.type;
					var reader = new FileReader();
					reader.onload = function(result){
						filePromise.emit("load", this.result);
					};
					reader.onerror = function(err){
						filePromise.emit("error", err);
					};
					reader.readAsText(file);
				}
				filePromise.emit("drop", ev);
			});
		
		return filePromise;
		function dragenter(ev){
			if ([].indexOf.call(ev.dataTransfer.types, 'Files') + 1){
				ev.preventDefault();
				ev.stopPropagation();
				ev.dataTransfer.dropEffect = "copy";
			}
		}
	}.makeArrayCallable(0, {arrayLike: true}),
	
	bounce: {
		use: false,
		URL: "",
		save: function bounceSaveFile(filename, content, mimeType){
			var form = kkjs.node.create({
				tag: "form",
				action: this.URL,
				method: "POST",
				target: "_blank",
				childNodes: [
					{
						tag: "input",
						type: "hidden",
						name: "content",
						value: content
					},
					{
						tag: "input",
						type: "hidden",
						name: "filename",
						value: filename
					},
					{
						tag: "input",
						type: "hidden",
						name: "contentType",
						value: mimeType
					}
				],
				parentNode: document.body
			});
			form.submit();
			kkjs.node.remove(form);
		}
	},
	save: function saveFile(filename, content, mimeType){
		filename = filename || "file.txt";
		content = content || "";
		mimeType = mimeType || "text/plain";
		if (this.bounce.use){
			this.bounce.save(filename, content, mimeType);
		}
		else {
			var a = kNode.create({
				tag: "a",
				download: filename ,
				href: "data:" + mimeType + ";base64," + base64.encode(content),
				target: "_blank",
				parentNode: document.body,
				childNodes: ["save"]
			});
			a.click();
			kNode.remove(a);
		}
	}
};

/*
 * @TODO: better check for direct download support.
 */
if (navigator.userAgent.indexOf("Trident") !== -1){
	localFile.bounce.use = true;
}

if (typeof exports !== "undefined"){
	for (var i in localFile){
		if (localFile.hasOwnProperty(i)){
			exports[i] = localFile[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.localFile = localFile;
}

})();
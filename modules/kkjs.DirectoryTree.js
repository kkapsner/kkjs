(function(){
"use strict";

var EventEmitter = require("kkjs.EventEmitter");
var event = require("kkjs.event");
var knode = require("kkjs.node");
var css = require("kkjs.css");
var ajax = require("kkjs.ajax");


var DirectoryTree = EventEmitter.extend(function(displayNode){
	this.createRoot();
	displayNode.appendChild(this.root.DOM);
	this.createBin();
	displayNode.appendChild(this.bin.DOM);
	css.className.add(displayNode, "kkjs_directoryTree");
	
	this.on("labelClick", function(dir){
		this.setActiveDir(dir);
	});
	this.on("reduce", function(dir){
		if (this.activeDir){
			var act = this.activeDir;
			while (act.parent){
				act = act.parent;
				if (dir === act){
					this.setActiveDir(dir);
					break;
				}
			}
		}
	});
	this.on("delete", function(dir){
		var act = this.activeDir;
		while (act && act.parent){
			if (dir === act){
				this.setActiveDir(dir.parent);
				break;
			}
			act = act.parent;
		}
	});
}).implement({
	ajaxPath: "?",
	processServerRequestParameter: function(params){
		var ret = [];
		for (var i in params){
			if (params.hasOwnProperty(i)){
				ret.push(encodeURIComponent(i) + "=" + encodeURIComponent(params[i]));
			}
		}
		return ret.join("&");
	},
	serverRequest: function(params, onload, content, header){
		this.emit("serverRequestStart");
		var This = this;
		ajax.advanced({
			type: content? "POST": "GET",
			url: this.ajaxPath + this.processServerRequestParameter(params),
			onrequestfinished: function(){
				This.emit("serverRequestEnd");
			},
			onload: function(txt){
				var ret = JSON.parse(txt);
				if (ret.success){
					onload.call(this, ret);
				}
				else {
					This.emit("serverError", ret.error);
				}
			},
			onfunctionerror: function(e){throw e;},
			send: content,
			header: header? header: {}
		});
	},
	root: null,
	activeDir: null,
	setActiveDir: function(dir){
		if (dir === this.activeDir){
			return;
		}
		this.emit("activeDirectoryChange", dir);
		if (this.activeDir){
			this.activeDir.setActive(false);
		}
		if (dir){
			dir.setActive(true);
		}
		this.activeDir = dir;
	},
	createRoot: function(){
		this.root = new DirectoryTree.Dir(".", "Root");
		this.root.setTree(this);
	},
	bin: null,
	createBin: function(){
		this.bin = new DirectoryTree.Dir(".trash", "Bin");
		this.bin.expandable = false;
		css.className.add(this.bin.DOM, "bin");
	}
}).implementStatic({
	Dir: EventEmitter.extend(function(name, displayName){
			this.name = name;
			this.displayName = displayName? displayName: name;
			this.children = [];
			this.createDOM();
		}).implement({
			name: ".",
			locked: false,
			children: null,
			parent: null,
			tree: null,
			setTree: function(tree){
				this.tree = tree;
				this.eventParent = tree;
			},
			getPath: function(){
				return (this.parent? this.parent.getPath(): "") + this.name + "/";
			},
			active: false,
			setActive: function(state){
				(state? css.className.add: css.className.remove)(this.label, "active");
				this.active = state;
			},
			expanded: false,
			expandable: true,
			expand: function(){
				if (this.expandable){
					if (!this.expanded && this.expandable){
						this.expanded = true;
						
						var This = this;
						this.tree.serverRequest(
							{
								action: "getDir",
								dir: this.getPath()
							},
							function(dir){
								if (dir.subDirectories && dir.subDirectories.length){
									This.emit("expand", This);
									This.expanded = true;
									css.className.add(This.label, "expanded");
									for (var i = 0; i < dir.subDirectories.length; i++){
										var child = new DirectoryTree.Dir(dir.subDirectories[i].name);
										
										child.locked = !!dir.subDirectories[i].locked;
										if (child.locked){
											css.className.add(child.label, "locked");
										}
										
										child.expandable = !!dir.subDirectories[i].hasSubDir;
										if (!child.expandable){
											css.className.add(child.label, "notExpandable");
										}
										This.appendChild(child);
									}
								}
								else {
									This.expandable = false;
									css.className.add(This.label, "notExpandable");
								}
							}
						);
					}
					else {
						this.expanded = false;
						this.emit("reduce", this);
						css.className.remove(this.label, "expanded");
						
						while(this.children.length){
							this.removeChild(this.children[0]);
						}
					}
				}
			},
			appendChild: function(dir){
				this.emit("appendChild", this, dir);
				if (dir.parent){
					dir.parent.removeChild(dir);
				}
				this.children.push(dir);
				this.DOM.appendChild(dir.DOM);
				dir.parent = this;
				dir.setTree(this.tree);
			},
			removeChild: function(dir){
				this.emit("removeChild", this, dir);
				for (var i = this.children.length; i--;){
					if (this.children[i] === dir){
						this.children.splice(i, 1);
						dir.parent = null;
						dir.setTree(null);
						knode.remove(dir.DOM);
						break;
					}
				}
			},
			createDOM: function(){
				var This = this;
				this.DOM = knode.create({
					tag:"div", className: "dir", directory: this,
					childNodes: [
						{
							tag: "div", className: "label", onclick: function(){This.emit("labelClick", This);},
							childNodes: [
								{tag: "div", className: "plusMinus"},
								{tag: "div", className: "folder"},
								{tag: "div", className: "grayBG", childNodes: [
									{tag: "div", className: "left"},
									{tag: "div", className: "right"}
								]}
							]
						}
					]
				});
				this.label = this.DOM.firstChild;
				event.add(this.label.firstChild, "click", function(ev){
					This.expand();
					ev.stopPropagation();
				});
				
				var text = knode.create({tag: "span", parentNode: this.label});
				if (this.displayName.length > 30){
					text.innerHTML = this.displayName.substring(0, 30) + "...";
					text.title = this.displayName;
				}
				else {
					text.innerHTML = this.displayName;
				}
				
			},
			
			deleteDir: function(){
				if (this !== this.tree.root && window.confirm("Wollen Sie den Ordner " + this.name + " mit kompletten Inhalt wirklich löschen?")){
					var This = this;
					this.tree.serverRequest(
						{
							action: "deleteDir",
							dir: this.getPath()
						},
						function(){
							This.emit("delete", This);
							This.parent.removeChild(This);
						}
					);
				}
			},
			createChild: function(name){
				if (name){
					var This = this;
					this.tree.serverRequest(
						{
							action: "addDir",
							dir: this.getPath(),
							dirname: name
						},
						function(){
							This.emit("createChild", This, name);
							if (!This.expandable){
								This.expandable = true;
								This.expanded = false;
								css.className.remove(This.label, "notExpandable");
							}
							else if (This.expanded){
								This.appendChild(new DirectoryTree.Dir(name));
							}
						}
					);
				}
			},
			uploadFile: function(file){
				//var reader = new FileReader();
				var data = new FormData();
				data.append("file", file);
				var This = this;
				//reader.onload = function(){
					This.tree.serverRequest(
						{
							action: "uploadFile",
							dir: This.getPath(),
							filename: file.name
						},
						function(){
							This.emit("fileUpload", This, file);
						},
						data,
						//"content=" + reader.result.replace(/([^a-z0-9._-])/ig, function(m, c){c = c.charCodeAt(0).toString(16); if (c.length < 2) c = "0" + c; return "%" + c;})
						{"content-type": ""}
					);
				/*};
				reader.onerror = function(e){
					This.emit("fileReadError", This, file, e);
				};
				reader.readAsBinaryString(file);*/
			}
		})
});


if (typeof exports !== "undefined"){
	module.exports = DirectoryTree;
}
else if (typeof kkjs !== "undefined"){
	kkjs.DirectoryTree = DirectoryTree;
}

})();
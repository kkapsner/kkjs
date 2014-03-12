(function(){
"use strict";

var EventEmitter = require("kkjs.EventEmitter");
var node = require("kkjs.node");
var event = require("kkjs.event");
var css = require("kkjs.css");
var moveable = require("kkjs.moveable");

var FilePanel = EventEmitter.extend(function(displayNode, tree){
	this.displayNode = displayNode;
	css.className.add(displayNode, "kkjs_filePanel");
	
	var This = this;
	this.directoryTreeActiveDirectoryChangeHandler = function(dir){
		This.setDirectory(dir);
	};
	this.directoryFileUploadHandler = function(dir, file){
		This.setDirectory(dir); // TODO: maybe do it not so brutal.
	};
	
	this.setDirectoryTree(tree);
	
	this.files = [];
	
	
	this.on("labelClick", function(file){
		this.setActiveFile(file);
	});
	
	this.on("fileMove", function(file, newDir){
		if (file.directory === this.directory){
			if (file === this.activeFile){
				this.setActiveFile(null);
			}
			this.removeFile(file);
		}
		else if(newDir === this.directory){
			this.addFile(file);
		}
	});
	this.on("fileCopy", function(file, newDir){
		if(newDir === This.directory){
			This.addFile(new FilePanel.File(file.name, file.url, newDir));
		}
	});
	this.on("fileDelete", function(file){
		if (file.directory === This.directory){
			if (file === this.activeFile){
				this.setActiveFile(null);
			}
			This.removeFile(file);
		}
	});
	
}).implement({
	displayNode: null,
	files: null,
	activeFile: null,
	setActiveFile: function(file){
		if (file === this.activeFile){
			return;
		}
		this.emit("activeFileChange", file);
		if (this.activeFile){
			this.activeFile.setActive(false);
		}
		if (file){
			file.setActive(true);
		}
		this.activeFile = file;
	},
	directoryTreeActiveDirectoryChangeHandler: null,
	directoryTree: null,
	setDirectoryTree: function(tree){
		if (this.directoryTree){
			this.directoryTree.removeListener("activeDirectoryChange", this.directoryTreeActiveDirectoryChangeHandler);
		}
		this.directoryTree = tree;
		if (tree){
			tree.on("activeDirectoryChange", this.directoryTreeActiveDirectoryChangeHandler);
		}
	},
	directoryFileUploadHandler: null,
	directory: null,
	setDirectory: function(dir){
		if (this.directory){
			this.directory.removeListener("fileUpload", this.directoryFileUploadHandler);
		}
		this.directory = dir;
		if (dir){
			dir.on("fileUpload", this.directoryFileUploadHandler);
		}
		this.showFiles(dir);
		this.setActiveFile(null);
	},
	showFiles: function(dir){
		node.clear(this.displayNode);
		this.children = [];
		var This = this;
		this.directoryTree.serverRequest(
			{
				action: "getFiles",
				dir: dir.getPath()
			},
			function(ret){
				var files = ret.files;
				for (var i = 0; i < files.length; i++){
					var file = files[i];
					This.addFile(new FilePanel.File(file.name, file.url, dir));
				}
			}
		);
	},
	addFile: function(file){
		if (file.filePanel){
			file.filePanel.removeFile(file);
		}
		this.children.push(file);
		this.displayNode.appendChild(file.DOM);
		file.setFilePanel(this);
	},
	removeFile: function(file){
		for (var i = this.children.length; i--;){
			if (this.children[i] === file){
				this.children.splice(i, 1);
			}
		}
		node.remove(file.DOM);
		file.setFilePanel(null);
	}
}).implementStatic({
	File: EventEmitter.extend(function(name, url, dir){
		this.name = name;
		this.url = url;
		this.directory = dir;
		this.createDOM();
	}).implement({
		name: "",
		getExtension: function(){
			return this.name.replace(/^.*\.([^.]*)$/, "$1");
		},
		directory: null,
		filePanel: null,
		setFilePanel: function(panel){
			this.filePanel = this.eventParent = panel;
		},
		url: "",
		active: false,
		setActive: function(state){
			(state? css.className.add: css.className.remove)(this.DOM, "active");
			this.active = state;
		},
		DOM: null,
		createDOM: function(){
			var This = this;
			this.DOM = node.create({
				tag: "div",
				className: "file",
				file: this,
				childNodes: [
					{
						tag: "div",
						className: "label",
						ondblclick: function(){This.emit("labelDblClick", This);This.startRename();},
						onclick: function(){This.emit("labelClick", This);},
						onmousedown: function(){This.emit("labelMouseDown", This);},
						onmouseup: function(){This.emit("labelMouseUp", This);},
						childNodes: [
							this.name,
							{
								tag: "a",
								className: "openLink",
								href: this.url + this.name,
								childNodes: ["open"],
								target: "_blank"
							}
						]
					}
				]
			});
			this.label = this.DOM.firstChild;
			moveable({
				node: this.DOM,
				moveClone: true,
				onstart: function(ev){
					return This === This.filePanel.activeFile && !css.className.has(ev.target, "openLink");
				},
				onclone: function(clone){
					css.set(clone, {opacity: 0.3, zIndex: 100});
				},
				onmove: function(ev, activeNode, movingNode){
					var oDisplay = movingNode.style.display;
					movingNode.style.display = "none";
					var node = event.getElementFromMousePosition(ev);
					movingNode.style.display = oDisplay;
					while (node && !node.directory){
						node = node.parentNode;
					}
					// if (node){
						// console.log(node.directory);
						// node.directory.highlight();
					// }
				},
				onstop: function(ev, activeNode, movingNode){
					var oDisplay = movingNode.style.display;
					movingNode.style.display = "none";
					var node = event.getElementFromMousePosition(ev);
					movingNode.style.display = oDisplay;
					while (node && !node.directory){
						node = node.parentNode;
					}
					if (node){
						if (node.directory.name === ".trash"){
							if (window.confirm("Wollen Sie die Datei " + This.name + " wirklich löschen?")){
								This["delete"]();
							}
						}
						else {
							This.move(node.directory);
						}
					}
				}
			});
		},
		startRename: function(){
			var This = this;
			var input = node.create({tag: "input", value: this.name.replace(/\.[a-z]+$/, ""), onblur: function(){
				This.rename(this.value);
				node.remove(this);
				This.label.appendChild(frag);
			}});
			
			var frag = node.clear(this.label);
			
			event.add.key(input, "ESCAPE", "up", function(){
				node.remove(this);
				This.label.appendChild(frag);
			});
			event.add.key(input, "ENTER", "up", function(){
				this.blur();
			});
			event.add(input, "click", function(ev){ev.stopPropagation();});
			event.add(input, "dblclick", function(ev){ev.stopPropagation();});
			event.add(input, "mousedown", function(ev){ev.stopPropagation();});
			event.add(input, "mouseup", function(ev){ev.stopPropagation();});
			
			this.label.appendChild(input);
			input.select();
		},
		rename: function(name){
			var extension = this.getExtension();
			if (name + "." + extension !== this.name){
				var This = this;
				this.filePanel.directoryTree.serverRequest(
					{
						action: "renameFile",
						dir: this.directory.getPath(),
						filename: this.name,
						replaceName: name
					},
					function(ret){
						This.emit("fileRename", This, name);
						This.name = ret.newFilename;
						node.clear(This.label);
						This.label.appendChild(node.create(This.name));
					}
				);
			}
		},
		
		move: function(dir){
			if (dir !== this.directory){
				var This = this;
				this.filePanel.directoryTree.serverRequest(
					{
						action: "moveFile",
						dir: this.directory.getPath(),
						filename: this.name,
						destDir: dir.getPath()
					},
					function(){
						This.emit("fileMove", This, dir);
						This.directory = dir;
					}
				);
			}
		},
		copy: function(dir){
			if (dir !== this.directory){
				var This = this;
				this.filePanel.directoryTree.serverRequest(
					{
						action: "copyFile",
						dir: this.directory.getPath(),
						filename: this.name,
						destDir: dir.getPath()
					},
					function(){
						This.emit("fileCopy", This, dir);
					}
				);
			}
		},
		"delete": function(){
			var This = this;
			this.filePanel.directoryTree.serverRequest(
				{
					action: "deleteFile",
					dir: this.directory.getPath(),
					filename: this.name
				},
				function(){
					This.emit("fileDelete", This);
					This.directory = null;
				}
			);
		}
	})
});


if (typeof exports !== "undefined"){
	module.exports = FilePanel;
}
else if (typeof kkjs !== "undefined"){
	kkjs.FilePanel = FilePanel;
}

})();

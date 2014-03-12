(function(){
"use strict";

var is = require("kkjs.is");
var css = require("kkjs.css");
var node = require("kkjs.node");
var event = require("kkjs.event");
var EventEmitter = require("kkjs.EventEmitter");
var DOM = require("kkjs.DOM");
var dataset = require("kkjs.dataset");
 
var Kightbox = EventEmitter.extend(function(){
	if (!(this instanceof Kightbox)){
		var box = new Kightbox();
		box.openLink.apply(box, arguments);
		return box;
	}
	this.container = node.create({tag: "div", className: "kkjs_kightbox", childNodes: [{tag: "span", className: "spanner"}]});
	this.innerContainer = node.create({tag: "span", className: "container", parentNode: this.container});
	this.contentContainer = node.create({tag: "div", className: "contentContainer", parentNode: this.innerContainer});
	this.buttonContainer = node.create({tag: "div", className: "buttonContainer", parentNode: this.innerContainer});
	
	this.minSize = {width: 0, height: 0};
	this.maxSize = {width: 0, height: 0};
	this.getMaxSizeFromWindow();
	var This = this;
	
	this.group = [];
	this.metaInfo = node.create({tag: "div", className: "metaInfo", parentNode: this.innerContainer, style: {display: "none"}});
	this.groupInfo = node.create({tag: "div", className: "groupInfo", parentNode: this.metaInfo});//, style: {display: "none"}});
	this.title = node.create({tag: "div", className: "title", parentNode: this.metaInfo});
	this.description = node.create({tag: "div", className: "description", parentNode: this.metaInfo});
	node.create({tag: "div", className: "clear", parentNode: this.metaInfo});
	
	this.addEvents();
	
	this.size = {width: 0, height: 0};
	this.setSize(this.minSize, true);
	this.buttons = {};
	this.addButton("close", function(){This.close();});
	this.addButton("next", function(){This.next();});
	this.addButton("prev", function(){This.prev();});
	this.hideButton("next");
	this.hideButton("prev");
	
	
	["n", "ne", "e", "se", "s", "sw", "w", "nw"].forEach(
		function(name, i, arr){
			arr[i] = node.create({tag: "div", parentNode: this.innerContainer, className: "border " + name});
		},
		this
	);
	
	event.add(Kightbox.overlay, "click", function(){This.close();});
	
}).implement({
	minSize: false,
	setMinSize: function(size){
		if (is.object(size)){
			this.setMinWidth(size.width);
			this.setMinHeight(size.height);
		}
	},
	setMinWidth: function(width){
		if (is.number(width)){
			this.minSize.width = width;
			if (width > this.size.width){
				this.setWidth(width);
			}
			if (width > this.maxSize.width){
				this.setMaxWidth(width);
			}
		}
	},
	setMinHeight: function(height){
		if (is.number(height)){
			this.minSize.height = height;
			if (height > this.size.height){
				this.setHeight(height);
			}
			if (height > this.maxSize.height){
				this.setMaxHeight(height);
			}
		}
	},
	getMinSizeFromContent: function(){
		this.setMinSize({
			width: Math.min(this.content.offsetWidth, this.maxSize.width),
			height: Math.min(this.content.offsetHeight, this.maxSize.height)
		});
	},
	
	maxSize: false,
	setMaxSize: function(size){
		if (is.object(size)){
			this.setMaxWidth(size.width);
			this.setMaxHeight(size.height);
		}
	},
	setMaxWidth: function(width){
		if (is.number(width)){
			this.maxSize.width = width;
			if (width < this.size.width){
				this.setWidth(width);
			}
			if (width < this.minSize.width){
				this.setMinWidth(width);
			}
		}
	},
	setMaxHeight: function(height){
		if (is.number(height)){
			this.maxSize.height = height;
			if (height < this.size.height){
				this.setHeight(height);
			}
			if (height < this.minSize.height){
				this.setMinHeight(height);
			}
		}
	},
	getMaxSizeFromWindow: function(){
		var size = DOM.getWindowSize();
		size.height -= 150;
		size.width -= 100;
		this.setMaxSize(size);
	},
	
	size: false,
	setSize: function(size, noAnimation){
		if (is.object(size)){
			this.setWidth(size.width, noAnimation);
			this.setHeight(size.height, noAnimation);
		}
	},
	setWidth: function(width, noAnimation){
		if (is.number(width)){
			if (this.maxSize.width < width){
				width = this.maxSize.width;
			}
			this.size.width = width;
			var This = this;
			if (noAnimation || !this.isOpen){
				css.set(
					[this.contentContainer, this.metaInfo],
					{width: width + "px"}
				);
			}
			else {
				css.animate(
					this.contentContainer, //[this.contentContainer, this.metaInfo], //
					{width: width + "px"},
					{
						duration: 0.2,
						onrun: function(){
							This.metaInfo.style.width = This.contentContainer.style.width;
						}
					}
				);
			}
			this.emit("resize", "width", width);
		}
	},
	setHeight: function(height, noAnimation){
		if (is.number(height)){
			if (this.maxSize.height < height){
				height = this.maxSize.height;
			}
			this.size.height = height;
			var This = this;
			if (noAnimation || !this.isOpen){
				css.set(
					this.contentContainer,
					{height: height + "px"}
				);
			}
			else {
				css.animate(
					this.contentContainer,
					{height: height + "px"},
					{duration: 0.2}
				);
			}
			this.emit("resize", "height", height);
		}
	},
	
	container: false,
	innerContainer: false,
	contentContainer: false,
	content: false,
	setContent: function(content){
		this.emit("contentChanged", content, this.content);
		this.removeContent();
		this.content = content;
		// TODO nicer proof that it's visible
		content.style.display = "block";
		content.style.visibility = "visible";
		this.contentContainer.appendChild(content);
	},
	removeContent: function(){
		var oldContent = this.content;
		if (oldContent){
			node.remove(oldContent);
			this.content = false;
		}
	},
	
	//eventListeners: [],
	addEvents: function(){
		var This = this;
		event.add(window, "resize", function(){
			This.getMaxSizeFromWindow();
		});
		event.add.key(document, "ESCAPE", "down", function(ev){
			This.close();
			ev.preventDefault();
		});
		event.add.key(document, "RIGHT", "down", function(ev){
			if (This.isOpen){
				This.next();
				ev.preventDefault();
			}
		});
		event.add.key(document, "LEFT", "down", function(ev){
			if (This.isOpen){
				This.prev();
				ev.preventDefault();
			}
		});
	},
	
	buttons: false,
	buttonContainer: false,
	addButton: function(name, onclick){
		this.buttons[name] = node.create({tag: "div", parentNode: this.buttonContainer, className: "button " + name, onclick: onclick});
		return this.buttons[name];
	},
	removeButton: function(name){
		node.remove(this.buttons[name]);
		delete this.buttons[name];
	},
	showButton: function(name){
		if (this.buttons[name]){
			this.buttons[name].style.display = "";
		}
	},
	hideButton: function(name){
		if (this.buttons[name]){
			this.buttons[name].style.display = "none";
		}
	},
	showButtons: function(){
		for (var i in this.buttons){
			if (this.buttons.hasOwnProperty(i)){
				this.buttons[i].style.display = "";
			}
		}
	},
	hideButtons: function(){
		for (var i in this.buttons){
			if (this.buttons.hasOwnProperty(i)){
				this.buttons[i].style.display = "none";
			}
		}
	},
	
	updateMeta: function(att){
		var show = !!this.groupInfo.innerHTML;
		if (att.title){
			this.title.innerHTML = att.title;
			show = true;
		}
		else {
			this.title.innerHTML = "";
		}
		if (att.description){
			this.description.innerHTML = att.description;
			show = true;
		}
		else {
			this.description.innerHTML = "";
		}
		
		this.metaInfo.style.display = show? "block": "none";
	},
	
	group: false,
	groupInfo: false,
	setGroup: function(group){
		if (Array.isArray(group)){
			this.group = group;
			this.setGroupButtons();
			this.updateGroupInfo();
		}
	},
	setGroupButtons: function(){
		if (this.group && this.group.length > 1){
			this.showButton("next");
			this.showButton("prev");
		}
		else {
			this.hideButton("next");
			this.hideButton("prev");
		}
	},
	deleteGroup: function(){
		this.group = false;
		this.active = 0;
		this.setGroupButtons();
		this.updateGroupInfo();
	},
	updateGroupInfo: function(){
		if (this.group){
			this.groupInfo.innerHTML = (this.active + 1) + "&nbsp;/&nbsp;" + this.group.length;
			this.emit("updateGroupInfo");
		}
		else {
			this.groupInfo.innerHTML = "";
		}
	},
	active: 0,
	next: function(){
		if (this.group){
			this.active++;
			if (this.active >= this.group.length){
				this.active = 0;
			}
			this.updateGroupInfo();
			this.openLink(this.group[this.active].href, this.group[this.active].options);
		}
	},
	prev: function(){
		if (this.group){
			if (this.active <= 0){
				this.active = this.group.length;
			}
			this.active--;
			this.updateGroupInfo();
			this.openLink(this.group[this.active].href, this.group[this.active].options);
		}
	},
	
	sourceNotFound: function(){
		this.setContent(Kightbox.images.sourceNotFound);
		this.getMinSizeFromContent();
		this.emit("sourceNotFound");
	},
	wait: function(id){
		Kightbox.images.wait.waitId = id;
		this.setContent(Kightbox.images.wait);
		this.getMinSizeFromContent();
		this.emit("wait");
	},
	
	overlayOpacity: 0.3,
	isOpen: false,
	open: function(){
		if (!this.isOpen){
			this.emit("open");
			this.isOpen = true;
			document.body.appendChild(Kightbox.overlay);
			css.setSingle(Kightbox.overlay, "opacity", 0);
			css.animate(Kightbox.overlay, {"opacity": this.overlayOpacity});
			document.body.appendChild(this.container);
		}
	},
	openNode: function(node, att){
		this.open();
		if (is.string(node)){
			node = css.$(node)[0];
			if (!node){
				this.sourceNotFound();
				return false;
			}
		}
		this.setSize(att);
		this.setContent(node.cloneNode(true));
		this.updateMeta(att);
		return true;
	},
	cachedImages: {},
	openImage: function(src, att){
		this.open();
		if (this.cachedImages[src]){
			this.cachedImages[src].onload();
		}
		var timer = (new Date()).getTime() + "-" + Math.random();
		this.wait(timer);
		var loadingImage = new Image();
		var This = this;
		loadingImage.onload = function(){
			if (This.content.waitId !== timer){
				return;
			}
			if (This.maxSize.height < this.height || This.maxSize.width < this.width){
				var faktor = Math.min(This.maxSize.width / this.width, This.maxSize.height / this.height);
				this.width *= faktor;
				this.height *= faktor;
			}
			This.setSize(this);
			This.setContent(this);
			This.updateMeta(att);
		};
		loadingImage.onerror = function(){
			if (This.content.waitId === timer){
				This.sourceNotFound();
			}
		};
		this.cachedImages[src] = loadingImage;
		loadingImage.src = src;
	},
	openLink: function(link, att, groupSetting){
		if (groupSetting){
			this.active = groupSetting.index;
			this.setGroup(groupSetting.group);
		}
		this.updateMeta(att);
		this.setSize(att);
		
		var hash = link.replace(location.href.replace(location.hash, ""), "");
		if (/^#/.test(hash)){
			this.openNode(hash, att);
		}
		else if (/\.(jpg|jpeg|png|gif|bmp|tiff?)$/i.test(link)){
			this.openImage(link, att);
		}
		else {
			this.open();
			this.setContent(node.create({tag: "iframe", src: link}));
		}
	},
	close: function(){
		if (this.isOpen){
			this.emit("close");
			this.isOpen = false;
			css.animate(Kightbox.overlay, {opacity: 0}, {duration: 0.3, onfinish: function(){node.remove(Kightbox.overlay);}});
			this.setSize({width: 0, height: 0}, true);
			node.remove(this.container);
		}
	}
}).implementStatic({
	overlay: node.create({tag: "div", className: "kkjs_kightbox_overlay"}),
	images: {
		wait: node.create({tag: "div", className: "wait"}),
		sourceNotFound: node.create({tag: "div", className: "sourceNotFound"})
	},
	init: function(){
		var box = new Kightbox();
		var groups = {};
		var kightboxRe = /(?:^|\b)kightbox(\{[^\{\}]*\})(?:$|\b)/i;
		Array.prototype.forEach.call(document.links, function(link){
			var optionsText = dataset.get(link, "kightbox");
			var options = false;
			if (!optionsText){
				optionsText = link.rel;
				Array.prototype.some.call(link.childNodes, function(child){
					if (child.nodeType === 8){
						optionsText = child.nodeValue;
						return true;
					}
					return false;
				});
				var match;
				if ((match = kightboxRe.exec(optionsText)) !== null){
					try{
						options = JSON.parse(match[1]);
					}
					catch(e){
						options = {width: 100, height: 100};
					}
				}
			}
			else {
				try{
					options = JSON.parse(optionsText);
				}
				catch(e){
					options = {width: 100, height: 100};
				}
			}
			
			if (options){
				var groupSetting = false;
				if (options.group){
					if (!groups[options.group]){
						groups[options.group] = [];
					}
					groups[options.group].name = options.group;
					groupSetting = {
						group: groups[options.group],
						index: groups[options.group].length
					};
					groupSetting.group.push({href: link.href, options: options});
				}
				event.add(link, "click", function(ev){
					ev.preventDefault();
					if (!groupSetting){
						box.deleteGroup();
					}
					box.openLink(this.href, options, groupSetting);
				});
			}
		});
		
		this.init = function(){
			throw new Error("init can only be run once.");
		};
		
		return box;
	}
});

if (typeof exports !== "undefined"){
	module.exports = Kightbox;
}
else if (typeof kkjs !== "undefined"){
	kkjs.kightbox = Kightbox;
}

})();
(function(){
"use strict";

/**
 * Kightbox
 * @version: 1.1
 * 
 * HTML-descriptor keys (all optional):
 *	group: name of the group
 *	title: title of the content
 *	description: description of the content
 *	width: width of the content. Can be displayed smaller if the window is
 *		smaller
 *	height: height of the content. Can be displayed smaller if the window is
 *		smaller
 *	aspectRatio: aspect ratio to be mandatory
 *
 * JS-descriptor keys: all of the HTML-keys without "group" plus:
 *	url: URL of the content. This is mandatory.
 *
 * "width", "height" and "aspectRatio" is ignored in image-URL. The values are
 * taken from the image itself.
 *
 * The JS-descriptor can also be a string. This will be used as the mandatory
 * URL.
 *
 * HTML-usage:
 *	<a href="URL" data-kightbox="{}">Kightbox without any parameter</a>
 *
 *	Grouped links:
 *	<a href="URL1" data-kightbox='{"group": "group name"}'>...</a>
 *	<a href="URL2" data-kightbox='{"group": "group name"}'>...</a>
 *	<a href="URL3" data-kightbox='{"group": "group name"}'>...</a>
 *
 * JS-usage:
 *	var box = new Kightbox();
 *	box.openLink("URL");
 *	//box.close();
 *	
 *	var group = ["URL1", "URL2", {url: "URL3", title: "title"}];
 *	box.openLink("URL1", group);
 *	box.openImage(group[2], group);
 *	//box.close();
 */

var css = require("kkjs.css");
var node = require("kkjs.node");
var event = require("kkjs.event");
var EventEmitter = require("kkjs.EventEmitter");
var DOM = require("kkjs.DOM");
var dataset = require("kkjs.dataset");
 
var Kightbox = EventEmitter.extend(function(){
	/**
	 * Constructor Kightbox
	 * @name: Kightbox
	 * @author: Korbinian Kapsner
	 * @description: Creates a new Kightbox instance.
	 * @return value: this.
	 */
	
	if (!(this instanceof Kightbox)){
		var box = new Kightbox();
		box.openLink.apply(box, arguments);
		return box;
	}
	var This = this;
	this.container = node.create({
		tag: "div", className: "kkjs_kightbox",
		events: {click: function(ev){if (ev.target === this){This.close();}}},
		childNodes: [{tag: "span", className: "spanner"}]
	});
	this.innerContainer = node.create({tag: "span", className: "container", parentNode: this.container});
	this.contentContainer = node.create({tag: "div", className: "contentContainer", parentNode: this.innerContainer});
	this.buttonContainer = node.create({tag: "div", className: "buttonContainer", parentNode: this.innerContainer});
	
	this.minSize = {width: Number.Infinity, height: Number.Infinity};
	this.maxSize = {width: 0, height: 0};
	this.getMaxSizeFromWindow();
	
	this.group = [];
	this.metaInfo = node.create({tag: "div", className: "metaInfo", parentNode: this.innerContainer, style: {display: "none"}});
	this.groupInfo = node.create({tag: "div", className: "groupInfo", parentNode: this.metaInfo});//, style: {display: "none"}});
	this.title = node.create({tag: "div", className: "title", parentNode: this.metaInfo});
	this.description = node.create({tag: "div", className: "description", parentNode: this.metaInfo});
	node.create({tag: "div", className: "clear", parentNode: this.metaInfo});
	
	this.addEvents();
	
	this.size = {width: 0, height: 0};
	this.wishSize = {width: 0, height: 0};
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
	
})
.implement({
	minSize: false,
	setMinSize: function(size){
		/**
		 * Function Kightbox.setMinSize
		 * @name: Kightbox.setMinSize
		 * @author: Korbinian Kapsner
		 * @description: sets the minimal size of the Kightbox.
		 * @parameter:
		 *	size: the new minimal size
		 * @return value: this
		 */
		
		if (size && typeof size === "object"){
			this.setMinWidth(size.width);
			this.setMinHeight(size.height);
		}
		
		return this;
	},
	setMinWidth: function(width){
		/**
		 * Function Kightbox.setMinWidth
		 * @name: Kightbox.setMinWidth
		 * @author: Korbinian Kapsner
		 * @description: sets the minimal width of the Kightbox.
		 * @parameter:
		 *	width: the new minimal width
		 * @return value: this
		 */
		
		if (typeof width === "number"){
			this.minSize.width = width;
			if (width > this.size.width){
				this.setWidth(width);
			}
			if (width > this.maxSize.width){
				this.setMaxWidth(width);
			}
		}
		
		return this;
	},
	setMinHeight: function(height){
		/**
		 * Function Kightbox.setMinHeight
		 * @name: Kightbox.setMinHeight
		 * @author: Korbinian Kapsner
		 * @description: sets the minimal height of the Kightbox.
		 * @parameter:
		 *	height: the new minimal height
		 * @return value: this
		 */
		
		if (typeof height === "number"){
			this.minSize.height = height;
			if (height > this.size.height){
				this.setHeight(height);
			}
			if (height > this.maxSize.height){
				this.setMaxHeight(height);
			}
		}
		
		return this;
	},
	getMinSizeFromContent: function(){
		/**
		 * Function Kightbox.getMinSizeFromContent
		 * @name: Kightbox.getMinSizeFromContent
		 * @author: Korbinian Kapsner
		 * @description: sets the minimal size from the content size.
		 * @return value: this
		 */
		
		this.setMinSize({
			width: Math.min(this.content.offsetWidth, this.maxSize.width),
			height: Math.min(this.content.offsetHeight, this.maxSize.height)
		});
		
		return this;
	},
	
	maxSize: false,
	setMaxSize: function(size){
		/**
		 * Function Kightbox.setMaxSize
		 * @name: Kightbox.setMaxSize
		 * @author: Korbinian Kapsner
		 * @description: sets the maximal size of the Kightbox.
		 * @parameter:
		 *	size: the new maximal size
		 * @return value: this
		 */
		
		if (size && typeof size === "object"){
			this.setMaxWidth(size.width);
			this.setMaxHeight(size.height);
		}
		
		return this;
	},
	setMaxWidth: function(width){
		/**
		 * Function Kightbox.setMaxWidth
		 * @name: Kightbox.setMaxWidth
		 * @author: Korbinian Kapsner
		 * @description: sets the maximal width of the Kightbox.
		 * @parameter:
		 *	width: the new maximal width
		 * @return value: this
		 */
		
		if (typeof width === "number"){
			this.maxSize.width = width;
			if (width < this.size.width){
				this.setWidth(width);
			}
			if (width < this.minSize.width){
				this.setMinWidth(width);
			}
		}
		
		return this;
	},
	setMaxHeight: function(height){
		/**
		 * Function Kightbox.setMaxHeight
		 * @name: Kightbox.setMaxHeight
		 * @author: Korbinian Kapsner
		 * @description: sets the maximal height of the Kightbox.
		 * @parameter:
		 *	height: the new maximal height
		 * @return value: this
		 */
		
		if (typeof height === "number"){
			this.maxSize.height = height;
			if (height < this.size.height){
				this.setHeight(height);
			}
			if (height < this.minSize.height){
				this.setMinHeight(height);
			}
		}
		
		return this;
	},
	getMaxSizeFromWindow: function(){
		/**
		 * Function Kightbox.getMaxSizeFromWindow
		 * @name: Kightbox.getMaxSizeFromWindow
		 * @author: Korbinian Kapsner
		 * @description: sets the maximal size from the window size.
		 * @return value: this
		 */
		
		var size = DOM.getWindowSize();
		size.height -= 100;
		size.width -= 100;
		this.setMaxSize(size);
		
		return this;
	},
	
	size: false,
	wishSize: false,
	aspectRatio: false,
	setSize: function(size, noAnimation){
		/**
		 * Function Kightbox.setSize
		 * @name: Kightbox.setSize
		 * @author: Korbinian Kapsner
		 * @description: sets the size of the Kightbox.
		 * @parameter:
		 *	size: the new size
		 *	noAnimation: if there should be no animation.
		 * @return value: this
		 */
		
		if (size && typeof size === "object"){
			this.wishSize = size;
			this.aspectRatio = size.aspectRatio;
			this.setWidth(size.width, noAnimation);
			this.setHeight(size.height, noAnimation);
		}
		
		return this;
	},
	setWidth: function(width, noAnimation){
		/**
		 * Function Kightbox.setWidth
		 * @name: Kightbox.setWidth
		 * @author: Korbinian Kapsner
		 * @description: sets the width of the Kightbox.
		 * @parameter:
		 *	width: the new width
		 *	noAnimation: if the should be no animation
		 * @return value: this
		 */
		
		if (typeof width === "number"){
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
					this.contentContainer,
					{width: width + "px"},
					{
						duration: 0.2,
						onrun: function(){
							/**
							 * Set meta-info node width to the same so it does
							 * proper line breaks.
							 */
							
							This.metaInfo.style.width = This.contentContainer.style.width;
						}
					}
				);
			}
			if (this.aspectRatio){
				var height = width / this.aspectRatio;
				if (this.size.height !== height){
					this.setHeight(height, noAnimation);
				}
			}
			this.emit("resize", "width", width);
		}
		
		return this;
	},
	setHeight: function(height, noAnimation){
		/**
		 * Function Kightbox.setHeight
		 * @name: Kightbox.setHeight
		 * @author: Korbinian Kapsner
		 * @description: sets the height of the Kightbox.
		 * @parameter:
		 *	height: the new height
		 *	noAnimation: if there should be no animation.
		 * @return value: this
		 */
		
		if (typeof height === "number"){
			var oldWidth = this.metaInfo.style.width;
			this.metaInfo.style.width = this.size.width + "px";
			if (this.maxSize.height - this.metaInfo.offsetHeight < height){
				height = this.maxSize.height - this.metaInfo.offsetHeight;
			}
			this.metaInfo.style.width = oldWidth;
			
			this.size.height = height;
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
			if (this.aspectRatio){
				var width = height * this.aspectRatio;
				if (this.size.width !== width){
					this.setWidth(width, noAnimation);
				}
			}
			this.emit("resize", "height", height);
		}
		
		return this;
	},
	
	container: false,
	innerContainer: false,
	contentContainer: false,
	content: false,
	setContent: function setContent(content){
		/**
		 * Function Kightbox.setContent
		 * @name: Kightbox.setContent
		 * @author: Korbinian Kapsner
		 * @description: sets the content of the Kightbox. This should only be
		 *	called from the open* functions.
		 * @parameter:
		 *	content: the new content node. It has to be a single DOM-node and
		 *		not a document fragment.
		 * @return value: this
		 */
		
		this.emit("contentWillChange", content, this.content);
		this.removeContent();
		this.content = content;
		// TODO nicer proof that it's visible
		content.style.display = "block";
		content.style.visibility = "visible";
		this.contentContainer.appendChild(content);
		this.emit("contentChanged", this.content);
		
		return this;
	},
	removeContent: function removeContent(){
		/**
		 * Function Kightbox.removeContent
		 * @name: Kightbox.removeContent
		 * @author: Korbinian Kapsner
		 * @description: removes the content from the Kightbox.
		 * @return value: this
		 */
		
		node.clear(this.contentContainer);
		// var oldContent = this.content;
		// if (oldContent){
			// node.remove(oldContent);
			this.content = false;
		// }
		
		return this;
	},
	
	//eventListeners: [],
	addEvents: function addEvents(){
		/**
		 * Function Kightbox.addEvents
		 * @name: Kightbox.addEvents
		 * @author: Korbinian Kapsner
		 * @description: registers the event listener on window and document.
		 * @return value: this
		 */
		
		var This = this;
		event.add(window, "resize", function(){
			This.getMaxSizeFromWindow();
			This.setSize(This.wishSize);
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
		
		return this;
	},
	
	buttons: false,
	buttonContainer: false,
	addButton: function(name, onclick){
		/**
		 * Function Kightbox.addButton
		 * @name: Kightbox.addButton
		 * @author: Korbinian Kapsner
		 * @description: adds a button. If the button name is already in use the
		 *	old button is removed.
		 * @parameter:
		 *	name: the buttons name
		 *	onclick: the click event listener
		 * @return value: this
		 */
		
		if (this.buttons[name]){
			this.removeButton(name);
		}
		this.buttons[name] = node.create({
			tag: "div",
			parentNode: this.buttonContainer,
			className: "button " + name,
			onclick: onclick
		});
		
		return this;
	},
	removeButton: function(name){
		/**
		 * Function Kightbox.removeButton
		 * @name: Kightbox.removeButton
		 * @author: Korbinian Kapsner
		 * @description: removes one button
		 * @parameter:
		 *	name: the button to remove
		 * @return value: this
		 */
		
		if (this.buttons[name]){
			node.remove(this.buttons[name]);
			delete this.buttons[name];
		}
		
		return this;
	},
	showButton: function(name){
		/**
		 * Function Kightbox.showButton
		 * @name: Kightbox.showButton
		 * @author: Korbinian Kapsner
		 * @description: shows one button.
		 * @parameter:
		 *	name: the button to show
		 * @return value: this
		 */
		
		if (this.buttons[name]){
			this.buttons[name].style.display = "";
		}
		
		return this;
	},
	hideButton: function(name){
		/**
		 * Function Kightbox.hideButton
		 * @name: Kightbox.hideButton
		 * @author: Korbinian Kapsner
		 * @description: hides one button.
		 * @parameter:
		 *	name: the button to hide
		 * @return value: this
		 */
		
		if (this.buttons[name]){
			this.buttons[name].style.display = "none";
		}
		
		return this;
	},
	showButtons: function(){
		/**
		 * Function Kightbox.showButtons
		 * @name: Kightbox.showButtons
		 * @author: Korbinian Kapsner
		 * @description: shows all buttons.
		 * @return value: this
		 */
		
		for (var i in this.buttons){
			if (this.buttons.hasOwnProperty(i)){
				this.buttons[i].style.display = "";
			}
		}
		
		return this;
	},
	hideButtons: function(){
		/**
		 * Function Kightbox.hideButtons
		 * @name: Kightbox.hideButtons
		 * @author: Korbinian Kapsner
		 * @description: hides all buttons.
		 * @return value: this
		 */
		
		for (var i in this.buttons){
			if (this.buttons.hasOwnProperty(i)){
				this.buttons[i].style.display = "none";
			}
		}
		
		return this;
	},
	
	updateMeta: function(descriptor){
		/**
		 * Function Kightbox.updateMeta
		 * @name: Kightbox.updateMeta
		 * @author: Korbinian Kapsner
		 * @description: updates title and description.
		 * @parameter:
		 *	descriptor: object with the title and description information.
		 * @return value: this
		 */
		
		var show = !!this.groupInfo.innerHTML;
		if (descriptor.title){
			this.title.innerHTML = descriptor.title;
			show = true;
		}
		else {
			this.title.innerHTML = "";
		}
		if (descriptor.description){
			this.description.innerHTML = descriptor.description;
			show = true;
		}
		else {
			this.description.innerHTML = "";
		}
		
		this.metaInfo.style.display = show? "block": "none";
		
		return this;
	},
	
	group: false,
	groupInfo: false,
	setGroup: function(group){
		/**
		 * Function Kightbox.setGroup
		 * @name: Kightbox.setGroup
		 * @author: Korbinian Kapsner
		 * @description: sets the current group.
		 * @parameter:
		 *	group: the new group. If this parameter is not an array nothing
		 *		happens.
		 * @return value: this
		 */
		
		if (Array.isArray(group)){
			this.group = group;
			this.setGroupButtons();
			this.updateGroupInfo();
		}
		
		return this;
	},
	setGroupButtons: function(){
		/**
		 * Function Kightbox.setGroupButtons
		 * @name: Kightbox.setGroupButtons
		 * @author: Korbinian Kapsner
		 * @description: shows/hides the group buttons according to the current
		 *	group.
		 * @return value: this
		 */
		
		if (this.group && this.group.length > 1){
			this.showButton("next");
			this.showButton("prev");
		}
		else {
			this.hideButton("next");
			this.hideButton("prev");
		}
		
		return this;
	},
	deleteGroup: function(){
		/**
		 * Function Kightbox.deleteGroup
		 * @name: Kightbox.deleteGroup
		 * @author: Korbinian Kapsner
		 * @description: removes the group from the Kightbox.
		 * @return value: this
		 */
		
		this.group = false;
		this.active = 0;
		this.setGroupButtons();
		this.updateGroupInfo();
		
		return this;
	},
	updateGroupInfo: function(){
		/**
		 * Function Kightbox.updateGroupInfo
		 * @name: Kightbox.updateGroupInfo
		 * @author: Korbinian Kapsner
		 * @description: updates the group information
		 * @return value: this
		 */
		
		if (this.group && this.group.length > 1){
			this.groupInfo.innerHTML = (this.active + 1) + "&nbsp;/&nbsp;" + this.group.length;
			this.emit("updateGroupInfo");
		}
		else {
			this.groupInfo.innerHTML = "";
		}
		
		return this;
	},
	active: 0,
	next: function next(){
		/**
		 * Function Kightbox.next
		 * @name: Kightbox.next
		 * @author: Korbinian Kapsner
		 * @description: Opens the next member in the current group. If there is
		 *	no current group or the group is empty nothing happens
		 * @return value: this.
		 */
		
		if (this.group && this.group.length){
			this.active += 1;
			if (this.active >= this.group.length){
				this.active = 0;
			}
			this.updateGroupInfo();
			this.openLink(this.group[this.active]);
		}
		
		return this;
	},
	prev: function prev(){
		/**
		 * Function Kightbox.prev
		 * @name: Kightbox.prev
		 * @author: Korbinian Kapsner
		 * @description: Opens the previous member in the current group. If
		 *	there is no current group or the group is empty nothing happens.
		 * @return value: this.
		 */
		
		if (this.group && this.group.length){
			if (this.active <= 0){
				this.active = this.group.length;
			}
			this.active -= 1;
			this.updateGroupInfo();
			this.openLink(this.group[this.active]);
		}
		
		return this;
	},
	
	sourceNotFound: function sourceNotFound(){
		/**
		 * Function Kightbox.sourceNotFound
		 * @name: Kightbox.sourceNotFound
		 * @description: Displays a image indicating that the desired source is
		 *	not found.
		 * @return value: this.
		 */
		
		this.setContent(Kightbox.images.sourceNotFound);
		this.getMinSizeFromContent();
		this.emit("sourceNotFound");
		
		return this;
	},
	wait: function(waitId){
		/**
		 * Function Kightbox.wait
		 * @name: Kightbox.wait
		 * @description: Displays a wait image.
		 * @parameter:
		 *	waitId: identifier for the wait process.
		 * @return value: this.
		 */
		Kightbox.images.wait.waitId = waitId;
		this.setContent(Kightbox.images.wait);
		this.getMinSizeFromContent();
		this.emit("wait");
		
		return this;
	},
	
	overlayOpacity: 0.3,
	isOpen: false,
	open: function open(){
		/**
		 * Function Kightbox.open
		 * @name: Kightbox.open
		 * @description: Opens the Kightbox with current content
		 * @return value: this.
		 */
		
		if (!this.isOpen){
			this.emit("willOpen");
			this.isOpen = true;
			
			// insert and prepare overlay
			css.setSingle(Kightbox.overlay, "opacity", 0);
			document.body.appendChild(Kightbox.overlay);
			css.animate(Kightbox.overlay, {"opacity": this.overlayOpacity});
			
			// insert container
			document.body.appendChild(this.container);
			
			this.emit("open");
		}
		
		return this;
	},
	openNode: function(node, descriptor){
		/**
		 * Function Kightbox.openNode
		 * @name: Kightbox.openNode
		 * @author: Korbinian Kapsner
		 * @description: opens the Kightbox with an node as new content
		 * @parameter:
		 *	node: the node to be displayed.
		 *	descriptor: the descriptor of the new content
		 */
		
		this.open();
		if (typeof node === "string"){
			node = css.$(node)[0];
			if (!node){
				this.sourceNotFound();
			}
		}
		this.updateMeta(descriptor);
		this.setSize(descriptor);
		this.setContent(node.cloneNode(true));
	},
	openImage: function(descriptor, group){
		/**
		 * Function Kightbox.openImage
		 * @name: Kightbox.openImage
		 * @author: Korbinian Kapsner
		 * @description: opens the Kightbox with an images as new content
		 * @parameter:
		 *	descriptor: the descriptor of the new content
		 *	group (optional): group of the content
		 */
		
		if (group){
			var active = group.indexOf(descriptor);
			if (active !== -1){
				this.active = active;
				this.setGroup(group);
			}
		}
		if (typeof descriptor === "string"){
			descriptor = {url: descriptor};
		}
		
		this.open();
		var timer = (new Date()).getTime() + "-" + Math.random();
		this.wait(timer);
		var loadingImage = new Image();
		var This = this;
		loadingImage.onload = function(){
			/* Image onload listsner */
			
			if (This.content.waitId === timer){
				This.updateMeta(descriptor);
				This.setSize({
					width: this.width,
					height: this.height,
					aspectRatio: this.width / this.height
				});
				This.setContent(this);
			}
		};
		loadingImage.onerror = function(){
			/* Image onerror listsner */
			if (This.content.waitId === timer){
				This.sourceNotFound();
			}
		};
		loadingImage.src = descriptor.url;
	},
	openLink: function openLink(descriptor, group){
		/**
		 * Function Kightbox.openLink
		 * @name: Kightbox.openLink
		 * @author: Korbinian Kapsner
		 * @description: opens the Kightbox with new content
		 * @parameter:
		 *	descriptor: the descriptor of the new content
		 *	group (optional): group of the content
		 */
		
		if (group){
			var active = group.indexOf(descriptor);
			if (active !== -1){
				this.active = active;
				this.setGroup(group);
			}
		}
		if (typeof descriptor === "string"){
			descriptor = {url: descriptor};
		}
		
		this.updateMeta(descriptor);
		this.setSize(descriptor);
		
		var hash = descriptor.url.replace(location.href.replace(location.hash, ""), "");
		if (/^#/.test(hash)){
			this.openNode(hash, descriptor);
		}
		else if (/\.(jpg|jpeg|png|gif|bmp|tiff?)$/i.test(descriptor.url)){
			this.openImage(descriptor);
		}
		else {
			this.open();
			this.setContent(node.create({tag: "iframe", src: descriptor.url}));
		}
	},
	close: function close(){
		/**
		 * Function Kightbox.close
		 * @name: Kightbox.close
		 * @description: Closes the Kightbox.
		 * @return value: this.
		 */
		
		if (this.isOpen){
			this.emit("willClose");
			this.isOpen = false;
			css.animate(Kightbox.overlay, {opacity: 0}, {duration: 0.3, onfinish: function(){node.remove(Kightbox.overlay);}});
			this.setSize({width: 0, height: 0}, true);
			node.remove(this.container);
			
			this.emit("close");
		}
		
		return this;
	}
})
.implementStatic({
	overlay: node.create({tag: "div", className: "kkjs_kightbox_overlay"}),
	images: {
		wait: node.create({tag: "div", className: "wait"}),
		sourceNotFound: node.create({tag: "div", className: "sourceNotFound"})
	},
	getDescriptor: function getDescriptor(link){
		/**
		 * Function Kightbox.getDescriptor
		 * @name: Kightbox.getDescriptor
		 * @author: Korbinian Kapsner
		 * @description: Creates a descriptor object for a link
		 * @parameter:
		 *	link: the <a href="..." data-kightbox="{...}">-node
		 * @return value: the descriptor object or false if the link has no
		 *	kightbox description.
		 */
		
		var descriptor = false;
		
		var descriptorText = dataset.get(link, "kightbox");
		if (descriptorText){
			try{
				descriptor = JSON.parse(descriptorText);
			}
			catch(e){
				descriptor = {width: 100, height: 100};
			}
		}
		else {
			descriptorText = link.rel;
			var kightboxRe = /(?:^|\b)kightbox(\{[^\{\}]*\})(?:$|\b)/i;
			Array.prototype.some.call(link.childNodes, function(child){
				if (child.nodeType === 8){
					descriptorText = child.nodeValue;
					return true;
				}
				return false;
			});
			var match;
			if ((match = kightboxRe.exec(descriptorText)) !== null){
				try{
					descriptor = JSON.parse(match[1]);
				}
				catch(e){
					descriptor = {width: 100, height: 100};
				}
			}
		}
		
		if (descriptor){
			descriptor.url = link.href;
		}
		return descriptor;
	},
	init: function init(){
		/**
		 * Function Kightbox.init
		 * @name: Kightbox.init
		 * @author: Korbinian Kapsner
		 * @description: Initialises the kightbox in the document.
		 * @return value: The Kightbox-instance.
		 */
		
		var box = new Kightbox();
		var groups = {};
		Array.prototype.forEach.call(document.links, function(link){
			var descriptor = Kightbox.getDescriptor(link);
			if (descriptor){
				var group = false;
				if (descriptor.group){
					if (!groups[descriptor.group]){
						groups[descriptor.group] = [];
						groups[descriptor.group].name = descriptor.group;
					}
					group = groups[descriptor.group];
					group.push(descriptor);
				}
				event.add(link, "click", function(ev){
					ev.preventDefault();
					if (!group){
						box.deleteGroup();
					}
					box.openLink(descriptor, group);
				});
			}
		});
		
		this.init = function(){
			/* Initialisiation already finished */
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
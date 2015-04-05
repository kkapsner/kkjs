(function(){
"use strict";

/* @name: kkjs.TextareaManager
 * @version: 0.9.1
 * @author: Korbinian Kapsner
 * @description:
 * @parameter:
 *	node:
 */

function preventDefault(ev){
	/**
	 * prevent default function so it can be removed from an event
	 */
	
	ev.preventDefault();
}

kkjs.TextareaManager = kkjs.oo.Base.extend(function TextareaManager(node){
	/**
	 * Constructor TextareaManager
	 * @name: TextareaManager
	 * @author: Korbinian Kapsner
	 * @parameter:
	 *	node: the <textarea> to be managed.
	 */
	
	if (!node || node.nodeName !== "TEXTAREA"){
		throw new ReferenceError("First parameter must be a textarea.");
	}
	this.textarea = node;
	node.kkjsManager = this;
	
	this.nl = kkjs.node.create({tag: "textarea", value: "\n"}).value;
})
.implement({
	setTabSize: function setTabSize(size){
		/**
		 * Function TextareaManager.setTabSize
		 * @name: TextareaManager.setTabSize
		 * @author: Korbinian Kapsner
		 * @description: sets the size of a tabulator.
		 * @parameter:
		 *	size: numbers of spaces a tab should be
		 * @return value: this
		 */
		
		kkjs.css.set(this.textarea, "tabSize", size);
		return this;
	},
	enableTab: function enableTab(){
		/**
		 * Function TextareaManager.enableTab
		 * @name: TextareaManager.enableTab
		 * @author: Korbinian Kapsner
		 * @description: enables tab insertion
		 * @return value: this
		 */
		
		kkjs.event.add.key(this.textarea, "TAB", "down", this.insertTab);
		kkjs.event.add.key(this.textarea, "TAB", "down", preventDefault);
		kkjs.event.add.key(this.textarea, "TAB", "up", preventDefault);
		kkjs.event.add.key(this.textarea, "\t", "press", preventDefault);
		
		return this;
	},
	disableTab: function disableTab(){
		/**
		 * Function TextareaManager.disableTab
		 * @name: TextareaManager.disableTab
		 * @author: Korbinian Kapsner
		 * @description: disables tab insertion
		 * @return value: this
		 */
		
		kkjs.event.remove.key(this.textarea, "TAB", "down", this.insertTab);
		kkjs.event.remove.key(this.textarea, "TAB", "down", preventDefault);
		kkjs.event.remove.key(this.textarea, "TAB", "up", preventDefault);
		kkjs.event.remove.key(this.textarea, "\t", "press", preventDefault);
		
		return this;
	},
	insertTab: function insertTab(){
		/**
		 * Function TextareaManager.insertTab
		 * @name: TextareaManager.insertTab
		 * @author: Korbinian Kapsner
		 * @description: inserts a tab at the current position
		 * @return value: this
		 */
		
		var m = this.kkjsManager? this.kkjsManager: this;
		
		m.insertStringAtSelection("\t");
		
		return this;
	},
	
	enableAutoIndent: function enableAutoIndent(){
		/**
		 * Function TextareaManager.enableAutoIndent
		 * @name: TextareaManager.enableAutoIndent
		 * @author: Korbinian Kapsner
		 * @description: enables auto indentation
		 * @return value: this
		 */
		
		kkjs.event.add.key(this.textarea, "ENTER", "down", this.insertAutoIndent);
		kkjs.event.add.key(this.textarea, "ENTER", "down", preventDefault);
		kkjs.event.add.key(this.textarea, "ENTER", "up", preventDefault);
		kkjs.event.add.key(this.textarea, "\n", "press", preventDefault);
		kkjs.event.add.key(this.textarea, "\r", "press", preventDefault);
		
		return this;
	},
	disableAutoIndent: function disableAutoIndent(){
		/**
		 * Function TextareaManager.disableAutoIndent
		 * @name: TextareaManager.disableAutoIndent
		 * @author: Korbinian Kapsner
		 * @description: disables auto indentation
		 * @return value: this
		 */
		
		kkjs.event.remove.key(this.textarea, "ENTER", "down", this.insertAutoIndent);
		kkjs.event.remove.key(this.textarea, "ENTER", "down", preventDefault);
		kkjs.event.remove.key(this.textarea, "ENTER", "up", preventDefault);
		kkjs.event.remove.key(this.textarea, "\n", "press", preventDefault);
		kkjs.event.remove.key(this.textarea, "\r", "press", preventDefault);
		
		return this;
	},
	insertAutoIndent: function insertAutoIndent(){
		/**
		 * Function TextareaManager.insertAutoIndent
		 * @name: TextareaManager.insertAutoIndent
		 * @author: Korbinian Kapsner
		 * @description: Inserts a line and proper auto indentation break at the
		 *	current position
		 * @return value: this
		 */
		
		var m = this.kkjsManager? this.kkjsManager: this;
		
		var value = m.textarea.value.substring(0, m.getCarretPosition().start);
		var letzteZeile = /([^\n\r]*)$/.exec(value)[1];
		var beginning = /^\s*/.exec(letzteZeile)[0];
		
		m.insertStringAtSelection(m.nl + beginning);
		
		return this;
	},
	
	autoHeightGap: 0,
	enableAutoHeight: function enableAutoHeight(gap){
		/**
		 * Function TextareaManager.enableAutoHeight
		 * @name: TextareaManager.enableAutoHeight
		 * @author: Korbinian Kapsner
		 * @description: enables auto height adjustments of the textarea
		 * @parameter:
		 *	gap (optional): the size (in px) of the gap at the end of the
		 *		textarea
		 * @return value: this
		 */
		
		kkjs.event.add(this.textarea, ["input", "keypress", "resize", "advancedChange"], this.setAutoHeight);
		kkjs.css.set(this.textarea, "overflow", "hidden");
		this.autoHeightGap = parseInt(gap, 10) || 0;
		this.setAutoHeight();
		
		return this;
	},
	disableAutoHeight: function disableAutoHeight(){
		/**
		 * Function TextareaManager.disableAutoHeight
		 * @name: TextareaManager.disableAutoHeight
		 * @author: Korbinian Kapsner
		 * @description: disables auto height adjustments of the textarea
		 * @return value: this
		 */
		
		kkjs.event.remove(this.textarea, ["input", "keypress", "resize", "advancedChange"], this.setAutoHeight);
		kkjs.css.set(this.textarea, "overflow", "");
		
		return this;
	},
	setAutoHeight: function setAutoHeight(){
		/**
		 * Function TextareaManager.setAutoHeight
		 * @name: TextareaManager.setAutoHeight
		 * @author: Korbinian Kapsner
		 * @description: asynchronously adjusts the height of the textarea to
		 *	fit the content.
		 * @return value: this
		 */
		
		var m = this.kkjsManager? this.kkjsManager: this;
		window.setTimeout(
			function(){
				m.textarea.style.marginBottom = m.textarea.offsetHeight + "px";
				m.textarea.style.height = "0px";
				m.textarea.style.height = m.textarea.scrollHeight + m.autoHeightGap + "px";
				m.textarea.style.marginBottom = "";
			},
			0.1
		);
		return this;
	},
	
	insertStringAtSelection: function insertStringAtSelection(str, select){
		/**
		 * Function TextareaManager.insertStringAtSelection
		 * @name: TextareaManager.insertStringAtSelection
		 * @author: Korbinian Kapsner
		 * @description: inserts a string at current position
		 * @parameter:
		 *	str: the string to insert
		 *	select (optional): if the inserted string should be selected
		 * @return value: this
		 */
		
		if (kkjs.DOM.getDocument(this.textarea).selection){
			var range = kkjs.DOM.getDocument(this.textarea).selection.createRange();
			if (range.parentElement() !== this.textarea){
				return this;
			}
			range.text = str;
			if (!select){
				range.collapse(false);
			}
			range.select();
		}
		else {
			var c = this.getCarretPosition();
			if (c){
				this.setStringAtOffset(str, c.start, c.end, true);
				var cEndPos = c.start + str.length;
				var cStartPos = (select)? c.start : cEndPos;
		
				this.setCarretPosition(cStartPos, cEndPos);
			}
		}
		kkjs.event.fireOwn(this.textarea, "input");
		return this;
	},
	getStringAtOffset: function getStringAtOffset(oStart, oEnd){
		/**
		 * Function TextareaManager.getStringAtOffset
		 * @name: TextareaManager.getStringAtOffset
		 * @author: Korbinian Kapsner
		 * @description: extracts a substring from textarea value
		 * @parameter:
		 *	oStart: start of the selection
		 *	oEnd (optional): end of the selection
		 * @return value: the found string
		 */
		
		return this.textarea.value.substring(oStart, oEnd);
	},
	setStringAtOffset: function setStringAtOffset(str, oStart, oEnd, onlyScrollRestore){
		/**
		 * Function TextareaManager.setStringAtOffset
		 * @name: TextareaManager.setStringAtOffset
		 * @author: Korbinian Kapsner
		 * @description: overwrites the value of the textarea at a position
		 * @parameter:
		 *	str: the new string
		 *	oStart: start of the selection to be replaced
		 *	oEnd: end of the selection to be replaced
		 * @return value: this
		 */
		
		this.storePositions();
		this.textarea.value = this.textarea.value.substring(0, oStart) + str + this.textarea.value.substring(oEnd);
		this.restorePositions(onlyScrollRestore);
		return this;
	},
	
	getCarretPosition: function getCarretPosition(){
		/**
		 * Function TextareaManager.getCarretPosition
		 * @name: TextareaManager.getCarretPosition
		 * @author: Korbinian Kapsner
		 * @description: returns the current carret position
		 * @return value: an object with keys "start" and "end"
		 */
		
		if ("selectionStart" in this.textarea){
			return {
				start: this.textarea.selectionStart,
				end: this.textarea.selectionEnd
			};
		}
		if (document.selection){
			var range = kkjs.DOM.getDocument(this.textarea).selection.createRange();
			var range2 = range.duplicate();
			range2.moveToElementText(this.textarea);
			//var range2 = this.textarea.createTextRange();
			
			range2.setEndPoint("EndToStart", range);
			var start = range2.text.length;
			
			range2.setEndPoint("EndToEnd", range);
			var end = range2.text.length;
			
			return {
				start: start,
				end: end
			};
		}
	},
	setCarretPosition: function setCarretPosition(start, end){
		/**
		 * Function TextareaManager.setCarretPosition
		 * @name: TextareaManager.setCarretPosition
		 * @author: Korbinian Kapsner
		 * @description: sets the carret position
		 * @parameter:
		 *	start: start of the carret position
		 *	end (optional): end of the carret position
		 * @return value: this
		 */
		
		if (typeof end === "undefined"){
			end = start;
		}
		if ("selectionStart" in this.textarea){
			this.textarea.selectionStart = start;
			this.textarea.selectionEnd   = end;
		}
		else if (document.selection){
			var range = this.textarea.createTextRange();
			range.collapse();
			range.moveEnd("character", end);
			range.moveStart("character", start);
			range.select();
		}
		
		this.scrollCarretIntoView();
		return this;
	},
	scrollCarretIntoView: function scrollCarretIntoView(){
		/**
		 * Function TextareaManager.scrollCarretIntoView
		 * @name: TextareaManager.scrollCarretIntoView
		 * @author: Korbinian Kapsner
		 * @description: scrolls the textarea that far that the carret is in
		 *	view
		 * @return value: this
		 */
		
		if (this.textarea.createTextRange){
			this.textarea.createTextRange().scrollIntoView();
		}
		else {
			var c = this.getCarretPosition();
			if (c){
				var pos = this.getOffsetBoundaryRect(c.end);
				
				if (this.textarea.scrollTop  + this.textarea.clientHeight < pos[3]){
					this.textarea.scrollTop  = pos[3] - this.textarea.clientHeight;
				}
				if (this.textarea.scrollLeft + this.textarea.clientWidth  < pos[2]){
					this.textarea.scrollLeft = pos[2] - this.textarea.clientWidth ;
				}
				
				if (this.textarea.scrollTop  > pos[1]){
					this.textarea.scrollTop  = pos[1];
				}
				if (this.textarea.scrollLeft > pos[0]){
					this.textarea.scrollLeft = pos[0];
				}
			}
		}
		return this;
	},
	
	getOffsetBoundaryRect: function getOffsetBoundaryRect(offset){
		/**
		 * Function TextareaManager.getOffsetBoundaryRect
		 * @name: TextareaManager.getOffsetBoundaryRect
		 * @author: Korbinian Kapsner
		 * @description: computes the boundary rectangle of the text in the
		 *	textarea up to the offset
		 * @parameter:
		 *	offset: the offset
		 * @return value: array of [left, top, width, height]
		 */
		
		this.createAequivDiv();
		
		this.aequivDiv.style.width = this.textarea.clientWidth + "px";
		var anfang = this.textarea.value.substr(0, offset);
		var ende = (anfang.substring(anfang.length - this.nl.length) === this.nl)? "|": "";
		
		this.aequivDiv.firstChild.innerHTML = ende.encodeHTMLEntities();
		var endeRect = this.aequivDiv.firstChild.getClientRects();
		
		this.aequivDiv.firstChild.innerHTML = (anfang + ende).encodeHTMLEntities();
		var divScroll = {width: this.aequivDiv.scrollWidth, height: this.aequivDiv.scrollHeight};
		var rects = this.aequivDiv.firstChild.getClientRects();
		var offsets = [rects[0].left, rects[0].top];
		
		var pos = [
			rects[rects.length - 1].right - offsets[0] - endeRect[0].right + endeRect[0].left,
			divScroll.height - rects[rects.length - 1].bottom + rects[rects.length - 1].top,
			rects[rects.length - 1].right - offsets[0] + 2 - endeRect[0].right + endeRect[0].left,
			divScroll.height
		];
		return pos;
	},
	
	storePositions: function(){
		/**
		 * Function TextareaManager.storePositions
		 * @name: TextareaManager.storePositions
		 * @author: Korbinian Kapsner
		 * @description: stores the scroll and carret position
		 * @return value: this
		 */
		
		this.storage = {
			scroll: {left: this.textarea.scrollLeft, top: this.textarea.scrollTop},
			carret: this.getCarretPosition()
		};
		return this;
	},
	restorePositions: function(onlyScroll){
		/**
		 * Function TextareaManager.restorePositions
		 * @name: TextareaManager.restorePositions
		 * @author: Korbinian Kapsner
		 * @description: restores the position stored with
		 *	TextareaManager.storePositions().
		 * @parameter:
		 *	onlyScroll (optional): if only the scroll position should be
		 *	restored
		 * @return value: this
		 */
		
		if (this.storage){
			this.textarea.scrollLeft = this.storage.scroll.left;
			this.textarea.scrollTop = this.storage.scroll.top;
			if (!onlyScroll){
				this.setCarretPosition(this.storage.carret.start, this.storage.carret.end);
			}
			this.storage = null;
		}
		return this;
	},
	
	createAequivDiv: function createAequivDiv(forceNew){
		/**
		 * Function TextareaManager.createAequivDiv
		 * @name: TextareaManager.createAequivDiv
		 * @author: Korbinian Kapsner
		 * @description: creates an aequivalent div for measuring
		 * @parameter:
		 *	forceNew: if a new div should be forced.
		 * @return value: this
		 */
		
		if (!this.aequivDiv || forceNew){
			if (this.aeuqivDiv){
				this.deleteAequivDiv();
			}
			this.aequivDiv = kkjs.node.create({
				tag: "div",
				childNodes: [{tag: "span", style: {whiteSpace: "pre-wrap"}}],
				style: kkjs.css.get(this.textarea)
			});
			kkjs.css.set(this.aequivDiv, {height: "0px", overflow: "scroll", width: this.textarea.clientWidth + "px", border: "none", margin: "0", display: "inline-block", position: "fixed", top: "200%"});
			this.textarea.parentNode.insertBefore(this.aequivDiv, this.textarea.nextSibling);
		}
		
		return this;
	},
	deleteAequivDiv: function deleteAequivDiv(){
		/**
		 * Function TextareaManager.deleteAequivDiv
		 * @name: TextareaManager.deleteAequivDiv
		 * @author: Korbinian Kapsner
		 * @description: deletes the div created with
		 *	TextareaManager.createAequivDiv().
		 * @return value: this
		 */
		
		kkjs.node.remove(this.aequivDiv);
		this.aequivDiv = null;
		
		return this;
	}
});
})();
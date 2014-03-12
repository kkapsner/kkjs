(function(){
"use strict";

/* @name: kkjs.TextareaManager
 * @version: 0.9.1
 * @author: Korbinian Kapsner
 * @last modify: 21.12.2010
 * @description:
 * @parameter:
 *	node:
 */

kkjs.TextareaManager = kkjs.oo.Base.extend(function TextareaManager(node){
	if (!kkjs.is.node(node) || node.nodeName !== "TEXTAREA"){
		throw new ReferenceError("First parameter must be a textarea.");
	}
	this.textarea = node;
	node.kkjsManager = this;
	
	this.nl = kkjs.node.create({tag: "textarea", value: "\n"}).value;
})
.implement({
	preventDefault: function preventDefault(ev){
		ev.preventDefault();
	},
	enableTab: function enableTab(){
		kkjs.event.add.key(this.textarea, "TAB", "down", this.insertTab);
		kkjs.event.add.key(this.textarea, "TAB", "up", this.preventDefault);
		kkjs.event.add.key(this.textarea, "\t", "press", this.preventDefault);
	},
	disableTab: function disableTab(){
		kkjs.event.remove.key(this.textarea, "TAB", "down", this.insertTab);
		kkjs.event.remove.key(this.textarea, "TAB", "up", this.preventDefault);
		kkjs.event.remove.key(this.textarea, "\t", "press", this.preventDefault);
	},
	insertTab: function insertTab(ev){
		var m = (kkjs.is.node(this))? this.kkjsManager: this;
		
		m.insertStringAtSelection("\t");
		
		ev.preventDefault();
	},
	
	enableAutoIndent: function enableAutoIndent(){
		kkjs.event.add.key(this.textarea, "ENTER", "down", this.insertAutoIndent);
		kkjs.event.add.key(this.textarea, "ENTER", "up", this.preventDefault);
		kkjs.event.add.key(this.textarea, "\n", "press", this.preventDefault);
		kkjs.event.add.key(this.textarea, "\r", "press", this.preventDefault);
	},
	disableAutoIndent: function disableAutoIndent(){
		kkjs.event.remove.key(this.textarea, "ENTER", "down", this.insertAutoIndent);
		kkjs.event.remove.key(this.textarea, "ENTER", "up", this.preventDefault);
		kkjs.event.remove.key(this.textarea, "\n", "press", this.preventDefault);
		kkjs.event.remove.key(this.textarea, "\r", "press", this.preventDefault);
	},
	insertAutoIndent: function insertAutoIndent(ev){
		var m = (kkjs.is.node(this))? this.kkjsManager: this;
		
		var value = m.textarea.value.substring(0, m.getCarretPosition().start);
		var letzteZeile = /([^\n\r]*)$/.exec(value)[1];
		var beginning = /^\s*/.exec(letzteZeile)[0];
		
		m.insertStringAtSelection(m.nl + beginning);
		ev.preventDefault();
	},
	
	insertStringAtSelection: function insertStringAtSelection(str, select){
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
		return this;
	},
	getStringAtOffset: function getStringAtOffset(oStart, oEnd){
		return this.textarea.value.substring(oStart, oEnd);
	},
	setStringAtOffset: function setStringAtOffset(str, oStart, oEnd, onlyScrollRestore){
		this.storePositions();
		this.textarea.value = this.textarea.value.substring(0, oStart) + str + this.textarea.value.substring(oEnd);
		this.restorePositions(onlyScrollRestore);
		return this;
	},
	
	getCarretPosition: function getCarretPosition(){
		if (kkjs.is.key(this.textarea, "selectionStart")){
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
		if (typeof end === "undefined"){
			end = start;
		}
		if (kkjs.is.key(this.textarea, "selectionStart")){
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
		this.storage = {
			scroll: {left: this.textarea.scrollLeft, top: this.textarea.scrollTop},
			carret: this.getCarretPosition()
		};
		return this;
	},
	restorePositions: function(onlyScroll){
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
		if (!this.aequivDiv || forceNew){
			if (this.aeuqivDiv){
				this.deleteAequivDiv();
			}
			this.aequivDiv = kkjs.node.create({
				tag: "div",
				childNodes: [{tag: "span", style: {whiteSpace: "pre-wrap"}}],
				style: kkjs.css.get(this.textarea)
			});
			kkjs.css.set(this.aequivDiv, {height: "0px", overflow: "scroll", width: this.textarea.clientWidth + "px", border: "none", margin: "0", display: "inline-block"});
			this.textarea.parentNode.insertBefore(this.aequivDiv, this.textarea.nextSibling);
		}
	},
	deleteAequivDiv: function deleteAequivDiv(){
		kkjs.node.remove(this.aequivDiv);
		this.aequivDiv = null;
	},
	// not translated to new Framework
	createLineNumbers: function createLineNumbers(){
		var lN = this.lineNumbers = kkjs.createNode("div", {id: this.textarea.id + "_LineNumbers" + Math.random()}, {border: "1px solid black", backgroundColor: "#DDDDFF", color: "#22AA00", textAlign: "right", padding: this.textarea.clientTop + "px 3px 0px 3px", overflow: "hidden", position: "absolute", top: kkjs.node.getPosition(this.textarea).top + "px"});
		var st = kkjs.css.get(this.textarea, ["lineHeight", "fontSize"]);
		kkjs.setStyle(lN, st);
		lN.style.lineHeight = this.textarea.style.lineHeight = this.lineHeight + "px";
		document.body.appendChild(lN);
		this.updateLineNumbers();
		
		
		
		kkjs.event.add(this.textarea, "scroll", function(){
			this.kkjsManager.lineNumbers.scrollTop = this.scrollTop;
		});
		//lN.kkjsLineNumberTimeout = window.setTimeout(kkjs.bindObj(this, this.updateLineNumbers), 1000);
		kkjs.event.add(this.textarea, "keydown", function(){
			var m = this.kkjsManager;
			if (!m.lineNumbers.kkjsLineNumberTimeout){
				m.lineNumbers.kkjsLineNumberTimeout = window.setTimeout(kkjs.bindObj(m, m.updateLineNumbers), 500);
			}
		});
	},
	updateLineNumbers: function updateLineNumbers(){
		var m = (kkjs.is.node(this))? this.kkjsManager: this;
		m.update(true);
		var HTML = "";
		for (var i = 0; i < m.lines.length; i++){
			HTML += (i + 1) + ":";
			var brs = (m.lines[i].boundaryRect[3] - m.lines[i].boundaryRect[1]) / m.lineHeight;
			for (var j = 0; j < brs; j++){
				HTML += "<br>\n";
			}
		}
		m.lineNumbers.innerHTML = HTML;
		m.lineNumbers.style.height = m.textarea.clientHeight + "px";
		m.lineNumbers.style.left = kkjs.node.getPosition(m.textarea).left - m.lineNumbers.offsetWidth + "px";
		m.lineNumbers.scrollTop = m.textarea.scrollTop;
		m.lineNumbers.kkjsLineNumberTimeout = false;
	},
	
	getDisplayedLines: function getDisplayedLines(lineNr){
		this.createAequivTA();
		this.lines[lineNr].displayedLines = [this.lines[lineNr].value.replace("\n", "")];
		this.aequivTA.value = this.lines[lineNr].displayedLines[0];
		if (this.aequivTA.scrollHeight > this.lineHeight){
			this.aequivTA.value = "";
			var words = [];
			var el;
			while ((el = /[^\s]*\s+|[^\s]+$/g.exec(this.lines[lineNr].value)) !== null){
				words.push(el);
			}
			for (var j = 0; j < words.length; j++){
				this.aequivTA.value += words[j];
				if (this.aequivTA.scrollHeight > this.lineHeight){
					this.aequivTA.value = words[j];
					words[j] = "\n" + words[j];
				}
			}
			
			this.lines[lineNr].displayedLines = words.join("").split("\n");
		}

		var dOffsetStart = this.lines[lineNr].offsetStart;
		var dBoundaryStart = this.lines[lineNr].boundaryRect[1];
		for (var j = 0; j < this.lines[lineNr].displayedLines.length; j++){
			var dL = {
				value: this.lines[lineNr].displayedLines[j],
				length: this.lines[lineNr].displayedLines[j].length,
				offsetStart: dOffsetStart
			};
			dOffsetStart += dL.value.length;
			dL.offsetEnd = dOffsetStart;
			
			this.aequivTA.value = dL.value;
			this.cutAequivTAWidth();
			dL.boundaryRect = [0, dBoundaryStart, this.aequivTA.scrollWidth, dBoundaryStart + this.aequivTA.scrollHeight];
			dBoundaryStart += this.aequivTA.scrollHeight;
			
			this.lines[lineNr].displayedLines[j] = dL;
			this.aequivTA.style.width = this.oWidth;
		}
		
		return this.lines[lineNr].displayedLines;
	},
	getLineNumberOfOffset: function getLineNumberOfOffset(oStart){
		for (var i = 0; i < this.lines.length; i++){
			if (this.lines[i].offsetEnd > oStart){
				return i;
			}
		}
		return this.lines.length - 1;
	},
	getDisplayedLineOfOffset: function getDisplayedLineOfOffset(oStart){
		var line = this.getLineNumberOfOffset(oStart);
		var dL = this.getDisplayedLines(line);
		for (var i = 0; i < dL.length; i++){
			if (dL[i].offsetEnd > oStart){
				return dL[i];
			}
		}
		return dL[dL.length - 1];
	},
	
	setValueFromLines: function setValueFromLines(){
		var scroll = new Array(this.textarea.scrollLeft, this.textarea.scrollTop);
		this.textarea.value = this.lines.join("");
		this.textarea.scrollLeft = scroll[0];
		this.textarea.scrollTop  = scroll[1];
		
		return this;
	},
	insertStringAtOffset: function insertStringAtOffset(str, oStart){
		this.update(true);
		var line = this.getLineNumberOfOffset(oStart);
		var lineOffset = oStart - this.lines[line].offsetStart;
		var nValue = this.lines[line].value.substring(0, lineOffset) + str + this.lines[line].value.substring(lineOffset);
		this.lines[line].value = nValue;
		this.setValueFromLines();
		return this.update(true);
	},
	deleteRange: function deleteRange(oStart, oEnd){
		if (oEnd < oStart){
			return false;
		}
		this.update(true);
		var sLine = this.getLineNumberOfOffset(oStart);
		var eLine = this.getLineNumberOfOffset(oEnd);
		
		var sValue = this.lines[sLine].value.substring(0, oStart - this.lines[sLine].offsetStart);
		var eValue = this.lines[eLine].value.substring(oEnd - this.lines[eLine].offsetStart);
		
		for (var i = sLine; i <= eLine; i++){
			this.lines[i].value = "";
		}
		this.lines[sLine].value = sValue;
		this.lines[eLine].value += eValue;
		this.setValueFromLines();
		return this.update(true);
	},
	
	update: function update(noNewAequivTA){
		if (this.textarea.style.wordWrap === "break-word"){
			throw new Error("TextareaManager can not handle 'word-wrap: break-word'.");
		}
		this.value = this.textarea.value.replace(/\r\n/g, "\n");
		
		this.createAequivTA(noNewAequivTA);
		
		this.lines = this.value.split(/\r?\n/);
		var offsetStart = 0;
		var boundaryStart = 0;
		for (var i = 0; i < this.lines.length; i++){
			this.lines[i] = {
				value: this.lines[i],
				offsetStart: offsetStart,
				toString: function toString(){
					return this.value;
				}
			};
			if (i !== this.lines.length - 1){
				this.lines[i].value += "\n";
			}
			this.lines[i].length = this.lines[i].value.length;
			offsetStart += this.lines[i].length;
			this.lines[i].offsetEnd = offsetStart - 0;
			
			this.aequivTA.value = this.lines[i].value.replace("\n", "");
			this.lines[i].boundaryRect = [0, boundaryStart, this.aequivTA.scrollWidth, boundaryStart + this.aequivTA.scrollHeight];
			boundaryStart = boundaryStart + this.aequivTA.scrollHeight;
		}
		
		return this;
	},
	
	createAequivTA: function createAequivTA(noNew){
		if (kkjs.is.node(this.aequivTA)){
			if (!noNew){
				kkjs.removeNode(this.aequivTA);
			}
		}
		else {
			noNew = false;
		}
		
		if (!noNew){
			this.aequivTA = this.textarea.cloneNode(true);
			kkjs.setStyle(this.aequivTA, {position: "absolute", top: "-10000px", left: "-10000px", visibility: "hidden", height: "0px"});
			this.textarea.parentNode.insertBefore(this.aequivTA, this.textarea.nextSibling);
		}
		this.aequivTA.value = "";
		this.aequivTA.style.width = "0px";
		this.aequivTA.diff = this.aequivTA.offsetWidth - this.aequivTA.clientWidth;
		this.aequivTA.scrollOffset = this.aequivTA.scrollWidth;
		
		this.oWidth = this.aequivTA.style.width = this.textarea.clientWidth + this.aequivTA.diff + "px";
		this.lineHeight = this.aequivTA.scrollHeight;
	},
	deleteAequivTA: function deleteAequivTA(){
		kkjs.removeNode(this.aequivTA);
	},
	cutAequivTAWidth: function cutAequivTaWidth(){
		var w = parseInt(this.aequivTA.style.width, 10);
		var h = this.aequivTA.scrollHeight;
		var schritt = Math.pow(2, Math.floor(Math.log(w)/Math.log(2)));
		while((w = parseInt(this.aequivTA.style.width, 10)) > 0){
			while (w < schritt){
				schritt = schritt/2;
			}
			this.aequivTA.style.width = w - schritt + "px";
			if (this.aequivTA.scrollHeight > h){
				this.aequivTA.style.width = w + "px";
				schritt = schritt/2;
			}
			if (schritt < 1){
				return;
			}
		}
	}
	
	
});
})();
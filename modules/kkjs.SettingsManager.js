(function(){
"use strict";

/**
 * Class kkjs.SettingsManager
 * @name: kkjs.SettingsManager
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @description:
 * @parameter:
 *
 * @used parts of kkj:
 *	kkjs.cookie
 */

kkjs.load.module("cookie");

kkjs.SettingsManager = function(values, id){
	this.value = {};
	this.defaultValue = {};
	this.description = {};
	this.valueNode = {};
	this.valueInput = {};
	this.type = {};
	for (var i in values){
		if (values.hasOwnProperty(i)){
			this.add(i, values[i]);
		}
	}
	this.id = id? id: "SettingsManager";
	return this;
};

kkjs.SettingsManager.prototype = {
	loadCookie: function loadCookie(name){
		var value = kkjs.cookie.getValue(this.id + "_" + name);
		if (kkjs.is["null"](value) || !this.set(name, value)){
			this.value[name] = this.defaultValue[name];
		}
		return this;
	},
	saveCookie: function saveCookie(){
		for (var i in this.value){
			if (this.value.hasOwnProperty(i)){
				kkjs.cookie.setValue(this.id + "_" + i, this.value[i]);
			}
		}
		return this;
	},
	set: function setValue(name, value){
		var change = true;
		switch(this.type[name]){
			case "f":
				if (!value || isNaN(value)){
					change = false;
				}
				value = parseFloat(value);
				break;
			case "i":
				if (!value || isNaN(value)){
					change =  false;
				}
				value = parseInt(value, 10);
				break;
		}
		if (change){
			this.value[name] = value;
			if (typeof this.onchange === "function"){
				this.onchange();
			}
		}
		if (kkjs.is.node(this.valueNode[name])){
			this.valueNode[name].innerHTML = this.value[name];
		}
		if (kkjs.is.node(this.valueInput[name])){
			this.valueInput[name].value = this.value[name];
		}
		return change;
	},
	add: function addValue(name, value){
		this.defaultValue[name] = value["default"];
		this.description[name] = value.description;
		this.type[name] = value.type;
		this.valueNode[name] = value.valueNode;
		this.valueInput[name] = value.valueInput;
		if (kkjs.is.node(this.valueInput[name]) && kkjs.is.key(this.valueInput[name], "value")){
			var This = this;
			this.valueInput[name].onchange = function(){
				This.set(name, this.value);
			};
		}
		else {
			this.valueInput[name] = false;
		}
		
		this.set(name, value["default"]);
		this.loadCookie(name);
		
		return this;
	},
	get: function getValue(name){
		return this.value[name];
	},
	has: function hasValue(name){
		return name in this.value;
	},
	changeForm: false,
	openChangeForm: function(parent){
		if (this.changeForm){
			return;
		}
		var tBody = kkjs.node.create({
			tag: "tBody",
			childNodes: [
				{
					tag: "tr",
					childNodes: [
						{tag: "th", innerHTML: "Beschreibung"},
						{tag: "th", innerHTML: "Wert"}
					]
				}
			]
		});
		var table = kkjs.node.create({
			tag:"table",
			className: "SettingsChangeForm",
			childNodes: [
				tBody
			]
		});
		
		var tr;
		for (var i in this.value){
			if (this.value.hasOwnProperty(i)){
				if (kkjs.is.node(this.valueInput[i])){
					continue;
				}
				tr = kkjs.node.create({
					tag: "tr",
					childNodes: [
						{tag: "td", innerHTML: this.description[i]},
						{
							tag: "td",
							childNodes: [
								{
									tag: "input",
									value: this.value[i],
									name: i,
									settingsManager: this,
									onchange: function(){
										this.settingsManager.set(this.name, this.value);
										this.value = this.settingsManager.get(this.name);
									}
								}
							]
						}
					]
				});
				tBody.appendChild(tr);
			}
		}
		
		tr = kkjs.node.create({
			tag: "tr",
			childNodes: [
				{
					tag: "td",
					style: {textAlign: "center"},
					childNodes: [
						{
							tag: "input", value: "schließen", type: "button", settingsManager: this,
							onclick: function(){
								this.settingsManager.closeChangeForm();
							}
						}
					]
				},
				{
					tag: "td",
					style: {textAlign: "center"},
					childNodes: [
						{
							tag: "input", value: "speichern", type: "button", settingsManager: this,
							onclick: function(){
								this.settingsManager.saveCookie();
								this.settingsManager.closeChangeForm();
							}
						}
					]
				}
			]
		});
		tBody.appendChild(tr);
		
		this.changeForm = table;
		
		parent.appendChild(table);
		if (typeof this.onchangeformopen){
			this.onchangeformopen();
		}
	},
	closeChangeForm: function(){
		if (this.changeForm){
			this.changeForm.parentNode.removeChild(this.changeForm);
		}
		this.changeForm = false;
		if (typeof this.onchangeformclose){
			this.onchangeformclose();
		}
	}
};

})();
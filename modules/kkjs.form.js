(function(){
"use strict";

/**
 * Object kkjs.form
 * @name: kkjs.form
 * @author: Korbinian Kapsner
 * @description:
 */

var ajax = require("kkjs.ajax");
var setDefault = require("kkjs.setDefault");
if (setDefault.setDefault){
	setDefault = setDefault.setDefault;
}

var form = {
	
	/**
	 * Object form.ajax
	 * @name: form.ajax
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: provides some ajax + formular functionality
	 */
	
	ajax: {
		/**
		 * Function form.ajax.send
		 * @name: form.ajax.send
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description:
		 * @parameter:
		 *	form:
		 *	att:
		 * @return value:
		 */
		
		send: function sendForm(formNode, att){
			att = setDefault(att, {
				url: formNode.getAttribute("action"),
				type: formNode.getAttribute("method"),
				clickedButton: setDefault.spacer,
				asynch: false
			});
			
			if (att.type.toLowerCase() === "get"){
				att.url = att.url.replace(/[\?#].*$/, "") + "?" + form.ajax.getElementsQueryString(formNode, att.clickedButton);
			}
			else {
				att.send = form.ajax.getElementsQueryString(formNode, att.clickedButton);
			}
			
			return ajax.advanced(att);
		},
		
		/**
		 * Function form.ajax.simpleSend
		 * @name: form.ajax.simpleSend
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description:
		 * @parameter:
		 *	form:
		 *	funktion:
		 * @return value:
		 */
		
		simpleSend: function simpleSendForm(formNode, funktion){
			return form.ajax.send(formNode, {onload: funktion});
		},
		
		/**
		 * Function form.ajax.getElementsQueryObject
		 * @name: form.ajax.getElementsQueryObject
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: traverses all Elements of the formular and creates a query-object
		 * @parameter:
		 *	form
		 * @return value: the query-object
		 */
		
		getElementsQueryObject: function getFormElementsQueryObject(form, clickedButton){
			var el = form.elements, e;
			var query = {};
			for (var i = 0; i < el.length; i++){
				e = el[i];
				if (e.name){
					switch (e.type){
						case undefined:
						case "file":
						case "reset":
							break;
						case "submit":
						case "image":
						case "button":
						case "radio":
						case "checkbox":
							if (!e.checked && e !== clickedButton){
								break;
							}
						default:
							if (query[e.name]){
								if (Array.isArray(query[e.name])){
									query[e.name].push(e.value);
								}
								else {
									query[e.name] = [query[e.name], e.value];
								}
							}
							else {
								query[e.name] = e.value;
							}
					}
				}
			}
			return query;
		},
		
		/**
		 * Function form.ajax.getElementsQueryString
		 * @name: form.ajax.getElementsQueryString
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: traverses all Elements of the formular and creates a query-string
		 * @parameter:
		 *	form
		 * @return value: the query-string
		 */
		
		getElementsQueryString: function getFormElementsQueryString(formNode, clickedButton){
			var qObject = form.ajax.getElementsQueryObject(formNode, clickedButton);
			var query = [];
			for (var i in qObject){
				if (Array.isArray(qObject[i])){
					var arr = qObject[i].slice(0);
					for (var j = 0; j < arr.length; j++){
						arr[j] = encodeURIComponent(i) + "=" + encodeURIComponent(arr[j]);
					}
					query.push(arr.join("&"));
				}
				else {
					query.push(encodeURIComponent(i) + "=" + encodeURIComponent(qObject[i]));
				}
			}
			return query.join("&");
		}
	},
	
	submit: function(att){
		att = kkjs.setDefault(att, {
			values: {},
			url: "",
			method: "POST",
			target: "_blank"
		});
		var children = [];
		for (var name in att.values){
			if (att.values.hasOwnProperty(name)){
				var value = att.values[name];
				if (Array.isArray(value)){
					value.forEach(function(value){
						children.push({
							tag: "textarea",
							value: value,
							name: name
						});
					});
				}
				else {
					children.push({
						tag: "textarea",
						value: value,
						name: name
					});
				}
			}
		}
		var form = kkjs.node.create({
			tag: "form",
			onsubmit: function(){
				if (this.parentNode){
					this.parentNode.removeChild(this);
				}
			},
			style: {display: "none"},
			childNodes: children,
			action: att.url,
			method: att.method,
			target: att.target
		});
		
		document.body.appendChild(form);
		form.submit();
	}
};

kkjs.form = form;

}).apply();
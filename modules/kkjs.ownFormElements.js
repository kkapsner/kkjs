(function(){
"use strict";

kkjs.event.onWindowLoad(function(){
	kkjs.$("<head>")[0].appendChild(kkjs.node.create({
		tag: "link",
		type: "text/css",
		rel: "stylesheet",
		href: kkjs.url.css + "ownFormElements.css"
	}));
	kkjs.css.$("input").forEach(function(inp){
		switch (inp.type){
			case "checkbox":
				inp.style.display = "none";
				var parent = inp.parentNode;
				var hasLabelParent = false;
				while (parent){
					if (parent.nodeName === "LABEL"){
						hasLabelParent = true;
						break;
					}
					parent = parent.parentNode;
				}
				var sp = kkjs.node.create({
					tag: "span",
					checkbox: inp,
					/*onclick: function(ev){/*
						if (inp.disabled){
							return;
						}
						ev = ev || event;
						ev.returnValue  = false;
						ev.cancelBubble = true;
						if (ev.preventDefault){
							ev.preventDefault();
						}
						if (ev.stopPropagation){
							ev.stopPropagation();
						}
						this.checkbox.checked = !this.checkbox.checked;
						this.update();
					},*/
					update: function(){
						/**/
						this.className = "ownCheckbox" + (this.checkbox.checked? " checked": "");
					}
				});
				kkjs.event.add(inp, "change", sp.update.bind(sp));
				sp.update();
				if (!hasLabelParent){
					var label = kkjs.node.create({
						tag: "label",
						childNodes: [sp]
					});
					inp.parentNode.replaceChild(label, inp);
					label.appendChild(inp);
				}
				else {
					inp.parentNode.insertBefore(sp, inp);
				}
				break;
			case "select":
				break;
			case "radio":
				break;
		}
	});
});

})();
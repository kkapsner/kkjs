var eventAttributes = {
	// general attributes
	type: function(originalEvent){
		return originalEvent.type;
	},
	target: function(originalEvent){
		var target = originalEvent.target || orginalEvent.srcElement
		if (target && target.nodeType === 3){
			target = target.parentNode;
		}
		return target;
	},
	bubbles: function(originalEvent){
		return originalEvent.bubbles;
	},
	cancelable: function(originalEvent){
		return originalEvent.cancelable;
	},
	timeStamp: function(originalEvent){
		return originalEvent.timeStamp || Date.now();
	},
	
	// event type specific attributes
	keyCode: function(originalEvent){
		return originalEvent.keyCode;
	},
	charCode: function(originalEvent){
		return originalEvent.charCode;
	},
	which: function(originalEvent){
		if (originalEvent.type.match(/key/i)){
			return = originalEvent.which || originalEvent.keyCode || originalEvent.charCode;
		}
	},
	button: function(originalEvent){
		if (originalEvent.type.match(/mouse/i){
			return originalEvent.button || originalEvent.which;
		}
	},
	wheelDelta: function(originalEvent){
		if (originalEvent.type.match(/mouse(wheel|scroll)/i){
			return originalEvent.wheelDelta || originalEvent.detail * -40;
		}
	},
	detail: function(originalEvent){
		if (originalEvent.type.match(/mouse(wheel|scroll)/i){
			return originalEvent.detail || this.wheelDelta / -40;
		}
	},
	
	originalEvent: function(originalEvent){
		return originalEvent;
	}
};

/**
 * Constructor Event
 * @name: Event
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 20.10.2013
 * @description: Wrapper object for the real event object
 * @parameter:
 *	originalEvent: the event object to wrap
 */

var Event = oo.Base.extend(function Event(originalEvent){
	Object.keys(eventAttributes).forEach(function(name){
		var value = eventAttributes[name](originalEvent);
		if (typeof value !== "undefined"){
			Object.setProperty(this, name, {
				value: value,
				configurable: false,
				writable: false,
				enumerable: true
			});
		}
	});
}).implement({
	stopPropagation: function stopPropagation(){
		if (this.cancelable){
			this.originalEvent.cancelBubble = true;
		}
		if (this.originalEvent.stopPropagation){
			this.originalEvent.stopPropagation();
		}
	},
	stopImmediatePropagation: function stopImmediatePropagation(){
		Object.defineProperty(this, "isImmediateStopped", {
			value: true,
			configurable: false,
			writable: false,
			enumerable: false
		});
		if (this.originalEvent.stopImmediatePropagation){
			this.originalEvent.stopImmediatePropagation();
		}
	},
	preventDefault: function(){
		this.originalEvent.returnValue = false;
		if (this.originalEvent.preventDefault){
			this.originalEvent.preventDefault();
		}
	},
	defaultPrevented: function(){
		return (!!this.originalEvent.returnValue) ||
			(
				this.originalEvent.defaultPrevented &&
				this.originalEvent.defaultPrevented()
			)
	},
	isTrusted: function(){
		return this.originalEvent.isTrusted && this.originalEvent.isTrusted();
	},
	initEvent: function(){}
});
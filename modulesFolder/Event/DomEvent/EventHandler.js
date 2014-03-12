/**
 * Constructor EventHandler
 * @name: EventHandler
 * @version: 1.0
 * @author: Korbinian Kapsner
 * @last modify: 20.10.2013
 * @description: Wrapper object to handle the events
 * @parameter:
 *	node: the node to handle
 */

var EventHandler = oo.Base.extend(function EventHandler(node){
	this._events = {};
	this.node = node;
}).implement({
	getAllEvents: function(type){
		return this._events[type] || [];
	},
	addEvent: function(type, func){
		// if we have no EventListener do nothing
		if (
			typeof func.call !== "function" ||
			typeof func.handleEvent !== "function"
		){
			return this;
		}
		
		// if listener is already added
		if (this.getEventIndex(type, func) !== false){
			return this;
		}
		
		// if this is the first listener of that event-type
		if (!(type in this._events)){
			this._events[type] = [];
			this._events[type].func = (function(eventObj){
				var currRet, ret = null;
				if (this._events[type]){
					var event = new Event(eventObj || event);
					Object.defineProperty(event, "currentTarget", {
						value: this.node,
						configurable: false,
						writable: false,
						enumerable: true
					});
					event.currentTaget = this.node;
					
					this._events[type].slice(0).forEach(function(listener){
						if (event.isImmediateStopped){
							return;
						}
						try {
							currRet = (
								listener.call ||
								listener.handleEvent.call
							)(this.node, event);
						}
						catch (e){
							if (window.console && window.console.error){
								window.console.error(e.message);
								window.console.log(e);
							}
						}
						if (currRet !== null){
							if (ret === null){
								ret = currRet;
							}
							else {
								ret = ret && currRet;
							}
						}
					});
				}
				return ret;
			}).bind(this);
			addEvent(this.node, type, this._events[type].func);
		}
		
		// add listener to the right collection
		this._events[type].push(func);
		
		return this;
	},
	removeEvent: function(type, func){
		if (this._events[type]){
			
			var i = this.getEventIndex(type, func);
			if (i !== false){
				this._events[type].splice(i, 1);
			}
			
			// if no EventListener remains
			if (!this._events[type].length){
				removeEvent(this.node, type, this._events[type].func);
				delete this._events[type];
			}
		}
		return this;
	},
	getEventIndex: function(type, func){
		var functs = this._events[type];
		if (functs){
			for (var i = functs.length - 1; i >= 0; i -= 1){
				if (
					functs[i] === func ||
					// if the FunctionWrapper-Interface is present
					(functs[i].equal && functs[i].equal(func))
				){
					return i;
				}
			}
		}
		return false;
	}
}).implementStatic({
	has: function hasHandler(node){
		return !!node["kkjs:eventHandler"];
	},
	get: function getHandler(node){
		if (!node["kkjs:eventHandler"]){
			node["kkjs:eventHandler"] = new EventHandler(node);
		}
		return node["kkjs:eventHandler"];
	}
})
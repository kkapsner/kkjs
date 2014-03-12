(function(){

"use strict";

/**
 * Object EventRendezvous
 * @name: EventRendezvous
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: EventRendezvous description
 */

var EventEmitter = require("kkjs.EventEmitter");

var EventRendezvous = EventEmitter.extend(function EventRendezvous(){
	this.participants = [];
}).implement({
	addParticipant: function(emitter, type){
		var This = this;
		var index = this.participants.length;
		this.participants.push({
			emitter: emitter,
			type: type,
			hit: false,
			func: function(){
				This.hit(emitter, type, index);
			}
		});
		emitter.on(type, this.participants[index].func);
	},
	reset: function(){
		this.participants.forEach(function(m){
			m.hit = false;
		});
	},
	hit: function(emitter, type, index){
		if (typeof index !== "undefined"){
			this.participants[index].hit = true;
		}
		else {
			this.participants.every(function(m){
				if (m.emitter === emitter && m.type === type){
					m.hit = true;
					return false;
				}
				return true;
			});
		}
		if (this.participants.every(function(m){
			return m.hit;
		})){
			this.reset();
			this.emit("rendezvous");
		}
	}
});

if (typeof exports !== "undefined"){
	module.exports = EventRendezvous;
}
else if (typeof kkjs !== "undefined"){
	kkjs.EventRendezvous = EventRendezvous;
}

})();
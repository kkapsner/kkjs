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
	/**
	 * Class EventRendezvous
	 * @name: EventRendezvous
	 * @description: Constructor for an EventRendezvous.
	 */
	
	this.participants = [];
}).implement({
	addParticipant: function(emitter, type){
		/**
		 * Function EventRendezvous.addParticipant
		 * @name: EventRendezvous.addParticipant
		 * @description: adds an emitter with a specific event to the rendezvous
		 * @parameter:
		 *	emitter: emitter that is part of the rendezvous.
		 *	type: type of the event the emitter should emit.
		 * @return value: this
		 */
		
		var This = this;
		var index = this.participants.length;
		this.participants.push({
			emitter: emitter,
			type: type,
			hit: false,
			func: function(){
				/**
				 * Concrete eventlistener
				 */
				
				This.hit(emitter, type, index);
			}
		});
		emitter.on(type, this.participants[index].func);
		return this;
	},
	reset: function(){
		/**
		 * Function EventRendezvous.reset
		 * @name: EventRendezvous.reset
		 * @description: clears all states if a participant already fired
		 * @return value: this
		 */
		
		this.participants.forEach(function(m){
			m.hit = false;
		});
		return this;
	},
	hit: function(emitter, type, index){
		/**
		 * Function EventRendezvous.hit
		 * @name: EventRendezvous.hit
		 * @description: function to be called if a participant hit the
		 *	rendezvous. This function should not be used by hand.
		 * @parameter:
		 *	emitter: emitter that hit the rendezvous.
		 *	type: type of the event the emitter hit.
		 *	index (optional): index in the participants list
		 */
		
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
(function(){
"use strict";

this.simulation = this.oo.Base.extend(function(param){
	for (var i in param){
		if (param.hasOwnProperty(i)){
			this[i] = param[i];
		}
	}
	this.run();
}.setDefaultParameter(0, new Function.DefaultParameter({
	position: [0, 0],
	center: [0, 0],
	velocity: [0, 0],
	mass: 10,
	k: 5,
	y: 1,
	dt: 0.04,
	onBeforeRun: function(){},
	onRun: function(){},
	force: function(){
		/* Default force function */
		return [
			this.k * (this.center[0] - this.position[0]) - this.y * this.velocity[0],
			this.k * (this.center[1] - this.position[1]) - this.y * this.velocity[1]
		];
	}
}))
.implement({
	stop: function(){
		/**
		 * Function Simulation.stop
		 * @name: Simulation.stop
		 * @description: Stops the simulation.
		 */
		
		window.clearTimeout(this.timeout);
	},
	run: function(){
		/**
		 * Function Simulation.run
		 * @name: Simulation.run
		 * @description: Starts the simulation.
		 */
		
		this.onBeforeRun();
		var f = this.force();
		
		this.velocity[0] += f[0]*this.dt/this.mass;
		this.velocity[1] += f[1]*this.dt/this.mass;
		
		this.position[0] += this.velocity[0]*this.dt;
		this.position[1] += this.velocity[1]*this.dt;
		
		this.timeout = window.setTimeout(this.run.bind(this), this.dt * 1000);
		this.onRun();
	}
});

}).call(kkjs);
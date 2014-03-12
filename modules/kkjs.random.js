(function(){
"use strict";

/**
 * Object random
 * @name: random
 * @author: Korbinian Kapsner
 * @description: provides advanced random functionality
 */

var rand = Math.random;
var random = {
	/**
	 * Function random.inRange
	 * @name: random.inRange
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: returns a number between lower (including) and upper (excluding)
	 * @parameter:
	 *	lower:
	 *	upper:
	 */
	
	inRange: function randomInRange(lower, upper){
		return lower + rand()*(upper - lower);
	},
	
	/**
	 * Function random.gauss
	 * @name: random.inRange
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: returns random numbers according to a normal distribution. The polar method is used.
	 * @parameter:
	 *	mu: mean of the distribution
	 *	sigma2: variance of the 
	 */
	gauss: function randomGauss(mu, sigma2){
		var u1, u2, p, q;
		do {
			u1 = random.inRange(-1, 1);
			u2 = random.inRange(-1, 1);
			q = u1 * u1 + u2 * u2;
		} while (q > 1);
		p = Math.sqrt(-2* Math.log(q)/q);
		return sigma2 * u1 * p + mu;
	},
	
	/**
	 * Object random.integer
	 * @name: random.integer
	 * @author: Korbinian Kapsner
	 * @description: integers only
	 */
	integer: {
		/**
		 * Function random.integer.inRange
		 * @name: random.integer.inRange
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: returns an int between lower and upper (including both)
		 * @parameter:
		 *	lower:
		 *	upper:
		 */
		inRange: function randomIntInRange(lower, upper){
			return Math.floor(random.inRange(lower, upper + 1));
		}
	},
	
	/**
	 * Object random.array
	 * @name: random.array
	 * @author: Korbinian Kapsner
	 * @description: integers only
	 */
	array: {
		/**
		 * Function random.array.shuffle
		 * @name: random.array.shuffle
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: shuffles the provided array
		 * @parameter:
		 *	array:
		 */
		shuffle: function shuffleArray(arr){
			for (var i = arr.length; i--;){
				var sIndex = random.integer.inRange(0, i);
				var h = arr[i];
				arr[i] = arr[sIndex];
				arr[sIndex] = h;
			}
			return arr;
		}
	}
};

if (typeof exports !== "undefined"){
	for (var i in random){
		if (random.hasOwnProperty(i)){
			exports[i] = random[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.random = random;
}

})();
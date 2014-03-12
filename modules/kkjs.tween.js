(function(){
"use strict";

/**
 * Object kkjs.tweens
 * @author: Korbinian Kapsner
 * @name: kkjs.tweens
 * @version: 1.0
 * @description: Klasse zur Realisierung von Animationen durch Angabe von Anfangs- und Endpunkt einer Bewegung
 */

kkjs.tweens = {
	/**
	 * Function kkjs.tweens.inverse
	 * @author: Korbinian Kapsner
	 * @name: kkjs.tweens.inverse
	 * @version: 1.0
	 * @description: gibt die inverse Übergangsfunktion zurück
	 * @parameter:
	 *	f: Übergangsfunktion
	 * @used parts of kkjs:
	 * @return: die inverse Funktion
	 */
	inverse: function(f){
		if (!f){
			f = kkjs.tweens.quadratic;
		}
		return function(p){
			return 1 - f(1 - p);
		};
	},
	
	/**
	 * Function kkjs.tweens.mirror
	 * @author: Korbinian Kapsner
	 * @name: kkjs.tweens.mirror
	 * @version: 1.0
	 * @description: gibt eine Funktion zurück, die eigentlich 2 Übergänge hintereinander hat(bei p = 0.5 Änderung) - zuerst die gegebene Übergangsfunktion, dann das Inverse davon
	 * @parameter:
	 *	f: Übergangsfunktion
	 * @used parts of kkjs:
	 * @return: die gespiegelte Funktion
	 */
	mirror: function(f){
		if (!f){
			f = kkjs.tweens.quadratic;
		}
		var inv = kkjs.tweens.inverse(f);
		return function(p){
			if (p <= 0.5){
				return f(p * 2) / 2;
			}
			else {
				return 0.5 + inv((p - 0.5) * 2) / 2;
			}
		};
	},
	
	
	/**
	 * Functions kkjs.tweens.*
	 * @author: Korbinian Kapsner
	 * @name: kkjs.tweens.*
	 * @version: 1.0
	 * @description: Übergangsfunktionen
	 * @parameter:
	 *	p: Position des Übergangs (in [0, 1])
	 * @used parts of kkjs:
	 * @return: Übergangskoordinatenposition (in [0, 1])
	 */
	linear: function(p){
		return p;
	},
	quadratic: function(p){
		return p * p;
	},
	easeInOut: function(p){
		if (p <= 0.5){
			return p * p * 2;
		}
		else {
			return 1 - 2 * (1 - p) * (1 - p);
		}
	},
	sinus: function(p){
		return p - Math.sin(p * 2 * Math.PI) / 2 / Math.PI;
	},
	cosinus: function(p){
		return (1 - Math.cos(Math.PI * p))/ 2;
	},
	acosinus: function(p){
		return (1 - Math.acos(p * 2 - 1)/Math.PI);
	},
	ellipse1: function(p){
		return Math.sin(p * Math.PI / 2);
	},
	ellipse2: function(p){
		return 1 - Math.cos(p * Math.PI / 2);
	},
	bounceSinus: function(p){
		p *= 2.5 * Math.PI;
		return 1 - Math.abs(Math.cos(p)*Math.exp(-0.5*p));
	},
	bounce: function(p){
		var sqrt04 = 0.6324555320;
		var a = 3.39;
		var anteil = 0;
		if (p*a < 1){
			anteil = 1 - p*p*a*a;
		}
		else if(p*a < 1 + 2*sqrt04){
			anteil = 0.4 - Math.pow(p*a  - 1 - sqrt04, 2);
		}
		else if(p*a < 1 + 2*sqrt04 + 2*0.4){
			anteil = 0.16 - Math.pow(p*a  - 1 - 2*sqrt04 - 0.4, 2);
		}
		else {
			anteil = 0.0256 - Math.pow(p*a  - 1 - 2*sqrt04 - 2*0.4 - 0.16, 2);
		}
		
		return 1 - anteil;
	},
	swing: function(p){
		p *= 2.5 * Math.PI;
		return 1 - (Math.cos(p)*Math.exp(-0.5*p));
	},
	exponential: function(p){
		return (Math.exp(p) - 1)/(Math.E - 1);
	},
	sigmoidal: function(p){
		if (p === 1){
			return 1;
		}
		if (p === 0){
			return 0;
		}
		var x = Math.log(1 - p);
		var mitte = 1;
		p = 1;
		var a = 6;
		for (var i = 0; i < a; i++){
			p *= x;
			mitte *= Math.LN2;
		}
		return p/(mitte+p);
	}
};
})();
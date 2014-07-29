(function(){

"use strict";

/**
 * prototype-extension for String
 *
 **/

var utf16 = require("./kkjs.utf16");

String.prototype.firstToUpperCase = function firstToUpperCase(restToLowerCase){
	/**
	 * Function String.prototype.firstToUpperCase
	 * @name: String.prototype.firstToUpperCase
	 * @version: 1.0
	 * @author: Korbinian Kapsner
	 * @last modify: 12.04.2012
	 * @description: Macht den ersten Buchstaben zu einem Großbuchstaben
	 * @parameter:
	 *	restToLowerCase: Boolean, ob der Rest in Kleinbuchstaben umgewandelt werden soll
	 *
	 */
	
	var str;
	if (restToLowerCase){
		str = this.toLowerCase();
	}
	else {
		str = this;
	}
	return str.charAt(0).toUpperCase() + str.substring(1);
};

String.prototype.firstToLowerCase = function firstToLowerCase(){
	/**
	 * Function String.prototype.firstToLowerCase
	 * @name: String.prototype.firstToLowerCase
	 * @version: 1.0
	 * @author: Korbinian Kapsner
	 * @last modify: 12.04.2012
	 * @description: Macht den ersten Buchstaben zu einem Kleinbuchstaben
	 * @parameter:
	 *
	 */
	
	return this.charAt(0).toLowerCase() + this.substring(1);
};

String.prototype.reverse = function reverse(block){
	/**
	 * Function String.prototype.reverse
	 * @name: String.prototype.reverse
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description: dreht den String um
	 * @parameter:
	 *	block: Größe der "Umdrehblöcke" z.B. ("hilfe").reverse(2) == "feilh"
	 *
	 */
	
	if (!block){
		block = 1;
	}
	var ret = "";
	for (var i = this.length - block; i >= 0; i -= block){
		ret += this.substr(i, block);
	}
	if (i !== block*-1){
		ret += this.substr(0, -i);
	}
	return ret;
};

String.prototype.translate = function translate(from, to){
	/**
	 * Function String.prototype.translate
	 * @name: String.prototype.translate
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 11.04.2012
	 * @description: This function returns a copy of the string , translating all occurrences of each character in from to the corresponding character in to .
	 * @parameter:
	 *	from:
	 *	to:
	 *
	 */
	
	var ret = "";
	for (var i = 0; i < this.length; i++){
		var chr = this.charAt(i);
		if (from.indexOf(chr) !== -1){
			chr = to.charAt(from.indexOf(chr));
		}
		ret += chr;
	}
	return ret;
};

String.prototype.quoteRegExp = function quoteRegExp(){
	/**
	 * Function String.prototype.quoteRegExp
	 * @name: String.prototype.quoteRegExp
	 * @author: Korbinian Kapsner
	 * @description: escapes all special characters for a RegExp.
	 * @return value: the quoted string
	 */
	
	return this.replace(/([\\\+\*\?\[\^\]\$\(\)\{\}\=\!\|\.])/g, "\\$1");
};

String.prototype.repeat = function repeat(x){
	/**
	 * Function String.prototype.repeat
	 * @name: String.prototype.repeat
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description: returns a string x times the original string
	 * @parameter:
	 *	x:
	 *
	 */
	
	var ret = "";
	for (var i = 0; i < x; i++){
		ret += this;
	}
	return ret;
};

String.prototype.decodeHTMLentities = String.prototype.decodeHTMLEntities = (function(){
	var HTMLentities =  {
		Acirc: 194, acirc: 226, acute: 180, AElig: 198, aelig: 230, Agrave: 192,
		agrave: 224, alefsym: 8501, Alpha: 913, alpha: 945, amp: 38, and: 8743,
		ang: 8736, apos: 39, Aring: 197, aring: 229, asymp: 8776, Atilde: 195,
		atilde: 227, Auml: 196, auml: 228, bdquo: 8222, Beta: 914, beta: 946,
		brvbar: 166, bull: 8226, cap: 8745, Ccedil: 199, ccedil: 231, cedil: 184,
		cent: 162, Chi: 935, chi: 967, circ: 710, clubs: 9827, cong: 8773,
		copy: 169, crarr: 8629, cup: 8746, curren: 164, Dagger: 8225,
		dagger: 8224, dArr: 8659, darr: 8595, deg: 176, Delta: 916, delta: 948,
		diams: 9830, divide: 247, Eacute: 201, eacute: 233, Ecirc: 202,
		ecirc: 234, Egrave: 200, egrave: 232, empty: 8709, emsp: 8195, ensp: 8194,
		Epsilon: 917, epsilon: 949, equiv: 8801, Eta: 919, eta: 951, ETH: 208,
		eth: 240, Euml: 203, euml: 235, euro: 8364, exist: 8707, fnof: 402,
		forall: 8704, frac12: 189, frac14: 188, frac34: 190, frasl: 8260,
		Gamma: 915, gamma: 947, ge: 8805, gt: 62, hArr: 8660, harr: 8596,
		hearts: 9829, hellip: 8230, Iacute: 205, iacute: 237, Icirc: 206,
		icirc: 238, iexcl: 161, Igrave: 204, igrave: 236, image: 8465,
		infin: 8734, int: 8747, Iota: 921, iota: 953, iquest: 191, isin: 8712,
		Iuml: 207, iuml: 239, Kappa: 922, kappa: 954, Lambda: 923, lambda: 955,
		lang: 9001, laquo: 171, lArr: 8656, larr: 8592, lceil: 8968, ldquo: 8220,
		le: 8804, lfloor: 8970, lowast: 8727, loz: 9674, lrm: 8206, lsaquo: 8249,
		lsquo: 8216, lt: 60, macr: 175, mdash: 8212, micro: 181, middot: 183,
		minus: 8722, Mu: 924, mu: 956, nabla: 8711, nbsp: 160, ndash: 8211,
		ne: 8800, ni: 8715, not: 172, notin: 8713, nsub: 8836, Ntilde: 209,
		ntilde: 241, Nu: 925, nu: 957, Oacute: 211, oacute: 243, Ocirc: 212,
		ocirc: 244, OElig: 338, oelig: 339, Ograve: 210, ograve: 242, oline: 8254,
		Omega: 937, omega: 969, Omicron: 927, omicron: 959, oplus: 8853, or: 8744,
		ordf: 170, ordm: 186, Oslash: 216, oslash: 248, Otilde: 213, otilde: 245,
		otimes: 8855, Ouml: 214, ouml: 246, para: 182, part: 8706, permil: 8240,
		perp: 8869, Phi: 934, phi: 966, Pi: 928, pi: 960, piv: 982, plusmn: 177,
		pound: 163, Prime: 8243, prime: 8242, prod: 8719, prop: 8733, Psi: 936,
		psi: 968, quot: 34, radic: 8730, rang: 9002, raquo: 187, rArr: 8658,
		rarr: 8594, rceil: 8969, rdquo: 8221, real: 8476, reg: 174, rfloor: 8971,
		Rho: 929, rho: 961, rlm: 8207, rsaquo: 8250, rsquo: 8217, sbquo: 8218,
		Scaron: 352, scaron: 353, sdot: 8901, sect: 167, shy: 173, Sigma: 931,
		sigma: 963, sigmaf: 962, sim: 8764, spades: 9824, sub: 8834, sube: 8838,
		sum: 8721, sup: 8835, sup1: 185, sup2: 178, sup3: 179, supe: 8839,
		szlig: 223, Tau: 932, tau: 964, there4: 8756, Theta: 920, theta: 952,
		thetasym: 977, thinsp: 8201, THORN: 222, thorn: 254, tilde: 732,
		times: 215, trade: 8482, Uacute: 218, uacute: 250, uArr: 8657, uarr: 8593,
		Ucirc: 219, ucirc: 251, Ugrave: 217, ugrave: 249, uml: 168, upsih: 978,
		Upsilon: 933, upsilon: 965, Uuml: 220, uuml: 252, weierp: 8472, Xi: 926,
		xi: 958, Yacute: 221, yacute: 253, yen: 165, Yuml: 376, yuml: 255,
		Zeta: 918, zeta: 950, zwj: 8205, zwnj: 8204
	};
	return function decodeHTMLentities(){
		/**
		 * Function String.prototype.decodeHTMLentities
		 * @name: String.prototype.decodeHTMLentities
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 04.08.2009
		 * @description: replaces all HTML-entities by there normal characters
		 * @parameter:
		 *
		 */
		
		return this.replace(/&([^;]+);/g, function(m, c){
			if (HTMLentities.hasOwnProperty(c)){
				return utf16.fromCharCode(HTMLentities[c]);
			}
			if (/^#\d+$/.test(c)){
				return utf16.fromCharCode(parseInt(c.substring(1), 10));
			}
			if (/^#x[a-f0-9]+$/i.test(c)){
				return utf16.fromCharCode(parseInt(c.substring(2), 16));
			}
			return "&" + c + ";";
		});
	};
}());

String.prototype.encodeHTMLentities = String.prototype.encodeHTMLEntities = function encodeHTMLentities(){
	/**
	 * Function String.prototype.encodeHTMLentities
	 * @name: String.prototype.encodeHTMLentities
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 11.04.2012
	 * @description: replaces all special characters by there HTML-entities
	 * @parameter:
	 *
	 */
	
	return this.replace(/((?:[^\t\n\r\x21-\x7E]|["'<>&])+)/ig, function(m, c){
		return utf16.toCharCodeArray(c).reduce(function(str, code){
			return str + "&#" + code + ";";
		}, "");
	});
};


/**
 * Take some fuctions from Array.prototype
 */

["forEach", "some", "every", "reduce", "reduceRight", "indexOf", "lastIndexOf"].forEach(function(name){
	if (!(name in String.prototype)){
		String.prototype[name] = Array.prototype[name];
	}
});

})();
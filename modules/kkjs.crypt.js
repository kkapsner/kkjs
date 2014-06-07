/*jshint bitwise: false*/
(function(){
"use strict";

/**
 * Object crypt
 * @name crypt
 * @author Korbinian Kapsner
 * @version 1.0
 * @description some crypt-function
 *
 */

function int32(n){
	/* Nur die ersten 32 Bit stehen lassen und das Problem mit den negativen Zahlen umgehen (0xFFFFFFFF >> 1 === -1; 0xFFFFFFFF >>> 1 === 0x7FFFFFFF und -1 >>> 0 === 0xFFFFFFFF) */
	return ((n & 0xFFFFFFFF) >>> 0);
}

function leftRotate(a, n){
	/* rotates a by n bit left */
	a = int32(a);
	return int32(int32(a<<n) | int32(a>>>(32-n)));
}

function rightRotate(a, n){
	/* rotates a by n bit right */
	return leftRotate(a, 32 - n);
}

function toHex(n, anzahl){
	/* hex representation of a number */
	var ret = n.toString(16);
	while (ret.length < anzahl){
		ret = "0" + ret;
	}
	return ret;
}

function reverse(str, block){
	/* reverses the string */
	if (!block){
		block = 1;
	}
	var ret = "";
	for (var i = str.length - block; i >= 0; i -= block){
		ret += str.substr(i, block);
	}
	if (i !== block*-1){
		ret += str.substr(0, -i);
	}
	return ret;
}

// function toBigEndian(nr){
	/* generate the big endien byte representation of the number */
	// return String.fromCharCode(
		// (0xFF000000 & nr) >>> 24,
		// (0x00FF0000 & nr) >>> 16,
		// (0x0000FF00 & nr) >>> 8,
		// (0x000000FF & nr) >>> 0
	// );
// }

function toLittleEndian(nr){
	/* generate the little endien byte representation of the number */
	return String.fromCharCode(
		(0x000000FF & nr) >>> 0,
		(0x0000FF00 & nr) >>> 8,
		(0x00FF0000 & nr) >>> 16,
		(0xFF000000 & nr) >>> 24
	);
}

var crypt = {
	"do": function doCrypt(str, salt){
		/**
		 * Function crypt.do
		 * @name: crypt.do
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 04.08.2009
		 * @description:
		 * @parameter:
		 *	str:
		 *	salt:
		 */
	
		if (!salt){
			salt = "$1$" + crypt.md5((new Date()).toGMTString() + Math.random).substring(0, 8) + "$";
		}
		var teile = salt.split("$");
		switch (teile[1]){
			case "1":
				return crypt.md5(teile[2] + str);
			case "2":
				return crypt.sha1(teile[2] + str);
			case "apr1":
				return crypt.apr1(str, salt);
		}
	},
	
	sha1: function sha1(str){
		/**
		 * Function crypt.sha1
		 * @name: crypt.sha1
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 04.08.2009
		 * @description:
		 * @parameter:
		 *	str:
		 *
		 */


		// Algorithmus aus http://de.wikipedia.org/wiki/Secure_Hash_Algorithm
		
		// Byteweises einlesen des Eingabestrings
		var btes = [];
		for (var i = 0; i < str.length; i++){
			var chr = str.charCodeAt(i);
			while (chr > 255){
				var helpChr = chr;
				var rot = 0;
				while (helpChr > 255){
					helpChr >>= 8;
					rot++;
				}
				btes.push(helpChr);
				chr = chr & ((1<<(rot*8)) - 1);
			}
			btes.push(chr);
		}
		
		var h0 = 0x67452301;
		var h1 = 0xEFCDAB89;
		var h2 = 0x98BADCFE;
		var h3 = 0x10325476;
		var h4 = 0xC3D2E1F0;
		
		var messageBitLength = btes.length * 8;
		btes.push(0x80);
		while(btes.length % 64 !== 56){
			btes.push(0);
		}
		
		var lengthBytes = [];
		for (var i = 0; i < 8; i++){
			var bte = messageBitLength & 255;
			lengthBytes.push(bte);
			messageBitLength >>>= 8;
		}
		//Aus little Endian big Endian machen und anhaengen
		for (var i = 7; i >= 0; i--){
			btes.push(lengthBytes[i]);
		}
		
		for (var i = 0; i < btes.length; i += 64){
			var w = new Array(16);
			for (var j = 0; j < 16; j++){
				w[j] = int32(
						int32(btes[i + 0 + (j*4)] << 24) |
						int32(btes[i + 1 + (j*4)] << 16) |
						int32(btes[i + 2 + (j*4)] << 8 ) |
						int32(btes[i + 3 + (j*4)] << 0 )
					);
			}
			for (var j = 16; j < 80; j++){
				w[j] = leftRotate(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
			}
			
			var a = h0;
			var b = h1;
			var c = h2;
			var d = h3;
			var e = h4;
			
			var f, k;
			for (var j = 0; j < 80; j++){
				if (j < 20){
					//f = int32(int32(b & c) | int32(int32(~b) & d)); // Originalverarbeitung
					f = int32(d ^ int32(b & int32(c ^ d)));
					k = 0x5A827999;
				}
				else if (j < 40){
					f = int32(int32(b ^ c) ^ d);
					k = 0x6ED9EBA1;
				}
				else if (j < 60){
					f = int32(int32(b & c) | int32(b & d) | int32(c & d));
					k = 0x8F1BBCDC;
				}
				else {
					f = int32(int32(b ^ c) ^ d);
					k = 0xCA62C1D6;
				}
				
				var temp = int32(leftRotate(a, 5) + f + e + k + w[j]);
				e = d;
				d = c;
				c = leftRotate(b, 30);
				b = a;
				a = temp;
			}
			
			h0 = int32(h0 + a);
			h1 = int32(h1 + b);
			h2 = int32(h2 + c);
			h3 = int32(h3 + d);
			h4 = int32(h4 + e);
		}
		
		return toHex(h0, 8) + toHex(h1, 8) + toHex(h2, 8) + toHex(h3, 8) + toHex(h4, 8);
	},
	
	md5: function md5(str, rawOutput){
		/**
		 * Function crypt.md5
		 * @name: crypt.md5
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 04.08.2009
		 * @description:
		 * @parameter:
		 *	str:
		 *
		 */
		
		// Algorithmus aus http://de.wikipedia.org/wiki/Message-Digest_Algorithm_5
		
		var btes;
		if (typeof str === "string" || str instanceof String){
			// Byteweises einlesen des Eingabestrings
			btes = [];
			for (var i = 0; i < str.length; i++){
				var chr = str.charCodeAt(i);
				while (chr > 255){
					var helpChr = chr;
					var rot = 0;
					while (helpChr > 255){
						helpChr >>= 8;
						rot++;
					}
					btes.push(helpChr);
					chr = chr & ((1<<(rot*8)) - 1);
				}
				btes.push(chr);
			}
		}
		else {
			btes = Array.prototype.slice.call(str);
		}
		
		
		var r = [
			 7, 12, 17, 22,  7, 12, 17, 22,  7, 12,
			17, 22,  7, 12, 17, 22,  5,  9, 14, 20,
			 5,  9, 14, 20,  5,  9, 14, 20,  5,  9,
			14, 20,  4, 11, 16, 23,  4, 11, 16, 23,
			 4, 11, 16, 23,  4, 11, 16, 23,  6, 10,
			15, 21,  6, 10, 15, 21,  6, 10, 15, 21,
			 6, 10, 15, 21
		];
		/*
		var bitLength = 0xFFFFFFFF + 1;
		var k = new Array(64);
		for (var i = 0; i < 64; i++){
			k[i] = int32(Math.floor(Math.abs(Math.sin(i + 1) * bitLength)));
		}
		/* Nachfolgende Zeile koennte vielleicht etwas performanter sein, da nichts berechnet werden muss - das Ergebnis ist das selbe.*/
		var k = [
			0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf,
			0x4787c62a, 0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af,
			0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e,
			0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
			0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6,
			0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8,
			0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122,
			0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
			0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039,
			0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244, 0x432aff97,
			0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d,
			0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
			0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
		];
		
		var h0 = 0x67452301;
		var h1 = 0xEFCDAB89;
		var h2 = 0x98BADCFE;
		var h3 = 0x10325476;
		
		var messageBitLength = btes.length * 8;
		btes.push(0x80);
		while(btes.length % 64 !== 56){
			btes.push(0);
		}
		
		for (var i = 0; i < 8; i++){
			var bte = messageBitLength & 255;
			btes.push(bte);
			messageBitLength >>>= 8;
		}
		
		for (var i = 0; i < btes.length; i += 64){
			var w = new Array(16);
			for (var j = 0; j < 16; j++){
				w[j] = int32(
						int32(btes[i + 3 + (j*4)] << 24) |
						int32(btes[i + 2 + (j*4)] << 16) |
						int32(btes[i + 1 + (j*4)] << 8 ) |
						int32(btes[i + 0 + (j*4)] << 0 )
					);
			}
			
			var a = h0;
			var b = h1;
			var c = h2;
			var d = h3;
			
			var f, g;
			for (var j = 0; j < 64; j++){
				if (j < 16){
					//f = int32(int32(b & c) | int32(int32(~b) & d)); // Originalverarbeitung
					f = int32(d ^ int32(b & int32(c ^ d)));
					g = j;
				}
				else if (j < 32){
					//f = int32(int32(b & d) | int32(c & int32(~d))); // Originalverarbeitung
					f = int32(c ^ int32(d & int32(b ^ c)));
					g = (5*j + 1) % 16;
				}
				else if (j < 48){
					f = int32(int32(b ^ c) ^ d);
					g = (3*j + 5) % 16;
				}
				else {
					f = int32(c ^ int32(b | int32(~ d)));
					g = (7*j) % 16;
				}
				var temp = d;
				d = c;
				c = b;
				b = int32(leftRotate(a + f + k[j] + w[g], r[j]) + b);
				a = temp;
			}
			
			h0 = int32(h0 + a);
			h1 = int32(h1 + b);
			h2 = int32(h2 + c);
			h3 = int32(h3 + d);
		}
		
		if (rawOutput){
			return toLittleEndian(h0) +
				toLittleEndian(h1) +
				toLittleEndian(h2) +
				toLittleEndian(h3)
			;
		}
		else {
			return reverse(toHex(h0, 8), 2) + reverse(toHex(h1, 8), 2) + reverse(toHex(h2, 8), 2) + reverse(toHex(h3, 8), 2);
		}
	},
	
	sha256: function sha256(str){
		/**
		 * Function crypt.sha256
		 * @name: crypt.sha256
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 04.08.2009
		 * @description:
		 * @parameter:
		 *	str:
		 */
		

		// Algorithmus aus http://en.wikipedia.org/wiki/SHA_hash_functions#SHA-256_.28a_SHA-2_variant.29_pseudocode
		
		
		// Byteweises einlesen des Eingabestrings
		var btes = [];
		for (var i = 0; i < str.length; i++){
			var chr = str.charCodeAt(i);
			while (chr > 255){
				var helpChr = chr;
				var rot = 0;
				while (helpChr > 255){
					helpChr >>= 8;
					rot++;
				}
				btes.push(helpChr);
				chr = chr & ((1<<(rot*8)) - 1);
			}
			btes.push(chr);
		}
		
		var h0 = 0x6a09e667;
		var h1 = 0xbb67ae85;
		var h2 = 0x3c6ef372;
		var h3 = 0xa54ff53a;
		var h4 = 0x510e527f;
		var h5 = 0x9b05688c;
		var h6 = 0x1f83d9ab;
		var h7 = 0x5be0cd19;
		
		var k = new Array(
		   0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
		   0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
		   0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
		   0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
		   0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
		   0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
		   0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
		   0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2);
		
		var messageBitLength = btes.length * 8;
		btes.push(0x80);
		while(btes.length % 64 !== 56){
			btes.push(0);
		}
		
		var lengthBytes = [];
		for (var i = 0; i < 8; i++){
			var bte = messageBitLength & 255;
			lengthBytes.push(bte);
			messageBitLength >>>= 8;
		}
		//Aus little Endian big Endian machen und anhaengen
		for (var i = 7; i >= 0; i--){
			btes.push(lengthBytes[i]);
		}
		
		for (var i = 0; i < btes.length; i += 64){
			var w = new Array(16);
			for (var j = 0; j < 16; j++){
				w[j] = int32(
						int32(btes[i + 0 + (j*4)] << 24) |
						int32(btes[i + 1 + (j*4)] << 16) |
						int32(btes[i + 2 + (j*4)] << 8 ) |
						int32(btes[i + 3 + (j*4)] << 0 )
					);
			}
			for (var j = 16; j < 64; j++){
				var s0 = rightRotate(w[j-15], 7) ^ rightRotate(w[j-15], 18) ^ (w[j-15] >>> 3);
				var s1 = rightRotate(w[j-2], 17) ^ rightRotate(w[j-2], 19) ^ (w[j-2] >>> 10);
				w[j] = int32(w[j-16] + s0 + w[j-7] + s1);
			}
			
			var a = h0;
			var b = h1;
			var c = h2;
			var d = h3;
			var e = h4;
			var f = h5;
			var g = h6;
			var h = h7;
			
			for (var j = 0; j < 64; j++){
				var s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
				var maj = int32(a & b) ^ int32(a & c) ^ int32(b & c);
				var t2 = int32(s0 + maj);
				var s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
				var ch = int32(e & f) ^ int32(int32(~ e) & g);
				var t1 = int32(h + s1 + ch + k[j] + w[j]);
				
				h = g;
				g = f;
				f = e;
				e = int32(d + t1);
				d = c;
				c = b;
				b = a;
				a = int32(t1 + t2);
			}
			
			h0 = int32(h0 + a);
			h1 = int32(h1 + b);
			h2 = int32(h2 + c);
			h3 = int32(h3 + d);
			h4 = int32(h4 + e);
			h5 = int32(h5 + f);
			h6 = int32(h6 + g);
			h7 = int32(h7 + h);
		}
		
		return toHex(h0, 8) + toHex(h1, 8) + toHex(h2, 8) + toHex(h3, 8) + toHex(h4, 8) + toHex(h5, 8) + toHex(h6, 8) + toHex(h7, 8);
	}
};

if (typeof exports !== "undefined"){
	for (var i in crypt){
		if (crypt.hasOwnProperty(i)){
			exports[i] = crypt[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.crypt = crypt;
}

})();
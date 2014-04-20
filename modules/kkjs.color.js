(function(){
"use strict";

var sprintf = require("kkjs.sprintf");

/**
 * Object color
 * @name: color
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: provides some color-functions
 */

var color = {
	rgbStringRE: /^\s*rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/,
	mix: function mix(c1, c2, ratio, type){
		/**
		 * Function color.mix
		 * @name: color.mix
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 12.9.2011
		 * @description: mischt zwei farben
		 * @parameter:
		 *	c1: Farbe 1 in hex-Repräsentierung
		 *	c2: Farbe 2 in hex-Repräsentierung
		 *	ratio: Mischungsverhältnis (0: 100% c1; 1: 100% c2)
		 *	type: in welcher Repräsentierung numerisch gemischt werden soll (default: "rgb")
		 * @return value: Mischfarbe in hex-Repräsentierung
		 */
		
		if (ratio < 0 ){
			ratio = 0;
		}
		if (ratio > 1){
			ratio = 1;
		}
		function m(p){
			/**
			 * Mixing
			 */
			
			return (1 - ratio) * c1[p] + ratio * c2[p];
		}
		function h(){
			/**
			 * Hue mixing.
			 */
			
			if (c1.s === 0 || c1.l === 100 || c1.l === 0 || c1.v === 0){
				return c2.h;
			}
			if (c2.s === 0 || c2.l === 100 || c2.l === 0 || c2.v === 0){
				return c1.h;
			}
			if (Math.abs(c1.h - c2.h) > 180){
				c1.h += (c1.h > c2.h? -1: 1) * 360;
			}
			return m("h");
		}
		switch (type){
			case "hsl":
				c1 = color.hexToHsl(c1);
				c2 = color.hexToHsl(c2);
				return color.rgbToHex(
					color.hslToRgb(
						h(), m("s"), m("l")
					)
				);
			case "hsv":
				c1 = color.hexToHsv(c1);
				c2 = color.hexToHsv(c2);
				return color.rgbToHex(
					color.hsvToRgb(
						h(), m("s"), m("v")
					)
				);
			default:
				c1 = color.hexToRgb(c1);
				c2 = color.hexToRgb(c2);
				return color.rgbToHex(
						m("r"), m("g"), m("b")
				);
				
		}
	},
	
	hexToRgb: function hexToRgb(str){
		/**
		 * Function color.hexToRGB
		 * @name: color.hexTorGB
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 13.10.2009
		 * @description: wandelt eine hexadecimale Farbe (z.B. #88AF20) in eine rgb-Farbe um (return als Objekt mit Instanzen r, g und b)
		 * @parameter:
		 *	str:
		 */
		
		str = str.toString();
		if (str.charAt(0) === "#"){
			if (str.length === 7){
				return {
					r: parseInt(str.substring(1,3), 16),
					g: parseInt(str.substring(3,5), 16),
					b: parseInt(str.substring(5,7), 16)
				};
			}
			else if (str.length === 4){
				return {
					r: parseInt(str.substring(1,2), 16) * 17,
					g: parseInt(str.substring(2,3), 16) * 17,
					b: parseInt(str.substring(3,4), 16) * 17
				};
			}
			else {
				return false;
			}
		}
		else {
			return false;
		}
	},
	
	hexToHsl: function hexToHsl(str){
		/**
		 * Function color.hexToHsl
		 * @name: color.hexToHsl
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 13.10.2009
		 * @description: wandelt eine Hexfarbe in eine HSL-Farbe um (retrun als Objekt mit Instanzen h, s und l)
		 * @parameter:
		 *	str:
		 */
		
		var farbe = color.hexToRgb(str);
		if (farbe){
			var MAX = [0, ""];
			var MIN = [1, ""];
			for (var att in farbe){
				if (farbe.hasOwnProperty(att)){
					farbe[att] = farbe[att]/255;
					if (farbe[att] >= MAX[0]){
						MAX[0] = farbe[att];
						MAX[1] = att;
					}
					if (farbe[att] <= MIN[0]){
						MIN[0] = farbe[att];
						MIN[1] = att;
					}
				}
			}
			var diff = MAX[0]-MIN[0];
			var h = 0;
			if (MAX[0] !== MIN[0]){
				if (MAX[1] === "r"){
					h = 60*(farbe.g-farbe.b)/diff;
				}
				if (MAX[1] === "g"){
					h = 60*(2+(farbe.b-farbe.r)/diff);
				}
				if (MAX[1] === "b"){
					h = 60*(4+(farbe.r-farbe.g)/diff);
				}
				if (h < 0){
					h += 360;
				}
			}
			var l = (MAX[0] + MIN[0])/2;
			var s = (MAX[0] === MIN[0])? 0 : ((l <= 0.5)? 100* diff / 2 / l: 100 * diff / (2 - 2 * l));
			return {h: h, s: s, l: l * 100};
		}
		else {
			return false;
		}
	},
	
	hexToHsv: function hexToHsv(str){
		/**
		 * Function color.hexToHsv
		 * @name: color.hexToHsv
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 13.10.2009
		 * @description: wandelt eine Hexfarbe in eine HSV-Farbe um (retrun als Objekt mit Instanzen h, s und v)
		 * @parameter:
		 *	str:
		 */
		
		var farbe = color.hexToRgb(str);
		if (farbe){
			var MAX = [0, ""];
			var MIN = [1, ""];
			for (var att in farbe){
				if (farbe.hasOwnProperty(att)){
					farbe[att] = farbe[att]/255;
					if (farbe[att] >= MAX[0]){
						MAX[0] = farbe[att];
						MAX[1] = att;
					}
					if (farbe[att] <= MIN[0]){
						MIN[0] = farbe[att];
						MIN[1] = att;
					}
				}
			}
			var diff = MAX[0]-MIN[0];
			var h = 0;
			if (MAX[0] !== MIN[0]){
				if (MAX[1] === "r"){
					h = 60*(farbe.g-farbe.b)/diff;
				}
				if (MAX[1] === "g"){
					h = 60*(2+(farbe.b-farbe.r)/diff);
				}
				if (MAX[1] === "b"){
					h = 60*(4+(farbe.r-farbe.g)/diff);
				}
				if (h<0){
					h = h+360;
				}
			}
			var s = (MAX[0] === 0)? 0 : 100*diff/MAX[0];
			var v = 100*MAX[0];
			return {h: h, s: s, v: v};
		}
		else {
			return false;
		}
	},
	
	rgbStringToHex: function rgbStringToHex(str){
		/**
		 * Function color.rgbStringToHex
		 * @name: color.rgbStringToHex
		 * @version: 1.0
		 * @author: Korbinian Kapsner
		 * @last modify: 13.10.2009
		 * @description: wandelt eine einen RGB-String (z.B: "rgb(255, 10, 0)") in eine Hexzahl um
		 * @parameter:
		 *	str:
		 */
		
		str = str.toString();
		var m;
		if ((m = str.match(color.rgbStringRE)) !== null){
			return color.rgbToHex(m[1], m[2], m[3]);
		}
		else {
			return false;
		}
	},
	
	rgbToHex: function rgbToHex(r, g, b){
		/**
		 * Function color.rgbToHex
		 * @name: color.rgbToHex
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 13.10.2009
		 * @description: gitb die Farbe mit Rotwert r, Grünwert g und Blauwert b als Hexfarbe zurück
		 * @parameter:
		 *	r:
		 *	g:
		 *	b:
		 */
		
		if (typeof r === "object" && !g && ! b){
			g = r.g; b = r.b; r = r.r;
		}
		function parse(v){
			/**
			 * Generates an integer between 0 and 255.
			 */
			
			v = Math.round(parseFloat(v));
			if (v < 0){
				v = 0;
			}
			if (v > 255){
				v = 255;
			}
			return v;
		}
		return sprintf("#%02X%02X%02X", parse(r), parse(g), parse(b));
	},
	
	hslToRgb: function hslToRgb(h, s, l){
		/**
		 * Function color.hslToRgb
		 * @name: color.hslToRgb
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 13.10.2009
		 * @description: wandelt eine HSL-Farbe in eine RGB-farbe um (es ist auch ein Übergabewert for der Gestallt der Rückgabe von hexToHSL möglich)
		 * @parameter:
		 *	h:
		 *	s:
		 *	l:
		 */
		 
		if (typeof(h) === "object" && !s && !l){
			l = h.l; s = h.s; h = h.h;
		}
		while (h < 0){
			h += 360;
		}
		while (h > 360){
			h -= 360;
		}
		l = l/100; s = s/100;
		var q = (l < 0.5)? l * (1 + s): l + s - (l * s);
		var p = 2 * l - q;
		var hk = h/360;
		var t = {
			r: hk + 1/3,
			g: hk,
			b: hk - 1/3
		};
		var ret = {};
		
		for (var c in t){
			if (t.hasOwnProperty(c)){
				if (t[c] < 0){
					t[c] += 1;
				}
				if (t[c] > 1){
					t[c] -= 1;
				}
				if		(t[c] < 1/6)	{ret[c] = p + ((q - p) * 6 * t[c]);}
				else if	(t[c] < 1/2)	{ret[c] = q;}
				else if	(t[c] < 2/3)	{ret[c] = p + ((q - p) * 6 * (2/3 - t[c]));}
				else					{ret[c] = p;}
				
				ret[c] *= 255;
			}
		}
		
		return ret;
	},
	
	hsvToHex: function hsvToHex(h, s, v){
		/**
		 * Function color.hsvToHex
		 * @name: color.hsvToHex
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 13.10.2009
		 * @description: wandelt eine HSV-Farbe in eine Hexfarbe um (es ist auch ein Übergabewert von der Gestallt der Rückgabe von hexToHSV möglich)
		 * @parameter:
		 *	h:
		 *	s:
		 *	v:
		 */
		 
		if (typeof(h) === "object" && !s && !v){
			v = h.l; s = h.s; h = h.h;
		}
		while (h < 0){
			h += 360;
		}
		while (h > 360){
			h -= 360;
		}
		v = v/100; s = s/100;
		var hHelp = parseInt(h/60, 10) % 6;
		var f = h/60 - hHelp;
		var p = v*(1-s);
		var q = v*(1-s*f);
		var t = v*(1-s*(1-f));
		//alert(h+", "+s+", "+v+", "+hHelp+", "+f+", "+p+", "+q+","+t);
		switch (hHelp){
			case 0:
				return color.rgbToHex(v*255,t*255,p*255);
			case 1:
				return color.rgbToHex(q*255,v*255,p*255);
			case 2:
				return color.rgbToHex(p*255,v*255,t*255);
			case 3:
				return color.rgbToHex(p*255,q*255,v*255);
			case 4:
				return color.rgbToHex(t*255,p*255,v*255);
			case 5:
				return color.rgbToHex(v*255,p*255,q*255);
		}
		return false;
	}
	
};

color.hex = {
	toRgb: color.hexToRgb,
	toHsl: color.hexToHsl,
	toHsv: color.hexToHsv
};

color.rgb = {
	toHex: color.rgbToHex,
	toHsl: function(r, g, b){ return color.hex.toHsl(color.rgbToHex(r, g, b));},
	toHsv: function(r, g, b){ return color.hex.toHsv(color.rgbToHex(r, g, b));},
	
	complementary: function complementaerfarbe(r, g, b){
		/**
		 * Function color.rgb.complementary
		 * @name: color.rgb.complementary
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 13.10.2009
		 * @description: gibt die Komplementärfarbe einer Hexfarbe zurück
		 * @parameter:
		 *	r:
		 *	g:
		 *	b:
		 */
		
		if (typeof r === "object" && !g && ! b){
			g = r.g; b = r.b; r = r.r;
		}
		return {
			r: 255 - r,
			g: 255 - g,
			b: 255 - b
		};
	}
};

color.hsl = {
	toHex: function(h, s, l){ return color.rgb.toHex(color.hslToRgb(h, s, l));},
	toRgb: color.hslToRgb,
	toHsv: function(h, s, l){ return color.rgb.toHsv(color.hslToRgb(h, s, l));}
};

color.hsv = {
	toHex: color.hsvToHex,
	toRgb: function(h, s, v){ return color.hex.toRgb(color.hsvToHex(h, s, v));},
	toHsl: function(h, s, v){ return color.hex.toHsl(color.hsvToHex(h, s, v));}
};

color.names = {
	"aliceblue": "#f0f8ff", "antiquewhite": "#faebd7", "aqua": "#00ffff", "aquamarine": "#7fffd4", "azure": "#f0ffff",
	"beige": "#f5f5dc", "bisque": "#ffe4c4", "black": "#000000", "blanchedalmond": "#ffebcd", "blue": "#0000ff", "blueviolet": "#8a2be2", "brown": "#a52a2a", "burlywood": "#deb887",
	"cadetblue": "#5f9ea0", "chartreuse": "#7fff00", "chocolate": "#d2691e", "coral": "#ff7f50", "cornflowerblue": "#6495ed", "cornsilk": "#fff8dc", "crimson": "#dc143c", "cyan": "#00ffff",
	"darkblue": "#00008b", "darkcyan": "#008b8b", "darkgoldenrod": "#b8860b", "darkgray": "#a9a9a9", "darkgreen": "#006400", "darkgrey": "#a9a9a9", "darkkhaki": "#bdb76b", "darkmagenta": "#8b008b", "darkolivegreen": "#556b2f", "darkorange": "#ff8c00", "darkorchid": "#9932cc", "darkred": "#8b0000", "darksalmon": "#e9967a", "darkseagreen": "#8fbc8f", "darkslateblue": "#483d8b", "darkslategray": "#2f4f4f", "darkslategrey": "#2f4f4f", "darkturquoise": "#00ced1", "darkviolet": "#9400d3", "deeppink": "#ff1493", "deepskyblue": "#00bfff", "dimgray": "#696969", "dimgrey": "#696969", "dodgerblue": "#1e90ff",
	"firebrick": "#b22222", "floralwhite": "#fffaf0", "forestgreen": "#228b22", "fuchsia": "#ff00ff",
	"gainsboro": "#dcdcdc", "ghostwhite": "#f8f8ff", "gold": "#ffd700", "goldenrod": "#daa520", "gray": "#808080", "green": "#008000", "greenyellow": "#adff2f", "grey": "#808080",
	"honeydew": "#f0fff0", "hotpink": "#ff69b4",
	"indianred": "#cd5c5c", "indigo": "#4b0082", "ivory": "#fffff0",
	"khaki": "#f0e68c",
	"lavender": "#e6e6fa", "lavenderblush": "#fff0f5", "lawngreen": "#7cfc00", "lemonchiffon": "#fffacd", "lightblue": "#add8e6", "lightcoral": "#f08080", "lightcyan": "#e0ffff", "lightgoldenrodyellow": "#fafad2", "lightgray": "#d3d3d3", "lightgreen": "#90ee90", "lightgrey": "#d3d3d3", "lightpink": "#ffb6c1", "lightsalmon": "#ffa07a", "lightseagreen": "#20b2aa", "lightskyblue": "#87cefa", "lightslategray": "#778899", "lightslategrey": "#778899", "lightsteelblue": "#b0c4de", "lightyellow": "#ffffe0", "lime": "#00ff00", "limegreen": "#32cd32", "linen": "#faf0e6",
	"magenta": "#ff00ff", "maroon": "#800000", "mediumaquamarine": "#66cdaa", "mediumblue": "#0000cd", "mediumorchid": "#ba55d3", "mediumpurple": "#9370db", "mediumseagreen": "#3cb371", "mediumslateblue": "#7b68ee", "mediumspringgreen": "#00fa9a", "mediumturquoise": "#48d1cc", "mediumvioletred": "#c71585", "midnightblue": "#191970", "mintcream": "#f5fffa", "mistyrose": "#ffe4e1", "moccasin": "#ffe4b5",
	"navajowhite": "#ffdead", "navy": "#000080",
	"oldlace": "#fdf5e6", "olive": "#808000", "olivedrab": "#6b8e23", "orange": "#ffa500", "orangered": "#ff4500", "orchid": "#da70d6",
	"palegoldenrod": "#eee8aa", "palegreen": "#98fb98", "paleturquoise": "#afeeee", "palevioletred": "#db7093", "papayawhip": "#ffefd5", "peachpuff": "#ffdab9", "peru": "#cd853f", "pink": "#ffc0cb", "plum": "#dda0dd", "powderblue": "#b0e0e6", "purple": "#800080",
	"red": "#ff0000", "rosybrown": "#bc8f8f", "royalblue": "#4169e1",
	"saddlebrown": "#8b4513", "salmon": "#fa8072", "sandybrown": "#f4a460", "seagreen": "#2e8b57", "seashell": "#fff5ee", "sienna": "#a0522d", "silver": "#c0c0c0", "skyblue": "#87ceeb", "slateblue": "#6a5acd", "slategray": "#708090", "slategrey": "#708090", "snow": "#fffafa", "springgreen": "#00ff7f", "steelblue": "#4682b4",
	"tan": "#d2b48c", "teal": "#008080", "thistle": "#d8bfd8", "tomato": "#ff6347", "turquoise": "#40e0d0",
	"violet": "#ee82ee",
	"wheat": "#f5deb3", "white": "#ffffff", "whitesmoke": "#f5f5f5",
	"yellow": "#ffff00", "yellowgreen": "#9acd3"
};

if (typeof exports !== "undefined"){
	for (var i in color){
		if (color.hasOwnProperty(i)){
			exports[i] = color[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.color = color;
}

})();
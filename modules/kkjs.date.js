/* globals navigator */

(function(){
"use strict";

/**
 * Object date
 * @author Korbinian kapsner
 * @name date
 * @version 1.0
 * @description Stellt Funktionen zur Verfügung, die mit Datums-Manipulation, -Ansprache und -Ansicht zu tun haben
 */

function diggits(nr, z){
	/* formats a number with leading zeros */
	nr = Math.round(nr).toString(10);
	while (nr.length < z){
		nr = "0" + nr;
	}
	return nr;
}

var localeStrings = {
	en: {
		weekDays: {
			l: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
			s: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
		},
		months: {
			l: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			s: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
		}
	},
	de: {
		weekDays: {
			l: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
			s: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"]
		},
		months: {
			l: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
			s: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
		}
	}
};
var locale = "en";

var formatting = {
	a: {
		format: function(date){
			return localeStrings[locale].weekDays.s[date.getDay()];
		}
	},
	A: {
		format: function(date){
			return localeStrings[locale].weekDays.l[date.getDay()];
		}
	},
	w: {
		format: function(date){
			return date.getDay();
		}
	},
	u: {
		format: function(date){
			return (date.getDay() + 6) % 7 + 1;
		}
	},
	d: {
		format: function(date){
			return diggits(date.getDate(), 2);
		},
		parse: {
			match: /^\d{1,2}/,
			process: function(strInput, set){
				set("date", parseInt(strInput, 10));
			}
		}
	},
	e: {
		format: function(date){
			return date.getDate();
		}
	},
	j: {
		format: function(date){
			var helpDate = new Date(date.getTime());
			helpDate.setDate(1);
			helpDate.setMonth(0);
			return diggits((date - helpDate) / (1000 * 3600 * 24) + 1, 3);
		}
	},
	V: {
		format: function(date){
			return diggits(date.getWeek(), 2);
		}
	},
	b: {
		format: function(date){
			return localeStrings[locale].months.s[date.getMonth()];
		}
	},
	h: {
		format: function(date){
			return localeStrings[locale].months.s[date.getMonth()];
		}
	},
	B: {
		format: function(date){
			return localeStrings[locale].months.l[date.getMonth()];
		}
	},
	m: {
		format: function(date){
			return diggits(date.getMonth() + 1, 2);
		},
		parse: {
			match: /^\d{1,2}/,
			process: function(strInput, set){
				set("month", parseInt(strInput, 10) - 1);
			}
		}
	},
	C: {
		format: function(date){
			return Math.floor(date.getFullYear() / 100);
		}
	},
	g: {
		format: function(date){
			return diggits(date.getWeekYear() % 100, 2);
		}
	},
	G: {
		format: function(date){
			return diggits(date.getWeekYear(), 4);
		}
	},

	y: {
		format: function(date){
			return diggits(date.getFullYear(), 4).substr(2);
		}
	},
	Y: {
		format: function(date){
			return diggits(date.getFullYear(), 4);
		},
		parse: {
			match: /^\d{1,4}/,
			process: function(strInput, set){
				set("year", parseInt(strInput, 10));
			}
		}
	},

	H: {
		format: function(date){
			return diggits(date.getHours(), 2);
		},
		parse: {
			match: /^\d{1,2}/,
			process: function(strInput, set){
				set("hours", parseInt(strInput, 10));
			}
		}
	},
	I: {
		format: function(date){
			return diggits((date.getHours() + 11) % 12 + 1, 2);
		}
	},
	i: {
		format: function(date){
			return (date.getHours() + 11) % 12 + 1;
		}
	},
	M: {
		format: function(date){
			return diggits(date.getMinutes(), 2);
		},
		parse: {
			match: /^\d{1,2}/,
			process: function(strInput, set){
				set("minutes", parseInt(strInput, 10));
			}
		}
	},
	p: {
		format: function(date){
			return (date.getHours() < 12)? "AM": "PM";
		}
	},
	P: {
		format: function(date){
			return (date.getHours() < 12)? "am": "pm";
		}
	},
	S: {
		format: function(date){
			return diggits(date.getSeconds(), 2);
		},
		parse: {
			match: /^\d{1,2}/,
			process: function(strInput, set){
				set("seconds", parseInt(strInput, 10));
			}
		}
	},
	L: {
		format: function(date){
			return diggits(date.getMilliseconds(), 3);
		},
		parse: {
			match: /^\d{1,3}/,
			process: function(strInput, set){
				set("milliSeconds", parseInt(strInput, 10));
			}
		}
	},
	z: {
		format: function(date){
			return diggits(date.getTimezoneOffset() / 60, 2);
		}
	},

	s: {
		format: function(date){
			return Math.floor(date.getTime() / 1000);
		}
	},

	n: {
		format: function(date){
			return "\n";
		}
	},
	t: {
		format: function(date){
			return "\t";
		}
	},
};
var combinedFormatting = {
	r: "%I:%M:%S %p",
	R: "%H:%M",
	T: "%H:%M:%S",
	D: "%m/%d/%y",
	F: "%Y-%m-%d"
};

var date = {
	parse: function parseDate(format, str){
		/**
		 * Function date.parse
		 * @name: date.parse
		 * @version: 1.0
		 * @author: Korbinian Kapsner
		 * @description:
		 * @parameter:
		 *	format:
		 *	str:
		 * @return value: the date object
		 */

		var data = {};
		function set(pos, amount){
			if (!data.hasOwnProperty(pos)){
				data[pos] = amount;
			}
			else if (data[pos] !== amount){
				throw new Error("Inconsistent input string.");
			}
		}

		var formatLength = format.length;
		var strLength = str.length;
		for (var formatI = 0, strI = 0; formatI < formatLength; formatI += 1){
			if (strI >= strLength){
				throw new Error("String does not match format: too short.");
			}
			if (format.charAt(formatI) === "%" && format.charAt(++formatI) !== "%"){
				var formatChar = format.charAt(formatI);
				var combinedFormat = combinedFormatting[formatChar];
				if (combinedFormat){
					format = combinedFormat + format.substring(formatI + 1);
					formatI = -1;
					formatLength = format.length;
				}
				else {
					if (formatting[formatChar] && formatting[formatChar].parse){
						var match = formatting[formatChar].parse.match.exec(str.substring(strI));
						if (match){
							formatting[formatChar].parse.process(match[0], set);
							strI += match[0].length;
						}
						else {
							throw new Error("String does not match format \"" + formatChar + "\".");
						}
					}
					else {
						throw new Error("Unknown format \"" + formatChar + "\".");
					}
				}
			}
			else {
				if (format.charAt(formatI) !== str.charAt(strI)){
					throw new Error("String does not match format: mismatching characters. Expected " + format.charAt(formatI) + " got " + str.charAt(strI));
				}
				else {
					strI += 1;
				}
			}
		}

		var now = new Date();
		function get(pos){
			if (!data.hasOwnProperty(pos)){
				switch (pos){
					case "year": return now.getFullYear();
					case "month": return now.getMonth();
					case "date": return now.getDate();
					case "hours": return 12;
					case "minutes": return 0;
					case "seconds": return 0;
					case "milliSeconds": return 0;
				}
			}
			else {
				return data[pos];
			}
		}

		return new Date(
			get("year"),
			get("month"),
			get("date"),
			get("hours"),
			get("minutes"),
			get("seconds"),
			get("milliSeconds")
		);
	},

	format: function formatDate(format, date){
		/**
		 * Function date.format
		 * @name: date.format
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 04.08.2009
		 * @description:
		 * @parameter:
		 *	format:
		 *	date:
		 * @return value: the formated date-representation
		 */
		return format.replace(/%(.)/g, function(m, f){
			var combinedFormat = combinedFormatting[f];
			if (combinedFormat){
				return formatDate(combinedFormat, date);
			}
			else {
				var format = formatting[f];
				if (format && format.format){
					return format.format(date);
				}
				else {
					return f;
				}
			}
		});
	},

	setLocale: function(newLocale){
		/**
		 * Function date.setLocale
		 * @name: date.setLocale
		 * @author: Korbinian Kapsner
		 * @description: sets the locale setting if it is known.
		 * @parameter:
		 *	locale:
		 */
		newLocale = newLocale.split("-")[0].toLowerCase();
		if (localeStrings.hasOwnProperty(newLocale)){
			locale = newLocale;
		}
	},
	registerLocale: function registerLocale(name, weekDays, months){
		/**
		 * Function date.registerLocale
		 * @name: date.registerLocale
		 * @author: Korbinian Kapsner
		 * @description: registeres a new locale to be used.
		 * @parameter:
		 *	name: the name of the locale
		 *  weekDays: the information for the week days.
		 *  months: the information for the months.
		 */
		if (localeStrings.hasOwnProperty(name)){
			throw new Error("Local already registered.");
		}
		if (!weekDays.l || !weekDays.s || weekDays.l.length !== 7 || weekDays.s.length !== 7){
			throw new Error("Invalid week days information.");
		}
		if (!months.l || !months.s || months.l.length !== 7 || months.s.length !== 7){
			throw new Error("Invalid months information.");
		}
		localeStrings[name] = {
			weekDays: weekDays,
			months: months
		};
	}
};

if (typeof nagivator !== "undefined" && navigator.language){
	date.setLocale(navigator.language);
}

if (typeof exports !== "undefined"){
	for (var i in date){
		if (date.hasOwnProperty(i)){
			exports[i] = date[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.date = date;
}
})();
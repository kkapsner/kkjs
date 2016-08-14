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
				throw new Error("String does not match format.");
			}
			if (format.charAt(formatI) === "%" && format.charAt(++formatI) !== "%"){
				var diggitsMatch = /^\d+/.exec(str.substring(strI));
				if (!diggitsMatch){
					throw new Error("String does not match format.");
				}
				else {
					strI += diggitsMatch[0].length;
					var diggits = parseInt(diggitsMatch[0], 10);
					switch (format.charAt(formatI)){
						case "Y": set("year", diggits); break;
						case "y": set("year", 1900 + diggits); break;
						case "m": set("month", diggits - 1); break;
						case "d": set("date", diggits); break;
						case "H": set("hours", diggits); break;
						case "M": set("minutes", diggits); break;
						case "S": set("seconds", diggits); break;
						case "L": set("milliSeconds", diggits); break;
						default:
							throw new Error("Unknown format.");
					}
				}
			}
			else {
				if (format.charAt(formatI) !== str.charAt(strI)){
					throw new Error("String does not match format.");
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
	
	format: (function(){
		var abbr;
		function formatDate(format, date){
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
			return format.replace(/%(.)/g, function(m, f){return abbr(m, f, date);});
		}
		
		abbr = function abbr(m, f, _date){
			/* replace function that translates the abbrevations in numbers */
			switch (f){
				case "a": return localeStrings[date.locale].weekDays.s[_date.getDay()];
				case "A": return localeStrings[date.locale].weekDays.l[_date.getDay()];
				case "w": return _date.getDay();
				case "u": return (_date.getDay() + 6) % 7 + 1;
				case "d": return diggits(_date.getDate(), 2);
				case "e": return _date.getDate();
				case "j":
					var helpDate = new Date(_date.getTime());
					helpDate.setDate(1);
					helpDate.setMonth(0);
					return diggits((_date - helpDate) / (1000 * 3600 * 24) + 1, 3);
				
				case "U": return "";
				case "V": return diggits(_date.getWeek(), 2);
				case "W": return "";
				
				case "b": case "h": return localeStrings[date.locale].months.s[_date.getMonth()];
				case "B": return localeStrings[date.locale].months.l[_date.getMonth()];
				case "m": return diggits(_date.getMonth() + 1,2);
				
				case "C": return Math.floor(_date.getFullYear() / 100);
				
				case "g": return diggits(_date.getWeekYear() % 100, 2);
				case "G": return diggits(_date.getWeekYear(), 4);
				
				case "y": return _date.getFullYear().toString().substr(2);
				case "Y": return diggits(_date.getFullYear(), 4);
				
				case "H": return diggits(_date.getHours(), 2);
				case "I": return diggits((_date.getHours() + 11) % 12 + 1, 2);
				case "i": return (_date.getHours() + 11) % 12 + 1;
				case "M": return diggits(_date.getMinutes(), 2);
				case "p": return (_date.getHours() < 12)? "AM": "PM";
				case "P": return (_date.getHours() < 12)? "am": "pm";
				case "r": return formatDate("%I:%M:%S %p", _date);
				case "R": return formatDate("%H:%M", _date);
				case "S": return diggits(_date.getSeconds(), 2);
				case "L": return diggits(_date.getMilliseconds(), 3);
				case "T": return formatDate("%H:%M:%S", _date);
				
				case "X": case "c": case "x": return "";
				case "z": case "Z": return diggits(_date.getTimezoneOffset() / 60, 2);
				
				case "D": return formatDate("%m/%d/%y", _date);
				case "F": return formatDate("%Y-%m-%d", _date);
				case "s": return Math.floor(_date.getTime() / 1000);
				
				
				case "n": return "\n";
				case "t": return "\t";
				case "%": return "%";
				default: return f;
			}
		};
		
		return formatDate;
	})(),
	
	locale: "en",
	setLocale: function(locale){
		/**
		 * Function date.setLocale
		 * @name: date.setLocale
		 * @author: Korbinian Kapsner
		 * @description: sets the locale setting if it is known.
		 * @parameter:
		 *	locale:
		 */
		locale = locale.split("-")[0].toLowerCase();
		if (localeStrings.hasOwnProperty(locale)){
			date.locale = locale;
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
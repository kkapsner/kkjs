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
	nr = nr.toString(10);
	while (nr.length < z){
		nr = "0" + nr;
	}
	return nr;
}

var date = {
	/**
	 * Function date.fromMySQLFormat
	 * @name: date.fromMySQLFormat
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description: creates a date-object from an MySQL Date string
	 * @parameter:
	 *	mySQLDateString:
	 */
	
	fromMySQLFormat: function dateFromMySQLFormat(mySQLDateString){
		var portions = mySQLDateString.split(/[\- :]/);
		return new Date(
			portions[0],
			portions[1] - 1,
			portions[2],
			portions[3],
			portions[4],
			portions[5]
		);
	},
	
	/**
	 * Function date.convert
	 * @name: date.convert
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description: Convertiert Datumsformate ineinander um (à la YYYY-MM-DD -> DD.MM.YYYY)
	 * @parameter:
	 *	date:
	 *	von:
	 *	zu:
	 */

	convert: function convertDate(date, von, zu){

		var jahr = 0;
		var monat = 0;
		var tag = 0;
		
		if (von !== Date){
			for (var i = 0; i < date.length; i++){
				if (von.substr(i,1).match(/y|j/i)){jahr += date.substr(i,1);}
				if (von.substr(i,1).match(/m/i)){monat += date.substr(i,1);}
				if (von.substr(i,1).match(/d|t/i)){tag += date.substr(i,1);}
			}
			
			jahr = parseInt(jahr, 10) || 0;
			monat = parseInt(monat, 10) || 0;
			tag = parseInt(tag, 10) || 0;
		}
		else{
			jahr = date.getFullYear();
			monat = date.getMonth() + 1;
			tag = date.getDate();
		}
		
		if (zu === Date){
			return new Date(jahr, monat - 1, tag);
		}
		
		
		var j = 0;
		var zj = 0;
		while (zu.substring(zj,zu.length).search(/y|j/ig) >= 0){
			zj = zj+zu.substring(zj,zu.length).search(/y|j/ig)+1;
			j++;
		}
		
		var m = 0;
		var zm = 0;
		while (zu.substring(zm,zu.length).search(/m/ig) >= 0){
			zm = zm+zu.substring(zm,zu.length).search(/m/ig)+1;
			m++;
		}
		
		var t = 0;
		var zt = 0;
		while (zu.substring(zt,zu.length).search(/d|t/ig) >= 0){
			zt = zt+zu.substring(zt,zu.length).search(/d|t/ig)+1;
			t++;
		}
		
		jahr = diggits(jahr, j);
		monat = diggits(monat, m);
		tag = diggits(tag, t);
		
		var erg = "";
		
		for (var i = zu.length-1; i>=0; i--){
			if (zu.substr(i,1).match(/y|j/i)){
				erg = jahr.substr(jahr.length-1,1)+erg;
				jahr = jahr.substring(0,jahr.length-1);
			}
			else if( zu.substr(i,1).match(/m/i)){
				erg = monat.substr(monat.length-1,1)+erg;
				monat = monat.substring(0,monat.length-1);
			}
			else if( zu.substr(i,1).match(/d|t/i)){
				erg = tag.substr(tag.length-1,1)+erg;
				tag = tag.substring(0,tag.length-1);
			}
			else{
				erg = zu.substr(i,1)+erg;
			}
		}
		
		return erg;
	},
	
	/**
	 * Function date.addZeros
	 *@name: date.addZeros
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description:
	 * @parameter:
	 *	str:
	 */

	addZeros: function datumErgaenzen(str){
		var m, tag, monat, jahr;
		if ((m = str.exec(/^(\d+)\.(\d+)\.(\d*)$/)) !== null){
			jahr = parseInt(m[3], 10) || (new Date()).getFullYear();
			monat = parseInt(m[2], 10) || 1;
			tag = parseInt(m[1], 10) || 1;
			
			var datum = new Date(jahr, monat - 1, tag);
			
			if (datum.getDate() !== parseInt(m[1], 10)){
				return false;
			}
			
			tag = diggits(datum.getDate(), 2);
			monat = diggits((datum.getMonth() + 1), 2);
			jahr = diggits(datum.getFullYear(), 4);
			
			return tag+"."+monat+"."+jahr;
		}
		else{
			return false;
		}
	},
	
	/**
	 * Function date.format
	 *@name: date.format
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 04.08.2009
	 * @description:
	 * @parameter:
	 *	date:
	 *	str:
	 * @return value: the formated date-representation
	 */
	
	format: (function(){
		var formatDate;
		function abbr(m, f, _date){
			switch (f){
				case "a": return date.localeStrings[date.locale].weekDays.s[_date.getDay()];
				case "A": return date.localeStrings[date.locale].weekDays.l[_date.getDay()];
				case "w": return _date.getDay();
				case "u": return (_date.getDay() + 6) % 7 + 1;
				case "d": return diggits(_date.getDate(), 2);
				case "e": return _date.getDate();
				case "j":
					var helpDate = new Date(_date.getTime());
					helpDate.setDate(1);
					helpDate.setMonth(0);
					return diggits((_date - helpDate) / (1000 * 3600 * 24) + 1, 3);
				
				case "U": case "V": case "W": return "";
				
				case "b": case "h": return date.localeStrings[date.locale].months.s[_date.getMonth()];
				case "B": return date.localeStrings[date.locale].months.l[_date.getMonth()];
				case "m": return diggits(_date.getMonth() + 1,2);
				
				case "C": return Math.floor(_date.getFullYear() / 100);
				case "g": case "G": return "";
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
		}
		formatDate = function(format, date){
			return format.replace(/%(.)/g, function(m, f){return abbr(m, f, date);});
		};
		return formatDate;
	})(),
	
	locale: "en",
	setLocale: function(locale){
		if (date.localeStrings.hasOwnProperty(locale)){
			date.locale = locale;
		}
	},
	localeStrings: {
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
	}
};

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
(function(){
	"use strict";
	Date.prototype.setDay = function(day, splitDay){
		/**
		 * Function Date.prototype.setDay
		 * @name: Date.prototype.setDay
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: Setter function to Date.prototype.getDay().
		 * @parameter:
		 *	day: day of the week to be set
		 *	splitDay (optional): day where the week should be splitted. Default
		 *		is monday.
		 *		E.g.: If the current day is Wednesday and you want to set the
		 *			day to Sunday. If you set splitDay to Friday the new date
		 *			will be last Sunday. But if you set it to Monday it will be
		 *			next Sunday.
		 */
		
		var currDay = this.getDay();
		if (typeof splitDay === "undefined"){
			splitDay = 1;
		}
		else {
			splitDay = ((splitDay % 7) + 7 ) % 7;
		}
		
		if (splitDay){
			day = (day + 7 - splitDay) % 7 + splitDay;
			if (currDay < splitDay){
				currDay += 7;
			}
		}
		this.setDate(
			this.getDate() + day - currDay
		);
	};
	
	Date.prototype.getDayOfYear = function(){
		/**
		 * Function Date.prototype.getDayOfYear
		 * @name: Date.prototype.getDayOfYear
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: Returns the number of the day in the year.
		 * @returns: Day of the year.
		 */
		
		var temp = new Date(this.getTime());
		temp.setHours(12, 0, 0, 0);
		var time = temp.getTime();
		temp.setMonth(0, 0);
		var refTime = temp.getTime();
		return (time - refTime) / (24 * 60 * 60 * 1000);
	};
	
	Date.prototype.setDayOfYear = function(dayOfYear){
		/**
		 * Function Date.prototype.setDayOfYear
		 * @name: Date.prototype.setDayOfYear
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: Setter for Date.prototype.getDayOfYear.
		 * @parameter:
		 *	dayOfYear: Day of the year to be set.
		 */
		
		this.setDate(
			this.getDate() + dayOfYear - this.getDayOfYear()
		);
	};
	
	Date.prototype.getWeek = function(){
		/**
		 * Function Date.prototype.getWeek
		 * @name: Date.prototype.getWeek
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: Returns the week number according to ISO-8601:1988.
		 * @returns: Week of the year.
		 */
		
		var weekStart = new Date(this.getTime());
		weekStart.setDay(1, 1);
		var weekEnd = new Date(this.getTime());
		weekEnd.setDay(0, 1);
		
		if (weekStart.getFullYear() !== weekEnd.getFullYear()){
			if (weekEnd.getDate() >= 4){
				return 1;
			}
		}
		var dayOfYear = weekStart.getDayOfYear();
		var week = Math.floor(dayOfYear / 7) + 1;
		if (dayOfYear % 7 >= 4){
			week += 1;
		}
		
		return week;
	};
	
	Date.prototype.setWeek = function(week){
		/**
		 * Function Date.prototype.setWeek
		 * @name: Date.prototype.setWeek
		 * @author: Korbinian Kapsner
		 * @version: 1.0
		 * @description: Setter for Date.prototype.getWeek() (ISO-8601:1988).
		 * @parameter:
		 *	week: The week of the year to be set.
		 */
		
		this.setDate(
			this.getDate() + 7 * (week - this.getWeek())
		);
	};
}());
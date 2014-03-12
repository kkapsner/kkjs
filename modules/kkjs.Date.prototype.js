(function(){
	"use strict";
	
	Date.prototype.setDay = function(day, splitDay){
		var currDay = this.getDay();
		if (typeof splitDay === "undefined"){
			splitDay = currDay;
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
		var temp = new Date(this.getTime());
		temp.setHours(12, 0, 0, 0);
		var time = temp.getTime();
		temp.setMonth(0, 0);
		var refTime = temp.getTime();
		return (time - refTime) / (24 * 60 * 60 * 1000);
	};
	Date.prototype.setDayOfYear = function(dayOfYear){
		this.setDate(
			this.getDate() + dayOfYear - this.getDayOfYear()
		);
	};
	Date.prototype.getWeek = function(){
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
		this.setDate(
			this.getDate() + 7 * (week - this.getWeek())
		);
	};
	Date.prototype.getWeekYear = function(){};
}());
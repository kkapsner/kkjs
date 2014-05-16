var unitTest = kkjs.unitTest;//require("kkjs.unitTest");

unitTest.add(function (){
	var d = new Date(2014, 4, 16);
	
	return d.getWeek();
}, 20);
unitTest.add(function (){
	var d = new Date(2014, 0, 1);
	
	return d.getWeek();
}, 1);
unitTest.add(function (){
	var d = new Date(2013, 11, 31);
	
	return d.getWeek();
}, 1);

unitTest.add(function (){
	var d = new Date(2014, 4, 16);
	d.setWeek(1);
	return d.getMonth() === 0 && d.getFullYear() === 2014 && d.getDate() === 3 && d.getWeek() === 1;
});

unitTest.add(function (){
	var d = new Date(2014, 0, 1);
	
	return d.getDayOfYear();
}, 1);
unitTest.add(function (){
	var d = new Date(2013, 11, 31);
	
	return d.getDayOfYear();
}, 365);


unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(0);
	
	return d.getDate();
}, 18);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(1);
	
	return d.getDate();
}, 12);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(2);
	
	return d.getDate();
}, 13);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(3);
	
	return d.getDate();
}, 14);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(4);
	
	return d.getDate();
}, 15);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(5);
	
	return d.getDate();
}, 16);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(6);
	
	return d.getDate();
}, 17);


unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(3, 0);
	
	return d.getDate();
}, 14);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(3, 1);
	
	return d.getDate();
}, 14);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(3, 2);
	
	return d.getDate();
}, 14);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(3, 3);
	
	return d.getDate();
}, 14);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(3, 4);
	
	return d.getDate();
}, 21);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(3, 5);
	
	return d.getDate();
}, 21);
unitTest.add(function(){
	var d = new Date(2014, 4, 16);
	d.setDay(3, 6);
	
	return d.getDate();
}, 14);

var results = unitTest.run().map(function(s, i){
	if (s.status !== "success"){
		var error;
		if (s.status === "fail"){
			error = kkjs.sprintf(
				"expected %s but got %s",
				JSON.stringify(s.expectedValue),
				JSON.stringify(s.value)
			);
		}
		else {
			error = s.error;
		}
		console.log(kkjs.sprintf("Test %d failed: %s", i, error));
	}
	else {
		console.log(kkjs.sprintf("Test %d passed", i));
	}
});
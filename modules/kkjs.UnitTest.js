(function(){

"use strict";

/**
 * Object unitTest
 * @name: unitTest
 * @author: Korbinian Kapsner
 * @description: Frame for central unit testing
 */

var unitTest = {};
if (typeof exports !== "undefined"){
	unitTest = exports;
}
else if (typeof kkjs !== "undefined"){
	kkjs.unitTest = unitTest;
}

var tests = [];

unitTest.add = function addTest(test){
	/**
	 * Function unitTest.add
	 * @name: unitTest.add
	 * @author: Korbinian Kapsner
	 * @description: adds a test to the test suite.
	 * @parameter:
	 *	test: the test to be added. Should be an instance of unitTest.Test
	 * @return value: this
	 */
	
	if (typeof test === "function"){
		test = new unitTest.Test(test);
	}
	tests.push(test);
	
	return this;
};

unitTest.run = function runTests(){
	/**
	 * Function unitTest.run
	 * @name: unitTest.run
	 * @author: Korbinian Kapsner
	 * @description: runs the test suite.
	 * @return value: returns the results of the tests.
	 */
	var results = [];
	
	tests.forEach(function(test){
		test.onOnce("success", function(){
			results.push(true);
		});
		test.onOnce("fail", function(){
			results.push(false);
		});
		test.onOnce("error", function(e){
			results.push(e);
		});
		
		test.run();
	});
	
	return results;
};

unitTest.Test = require("kkjs.EventEmitter").extend(function(testFunction){
	/**
	 * Constructor unitTest.Test
	 * @name: unitTest.Test
	 * @author: Korbinian Kapsner
	 * @description: one test
	 * @parameter:
	 *	testFunction: the function to be called in testing. If the return value
	 *		is false the test is seen as failed.
	 * @return value: the instance
	 */
	 
	 this.testFunction = testFunction;
}).implement({
	run: function(){
		try {
			this.emit(this.testFunction()? "success": "fail");
		}
		catch (e){
			this.emit("error", e);
		}
	}
});

})();
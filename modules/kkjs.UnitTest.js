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
		test = new unitTest.Test(test, arguments[1]);
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
			results.push({status: "success"});
		});
		test.onOnce("fail", function(wrongValue){
			results.push({status: "fail", value: wrongValue, expectedValue: this.expectedValue});
		});
		test.onOnce("error", function(e){
			results.push({status: "error", error: e});
		});
		
		test.run();
	});
	
	return results;
};

function checkValue(gotValue, expectedValue){
	/* check function if the result is correct */
	if (Array.isArray(expectedValue)){
		return Array.isArray(gotValue) &&
			expectedValue.every(function(value, i){
				return checkValue(gotValue[i], value);
			}
		);
	}
	else if (typeof expectedValue === "object"){
		return (typeof gotValue === "object") &&
			Object.keys(expectedValue).every(function(key){
				return checkValue(gotValue[key], expectedValue[key]);
			});
	}
	else {
		return gotValue === expectedValue;
	}
}

unitTest.Test = require("kkjs.EventEmitter").extend(function(testFunction, expectedValue){
	/**
	 * Constructor unitTest.Test
	 * @name: unitTest.Test
	 * @author: Korbinian Kapsner
	 * @description: one test
	 * @parameter:
	 *	testFunction: the function to be called in testing.
	 *	expectedValue: the expected value that should be returned by the test
	 *		function. If this parameter is omitted true is taken.
	 * @return value: the instance
	 */
	 
	 this.testFunction = testFunction;
	 
	 if (typeof expectedValue === "undefined"){
		expectedValue = true;
	 }
	 this.expectedValue = expectedValue;
}).implement({
	run: function(){
		try {
			var value = this.testFunction();
			this.emit(checkValue(value, this.expectedValue)? "success": "fail", value);
		}
		catch (e){
			this.emit("error", e);
		}
	}
});

})();
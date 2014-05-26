var unitTest = require("kkjs.unitTest");
var parser = require("kkjs.parser");

[
	{csv: "", result: []},
	{csv: "", result: [[""]], att: {skipEmptyLines: false}},
	{csv: ",,\r\n,,\r\n\r,,,,\n\n\r", result: []},
	{csv: ",,\r\n,\r\n\r,,,,\n\n\r", result: [["","",""],["",""],[""],["","","","",""],[""],[""],[""]], att: {skipEmptyLines: false}},
	{csv: "a,b,c\rde,f", result: [["a", "b", "c"], ["de", "f"]]},
].forEach(function(test){
	unitTest.add(
		function(){
			return parser.csv(test.csv, test.att);
		},
		test.result
	);
});


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
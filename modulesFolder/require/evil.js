var executeCode = function(code, module){
	/*jshint evil: true, strict: false, unused: false*/
	// globals from node.js
	var global = window;
	// module wide "globals"
	var __filename = module.filename,
	    __dirname = module.filename.replace(/\/[^\/]*$/, ""),
		exports = module.exports;
	try {
		eval(code);
	}
	catch(e){
		if (typeof console !== "undefined" && console.error){
			console.error("Error in " + module.filename);
		}
		e.fileName = e.source = e.href = module.filename;
		throw e;
	}
};
var fs = require("fs");

var modules = process.argv.slice(2);
var basedir = process.mainModule.filename.replace(/[^\/]+$/, "");
var modulesDir = basedir + "../modules/";

function readFile(path, content, index, counter, callback, dataCallback){
	fs.readFile(path, function(err, data){
		if (dataCallback){
			content[index] = dataCallback(data || "");
		}
		else {
			content[index] = data || "";
		}
		counter.length += 1;
		if (counter.length === counter.aimLength){
			callback();
		}
	});
}

function buildModule(module){
	var path = basedir + module;
	fs.exists(path, function(exists){
		if (exists){
			fs.stat(path, function(err, stat){
				var content = [];
				var properties = {};
				function save(){
					var data = content.join("\n\n").replace(/\r\n|\r/g, "\n");
					if (properties.description){
						data = "/**\n * " +
							properties.description.replace(/\n/g, "\n * ") +
							"\n */\n\n" +
							data;
					}
					if (properties.strict){
						data = "\"use strict\";\n\n" + data;
					}
					if (properties.commonScope){
						// if first row is not indented indent the whole file
						if (data[0] !== "\t"){
							data = data.replace(/(^|\n)/g, "$1\t");
						}
						data = "(function(){\n" + data.replace(/(^|\n)(?!\t)/g, "$1\t") + "\n}());";
					}
					fs.writeFile(modulesDir + (properties.name || "kkjs." + module + ".js"), data);
					console.log(module + " built.");
				}
				
				if (stat.isDirectory()){
					fs.exists(path + "/build.json", function(exists){
						var counter = {length: 0};
						if (exists){
							fs.readFile(path + "/build.json", function(err, data){
								properties = JSON.parse(data);
								counter.aimLength = properties.order.length;
								if (properties.exports){
									readFile("./exportTemplate.js", content, counter.aimLength, counter, save, function(data){
										return data.toString().replace(/{exports}/g, properties.exports);
									});
									counter.aimLength += 1;
								}
								properties.order.forEach(function(file, index){
									readFile(path + "/" + file, content, index, counter, save);
								});
							});
						}
						else {
							fs.readdir(path, function(err, files){
								files = files.filter(function(file){
									return file.match(/\.js$/i);
								});
								counter.aimLength = files.length;
								files.forEach(function(file, index){
									readFile(path + "/" + file, content, index, counter, save);
								});
							});
						}
					});
				}
			});
		}
	});
}

if (modules.length){
	modules.forEach(buildModule);
}
else {
	console.log("Building all modules.\n");
	fs.readdir(basedir + ".", function(err, subdirs){
		subdirs.forEach(function(subdir){
			fs.stat(basedir + subdir, function(err, stat){
				if (stat.isDirectory()){
					buildModule(subdir);
				}
			});
		});
	});
}
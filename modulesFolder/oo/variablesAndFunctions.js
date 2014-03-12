// a valid for ... in loop over EVERY entry (also toString in IE)
function forIn(obj, func){
	Object.keys(obj).forEach(function(name){
		func(name, obj[name], obj);
	});
}

// functionality to implement things
function implementFunction(target, obj){
	// if we want to implement a interface
	if (typeof obj === "function"){
		obj = obj.prototype;
	}
	
	forIn(obj, function(name, value){
		target[name] = value;
	});
}
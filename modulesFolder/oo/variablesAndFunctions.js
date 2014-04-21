function forIn(obj, func){
	/* a valid for ... in loop over EVERY entry (also toString in IE) */
	Object.keys(obj).forEach(function(name){
		func(name, obj[name], obj);
	});
}

function implementFunction(target, obj){
	/* functionality to implement things */
	
	// if we want to implement a interface
	if (typeof obj === "function"){
		obj = obj.prototype;
	}
	
	forIn(obj, function(name, value){
		target[name] = value;
	});
}
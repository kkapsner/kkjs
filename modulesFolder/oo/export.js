
if (typeof exports !== "undefined"){
	for (var i in oo){
		if (oo.hasOwnProperty(i)){
			exports[i] = oo[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.oo = oo;
}
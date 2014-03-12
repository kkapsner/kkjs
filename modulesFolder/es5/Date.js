	// Date methods
	
	register(Date, "now", function dateNow(){
		return (new Date()).getTime();
	});
	
	function diggits(nr, z){
		nr = nr.toString();
		while (nr.length < z){
			nr = "0" + nr;
		}
		return nr;
	}
	
	register(Date.prototype, "toISOString", function toISOString(){
		return diggits(this.getFullYear(), 4) + "-" +
			diggits(this.getMonth() + 1, 2) + "-" +
			diggits(this.getDate(), 2) + "T" +
			diggits(this.getHours(), 2) + ":" +
			diggits(this.getMinutes(), 2) + ":" +
			diggits(this.getSeconds(), 2) +
			//"." + diggits(this.getMilliseconds(), 3) +
			"Z";
	});
	
	register(Date.prototype, "toJSON", function toJSON(){
		if (!isFinite(this.getTime())){
			return null;
		}
		if (typeof this.toISOString !== "function"){
			throw new TypeError();
		}
		return this.toISOString();
	});
	
(function(){

"use strict";


var oo = require("kkjs.oo");

function abstractMethod(){
	throw new Error("abstract Method");
}

/**
 * Object Math
 * @name: Math
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: advanced Math stuff
 */
var kMath;
if (typeof exports !== "undefined"){
	kMath = exports;
}
else if (typeof kkjs !== "undefined"){
	kkjs.Math = {};
	kMath = kkjs.Math;
}
else {
	return;
}

/**
 * Object Math.Vector
 * @name: Math.Vector
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: abstract class for a vector interface - implementations: Math.Vector2D, Math.Position, Math.Dimension, Math.Vector3D, Math.VectorND
 */
 
kMath.Vector = oo.Base.extend(function Vector(){
	throw new Error("abstract class");
}).implement({
	/**
	 * Object Math.Vector.prototype.toArray
	 * @name: Math.Vector.prototype.toArray
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: creates a native Array out of the Vector
	 * @return: Array
	 */
	toArray: abstractMethod,
	/**
	 * Function QueryString.prototype.
	 * @name: QueryString.prototype.
	 * @author: Korbinian Kapsner
	 * @version: 1.0
	 * @description: fills the
	 */
	fromArray: abstractMethod,
	clone: function clone(){
		/*var clone = new this.constructor();
		for (var i = this.getDimension() - 1; i >= 0; i--){
			clone.setEntry(i, this.getEntry(i));
		}
		return clone;*/
		return this.constructor.createFromArray(this.toArray());
	},
	checkArray: function checkArray(arr, size){
		if (typeof size === "undefined"){
			size = this.getDimension();
		}
		if (!this.constructor.dynamicDimension && size !== arr.length){
			throw new Error("Array has wrong length.");
		}
		if (arr.some(function(v){return typeof v !== "number";})){
			throw new TypeError("Array contains non numeric values.");
		}
	},
	checkIndex: function checkIndex(i){
		if ((i % 1) !== 0){
			throw new Error("No interger index.");
		}
		if (i < 0 || i >= this.getDimension()){
			throw new Error("Out of boundaries.");
		}
	},
	setEntry: abstractMethod,
	getEntry: abstractMethod,
	getDimension: abstractMethod,
	getLength: function getLength(){
		var sum2 = this.toArray().reduce(function(sum2, v){ return sum2 + v*v;}, 0);
		return Math.sqrt(sum2);
	},
	add: function add(v){
		var dim = v.getDimension();
		if (dim !== this.getDimension()){
			throw new Error("Vector dimensions do not match.");
		}
		for (var i = dim - 1; i >= 0; i--){
			this.setEntry(i, this.getEntry(i) + v.getEntry(i));
		}
		return this;
	},
	sub: function sub(v){
		var dim = v.getDimension();
		if (dim !== this.getDimension()){
			throw new Error("Vector dimensions do not match.");
		}
		for (var i = dim - 1; i >= 0; i--){
			this.setEntry(i, this.getEntry(i) - v.getEntry(i));
		}
		return this;
	},
	mul: function mul(s){
		var dim = this.getDimension();
		for (var i = dim - 1; i >= 0; i--){
			this.setEntry(i, this.getEntry(i) * s);
		}
		return this;
	},
	scalarProduct: function scalarProduct(v){
		var dim = v.getDimension();
		if (dim !== this.getDimension()){
			throw new Error("Vector dimensions do not match.");
		}
		var sum = 0;
		for (var i = dim - 1; i >= 0; i--){
			sum += this.getEntry(i) * v.getEntry(i);
		}
		return sum;
	},
	round: function round(){
		var dim = this.getDimension();
		for (var i = dim - 1; i >= 0; i--){
			this.setEntry(i, Math.round(this.getEntry(i)));
		}
		return this;
	},
	floor: function floor(){
		var dim = this.getDimension();
		for (var i = dim - 1; i >= 0; i--){
			this.setEntry(i, Math.floor(this.getEntry(i)));
		}
		return this;
	},
	ceil: function ceil(){
		var dim = this.getDimension();
		for (var i = dim - 1; i >= 0; i--){
			this.setEntry(i, Math.ceil(this.getEntry(i)));
		}
		return this;
	},
	toString: function toString(){
		return "Vector [" + this.toArray().join(", ") + "]";
	}
}).implementStatic({
	dynamicDimension: false,
	createFromArray: abstractMethod
});

kMath.VectorNamed = kMath.Vector.extend(function VectorNamed(){
	throw new Error("abstract class");
}).implement({
	getDimension: function getDimension(){
		return this.constructor.names.length;
	},
	fromArray: function fromArray(arr){
		this.checkArray(arr);
		var names = this.constructor.names;
		for (var i = arr.length - 1; i >= 0; i--){
			this[names[i]] = arr[i];
		}
	},
	clone: function clone(){
		var clone = new this.constructor();
		for (var i = 0; i < this.constructor.names.length; i++){
			clone[this.constructor.names[i]] = this[this.constructor.names[i]];
		}
		return clone;
	},
	toArray: function toArray(){
		var ret = [];
		var names = this.constructor.names;
		for (var i = names.length - 1; i >= 0; i--){
			ret[i] = this[names[i]];
		}
		return ret;
	},
	fromObject: function fromObject(obj){
		var names = this.constructor.names;
		for (var i = names.length - 1; i >= 0; i--){
			var name = names[i];
			this[name] = obj[name];
		}
	},
	toObject: function toObject(obj, unit){
		if (typeof obj === "undefined"){
			obj = {};
		}
		if (typeof unit === "undefined"){
			unit = "";
		}
		var names = this.constructor.names;
		for (var i = names.length - 1; i >= 0; i--){
			var name = names[i];
			obj[name] = this[name] + unit;
		}
		return obj;
	},
	getEntry: function getEntry(i){
		this.checkIndex(i);
		return this[this.constructor.names[i]];
	},
	setEntry: function setEntry(i, v){
		this.checkIndex(i);
		this[this.constructor.names[i]] = v;
	}
}).implementStatic({
	names: [],
	createFromArray: function createFromArray(arr){
		var item = new this();
		item.fromArray(arr);
		return item;
	}
});
kMath.Vector2D = kMath.VectorNamed.extend(function Vector2D(x, y){
	this.x = x;
	this.y = y;
}).implementStatic({
	names: ["x", "y"]
});
kMath.Position = kMath.VectorNamed.extend(function Position(left, top){
	this.left = left;
	this.top = top;
}).implementStatic({
	names: ["left", "top"]
});
kMath.Dimension = kMath.VectorNamed.extend(function Dimension(width, height){
	this.width = width;
	this.height = height;
}).implementStatic({
	names: ["width", "height"]
});
kMath.Vector3D = kMath.VectorNamed.extend(function Vector3D(x, y, z){
	this.x = x;
	this.y = y;
	this.z = z;
}).implementStatic({
	names: ["x", "y", "z"]
});
kMath.VectorND = kMath.Vector.extend(function verctorND(firstArg/*  */){
	if (Array.isArray(firstArg)){
		this.fromArray(firstArg);
	}
	else {
		this.fromArray(Array.prototype.slice.call(arguments));
	}
}).implement({
	dimension: 0,
	getDimension: function getDimension(){
		return this.dimension;
	},
	entries: [],
	fromArray: function fromArray(arr){
		this.checkArray(arr);
		this.dimension = arr.length;
		this.entries = arr.slice();
	},
	toArray: function toArray(){
		return this.entries.slice();
	},
	getEntry: function getEntry(i){
		this.checkIndex(i);
		return this.entries[i];
	},
	setEntry: function setEntry(i, v){
		this.checkIndex(i);
		this.entries[i] = v;
	}
}).implementStatic({
	dynamicDimension: true,
	createFromArray: function createFromArray(arr){
		return new this(arr);
	}
});


/**
 * Object Math.Range
 * @name: Math.Range
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description:
 */

kMath.Range = oo.Base.extend(function Range(min, max){
	if (typeof min === "object" && typeof min.value !== "undefined" && typeof min.include !== "undefined"){
		this.includeMin = min.include;
		this.min = min.value;
	}
	else {
		this.min = min;
	}
	if (typeof max === "object" && typeof max.value !== "undefined" && typeof max.include !== "undefined"){
		this.includeMax = max.include;
		this.max = max.value;
	}
	else {
		this.max = max;
	}
}).implement({
	includeMin: true,
	includeMax: true,
	toString: function toString(){
		return "Range " + (this.includeMin? "[": "]") + this.min + " - " + this.max + (this.includeMax? "]": "[");
	},
	contains: function contains(nr){
		if (nr instanceof kMath.Range){
			return this.contains(nr.min) && this.contains(nr.max);
		}
		if (typeof nr !== "number"){
			return false;
		}
		return nr >= this.min && nr <= this.max;
	},
	restrict: function restrict(nr, cyclic){
		if (nr instanceof kMath.Range){
			return new kMath.Range(this.restrict(nr.min), this.restrict(nr.max));
		}
		if (typeof nr !== "number"){
			return false;
		}
		
		var dist, range;
		if (this.includeMin? nr < this.min: nr <= this.min){
			if (cyclic){
				range = this.max - this.min;
				dist = this.min - nr;
				return nr + Math.max(Math.ceil(dist / range), 1) * range;
				
			}
			else {
				return this.min + (this.includeMin? 0: 1);
			}
		}
		else if (this.includeMax? nr > this.max: nr >= this.max){
			if (cyclic){
				range = this.max - this.min;
				dist = nr - this.max;
				return nr - Math.max(Math.ceil(dist / range), 1) * range;
			}
			else {
				return this.max - (this.includeMax? 0: 1);
			}
		}
		else {
			return nr;
		}
	},
	expand: function expand(nr){
		if (this.min > nr){
			this.min = nr;
		}
		if (this.max < nr){
			this.max = nr;
		}
	},
	clone: function clone(){
		return new kMath.Range({value: this.min, include: this.minInclude}, {value: this.max, include: this.maxInclude});
	}
}).implementStatic({
});

/**
 * Object Math.Range
 * @name: Math.Range
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description:
 */

kMath.Range2D = oo.Base.extend(function Range(minX, maxX, minY, maxY){
	this.rangeX = new kMath.Range(minX, maxX);
	this.rangeY = new kMath.Range(minY, maxY);
}).implement({
	contains: function contains(vec){
		if (vec instanceof kMath.Vector && vec.getDimension() === 2){
			return this.rangeX.contains(vec.getEntry(0)) && this.rangeY.contains(vec.getEntry(1));
		}
		else {
			return false;
		}
	},
	restrict: function restrict(vec, cyclic){
		if (vec instanceof kMath.Vector && vec.getDimension() === 2){
			return new vec.constructor(this.rangeX.restrict(vec.getEntry(0), cyclic), this.rangeY.restrict(vec.getEntry(1), cyclic));
		}
		else {
			return false;
		}
	},
	expand: function expand(vec){
		if (vec instanceof kMath.Vector && vec.getDimension() === 2){
			this.rangeX.expand(vec.getEntry(0));
			this.rangeY.expand(vec.getEntry(1));
		}
		else {
			return false;
		}
	},
	clone: function clone(){
		return new kMath.Range2D(this.rangeX.min, this.rangeX.max, this.rangeY.min, this.rangeY.max);
	}
}).implementStatic({
	createFromVectors: function createFromVectors(){
		var minX = Number.POSITIVE_INFINITY;
		var maxX = Number.NEGATIVE_INFINITY;
		var minY = Number.POSITIVE_INFINITY;
		var maxY = Number.NEGATIVE_INFINITY;
		
		for (var i = 0; i < arguments.length; i++){
			minX = Math.min(minX, arguments[i].getEntry(0));
			maxX = Math.max(maxX, arguments[i].getEntry(0));
			minY = Math.min(minY, arguments[i].getEntry(1));
			maxY = Math.max(maxY, arguments[i].getEntry(1));
		}
		return new this(minX, maxX, minY, maxY);
	}
});

})();
(function(){
"use strict";

function Matrix(height, width/*, initializer*/){
	var initializer;
	if (arguments.length > 2){
		initializer = arguments[2];
	}
	
	var storage = [];
	for (var col = width - 1; col >= 0; col -= 1){
		var colI = col * height;
		for (var row = height - 1; row >= 0; row -= 1){
			var i = colI + row;
			storage[i] = initializer? initializer(row, col): 0;
		}
	}
	this.get = function get(row, col){
		if (row < 0 || col < 0 || row >= height || col >= width){
			return undefined;
		}
		return storage[col * height + row];
	}
	this.set = function set(row, col, value){
		if (row < 0 || col < 0 || row >= height || col >= width){
			return this;
		}
		storage[col * height + row] = value;
		return this;
	}
	this.height = height;
	this.width = width;
}

Matrix.prototype.getSubMatrix = function matrixGetSubMatrix(rowOffset, colOffset, height, width, defaultValue){
	var original = this;
	var subMatrix = new Matrix(0, 0);
	subMatrix.height = height;
	subMatrix.width = width;
	
	subMatrix.get = function get(row, col){
		if (row < 0 || col < 0 || row >= height || col >= width){
			return undefined;
		}
		row += rowOffset;
		col += colOffset;
		if (row < 0 || col < 0 || row >= original.height || col >= original.width){
			return defaultValue;
		}
		return original.get(row, col);
	};
	subMatrix.set = function set(row, col, value){
		return original.set(row + rowOffset, col + colOffset, value);
	}
	
	return subMatrix;
	// return new SubMatrix(this, row, col, height, width, defaultValue);
};

Matrix.prototype.getRow = function matrixGetRow(row){
	return this.getSubMatrix(row, 0, 1, this.width, undefined);
};

Matrix.prototype.getCol = function matrixGetCol(col){
	return this.getSubMatrix(0, col, this.height, 1, undefined);
};

Matrix.prototype.every = function matrixEvery(callbackFn/*, thisArg*/){
	if (typeof callbackFn !== "function"){
		throw new TypeError();
	}
	var T;
	if (arguments.length > 1){
		T = arguments[1];
	}
	for (var col = 0; col < this.width; col += 1){
		for (var row = 0; row < this.height; row += 1){
			if (!callbackFn.call(T, this.get(row, col), row, col, this)){
				return false;
			}
		}
	}
	return true;
};

Matrix.prototype.some = function matrixSom(callbackFn/*, thisArg*/){
	if (typeof callbackFn !== "function"){
		throw new TypeError();
	}
	var T;
	if (arguments.length > 1){
		T = arguments[1];
	}
	for (var col = 0; col < this.width; col += 1){
		for (var row = 0; row < this.height; row += 1){
			if (callbackFn.call(T, this.get(row, col), row, col, this)){
				return true;
			}
		}
	}
	return false;
};

Matrix.prototype.forEach = function matrixForEach(callbackFn/*, thisArg*/){
	if (typeof callbackFn !== "function"){
		throw new TypeError();
	}
	var T;
	if (arguments.length > 1){
		T = arguments[1];
	}
	for (var col = 0; col < this.width; col += 1){
		for (var row = 0; row < this.height; row += 1){
			callbackFn.call(T, this.get(row, col), row, col, this);
		}
	}
};

Matrix.prototype.forEachRow = function matrixForEachRow(callbackFn/*, thisArg*/){
	if (typeof callbackFn !== "function"){
		throw new TypeError();
	}
	var T;
	if (arguments.length > 1){
		T = arguments[1];
	}
	for (var row = 0; row < this.height; row += 1){
		callbackFn.call(T, this.getRow(row), row, this);
	}
};

Matrix.prototype.forEachCol = function matrixForEachCol(callbackFn/*, thisArg*/){
	if (typeof callbackFn !== "function"){
		throw new TypeError();
	}
	var T;
	if (arguments.length > 1){
		T = arguments[1];
	}
	for (var col = 0; col < this.width; col += 1){
		callbackFn.call(T, this.getCol(col), col, this);
	}
};

Matrix.prototype.map = function matrixMap(callbackFn/*, thisArg*/){
	if (typeof callbackFn !== "function"){
		throw new TypeError();
	}
	var T;
	if (arguments.length > 1){
		T = arguments[1];
	}
	var This = this;
	return new Matrix(this.height, this.width, function(row, col){
		return callbackFn(T, This.get(row, col), row, col, This);
	});
};

Matrix.prototype.reduce = function matrixReduce(callbackFn/*, initialValue*/){
	if (typeof callbackFn !== "function"){
		throw new TypeError();
	}
	var row = 0;
	var accumulator;
	if (arguments.length > 1){
		accumulator = arguments[1];
	}
	else {
		if (this.width === 0 || this.height === 0){
			throw new TypeError();
		}
		accumulator = this.get(0, 0);
		row = 1;
	}
	for (var col = 0; col < this.width; col += 1){
		for (; row < this.height; row += 1){
			accumulator = callbackFn.call(undefined, accumulator, this.get(row, col), row, col, this);
		}
		row = 0;
	}
	return accumulator;
};

Matrix.prototype.reduceTop = function matrixReduceTop(callbackFn/*, initialValue*/){
	if (typeof callbackFn !== "function"){
		throw new TypeError();
	}
	var col = 0;
	var accumulator;
	if (arguments.length > 1){
		accumulator = arguments[1];
	}
	else {
		if (this.width === 0 || this.height === 0){
			throw new TypeError();
		}
		accumulator = this.get(0, 0);
		col = 1;
	}
	for (var row = 0; row < this.height; row += 1){
		for (; col < this.width; col += 1){
			accumulator = callbackFn.call(undefined, accumulator, this.get(row, col), row, col, this);
		}
		col = 0
	}
	return accumulator;
};

Matrix.prototype.sum = function matrixSum(){
	return this.reduce(function(a, b){return a + b;});
};

Matrix.prototype.prod = function matrixProd(){
	return this.reduce(function(a, b){return a * b;});
};

Matrix.prototype.toString = function matrixToString(){
	var rows = [];
	this.forEachRow(function(row){
		rows.push(
			row.reduce(
				function(col, cell){
					col.push(cell);
					return col;
				},
				[]
			).join(", ")
		);
	});
	return rows.join("\n");
};

Matrix.prototype.toArray = function matrixToArray(){
	var rows = [];
	this.forEachRow(function(row){
		rows.push(
			row.reduce(
				function(col, cell){
					col.push(cell);
					return col;
				},
				[]
			)
		);
	});
	return rows;
}

Matrix.fromArray = function matrixFromArray(arr){
	var height = arr.length;
	var width = arr.reduce(function(v, subArr){return Math.max(v, subArr.length);}, 0);
	
	return new Matrix(height, width, function(row, col){
		return arr[row][col];
	});
};

Matrix.combine = function matrixCombine(m1, m2, callbackFn/*, thisArg*/){
	if (typeof callbackFn !== "function"){
		throw new TypeError();
	}
	var T;
	if (arguments.length > 3){
		T = arguments[3];
	}
	if (typeof m2 === "number"){
		return new Matrix(m1.height, m1.width, function(row, col){
			return callbackFn.call(T, m1.get(row, col), m2, row, col, m1, m2);
		});
	}
	if (m1.height !== m2.height || m1.width !== m2.width){
		throw new Error("Missmatching dimensions");
	}
	return new Matrix(m1.height, m2.width, function(row, col){
		return callbackFn.call(T, m1.get(row, col), m2.get(row, col), row, col, m1, m2);
	});
};

Matrix.add = function matrixAdd(m1, m2){
	return Matrix.combine(m1, m2, function(v1, v2){return v1 + v2;});
};
Matrix.sub = function matrixSub(m1, m2){
	return Matrix.combine(m1, m2, function(v1, v2){return v1 - v2;});
};
Matrix.mul = function matrixMul(m1, m2){
	return Matrix.combine(m1, m2, function(v1, v2){return v1 * v2;});
};
Matrix.div = function matrixDiv(m1, m2){
	return Matrix.combine(m1, m2, function(v1, v2){return v1 / v2;});
};


if (typeof exports !== "undefined"){
	module.exports = Matrix;
}
else if (typeof kkjs !== "undefined"){
	kkjs.Matrix = Matrix;
}

}());
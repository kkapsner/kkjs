(function(){
"use strict";

var kMath = require("kkjs.Math");

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
			storage[i] = initializer? initializer.call(this, row, col): 0;
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
		throw new TypeError("Set operation not allowed on matrix view.");
	}
	
	return subMatrix;
};

Matrix.prototype.getTransposedMatrix = function matrixGetTransposedMatrix(){
	var original = this;
	var trMatrix = new Matrix(0, 0);
	trMatrix.height = this.width;
	trMatrix.width = this.height;
	
	trMatrix.get = function get(row, col){
		return original.get(col, row);
	};
	trMatrix.set = function set(row, col, value){
		throw new TypeError("Set operation not allowed on matrix view.");
	}
	
	return trMatrix;
};

Matrix.prototype.getAntiTransposedMatrix = function matrixGetAntiTransposedMatrix(){
	var original = this;
	var atrMatrix = new Matrix(0, 0);
	atrMatrix.height = this.width;
	atrMatrix.width = this.height;
	
	atrMatrix.get = function get(row, col){
		return original.get(this.width - 1 - col, this.height - 1 - row);
	};
	atrMatrix.set = function set(row, col, value){
		throw new TypeError("Set operation not allowed on matrix view.");
	}
	
	return atrMatrix;
};

Matrix.prototype.getHorizontalFlippedMatrix = function matrixGetHorizontalFlippedMatrix(){
	var original = this;
	var hfMatrix = new Matrix(0, 0);
	hfMatrix.height = this.height;
	hfMatrix.width = this.width;
	
	hfMatrix.get = function get(row, col){
		return original.get(row, this.width - 1 - col);
	};
	hfMatrix.set = function set(row, col, value){
		throw new TypeError("Set operation not allowed on matrix view.");
	}
	
	return hfMatrix;
};

Matrix.prototype.getVerticalFlippedMatrix = function matrixGetVerticalFlippedMatrix(){
	var original = this;
	var vfMatrix = new Matrix(0, 0);
	vfMatrix.height = this.height;
	vfMatrix.width = this.width;
	
	vfMatrix.get = function get(row, col){
		return original.get(this.height - 1 - row, col);
	};
	vfMatrix.set = function set(row, col, value){
		throw new TypeError("Set operation not allowed on matrix view.");
	}
	
	return vfMatrix;
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

Matrix.prototype.conv = function matrixConv(conv/*, outputSize*/){
	var heightChange;
	var rowOffset;
	var widthChange;
	var colOffset;
	var outputSize;
	
	if (arguments.length > 1){
		outputSize = arguments[1];
	}
	else {
		outputSize = "max";
	}
	switch (outputSize){
		case "valid":
			heightChange = 1 - conv.height;
			rowOffset = 0;
			widthChange = 1 - conv.width;
			colOffset = 0;
			break;
		case "original":
			heightChange = 0;
			rowOffset = -Math.floor((conv.height - 1) / 2);
			widthChange = 0;
			colOffset = -Math.floor((conv.width - 1) / 2);
			break;
		default:
			heightChange = conv.height - 1;
			rowOffset = -heightChange;
			widthChange = conv.width - 1;
			colOffset = -widthChange;
			break;
	}
	
	var This = this;
	return new Matrix(
		this.height + heightChange,
		this.width + widthChange,
		function(row, col){
			var subMatrix = This.getSubMatrix(row + rowOffset, col + colOffset, conv.height, conv.width, 0);
			var mul = Matrix.mul(subMatrix, conv);
			return mul.sum();
		}
	);
};

Matrix.prototype.det = function matrixDeterminant(){
	if (this.width !== 2 || this.height !== 2){
		throw new TypeError("Currently only the determinant of 2x2 matrices supported.");
	}
	return this.get(0, 0) * this.get(1, 1) - this.get(0, 1) * this.get(1, 0);
};

Matrix.prototype.invert = function matrixInvert(){
	if (this.width !== this.height){
		throw new TypeError("Pseudoinvertion not supported.");
	}
	if (this.width !== 2){
		throw new TypeError("Currently only invertion of 2x2 matices supported.");
	}
	var det = this.det();
	return Matrix.fromArray([
		[this.get(1, 1), -1 * this.get(0, 1)],
		[-1 * this.get(1, 0), this.get(0, 0)]
	]);
};

Matrix.prototype.join = function matrixJoin(rowJoin, colJoin){
	var rows = [];
	this.forEachRow(function(row){
		rows.push(
			row.reduce(
				function(col, cell){
					col.push(cell);
					return col;
				},
				[]
			).join(rowJoin)
		);
	});
	return rows.join(colJoin);
	
};

Matrix.prototype.toString = function matrixToString(){
	return this.join(", ", "\n");
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
};

Matrix.prototype.clone = function matrixClone(){
	var This = this;
	return new Matrix(this.height, this.width, function(row, col){
		return This.get(row, col);
	});
};

Matrix.fromArray = function matrixFromArray(arr){
	var height = arr.length;
	var width = arr.reduce(function(v, subArr){return Math.max(v, subArr.length);}, 0);
	
	return new Matrix(height, width, function(row, col){
		return arr[row][col];
	});
};

Matrix.fromVector = function matrixFromVector(vector, horizontal){
	return new Matrix(!horizontal? vector.getLength(): 1, horizontal? vector.getLength(): 1, function(row, col){
		return vector.getEntry(row * col);
	});
}

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

Matrix.concatHorizontal = function matrixConcatHorizontal(m1, m2){
	if (m1.height !== m2.height){
		throw new Error("Missmatching dimensions");
	}
	
	return new Matrix(m1.height, m1.width + m2.width, function(row, col){
		if (col < m1.width){
			return m1.get(row, col);
		}
		else {
			return m2.get(row, col - m1.width);
		}
	});
};

Matrix.concatVertical = function matrixConcatVertical(m1, m2){
	if (m1.width !== m2.width){
		throw new Error("Missmatching dimensions");
	}
	
	return new Matrix(m1.height + m2.height, m1.width, function(row, col){
		if (row < m1.height){
			return m1.get(row, col);
		}
		else {
			return m2.get(row - m1.height, col);
		}
	});
};

Matrix.prod = function matrixProduct(m1, m2){
	if (m1.width !== m2.height){
		throw new Error("Missmatching dimensions");
	}
	
	return new Matrix(m1.height, m2.width, function(row, col){
		var sum = 0;
		for (var i = m1.width - 1; i >= 0; i -= 1){
			sum += m1.get(row, i) * m2.get(i, col);
		}
		return sum;
	});
};

if (typeof exports !== "undefined"){
	module.exports = Matrix;
}
else if (typeof kkjs !== "undefined"){
	kkjs.Matrix = Matrix;
}

}());
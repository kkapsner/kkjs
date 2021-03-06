(function(){

"use strict";

/**
 * Object crypt.AES
 * @name: crypt.AES
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description: crypt.AES description
 * @url: http://csrc.nist.gov/publications/fips/fips197/fips-197.pdf
 */

var sBox = [
	0x63, 0x7C, 0x77, 0x7B, 0xF2, 0x6B, 0x6F, 0xC5, 0x30, 0x01, 0x67, 0x2B, 0xFE, 0xD7, 0xAB, 0x76,
	0xCA, 0x82, 0xC9, 0x7D, 0xFA, 0x59, 0x47, 0xF0, 0xAD, 0xD4, 0xA2, 0xAF, 0x9C, 0xA4, 0x72, 0xC0,
	0xB7, 0xFD, 0x93, 0x26, 0x36, 0x3F, 0xF7, 0xCC, 0x34, 0xA5, 0xE5, 0xF1, 0x71, 0xD8, 0x31, 0x15,
	0x04, 0xC7, 0x23, 0xC3, 0x18, 0x96, 0x05, 0x9A, 0x07, 0x12, 0x80, 0xE2, 0xEB, 0x27, 0xB2, 0x75,
	0x09, 0x83, 0x2C, 0x1A, 0x1B, 0x6E, 0x5A, 0xA0, 0x52, 0x3B, 0xD6, 0xB3, 0x29, 0xE3, 0x2F, 0x84,
	0x53, 0xD1, 0x00, 0xED, 0x20, 0xFC, 0xB1, 0x5B, 0x6A, 0xCB, 0xBE, 0x39, 0x4A, 0x4C, 0x58, 0xCF,
	0xD0, 0xEF, 0xAA, 0xFB, 0x43, 0x4D, 0x33, 0x85, 0x45, 0xF9, 0x02, 0x7F, 0x50, 0x3C, 0x9F, 0xA8,
	0x51, 0xA3, 0x40, 0x8F, 0x92, 0x9D, 0x38, 0xF5, 0xBC, 0xB6, 0xDA, 0x21, 0x10, 0xFF, 0xF3, 0xD2,
	0xCD, 0x0C, 0x13, 0xEC, 0x5F, 0x97, 0x44, 0x17, 0xC4, 0xA7, 0x7E, 0x3D, 0x64, 0x5D, 0x19, 0x73,
	0x60, 0x81, 0x4F, 0xDC, 0x22, 0x2A, 0x90, 0x88, 0x46, 0xEE, 0xB8, 0x14, 0xDE, 0x5E, 0x0B, 0xDB,
	0xE0, 0x32, 0x3A, 0x0A, 0x49, 0x06, 0x24, 0x5C, 0xC2, 0xD3, 0xAC, 0x62, 0x91, 0x95, 0xE4, 0x79,
	0xE7, 0xC8, 0x37, 0x6D, 0x8D, 0xD5, 0x4E, 0xA9, 0x6C, 0x56, 0xF4, 0xEA, 0x65, 0x7A, 0xAE, 0x08,
	0xBA, 0x78, 0x25, 0x2E, 0x1C, 0xA6, 0xB4, 0xC6, 0xE8, 0xDD, 0x74, 0x1F, 0x4B, 0xBD, 0x8B, 0x8A,
	0x70, 0x3E, 0xB5, 0x66, 0x48, 0x03, 0xF6, 0x0E, 0x61, 0x35, 0x57, 0xB9, 0x86, 0xC1, 0x1D, 0x9E,
	0xE1, 0xF8, 0x98, 0x11, 0x69, 0xD9, 0x8E, 0x94, 0x9B, 0x1E, 0x87, 0xE9, 0xCE, 0x55, 0x28, 0xDF,
	0x8C, 0xA1, 0x89, 0x0D, 0xBF, 0xE6, 0x42, 0x68, 0x41, 0x99, 0x2D, 0x0F, 0xB0, 0x54, 0xBB, 0x16
];
var inverseSBox = [
	0x52, 0x09, 0x6A, 0xD5, 0x30, 0x36, 0xA5, 0x38, 0xBF, 0x40, 0xA3, 0x9E, 0x81, 0xF3, 0xD7, 0xFB,
	0x7C, 0xE3, 0x39, 0x82, 0x9B, 0x2F, 0xFF, 0x87, 0x34, 0x8E, 0x43, 0x44, 0xC4, 0xDE, 0xE9, 0xCB,
	0x54, 0x7B, 0x94, 0x32, 0xA6, 0xC2, 0x23, 0x3D, 0xEE, 0x4C, 0x95, 0x0B, 0x42, 0xFA, 0xC3, 0x4E,
	0x08, 0x2E, 0xA1, 0x66, 0x28, 0xD9, 0x24, 0xB2, 0x76, 0x5B, 0xA2, 0x49, 0x6D, 0x8B, 0xD1, 0x25,
	0x72, 0xF8, 0xF6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xD4, 0xA4, 0x5C, 0xCC, 0x5D, 0x65, 0xB6, 0x92,
	0x6C, 0x70, 0x48, 0x50, 0xFD, 0xED, 0xB9, 0xDA, 0x5E, 0x15, 0x46, 0x57, 0xA7, 0x8D, 0x9D, 0x84,
	0x90, 0xD8, 0xAB, 0x00, 0x8C, 0xBC, 0xD3, 0x0A, 0xF7, 0xE4, 0x58, 0x05, 0xB8, 0xB3, 0x45, 0x06,
	0xD0, 0x2C, 0x1E, 0x8F, 0xCA, 0x3F, 0x0F, 0x02, 0xC1, 0xAF, 0xBD, 0x03, 0x01, 0x13, 0x8A, 0x6B,
	0x3A, 0x91, 0x11, 0x41, 0x4F, 0x67, 0xDC, 0xEA, 0x97, 0xF2, 0xCF, 0xCE, 0xF0, 0xB4, 0xE6, 0x73,
	0x96, 0xAC, 0x74, 0x22, 0xE7, 0xAD, 0x35, 0x85, 0xE2, 0xF9, 0x37, 0xE8, 0x1C, 0x75, 0xDF, 0x6E,
	0x47, 0xF1, 0x1A, 0x71, 0x1D, 0x29, 0xC5, 0x89, 0x6F, 0xB7, 0x62, 0x0E, 0xAA, 0x18, 0xBE, 0x1B,
	0xFC, 0x56, 0x3E, 0x4B, 0xC6, 0xD2, 0x79, 0x20, 0x9A, 0xDB, 0xC0, 0xFE, 0x78, 0xCD, 0x5A, 0xF4,
	0x1F, 0xDD, 0xA8, 0x33, 0x88, 0x07, 0xC7, 0x31, 0xB1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xEC, 0x5F,
	0x60, 0x51, 0x7F, 0xA9, 0x19, 0xB5, 0x4A, 0x0D, 0x2D, 0xE5, 0x7A, 0x9F, 0x93, 0xC9, 0x9C, 0xEF,
	0xA0, 0xE0, 0x3B, 0x4D, 0xAE, 0x2A, 0xF5, 0xB0, 0xC8, 0xEB, 0xBB, 0x3C, 0x83, 0x53, 0x99, 0x61,
	0x17, 0x2B, 0x04, 0x7E, 0xBA, 0x77, 0xD6, 0x26, 0xE1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0C, 0x7D
];

var rcon = [
	0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a,
	0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39,
	0x72, 0xe4, 0xd3, 0xbd, 0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a,
	0x74, 0xe8, 0xcb, 0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8,
	0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef,
	0xc5, 0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd, 0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc,
	0x83, 0x1d, 0x3a, 0x74, 0xe8, 0xcb, 0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b,
	0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3,
	0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd, 0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94,
	0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a, 0x74, 0xe8, 0xcb, 0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20,
	0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63, 0xc6, 0x97, 0x35,
	0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd, 0x61, 0xc2, 0x9f,
	0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a, 0x74, 0xe8, 0xcb, 0x8d, 0x01, 0x02, 0x04,
	0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36, 0x6c, 0xd8, 0xab, 0x4d, 0x9a, 0x2f, 0x5e, 0xbc, 0x63,
	0xc6, 0x97, 0x35, 0x6a, 0xd4, 0xb3, 0x7d, 0xfa, 0xef, 0xc5, 0x91, 0x39, 0x72, 0xe4, 0xd3, 0xbd,
	0x61, 0xc2, 0x9f, 0x25, 0x4a, 0x94, 0x33, 0x66, 0xcc, 0x83, 0x1d, 0x3a, 0x74, 0xe8, 0xcb, 0x8d
];

/**
 * number of rounds for given blocksize - keysize pair
 * first index: block size
 * second index: key size
 */
var r = {
	128: {128: 10, 160: 11, 192: 12, 224: 13, 256: 14},
	160: {128: 11, 160: 11, 192: 12, 224: 13, 256: 14},
	192: {128: 12, 160: 12, 192: 12, 224: 13, 256: 14},
	224: {128: 13, 160: 13, 192: 13, 224: 13, 256: 14},
	256: {128: 14, 160: 14, 192: 14, 224: 14, 256: 14}
};

/**
 * number of shifts in the specific row for given block size
 */
var shifts = {
	128: [0, 1, 2, 3],
	160: [0, 1, 2, 3],
	192: [0, 1, 2, 3],
	224: [0, 1, 2, 4],
	256: [0, 1, 3, 4]
};

function isValidBitSize(size, inBytes){
	/**
	 * Function isValidBitSize
	 * @name: isValidBitSize
	 * @author: Korbinian Kapsner
	 * @description: Checks if the given size is valid for AES.
	 * @parameter:
	 *	size: the size to check
	 *	inBytes: if the size is given in bytes
	 * @return value: if AES can handle the bit size
	 */
	
	if (inBytes){
		size *= 8;
	}
	return !!r[size];
}

function applySBox(input){
	/**
	 * Function applySBox
	 * @name: applySBox
	 * @author: Korbinian Kapsner
	 * @description: applies the S-Box to the input string.
	 * @parameter:
	 *	input: the input string.
	 * @return value: the modified string.
	 */
	
	var out = "";
	for (var i = 0; i < input.length; i++){
		out += String.fromCharCode(sBox[input.charCodeAt(i)]);
	}
	return out;
}

function applyInverseSBox(input){
	/**
	 * Function applyInverseSBox
	 * @name: applyInverseSBox
	 * @author: Korbinian Kapsner
	 * @description: applies the inverse S-Box to the input string.
	 * @parameter:
	 *	input: the input string.
	 * @return value: the modified string.
	 */
	
	var out = "";
	for (var i = 0; i < input.length; i++){
		out += String.fromCharCode(inverseSBox[input.charCodeAt(i)]);
	}
	return out;
}

function xor(str, num, i){
	/**
	 * Function xor
	 * @name: xor
	 * @author: Korbinian Kapsner
	 * @description: Performs an XOR
	 * @parameter:
	 *	str: the string where the XOR should be performed in
	 *	num: the XOR number
	 *	i: the position in the string where the XOR is computed
	 * @return value: the modified string
	 */
	return str.substring(0, i) +
		String.fromCharCode(
			str.charCodeAt(i) ^ num
		) +
		str.substring(i + 1);
}

function xorStr(str1, str2){
	/**
	 * Function xorStr
	 * @name: xorStr
	 * @author: Korbinian Kapsner
	 * @description: XORs two strings
	 * @parameter:
	 *	str1: first string
	 *	str2: second string
	 * @return value: the XORed string
	 */
	var out = "";
	var minLength = Math.min(str1.length, str2.length);
	for (var i = 0; i < minLength; i++){
		out += String.fromCharCode(
			str1.charCodeAt(i) ^ str2.charCodeAt(i)
		);
	}
	return out;
}

function times(time, nr){
	/**
	 * Function times
	 * @name: times
	 * @author: Korbinian Kapsner
	 * @description: Computes the "times" operation
	 * @parameter:
	 *	time:
	 *	nr:
	 * @return value: the computed value
	 */
	switch (time){
		case 1:
			return nr;
		case 2:
			if (nr < 0x80){
				return 2*nr;
			}
			else {
				return (2*nr) ^ 0x11B;
			}
		default:
			var ret = 0;
			if (time & 1){
				ret = nr;
				time--;
			}
			return ret ^ times(2, times(time / 2, nr));
	}
}

function mixColumnGeneral(col, v){
	/**
	 * Function mixColumnGeneral
	 * @name: mixColumnGeneral
	 * @author: Korbinian Kapsner
	 * @description: a general implementation of the mix column step
	 * @parameter:
	 *	col: column to be mixed
	 *	v: mix vector
	 * @return value: the mixed string.
	 */
	var a = [];
	for (var i = 0; i < 4; i++){
		a[i] = col.charCodeAt(i);
	}
	return String.fromCharCode(
		(times(v[0], a[0]) ^ times(v[3], a[1]) ^ times(v[2], a[2]) ^ times(v[1], a[3])),
		(times(v[1], a[0]) ^ times(v[0], a[1]) ^ times(v[3], a[2]) ^ times(v[2], a[3])),
		(times(v[2], a[0]) ^ times(v[1], a[1]) ^ times(v[0], a[2]) ^ times(v[3], a[3])),
		(times(v[3], a[0]) ^ times(v[2], a[1]) ^ times(v[1], a[2]) ^ times(v[0], a[3]))
	);
}

function mixColumn(col){
	/**
	 * Function mixColumn
	 * @name: mixColumn
	 * @author: Korbinian Kapsner
	 * @description: performs the mix column step.
	 * @parameter:
	 *	col: the column
	 * @return value: the computed string
	 */
	return mixColumnGeneral(col, [2, 1, 1, 3]);
}
function inverseMixColumn(col){
	/**
	 * Function inverseMixColumn
	 * @name: inverseMixColumn
	 * @author: Korbinian Kapsner
	 * @description: performs the inverse mix column step.
	 * @parameter:
	 *	col: the column
	 * @return value: the computed string
	 */
	return mixColumnGeneral(col, [0x0e, 0x09, 0x0d, 0x0b]);
}

function getRows(block){
	/**
	 * Function getRows
	 * @name: getRows
	 * @author: Korbinian Kapsner
	 * @description: calculate the rows from a block.
	 * @parameter:
	 *	block: the current block
	 * @return value: the rows
	 */
	var rows = ["", "", "", ""];
	for (var i = 0; i < block.length; i += 4){
		for (var j = 0; j < 4; j++){
			rows[j] += block.charAt(i + j);
		}
	}
	return rows;
}
function shiftRow(row, shift){
	/**
	 * Function shiftRow
	 * @name: shiftRow
	 * @author: Korbinian Kapsner
	 * @description: shifts a row
	 * @parameter:
	 *	row: the row to shift
	 *	shift: the number of shifts.
	 * @return value: the shifted rows.
	 */
	return row.substring(shift) + row.substring(0, shift);
}
function getBlockFromRows(rows){
	/**
	 * Function getBlockFromRows
	 * @name: getBlockFromRows
	 * @author: Korbinian Kapsner
	 * @description: creates a block from rows.
	 * @parameter:
	 *	rows: the rows
	 * @return value: the created block
	 */
	var block = "";
	for (var i = 0; i < rows[0].length; i++){
		for (var j = 0; j < 4; j++){
			block += rows[j].charAt(i);
		}
	}
	return block;
}

function keyScheduleCore(fourBytesString, rconIndex){
	/**
	 * Function keyScheduleCore
	 * @name: keyScheduleCore
	 * @author: Korbinian Kapsner
	 * @description: performs the key schedule core.
	 * @parameter:
	 *	fourBytesString:
	 *	rconIndex:
	 * @return value: the calculated value
	 */
	// rotate
	var out = fourBytesString.substring(1) + fourBytesString.charAt(0);
	// apply Rijndael's S-box
	out = applySBox(out);
	// apply XOR
	out = xor(out, rcon[rconIndex], 0);
	
	return out;
}

var AES = {
	utils: {
		/**
		 * Function crypt.AES.utils.isValidBitSize
		 * @name: crypt.AES.utils.isValidBitSize
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 23.04.2013
		 * @description: checks if the given bit size is supported by AES
		 * @parameter:
		 *	size: bitSize to check
		 *	[inBytes: if the number is in bytes not in bits.]
		 */
		
		isValidBitSize: isValidBitSize,
		
		/**
		 * Function crypt.AES.utils.xorStr
		 * @name: crypt.AES.utils.xorStr
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 23.04.2013
		 * @description: xor's two string
		 * @parameter:
		 *	str1: first string to be xor'ed
		 *	str2: second string to be xor'ed
		 */
		
		xorStr: xorStr,
		
	},
	
	expandKey: function(key, blockSize){
		/**
		 * Function crypt.AES.expandKey
		 * @name: crypt.AES.expandKey
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 23.04.2013
		 * @description: 
		 * @parameter:
		 *	key: the used key
		 *	blockSize: blocksize to use
		 */
		
		var keySize = key.length;
		if (!isValidBitSize(keySize, true)){
			throw new Error("Unsupported key size.");
		}
		else if (key.match(/[^\x00-\xFF]/)){
			throw new Error("Only 8-bit characters allowed");
		}
		var requiredKeySize = (r[blockSize][keySize * 8] + 1) * blockSize / 8;
		
		var expandedKey = key;
		var rcon = 1;
		
		var t;
		function xorAndExpand(){
			/* XOR the key and expand */
			
			t = xorStr(
				t,
				expandedKey.substr(expandedKey.length - keySize, 4)
			);
			expandedKey += t;
		}
		while (expandedKey.length < requiredKeySize){
			t = expandedKey.substring(expandedKey.length - 4);
			
			t = keyScheduleCore(t, rcon);
			rcon++;
			
			xorAndExpand();
			
			for (var i = 0; i < 3; i++){
				xorAndExpand();
			}
			if (keySize === 32){
				t = applySBox(t);
				xorAndExpand();
			}
			
			for (var i = {16: 0, 20: 1, 24: 2, 28: 3, 32: 3}[keySize]; i > 0; i--){
				xorAndExpand();
			}
		}
		
		return expandedKey.substr(0, requiredKeySize);
	}.setDefaultParameter(null, new Function.DefaultParameter(128, {checkFunction: function(size){
		/* check if the bit size is valid */
		return isValidBitSize(size);
	}})),
	
	encryptBlock: function(block, expandedKey){
		/**
		 * Function crypt.AES.encryptBlock
		 * @name: crypt.AES.encryptBlock
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 23.04.2013
		 * @description: 
		 * @parameter:
		 *	block: the block to be encrypted
		 *	expandedKey: the expanded key from expandKey
		 */
		
		var blockSize = block.length;
		
		function xorWithKey(){
			/* block XOR key */
			
			block = xorStr(block, expandedKey);
			expandedKey = expandedKey.substring(blockSize);
		}
		function shiftRows(){
			/* shift all rows */
			
			var rows = getRows(block);
			for (var i = 1; i < 4; i++){
				rows[i] = shiftRow(rows[i], shifts[blockSize * 8][i]);
			}
			block = getBlockFromRows(rows);
		}
		function mixColumns(){
			/* mix the columns */
			
			var newBlock = "";
			for (i = 0; i < blockSize; i += 4){
				newBlock += mixColumn(block.substring(i));
			}
			block = newBlock;
		}
		
		//this.displayBlock(block);
		xorWithKey();//this.displayBlock(block);
		
		while (expandedKey.length > blockSize){
			block = applySBox(block);//this.displayBlock(block);
			shiftRows();//this.displayBlock(block);
			mixColumns();//this.displayBlock(block);
			xorWithKey();//this.displayBlock(block);
		}
		block = applySBox(block);//this.displayBlock(block);
		shiftRows();//this.displayBlock(block);
		xorWithKey();//this.displayBlock(block);
		
		return block;
	 },
	 
	decryptBlock: function(block, expandedKey){
		/**
		 * Function crypt.AES.decryptBlock
		 * @name: crypt.AES.decryptBlock
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 23.04.2013
		 * @description: 
		 * @parameter:
		 *	block: the block to be decrypted
		 *	expandedKey: the expanded key from expandKey
		 */
		
		var blockSize = block.length;
		
		function xorWithKey(){
			/* block XOR key */
			
			var keySize = expandedKey.length;
			block = xorStr(block, expandedKey.substring(keySize - blockSize));
			expandedKey = expandedKey.substring(0, keySize - blockSize);
		}
		function shiftRows(){
			/* shift the rows */
			
			var rows = getRows(block);
			for (var i = 1; i < 4; i++){
				rows[i] = shiftRow(rows[i], rows[i].length - shifts[blockSize * 8][i]);
			}
			block = getBlockFromRows(rows);
		}
		function mixColumns(){
			/* mix the columns */
			
			var newBlock = "";
			for (i = 0; i < blockSize; i += 4){
				newBlock += inverseMixColumn(block.substring(i));
			}
			block = newBlock;
		}
		
		//this.displayBlock(block);
		
		xorWithKey();//this.displayBlock(block);
		shiftRows();//this.displayBlock(block);
		block = applyInverseSBox(block);//this.displayBlock(block);
		
		while (expandedKey.length > blockSize){
			xorWithKey();//this.displayBlock(block);
			mixColumns();//this.displayBlock(block);
			shiftRows();//this.displayBlock(block);
			block = applyInverseSBox(block);//this.displayBlock(block);
		}
		xorWithKey();//this.displayBlock(block);
		
		return block;
	 },
	
	displayBlock: function(block){
		/**
		 * Function crypt.AES.displayBlock
		 * @name: crypt.AES.displayBlock
		 * @version: 0.9
		 * @author: Korbinian Kapsner
		 * @last modify: 23.04.2013
		 * @description: 
		 * @parameter:
		 *	block: the block to be displayed in console
		 */
		
		console.log(getRows(block).map(function(r){
			return r.split("").map(function(c){
				var str = c.charCodeAt(0).toString(16);
				if (str.length < 2){
					str = "0" + str;
				}
				return str;
			}).join(" | ");
		}).join("\n"));
	 }
};

if (typeof exports !== "undefined"){
	for (var i in AES){
		if (AES.hasOwnProperty(i)){
			exports[i] = AES[i];
		}
	}
}
else if (typeof kkjs !== "undefined"){
	kkjs.crypt.AES = AES;
}

})();
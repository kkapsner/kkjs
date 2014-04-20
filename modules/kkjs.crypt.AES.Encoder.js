(function(){

"use strict";

var EventEmitter = require("./kkjs.EventEmitter");
var AES = require("./kkjs.crypt.AES");
var blockModes = require("./kkjs.crypt.AES.blockModes");

var Encoder = EventEmitter.extend(function AESEncoder(key, blockSize){
	/**
	 * Constructor crypt.AES.Encoder
	 * @name: crypt.AES.Encoder
	 * @version: 0.9
	 * @author: Korbinian Kapsner
	 * @last modify: 23.04.2013
	 * @description: 
	 * @parameter:
	 *	key: the used key
	 *	blockSize: blocksize to be used
	 */
	
	this.setKey(key);
	this.setBlockSize(blockSize);
}.setDefaultParameter(null, 128)).implement({
	blockSize: 128,
	key: null,
	expandedKey: null,
	iv: "\x00".repeat(16),
	mode: "OFB",
	setBlockSize: function(blockSize){
		/**
		 * Function Encoder.setBlockSize
		 * @name: Encoder.setBlockSize
		 * @author: Korbinian Kapsner
		 * @description: Setter for the blocksize to be used.
		 * @parameter:
		 *	blockSize: new block size.
		 */
		
		if (!AES.utils.isValidBitSize(blockSize)){
			throw new Error("Not supported block size (" + blockSize + ").");
		}
		this.blockSize = blockSize;
		if (this.key){
			this.expandedKey = AES.expandKey(this.key, blockSize);
		}
		this.emit("set.blockSize", blockSize);
	},
	setKey: function(key){
		/**
		 * Function Encoder.setKey
		 * @name: Encoder.setKey
		 * @author: Korbinian Kapsner
		 * @description: Setter for the key to be used.
		 * @parameter:
		 *	key: new key.
		 */
		
		// expandKey throws error if key is not valid.
		this.expandedKey = AES.expandKey(key, this.blockSize);
		this.key = key;
		this.emit("set.key", key);
	},
	encrypt: function(str){
		/**
		 * Function Encoder.encrypt
		 * @name: Encoder.encrypt
		 * @author: Korbinian Kapsner
		 * @description: Encrypts a string with the current settings of the
		 *	encoder.
		 * @parameter:
		 *	str: String to be encrypted.
		 */
		
		this.emit("encrypt", str);
		var blockByteSize = this.blockSize / 8;
		
		var mode = blockModes[this.mode];
		if (!mode){
			throw new Error("Unknown block mode.");
		}
		if (!mode.stream){
			// make string fit into the blocks
			var exeed;
			if ((exeed = str.length % blockByteSize) !== 0){
				this.emit("pad", exeed);
				for (var i = blockByteSize - exeed; i > 0; i--){
					str += "\x00";
				}
			}
		}
		var blockCount = Math.ceil(str.length / blockByteSize);
		
		var ciphered = "";
		var blocks = new Array(blockCount);
		var cipheredBlocks = new Array(blockCount);
		
		for (var i = 0; i < blockCount; i++){
			blocks[i] = str.substr(i * blockByteSize, blockByteSize);
			ciphered += mode.encrypt(blocks, cipheredBlocks, i, this.expandedKey, this.iv);
		}
		if (mode.doNotUseReturnValue){
			ciphered = cipheredBlocks.join("");
		}
		this.emit("encrypted", str, ciphered);
		return ciphered;
	},
	decrypt: function(str){
		/**
		 * Function Encoder.decrypt
		 * @name: Encoder.decrypt
		 * @author: Korbinian Kapsner
		 * @description: Encrypts a string with the current settings of the
		 *	encoder.
		 * @parameter:
		 *	str: String to be decrypted.
		 */
		
		this.emit("decrypt", str);
		var blockByteSize = this.blockSize / 8;
		var mode = blockModes[this.mode];
		if (!mode){
			throw new Error("Unknown block mode.");
		}
		
		var blockCount = Math.ceil(str.length / blockByteSize);
		
		var deciphered = "";
		var inputBlocks = new Array(blockCount);
		var outputBlocks = new Array(blockCount);
		
		for (var i = 0; i < blockCount; i++){
			inputBlocks[i] = str.substr(i * blockByteSize, blockByteSize);
			deciphered += mode.decrypt(inputBlocks, outputBlocks, i, this.expandedKey, this.iv);
		}
		if (mode.doNotUseReturnValue){
			deciphered = outputBlocks.join("");
		}
		this.emit("decrypted", str, deciphered);
		return deciphered;
	}
});

if (typeof exports !== "undefined"){
	module.exports = Encoder;
}
else if (typeof kkjs !== "undefined"){
	kkjs.crypt.AES.Encoder = Encoder;
}

})();
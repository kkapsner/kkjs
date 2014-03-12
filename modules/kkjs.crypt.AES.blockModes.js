(function(){

"use strict";

var AES = require("./kkjs.crypt.AES");

/**
 * Object crypt.AES.blockModes
 * @name: crypt.AES.blockModes
 * @version: 0.9
 * @author: Korbinian Kapsner
 * @last modify: 27.04.2013
 * @description: 
 * @TODO: implement ciphertext-stealing (url: http://en.wikipedia.org/wiki/Ciphertext_stealing)
 */

var blockModes = {
	ECB: {
		encrypt: function(blocks, cipheredBlocks, currentIndex, expandedKey){
			var block = blocks[currentIndex];
			return cipheredBlocks[currentIndex] = AES.encryptBlock(block, expandedKey)
		},
		decrypt: function(cipheredBlocks, blocks, currentIndex, expandedKey){
			var block = cipheredBlocks[currentIndex];
			return blocks[currentIndex] = AES.decryptBlock(block, expandedKey)
		}
	},
	CBC: {
		encrypt: function(blocks, cipheredBlocks, currentIndex, expandedKey, iv){
			var block = blocks[currentIndex];
			if (currentIndex){
				iv = cipheredBlocks[currentIndex - 1];
			}
			
			return cipheredBlocks[currentIndex] = AES.encryptBlock(
				AES.utils.xorStr(block, iv),
				expandedKey
			);
		},
		decrypt: function(cipheredBlocks, blocks, currentIndex, expandedKey, iv){
			var block = cipheredBlocks[currentIndex];
			if (currentIndex){
				iv = cipheredBlocks[currentIndex - 1];
			}
			
			return blocks[currentIndex] = AES.utils.xorStr(
				AES.decryptBlock(
					block,
					expandedKey
				),
				iv
			);
		}
	},
	PCBC: {
		encrypt: function(blocks, cipheredBlocks, currentIndex, expandedKey, iv){
			var block = blocks[currentIndex];
			if (currentIndex){
				iv = AES.utils.xorStr(blocks[currentIndex - 1], cipheredBlocks[currentIndex - 1]);
			}
			
			return cipheredBlocks[currentIndex] = AES.encryptBlock(
				AES.utils.xorStr(block, iv),
				expandedKey
			);
		},
		decrypt: function(cipheredBlocks, blocks, currentIndex, expandedKey, iv){
			var block = cipheredBlocks[currentIndex];
			if (currentIndex){
				iv = AES.utils.xorStr(blocks[currentIndex - 1], cipheredBlocks[currentIndex - 1]);
			}
			
			return blocks[currentIndex] = AES.utils.xorStr(
				AES.decryptBlock(
					block,
					expandedKey
				),
				iv
			);
		}
	},
	CFB: {
		stream: true,
		encrypt: function(blocks, cipheredBlocks, currentIndex, expandedKey, iv){
			var block = blocks[currentIndex];
			if (currentIndex){
				iv = cipheredBlocks[currentIndex - 1];
			}
			
			return cipheredBlocks[currentIndex] = AES.utils.xorStr(
				AES.encryptBlock(
					iv,
					expandedKey
				),
				block
			);
		},
		decrypt: function(cipheredBlocks, blocks, currentIndex, expandedKey, iv){
			var block = cipheredBlocks[currentIndex];
			if (currentIndex){
				iv = cipheredBlocks[currentIndex - 1];
			}
			
			return blocks[currentIndex] = AES.utils.xorStr(
				AES.encryptBlock(
					iv,
					expandedKey
				),
				block
			);
		}
	},
	OFB: {
		stream: true,
		encrypt: function(blocks, cipheredBlocks, currentIndex, expandedKey, iv){
			var block = blocks[currentIndex];
			if (currentIndex){
				iv = cipheredBlocks[currentIndex - 1];
			}
			cipheredBlocks[currentIndex] = AES.encryptBlock(iv, expandedKey);
			return AES.utils.xorStr(block, cipheredBlocks[currentIndex]);
		},
		decrypt: function(cipheredBlocks, blocks, currentIndex, expandedKey, iv){
			return this.encrypt(cipheredBlocks, blocks, currentIndex, expandedKey, iv);
		}
	},
	CTR: {
		stream: true,
		encrypt: function(blocks, cipheredBlocks, currentIndex, expandedKey, iv){
			var block = blocks[currentIndex];
			var ctr = "", bits = currentIndex;
			while (bits){
				ctr = String.fromCharCode(bits & 0xFF) + ctr;
				bits >>= 8;
			}
			ctr = "\x00".repeat(iv.length - ctr.length) + ctr;
			
			iv = AES.utils.xorStr(iv, ctr);
			return cipheredBlocks[currentIndex] = AES.utils.xorStr(
				AES.encryptBlock(
					iv,
					expandedKey
				),
				block
			);
		},
		decrypt: function(cipheredBlocks, blocks, currentIndex, expandedKey, iv){
			return this.encrypt(cipheredBlocks, blocks, currentIndex, expandedKey, iv);
		}
	}
};

if (typeof exports !== "undefined"){
	module.exports = blockModes;
}
else if (typeof kkjs !== "undefined"){
	kkjs.crypt.AES.blockModes = blockModes;
}

})();
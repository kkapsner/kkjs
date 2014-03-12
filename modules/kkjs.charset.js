/*jshint bitwise: false*/
(function(){

"use strict";

/**
 * Object charset
 * @name: charset
 * @author: Korbinian Kapsner
 * @version: 1.0
 * @description:
 */

var utf8 = require("kkjs.utf8");
var utf16 = require("kkjs.utf16");
var base64 = require("kkjs.base64");

var convertMap = {
	"ASCII": {
		mapping: true,
		map: {
			nonEqualRegExp: /[^\x00-\x7F]/g,
			unicode: "",
			charset: ""
		}
	},
	"ISO-8859-1": {
		mapping: true,
		map: {
			nonEqualRegExp: /[^\x00-\xFF]/g,
			unicode: "",
			charset: ""
		}
	},
	"ISO-8859-2": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xA1-\xA3\xA5\xA6\xA9-\xAC\xAE\xAF\xB1-\xB3\xB5-\xB7\xB9-\xC0\xC3\xC5\xC6\xC8\xCA\xCC\xCF-\xD2\xD5\xD8\xD9\xDB\xDE\xE0\xE3\xE5\xE6\xE8\xEA\xEC\xEF-\xF2\xF5\xF8\xF9\xFB\xFE\xFF]|[^\x00-\xFF])/g,
			unicode: "\u0104\u02D8\u0141\u013D\u015A\u0160\u015E\u0164\u0179\u017D\u017B\u0105\u02DB\u0142\u013E\u015B\u02C7\u0161\u015F\u0165\u017A\u02DD\u017E\u017C\u0154\u0102\u0139\u0106\u010C\u0118\u011A\u010E\u0110\u0143\u0147\u0150\u0158\u016E\u0170\u0162\u0155\u0103\u013A\u0107\u010D\u0119\u011B\u010F\u0111\u0144\u0148\u0151\u0159\u016F\u0171\u0163\u02D9",
			charset: "\xA1\xA2\xA3\xA5\xA6\xA9\xAA\xAB\xAC\xAE\xAF\xB1\xB2\xB3\xB5\xB6\xB7\xB9\xBA\xBB\xBC\xBD\xBE\xBF\xC0\xC3\xC5\xC6\xC8\xCA\xCC\xCF\xD0\xD1\xD2\xD5\xD8\xD9\xDB\xDE\xE0\xE3\xE5\xE6\xE8\xEA\xEC\xEF\xF0\xF1\xF2\xF5\xF8\xF9\xFB\xFE\xFF"
		}
	},
	"ISO-8859-3": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xA1\xA2\xA6\xA9-\xAC\xAF\xB1\xB6\xB9-\xBC\xBF\xC5\xC6\xD5\xD8\xDD\xDE\xE5\xE6\xF5\xF8\xFD-\xFF]|[^\x00-\xFF])/g,
			unicode: "\u0126\u02D8\u0124\u0130\u015E\u011E\u0134\u017B\u0127\u0125\u0131\u015F\u011F\u0135\u017C\u010A\u0108\u0120\u011C\u016C\u015C\u010B\u0109\u0121\u011D\u016D\u015D\u02D9",
			charset: "\xA1\xA2\xA6\xA9\xAA\xAB\xAC\xAF\xB1\xB6\xB9\xBA\xBB\xBC\xBF\xC5\xC6\xD5\xD8\xDD\xDE\xE5\xE6\xF5\xF8\xFD\xFE\xFF"
		}
	},
	"ISO-8859-4": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xA1-\xA3\xA5\xA6\xA9-\xAC\xAE\xB1-\xB3\xB5-\xB7\xB9-\xC0\xC7\xC8\xCA\xCC\xCF-\xD3\xD9\xDD\xDE\xE0\xE7\xE8\xEA\xEC\xEF-\xF3\xF9\xFD-\xFF]|[^\x00-\xFF])/g,
			unicode: "\u0104\u0138\u0156\u0128\u013B\u0160\u0112\u0122\u0166\u017D\u0105\u02DB\u0157\u0129\u013C\u02C7\u0161\u0113\u0123\u0167\u014A\u017E\u014B\u0100\u012E\u010C\u0118\u0116\u012A\u0110\u0145\u014C\u0136\u0172\u0168\u016A\u0101\u012F\u010D\u0119\u0117\u012B\u0111\u0146\u014D\u0137\u0173\u0169\u016B\u02D9",
			charset: "\xA1\xA2\xA3\xA5\xA6\xA9\xAA\xAB\xAC\xAE\xB1\xB2\xB3\xB5\xB6\xB7\xB9\xBA\xBB\xBC\xBD\xBE\xBF\xC0\xC7\xC8\xCA\xCC\xCF\xD0\xD1\xD2\xD3\xD9\xDD\xDE\xE0\xE7\xE8\xEA\xEC\xEF\xF0\xF1\xF2\xF3\xF9\xFD\xFE\xFF"
		}
	},
	"ISO-8859-5": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xA1-\xAC\xAE-\xFF]|[^\x00-\xFF])/g,
			unicode: "\u0401\u0402\u0403\u0404\u0405\u0406\u0407\u0408\u0409\u040A\u040B\u040C\u040E\u040F\u0410\u0411\u0412\u0413\u0414\u0415\u0416\u0417\u0418\u0419\u041A\u041B\u041C\u041D\u041E\u041F\u0420\u0421\u0422\u0423\u0424\u0425\u0426\u0427\u0428\u0429\u042A\u042B\u042C\u042D\u042E\u042F\u0430\u0431\u0432\u0433\u0434\u0435\u0436\u0437\u0438\u0439\u043A\u043B\u043C\u043D\u043E\u043F\u0440\u0441\u0442\u0443\u0444\u0445\u0446\u0447\u0448\u0449\u044A\u044B\u044C\u044D\u044E\u044F\u2116\u0451\u0452\u0453\u0454\u0455\u0456\u0457\u0458\u0459\u045A\u045B\u045C\u00A7\u045E\u045F",
			charset: "\xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xAB\xAC\xAE\xAF\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xBB\xBC\xBD\xBE\xBF\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xDB\xDC\xDD\xDE\xDF\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFB\xFC\xFD\xFE\xFF"
		}
	},
	"ISO-8859-6": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xAC\xBB\xBF\xC1-\xDA\xE0-\xF2]|[^\x00-\xFF])/g,
			unicode: "\u060C\u061B\u061F\u0621\u0622\u0623\u0624\u0625\u0626\u0627\u0628\u0629\u062A\u062B\u062C\u062D\u062E\u062F\u0630\u0631\u0632\u0633\u0634\u0635\u0636\u0637\u0638\u0639\u063A\u0640\u0641\u0642\u0643\u0644\u0645\u0646\u0647\u0648\u0649\u064A\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652",
			charset: "\xAC\xBB\xBF\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2"
		}
	},
	"ISO-8859-7": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xA1\xA2\xA4\xA5\xAA\xAF\xB4-\xB6\xB8-\xBA\xBC\xBE-\xD1\xD3-\xFE]|[^\x00-\xFF])/g,
			unicode: "\u2018\u2019\u20AC\u20AF\u037A\u2015\u0384\u0385\u0386\u0388\u0389\u038A\u038C\u038E\u038F\u0390\u0391\u0392\u0393\u0394\u0395\u0396\u0397\u0398\u0399\u039A\u039B\u039C\u039D\u039E\u039F\u03A0\u03A1\u03A3\u03A4\u03A5\u03A6\u03A7\u03A8\u03A9\u03AA\u03AB\u03AC\u03AD\u03AE\u03AF\u03B0\u03B1\u03B2\u03B3\u03B4\u03B5\u03B6\u03B7\u03B8\u03B9\u03BA\u03BB\u03BC\u03BD\u03BE\u03BF\u03C0\u03C1\u03C2\u03C3\u03C4\u03C5\u03C6\u03C7\u03C8\u03C9\u03CA\u03CB\u03CC\u03CD\u03CE",
			charset: "\xA1\xA2\xA4\xA5\xAA\xAF\xB4\xB5\xB6\xB8\xB9\xBA\xBC\xBE\xBF\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xDB\xDC\xDD\xDE\xDF\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFB\xFC\xFD\xFE"
		}
	},
	"ISO-8859-8": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xAA\xBA\xDF-\xFA\xFD\xFE]|[^\x00-\xFF])/g,
			unicode: "\u00D7\u00F7\u2017\u05D0\u05D1\u05D2\u05D3\u05D4\u05D5\u05D6\u05D7\u05D8\u05D9\u05DA\u05DB\u05DC\u05DD\u05DE\u05DF\u05E0\u05E1\u05E2\u05E3\u05E4\u05E5\u05E6\u05E7\u05E8\u05E9\u05EA\u200E\u200F",
			charset: "\xAA\xBA\xDF\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFD\xFE"
		}
	},
	"ISO-8859-9": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xD0\xDD\xDE\xF0\xFD\xFE]|[^\x00-\xFF])/g,
			unicode: "\u011E\u0130\u015E\u011F\u0131\u015F",
			charset: "\xD0\xDD\xDE\xF0\xFD\xFE"
		}
	},
	"ISO-8859-10": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xA1-\xA6\xA8-\xAC\xAE\xAF\xB1-\xB6\xB8-\xC0\xC7\xC8\xCA\xCC\xD1\xD2\xD7\xD9\xE0\xE7\xE8\xEA\xEC\xF1\xF2\xF7\xF9\xFF]|[^\x00-\xFF])/g,
			unicode: "\u0104\u0112\u0122\u012A\u0128\u0136\u013B\u0110\u0160\u0166\u017D\u016A\u014A\u0105\u0113\u0123\u012B\u0129\u0137\u013C\u0111\u0161\u0167\u017E\u2015\u016B\u014B\u0100\u012E\u010C\u0118\u0116\u0145\u014C\u0168\u0172\u0101\u012F\u010D\u0119\u0117\u0146\u014D\u0169\u0173\u0138",
			charset: "\xA1\xA2\xA3\xA4\xA5\xA6\xA8\xA9\xAA\xAB\xAC\xAE\xAF\xB1\xB2\xB3\xB4\xB5\xB6\xB8\xB9\xBA\xBB\xBC\xBD\xBE\xBF\xC0\xC7\xC8\xCA\xCC\xD1\xD2\xD7\xD9\xE0\xE7\xE8\xEA\xEC\xF1\xF2\xF7\xF9\xFF"
		}
	},
	"ISO-8859-11": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xA1-\xDA\xDF-\xFB]|[^\x00-\xFF])/g,
			unicode: "\u0E01\u0E02\u0E03\u0E04\u0E05\u0E06\u0E07\u0E08\u0E09\u0E0A\u0E0B\u0E0C\u0E0D\u0E0E\u0E0F\u0E10\u0E11\u0E12\u0E13\u0E14\u0E15\u0E16\u0E17\u0E18\u0E19\u0E1A\u0E1B\u0E1C\u0E1D\u0E1E\u0E1F\u0E20\u0E21\u0E22\u0E23\u0E24\u0E25\u0E26\u0E27\u0E28\u0E29\u0E2A\u0E2B\u0E2C\u0E2D\u0E2E\u0E2F\u0E30\u0E31\u0E32\u0E33\u0E34\u0E35\u0E36\u0E37\u0E38\u0E39\u0E3A\u0E3F\u0E40\u0E41\u0E42\u0E43\u0E44\u0E45\u0E46\u0E47\u0E48\u0E49\u0E4A\u0E4B\u0E4C\u0E4D\u0E4E\u0E4F\u0E50\u0E51\u0E52\u0E53\u0E54\u0E55\u0E56\u0E57\u0E58\u0E59\u0E5A\u0E5B",
			charset: "\xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xAB\xAC\xAD\xAE\xAF\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xBB\xBC\xBD\xBE\xBF\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xDF\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFB"
		}
	},
	"ISO-8859-13": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xA1\xA5\xA8\xAA\xAF\xB4\xB8\xBA\xBF-\xC3\xC6-\xC8\xCA-\xD2\xD4\xD8-\xDB\xDD\xDE\xE0-\xE3\xE6-\xE8\xEA-\xF2\xF4\xF8-\xFB\xFD-\xFF]|[^\x00-\xFF])/g,
			unicode: "\u201D\u201E\u00D8\u0156\u00C6\u201C\u00F8\u0157\u00E6\u0104\u012E\u0100\u0106\u0118\u0112\u010C\u0179\u0116\u0122\u0136\u012A\u013B\u0160\u0143\u0145\u014C\u0172\u0141\u015A\u016A\u017B\u017D\u0105\u012F\u0101\u0107\u0119\u0113\u010D\u017A\u0117\u0123\u0137\u012B\u013C\u0161\u0144\u0146\u014D\u0173\u0142\u015B\u016B\u017C\u017E\u2019",
			charset: "\xA1\xA5\xA8\xAA\xAF\xB4\xB8\xBA\xBF\xC0\xC1\xC2\xC3\xC6\xC7\xC8\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD4\xD8\xD9\xDA\xDB\xDD\xDE\xE0\xE1\xE2\xE3\xE6\xE7\xE8\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF4\xF8\xF9\xFA\xFB\xFD\xFE\xFF"
		}
	},
	"ISO-8859-14": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xA1\xA2\xA4-\xA6\xA8\xAA-\xAC\xAF-\xB5\xB7-\xBF\xD0\xD7\xDE\xF0\xF7\xFE]|[^\x00-\xFF])/g,
			unicode: "\u1E02\u1E03\u010A\u010B\u1E0A\u1E80\u1E82\u1E0B\u1EF2\u0178\u1E1E\u1E1F\u0120\u0121\u1E40\u1E41\u1E56\u1E81\u1E57\u1E83\u1E60\u1EF3\u1E84\u1E85\u1E61\u0174\u1E6A\u0176\u0175\u1E6B\u0177",
			charset: "\xA1\xA2\xA4\xA5\xA6\xA8\xAA\xAB\xAC\xAF\xB0\xB1\xB2\xB3\xB4\xB5\xB7\xB8\xB9\xBA\xBB\xBC\xBD\xBE\xBF\xD0\xD7\xDE\xF0\xF7\xFE"
		}
	},
	"ISO-8859-15": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\xA4\xA6\xA8\xB4\xB8\xBC-\xBE]|[^\x00-\xFF])/g,
			unicode: "\u20AC\u0160\u0161\u017D\u017E\u0152\u0153\u0178",
			charset: "\xA4\xA6\xA8\xB4\xB8\xBC\xBD\xBE"
		}
	},
	"WINDOWS-1250": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\x80\x82\x84-\x87\x89-\x8F\x91-\x97\x99-\x9F\xA1-\xA3\xA5\xAA\xAF\xB2\xB3\xB9\xBA\xBC-\xC0\xC3\xC5\xC6\xC8\xCA\xCC\xCF-\xD2\xD5\xD8\xD9\xDB\xDE\xE0\xE3\xE5\xE6\xE8\xEA\xEC\xEF-\xF2\xF5\xF8\xF9\xFB\xFE\xFF]|[^\x00-\xFF])/g,
			unicode: "\u20AC\u201A\u201E\u2026\u2020\u2021\u2030\u0160\u2039\u015A\u0164\u017D\u0179\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u2122\u0161\u203A\u015B\u0165\u017E\u017A\u02C7\u02D8\u0141\u0104\u015E\u017B\u02DB\u0142\u0105\u015F\u013D\u02DD\u013E\u017C\u0154\u0102\u0139\u0106\u010C\u0118\u011A\u010E\u0110\u0143\u0147\u0150\u0158\u016E\u0170\u0162\u0155\u0103\u013A\u0107\u010D\u0119\u011B\u010F\u0111\u0144\u0148\u0151\u0159\u016F\u0171\u0163\u02D9",
			charset: "\x80\x82\x84\x85\x86\x87\x89\x8A\x8B\x8C\x8D\x8E\x8F\x91\x92\x93\x94\x95\x96\x97\x99\x9A\x9B\x9C\x9D\x9E\x9F\xA1\xA2\xA3\xA5\xAA\xAF\xB2\xB3\xB9\xBA\xBC\xBD\xBE\xBF\xC0\xC3\xC5\xC6\xC8\xCA\xCC\xCF\xD0\xD1\xD2\xD5\xD8\xD9\xDB\xDE\xE0\xE3\xE5\xE6\xE8\xEA\xEC\xEF\xF0\xF1\xF2\xF5\xF8\xF9\xFB\xFE\xFF"
		}
	},
	"WINDOWS-1251": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\x80-\x97\x99-\x9F\xA1-\xA3\xA5\xA8\xAA\xAF\xB2-\xB4\xB8-\xBA\xBC-\xFF]|[^\x00-\xFF])/g,
			unicode: "\u0402\u0403\u201A\u0453\u201E\u2026\u2020\u2021\u20AC\u2030\u0409\u2039\u040A\u040C\u040B\u040F\u0452\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u2122\u0459\u203A\u045A\u045C\u045B\u045F\u040E\u045E\u0408\u0490\u0401\u0404\u0407\u0406\u0456\u0491\u0451\u2116\u0454\u0458\u0405\u0455\u0457\u0410\u0411\u0412\u0413\u0414\u0415\u0416\u0417\u0418\u0419\u041A\u041B\u041C\u041D\u041E\u041F\u0420\u0421\u0422\u0423\u0424\u0425\u0426\u0427\u0428\u0429\u042A\u042B\u042C\u042D\u042E\u042F\u0430\u0431\u0432\u0433\u0434\u0435\u0436\u0437\u0438\u0439\u043A\u043B\u043C\u043D\u043E\u043F\u0440\u0441\u0442\u0443\u0444\u0445\u0446\u0447\u0448\u0449\u044A\u044B\u044C\u044D\u044E\u044F",
			charset: "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x99\x9A\x9B\x9C\x9D\x9E\x9F\xA1\xA2\xA3\xA5\xA8\xAA\xAF\xB2\xB3\xB4\xB8\xB9\xBA\xBC\xBD\xBE\xBF\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xDB\xDC\xDD\xDE\xDF\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFB\xFC\xFD\xFE\xFF"
		}
	},
	"WINDOWS-1252": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\x80\x82-\x8C\x8E\x91-\x9C\x9E\x9F]|[^\x00-\xFF])/g,
			unicode: "\u20AC\u201A\u0192\u201E\u2026\u2020\u2021\u02C6\u2030\u0160\u2039\u0152\u017D\u2018\u2019\u201C\u201D\u2022\u2013\u2014\u02DC\u2122\u0161\u203A\u0153\u017E\u0178",
			charset: "\x80\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8E\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9E\x9F"
		}
	},
	"CP866": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\x80-\xFF]|[^\x00-\xFF])/g,
			unicode: "\u0410\u0411\u0412\u0413\u0414\u0415\u0416\u0417\u0418\u0419\u041A\u041B\u041C\u041D\u041E\u041F\u0420\u0421\u0422\u0423\u0424\u0425\u0426\u0427\u0428\u0429\u042A\u042B\u042C\u042D\u042E\u042F\u0430\u0431\u0432\u0433\u0434\u0435\u0436\u0437\u0438\u0439\u043A\u043B\u043C\u043D\u043E\u043F\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u0440\u0441\u0442\u0443\u0444\u0445\u0446\u0447\u0448\u0449\u044A\u044B\u044C\u044D\u044E\u044F\u0401\u0451\u0404\u0454\u0407\u0457\u040E\u045E\u00B0\u2219\u00B7\u221A\u2116\u00A4\u25A0\u00A0",
			charset: "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\xA0\xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xAB\xAC\xAD\xAE\xAF\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xBB\xBC\xBD\xBE\xBF\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xDB\xDC\xDD\xDE\xDF\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFB\xFC\xFD\xFE\xFF"
		}
	},
	"KOI8-R": {
		mapping: true,
		map: {
			nonEqualRegExp: /(?:[\x80-\xFF]|[^\x00-\xFF])/g,
			unicode: "\u2500\u2502\u250C\u2510\u2514\u2518\u251C\u2524\u252C\u2534\u253C\u2580\u2584\u2588\u258C\u2590\u2591\u2592\u2593\u2320\u25A0\u2219\u221A\u2248\u2264\u2265\u00A0\u2321\u00B0\u00B2\u00B7\u00F7\u2550\u2551\u2552\u0451\u2553\u2554\u2555\u2556\u2557\u2558\u2559\u255A\u255B\u255C\u255D\u255E\u255F\u2560\u2561\u0401\u2562\u2563\u2564\u2565\u2566\u2567\u2568\u2569\u256A\u256B\u256C\u00A9\u044E\u0430\u0431\u0446\u0434\u0435\u0444\u0433\u0445\u0438\u0439\u043A\u043B\u043C\u043D\u043E\u043F\u044F\u0440\u0441\u0442\u0443\u0436\u0432\u044C\u044B\u0437\u0448\u044D\u0449\u0447\u044A\u042E\u0410\u0411\u0426\u0414\u0415\u0424\u0413\u0425\u0418\u0419\u041A\u041B\u041C\u041D\u041E\u041F\u042F\u0420\u0421\u0422\u0423\u0416\u0412\u042C\u042B\u0417\u0428\u042D\u0429\u0427\u042A",
			charset: "\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F\xA0\xA1\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xAB\xAC\xAD\xAE\xAF\xB0\xB1\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xBB\xBC\xBD\xBE\xBF\xC0\xC1\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xCB\xCC\xCD\xCE\xCF\xD0\xD1\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xDB\xDC\xDD\xDE\xDF\xE0\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xEB\xEC\xED\xEE\xEF\xF0\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFB\xFC\xFD\xFE\xFF"
		}
	},
	
	"UTF-8": {
		mapping: false,
		unicodeTOcharset: function(str){
			utf8.encode(str);
		},
		charsetTOunicode: function(str){
			utf8.decode(str);
		}
	},
	"UTF-16": {
		mapping: false,
		unicodeTOcharset: function(str){
			utf16.toByteStream(str);
		},
		charsetTOunicode: function(str){
			utf16.fromByteStrem(str);
		}
	},
	"UTF-16BE": {
		mapping: false,
		unicodeTOcharset: function(str){
			utf16.toByteStream(str, false);
		},
		charsetTOunicode: function(str){
			utf16.fromByteStrem(str, false);
		}
	},
	"UTF-16LE": {
		mapping: false,
		unicodeTOcharset: function(str){
			utf16.toByteStream(str, true);
		},
		charsetTOunicode: function(str){
			utf16.fromByteStrem(str, true);
		}
	},
	"UTF-32": {
		mapping: false,
		unicodeTOcharset: function(str){
			return "\x00\x00\xFE\xFF" + convertMap["UTF-32BE"].unicodeTOcharset(str);
		},
		charsetTOunicode: function(str){
			switch (str.substring(0, 4)){
				case "\xFF\xFE\x00\x00":
					return convertMap["UTF-32LE"].charsetToUnicode(str.substring(4));
				case "\x00\x00\xFE\xFF":
					return convertMap["UTF-32BE"].charsetToUnicode(str.substring(4));
				default:
					return convertMap["UTF-32BE"].charsetToUnicode(str);
			}
		}
	},
	"UTF-32BE": {
		mapping: false,
		unicodeTOcharset: function(str){
			var arr = utf16.toCharCodeArray(str);
			var l = arr.length;
			var ret = "";
			for (var i = 0; i < l; i++){
				ret += String.fromCharCode(
					(arr[i] & 0xFF000000) >>> 24,
					(arr[i] & 0x00FF0000) >>> 16,
					(arr[i] & 0x0000FF00) >>> 8,
					(arr[i] & 0x000000FF) >>> 0
				);
			}
			return ret;
		},
		charsetTOunicode: function(str){
			var l = str.length;
			var ret = "";
			for (var i = 0; i < l - 3; i += 4){
				ret += utf16.fromCharCode(
					str.charCodeAt(i + 0) << 24 |
					str.charCodeAt(i + 1) << 16 |
					str.charCodeAt(i + 2) << 8 |
					str.charCodeAt(i + 3) << 0
				);
			}
			return ret;
		}
	},
	"UTF-32LE": {
		mapping: false,
		unicodeTOcharset: function(str){
			var arr = utf16.toCharCodeArray(str);
			var l = arr.length;
			var ret = "";
			for (var i = 0; i < l; i++){
				ret += String.fromCharCode(
					(arr[i] & 0x000000FF) >>> 0,
					(arr[i] & 0x0000FF00) >>> 8,
					(arr[i] & 0x00FF0000) >>> 16,
					(arr[i] & 0xFF000000) >>> 24
				);
			}
			return ret;
		},
		charsetTOunicode: function(str){
			var l = str.length;
			var ret = "";
			for (var i = 0; i < l - 3; i += 4){
				ret += utf16.fromCharCode(
					str.charCodeAt(i + 3) << 24 |
					str.charCodeAt(i + 2) << 16 |
					str.charCodeAt(i + 1) << 8 |
					str.charCodeAt(i + 0) << 0
				);
			}
			return ret;
		}
	},
	
	"UTF-7": {
		mapping: false,
		unicodeTOcharset: function(str, del){
			if (!del){
				del = "+";
			}
			return str.replace(new RegExp(del.quoteRegExp(), "g"), del + "-").replace(/[^\x00-\x7F]+/g, function(m){
				var tooShort = m.length % 3;
				var encoded = base64.encode(utf16.toByteStream(m, false));
				if (tooShort){
					encoded = encoded.substring(0, encoded.length - tooShort);
				}
				return del + encoded + "-";
			});
		},
		charsetTOunicode: function(str, del){
			if (!del){
				del = "+";
			}
			return str.replace(new RegExp(del.quoteRegExp() + "([^\\-]*)\\-", "g"), function(m, c){
				if (c.length === 0){
					return del;
				}
				var tooShort = c.length % 4;
				if (tooShort){
					c += "=".repeat(4 - tooShort);
				}
				return utf16.fromByteStream(base64.decode(c), false);
			});
		}
	},
	"UTF7-IMAP": {
		mapping: false,
		unicodeTOcharset: function(str){
			return convertMap["UTF-7"].unicodeTOcharset(str, "&");
		},
		charsetTOunicode: function(str){
			return convertMap["UTF-7"].charsetTOunicode(str, "&");
		}
	},
	"BASE64": {
		mapping: false,
		unicodeTOcharset: function(str){
			return base64.encode(str);
		},
		charsetTOunicode: function(str){
			return base64.decode(str);
		}
	},
	"HTML-ENTITIES": {
		mapping: false,
		unicodeTOcharset: function(str){
			return str.encodeHTMLEntities();
		},
		charsetTOunicode: function(str){
			return str.decodeHTMLEntities();
		}
	},
	
	"7BIT": {
		mapping: false,
		unicodeTOcharset: function(str){
			var arr = utf16.toCharCodeArray(str);
			var l = arr.length;
			var ret = "";
			for (var i = 0; i < l; i++){
				ret += String.fromCharCode(
					(arr[i] & 0x0000007F) >>> 0
				);
			}
			return ret;
		},
		charsetTOunicode: function(str){
			return str;
		}
	},
	"BYTE": {
		mapping: false,
		unicodeTOcharset: function(str){
			var arr = utf16.toCharCodeArray(str);
			var l = arr.length;
			var ret = "";
			for (var i = 0; i < l; i++){
				ret += String.fromCharCode(
					(arr[i] & 0x000000FF) >>> 0
				);
			}
			return ret;
		},
		charsetTOunicode: function(str){
			return str;
		}
	},
	"BYTE2BE": {
		mapping: false,
		unicodeTOcharset: function(str){
			var arr = utf16.toCharCodeArray(str);
			var l = arr.length;
			var ret = "";
			for (var i = 0; i < l; i++){
				ret += String.fromCharCode(
					(arr[i] & 0x0000FF00) >>> 8,
					(arr[i] & 0x000000FF) >>> 0
				);
			}
			return ret;
		},
		charsetTOunicode: function(str){
			var l = str.length;
			var ret = "";
			for (var i = 0; i < l - 1; i += 2){
				ret += utf16.fromCharCode(
					str.charCodeAt(i + 0) << 8 |
					str.charCodeAt(i + 1) << 0
				);
			}
			return ret;
		}
	},
	"BYTE2LE": {
		mapping: false,
		unicodeTOcharset: function(str){
			var arr = utf16.toCharCodeArray(str);
			var l = arr.length;
			var ret = "";
			for (var i = 0; i < l; i++){
				ret += String.fromCharCode(
					(arr[i] & 0x000000FF) >>> 0,
					(arr[i] & 0x0000FF00) >>> 8
				);
			}
			return ret;
		},
		charsetTOunicode: function(str){
			var l = str.length;
			var ret = "";
			for (var i = 0; i < l - 1; i += 2){
				ret += utf16.fromCharCode(
					str.charCodeAt(i + 1) << 8 |
					str.charCodeAt(i + 0) << 0
				);
			}
			return ret;
		}
	}
};

// aliases
var aliases = {
	"ISO-8859-1":  ["LATIN-1", "LATIN1"],
	"ISO-8859-2":  ["LATIN-2", "LATIN2"],
	"ISO-8859-3":  ["LATIN-3", "LATIN3"],
	"ISO-8859-4":  ["LATIN-4", "LATIN4"],
	"ISO-8859-9":  ["LATIN-5", "LATIN5"],
	"ISO-8859-10": ["LATIN-6", "LATIN6"],
	"ISO-8859-13": ["LATIN-7", "LATIN7"],
	"ISO-8859-14": ["LATIN-8", "LATIN8"],
	"ISO-8859-15": ["LATIN-9", "LATIN9"],
	"ISO-8859-16": ["LATIN-10", "LATIN10"],
	"WINDOWS-1250": ["WINDOWS1250", "CP-1250", "CP1250"],
	"WINDOWS-1251": ["WINDOWS1251", "CP-1251", "CP1251"],
	"WINDOWS-1252": ["WINDOWS1252", "CP-1252", "CP1252"],
	"UTF7-IMAP": ["UTF7IMAP"],
	"CP866": ["IBM866"],
	"UTF-8": ["UTF8"],
	"UTF-16": ["UTF16", "UCS-2", "UCS2"],
	"UTF-16BE": ["UTF16BE", "UCS-2BE", "UCS2BE"],
	"UTF-16LE": ["UTF16LE", "UCS-2LE", "UCS2LE"],
	"UTF-32": ["UTF32", "UCS-4", "UCS4"],
	"UTF-32BE": ["UTF32BE", "UCS-4BE", "UCS4BE", "BYTE4BE"],
	"UTF-32LE": ["UTF32LE", "UCS-4LE", "UCS4LE", "BYTE4LE"],
	"BYTE": ["8bit"],
	"UTF-7": ["UTF7"]
};
for (var original in aliases){
	if (aliases.hasOwnProperty(original)){
		aliases[original].forEach(function(alias){
			convertMap[alias] = convertMap[original];
		});
	}
}

function translate(str, encoding, from, to){
	encoding = encoding.toUpperCase();
	if (!convertMap.hasOwnProperty(encoding)){
		throw new Error("Unknown character set " + encoding + ".");
	}
	if (convertMap[encoding].mapping){
		var map = convertMap[encoding].map;
		return str.replace(map.nonEqualRegExp, function(m){
			var index = map[from].indexOf(m);
			if (index !== -1){
				return map[to].charAt(index);
			}
			else {
				return charset.illegalReplaceChar;
			}
		});
	}
	else {
		return convertMap[encoding][from + "TO" + to](str);
	}
}

var charset;
if (typeof exports !== "undefined"){
	charset = exports;
}
else if (typeof kkjs !== "undefined"){
	charset = kkjs.charset = {};
}

charset.illegalReplaceChar = "";
charset.encode = function(str, encoding){
	return translate(str, encoding, "unicode", "charset");
};

/**
 * Function charset.decode
 * @name: charset.decode
 * @description: takes a byte-stream (if the string contains a character > \xFF it is replaced by a character that has only the lower 8-bit set)
 */
charset.decode = function(str, encoding){
	return translate(str.replace(/[\x00-\xFF]/g, function(c){
		return String.fromCharCode(
			c.charCodeAt(0) & 0xFF
		);
	}), encoding, "charset", "unicode");
};

})();
/*
* Log
* Visit http://createjs.com/ for documentation, updates and examples.
*
* Copyright (c) 2010 gskinner.com, inc.
* 
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
* 
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/

// 名前空間:
this.createjs = this.createjs||{};

(function() {

/**
 * Log はエラー出力を一括管理する仕組みを提供します。デフォルトでは、メッセージの出力先として console.log が使用されます。
 * しかし、これは out 属性の設定により変更できます。
 * @class Log
 * @constructor
 **/
var Log = {};

/**
 * 読み取り専用。メッセージを何も出力しません。
 * @type Number
 * @property NONE
 * @default 0
 * @static
 **/
Log.NONE = 0;

/**
 * 読み取り専用。エラーメッセージを出力します。
 * @type Number
 * @property ERROR
 * @default 1
 * @static
 **/
Log.ERROR = 1;

/**
 * 読み取り専用。警告メッセージを出力します。
 * @type Number
 * @property WARNING
 * @default 2
 * @static
 **/
Log.WARNING = 2;

/**
 * 読み取り専用。トレース文を出力します。
 * @type Number
 * @property TRACE
 * @default 3
 * @static
 **/
Log.TRACE = 3;

/**
 * 読み取り専用。全てのメッセージを出力します。
 * @type Number
 * @property ALL
 * @default 255
 * @static
 **/
Log.ALL = 255;

/**
 * 全てのログされたメッセージを扱う際に使用される関数を定義します。デフォルトでは console.log を使用します。
 * 指定された関数には、Log.log と同じ 3 つの引数が渡されます。一致するキーが見つかった場合、メッセージは
 * 拡張されます。<br/><br/>
 * 例えば、全てのメッセージをサーバーに送信したり、テキストエリアに出力するといった使い方が可能です。値を null に
 * 設定することで、全てのログを無効にすることもできます。<br/><br/>
 * 全てのメッセージは、レベルの競ってに関わらず、out 関数に渡されます。そのため、関数にはレベルを正しく処理する
 * ことが求められます。これは、全てのメッセージをサーバーに送信しながら、現在のレベル以下のメッセージは UI に
 * 表示するといった使い方を可能にするためです。
 * @type Function
 * @property out
 * @static
 **/
Log.out = function(message, details, level) {
	if (level<=Log.level && window.console) {
		if (details === undefined) { console.log(message); }
		else { console.log(message, details); }
	}
};

/**
 * 出力するメッセージのレベルを指定します。例えば、<code>Log.level = Log.WARNING</code> と設定すると、 
 *レベル 2 (Log.WARNING)  またはそれ以下 (例: Log.ERROR) のメッセージが出力されます。デフォルト値は Log.ALL です。
 * @type Function
 * @property out
 * @default 255
 * @static
 **/
Log.level = 255;

/**
 * @property _keys
 * @static
 * @type Array
 * @protected
 **/
Log._keys = [];

/**
 * キーと長いメッセージを関連づけるオブジェクトを追加します。 
 * メッセージにはオプションとして "%DETAILS%" を含めることができます。"%DETAILS%" は error に渡された
 * 任意の詳細と置き換えられます。例えば、<br/>
 * Log.addKeys( {MY_ERROR:"これは私のエラーの [%DETAILS%]" 番目の記述です} );
 * Log.error( "MY_ERROR" , 5 ); // "これは私のエラーの [5]" 番目の記述です" が出力される
 * @param {Object} keys キーとメッセージを定義するオブジェクト
 * @static
 * @method addKeys
 **/
Log.addKeys = function(keys) {
	Log._keys.unshift(keys);
};

/**
 * out 属性に設定されたメソッドを使い、指定されたエラーを出力します。エラーが定義済みのキーに一致した場合は
 * 定義されているメッセージで置き換えられます。
 * @param {String} message 出力するエラーメッセージもしくはキー
 * @param {Object} details メッセージと関連する任意の詳細情報
 * @param {Number} level メッセージの重要性を指定する 1 と 254 の間の数字。詳細は Log.level を参照。
 * @static
 * @method error
 **/
Log.log = function(message, details, level) {
	var out = Log.out;
	if (!out) { return; }
	var keys = Log._keys;
	if (level == null) { level = 3; }
	
	for (var i=0; i<keys.length; i++) {
		if (keys[i][message]) {
			message = keys[i][message];
			break;
		}
	}
	
	out(message, details, level);
}

createjs.Log = Log;
}());
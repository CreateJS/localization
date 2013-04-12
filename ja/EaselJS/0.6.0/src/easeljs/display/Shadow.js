/*
* Shadow
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
 * 本クラスは{{#crossLink "DisplayObject"}}{{/crossLink}}に適用させる影を定義するのに必要なその<code>shadow</code>プロパティをカプセル化します
 *
 * <h4>例</h4>
 *      myImage.shadow = new createjs.Shadow("#000000", 5, 5, 10);
 *
 * @class Shadow
 * @constructor
 * @param {String} color 影の色
 * @param {Number} offsetX ピクセル単位でX軸に対する影のオフセット
 * @param {Number} offsetY ピクセル単位でY軸に対する影のオフセット
 * @param {Number} blur ブラー効果のサイズ
 **/
var Shadow = function(color, offsetX, offsetY, blur) {
  this.initialize(color, offsetX, offsetY, blur);
}
var p = Shadow.prototype;
	
// 静的パブリックプロパティ:
	/**
	 * shadowオブジェクト識別 (全てのプロパティは0に設定). 読み取り専用
	 * @property identity
	 * @type Shadow
	 * @static
	 * @final
	 **/
	Shadow.identity = null; // クラス定義の最後で設定
	
// パブリックプロパティ:
	/** 影の色
	 * property color
	 * @type String
	 * @default null
	 */
	p.color = null;
	
	/** 影のX軸のオフセット
	 * property offsetX
	 * @type Number
	 * @default 0
	 */
	p.offsetX = 0;
	
	/** 影のY軸のオフセット
	 * property offsetY
	 * @type Number
	 * @default 0
	 */
	p.offsetY = 0;
	
	/** 影のブラー
	 * property blur
	 * @type Number
	 * @default 0
	 */
	p.blur = 0;
	
// コンストラクタ:
	/** 
	 * 初期化メソッド
	 * @method initialize
	 * @protected
	 * @param {String} color 影の色
	 * @param {Number} offsetX 影のX軸のオフセット
	 * @param {Number} offsetY 影のY軸のオフセット
	 * @param {Number} blur ブラー効果のサイズ
	 **/
	p.initialize = function(color, offsetX, offsetY, blur) {
		this.color = color;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.blur = blur;
	}
	
// パブリックメソッド:
	/**
	 * 本オブジェクトを文字列で表現したものを返却する
	 * @method toString
	 * @return {String} インスタンスを文字列で表現したもの
	 **/
	p.toString = function() {
		return "[Shadow]";
	}
	
	
	/**
	 * 本Shadowインスタンスのクローンを返却する
	 * @method clone
	 * @return {Shadow} 現在のShadowインスタンスのクローン
	 **/
	p.clone = function() {
		return new Shadow(this.color, this.offsetX, this.offsetY, this.blur);
	}
	
	// これはクラスが定義されてから格納する必要がある:
	Shadow.identity = new Shadow("transparent", 0, 0, 0);
	
createjs.Shadow = Shadow;
}());
/*
* Point
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
 * 2 次元 x/ y 座標系における点を表します。
 *
 * <h4>例</h4>
 *      var point = new Point(0, 100);
 *
 * @class Point
 * @constructor
 * @param {Number} [x=0] X 座標です。
 * @param {Number} [y=0] Y 座標です。
 **/
var Point = function(x, y) {
  this.initialize(x, y);
}
var p = Point.prototype;
	
// パブリックプロパティ:
	/** 
	 * X 座標です。
	 * @property x
	 * @type Number
	 **/
	p.x = 0;
	
	/** 
	 * Y 座標です。
	 * @property y
	 * @type Number
	 **/
	p.y = 0;
	
// コンストラクタ:
	/** 
	 * 初期化用のメソッドです。
	 * @method initialize
	 * @protected
	*/
	p.initialize = function(x, y) {
		this.x = (x == null ? 0 : x);
		this.y = (y == null ? 0 : y);
	}
	
// パブリックメソッド:
	/**
	 * この Point インスタンスの複製を返します。
	 * @method clone
	 * @return {Rectangle} 現在の Point インスタンスの複製です。
	 **/
	p.clone = function() {
		return new Point(this.x, this.y);
	}

	/**
	 * このオブジェクトの文字列での表現を返します。
	 * @method toString
	 * @return {String} このインスタンスの文字列表現です。
	 **/
	p.toString = function() {
		return "[Point (x="+this.x+" y="+this.y+")]";
	}
	
createjs.Point = Point;
}());
/*
* Filter
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
 * 全てのフィルターが継承するべき基底クラスです。フィルターは {{#crossLink "DisplayObject/cache"}}{{/crossLink}} メソッドを使って
 * キャッシュされたオブジェクトに対して適用することが必要です。オブジェクトに変更があった場合は、再キャッシュ
 * または {{#crossLink "DisplayObject/updateCache"}}{{/crossLink}} を使用して下さい。
 *
 * <h4>例</h4>
 *      myInstance.cache(0,0, 100, 100);
 *      myInstance.filters = [
 *          new createjs.ColorFilter(0, 0, 0, 1, 255, 0, 0),
 *          new createjs.BoxBlurFilter(5, 5, 10)
 *      ];
 *
 * <h4>EaselJS のフィルター</h4>
 * EaselJS ではいくつかの構築済みのフィルターが提供されています。個々のフィルターは最小化されたバージョンの
 * EaselJS には含まれないことに注意して下さい。それらを使用する際は、HTML に明示的に含める必要があります。
 * <ul><li>{{#crossLink "AlphaMapFilter"}}{{/crossLink}} : グレースケールの画像を表示オブジェクトのアルファチャンネルに適用します</li>
 *      <li>{{#crossLink "AlphaMaskFilter"}}{{/crossLink}}: 画像のアルファチャンネルをを表示オブジェクトのアルファチャンネルに適用します</li>
 *      <li>{{#crossLink "BoxBlurFilter"}}{{/crossLink}}: 縦方向と横方向のぼかしを表示オブジェクトに適用します</li>
 *      <li>{{#crossLink "ColorFilter"}}{{/crossLink}}: 表示オブジェクトの色を変換します</li>
 *      <li>{{#crossLink "ColorMatrixFilter"}}{{/crossLink}}: {{#crossLink "ColorMatrix"}}{{/crossLink}} を使って画像を変換します</li>
 * </ul>
 *
 * @class Filter
 * @constructor
 **/
var Filter = function() {
  this.initialize();
}
var p = Filter.prototype;
	
// コンストラクタ:
	/** 
	 * 初期化用のメソッドです。
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function() {}
	
// パブリックメソッド:
	/**
	 * フィルターの描画に必要なマージンを示す rectangle オブジェクトを返します。
	 * 例えば、描画領域を左に 4 ピクセル、右に 7 ピクセル広げるフィルターの場合
	 * （ただし上下方向には広がらない）返される rectangle の値は (x=-4, y=0, width=11, height=0) になります。
	 * @method getBounds
	 * @return {Rectangle} フィルターの描画に必要なマージンを示す rectangle オブジェクトです。
	 **/
	p.getBounds = function() {
		return new createjs.Rectangle(0,0,0,0);
	}
	
	/**
	 * 指定されたコンテキストにフィルターを適用します。
	 * @method applyFilter
	 * @param {CanvasRenderingContext2D} ctx ソースとして使用する 2D コンテキストです。
	 * @param {Number} x ソースとして使用する矩形の x 座標です。
	 * @param {Number} y ソースとして使用する矩形の y 座標です。
	 * @param {Number} width ソース矩形の幅です。
	 * @param {Number} height ソース矩形の高さです。
	 * @param {CanvasRenderingContext2D} targetCtx オプションです。結果を描く 2D コンテキストです。デフォルトは ctx に渡されたコンテキストです。
	 * @param {Number} targetX Optional. 結果を描く X 座標です。デフォルトは x に渡された値です。
	 * @param {Number} targetY Optional. 結果を描く Y 座標です。デフォルトは y に渡された値です。
	 * @return {Boolean}
	 **/
	p.applyFilter = function(ctx, x, y, width, height, targetCtx, targetX, targetY) {}

	/**
	 * このオブジェクトの文字列での表現を返します。
	 * @method toString
	 * @return {String} このインスタンスの文字列表現です。
	 **/
	p.toString = function() {
		return "[Filter]";
	}
	
	
	/**
	 * この Filter インスタンスの複製を返します。
	 * @method clone
	 @return {Filter} 現在の Filter インスタンスの複製です。
	 **/
	p.clone = function() {
		return new Filter();
	}
	
createjs.Filter = Filter;
}());
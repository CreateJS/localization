/*
* AlphaMaskFilter
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
 * マスク画像 （又は canvas） のアルファを対象に適用します。その際、マスクから結果のアルファチャネルがコピーされ、
 * RGB チャネルは対象からコピーされます。例えば、表示オブジェクトにアルファマスクを適用するために利用できます。
 * また、圧縮された JPG の RGB 画像に PNG32 のアルファマスクを組み合わせば、ARGB 情報を含む単一の PNG32 ファイルよりも
 * ずっとファイルサイズを押さえることができます。
 *
 * <b>重要：現在、このフィルターは targetCtx また targetX/Y を正しくサポートしていません。</b>
 *
 * フィルターの使い方の例は {{#crossLink "Filter"}}{{/crossLink}} を参照して下さい。
 * @class AlphaMaskFilter
 * @extends Filter
 * @constructor
 * @param {Image} mask 
 **/
var AlphaMaskFilter = function(mask) {
  this.initialize(mask);
}
var p = AlphaMaskFilter.prototype = new createjs.Filter();

// コンストラクタ:
	/** @ignore */
	p.initialize = function(mask) {
		this.mask = mask;
	}

// パブリックプロパティ:

	/**
	 * マスクとして使用する画像 （又は canvas)
	 * @property mask
	 * @type Image
	 **/
	p.mask = null;

// パブリックメソッド:

	/**
	 * フィルターを指定されたコンテキストに適用します。重要：現在、このフィルターは targetCtx をサポートしません。
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
	p.applyFilter = function(ctx, x, y, width, height, targetCtx, targetX, targetY) {
		if (!this.mask) { return true; }
		targetCtx = targetCtx || ctx;
		if (targetX == null) { targetX = x; }
		if (targetY == null) { targetY = y; }
		
		targetCtx.save();
		if (ctx != targetCtx) {
			// TODO: support targetCtx and targetX/Y
			// clearRect, then draw the ctx in?
		}
		
		targetCtx.globalCompositeOperation = "destination-in";
		targetCtx.drawImage(this.mask, targetX, targetY);
		targetCtx.restore();
		return true;
	}

	/**
	 * このオブジェクトの複製を返します。
	 * @return {AlphaMaskFilter}
	 **/
	p.clone = function() {
		return new AlphaMaskFilter(this.mask);
	}

	/**
	 * このオブジェクトの文字列での表現を返します。
	 * @return {String} このオブジェクトの文字列表現です。
	 **/
	p.toString = function() {
		return "[AlphaMaskFilter]";
	}

// プライベートメソッド:



createjs.AlphaMaskFilter = AlphaMaskFilter;
}());
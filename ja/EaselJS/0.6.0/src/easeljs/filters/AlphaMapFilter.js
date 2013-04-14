/*
* AlphaMapFilter
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
 * グレースケールのアルファマップ画像 （又は canvas） を対象に適用します。その際、マップの赤のチャネルが結果のアルファチャネルに
 * コピーされます。RGB チャネルは対象からコピーされます。
 *
 * 一般的には、パフォーマンす上の観点から  {{#crossLink "AlphaMaskFilter"}}{{/crossLink}} の使用が推奨されます。
 *
 * フィルターの使い方の例は {{#crossLink "Filter"}}{{/crossLink}} を参照して下さい。
  * @class AlphaMapFilter
 * @extends Filter
 * @constructor
 * @param {Image} alphaMap 出力のアルファ値として使用するグレースケール画像 （又は canvas） です。縦横のサイズは対象と同じにします。
 **/
var AlphaMapFilter = function(alphaMap) {
  this.initialize(alphaMap);
}
var p = AlphaMapFilter.prototype = new createjs.Filter();

// コンストラクタ:
	/** @ignore */
	p.initialize = function(alphaMap) {
		this.alphaMap = alphaMap;
	}

// パブリックプロパティ:

	/**
	 * 結果のアルファ値として使用するグレースケール画像 （又は canvas） です。縦横のサイズは対象と同じにします。
	 * @property alphaMap
	 * @type Image
	 **/
	p.alphaMap = null;
	
// プライベートプロパティ :
	p._alphaMap = null;
	p._mapData = null;

// パブリックメソッド:

	/**
	 * フィルターを指定されたコンテキストに適用します。
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
		if (!this.alphaMap) { return true; }
		if (!this._prepAlphaMap()) { return false; }
		targetCtx = targetCtx || ctx;
		if (targetX == null) { targetX = x; }
		if (targetY == null) { targetY = y; }
		
		try {
			var imageData = ctx.getImageData(x, y, width, height);
		} catch(e) {
			//if (!this.suppressCrossDomainErrors) throw new Error("unable to access local image data: " + e);
			return false;
		}
		var data = imageData.data;
		var map = this._mapData;
		var l = data.length;
		for (var i=0; i<l; i+=4) {
			data[i+3] = map[i]||0;
		}
		imageData.data = data;
		targetCtx.putImageData(imageData, targetX, targetY);
		return true;
	}

	/**
	 * このオブジェクトの複製を返します。
	 * @return {AlphaMapFilter} 現在の AlphaMapFilter インスタンスの複製です。
	 **/
	p.clone = function() {
		return new AlphaMapFilter(this.mask);
	}

	/**
	 * このオブジェクトの文字列での表現を返します。
	 * @return {String} このオブジェクトの文字列表現です。
	 **/
	p.toString = function() {
		return "[AlphaMapFilter]";
	}

// プライベートメソッド:
	p._prepAlphaMap = function() {
		if (!this.alphaMap) { return false; }
		if (this.alphaMap == this._alphaMap && this._mapData) { return true; }
		
		this._mapData = null;
		var map = this._alphaMap = this.alphaMap;
		var canvas = map;
		if (map instanceof HTMLCanvasElement) {
			ctx = canvas.getContext("2d");
		} else {
			canvas = createjs.createCanvas?createjs.createCanvas():document.createElement("canvas");
			canvas.width = map.width;
			canvas.height = map.height;
			ctx = canvas.getContext("2d");
			ctx.drawImage(map,0,0);
		}
		
		try {
			var imgData = ctx.getImageData(0, 0, map.width, map.height);
		} catch(e) {
			//if (!this.suppressCrossDomainErrors) throw new Error("unable to access local image data: " + e);
			return false;
		}
		this._mapData = imgData.data;
		return true;
	}


createjs.AlphaMapFilter = AlphaMapFilter;
}());
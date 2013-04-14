/*
* ColorFilter
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
 * 色の変換を適用します。
 *
 * フィルターの使い方の例は {{#crossLink "Filter"}}{{/crossLink}} を参照して下さい。
 * @class ColorFilter
 * @constructor
 * @extends Filter
 * @param {Number} redMultiplier
 * @param {Number} greenMultiplier
 * @param {Number} blueMultiplier
 * @param {Number} alphaMultiplier
 * @param {Number} redOffset
 * @param {Number} greenOffset
 * @param {Number} blueOffset
 * @param {Number} alphaOffset
 **/
var ColorFilter = function(redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
  this.initialize(redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset);
}
var p = ColorFilter.prototype = new createjs.Filter();

// パブリックプロパティ:
	/**
	 * 赤チャンネルに乗算する値です。
	 * @property redMultiplier
	 * @type Number
	 **/
	p.redMultiplier = 1;
	
	/** 
	 * 緑チャンネルに乗算する値です。
	 * @property greenMultiplier
	 * @type Number
	 **/
	p.greenMultiplier = 1;
	
	/**
	 * 青チャンネルに乗算する値です。
	 * @property blueMultiplier
	 * @type Number
	 **/
	p.blueMultiplier = 1;
	
	/**
	 * アルファチャンネルに乗算する値です。
	 * @property redMultiplier
	 * @type Number
	 **/
	p.alphaMultiplier = 1;
	
	/**
	 * 赤チャンネルに加算する値です。（計算後の値に加算されます）
	 * @property redOffset
	 * @type Number
	 **/
	p.redOffset = 0;
	
	/**
	 * 緑チャンネルに加算する値です。（計算後の値に加算されます）
	 * @property greenOffset
	 * @type Number
	 **/
	p.greenOffset = 0;
	
	/**
	 * 青チャンネルに加算する値です。（計算後の値に加算されます）
	 * @property blueOffset
	 * @type Number
	 **/
	p.blueOffset = 0;
	
	/**
	 * アルファチャンネルに加算する値です。（計算後の値に加算されます）
	 * @property alphaOffset
	 * @type Number
	 **/
	p.alphaOffset = 0;

// コンストラクタ:
	/**
	 * 初期火曜のメソッドです。
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function(redMultiplier, greenMultiplier, blueMultiplier, alphaMultiplier, redOffset, greenOffset, blueOffset, alphaOffset) {
		this.redMultiplier = redMultiplier != null ? redMultiplier : 1;
		this.greenMultiplier = greenMultiplier != null ? greenMultiplier : 1;
		this.blueMultiplier = blueMultiplier != null ? blueMultiplier : 1;
		this.alphaMultiplier = alphaMultiplier != null ? alphaMultiplier : 1;
		this.redOffset = redOffset || 0;
		this.greenOffset = greenOffset || 0;
		this.blueOffset = blueOffset || 0;
		this.alphaOffset = alphaOffset || 0;
	}

// パブリックメソッド:
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
	p.applyFilter = function(ctx, x, y, width, height, targetCtx, targetX, targetY) {
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
		var l = data.length;
		for (var i=0; i<l; i+=4) {
			data[i] = data[i]*this.redMultiplier+this.redOffset;
			data[i+1] = data[i+1]*this.greenMultiplier+this.greenOffset;
			data[i+2] = data[i+2]*this.blueMultiplier+this.blueOffset;
			data[i+3] = data[i+3]*this.alphaMultiplier+this.alphaOffset;
		}
		imageData.data = data;
		targetCtx.putImageData(imageData, targetX, targetY);
		return true;
	}

	/**
	 * このオブジェクトの文字列での表現を返します。
	 * @method toString
	 * @return {String} このオブジェクトの文字列表現です。
	 **/
	p.toString = function() {
		return "[ColorFilter]";
	}


	/**
	 * このオブジェクトの複製を返します。
	 * @method clone
	 * @return {ColorFilter} 現在の ColorFilter インスタンスの複製です。
	 **/
	p.clone = function() {
		return new ColorFilter(this.redMultiplier, this.greenMultiplier, this.blueMultiplier, this.alphaMultiplier, this.redOffset, this.greenOffset, this.blueOffset, this.alphaOffset);
	}

createjs.ColorFilter = ColorFilter;
}());
/*
* ColorMatrix
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
	 *  {{#crossLink "ColorMatrixFilter"}}{{/crossLink}} で使用する行列の生成を支援する関数を提供します。
	 * もしくは、直接 ColorMatrixFilter 用の行列として使用できます。ほとんどのメソッドは連続した呼び出しを
	 * 容易にするようインスタンスを返します。
	 *
	 * <h4>例</h4>
	 *      myColorMatrix.adjustHue(20).adjustBrightness(50);
	 *
	 * フィルターの使い方の例は {{#crossLink "Filter"}}{{/crossLink}} を参照して下さい。
	 * @class ColorMatrix
	 * @constructor
	 * @extends Array
	 * @param {Number} brightness
	 * @param {Number} contrast
	 * @param {Number} saturation
	 * @param {Number} hue
	 **/
	ColorMatrix = function(brightness, contrast, saturation, hue) {
	  this.initialize(brightness, contrast, saturation, hue);
	};
	var p = ColorMatrix.prototype = [];
	
	/**
	 * コントラスト計算に使用する差分の値の配列
	 * @property DELTA_INDEX
	 * @type Array
	 * @static
	 **/
	ColorMatrix.DELTA_INDEX = [
		0,    0.01, 0.02, 0.04, 0.05, 0.06, 0.07, 0.08, 0.1,  0.11,
		0.12, 0.14, 0.15, 0.16, 0.17, 0.18, 0.20, 0.21, 0.22, 0.24,
		0.25, 0.27, 0.28, 0.30, 0.32, 0.34, 0.36, 0.38, 0.40, 0.42,
		0.44, 0.46, 0.48, 0.5,  0.53, 0.56, 0.59, 0.62, 0.65, 0.68, 
		0.71, 0.74, 0.77, 0.80, 0.83, 0.86, 0.89, 0.92, 0.95, 0.98,
		1.0,  1.06, 1.12, 1.18, 1.24, 1.30, 1.36, 1.42, 1.48, 1.54,
		1.60, 1.66, 1.72, 1.78, 1.84, 1.90, 1.96, 2.0,  2.12, 2.25, 
		2.37, 2.50, 2.62, 2.75, 2.87, 3.0,  3.2,  3.4,  3.6,  3.8,
		4.0,  4.3,  4.7,  4.9,  5.0,  5.5,  6.0,  6.5,  6.8,  7.0,
		7.3,  7.5,  7.8,  8.0,  8.4,  8.7,  9.0,  9.4,  9.6,  9.8, 
		10.0
	];
	
	/**
	 * 単位行列
	 * @property IDENTITY_MATRIX
	 * @type Array
	 * @static
	 **/
	ColorMatrix.IDENTITY_MATRIX = [
		1,0,0,0,0,
		0,1,0,0,0,
		0,0,1,0,0,
		0,0,0,1,0,
		0,0,0,0,1
	];
	
	/**
	 * 行列の長さのコンスタントです。
	 * @property LENGTH
	 * @type Number
	 * @static
	 **/
	ColorMatrix.LENGTH = ColorMatrix.IDENTITY_MATRIX.length;
	
	
	/**
	 * 初期化用のメソッドです、
	 * @method initialize
	 * @protected
	 */
	p.initialize = function(brightness,contrast,saturation,hue) {
		this.reset();
		this.adjustColor(brightness,contrast,saturation,hue);
		return this;
	};
	
	/**
	 * 行列を単位元の値で再初期化します。
	 * @method reset
	 * @return {ColorMatrix} メソッドが呼ばれた ColorMatrix のインスタンスです（呼び出しの連結に便利です）
	 */
	p.reset = function() {
		return this.copyMatrix(ColorMatrix.IDENTITY_MATRIX);
	};
	
	/**
	 * 明度、コントラスト、彩度、色相を調整する便利メソッドです。
	 * 同等の操作を行うには、adjustHue(hue), adjustContrast(contrast),
	 * adjustBrightness(brightness), adjustSaturation(saturation) を、この順に呼びます。
	 * @param {Number} brightness
	 * @param {Number} contrast
	 * @param {Number} saturation
	 * @param {Number} hue
	 * @return {ColorMatrix} メソッドが呼ばれた ColorMatrix のインスタンスです（呼び出しの連結に便利です）
	 **/
	p.adjustColor = function(brightness,contrast,saturation,hue) {
		this.adjustHue(hue);
		this.adjustContrast(contrast);
		this.adjustBrightness(brightness);
		return this.adjustSaturation(saturation);
	};
	
	/**
	 * 赤、緑、青の各チャンネルに指定された値を加えて、ピクセル色の明度を調整します。
	 * 正の値は画像を明るくします。負の値は暗くします。
	 * @param {Number} value RGB チャンネルに加える -255 と 255 の間の値です。
	 * @return {ColorMatrix} メソッドが呼ばれた ColorMatrix のインスタンスです（呼び出しの連結に便利です）
	 **/
	p.adjustBrightness = function(value) {
		if (value == 0 || isNaN(value)) { return this; }
		value = this._cleanValue(value,255);
		this._multiplyMatrix([
			1,0,0,0,value,
			0,1,0,0,value,
			0,0,1,0,value,
			0,0,0,1,0,
			0,0,0,0,1
		]);
		return this;
	},
	
	/**
	 * ピクセル色のコントラストを調整します。
	 * 正の値はコントラストを高くします。負の値は低くします。
	 * @param {Number} value  -100 と 100 の間の値です。
	 * @return {ColorMatrix} メソッドが呼ばれた ColorMatrix のインスタンスです（呼び出しの連結に便利です）
	 **/
	p.adjustContrast = function(value) {
		if (value == 0 || isNaN(value)) { return this; }
		value = this._cleanValue(value,100);
		var x;
		if (value<0) {
			x = 127+value/100*127;
		} else {
			x = value%1;
			if (x == 0) {
				x = ColorMatrix.DELTA_INDEX[value];
			} else {
				x = ColorMatrix.DELTA_INDEX[(value<<0)]*(1-x)+ColorMatrix.DELTA_INDEX[(value<<0)+1]*x; // use linear interpolation for more granularity.
			}
			x = x*127+127;
		}
		this._multiplyMatrix([
			x/127,0,0,0,0.5*(127-x),
			0,x/127,0,0,0.5*(127-x),
			0,0,x/127,0,0.5*(127-x),
			0,0,0,1,0,
			0,0,0,0,1
		]);
		return this;
	};
	
	/**
	 * ピクセル色の彩度を調整します。
	 * 正の値は彩度を高くします。負の値は低くします（グレースケールに近づきます）。
	 * @param {Number} -100 と 100 の間の値です。
	 * @return {ColorMatrix} メソッドが呼ばれた ColorMatrix のインスタンスです（呼び出しの連結に便利です）
	 **/
	p.adjustSaturation = function(value) {
		if (value == 0 || isNaN(value)) { return this; }
		value = this._cleanValue(value,100);
		var x = 1+((value > 0) ? 3*value/100 : value/100);
		var lumR = 0.3086;
		var lumG = 0.6094;
		var lumB = 0.0820;
		this._multiplyMatrix([
			lumR*(1-x)+x,lumG*(1-x),lumB*(1-x),0,0,
			lumR*(1-x),lumG*(1-x)+x,lumB*(1-x),0,0,
			lumR*(1-x),lumG*(1-x),lumB*(1-x)+x,0,0,
			0,0,0,1,0,
			0,0,0,0,1
		]);
		return this;
	};
	
	
	/**
	 * ピクセル色の色相を調整します。
	 * @param {Number} -180 & 180 の間の値です。
	 * @return {ColorMatrix} メソッドが呼ばれた ColorMatrix のインスタンスです（呼び出しの連結に便利です）
	 **/
	p.adjustHue = function(value) {
		if (value == 0 || isNaN(value)) { return this; }
		value = this._cleanValue(value,180)/180*Math.PI;
		var cosVal = Math.cos(value);
		var sinVal = Math.sin(value);
		var lumR = 0.213;
		var lumG = 0.715;
		var lumB = 0.072;
		this._multiplyMatrix([
			lumR+cosVal*(1-lumR)+sinVal*(-lumR),lumG+cosVal*(-lumG)+sinVal*(-lumG),lumB+cosVal*(-lumB)+sinVal*(1-lumB),0,0,
			lumR+cosVal*(-lumR)+sinVal*(0.143),lumG+cosVal*(1-lumG)+sinVal*(0.140),lumB+cosVal*(-lumB)+sinVal*(-0.283),0,0,
			lumR+cosVal*(-lumR)+sinVal*(-(1-lumR)),lumG+cosVal*(-lumG)+sinVal*(lumG),lumB+cosVal*(1-lumB)+sinVal*(lumB),0,0,
			0,0,0,1,0,
			0,0,0,0,1
		]);
		return this;
	};
	
	/**
	 * 指定された配列をこのインスタンスと連結（乗算）します。
	 * @param {Array} matrix ColorMatrix インスタンスの配列です。
	 * @return {ColorMatrix} メソッドが呼ばれた ColorMatrix のインスタンスです（呼び出しの連結に便利です）
	 **/
	p.concat = function(matrix) {
		matrix = this._fixMatrix(matrix);
		if (matrix.length != ColorMatrix.LENGTH) { return this; }
		this._multiplyMatrix(matrix);
		return this;
	};
	
	/**
	 * この ColorMatrix の複製を返します。
	 * @return {ColorMatrix} 現在の 現在の ColorFilter インスタンスの複製です。
	 **/
	p.clone = function() {
		return new ColorMatrix(this);
	};
	
	/**
	 * この行列の値を含む長さ 25 (5x5) 配列のインスタンスを返します。
	 * @return {Array} この行列の値を持つ配列
	 **/
	p.toArray = function() {
		return this.slice(0,ColorMatrix.LENGTH);
	};
	
	/**
	 * 指定された行列の値をこの行列にコピーします。
	 * @param {Array} matrix ColorMatrix インスタンスの配列です。
	 * @return {ColorMatrix} メソッドが呼ばれた ColorMatrix のインスタンスです（呼び出しの連結に便利です）
	 **/
	p.copyMatrix = function(matrix) {
		var l = ColorMatrix.LENGTH;
		for (var i=0;i<l;i++) {
			this[i] = matrix[i];
		}
		return this;
	};
	
// プライベートメソッド:
	
	/**
	 * @method _multiplyMatrix
	 * @protected
	 **/
	p._multiplyMatrix = function(matrix) {
		var col = [];
		
		for (var i=0;i<5;i++) {
			for (var j=0;j<5;j++) {
				col[j] = this[j+i*5];
			}
			for (var j=0;j<5;j++) {
				var val=0;
				for (var k=0;k<5;k++) {
					val += matrix[j+k*5]*col[k];
				}
				this[j+i*5] = val;
			}
		}
	};
	
	/**
	 * 値が指定された範囲内にあることを保証します。色相は 180、明度は 255、その他は 100 が最大値です。
	 * @method _cleanValuea
	 * @protected
	 **/
	p._cleanValue = function(value,limit) {
		return Math.min(limit,Math.max(-limit,value));
	};
	
	// 
	/**
	 * 行列が 5x5 (25) の長さであることを保証します。
	 * @method _fixMatrix
	 * @protected
	 **/
	p._fixMatrix = function(matrix) {
		if (matrix instanceof ColorMatrix) { matrix = matrix.slice(0); }
		if (matrix.length < ColorMatrix.LENGTH) {
			matrix = matrix.slice(0,matrix.length).concat(ColorMatrix.IDENTITY_MATRIX.slice(matrix.length,ColorMatrix.LENGTH));
		} else if (matrix.length > ColorMatrix.LENGTH) {
			matrix = matrix.slice(0,ColorMatrix.LENGTH);
		}
		return matrix;
	};
	
	createjs.ColorMatrix = ColorMatrix;

}());

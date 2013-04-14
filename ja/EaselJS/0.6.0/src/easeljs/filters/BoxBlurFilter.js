/*
* BoxBlurFilter
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
 * BoxBlurFilter は表示オブジェクトにボックスブラーを適用します。
 *
 * フィルターの使い方の例は {{#crossLink "Filter"}}{{/crossLink}} を参照して下さい。
 * @class BoxBlurFilter
 * @extends Filter
 * @constructor
 * @param {Number} blurX
 * @param {Number} blurY
 * @param {Number} quality
 **/
var BoxBlurFilter = function( blurX, blurY, quality ) {
  this.initialize( blurX, blurY, quality );
}
var p = BoxBlurFilter.prototype = new createjs.Filter();

// コンストラクタ:
	/** @ignore */
	p.initialize = function( blurX, blurY, quality ) {
		if ( isNaN(blurX) || blurX < 0 ) blurX = 0;
		this.blurX = blurX | 0;
		if ( isNaN(blurY) || blurY < 0 ) blurY = 0;
		this.blurY = blurY | 0;
		if ( isNaN(quality) || quality < 1  ) quality = 1;
		this.quality = quality | 0;
	}

// パブリックプロパティ:

	/**
	 * 水平方向のぼかしの半径
	 * @property blurX
	 * @type Number
	 **/
	p.blurX = 0;

	/**
	 * 垂直方向のぼかしの半径
	 * @property blurY
	 * @type Number
	 **/
	p.blurY = 0;

	/**
	 * ぼかし処理を繰り返す回数。例えば、1 を指定すると荒いぼかしになる。
	 * 2 を指定するとより滑らかなぼかしになるが、処理時間は倍になる。
	 * @property quality
	 * @type Number
	 **/
	p.quality = 1;

// パブリックメソッド:
	/**
	 * フィルターの描画に必要なマージンを示す rectangle オブジェクトを返します。
	 * 例えば、描画領域を左に 4 ピクセル、右に 7 ピクセル広げるフィルターの場合
	 * （ただし上下方向には広がらない）返される rectangle の値は (x=-4, y=0, width=11, height=0) になります。
	 * @method getBounds
	 * @return {Rectangle} です。
	 **/
	p.getBounds = function() {
		// TODO: this doesn't properly account for blur quality.
		return new createjs.Rectangle(-this.blurX,-this.blurY,2*this.blurX,2*this.blurY);
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

		var radiusX = this.blurX;
		if ( isNaN(radiusX) || radiusX < 0 ) return false;
		radiusX |= 0;

		var radiusY = this.blurY;
		if ( isNaN(radiusY) || radiusY < 0 ) return false;
		radiusY |= 0;

		if ( radiusX == 0 && radiusY == 0 ) return false;

		var iterations = this.quality;
		if ( isNaN(iterations) || iterations < 1  ) iterations = 1;
		iterations |= 0;
		if ( iterations > 3 ) iterations = 3;
		if ( iterations < 1 ) iterations = 1;

		var pixels = imageData.data;

		var rsum,gsum,bsum,asum,x,y,i,p,p1,p2,yp,yi,yw;
		var wm = width - 1;
		var hm = height - 1;
		var rad1x = radiusX + 1;
		var divx = radiusX + rad1x;
		var rad1y = radiusY + 1;
		var divy = radiusY + rad1y;
		var div2 = 1 / (divx * divy);

		var r = [];
		var g = [];
		var b = [];
		var a = [];

		var vmin = [];
		var vmax = [];

		while ( iterations-- > 0 ) {
			yw = yi = 0;

			for ( y=0; y < height; y++ ){
				rsum = pixels[yw]   * rad1x;
				gsum = pixels[yw+1] * rad1x;
				bsum = pixels[yw+2] * rad1x;
				asum = pixels[yw+3] * rad1x;


				for( i = 1; i <= radiusX; i++ ) {
					p = yw + (((i > wm ? wm : i )) << 2 );
					rsum += pixels[p++];
					gsum += pixels[p++];
					bsum += pixels[p++];
					asum += pixels[p]
				}

				for ( x = 0; x < width; x++ ) {
					r[yi] = rsum;
					g[yi] = gsum;
					b[yi] = bsum;
					a[yi] = asum;

					if(y==0){
						vmin[x] = Math.min( x + rad1x, wm ) << 2;
						vmax[x] = Math.max( x - radiusX, 0 ) << 2;
					}

					p1 = yw + vmin[x];
					p2 = yw + vmax[x];

					rsum += pixels[p1++] - pixels[p2++];
					gsum += pixels[p1++] - pixels[p2++];
					bsum += pixels[p1++] - pixels[p2++];
					asum += pixels[p1]   - pixels[p2];

					yi++;
				}
				yw += ( width << 2 );
			}

			for ( x = 0; x < width; x++ ) {
				yp = x;
				rsum = r[yp] * rad1y;
				gsum = g[yp] * rad1y;
				bsum = b[yp] * rad1y;
				asum = a[yp] * rad1y;

				for( i = 1; i <= radiusY; i++ ) {
				  yp += ( i > hm ? 0 : width );
				  rsum += r[yp];
				  gsum += g[yp];
				  bsum += b[yp];
				  asum += a[yp];
				}

				yi = x << 2;
				for ( y = 0; y < height; y++) {
				  pixels[yi]   = (rsum * div2 + 0.5) | 0;
				  pixels[yi+1] = (gsum * div2 + 0.5) | 0;
				  pixels[yi+2] = (bsum * div2 + 0.5) | 0;
				  pixels[yi+3] = (asum * div2 + 0.5) | 0;

				  if( x == 0 ){
					vmin[y] = Math.min( y + rad1y, hm ) * width;
					vmax[y] = Math.max( y - radiusY,0 ) * width;
				  }

				  p1 = x + vmin[y];
				  p2 = x + vmax[y];

				  rsum += r[p1] - r[p2];
				  gsum += g[p1] - g[p2];
				  bsum += b[p1] - b[p2];
				  asum += a[p1] - a[p2];

				  yi += width << 2;
				}
			}
		}

		targetCtx.putImageData(imageData, targetX, targetY);
		return true;
	}

	/**
	 * このオブジェクトの複製を返します。
	 * @return {BoxBlurFilter}
	 **/
	p.clone = function() {
		return new BoxBlurFilter(this.blurX, this.blurY, this.quality);
	}

	/**
	 * このオブジェクトの文字列での表現を返します。
	 * @return {String}
	 **/
	p.toString = function() {
		return "[BoxBlurFilter]";
	}

// プライベートメソッド:



createjs.BoxBlurFilter = BoxBlurFilter;
}());
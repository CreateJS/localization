/*
* Bitmap
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

// ネームスペース:
this.createjs = this.createjs||{};

(function() {

/**
 * Bitmapは表示リストにおいてImage, Canvas, あるいはVideoに相当します。
 * Bitmapは、既に存在するHTML要素、あるいはパス文字列を引数に与えてインスタンスを生成できます。
 *
 * <h4>例</h4>
 *      var bitmap = new createjs.Bitmap("imagePath.jpg");
 *
 * 注意: 引数に与えたファイルのパス文字列あるいはimageタグがまだ読み込まれていない場合、描画するためにstageを再描画する必要があるときがあります。
 *
 * @class Bitmap
 * @extends DisplayObject
 * @constructor
 * @param {Image | HTMLCanvasElement | HTMLVideoElement | String} imageOrUri 表示するソースオブジェクトあるいは画像のURI。
 * Image, Canvas, Videoオブジェクト, あるいは画像ファイルのURL文字列のいずれかを使用できます。
 * 画像ファイルのURL文字列の場合は、新しくImageオブジェクトが生成され.imageプロパティに代入されます。
 **/
var Bitmap = function(imageOrUri) {
  this.initialize(imageOrUri);
}
var p = Bitmap.prototype = new createjs.DisplayObject();

// パブリックプロパティ:
	/**
	 * 描画するイメージです。Image, Canvas, Videoのいずれかです。
	 * @property image
	 * @type Image | HTMLCanvasElement | HTMLVideoElement
	 **/
	p.image = null;

	/**
	 * Bitmapをcanvasに描画するときにグローバルなピクセル座標として描画するか否かを指定します。
	 * @property snapToPixel
	 * @type Boolean
	 * @default true
	 **/
	p.snapToPixel = true;

	/**
	 * ソースとなる画像の描画する範囲を指定します。指定しなかった場合、画像全体が描画されます。
	 * @property sourceRect
	 * @type Rectangle
	 * @default null
	 */
	p.sourceRect = null;

	// コンストラクタ:

	/**
	 * @property DisplayObject_initialize
	 * @type Function
	 * @private
	 **/
	p.DisplayObject_initialize = p.initialize;

	/**
	 * 初期化を行います。
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function(imageOrUri) {
		this.DisplayObject_initialize();
		if (typeof imageOrUri == "string") {
			this.image = new Image();
			this.image.src = imageOrUri;
		} else {
			this.image = imageOrUri;
		}
	}

// パブリックメソッド:

	/**
	 * 表示オブジェクトがcanvasに描画されている場合、それが可視であるか否かを示します。
	 * これは、ステージの範囲内に表示されているか否かを示すものではありません。
	 * 注意: このメソッドは主に内部での使用を意図したものですが、高度な使用において役に立つでしょう。
	 * @method isVisible
	 * @return {Boolean} Boolean 表示オブジェクトがcanvasに描画されている場合、それが可視であるか否かを示します。
	 **/
	p.isVisible = function() {
		var hasContent = this.cacheCanvas || (this.image && (this.image.complete || this.image.getContext || this.image.readyState >= 2));
		return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
	}

	/**
	 * @property DisplayObject_draw
	 * @type Function
	 * @private
	 **/
	p.DisplayObject_draw = p.draw;

	/**
	 * 表示オブジェクトを、visible, alpha, shadow, そしてtransformの設定を無視して、指定されたコンテキストで描画します。
	 * 描画された場合にtrueを返します（機能をオーバーライドする場合に有用です）。
	 * 注意: このメソッドは主に内部での使用を意図したものですが、高度な使用において役に立つでしょう。
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx canvas2Dコンテキストオブジェクトです。
	 * @param {Boolean} ignoreCache 描画において保存しているキャッシュを無視するか否かを指定します。
	 * 例えば、キャッシュを再構築するのに使われます。（既存のキャッシュが再利用されるのを防ぐために）
	 **/
	p.draw = function(ctx, ignoreCache) {
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		var rect = this.sourceRect;
		if (rect) {
			ctx.drawImage(this.image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height);
		} else {
			ctx.drawImage(this.image, 0, 0);
		}
		return true;
	}

	// 注意, このセクションのAPIはBitmapから指定されたAPI（DislayObjectのもの）を使用しています。
	// Bitmapには実装がありません。

	/**
	 * Bitmapインスタンスの内容は既に単純なフォーマットであるため、キャッシュは不要です。
	 * パフォーマンスを下げるのでBitmapインスタンスをキャッシュすべきでは<b>ありません</b>。
	 * @method cache
	 **/

	/**
	 * Bitmapインスタンスの内容は既に単純なフォーマットであるため、キャッシュは不要です。
	 * パフォーマンスを下げるのでBitmapインスタンスをキャッシュすべきでは<b>ありません</b>。
	 * @method updateCache
	 **/

	/**
	 * Bitmapインスタンスの内容は既に単純なフォーマットであるため、キャッシュは不要です。
	 * パフォーマンスを下げるのでBitmapインスタンスをキャッシュすべきでは<b>ありません</b>。
	 * @method uncache
	 **/

	/**
	 * Bitmapインスタンスのクローンを返します。
	 * @method clone
	 * @return {Bitmap} Bitmapインスタンスのクローンです。
	 **/
	p.clone = function() {
		var o = new Bitmap(this.image);
		if (this.sourceRect) { o.sourceRect = this.sourceRect.clone(); }
		this.cloneProps(o);
		return o;
	}

	/**
	 * オブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} オブジェクトの文字列表現です。
	 **/
	p.toString = function() {
		return "[Bitmap (name="+  this.name +")]";
	}

// プライベートメソッド:

createjs.Bitmap = Bitmap;
}());
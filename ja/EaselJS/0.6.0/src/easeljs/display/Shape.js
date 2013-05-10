/*
* Shape
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
 * Shapeは、ディスプレイリストにおいてベクターアートを表示することを可能にします。それは、すべてのベクター描画メソッドを
 * 公開する {{#crossLink "Graphics"}}{{/crossLink}} インタフェースを構成します。グラフィックインタフェースは、複数の
 * Shape間で同じベクターグラフィックスを異なった位置もしくは変形で表示するために共有が可能です。
 *
 * ベクターアートが描画間で変更されないなら、レンダリングコストを削減するために {{#crossLink "DisplayObject/cache"}}{{/crossLink}} 
 * メソッドを使いたいと思うかも知れません。
 *
 * <h4>例</h4>
 *      var graphics = new createjs.Graphics().beginFill("#ff0000").drawRect(0, 0, 100, 100);
 *      var shape = new createjs.Shape(graphics);
 *      
 *      //あるいは、上と同じ描画のためにShapeクラスのグラフィックスプロパティを使うこともできます。
 *      var shape = new createjs.Shape();
 *      shape.graphics.beginFill("#ff0000").drawRect(0, 0, 100, 100);
 *
 * @class Shape
 * @extends DisplayObject
 * @constructor
 * @param {Graphics} graphics オプション。表示のためのグラフィックスインタフェース。nullなら、新しいグラフィックスインタフェースが作成されます。
 **/
var Shape = function(graphics) {
  this.initialize(graphics);
}
var p = Shape.prototype = new createjs.DisplayObject();

// パブリックプロパティ:
	/**
	 * 表示のためのグラフィックスインタフェース。
	 * @property graphics
	 * @type Graphics
	 **/
	p.graphics = null;
	
// コンストラクタ:
	/**
	 * @property DisplayObject_initialize
	 * @private
	 * @type Function
	 **/
	p.DisplayObject_initialize = p.initialize;

	/** 
	 * 初期化メソッド。
	 * @method initialize
	 * @param {Graphics} graphics
	 * @protected
	 **/
	p.initialize = function(graphics) {
		this.DisplayObject_initialize();
		this.graphics = graphics ? graphics : new createjs.Graphics();
	}

	/**
	 * キャンバスに描かれる際にShapeが可視かどうかを示すブール値を返します。これは、ステージの境界内に
	 * 可視かどうかを考慮することはありません
	 * NOTE: このメソッドは、高度な目的で使用する場合に有用かも知れませんが、主に内部で使用するためのものです。
	 * @method isVisible
	 * @return {Boolean} キャンバスに描かれる際にShapeが可視かどうかを示すブール値。
	 **/
	p.isVisible = function() {
		var hasContent = this.cacheCanvas || (this.graphics && !this.graphics.isEmpty());
		return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
	};

	/**
	 * @property DisplayObject_draw
	 * @private
	 * @type Function
	 **/
	p.DisplayObject_draw = p.draw;
	
	/**
	 * 指定されたコンテキストに、visible, alpha, shadow, transformを無視してShapeを描画します。
	 * 描画が処理された場合はtrueを返します（オーバーライド機能に便利）。
	 *
	 * <i>NOTE: このメソッドは、高度な目的で使用する場合に有用かも知れませんが、主に内部で使用するためのものです。</i>
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx 描きこむキャンバス2Dコンテキスト。
	 * @param {Boolean} ignoreCache 描画操作が現在のキャッシュを無視するかどうかを指定します。 
	 * たとえば、キャッシュを描画するために使用されます（自身に戻って単に既存キャッシュを描画することを防ぐために）。
	 **/
	p.draw = function(ctx, ignoreCache) {
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		this.graphics.draw(ctx);
		return true;
	}
	
	/**
	 * このShapeのクローンを返します。このインスタンスの現在のコンテキストに指定されたいくつかのプロパティは
	 * ディフォルトに戻されます（例 .parent）
	 * @method clone
	 * @param {Boolean} recursive trueなら、このShapeの {{#crossLink "Graphics"}}{{/crossLink}} インスタンスもクローンされます。
	 * falseなら、グラフィックスインタフェースは、新しいShapeと共有されます。
	 **/
	p.clone = function(recursive) {
		var o = new Shape((recursive && this.graphics) ? this.graphics.clone() : this.graphics);
		this.cloneProps(o);
		return o;
	}
		
	/**
	 * このオブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} インスタンスの文字列表現。
	 **/
	p.toString = function() {
		return "[Shape (name="+  this.name +")]";
	}

createjs.Shape = Shape;
}());
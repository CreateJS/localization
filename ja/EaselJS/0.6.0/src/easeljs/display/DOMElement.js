/*
* DOMElement
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
// TODO: ローテーションでの問題の修正。
// TODO: getObjectsUnderPointからの排除。

/**
 * <b>このクラスはまだ実験的であり、より上級な使用ではバギーになることもあり得ます。バグを報告してください。</b>
 *
 * DOMElementは、ディスプレイリストによってHTMLElementを関連づけることを許します。それは、追加された
 * {{#crossLink "Container"}}{{/crossLink}}の子であるかのように、DOM内で変換されます。しかしながら、
 * それはキャンバスに描画されていません、それ自体はキャンバスに相対的に持つz-indexが保持されます
 * （つまり、キャンバスの前もしくは後ろに描画されます）。
 *
 * DOMElementの位置は、DOMでのそれらの親ノードに相対的です。DOMオブジェクトは、ページ上の同じ位置を共有するように
 * キャンバスを含むdivに追加することをお勧めします。
 *
 * DOMElementは、キャンバスの境界の外側に表示したい、キャンバスの内容の上にHTMLエレメントを位置決めする
 * ために有用です。
 *
 * <h4>マウスインタラクション</h4>
 *
 * DOMElementインスタンスは、完全なEaselJSディスプレイオブジェクトではなく、EaselJSマウスイベントもしくはHitTest
 * のようなメソッドのサポートに参加しません。DOMElementからマウスイベントを取得するには、htmlElementにハンドラを追加する
 * 必要があります（注：これはEventDispatcherをサポートしません）。
 *
 *      var domElement = new createjs.DOMElement(htmlElement);
 *      domElement.htmlElement.onclick = function() {
 *          console.log("clicked");
 *      }
 *
 * @class DOMElement
 * @extends DisplayObject
 * @constructor
 * @param {HTMLElement} htmlElement 参照もしくは、管理するDOMエレメントのためのid。
 */
var DOMElement = function(htmlElement) {
  this.initialize(htmlElement);
};
var p = DOMElement.prototype = new createjs.DisplayObject();

// パブリックプロパティ:
	/**
	 * 管理するDOMオブジェクト
	 * @property htmlElement
	 * @type HTMLElement
	 */
	p.htmlElement = null;

// プライベートプロパティ:
	/**
	 * @property _oldMtx
	 * @protected
	 */
	p._oldMtx = null;

// コンストラクタ:
	/**
	 * @property DisplayObject_initialize
	 * @type Function
   * @private
	 */
	p.DisplayObject_initialize = p.initialize;

	/**
	 * 初期化メソッド。
	 * @method initialize
	 * @protected
	*/
	p.initialize = function(htmlElement) {
		if (typeof(htmlElement)=="string") { htmlElement = document.getElementById(htmlElement); }
		this.DisplayObject_initialize();
		this.mouseEnabled = false;
		this.htmlElement = htmlElement;
		var style = htmlElement.style;
		// 親が可視でない場合はdrawは呼び出されないので、これは_tickメソッドに依存しています。
		style.position = "absolute";
		style.transformOrigin = style.WebkitTransformOrigin = style.msTransformOrigin = style.MozTransformOrigin = style.OTransformOrigin = "0% 0%";
	}

// パブリックメソッド:
	/**
	 * キャンバスに描画する際に、ディスプレイオブジェクトが可視かどうかを示すtrueもしくはfalseを返します。
	 * これは、ステージの境界内に表示されるかどうかを考慮することはありません。
	 * NOTE: このメソッドは、高度な目的で使用する場合に有用かも知れませんが、主に内部で使用するためのものです。
	 * @method isVisible
	 * @return {Boolean} キャンバスに描かれた場合に、表示オブジェクトが可視かどうかを示すブール値
	 */
	p.isVisible = function() {
		return this.htmlElement != null;
	}

	/**
	 * 指定されたコンテキストに、visible, alpha, shadow, transformを無視して描画します。
	 * 描画が処理された場合はtrueを返します（オーバーライド機能に便利）。
	 * NOTE: このメソッドは、高度な目的で使用する場合に有用かも知れませんが、主に内部で使用するためのものです。
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx 描きこむキャンバス2Dコンテキスト。
	 * @param {Boolean} ignoreCache 描画操作が現在のキャッシュを無視するかどうかを指定します。
	 * たとえば、キャッシュを描画するために使用されます（自身に戻って単に既存キャッシュを描画することを防ぐために）。
	 */
	p.draw = function(ctx, ignoreCache) {
		if (this.htmlElement == null) { return; }
		var mtx = this.getConcatenatedMatrix(this._matrix);
		
		var o = this.htmlElement;
		var style = o.style;
		
		// 親が可視でない場合はdrawは呼び出されないので、これは_tickメソッドに依存しています。
		if (this.visible) { style.visibility = "visible"; }
		else { return true; }
		
		var oMtx = this._oldMtx||{};
		if (oMtx.alpha != mtx.alpha) { style.opacity = ""+mtx.alpha; oMtx.alpha = mtx.alpha; }
		if (oMtx.tx != mtx.tx || oMtx.ty != mtx.ty || oMtx.a != mtx.a || oMtx.b != mtx.b || oMtx.c != mtx.c || oMtx.d != mtx.d) {
			style.transform = style.WebkitTransform = style.OTransform =  style.msTransform = ["matrix("+mtx.a,mtx.b,mtx.c,mtx.d,(mtx.tx+0.5|0),(mtx.ty+0.5|0)+")"].join(",");
			style.MozTransform = ["matrix("+mtx.a,mtx.b,mtx.c,mtx.d,(mtx.tx+0.5|0)+"px",(mtx.ty+0.5|0)+"px)"].join(",");
			this._oldMtx = mtx.clone();
		}
		
		return true;
	};

	/**
	 * DOMElementには適用されません。
	 * @method cache
	 */
	p.cache = function() {};

	/**
	 * DOMElementには適用されません。
	 * @method uncache
	 */
	p.uncache = function() {};

	/**
	 * DOMElementには適用されません。
	 * @method updateCache
	 */
	p.updateCache = function() {};

	/**
	 * DOMElementには適用されません。
	 * @method hitArea
	 */
	p.hitTest = function() {};

	/**
	 * DOMElementには適用されません。
	 * @method localToGlobal
	 */
	p.localToGlobal = function() {};

	/**
	 * DOMElementには適用されません。
	 * @method globalToLocal
	 */
	p.globalToLocal = function() {};

	/**
	 * DOMElementには適用されません。
	 * @method localToLocal
	 */
	p.localToLocal = function() {};

	/**
	 * DOMElementはクローンできません。エラーを投げます。
	 * @method clone
	 */
	p.clone = function() {
		throw("DOMElement cannot be cloned.")
	};

	/**
	 * このオブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} インスタンスの文字列表現。
	 */
	p.toString = function() {
		return "[DOMElement (name="+  this.name +")]";
	};
    
	/**
     * DOMElementインスタンスは完全なEaselJSディスプレイオブジェクトではなく、EaselJSマウスイベントに参加しないので、
	 * Interactionイベントは、DOMElementインスタンスではなく、`htmlElement`に追加されるべきです。
	 * @event click
	 */
          
     /**
     * DOMElementインスタンスは完全なEaselJSディスプレイオブジェクトではなく、EaselJSマウスイベントに参加しないので、
	 * Interactionイベントは、DOMElementインスタンスではなく、`htmlElement`に追加されるべきです。
	 * @event dblClick
	 */
     
     /**
      * DOMElementインスタンスは完全なEaselJSディスプレイオブジェクトではなく、EaselJSマウスイベントに参加しないので、
 	  * Interactionイベントは、DOMElementインスタンスではなく、`htmlElement`に追加されるべきです。
	  * @event mousedown
	  */
     
     /**
      * HTMLElementは、DOMElementインスタンスではなく、mouseoverイベントを受け取ることができます。
      * DOMElementインスタンスは完全なEaselJSディスプレイオブジェクトではなく、EaselJSマウスイベントに参加しないためです。
      * @event mouseover
	  */ 
     
     /**
      * DOMElementには適用されません。
	  * @event tick
	  */
     

// プライベートメソッド:
	/**
	 * @property DisplayObject__tick
	 * @type Function
	 * @protected
	 */
	p.DisplayObject__tick = p._tick;
	
	/**
	 * @method _tick
	 * @protected
	 */
	p._tick = function(params) {
		// TODO: これを回避する方法を見つける。
		this.htmlElement.style.visibility = "hidden";
		this.DisplayObject__tick(params);
	};

createjs.DOMElement = DOMElement;
}());
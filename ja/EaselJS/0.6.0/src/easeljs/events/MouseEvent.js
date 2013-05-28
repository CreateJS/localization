/*
* MouseEvent
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
 * これは {{#crossLink "DisplayObject"}}{{/crossLink}} のインスタンスへの mousedown, mouseup, mousemove, stagemouseup, stagemousedown,
 *  mouseover, mouseout, click イベントに引数として渡されます。
 * @class MouseEvent
 * @uses EventDispatcher
 * @constructor
 * @param {String} type イベントの種類です。
 * @param {Number} stageX ステージを基準とする X 座標です。
 * @param {Number} stageY ステージを基準とする Y 座標です。
 * @param {DisplayObject} target イベントに関連する表示オブジェクトです。EventDispatcher によりイベントが発行されるとこの値は上書きされます。
 * @param {MouseEvent} nativeEvent イベントに関連するネイティブの DOM イベントです。
 * @param {Number} pointerID ポインター固有の ID です。
 * @param {Boolean} primary マルチタッチ環境で、最初のポインターかを示します。
 * @param {Number} rawX ステージを基準とする実際の X 座標です。
 * @param {Number} rawY ステージを基準とする実際の Y 座標です。
 **/
var MouseEvent = function(type, stageX, stageY, target, nativeEvent, pointerID, primary, rawX, rawY) {
  this.initialize(type, stageX, stageY, target, nativeEvent, pointerID, primary, rawX, rawY);
}
var p = MouseEvent.prototype;

// イベント:

	/**
	 * "mousedown" の MouseEvent オブジェクトからは、ユーザーがマウスを放すまで mousemove イベントが発行されます。
	 * これにより、マウス押下中のマウスの移動を知ることができ、ドラッグ & ドロップ等の実現に役立ちます。
	 * イベントのプロパティについては {{#crossLink "MouseEvent"}}{{/crossLink}} クラスを参照して下さい。
	 * @event mousemove
	 * @since 0.6.0
	 */

	/**
	 * "mousedown" の MouseEvent オブジェクトからは、ユーザーがマウスを放すと mouseup イベントが発行されます。
	 * これにより、特定のマウス押下に対応するマウス解放を知ることができ、ドラッグ & ドロップ等の実現に役立ちます。
	 * イベントのプロパティについては {{#crossLink "MouseEvent"}}{{/crossLink}} クラスを参照して下さい。
	 * @event mouseup
	 * @since 0.6.0
	 */

// パブリックプロパティ:

	/**
	 * ステージを基準とする  X 座標です。値の範囲は 0 からステージ幅の範囲内です。
	 * @property stageX
	 * @type Number
	*/
	p.stageX = 0;

	/**
	 * ステージを基準とする  Y 座標です。値の範囲は 0 からステージの高さの範囲内です。
	 * @property stageY
	 * @type Number
	 **/
	p.stageY = 0;
	
	/**
	 * ステージを基準とする X 座標です。stage.mouseMoveOutside の値が true でポインターがステージの領域外にある場合
	 * 以外は stageX と同じ値です。
	 * @property rawX
	 * @type Number
	*/
	p.rawX = 0;

	/**
	 * ステージを基準とする Y 座標です。stage.mouseMoveOutside の値が true でポインターがステージの領域外にある場合
	 * 以外は stageY と同じ値です。
	 * @property rawY
	 * @type Number
	*/
	p.rawY = 0;

	/**
	 * マウスイベントの種類です。これはハンドラー （onPress, onMouseDown, onMouseUp, onMouseMove,  onClick） 
	 * にマップされるものと同じです。
	 * @property type
	 * @type String
	 **/
	p.type = null;

	/**
	 * ブラウザが生成するネイティブの MouseEvent です。このイベントが持つプロパティと API はブラウザに依存します。
	 * ネイティブの MouseEvent により直接生成されていないときの値は null です。
	 * @property nativeEvent
	 * @type MouseEvent
	 * @default null
	 **/
	p.nativeEvent = null;
	 
	/**
	 * "onPress" イベントの場合のみ、onMouseMove にハンドラーを指定できます。
	 * このハンドラーは、マウスが解放されるまで、マウスが移動すると毎回呼ばれます。
	 * これは、ドラッグ & ドロップのような操作に便利です。
	 * @property onMouseMove
	 * @type Function
	 * @deprecated "mousemove" イベントの追加により、将来のバージョンでは廃止される予定です。
	 */
	p.onMouseMove = null;
	 
	/**
	 * "onPress" イベントの場合のみ、onMouseUp にハンドラーを指定できます。
	 * このハンドラーは、マウスが解放されるまで、マウスが移動すると毎回呼ばれます。
	 * これは、ドラッグ & ドロップのような操作に便利です。
	 * @property onMouseUp
	 * @type Function
	 * @deprecated "mouseup" イベントの追加により、将来のバージョンでは廃止される予定です。
	 */
	p.onMouseUp = null;

	/**
	 * イベントに関連する表示オブジェクトです。
	 * @property target
	 * @type DisplayObject
	 * @default null
	*/
	p.target = null;

	/**
	 * ポインター （タッチポイントもしくはカーソル） 固有の ID。値は、マウスの場合 -1 またはシステムからの数値です。
	 * @property pointerID
	 * @type {Number}
	 */
	p.pointerID = 0;

	/**
	 * マルチタッチ環境で最初のポインターかを示します。マウスの場合、常に値は true です。
	 * タッチの場合、最初にスタックされたポインターが最初のポインターとして扱われます。
	 * @property primary
	 * @type {Boolean}
	 */
	p.primary = false;
	
	
// ミックスイン:
	// EventDispatcher メソッド:
	p.addEventListener = null;
	p.removeEventListener = null;
	p.removeAllEventListeners = null;
	p.dispatchEvent = null;
	p.hasEventListener = null;
	p._listeners = null;
	createjs.EventDispatcher.initialize(p); // EventDispatcher のメソッドを追加します。

// コンストラクタ:
	/**
	 * 初期化用メソッドです。
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function(type, stageX, stageY, target, nativeEvent, pointerID, primary, rawX, rawY) {
		this.type = type;
		this.stageX = stageX;
		this.stageY = stageY;
		this.target = target;
		this.nativeEvent = nativeEvent;
		this.pointerID = pointerID;
		this.primary = primary;
		this.rawX = (rawX==null)?stageX:rawX;
		this.rawY = (rawY==null)?stageY:rawY;
	}

// パブリックメソッド:
	/**
	 * MouseEvent インスタンスの複製を返します。
	 * @method clone
	 * @return {MouseEvent} MouseEvent インスタンスの複製です。
	 **/
	p.clone = function() {
		return new MouseEvent(this.type, this.stageX, this.stageY, this.target, this.nativeEvent, this.pointerID, this.primary, this.rawX, this.rawY);
	}

	/**
	 * オブジェクトの文字列での表現を返します。
	 * @method toString
	 * @return {String} インスタンスを表現する文字列です。
	 **/
	p.toString = function() {
		return "[MouseEvent (type="+this.type+" stageX="+this.stageX+" stageY="+this.stageY+")]";
	}

createjs.MouseEvent = MouseEvent;
}());
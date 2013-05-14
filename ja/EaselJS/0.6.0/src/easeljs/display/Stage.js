/*
* Stage
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
 * ステージは、ディスプレイリストのためのルートレベル {{#crossLink "Container"}}{{/crossLink}} です。その {{#crossLink "Stage/tick"}}{{/crossLink}} 
 * メソッドが呼ばれるたびに、そのターゲットキャンバスにそのディスプレイリストを描画します。
 *
 * <h4>例</h4>
 * この例はステージを作成し、それに子を追加します。そのとき子を更新し、{{#crossLink "Stage/update"}}{{/crossLink}} を使って
 * ステージを再描画するために {{#crossLink "Ticker"}}{{/crossLink}} を使います。
 *
 *      var stage = new createjs.Stage("canvasElementId");
 *      var image = new createjs.Bitmap("imagePath.png");
 *      createjs.Ticker.addEventListener("tick", handleTick);
 *      function handleTick(event) {
 *          bitmap.x += 10;
 *          stage.update();
 *      }
 *
 * @class Stage
 * @extends Container
 * @constructor
 * @param {HTMLCanvasElement | String | Object} canvas ステージが描画するキャンバスオブジェクト、もしくは現在のドキュメントに
 * おけるキャンバスオブジェクトの文字列id。
 **/
var Stage = function(canvas) {
  this.initialize(canvas);
}
var p = Stage.prototype = new createjs.Container();

// 静的プロパティ:
	/**
	 * @property _snapToPixelEnabled
	 * @protected
	 * @static
	 * @type {Boolean}
	 * @default false
	 * @deprecated モダンブラウザでのハードウェアアクセラレーションは、これを不要にします。
	 **/
	Stage._snapToPixelEnabled = false; // snapToPixelEnabledは、グローバルアクセスを提供するために描画の間、ここに一時的にコピーされます。
// イベント:

	/**
	 * ユーザがキャンバス上をマウスを移動させるとき、発行されます。
	 * eventプロパティのリストのために {{#crossLink "MouseEvent"}}{{/crossLink}} クラスを参照してください。
	 * @event stagemousemove
	 * @since 0.6.0
	 */

	/**
	 * ユーザが、ページが検出できる場所でマウスボタンを離したとき、発行されます（これはブラウザ間で若干違います）。
	 * eventプロパティのリストのために {{#crossLink "MouseEvent"}}{{/crossLink}} クラスを参照してください。
	 * @event stagemouseup
	 * @since 0.6.0
	 */

	/**
	 * ユーザが、ページが検出できる場所でマウスボタンを離したとき、発行されます（これはブラウザ間で若干違います）。
	 * eventプロパティのリストのために {{#crossLink "MouseEvent"}}{{/crossLink}} クラスを参照してください。
	 * @event stagemouseup
	 * @since 0.6.0
	 */

// パブリックプロパティ:
	/**
	 * ステージが、それぞれの描画の前に、自動的にキャンバスをクリアすべきかどうかを示します。手動的にクリアを制御するために、
	 * これをfalseにセットすることができます（たとえば、生成アートのために、もしくは同じキャンバスで複数のステージを指すときに）。
	 * @property autoClear
	 * @type Boolean
	 * @default true
	 **/
	p.autoClear = true;

	/**
	 * キャンバスのステージは、描画します。複数ステージは、単一のキャンバスを共有します。しかし、tickされる最初のステージにも関わらず、
	 * autoClearを無効にしなければなりません（もしくは、お互いの描画をクリアします）。
	 * @property canvas
	 * @type HTMLCanvasElement | Object
	 **/
	p.canvas = null;

	/**
	 * リードオンリー。現在のマウスのキャンバス上のX座標。マウスがキャンバスを離れるなら、これはキャンバス上での最も最近の位置を
	 * 示し、mouseInBoundsはfalseにセットされます。
	 * @property mouseX
	 * @type Number
	 **/
	p.mouseX = 0;

	/**
	 * リードオンリー。現在のマウスのキャンバス上のY座標。マウスがキャンバスを離れるなら、これはキャンバス上での最も最近の位置を
	 * 示し、mouseInBoundsはfalseにセットされます。
	 * @property mouseY
	 * @type Number
	 **/
	p.mouseY = 0;
	 
	/**
	 * onMouseMoveコールバックは、ユーザがキャンバス上でマウスを動かすときに呼び出されます。そのハンドラは、対応するMouseEventインスタンスを
	 * 含む単一のパラメータを渡されます。
	 * @property onMouseMove
	 * @type Function
	 * @deprecated "stagemousemove"を支持して。将来のバージョンで削除されます。
	 */
	p.onMouseMove = null;
	 
	/**
	 * onMouseUpコールバックは、ユーザが、ページが検出できる場所でマウスボタンを離したときに呼び出されます。そのハンドラは、対応するMouseEventインスタンスを
	 * 含む単一のパラメータを渡されます。
	 * @property onMouseUp
	 * @type Function
	 * @deprecated "stagemousemove"を支持して。将来のバージョンで削除されます。
	 */
	p.onMouseUp = null;
	 
	/**
	 * onMouseDownコールバックは、ユーザが、キャンバス上でマウスボタンを押したときに呼び出されます。そのハンドラは、対応するMouseEventインスタンスを
	 * 含む単一のパラメータを渡されます。
	 * @property onMouseDown
	 * @type Function
	 * @deprecated "stagemousemove"を支持して。将来のバージョンで削除されます。
	 */
	p.onMouseDown = null;

	/**
	 * ステージが、それらを描画するときにディスプレイオブジェクトのsnapToPixelプロパティを使用すべきかどうかを示します。
	 * 詳細は、DisplayObject.snapToPixelを参照してください。
	 * @property snapToPixelEnabled
	 * @type Boolean
	 * @default false
	 * @deprecated ハードウェアアクセラレーションは、これを有益でなくします。
	 **/
	p.snapToPixelEnabled = false;

	/**
	 * マウスが現在、キャンバスの境界内にあるかどうかを示します。
	 * @property mouseInBounds
	 * @type Boolean
	 * @default false
	 **/
	p.mouseInBounds = false;

	/**
	 * trueなら、tickコールバックはキャンバスへの描画に先だって、ステージ上のすべてのディスプレイオブジェクト上で呼び出されます。
	 * @property tickOnUpdate
	 * @type Boolean
	 * @default true
	 **/
	p.tickOnUpdate = true;
	
	/**
	 * trueなら、マウスムーブイベントは、マウスがターゲットキャンバスを離れる際に呼ばれ続けます。
	 * mouseInBoundsそして MouseEvent.x/y/rawX/rawYを参照してください。
	 * @property mouseMoveOutside
	 * @type Boolean
	 * @default false
	 **/
	p.mouseMoveOutside = false;
	
	/**
	 * hitAreaプロパティは、ステージのためにはサポートされていません。
	 * @property hitArea
	 * @type {DisplayObject}
	 * @default null
	 */

// プライベートプロパティ:

	/**
	 * 各アクティブポインタidのためにデータと共にオブジェクトを保持します。各オブジェクトは次のプロパティを持っています:
	 * x, y, event, target, overTarget, overX, overY, inBounds
	 * @property _pointerData
	 * @type {Object}
	 * @private
	 */
	p._pointerData = null;
	
	/**
	 * アクティブポインタの数
	 * @property _pointerCount
	 * @type {Object}
	 * @private
	 */
	p._pointerCount = 0;
	
	/**
	 * アクティブポインタの数
	 * @property _pointerCount
	 * @type {Object}
	 * @private
	 */
	p._primaryPointerID = null;

	/**
	 * @property _mouseOverIntervalID
	 * @protected
	 * @type Number
	 **/
	p._mouseOverIntervalID = null;

// コンストラクタ:
	/**
	 * @property DisplayObject_initialize
	 * @type Function
	 * @private
	 **/
	p.Container_initialize = p.initialize;

	/**
	 * 初期化メソッド
	 * @method initialize
	 * @param {HTMLCanvasElement | String | Object} canvas キャンバスオブジェクト、もしくは現在のドキュメントでのキャンバスオブジェクトの文字列id
	 * @protected
	 **/
	p.initialize = function(canvas) {
		this.Container_initialize();
		this.canvas = (typeof canvas == "string") ? document.getElementById(canvas) : canvas;
		this._pointerData = {};
		this.enableDOMEvents(true);
	}

// パブリックメソッド:

	/**
	 * updateメソッドが呼ばれるたび、ステージは、tickメソッドを露出している子孫をtickし（例. {{#crossLink "BitmapAnimation"}}{{/crossLink}})、
	 * キャンバスの全体のディスプレイリストを描画します。更新のために渡されるパラメータは、各onTickハンドラに渡されます。
	 * @method update
	 **/
	p.update = function() {
		if (!this.canvas) { return; }
		if (this.autoClear) { this.clear(); }
		Stage._snapToPixelEnabled = this.snapToPixelEnabled;
		if (this.tickOnUpdate) { this._tick((arguments.length ? arguments : null)); }
		var ctx = this.canvas.getContext("2d");
		ctx.save();
		this.updateContext(ctx);
		this.draw(ctx, false);
		ctx.restore();
	}

	/**
	 * updateメソッドを呼び出します。 {{#crossLink "Ticker"}}{{/crossLink}} に直接リスナとしてステージを追加することは有用です。
	 * @property tick
	 * @deprecated handleEventと共にTicker.addEventListenerを使うことを支持して。
	 * @type Function
	 **/
	p.tick = p.update;
	
	/**
	 * "tick"イベントを受け取ったとき、Stage.update() を呼び出すディフォルトイベントハンドラ。これは、以下を使うことで、
	 * 直接 {{#crossLink "Ticker"}}{{/crossLink}} 上でイベントリスナとして Stageインスタンスを登録することを許します。
	 * 
	 *      Ticker.addEventListener("tick", myStage");
	 * 
	 * このパターンを使ってtickにサブスクライブする場合、tickイベントオブジェクトは、deltaとpausedパラメータの代わりに、
	 * ディスプレイオブジェクトtickハンドラを通して渡されることに注意してください。
	 * @property handleEvent
	 * @type Function
	 **/
	p.handleEvent = function(evt) {
		if (evt.type == "tick") { this.update(evt); }
	}

	/**
	 * ターゲットキャンバスをクリアします。<code>autoClear</code> がfalseにセットされているときに有用です。
	 * @method clear
	 **/
	p.clear = function() {
		if (!this.canvas) { return; }
		var ctx = this.canvas.getContext("2d");
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	/**
	 * ステージのコンテンツのBase64でエンコードされたイメージを含むdata urlを返します。返されるdata urlは、イメージエレメントの
	 * src値として指定することができます。
	 * @method toDataURL
	 * @param {String} backgroundColor 生成されたイメージで使用される背景色。HEXカラー、rgbおよびrgbaを含む任意のHTMLカラーの値が
	 * 使用できます。ディフォルト値は、透明背景色です。
	 * @param {String} mimeType 作成されるイメージフォーマットのMIMEタイプ。ディフォルトは、"image/png"です。もし、未知のMIMEタイプが
	 * 渡された場合、もしくはブラウザが指定されたMIMEタイプをサポートしないときは、ディフォルト値が使用されます。
	 * @return {String} Base64でエンコードされたイメージ。
	 **/
	p.toDataURL = function(backgroundColor, mimeType) {
		if(!mimeType) {
			mimeType = "image/png";
		}

		var ctx = this.canvas.getContext('2d');
		var w = this.canvas.width;
		var h = this.canvas.height;

		var data;

		if(backgroundColor) {

			//キャンバスのために現在のImageDataを取得。
			data = ctx.getImageData(0, 0, w, h);

			//現在のglobalCompositeOperationを保存。
			var compositeOperation = ctx.globalCompositeOperation;

			//現在のコンテンツの後ろに描画するように設定
			ctx.globalCompositeOperation = "destination-over";

			//背景色の設定
			ctx.fillStyle = backgroundColor;

			//キャンバス全体の背景を描く
			ctx.fillRect(0, 0, w, h);
		}

		//キャンバスからのイメージデータを取得
		var dataURL = this.canvas.toDataURL(mimeType);

		if(backgroundColor) {
			//キャンバスをクリア
			ctx.clearRect (0, 0, w, h);

			//オリジナルの設定に戻す
			ctx.putImageData(data, 0, 0);

			//何であったのかをglobalCompositeOperationにリセット
			ctx.globalCompositeOperation = compositeOperation;
		}

		return dataURL;
	}

	/**
	 * このステージのディスプレイリストのために、（0のfrequencyを渡すことで）マウスオーバーイベント (mouseover and mouseout) を
	 * 有効もしくは無効にします。これらのイベントは発生させることで高くつくので、ディフォルトでは無効になっていて、イベントの頻度は
	 * 任意の <code>frequency</code> パラメータを介して、独立してマウス移動イベントを制御することができます。
	 * @method enableMouseOver
	 * @param {Number} [frequency=20] mouse over/outイベントをブロードキャストする１秒間の最大回数を指定するオプションのパラメータ。
	 * mouse overイベントを完全に止めるには 0 にセットしてください。最大は、50です。低い frequencyは、低い反応ですが、CPUは軽くなります。
	 **/
	p.enableMouseOver = function(frequency) {
		if (this._mouseOverIntervalID) {
			clearInterval(this._mouseOverIntervalID);
			this._mouseOverIntervalID = null;
		}
		if (frequency == null) { frequency = 20; }
		else if (frequency <= 0) { return; }
		var o = this;
		this._mouseOverIntervalID = setInterval(function(){ o._testMouseOver(); }, 1000/Math.min(50,frequency));
	}
	
	/**
	 * ステージがDOMエレメント(window, document and canvas)に追加するイベントリスナを有効もしくは無効にします。
	 * それは、Stageインスタンスを廃棄するときに無効にする、よいプラクティスです。一方、ステージはページから
	 * イベントを受け取り続けます。
	 * @method enableDOMEvents
	 * @param {Boolean} [enable=true] イベントを有効にするか無効にするかを指定します。ディフォルトはtrueです。
	 **/
	p.enableDOMEvents = function(enable) {
		if (enable == null) { enable = true; }
		var n, o, ls = this._eventListeners;
		if (!enable && ls) {
			for (n in ls) {
				o = ls[n];
				o.t.removeEventListener(n, o.f);
			}
			this._eventListeners = null;
		} else if (enable && !ls) {
			var t = window.addEventListener ? window : document;
			var _this = this;
			ls = this._eventListeners = {};
			ls["mouseup"] = {t:t, f:function(e) { _this._handleMouseUp(e)} };
			ls["mousemove"] = {t:t, f:function(e) { _this._handleMouseMove(e)} };
			ls["dblclick"] = {t:t, f:function(e) { _this._handleDoubleClick(e)} };
			t = this.canvas;
			if (t) { ls["mousedown"] = {t:t, f:function(e) { _this._handleMouseDown(e)} }; }
			
			for (n in ls) {
				o = ls[n];
				o.t.addEventListener(n, o.f);
			}
		}
	}

	/**
	 * このステージのクローンを返します。
	 * @return {Stage} 現在のContainerインスタンスのクローン。
	 **/
	p.clone = function() {
		var o = new Stage(null);
		this.cloneProps(o);
		return o;
	}

	/**
	 * このオブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} インスタンスの文字列表現。
	 **/
	p.toString = function() {
		return "[Stage (name="+  this.name +")]";
	}

	// プライベートメソッド:
	
	/**
	 * @method _getPointerData
	 * @protected
	 * @param {Number} id
	 **/
	p._getPointerData = function(id) {
		var data = this._pointerData[id];
		if (!data) {
			data = this._pointerData[id] = {x:0,y:0};
			// if it's the mouse (id == NaN) or the first new touch, then make it the primary pointer id:
			if (this._primaryPointerID == null) { this._primaryPointerID = id; }
		}
		return data;
	}

	/**
	 * @method _handleMouseMove
	 * @protected
	 * @param {MouseEvent} e
	 **/
	p._handleMouseMove = function(e) {
		if(!e){ e = window.event; }
		this._handlePointerMove(-1, e, e.pageX, e.pageY);
	}
	
	/**
	 * @method _handlePointerMove
	 * @protected
	 * @param {Number} id
	 * @param {Event} e
	 * @param {Number} pageX
	 * @param {Number} pageY
	 **/
	p._handlePointerMove = function(id, e, pageX, pageY) {
		if (!this.canvas) { return; } // this.mouseX = this.mouseY = null;
		var evt;
		var o = this._getPointerData(id);

		var inBounds = o.inBounds;
		this._updatePointerPosition(id, pageX, pageY);
		if (!inBounds && !o.inBounds && !this.mouseMoveOutside) { return; }
		
		if (this.onMouseMove || this.hasEventListener("stagemousemove"))  {
			evt = new createjs.MouseEvent("stagemousemove", o.x, o.y, this, e, id, id == this._primaryPointerID, o.rawX, o.rawY);
			this.onMouseMove&&this.onMouseMove(evt);
			this.dispatchEvent(evt);
		}
		
		var oEvt = o.event;
		if (oEvt && (oEvt.onMouseMove || oEvt.hasEventListener("mousemove"))) {
			evt = new createjs.MouseEvent("mousemove", o.x, o.y, oEvt.target, e, id, id == this._primaryPointerID, o.rawX, o.rawY);
			oEvt.onMouseMove&&oEvt.onMouseMove(evt);
			oEvt.dispatchEvent(evt, oEvt.target);
		}
	}

	/**
	 * @method _updatePointerPosition
	 * @protected
	 * @param {Number} id
	 * @param {Number} pageX
	 * @param {Number} pageY
	 **/
	p._updatePointerPosition = function(id, pageX, pageY) {
		var rect = this._getElementRect(this.canvas);
		pageX -= rect.left;
		pageY -= rect.top;
		
		var w = this.canvas.width;
		var h = this.canvas.height;
		pageX /= (rect.right-rect.left)/w;
		pageY /= (rect.bottom-rect.top)/h;
		var o = this._getPointerData(id);
		if (o.inBounds = (pageX >= 0 && pageY >= 0 && pageX <= w-1 && pageY <= h-1)) {
			o.x = pageX;
			o.y = pageY;
		} else if (this.mouseMoveOutside) {
			o.x = pageX < 0 ? 0 : (pageX > w-1 ? w-1 : pageX);
			o.y = pageY < 0 ? 0 : (pageY > h-1 ? h-1 : pageY);
		}
		
		o.rawX = pageX;
		o.rawY = pageY;
		
		if (id == this._primaryPointerID) {
			this.mouseX = o.x;
			this.mouseY = o.y;
			this.mouseInBounds = o.inBounds;
		}
	}
	
	/**
	 * @method _getElementRect
	 * @protected
	 * @param {HTMLElement} e
	 **/
	p._getElementRect = function(e) {
		var bounds;
		try { bounds = e.getBoundingClientRect(); } // this can fail on disconnected DOM elements in IE9
		catch (err) { bounds = {top: e.offsetTop, left: e.offsetLeft, width:e.offsetWidth, height:e.offsetHeight}; }
		
		var offX = (window.pageXOffset || document.scrollLeft || 0) - (document.clientLeft || document.body.clientLeft || 0);
		var offY = (window.pageYOffset || document.scrollTop || 0) - (document.clientTop  || document.body.clientTop  || 0);
		
		var styles = window.getComputedStyle ? getComputedStyle(e) : e.currentStyle; // IE <9 compatibility.
		var padL = parseInt(styles.paddingLeft)+parseInt(styles.borderLeftWidth);
		var padT = parseInt(styles.paddingTop)+parseInt(styles.borderTopWidth);
		var padR = parseInt(styles.paddingRight)+parseInt(styles.borderRightWidth);
		var padB = parseInt(styles.paddingBottom)+parseInt(styles.borderBottomWidth);
		
		// note: いくつかのブラウザにおいて、boundsプロパティはリードオンリーです。
		return {
			left: bounds.left+offX+padL,
			right: bounds.right+offX-padR,
			top: bounds.top+offY+padT,
			bottom: bounds.bottom+offY-padB
		}
	}

	/**
	 * @method _handleMouseUp
	 * @protected
	 * @param {MouseEvent} e
	 **/
	p._handleMouseUp = function(e) {
		this._handlePointerUp(-1, e, false);
	}
	
	/**
	 * @method _handlePointerUp
	 * @protected
	 * @param {Number} id
	 * @param {Event} e
	 * @param {Boolean} clear
	 **/
	p._handlePointerUp = function(id, e, clear) {
		var o = this._getPointerData(id);
		var evt;
		
		if (this.onMouseMove || this.hasEventListener("stagemouseup")) {
			evt = new createjs.MouseEvent("stagemouseup", o.x, o.y, this, e, id, id==this._primaryPointerID, o.rawX, o.rawY);
			this.onMouseUp&&this.onMouseUp(evt);
			this.dispatchEvent(evt);
		}
		
		var oEvt = o.event;
		if (oEvt && (oEvt.onMouseUp || oEvt.hasEventListener("mouseup"))) {
			evt = new createjs.MouseEvent("mouseup", o.x, o.y, oEvt.target, e, id, id==this._primaryPointerID, o.rawX, o.rawY);
			oEvt.onMouseUp&&oEvt.onMouseUp(evt);
			oEvt.dispatchEvent(evt, oEvt.target);
		}
		
		var oTarget = o.target;
		if (oTarget && (oTarget.onClick  || oTarget.hasEventListener("click")) && this._getObjectsUnderPoint(o.x, o.y, null, true, (this._mouseOverIntervalID ? 3 : 1)) == oTarget) {
			evt = new createjs.MouseEvent("click", o.x, o.y, oTarget, e, id, id==this._primaryPointerID, o.rawX, o.rawY);
			oTarget.onClick&&oTarget.onClick(evt);
			oTarget.dispatchEvent(evt);
		}
		
		if (clear) {
			if (id == this._primaryPointerID) { this._primaryPointerID = null; }
			delete(this._pointerData[id]);
		} else { o.event = o.target = null; }
	}

	/**
	 * @method _handleMouseDown
	 * @protected
	 * @param {MouseEvent} e
	 **/
	p._handleMouseDown = function(e) {
		this._handlePointerDown(-1, e, false);
	}
	
	/**
	 * @method _handlePointerDown
	 * @protected
	 * @param {Number} id
	 * @param {Event} e
	 * @param {Number} x
	 * @param {Number} y
	 **/
	p._handlePointerDown = function(id, e, x, y) {
		var o = this._getPointerData(id);
		if (y != null) { this._updatePointerPosition(id, x, y); }
		
		if (this.onMouseDown || this.hasEventListener("stagemousedown")) {
			var evt = new createjs.MouseEvent("stagemousedown", o.x, o.y, this, e, id, id==this._primaryPointerID, o.rawX, o.rawY);
			this.onMouseDown&&this.onMouseDown(evt);
			this.dispatchEvent(evt);
		}
		
		var target = this._getObjectsUnderPoint(o.x, o.y, null, (this._mouseOverIntervalID ? 3 : 1));
		if (target) {
			o.target = target;
			if (target.onPress || target.hasEventListener("mousedown")) {
				evt = new createjs.MouseEvent("mousedown", o.x, o.y, target, e, id, id==this._primaryPointerID, o.rawX, o.rawY);
				target.onPress&&target.onPress(evt);
				target.dispatchEvent(evt);
				
				if (evt.onMouseMove || evt.onMouseUp || evt.hasEventListener("mousemove") || evt.hasEventListener("mouseup")) { o.event = evt; }
			}
		}
	}

	/**
	 * @method _testMouseOver
	 * @protected
	 **/
	p._testMouseOver = function() {
		// for now, this only tests the mouse.
		if (this._primaryPointerID != -1) { return; }
		
		// only update if the mouse position has changed. This provides a lot of optimization, but has some trade-offs.
		if (this.mouseX == this._mouseOverX && this.mouseY == this._mouseOverY && this.mouseInBounds) { return; }
		var target = null;
		if (this.mouseInBounds) {
			target = this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, 3);
			this._mouseOverX = this.mouseX;
			this._mouseOverY = this.mouseY;
		}
		
		var mouseOverTarget = this._mouseOverTarget;
		if (mouseOverTarget != target) {
			var o = this._getPointerData(-1);
			if (mouseOverTarget && (mouseOverTarget.onMouseOut ||  mouseOverTarget.hasEventListener("mouseout"))) {
				var evt = new createjs.MouseEvent("mouseout", o.x, o.y, mouseOverTarget, null, -1, o.rawX, o.rawY);
				mouseOverTarget.onMouseOut&&mouseOverTarget.onMouseOut(evt);
				mouseOverTarget.dispatchEvent(evt);
			}
			if (mouseOverTarget) { this.canvas.style.cursor = ""; }
			
			if (target && (target.onMouseOver || target.hasEventListener("mouseover"))) {
				evt = new createjs.MouseEvent("mouseover", o.x, o.y, target, null, -1, o.rawX, o.rawY);
				target.onMouseOver&&target.onMouseOver(evt);
				target.dispatchEvent(evt);
			}
			if (target) { this.canvas.style.cursor = target.cursor||""; }
			
			this._mouseOverTarget = target;
		}
	}

	/**
	 * @method _handleDoubleClick
	 * @protected
	 * @param {MouseEvent} e
	 **/
	p._handleDoubleClick = function(e) {
		var o = this._getPointerData(-1);
		var target = this._getObjectsUnderPoint(o.x, o.y, null, (this._mouseOverIntervalID ? 3 : 1));
		if (target && (target.onDoubleClick || target.hasEventListener("dblclick"))) {
			evt = new createjs.MouseEvent("dblclick", o.x, o.y, target, e, -1, true, o.rawX, o.rawY);
			target.onDoubleClick&&target.onDoubleClick(evt);
			target.dispatchEvent(evt);
		}
	}

createjs.Stage = Stage;
}());
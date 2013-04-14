/*
* Touch
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

// TODO: ダブルタップのサポート
/**
 * EaselJS内でデバイスに対してマルチタッチの機能を提供するグローバルなユーティリティ。現状W3C Touch API（iOSとモダンな
 * Androidブラウザ）とIE10をサポート。
 *
 * アプリケーションをクリーンアップする際は必ずタッチを{{#crossLink "Touch/disable"}}{{/crossLink}}してください。
 * タッチがサポートされていない場合は安全に失敗するので、サポートされているかをチェックする必要はないことに留意してください。
 *
 * <h4>例</h4>
 *      var stage = new createjs.Stage("canvas");
 *      createjs.Touch.enable(stage);
 *
 * @class Touch
 * @static
 **/
var Touch = function() {
	throw "Touch cannot be instantiated";
};

// パブリックスタティックメソッド:
	/**
     * 現在のブラウザでタッチがサポートされていればtrueを返却する
	 * @method isSupported
	 * @return {Boolean} 現在のブラウザでタッチがサポートされているかを示す
	 * @static
	 **/
	Touch.isSupported = function() {
		return	('ontouchstart' in window) || // iOS
					(window.navigator['msPointerEnabled']); // IE10
	};

	/**
	 * 特定のEaselJSのステージに対してタッチ作用を有効にする。現在iOS(加え、モダンなAndroidブラウザなどの互換ブラウザ)、
     * IE10がサポート。
     * シングルタッチとマルチタッチモードの両方をサポート。EaselJSのMouseEventモデルを拡張するが、ダブルクリックまたは
     * オーバー/アウトイベントはサポートしていない。詳細についてはMouseEvent.pointerIDを参照のこと。
	 * @method enable
	 * @param {Stage} stage タッチを有効にするステージ
	 * @param {Boolean} [singleTouch=false] trueのとき、単一のタッチのみが一度に発生する
	 * @param {Boolean} [allowDefault=false] trueのとき、標準のジェスチャーアクション（例. スクロール、ズーム）は
     * ユーザが扱っているキャンバス上で有効となる
	 * @return {Boolean} 対象のステージへタッチの有効化ができたとき、trueを返却する
	 * @static
	 **/
	Touch.enable = function(stage, singleTouch, allowDefault) {
		if (!stage || !stage.canvas || !Touch.isSupported()) { return false; }

		// 必須なプロパティをステージに織り込む
		stage.__touch = {pointers:{}, multitouch:!singleTouch, preventDefault:!allowDefault, count:0};

        // 将来、重複呼び出しを防ぐために標準のマウスイベントモデルを無効にする必要があるかも知れないことに注意してください。
        // しかしながら、iOSデバイス上では特に問題はなさそうです。
		if ('ontouchstart' in window) { Touch._IOS_enable(stage); }
		else if (window.navigator['msPointerEnabled']) { Touch._IE_enable(stage); }
		return true;
	};

	/**
	 * ステージ上でTouch.enableを呼んだ際に設定されたリスナーを全て取り除く
	 * @method disable
	 * @param {Stage} stage タッチを無効にする対象のステージ
	 * @static
	 **/
	Touch.disable = function(stage) {
		if (!stage) { return; }
		if ('ontouchstart' in window) { Touch._IOS_disable(stage); }
		else if (window.navigator['msPointerEnabled']) { Touch._IE_disable(stage); }
	};

// プライベートスタティックメソッド:

	/**
	 * @method _IOS_enable
	 * @protected
	 * @param {Stage} stage
	 * @static
	 **/
	Touch._IOS_enable = function(stage) {
		var canvas = stage.canvas;
		var f = stage.__touch.f = function(e) { Touch._IOS_handleEvent(stage,e); };
		canvas.addEventListener("touchstart", f, false);
		canvas.addEventListener("touchmove", f, false);
		canvas.addEventListener("touchend", f, false);
		canvas.addEventListener("touchcancel", f, false);
	};

	/**
	 * @method _IOS_disable
	 * @protected
	 * @param {Stage} stage
	 * @static
	 **/
	Touch._IOS_disable = function(stage) {
		var canvas = stage.canvas;
		if (!canvas) { return; }
		var f = stage.__touch.f;
		canvas.removeEventListener("touchstart", f, false);
		canvas.removeEventListener("touchmove", f, false);
		canvas.removeEventListener("touchend", f, false);
		canvas.removeEventListener("touchcancel", f, false);
	};

	/**
	 * @method _IOS_handleEvent
	 * @protected
	 * @static
	 **/
	Touch._IOS_handleEvent = function(stage, e) {
		if (!stage) { return; }
		if (stage.__touch.preventDefault) { e.preventDefault&&e.preventDefault(); }
		var touches = e.changedTouches;
		var type = e.type;
		for (var i= 0,l=touches.length; i<l; i++) {
			var touch = touches[i];
			var id = touch.identifier;
			if (touch.target != stage.canvas) { continue; }

			if (type == "touchstart") {
				this._handleStart(stage, id, e, touch.pageX, touch.pageY);
			} else if (type == "touchmove") {
				this._handleMove(stage, id, e, touch.pageX, touch.pageY);
			} else if (type == "touchend" || type == "touchcancel") {
				this._handleEnd(stage, id, e);
			}
		}
	};

	/**
	 * @method _IE_enable
	 * @protected
	 * @param {Stage} stage
	 * @static
	 **/
	Touch._IE_enable = function(stage) {
		var canvas = stage.canvas;
		var f = stage.__touch.f = function(e) { Touch._IE_handleEvent(stage,e); };
		canvas.addEventListener("MSPointerDown", f, false);
		window.addEventListener("MSPointerMove", f, false);
		window.addEventListener("MSPointerUp", f, false);
		window.addEventListener("MSPointerCancel", f, false);
		if (stage.__touch.preventDefault) { canvas.style.msTouchAction = "none"; }
		stage.__touch.activeIDs = {};
	};

	/**
	 * @method _IE_enable
	 * @protected
	 * @param {Stage} stage
	 * @static
	 **/
	Touch._IE_disable = function(stage) {
		var f = stage.__touch.f;
		window.removeEventListener("MSPointerMove", f, false);
		window.removeEventListener("MSPointerUp", f, false);
		window.removeEventListener("MSPointerCancel", f, false);
		if (stage.canvas) {
			stage.canvas.removeEventListener("MSPointerDown", f, false);
		}
	};

	/**
	 * @method _IE_handleEvent
	 * @protected
	 * @static
	 **/
	Touch._IE_handleEvent = function(stage, e) {
		if (!stage) { return; }
		if (stage.__touch.preventDefault) { e.preventDefault&&e.preventDefault(); }
		var type = e.type;
		var id = e.pointerId;
		var ids = stage.__touch.activeIDs;

		if (type == "MSPointerDown") {
			if (e.srcElement != stage.canvas) { return; }
			ids[id] = true;
			this._handleStart(stage, id, e, e.pageX, e.pageY);
		} else if (ids[id]) { // it's an id we're watching
			if (type == "MSPointerMove") {
				this._handleMove(stage, id, e, e.pageX, e.pageY);
			} else if (type == "MSPointerUp" || type == "MSPointerCancel") {
				delete(ids[id]);
				this._handleEnd(stage, id, e);
			}
		}
	};


	/**
	 * @method _handleStart
	 * @protected
	 **/
	Touch._handleStart = function(stage, id, e, x, y) {
		var props = stage.__touch;
		if (!props.multitouch && props.count) { return; }
		var ids = props.pointers;
		if (ids[id]) { return; }
		ids[id] = true;
		props.count++;
		stage._handlePointerDown(id, e, x, y);
	};

	/**
	 * @method _handleMove
	 * @protected
	 **/
	Touch._handleMove = function(stage, id, e, x, y) {
		if (!stage.__touch.pointers[id]) { return; }
		stage._handlePointerMove(id, e, x, y);
	};

	/**
	 * @method _handleEnd
	 * @protected
	 **/
	Touch._handleEnd = function(stage, id, e) {
		// TODO: キャンセルは適切なUIのために違う扱われ方にすべき（例. upはクリックをトリガーし、キャンセルはもっとoutを真似る）
		var props = stage.__touch;
		var ids = props.pointers;
		if (!ids[id]) { return; }
		props.count--;
		stage._handlePointerUp(id, e, true);
		delete(ids[id]);
	};


createjs.Touch = Touch;
}());
/*
* EventDispatcher
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
 * EventDispatcher は、優先順位の付いたイベントリスナのキューの管理とイベントを発行するメソッドを提供します。全ての
 * {{#crossLink "DisplayObject"}}{{/crossLink}} クラスはイベントを発行します。{{#crossLink "Ticker"}}{{/crossLink}} 等のいくつかのユーティリティも同様です。
 *
 * このクラスを拡張することもできますし、EventDispatcher {{#crossLink "EventDispatcher/initialize"}}{{/crossLink}} メソッドを使って、既存の prototype やインスタンスに
 * このクラスのメソッドを追加することもできます。
 *
 * <h4>例</h4>
 * EventDispatcher の機能を "MyClass" クラスに追加します。
 *
 *      EventDispatcher.initialize(MyClass.prototype);
 *
 * イベントを 1 つ追加します。 ({{#crossLink "EventDispatcher/addEventListener"}}{{/crossLink}} を参照)
 *
 *      instance.addEventListener("eventName", handlerMethod);
 *      function handlerMethod(event) {
 *          console.log(event.target + " がクリックされました");
 *      }
 *
 * <b>適切なスコープの管理</b><br />
 * EventDispatcher をクラス内で使用する場合、<code>Function.bind</code> やその他の方法を使用してメソッドのスコープを
 * 保持したい場合があるかもしれません。Function.bind はいくつかの古いブラウザーではサポートされない点に注意して下さい。
 *
 *      instance.addEventListener("click", handleClick.bind(this));
 *      function handleClick(event) {
 *          console.log("メソッドが呼ばれたスコープは: " + this);
 *      }
 *
 * 現在、EventDispatcher はイベントの優先順位やバブリングをサポートしないことに注意して下さい。将来のバージョンでは
 * これらの機能のどちらか、あるいは両方のサポートが追加されるかもしれません。
 *
 * @class EventDispatcher
 * @constructor
 **/
var EventDispatcher = function() {
  this.initialize();
};
var p = EventDispatcher.prototype;


	/**
	 * EventDispatcher のメソッドをミックスインする静的な初期化機能
	 * @method initialize
	 * @static
	 * @param {Object} target EventDispatcher のメソッドを追加する対象のオブジェクトです。インスタンスと prototype の
	 * どちらも指定可能です。
	 **/
	EventDispatcher.initialize = function(target) {
		target.addEventListener = p.addEventListener;
		target.removeEventListener = p.removeEventListener;
		target.removeAllEventListeners = p.removeAllEventListeners;
		target.hasEventListener = p.hasEventListener;
		target.dispatchEvent = p.dispatchEvent;
	};

// プライベートプロパティ:
	/**
	 * @protected
	 * @property _listeners
	 * @type Object
	 **/
	p._listeners = null;

// コンストラクタ:
	/**
	 * 初期化メソッド
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function() {};

// パブリックメソッド:
	/**
	 * 指定されたイベントリスナを追加します。
	 * @method addEventListener
	 * @param {String} type イベントの種類を文字列で指定します
	 * @param {Function | Object} listener handleEvent メソッドを持つオブジェクト、またはイベントが発行された時に
	 * 呼ばれる関数です
	 * @return {Function | Object} listener を連携や代入等の目的に使用できるように返します
	 **/
	p.addEventListener = function(type, listener) {
		var listeners = this._listeners;
		if (!listeners) { listeners = this._listeners = {}; }
		else { this.removeEventListener(type, listener); }
		var arr = listeners[type];
		if (!arr) { arr = listeners[type] = []; }
		arr.push(listener);
		return listener;
	};

	/**
	 * 指定されたイベントリスナを削除します。
	 * @method removeEventListener
	 * @param {String} type イベントの種類を文字列で指定します。
	 * @param {Function | Object} listener リスナ関数又はオブジェクトです。
	 **/
	p.removeEventListener = function(type, listener) {
		var listeners = this._listeners;
		if (!listeners) { return; }
		var arr = listeners[type];
		if (!arr) { return; }
		for (var i=0,l=arr.length; i<l; i++) {
			if (arr[i] == listener) {
				if (l==1) { delete(listeners[type]); } // allows for faster checks.
				else { arr.splice(i,1); }
				break;
			}
		}
	};

	/**
	 * 指定された種類、または全ての種類に対して関連付けられたリスナを全て削除します。
	 * @method removeAllEventListeners
	 * @param {String} [type] イベントの種類を指定します。省略すると全ての種類に対応する全てのリスナが削除されます。
	 **/
	p.removeAllEventListeners = function(type) {
		if (!type) { this._listeners = null; }
		else if (this._listeners) { delete(this._listeners[type]); }
	};

	/**
	 * 指定されたイベントを発行します。
	 * @method dispatchEvent
	 * @param {Object | String} eventObj "type" プロパティを持つオブジェクト、もしくは種類を指定する文字列です。
	 * dispatchEvent  "type" と "params" プロパティを持つ汎用イベントオブジェクトを生成します。
	 * @param {Object} [target] イベントオブジェクトの target プロパティとして使うオブジェクトです。デフォルト値は
	 * イベントを発行したオブジェクトです。
	 * @return {Boolean} リスナが 1 つでも true を返したら true になります。
	 **/
	p.dispatchEvent = function(eventObj, target) {
		var ret=false, listeners = this._listeners;
		if (eventObj && listeners) {
			if (typeof eventObj == "string") { eventObj = {type:eventObj}; }
			var arr = listeners[eventObj.type];
			if (!arr) { return ret; }
			eventObj.target = target||this;
			arr = arr.slice(); // to avoid issues with items being removed or added during the dispatch
			for (var i=0,l=arr.length; i<l; i++) {
				var o = arr[i];
				if (o.handleEvent) { ret = ret||o.handleEvent(eventObj); }
				else { ret = ret||o(eventObj); }
			}
		}
		return !!ret;
	};

	/**
	 * 指定されたイベントの種類に対して 1 つ以上のリスナが存在するかを調べます。
	 * @method hasEventListener
	 * @param {String} type イベントの種類を文字列で指定します。
	 * @return {Boolean} 指定されたイベントのリスナが存在すると true を返します。
	 **/
	p.hasEventListener = function(type) {
		var listeners = this._listeners;
		return !!(listeners && listeners[type]);
	};

	/**
	 * @method toString
	 * @return {String} インスタンスを表現する文字列です。
	 **/
	p.toString = function() {
		return "[EventDispatcher]";
	};


createjs.EventDispatcher = EventDispatcher;
}());
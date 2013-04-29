/*
* AbstractLoader for PreloadJS
* Visit http://createjs.com/ for documentation, updates and examples.
*
*
* Copyright (c) 2012 gskinner.com, inc.
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

/**
 * @module PreloadJS
 */

// 名前空間:
this.createjs = this.createjs||{};

(function() {

	/**
	 * 全てのコールバックとイベントを定義する基底となるローダーです。
	 * @class AbstractLoader
	 * @uses EventDispatcher
	 */
	var AbstractLoader = function () {
		this.init();
	};

	AbstractLoader.prototype = {};
	var p = AbstractLoader.prototype;
	var s = AbstractLoader;

	/**
	 * ファイルURIをパースするための正規表現パターンです。
	 * クエリー文字列のついたフルドメインURIだけでなく、ファイル名だけのものもサポートします。
	 * マッチした結果は以下のようになります。プロトコル:$1 ドメイン:$2 パス:$3 ファイル名:$4 拡張子:$5 クエリー:$6。
	 * @property FILE_PATTERN
	 * @type {RegExp}
	 * @static
	 * @protected
	 */
	s.FILE_PATTERN = /(\w+:\/{2})?((?:\w+\.){2}\w+)?(\/?[\S]+\/|\/)?([\w\-%\.]+)(?:\.)(\w+)?(\?\S+)?/i;

	/**
	 * ローダーがロード完了したか否かです。
	 * これにより素早いチェックが可能です。
	 * また、ローディングに使用された複数通りの方法が<code>complete</code>イベントを複数発行しないことを保証するためにも使用されます。
	 * @property loaded
	 * @type {Boolean}
	 * @default false
	 */
	p.loaded = false;

	/**
	 * ローダーがキャンセルされたか否かです。
	 * キャンセルされたロードは完了イベントを発火しません。
	 * {{#crossLink "LoadQueue"}}{{/crossLink}}のキューはcanceledでなく{{#crossLink "AbstractLoader/close"}}{{/crossLink}}
	 * によってクローズすべきです。
	 * @property canceled
	 * @type {Boolean}
	 * @default false
	 */
	p.canceled = false;

	/**
	 * このアイテムの現在のロード進捗（パーセンテージ）です。
	 * 0と1の間の値をとります。
	 * @property progress
	 * @type {Number}
	 * @default 0
	 */
	p.progress = 0;

	/**
	 * このローダーの対応するアイテムです。
	 * {{#crossLink "LoadQueue"}}{{/crossLink}}においてはnullですが、
	 * {{#crossLink "XHRLoader"}}{{/crossLink}}や{{#crossLink "TagLoader"}}{{/crossLink}}のようなローダーでは使用可能です。
	 * @property _item
	 * @type {Object}
	 * @private
	 */
	p._item = null;

// イベント
	/**
	 * 全体の進捗が変化したときに発火されるイベントです。
	 * @event progress
	 * @param {Object} target イベントを発行したオブジェクトです。
	 * @param {String} type イベントタイプです。
	 * @param {Number} loaded 現時点でロードした量です。特記事項として、ロードの開始前はファイルサイズが未知のため、1となることがあります。
	 * @param {Number} total 全バイト数です。1となることがあります。
	 * @param {Number} percent ロードしたパーセンテージです。0と1の間の値をとります。
	 * @since 0.3.0
	 */

	/**
	 * ロード開始時に発火されるイベントです。
	 * @event loadStart
	 * @param {Object} target イベントを発行したオブジェクトです。
	 * @param {String} type イベントタイプです。
	 * @since 0.3.0
	 */

	/**
	 * キューの全アイテムがロードされたときに発火されるイベントです。
	 * @event complete
	 * @param {Object} target イベントを発行したオブジェクトです。
	 * @param {String} type イベントタイプです。
	 * @since 0.3.0
	 */

	/**
	 * ローダーがエラーに遭遇した時に発火されるイベントです。
	 * ファイルに関するエラーの場合、原因となったアイテムが格納されます。
	 * エラー原因のようなプロパティがイベントオブジェクトに追加されることがあります。
	 * @event error
	 * @param {Object} target イベントを発行したオブジェクトです。
	 * @param {String} type イベントタイプです。
	 * @param {Object} [item] ロード中にエラーが発生したアイテムです。アイテムは{{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}
	 *  あるいは{{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}の呼び出しで指定されています。
	 *  文字列のパスあるいはタグが指定された場合は、オブジェクトはその値をプロパティとして格納しています。
	 * @param {String} [error] エラーオブジェクトあるいはエラーメッセージです。
	 * @since 0.3.0
	 */

// コールバック（廃止予定）
	/**
	 * 全体の進捗が変化したときに発火されるコールバックです。
	 * @property onProgress
	 * @type {Function}
	 * @deprecated "progress"イベントの使用をします。将来のバージョンで削除されるでしょう。
	 */
	p.onProgress = null;

	/**
	 * ロード開始時に発火されるコールバックです。
	 * @property onLoadStart
	 * @type {Function}
	 * @deprecated "loadStart"イベントの使用を推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onLoadStart = null;

	/**
	 * ローダーのアイテムが全てロードされたときに発火されるコールバックです。
	 * @property onComplete
	 * @type {Function}
	 * @deprecated "complete"イベントの使用を推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onComplete = null;

	/**
	 * ローダーがエラーに遭遇した時に発火されるコールバックです。
	 * @property onError
	 * @type {Function}
	 * @deprecated "error"イベントの使用を推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onError = null;


// ミックスイン:
	// EventDispatcherのメソッド:
	p.addEventListener = null;
	p.removeEventListener = null;
	p.removeAllEventListeners = null;
	p.dispatchEvent = null;
	p.hasEventListener = null;
	p._listeners = null;
	createjs.EventDispatcher.initialize(p);


	/**
	 * このローダーでロードされるマニフェストアイテムの参照を取得します。
	 * ほとんどのケースでは{{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}あるいは{{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}
	 * によって{{#crossLink "LoadQueue"}}{{/crossLink}}に渡される値となります。
	 * 文字列だけが渡された場合、LoadQueによって生成されるオブジェクトになります。
	 * @return {Object} このローダーがロードを担当するマニフェストアイテムです。
	 */
	p.getItem = function() {
		return this._item;
	};

	/**
	 * ローダーを初期化します。これはコンストラクタによって呼ばれます。
	 * @method initialize
	 * @private
	 */
	p.init = function () {};

	/**
	 * キューに入ったアイテムをロード開始します。
	 * このメソッドは、{{#crossLink "LoadQueue"}}{{/crossLink}}を準備した後にすぐにはロード開始しなかったときに呼び出せます。
	 * @example
	 *      var queue = new createjs.LoadQueue();
	 *      queue.addEventListener("complete", handleComplete);
	 *      queue.loadManifest(fileArray, false); // 2番目の引数により、キューにまだロード開始しないことを指示しています。
	 *      queue.load();
	 * @method load
	 */
	p.load = function() {};

	/**
	 * アクティブなキューをクローズします。
	 * キューをクローズするとキューは完全に空になり、残っていたアイテムはダウンロード開始しなくなります。
	 * 現時点でアクティブなロードはオープンなまま残り、イベントも処理されます。
	 *
	 * キューをストップし再開するには、こちらの代わりに{{#crossLink "LoadQueue/setPaused"}}{{/crossLink}}を使用してください。
	 * @method close
	 */
	p.close = function() {};


//コールバックプロキシ
	/**
	 * loadStartイベントを発行します（同時にonLoadStartコールバックを呼び出します）。
	 * イベントオブジェクトの内容の詳細については<code>AbstractLoader.loadStart</code>を参照してください。
	 * @method _sendLoadStart
	 * @protected
	 */
	p._sendLoadStart = function() {
		if (this._isCanceled()) { return; }
		this.onLoadStart && this.onLoadStart({target:this});
		this.dispatchEvent("loadStart");
	};

	/**
	 * progressイベントを発行します（同時にonProgressコールバックを呼び出します）。
	 * イベントオブジェクトの内容の詳細については<code>AbstractLoader.loadStart</code>を参照してください。
	 * @method _sendProgress
	 * @param {Number | Object} value ロードされているアイテムの進捗あるいは<code>loaded</code>と<code>total</code>プロパティを含むオブジェクトです。
	 * @protected
	 */
	p._sendProgress = function(value) {
		if (this._isCanceled()) { return; }
		var event = null;
		if (typeof(value) == "number") {
			this.progress = value;
			event = {loaded:this.progress, total:1};
		} else {
			event = value;
			this.progress = value.loaded / value.total;
			if (isNaN(this.progress) || this.progress == Infinity) { this.progress = 0; }
		}
		event.target = this;
		event.type = "progress";
		this.onProgress && this.onProgress(event);
		this.dispatchEvent(event);
	};

	/**
	 * completeイベントを発行します（同時にonCompleteコールバックを呼び出します）。
	 * イベントオブジェクトの内容の詳細については<code>AbstractLoader.loadStart</code>を参照してください。
	 * @method _sendComplete
	 * @protected
	 */
	p._sendComplete = function() {
		if (this._isCanceled()) { return; }
		this.onComplete && this.onComplete({target:this});
		this.dispatchEvent("complete");
	};

	/**
	 * errorイベントを発行します（同時にonErrorコールバックを呼び出します）。
	 * イベントオブジェクトの内容の詳細については<code>AbstractLoader.loadStart</code>を参照してください。
	 * @method _sendError
	 * @param {Object} event 特定のエラープロパティを含むエラーオブジェクトです。
	 * @protected
	 */
	p._sendError = function(event) {
		if (this._isCanceled()) { return; }
		if (event == null) { event = {}; }
		event.target = this;
		event.type = "error";
		this.onError && this.onError(event);
		this.dispatchEvent(event);
	};

	/**
	 * ロードがキャンセルされたかどうかを判定します。
	 * キューがクリーンアップされた後にメソッド呼び出しあるいは非同期イベントが問題を引き起こさないことを保証します。
	 * @method _isCanceled
	 * @return {Boolean} ローダーがキャンセルされたか否かです。
	 * @protected
	 */
	p._isCanceled = function() {
		if (window.createjs == null || this.canceled) {
			return true;
		}
		return false;
	};

	/**
	 * 正規表現パターン<code>AbstractLoader.FILE_PATTERN</code>を用いてファイルURIをパースします。
	 * @method _parseURI
	 * @param {String} path パースするファイルパスです。
	 * @return {Array} マッチしたファイルパスの各文字列です。詳しくは<code>AbstractLoader.FILE_PATTERN</code>プロパティを参照してください。
	 * マッチしなかった場合はnullを返します。
	 * @protected
	 */
	p._parseURI = function(path) {
		if (!path) { return null; }
		return path.match(s.FILE_PATTERN);
	};

	/**
	 * オブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} オブジェクトの文字列表現です。
	 **/
	p.toString = function() {
		return "[PreloadJS AbstractLoader]";
	};

	createjs.AbstractLoader = AbstractLoader;

}());
/*
* TagLoader for PreloadJS
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

// namespace:
this.createjs = this.createjs||{};

(function() {

	/**
	 * タグベースのアプローチによりアイテムをロードするプリローダーです。
	 * HTML audioと画像は、このローダーを使うことでセキュリティエラーを起こさずコンテンツをロードすることができます。
	 * XHRを使用したロードではクロスドメインリクエストの潜在的問題があります。
	 *
	 * audioタグでは、TagLoaderは<code>canPlayThrough</code>イベントを使用します。
	 * <code>canPlayThrough</code>イベントは、現在のダウンロードスピードで途切れることなく最後まで再生できる程度のバッファが蓄積されたときに発火されます。
	 * これにより、ほとんどの効果音は完全にプリロードできますが、バックグラウンドオーディオのような長いトラックではイベントが発火される前には一部しかロードできません。
	 * ほとんどのブラウザ（Chromeを除く全て）は発火されてもプリロードを継続しますので、大部分のケースでは問題ないと考えられます。
	 * @class TagLoader
	 * @constructor
	 * @extends AbstractLoader
	 * @param {Object} item ロードするアイテムです。ロードアイテムについての情報は{{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}を参照してください。
	 */
	var TagLoader = function (item) {
		this.init(item);
	};

	var p = TagLoader.prototype = new createjs.AbstractLoader();

// Protected
	/**
	 * 一定の時間後に何もロードされなかった場合に発火されるタイムアウトです。
	 * タイムアウトの時間については<code>LoadQueue.LOAD_TIMEOUT</code>を参照してください。
	 * @property _loadTimeout
	 * @type {Number}
	 * @private
	 */
	p._loadTimeout = null;

	/**
	 * イベントリスナー関数への参照です。
	 * ロードが完了した時にイベントハンドラを適切に削除するために必要となります。
	 * @property _tagCompleteProxy
	 * @type {Function}
	 * @private
	 */
	p._tagCompleteProxy = null;

	/**
	 * ロードアイテムがaudioタグか否かを判定します。
	 * 適切にaudioをロードするためにいくつか特別な処理を行うために使用されます。
	 * @property _isAudio
	 * @type {Boolean}
	 * @default false
	 */
	p._isAudio = false;

	/**
	 * このローダーがコンテンツをプリロードするために用いるHTMLタグあるいはJavaScriptオブジェクトです。
	 * HTMLタグのAPI（loadメソッド、onloadコールバック）に対応したカスタムオブジェクトのこともあります。
	 * 例えば、SoundJSでflashオーディオをロードするときは、Flash audioとWebAudioのプリロード処理をするためのカスタムオブジェクトが格納されます。
	 * @property _tag
	 * @type {HTMLAudioElement | Object}
	 * @private
	 */
	p._tag = null;

	// Overrides abstract method in AbstractLoader
	p.init = function (item) {
		this._item = item;
		this._tag = item.tag;
		this._isAudio = (window.HTMLAudioElement && item.tag instanceof HTMLAudioElement);
		this._tagCompleteProxy = createjs.proxy(this._handleLoad, this);
	};

	/**
	 * ロードされたコンテンツを取得します。
	 * 通常、完全にロードされたHTMLタグあるいは他のタグのスタイルオブジェクトです。
	 * ローダーが完了してない場合、nullが返ります。
	 * @method getResult
	 * @return {HTMLImageElement | HTMLAudioElement} ロードされパースされたコンテンツです。
	 */
	p.getResult = function() {
		return this._tag;
	};

	// Overrides abstract method in AbstractLoader
	p.cancel = function() {
		this.canceled = true;
		this._clean();
		var item = this.getItem();
	};

	// Overrides abstract method in AbstractLoader
	p.load = function() {
		var item = this._item;
		var tag = this._tag;

		// In case we don't get any events.
		clearTimeout(this._loadTimeout); // Clear out any existing timeout
		this._loadTimeout = setTimeout(createjs.proxy(this._handleTimeout, this), createjs.LoadQueue.LOAD_TIMEOUT);

		if (this._isAudio) {
			tag.src = null; // Unset the source so we can set the preload type to "auto" without kicking off a load. This is only necessary for audio tags passed in by the developer.
			tag.preload = "auto";
		}

		// Handlers for all tags
		tag.onerror = createjs.proxy(this._handleError,  this);
		// Note: We only get progress events in Chrome, but do not fully load tags in Chrome due to its behaviour, so we ignore progress.

		if (this._isAudio) {
			tag.onstalled = createjs.proxy(this._handleStalled,  this);
			// This will tell us when audio is buffered enough to play through, but not when its loaded.
			// The tag doesn't keep loading in Chrome once enough has buffered, and we have decided that behaviour is sufficient.
			tag.addEventListener("canplaythrough", this._tagCompleteProxy, false); // canplaythrough callback doesn't work in Chrome, so we use an event.
		} else {
			tag.onload = createjs.proxy(this._handleLoad,  this);
			tag.onreadystatechange = createjs.proxy(this._handleReadyStateChange,  this);
		}

		// Set the src after the events are all added.
		switch(item.type) {
			case createjs.LoadQueue.CSS:
				tag.href = item.src;
				break;
			case createjs.LoadQueue.SVG:
				tag.data = item.src;
				break;
			default:
				tag.src = item.src;
		}

		// If its SVG, it needs to be on the DOM to load (we remove it before sending complete).
		// It is important that this happens AFTER setting the src/data.
		if (item.type == createjs.LoadQueue.SVG || item.type == createjs.LoadQueue.JAVASCRIPT || item.type == createjs.LoadQueue.CSS) {
			(document.body || document.getElementsByTagName("body")[0]).appendChild(tag);
			//TODO: Move SVG off-screen.  // OJR perhaps just make invisible until load completes  tag.style.display = "none"; did not work
			// OJR tag.style.visibility = "hidden"; worked, but didn't appear necessary  remember to add "visible" to _handleLoad
		}

		// Note: Previous versions didn't seem to work when we called load() for OGG tags in Firefox. Seems fixed in 15.0.1
		if (tag.load != null) {
			tag.load();
		}
	};

	/**
	 * audioのタイムアウトのコールバックです。
	 * タイムアウト処理のために、新しいブラウザはタグのコールバックを用いますが、古いブラウザはsetTimeoutを必要とすることがあります。
	 * setTimeoutはブラウザによってレスポンスが処理されない限り実行されます。
	 * @method _handleTimeout
	 * @private
	 */
	p._handleTimeout = function() {
		this._clean();
		this._sendError({reason:"PRELOAD_TIMEOUT"}); //TODO: Evaluate a reason prop
	};

	/**
	 * audioのstalledイベントのイベントハンドラです。
	 * 主に、ChromeのHTMLAudioでロード途中で再生しようとしたときに受け取るイベントと思われます。
	 * @method _handleStalled
	 * @private
	 */
	p._handleStalled = function() {
		//Ignore, let the timeout take care of it. Sometimes its not really stopped.
	};

	/**
	 * タグによって生成されたエラーイベントのイベントハンドラです。
	 * @method _handleError
	 * @private
	 */
	p._handleError = function() {
		this._clean();
		this._sendError(); //TODO: Reason or error?
	};

	/**
	 * タグからのreadyStateChangeイベントのイベントハンドラです。
	 * onloadイベント（主にSCRIPTタグとLINKタグ）の代わりとして必要になることがありますが、他に必要なケースもあるかもしれません。
	 * @method _handleReadyStateChange
	 * @private
	 */
	p._handleReadyStateChange = function() {
		clearTimeout(this._loadTimeout);
		// This is strictly for tags in browsers that do not support onload.
		var tag = this.getItem().tag;
		if (tag.readyState == "loaded") {
			this._handleLoad();
		}
	};

	/**
	 * load（complete）イベントのイベントハンドラです。
	 * タグのコールバックによって呼ばれますが、readyStateChangeとcanPlayThroughイベントからも呼ばれます。
	 * 一旦ロードされたら、アイテムは{{#crossLink "LoadQueue"}}{{/crossLink}}に送られます。
	 * @method _handleLoad
	 * @param {Object} [event] タグからのloadイベントです。loadイベントが発生していなくても、他のイベントハンドラから呼ばれることがあります。
	 * @private
	 */
	p._handleLoad = function(event) {
		if (this._isCanceled()) { return; }

		var item = this.getItem();
		var tag = item.tag;

		if (this.loaded || this.isAudio && tag.readyState !== 4) { return; } //LM: Not sure if we still need the audio check.
		this.loaded = true;

		// Remove from the DOM
		if (item.type == createjs.LoadQueue.SVG) { // item.type == createjs.LoadQueue.CSS) {
			//LM: We may need to remove CSS tags loaded using a LINK
			(document.body || document.getElementsByTagName("body")[0]).removeChild(tag);
		}

		this._clean();
		this._sendComplete();
	};

	/**
	 * ローダーを清掃します。
	 * すべてのタイマーを止め、予想外のコールバック呼び出しを避けるために参照を削除し、メモリを解放します。
	 * @method _clean
	 * @private
	 */
	p._clean = function() {
		clearTimeout(this._loadTimeout);

		// Delete handlers.
		var tag = this.getItem().tag;
		tag.onload = null;
		tag.removeEventListener && tag.removeEventListener("canplaythrough", this._tagCompleteProxy, false);
		tag.onstalled = null;
		tag.onprogress = null;
		tag.onerror = null;

		//TODO: Test this
		if (tag.parentNode) {
			tag.parentNode.removeChild(tag);
		}
	};

	p.toString = function() {
		return "[PreloadJS TagLoader]";
	}

	createjs.TagLoader = TagLoader;

}());
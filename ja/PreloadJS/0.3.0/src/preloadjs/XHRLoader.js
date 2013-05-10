/*
 * XHRLoader for PreloadJS
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
this.createjs = this.createjs || {};

(function () {

	/**
	 * XHRリクエストを使用してアイテムをロードするプリローダーです。
	 * 通常はXMLHTTPRequestを使用しますが、適用可能であればクロスドメインリクエストにXDomainRequestsが使用されることがありますし、
	 * IEの古いバージョンでは必要であればActiveXオブジェクトを使用します。
	 * XHRリクエストはコンテンツをテキストあるいはバイナリデータとしてロードし、進捗と完了のイベントを提供し、ロード中にキャンセルすることができます。
	 * XHRはIEの6以前のバージョンではサポートされていません。
	 * また、クロスドメインローディングには推奨できません。
	 * @class XHRLoader
	 * @constructor
	 * @param {Object} file ロードするファイルを定義するオブジェクトです。
	 * サポートしているファイルプロパティの概要は{{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}を参照してください。
	 * @extends AbstractLoader
	 */
	var XHRLoader = function (file) {
		this.init(file);
	};

	var p = XHRLoader.prototype = new createjs.AbstractLoader();

	//Protected
	/**
	 * コンテンツのロードに使用されているXHRリクエストへの参照です。
	 * @property _request
	 * @type {XMLHttpRequest | XDomainRequest | ActiveX.XMLHTTP}
	 * @private
	 */
	p._request = null;

	/**
	 * XHRのonTimeoutイベントをサポートしていないブラウザ（XHRレベル1、典型的なのはIE9）で使用するお手製のロードタイムアウトです。
	 * @property _loadTimeout
	 * @type {Number}
	 * @private
	 */
	p._loadTimeout = null;

	/**
	 * ブラウザのXHR(XMLHTTPRequest)バージョンです。
	 * サポートされているバージョンは1と2です。
	 * バージョンを検出する公式な方法はありませんので、できる限りベストな推測をします。
	 * @property _xhrLevel
	 * @type {Number}
	 * @default 1
	 * @private
	 */
	p._xhrLevel = 1;

	/**
	 * ロードしたファイルのレスポンスです。
	 * 頻繁にレスポンスを検索すると処理が重いためキャッシュ目的で設定されます。
	 * ファイルがロードされるまではこのプロパティはnullです。
	 * @property _response
	 * @type {mixed}
	 * @private
	 */
	p._response = null;

	/**
	 * ロードしたファイルの手を加えられる前のレスポンス結果です。
	 * ほとんどのケースでは、コンテンツは生のテキストからHTMLタグあるいはフォーマットされたオブジェクトに変換され、<code>result</code>
	 * プロパティに設定されますが、このプロパティを通してロードされたままの生のコンテンツにアクセスすることができます。
	 * @property _rawResponse
	 * @type {String|Object}
	 * @private
	 */
	p._rawResponse = null;

	// Overrides abstract method in AbstractLoader
	p.init = function (item) {
		this._item = item;
		if (!this._createXHR(item)) {
			//TODO: Throw error?
		}
	};

	/**
	 * ロードされた結果を検索します。
	 * @method getResult
	 * @param {Boolean} [rawResult=false] フォーマットされた結果の代わりに生の結果を返すようにします。
	 * スクリプト、XML、CSS、それに画像のような、XHRを使ってロードされたコンテンツに適用されます。
	 * 生の結果がない場合、代わりにフォーマットされた結果が返されます。
	 * @return {Object} 以下の様なロードされたコンテンツを含む結果オブジェクトです。
     * <ul>
	 *      <li>画像はimageタグ(&lt;image /&gt;)</li>
	 *      <li>オーディオはaudioタグ(&lt;audio &gt;)</li>
	 *      <li>JavaScriptiはscriptタグ(&lt;script /&gt;)。タグによってロードされたスクリプトはHTML headに追加されることがあります。</li>
	 *      <li>CSSはstyleタグ(&lt;style /&gt;)</li>
	 *      <li>TEXTは生のテキスト</li>
	 *      <li>JSONによって定義されたフォーマットされたJavaScriptオブジェクト</li>
	 *      <li>XMLドキュメント</li>
	 *      <li>XHRによってロードされたバイナリarraybuffer</li>
	 * </ul>
	 * 生の結果を求めてそれがなかった場合はフォーマットされた結果が返されます。
	 */
	p.getResult = function (rawResult) {
		if (rawResult && this._rawResponse) {
			return this._rawResponse;
		}
		return this._response;
	};

	// AbstractLoaderの抽象メソッドをオーバーライドします。
	p.cancel = function () {
		this.canceled = true;
		this._clean();
		this._request.abort();
	};

	// AbstractLoaderの抽象メソッドをオーバーライドします。
	p.load = function () {
		if (this._request == null) {
			this._handleError();
			return;
		}

		//Events
		this._request.onloadstart = createjs.proxy(this._handleLoadStart, this);
		this._request.onprogress = createjs.proxy(this._handleProgress, this);
		this._request.onabort = createjs.proxy(this._handleAbort, this);
		this._request.onerror = createjs.proxy(this._handleError, this);
		this._request.ontimeout = createjs.proxy(this._handleTimeout, this);
		// Set up a timeout if we don't have XHR2
		if (this._xhrLevel == 1) {
			this._loadTimeout = setTimeout(createjs.proxy(this._handleTimeout, this), createjs.LoadQueue.LOAD_TIMEOUT);
		}

		// Note: We don't get onload in all browsers (earlier FF and IE). onReadyStateChange handles these.
		this._request.onload = createjs.proxy(this._handleLoad, this);
		if (this._request.onreadystatechange) {
			this._request.onreadystatechange = this._handleReadyStateChange(this);
		}

		// Sometimes we get back 404s immediately, particularly when there is a cross origin request.  // note this does not catch in Chrome
		try {
			this._request.send();
		} catch (error) {
			this._sendError({source:error});
		}
	};

	/**
	 * XHRリクエストが進捗を報告して来ました。
	 * @method _handleProgress
	 * @param {Object} event XHRのprogressイベントです。
	 * @private
	 */
	p._handleProgress = function (event) {
		if (event.loaded > 0 && event.total == 0) {
			return; // Sometimes we get no "total", so just ignore the progress event.
		}
		this._sendProgress({loaded:event.loaded, total:event.total});
	};

	/**
	 * XHRリクエストがロード開始を報告して来ました。
	 * @method _handleLoadStart
	 * @param {Object} event XHRのloadStartイベントです。
	 * @private
	 */
	p._handleLoadStart = function (event) {
		clearTimeout(this._loadTimeout);
		this._sendLoadStart();
	};

	/**
	 * XHRリクエストがつ中断イベントを報告して来ました。
	 * @method handleAbort
	 * @param {Object} event XHRのabortイベントです。
	 * @private
	 */
	p._handleAbort = function (event) {
		this._clean();
		this._sendError();
	};

	/**
	 * XHRリクエストがつエラーイベントを報告して来ました。
	 * @method _handleError
	 * @param {Object} event XHRのerrorイベントです。
	 * @private
	 */
	p._handleError = function (event) {
		this._clean();
		this._sendError();
	};

	/**
	 * XHRリクエストがつreadyStateChangeイベントを報告して来ました。
	 * 古いブラウザ（IE7と8）はonloadイベントを提供しないため、ファイルがロードしたか判定するためにはreadyStateChangeを監視する必要があります。
	 * @method _handleReadyStateChange
	 * @param {Object} event XHRのreadyStateChangeイベントです。
	 * @private
	 */
	p._handleReadyStateChange = function (event) {
		if (this._request.readyState == 4) {
			this._handleLoad();
		}
	};

	/**
	 * XHRリクエストが完了しました。
	 * このメソッドはXHRリクエストから直接呼ばれるか、<code>request.readyState == 4</code>のreadyStateChangeによて呼ばれます。
	 * 最初の一回の呼び出しだけ処理が走ります。
	 * @method _handleLoad
	 * @param {Object} event XHRのloadイベントです。
	 * @private
	 */
	p._handleLoad = function (event) {
		if (this.loaded) {
			return;
		}
		this.loaded = true;

		if (!this._checkError()) {
			this._handleError();
			return;
		}

		this._response = this._getResponse();
		this._clean();
		var isComplete = this._generateTag();
		if (isComplete) {
			this._sendComplete();
		}
	};

	/**
	 * XHRリクエストがタイムアウトしました。
	 * このメソッドはXHRリクエストから直接呼ばれるか、<code>setTimeout</code>のコールバックとして呼ばれます。
	 * @method _handleTimeout
	 * @param {Object} [event] XHRのtimeoutイベントです。お手製タイムアウトイベントのsetTimeoutから呼ばれた場合nullになることがあります。
	 * @private
	 */
	p._handleTimeout = function (event) {
		this._clean();
		this._sendError({reason:"PRELOAD_TIMEOUT"});
	};


// Protected
	/**
	 * 現在のロードがエラーか否かを判定します。
	 * リクエストのステータスコードをチェックして判定し、実際のレスポンスはチェックしません。
	 * 現在、404と0のエラーコードだけを判定しています。
	 * @method _checkError
	 * @return {Boolean} リクエストステータスがエラーコードを返しているか否かです。
	 * @private
	 */
	p._checkError = function () {
		//LM: Probably need additional handlers here, maybe 501
		var status = parseInt(this._request.status);

		switch (status) {
			case 404:   // Not Found
			case 0:     // Not Loaded
				return false;
		}
		return true;
	};

	/**
	 * レスポンスを検証します。
	 * ブラウザによって異なるアプローチをしており、そのいくつかは、他のブラウザでアクセスされたときはエラーを投げます。
	 * レスポンスがない場合、<code>_response</code>プロパティはnullのままです。
	 * @method _getResponse
	 * @private
	 */
	p._getResponse = function () {
		if (this._response != null) {
			return this._response;
		}

		if (this._request.response != null) {
			return this._request.response;
		}

		// Android 2.2 uses .responseText
		try {
			if (this._request.responseText != null) {
				return this._request.responseText;
			}
		} catch (e) {
		}

		// When loading XML, IE9 does not return .response, instead it returns responseXML.xml
		//TODO: TEST
		try {
			if (this._request.responseXML != null) {
				return this._request.responseXML;
			}
		} catch (e) {
		}
		return null;
	};

	/**
	 * XHRリクエストを生成します。
	 * 多くの因子が関連して異なる結果が返ります。
	 * <ol><li>いくつかのブラウザではクロスドメインローディングを行うときに<code>XDomainRequest</code>が返ります。</li>
	 *      <li>使用可能であればXMLHttpRequestが生成されます。</li>
	 *      <li>古いIEブラウザではActiveX.XMLHTTPオブジェクトが使われます。</li>
	 *      <li>可能であればテキストのリクエストではmimeタイプをオーバーライドします。</li>
	 *      <li>いくつかのブラウザではクロスドメインリクエストにOriginヘッダが送られます。</li>
	 *      <li>バイナリのロードではレスポンスのタイプが"arraybuffer"に設定されます。</li></ol>
	 * @method _createXHR
	 * @param {Object} item ロードされているリクエストされたアイテムです。
	 * @return {Boolean} XHRリクエスト、あるいはそれと同等なオブジェクトが生成成功したか否かです。
	 * @private
	 */
	p._createXHR = function (item) {
		// Check for cross-domain loads. We can't fully support them, but we can try.
		var target = document.createElement("a");
		target.href = item.src;
		var host = document.createElement("a");
		host.href = location.href;
		var crossdomain = (target.hostname != "") && (target.port != host.port || target.protocol != host.protocol || target.hostname != host.hostname);

		// Create the request. Fall back to whatever support we have.
		var req = null;
		if (crossdomain && window.XDomainRequest) {
			req = new XDomainRequest(); // Note: IE9 will fail if this is not actually cross-domain.
		} else if (window.XMLHttpRequest) { // Old IE versions use a different approach
			req = new XMLHttpRequest();
		} else {
			try {
				req = new ActiveXObject("Msxml2.XMLHTTP.6.0");
			} catch (e) {
				try {
					req = new ActiveXObject("Msxml2.XMLHTTP.3.0");
				} catch (e) {
					try {
						req = new ActiveXObject("Msxml2.XMLHTTP");
					} catch (e) {
						return false;
					}
				}
			}
		}

		// IE9 doesn't support overrideMimeType(), so we need to check for it.
		if (item.type == createjs.LoadQueue.TEXT && req.overrideMimeType) {
			req.overrideMimeType("text/plain; charset=x-user-defined");
		}

		// Determine the XHR level
		this._xhrLevel = (typeof req.responseType === "string") ? 2 : 1;

		// Open the request.  Set cross-domain flags if it is supported (XHR level 1 only)
		req.open("GET", item.src, true);
		if (crossdomain && req instanceof XMLHttpRequest && this._xhrLevel == 1) {
			req.setRequestHeader("Origin", location.origin);
		}

		// Binary files are loaded differently.
		if (createjs.LoadQueue.isBinary(item.type)) {
			req.responseType = "arraybuffer";
		}

		this._request = req;
		return true;
	};

	/**
	 * リクエストが完了し（あるいは失敗、あるいはキャンセルされ）ました。処分する必要があります。
	 * @method _clean
	 * @private
	 */
	p._clean = function () {
		clearTimeout(this._loadTimeout);

		var req = this._request;
		req.onloadstart = null;
		req.onprogress = null;
		req.onabort = null;
		req.onerror = null;
		req.onload = null;
		req.ontimeout = null;
		req.onloadend = null;
		req.onreadystatechange = null;
	};

	/**
	 * タグとして設定されたアイテムのタグを生成します。
	 * 例えば、IMAGE、SCRIPT、LINKです。
	 * XMLとSVGオブジェクトも対象となります。
	 * @method _generateTag
	 * @return {Boolean} タグが生成されインスタンス化の準備が整ったか否かです。まだ処理が必要な場合、このメソッドはfalseを返します。
	 * method returns false.
	 * @private
	 */
	p._generateTag = function () {
		var type = this._item.type;
		var tag = this._item.tag;

		switch (type) {
			// Note: Images need to wait for onload, but do use the cache.
			case createjs.LoadQueue.IMAGE:
				tag.onload = createjs.proxy(this._handleTagReady, this);
				tag.src = this._item.src;

				this._rawResponse = this._response;
				this._response = tag;
				return false; // Images need to get an onload event first

			case createjs.LoadQueue.JAVASCRIPT:
				tag = document.createElement("script");
				tag.text = this._response;

				this._rawResponse = this._response;
				this._response = tag;
				return true;

			case createjs.LoadQueue.CSS:
				// Maybe do this conditionally?
				var head = document.getElementsByTagName("head")[0]; //Note: This is unavoidable in IE678
				head.appendChild(tag);

				if (tag.styleSheet) { // IE
					tag.styleSheet.cssText = this._response;
				} else {
					var textNode = document.createTextNode(this._response);
					tag.appendChild(textNode);
				}

				this._rawResponse = this._response;
				this._response = tag;
				return true;

			case createjs.LoadQueue.XML:
				var xml = this._parseXML(this._response, "text/xml");
				this._response = xml;
				return true;

			case createjs.LoadQueue.SVG:
				var xml = this._parseXML(this._response, "image/svg+xml");
				this._rawResponse = this._response;
				tag.appendChild(xml.documentElement);
				this._response = tag;
				return true;

			case createjs.LoadQueue.JSON:
				var json = {};
				try {
					json = JSON.parse(this._response);
				} catch (error) {
					// Log error?
					json = null;
				}

				this._rawResponse = this._response;
				this._response = json;
				return true;

		}
		return true;
	};

	/**
	 * DOMを使ってXMLをパースします。XMLあるいはSVGのプリロードで必要です。
	 * @method _parseXML
	 * @param {String} text XHRによってロードされた生のテキストあるいはXMLです。
	 * @param {String} type XMLのmimeタイプです。
	 * @return {XML} XMLドキュメントです。
	 * @private
	 */
	p._parseXML = function (text, type) {
		var xml = null;
		if (window.DOMParser) {
			var parser = new DOMParser();
			xml = parser.parseFromString(text, type);  // OJR Opera throws DOMException: NOT_SUPPORTED_ERR  // potential solution https://gist.github.com/1129031
		} else { // IE
			xml = new ActiveXObject("Microsoft.XMLDOM");
			xml.async = false;
			xml.loadXML(text);
		}
		return xml;
	};

	/**
	 * 生成したタグが使用出来る状態になりました。
	 * @method _handleTagReady
	 * @private
	 */
	p._handleTagReady = function () {
		this._sendComplete();
	}

	p.toString = function () {
		return "[PreloadJS XHRLoader]";
	}

	createjs.XHRLoader = XHRLoader;

}());

/**
 * 正確にJSONをパースするため、json2をインクルードします。
 * ネイティブのJSONオブジェクトを持たないブラウザで使用されます。
 *
 */
/*
 json2.js
 2012-10-08

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/js.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
	JSON = {};
}

(function () {
	'use strict';

	function f(n) {
		// Format integers to have at least two digits.
		return n < 10 ? '0' + n : n;
	}

	if (typeof Date.prototype.toJSON !== 'function') {

		Date.prototype.toJSON = function (key) {

			return isFinite(this.valueOf())
					? this.getUTCFullYear() + '-' +
					f(this.getUTCMonth() + 1) + '-' +
					f(this.getUTCDate()) + 'T' +
					f(this.getUTCHours()) + ':' +
					f(this.getUTCMinutes()) + ':' +
					f(this.getUTCSeconds()) + 'Z'
					: null;
		};

		String.prototype.toJSON =
				Number.prototype.toJSON =
						Boolean.prototype.toJSON = function (key) {
							return this.valueOf();
						};
	}

	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			gap,
			indent,
			meta = {    // table of character substitutions
				'\b':'\\b',
				'\t':'\\t',
				'\n':'\\n',
				'\f':'\\f',
				'\r':'\\r',
				'"':'\\"',
				'\\':'\\\\'
			},
			rep;


	function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

		escapable.lastIndex = 0;
		return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
			var c = meta[a];
			return typeof c === 'string'
					? c
					: '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + '"' : '"' + string + '"';
	}


	function str(key, holder) {

// Produce a string from holder[key].

		var i, // The loop counter.
				k, // The member key.
				v, // The member value.
				length,
				mind = gap,
				partial,
				value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

		if (value && typeof value === 'object' &&
				typeof value.toJSON === 'function') {
			value = value.toJSON(key);
		}

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

		if (typeof rep === 'function') {
			value = rep.call(holder, key, value);
		}

// What happens next depends on the value's type.

		switch (typeof value) {
			case 'string':
				return quote(value);

			case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

				return isFinite(value) ? String(value) : 'null';

			case 'boolean':
			case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

				return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

			case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

				if (!value) {
					return 'null';
				}

// Make an array to hold the partial results of stringifying this object value.

				gap += indent;
				partial = [];

// Is the value an array?

				if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

					length = value.length;
					for (i = 0; i < length; i += 1) {
						partial[i] = str(i, value) || 'null';
					}

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

					v = partial.length === 0
							? '[]'
							: gap
							? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
							: '[' + partial.join(',') + ']';
					gap = mind;
					return v;
				}

// If the replacer is an array, use it to select the members to be stringified.

				if (rep && typeof rep === 'object') {
					length = rep.length;
					for (i = 0; i < length; i += 1) {
						if (typeof rep[i] === 'string') {
							k = rep[i];
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				} else {

// Otherwise, iterate through all of the keys in the object.

					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				}

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

				v = partial.length === 0
						? '{}'
						: gap
						? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
						: '{' + partial.join(',') + '}';
				gap = mind;
				return v;
		}
	}

// If the JSON object does not yet have a stringify method, give it one.

	if (typeof JSON.stringify !== 'function') {
		JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

			var i;
			gap = '';
			indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

			if (typeof space === 'number') {
				for (i = 0; i < space; i += 1) {
					indent += ' ';
				}

// If the space parameter is a string, it will be used as the indent string.

			} else if (typeof space === 'string') {
				indent = space;
			}

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

			rep = replacer;
			if (replacer && typeof replacer !== 'function' &&
					(typeof replacer !== 'object' ||
							typeof replacer.length !== 'number')) {
				throw new Error('JSON.stringify');
			}

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

			return str('', {'':value});
		};
	}


// If the JSON object does not yet have a parse method, give it one.

	if (typeof JSON.parse !== 'function') {
		JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

			var j;

			function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

				var k, v, value = holder[key];
				if (value && typeof value === 'object') {
					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

			text = String(text);
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx, function (a) {
					return '\\u' +
							('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				});
			}

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

			if (/^[\],:{}\s]*$/
					.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
								  .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
								  .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

				j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

				return typeof reviver === 'function'
						? walk({'':j}, '')
						: j;
			}

// If the text is not JSON parseable, then a SyntaxError is thrown.

			throw new SyntaxError('JSON.parse');
		};
	}
}());
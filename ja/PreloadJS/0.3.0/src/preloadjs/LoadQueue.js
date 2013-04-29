/*
* PreloadJS
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
 * PreloadJSはHTMLアプリケーション用にコンテンツをプリロードする一貫した方法を提供します。
 * プリローディングはXHRだけでなくHTMLタグを使用して行うことも可能です。
 *
 * XHRは進捗と完了のイベントのサポートが比較的よいため、PreloadJSはデフォルトの動作としてXHRを使用してコンテンツのロードを試みます。
 * <b>しかし、クロスドメイン問題のため、依然としてタグベースのローディングの方が望ましいケースもあります。</b>
 * いくつかのコンテンツ（プレーンテキスト、web audio）はXHRを必要とし、他のいくつか（HTML audio）はタグを必要とします。
 * 可能な限り自動的にどちらを使用するか判定されます。
 *
 * PreloadJSは現在すべてのモダンブラウザをサポートしており、最も古いブラウザもサポートできるよう我々はベストを尽くして来ました。
 * 特定のOS/ブラウザの組み合わせで問題を発見したら、是非http://community.createjs.com/を訪れ報告してください。
 *
 * <h4>はじめに</h4>
 * はじめに、{{#crossLink "LoadQueue"}}{{/crossLink}}を確認してください。
 * ファイルロードと結果処理の方法について簡単な概要説明があります。
 *
 * <h4>例</h4>
 *      var queue = new createjs.LoadQueue();
 *      queue.installPlugin(createjs.Sound);
 *      queue.addEventListener("complete", handleComplete);
 *      queue.loadFile({id:"sound", src:"http://path/to/sound.mp3"});
 *      queue.loadManifest([
 *          {id: "myImage", src:"path/to/myImage.jpg"}
 *      ]);
 *      function handleComplete() {
 *          createjs.Sound.play("sound");
 *          var image = queue.getResult("myImage");
 *          document.body.appendChild(image);
 *      }
 *
 * <b>プラグインに関する重要な注意:</b>
 * プラグインはアイテムがキューに追加される<i>前</i>にインストールする必要があります。
 * そうしなければ、ロードが始まってなかったとしても実行されません。
 * プラグインの機能はアイテムがLoadQueに追加されたときに実行されます。
 *
 * @module PreloadJS
 * @main PreloadJS
 */

// 名前空間:
this.createjs = this.createjs||{};

//TODO: JSONP support?
//TODO: addHeadTags support

/*
TODO: WINDOWS ISSUES
	* No error for HTML audio in IE 678
	* SVG no failure error in IE 67 (maybe 8) TAGS AND XHR
	* No script complete handler in IE 67 TAGS (XHR is fine)
	* No XML/JSON in IE6 TAGS
	* Need to hide loading SVG in Opera TAGS
	* No CSS onload/readystatechange in Safari or Android TAGS (requires rule checking)
	* SVG no load or failure in Opera XHR
	*
 */

(function() {

	/**
	 * LoadQueueクラスはコンテンツをプリロードするメインAPIです。
	 * LoadQueueはロードマネージャであり、単一のファイルあるいはファイルのキューを管理します。
	 *
	 * <b>キューの生成</b><br />
	 * LoadQueueを使用するためにLoadQueueインスタンスを生成します。
	 * 可能であればタグローディングを強制したい場合は、useXHR引数をfalseに設定します。
	 *
	 *      var queue = new createjs.LoadQueue(true);
	 *
	 * <b>イベントのリスニング</b><br />
	 * 設定したいリスナーをキューに設定します。
	 * PreloadJS 0.3.0以降、{{#crossLink "EventDispatcher"}}{{/crossLink}}はイベントに好きなだけリスナーを設定できるようになりました。
	 * complete、error、fileload、progress、fileprogressイベントを設定することができます。
	 *
	 *      queue.addEventListener("fileload", handleFileLoad);
	 *      queue.addEventListener("complete", handleComplete);
	 *
	 * <b>ファイルの追加とマニフェスト</b><br />
	 * ロードしたいファイルを{{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}を使用して追加します。
	 * {{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}を使用すると複数ファイルを一度に追加できます。
	 * ファイルはキューに追加されます。
	 * よって、これらのメソッドは好きなときに好きなだけ使うことができます。
	 *
	 *      queue.loadFile("filePath/file.jpg");
	 *      queue.loadFile({id:"image", src:"filePath/file.jpg"});
	 *      queue.loadManifest(["filePath/file.jpg", {id:"image", src:"filePath/file.jpg"}];
	 *
	 * 第2引数にfalseを渡した場合、キューはすぐにはロード開始しません（すでにロード開始してない限り）。
	 * 一時停止しているキューを開始するには{{#crossLink "AbstractLoader/load"}}{{/crossLink}}メソッドを呼んでください。
	 * 一時停止しているキューは新しいファイルが追加されると自動的に再開します。
	 *
	 *      queue.load();
	 *
	 * <b>結果の処理</b><br />
	 * ファイルがダウンロード終了した時、"fileload"イベントが発行されます。
	 * 上記の例の中にfileloadへのイベントリスナーのスニペットがあります。
	 * ロードされたファイルはすぐに使用できるオブジェクトとなっており以下を含みます:
	 * <ul>
	  *     <li>Image: &lt;img /&gt; タグ</li>
	  *     <li>Audio: &lt;audio /&gt; タグ</a>
	  *     <li>JavaScript: &lt;script /&gt; タグ</li>
	  *     <li>CSS: &lt;link /&gt; タグ</li>
	  *     <li>XML: XML DOM ノード</li>
	  *     <li>SVG: &lt;object /&gt; タグ</li>
	  *     <li>JSON: フォーマットされたJavaScriptオブジェクト</li>
	  *     <li>Text: 生のテキスト</li>
	  *     <li>Binary: バイナリのロード結果</li>
	  * </ul>
	 *
	 *      function handleFileLoad(event) {
	 *          var item = event.item; // 渡されたアイテムへの参照
	 *          var type = item.type;
	 *
	 *          // ページのbodyに任意の画像を追加する
	 *          if (type == createjs.LoadQueue.IMAGE) {
	 *              document.body.appendChild(event.result);
	 *          }
	 *      }
	 *
	 * ファイルがロード完了した後（通常はキューが完了した後）であれば、結果は{{#crossLink "LoadQueue/getResult"}}{{/crossLink}}
	 * を使用してidにより検索することができます。
	 * idを付与していなければ、"src"あるいはファイルパスを代わりに用いることができます。
	 * 常にidを渡すことを推奨します。
	 *
	 *      var image = queue.getResult("image");
	 *      document.body.appendChild(image);
	 *
	 * 生のロードされたコンテンツは、<code>fileload</code>イベントの<code>rawResult</code>プロパティによってアクセス可能です。
	 * また{{#crossLink "LoadQueue/getResult"}}{{/crossLink}}の第二引数にtrueを渡すことで検索可能です。
	 * この方法はブラウザによってパースされるコンテンツにのみ適用可能です。具体的にあげると、JavaScript、CSS、XML、SVG、JSONオブジェクトです。
	 *
	 *      var image = queue.getResult("image", true);
	 *
	 * <b>プラグイン</b><br />
	 * LoadQueはコンテンツの処理とプリロードを補助するシンプルなプラグインアーキテクチャを備えています。
	 * 例えば、オーディオをプリロードするには<a href="http://soundjs.com">SoundJS</a>のSoundクラスを必ずインストールしてください。
	 * SoundクラスはHTML audio、Flash audio、WebAudioファイルのプリロードを補助します。
	 * オーディオファイルをロードする<b>前に</b>インストールする必要があります。
	 *
	 *      queue.installPlugin(createjs.Sound);
	 *
	 * <h4>既知のブラウザの問題</h4>
	 * <ul><li>audioをサポートしないブラウザはオーディオファイルをロードできません。</li>
	 *      <li>audioタグは<code>canPlayThrough</code>イベントが発火されるまでしかダウンロードを行いません。
	 *      Chrome以外のブラウザはバックグラウンドでダウンロードし続けます。
	 *      <li>スクリプトをタグを使ってロードした場合、自動的にdocumentに追加されます。</li>
	 *      <li>XHRを使ってロードしたスクリプトはブラウザのツールで正常に検査できないことがあります。</li>
	 *      <li>XML、Text、JSONのロードではXHRを必要とするため、IE6とIE7（それと他のいくつかのブラウザ）ではロードできないことがあります。
	 *      <li>タグを使ってロードしたコンテンツは進捗を取得出来ません。また、キャンセルしてもバックグランドでダウンロードし続けます。</li>
	 * </ul>
	 *
	 * @class LoadQueue
	 * @param {Boolean} [useXHR=true] プリロードインスタンスにXHR（XML HTTP Request）を使用するかHTMLタグを使用するかを指定します。
	 * <code>false</code>の場合、LoadQueは可能であればタグによるロードを行い、必要であればXHRに戻ります。
	 * @constructor
	 * @extends AbstractLoader
	 */
	var LoadQueue = function(useXHR) {
		this.init(useXHR);
	};

	var p = LoadQueue.prototype = new createjs.AbstractLoader();
	var s = LoadQueue;

	/**
	 * ロードが失敗したと判定するまでの時間（ミリセカンド）です。
	 * @property LOAD_TIMEOUT
	 * @type {Number}
	 * @default 8000
	 * @static
	 */
	s.LOAD_TIMEOUT = 8000;

// プリロードタイプ
	/**
	 * 一般的なバイナリのためのプリロードタイプです。画像と音声ファイルはバイナリとして扱われます。
	 * @property BINARY
	 * @type {String}
	 * @default binary
	 * @static
	 */
	s.BINARY = "binary";

	/**
	 * CSSファイルのためのプリロードタイプです。CSSファイルはLINKあるいはSTYLEタグ（どちらになるかはロードタイプ次第です）によってロードされます。
	 * @property CSS
	 * @type {String}
	 * @default css
	 * @static
	 */
	s.CSS = "css";

	/**
	 * 画像ファイル（通常はpng、gif、jpg/jpegのファイル）のためのプリロードタイプです。
	 * 画像はIMAGEタグによりロードされます。
	 * @property IMAGE
	 * @type {String}
	 * @default image
	 * @static
	 */
	s.IMAGE = "image";

	/**
	 * javascriptファイル（通常は拡張子jsのファイル）のためのプリロードタイプです。
	 * JavaScriptはSCRIPTタグによりロードされます。
	 * @property JAVASCRIPT
	 * @type {String}
	 * @default javascript
	 * @static
	 */
	s.JAVASCRIPT = "javascript";

	/**
	 * jsonファイル（通常は拡張子jsonのファイル）のためのプリロードタイプです。
	 * JSONデータはロードされJavaScriptオブジェクトにパースされます。
	 * @property JSON
	 * @type {String}
	 * @default json
	 * @static
	 */
	s.JSON = "json";

	/**
	 * 音声ファイル（通常はmp3、ogg、wavファイル）のためのプリロードタイプです。
	 * 音声はAUDIOタグによってロードされます。
	 * @property SOUND
	 * @type {String}
	 * @default sound
	 * @static
	 */
	s.SOUND = "sound";

	/**
	 * SVGファイルのためのプリロードタイプです。
	 * @property SVG
	 * @type {String}
	 * @default svg
	 * @static
	 */
	s.SVG = "svg";

	/**
	 * テキストファイルのためのプリロードタイプであり、タイプが決定できない時のデフォルトファイルタイプです。
	 * テキストは生のテキストとしてロードされます。
	 * @property TEXT
	 * @type {String}
	 * @default text
	 * @static
	 */
	s.TEXT = "text";

	/**
	 * xmlファイルのためのプリロードタイプです。
	 * XMLはXMLドキュメントとしてロードされます。
	 * @property XML
	 * @type {String}
	 * @default xml
	 * @static
	 */
	s.XML = "xml";


// プロトタイプ
	/**
	 * 可能であればXMLHttpRequest（XHR）を使います。
	 * LoadQueueはメディアタイプによってタグローディングかXHRローディングに決まります。
	 * 例えば、HTML audioタグはXHRではロードできませんし、WebAudioはタグではロードできません。
	 * そのため、ユーザが定義したタイプでなく、デフォルトのタイプを使用することになります。
	 *
	 * <b>注意: このプロパティは読み取り専用です。</b> 変更するには、{{#crossLink "LoadQueue/setUseXHR"}}{{/crossLink}}メソッドを使用してください。
	 * @property useXHR
	 * @type {Boolean}
	 * @readOnly
	 * @default true
	 */
	p.useXHR = true;

	/**
	 * エラーに遭遇した時に現在のキューを処理停止するか否かです。
	 * @property stopOnError
	 * @type {Boolean}
	 * @default false
	 */
	p.stopOnError = false;

	/**
	 * ロードしたスクリプトが指定した順に"complete"となることを保証します。
	 * タグを使用してロードされたスクリプトは一度に一個しかロードされず、ロード完了後はdocumentに追加されます。
	 * @property maintainScriptOrder
	 * @type {Boolean}
	 * @default true
	 */
	p.maintainScriptOrder = true;

	/*
	 * LM: 未実装です。
	 * ロード完了したときにdocumentのHEADに自動的にタグを追加します。
	 * ちなみに、JavaScriptをタグベースの方法（<code>useXHR=false</code>）でロードした時、ロードするためにHEADに自動的に追加されます。
	 * load them.
	 * @property addHeadTags
	 * @type {Boolean}
	 * @default trues
	 */
	//p.addHeadTags = true;

	/**
	 * このプリロードキューがcompleteしたときに処理開始する次のプリロードキューです。
	 * 現在のキューでエラーが投げられ、<code>loadQueue.stopOnError</code>が<code>true</code>であるときは、次のキューは処理開始されません。
	 * @property next
	 * @type {LoadQueue}
	 * @default null
	 */
	p.next = null;

// イベント
	/**
	 * 個別のファイルがロードされ処理完了したときに発火されるイベントです。
	 * @event fileload
	 * @param {Object} target イベントを発行したオブジェクトです。
	 * @param {String} type イベントタイプです。
	 * @param {Object} {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}あるいは{{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}
	 * の呼び出しにより指定されたファイルアイテムです。文字列パスあるいはタグのみが指定された場合、オブジェクトはその値をプロパティとして格納します。
	 * @param {Object} result ロードしたアイテムのHTMLタグあるいはパース結果です。
	 * @param {Object} rawResult 未処理の結果であり、通常は使用可能なオブジェクトに変換する前の生のテキストあるいはバイナリデータです。
	 * to a usable object.
	 * @since 0.3.0
	 */

	/**
	 * 個別のファイルのロード進捗が変化したときに発火されるイベントです。
	 * @event fileprogress
	 * @param {Object} target イベントを発行したオブジェクトです。
	 * @param {String} type イベントタイプです。
	 * @param {Object} {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}あるいは{{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}
	 * の呼び出しにより指定されたファイルアイテムです。文字列パスあるいはタグのみが指定された場合、オブジェクトはその値をプロパティとして格納します。
	 * @param {Number} loaded ロード完了したバイト数です。パーセンテージとして1の値をとることがあります。
	 * @param {Number} total 全体のバイト数です。未知の場合、値は1です。
	 * @param {Number} percent ロード完了したパーセンテージです。0と1の間の値をとります。
	 * @since 0.3.0
	 */

// コールバック（廃止）
	/**
	 * 個別のファイルがロード完了した時に発火されるコールバックです。
	 * @property onFileLoad
	 * @type {Function}
	 * @deprecated "fileload"イベントの使用を推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onFileLoad = null;

	/**
	 * 個別のファイルの進捗が変化したときに発火されるコールバックです。
	 * @property onFileProgress
	 * @type {Function}
	 * @deprecated "fileprogress"イベントの使用を推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onFileProgress = null;


// Protected
	/**
	 * ファイルがロードされる前にファイルタイプに応じて発火されるコールバックをまとめたハッシュオブジェクトです。
	 * プラグインがロードのプロパティをオーバーライドするのを可能にします。
	 * 詳しくは{{#crossLink "LoadQueue/installPlugin"}}{{/crossLink}}メソッドを参照してください。
	 * @property _typeCallbacks
	 * @type {Object}
	 * @private
	 */
	p._typeCallbacks = null;

	/**
	 * ファイルがロードされる前にファイル拡張子に応じて発火されるコールバックをまとめたハッシュオブジェクトです。
	 * プラグインがロードのプロパティをオーバーライドするのを可能にします。
	 * 詳しくは{{#crossLink "LoadQueue/installPlugin"}}{{/crossLink}}メソッドを参照してください。
	 * @property _extensionCallbacks
	 * @type {null}
	 * @private
	 */
	p._extensionCallbacks = null;

	/**
	 * loadStartイベントが既に発行されたか否かです。
	 * このイベントは最初のファイルがリクエストされたときに一回だけ発火されます。
	 * @property _loadStartWasDispatched
	 * @type {Boolean}
	 * @default false
	 * @private
	 */
	p._loadStartWasDispatched = false;

	/**
	 * LoadQueueが維持しようとする最大接続数です。
	 * 詳しくは{{#crossLink "LoadQueue/setMaxConnections"}}{{/crossLink}}を見てください。
	 * @property _maxConnections
	 * @type {Number}
	 * @default 1
	 * @private
	 */
	p._maxConnections = 1;

	/**
	 * 現在スクリプトをローディング中か否かです。
	 * プリロードにscriptタグを用いる場合は、一度に一つだけスクリプトをロードすることを保証する処理に寄与します。
	 * @property _currentlyLoadingScript
	 * @type {Boolean}
	 * @private
	 */
	p._currentlyLoadingScript = null;

	/**
	 * 現在ダウンロード中のファイルを格納する配列です。
	 * @property _currentLoads
	 * @type {Array}
	 * @private
	 */
	p._currentLoads = null;

	/**
	 * まだダウンロード開始していないキューのアイテムを格納する配列です。
	 * @property _loadQueue
	 * @type {Array}
	 * @private
	 */
	p._loadQueue = null;

	/**
	 * LoadQueが適切にリセットできるよう、まだ完了していないダウンロードを格納している配列です。
	 * @property _loadQueueBackup
	 * @type {Array}
	 * @private
	 */
	p._loadQueueBackup = null;

	/**
	 * ダウンロード完了したアイテムのオブジェクトハッシュです。
	 * アイテムのIDによりインデックスされています。
	 * An object hash of items that have finished downloading, indexed by item IDs.
	 * @property _loadItemsById
	 * @type {Object}
	 * @private
	 */
	p._loadItemsById = null;

	/**
	 * ダウンロード完了したアイテムのオブジェクトハッシュです。
	 * アイテムのソースによりインデックスされています。
	 * @property _loadItemsBySrc
	 * @type {Object}
	 * @private
	 */
	p._loadItemsBySrc = null;

	/**
	 * ロード完了したアイテムのオブジェクトハッシュです。
	 * ロードしたアイテムのIDによりインデックスされています。
	 *
	 * @property _loadedResults
	 * @type {Object}
	 * @private
	 */
	p._loadedResults = null;

	/**
	 * ロード完了したパースされていないアイテムのオブジェクトハッシュです。
	 * ロードしたアイテムのIDによりインデックスされています。
	 * @property _loadedRawResults
	 * @type {Object}
	 * @private
	 */
	p._loadedRawResults = null;

	/**
	 * リクエストされたアイテム数です。
	 * ダウンロード前でファイルサイズがわからない状態で全体の進捗管理に寄与します。
	 * @property _numItems
	 * @type {Number}
	 * @default 0
	 * @private
	 */
	p._numItems = 0;

	/**
	 * ロード完了したアイテム数です。
	 * ダウンロード前でファイルサイズがわからない状態で全体の進捗管理に寄与します。
	 * @property _numItemsLoaded
	 * @type {Number}
	 * @default 0
	 * @private
	 */
	p._numItemsLoaded = 0;

	/**
	 * リクエストされた順にスクリプトを並べた配列です。
	 * スクリプトが正しい順番で"completed"状態になるのを保証するのに寄与します。
	 * @property _scriptOrder
	 * @type {Array}
	 * @private
	 */
	p._scriptOrder = null;

	/**
	 * ロード完了したスクリプトの配列です。
	 * アイテムはリクエストされたときにこの配列に<code>null</code>として追加されます。
	 * ロード完了しているけどユーザに通知されていない状態ではロードされたアイテムを格納しています。
	 * 一旦ロード完了し発行されたら<code>true</true>が入ります。
	 * @property _loadedScripts
	 * @type {Array}
	 * @private
	 */
	p._loadedScripts = null;

	// AbstractLoaderの抽象メソッドをオーバーライドする
	p.init = function(useXHR) {
		this._numItems = this._numItemsLoaded = 0;
		this._paused = false;
		this._loadStartWasDispatched = false;

		this._currentLoads = [];
		this._loadQueue = [];
		this._loadQueueBackup = [];
		this._scriptOrder = [];
		this._loadedScripts = [];
		this._loadItemsById = {};
		this._loadItemsBySrc = {};
		this._loadedResults = {};
		this._loadedRawResults = {};

		// Callbacks for plugins
		this._typeCallbacks = {};
		this._extensionCallbacks = {};

		this.setUseXHR(useXHR);
	};

	/**
	 * useXHRの値を変更します。
	 * trueに設定しても、ブラウザのサポート次第で無効な場合があります。
	 * @method setUseXHR
	 * @param {Boolean} value 設定する新しいuseXHRの値です。
	 * @return {Boolean} 新しいuseXHRの値です。XHRがブラウザによってサポートされてない場合、引数がtrueであってもfalseを返します。
	 * @since 0.3.0
	 */
	p.setUseXHR = function(value) {
		// Determine if we can use XHR. XHR defaults to TRUE, but the browser may not support it.
		//TODO: Should we be checking for the other XHR types? Might have to do a try/catch on the different types similar to createXHR.
		this.useXHR = (value != false && window.XMLHttpRequest != null);
		return this.useXHR;
	};

	/**
	 * キューに追加されているローディング中のアイテムをすべて停止し、キューをクリアします。
	 * ロードされたコンテンツのすべての内部的な参照が削除され、キューは再使用できる状態になります。
	 * まだロード開始していないアイテムは{{#crossLink "AbstractLoader/load"}}{{/crossLink}}メソッドを使用してロードを開始できます。
	 * @method removeAll
	 * @since 0.3.0
	 */
	p.removeAll = function() {
		this.remove();
	};

	/**
	 * アイテムのロードを停止し、キューから削除します。
	 * 何も引数に渡さなければすべてのアイテムが削除されます。
	 * ロードされたアイテムへの内部的な参照も削除します。
	 * @method remove
	 * @param {String | Array} idsOrUrls このキューから削除するidあるいは複数のidです。
	 * 一個のアイテムを渡せるだけでなく、アイテムの配列を渡すこともできますし、複数の引数としてアイテムを渡すこともできます。
	 * @since 0.3.0
	 */
	p.remove = function(idsOrUrls) {
		var args = null;

		if (idsOrUrls && !(idsOrUrls instanceof Array)) {
			args = [idsOrUrls];
		} else if (idsOrUrls) {
			args = idsOrUrls;
		}

		var itemsWereRemoved = false;

		// Destroy everything
		if (!args) {
			this.close();

			for (var n in this._loadItemsById) {
				this._disposeItem(this._loadItemsById[n]);
			}

			this.initialize(this.useXHR);

		// Remove specific items
		} else {
			while (args.length) {
				var item = args.pop();
				var r = this.getResult(item);

				//Remove from the main load Queue
				for (i = this._loadQueue.length-1;i>=0;i--) {
					loadItem = this._loadQueue[i].getItem();
					if (loadItem.id == item || loadItem.src == item) {
						this._loadQueue.splice(i,1)[0].cancel();
						break;
					}
				}

				//Remove from the backup queue
				for (i = this._loadQueueBackup.length-1;i>=0;i--) {
					loadItem = this._loadQueueBackup[i].getItem();
					if (loadItem.id == item || loadItem.src == item) {
						this._loadQueueBackup.splice(i,1)[0].cancel();
						break;
					}
				}

				if (r) {
					delete this._loadItemsById[r.id];
					delete this._loadItemsBySrc[r.src];
					this._disposeItem(r);
				} else {
					for (var i=this._currentLoads.length-1;i>=0;i--) {
						var loadItem = this._currentLoads[i].getItem();
						if (loadItem.id == item || loadItem.src == item) {
							this._currentLoads.splice(i,1)[0].cancel();
							itemsWereRemoved = true;
							break;
						}
					}
				}
			}

			// If this was called during a load, try to load the next item.
			if (itemsWereRemoved) {
				this._loadNext();
			}
		}
	};

	/**
	 * すべての実行中のロードを停止し、すべてのロードしたアイテムを破壊し、キューをリセットします。
	 * すべてのアイテムは{{#crossLink "AbstractLoader/load"}}{{/crossLink}}を呼ぶことよにより再度ロードできます。
	 * アイテムはキューからは削除されません。
	 * アイテムをキューから削除するには、{{#crossLink "LoadQueue/remove"}}{{/crossLink}}あるいは{{#crossLink "LoadQueue/removeAll"}}{{/crossLink}}
	 * メソッドを使ってください。
	 * @method reset
	 * @since 0.3.0
	 */
	p.reset = function() {
		this.close();
		for (var n in this._loadItemsById) {
			this._disposeItem(this._loadItemsById[n]);
		}

		//Reset the queue to its start state
		var a = [];
		for (i=0,l=this._loadQueueBackup.length;i<l;i++) {
			a.push(this._loadQueueBackup[i].getItem());
		}

		this.loadManifest(a, false);
	};

	/**
	 * 指定されたファイルタイプがバイナリファイルとしてロードされるべきかどうかを判定します。
	 * 現在、画像および"binary"と印をつけられたアイテムのみがバイナリとしてロードされます。
	 * オーディオはバイナリタイプではなく、バイナリとしてロードした場合audioタグを使って再生することはできません。
	 * プラグインは結果をバイナリで受け取る必要がある場合、アイテムタイプをバイナリに変更することがあります。
	 * バイナリファイルはXHR2を使ってロードされます。
	 * @method isBinary
	 * @param {String} type アイテムタイプです。
	 * @return 指定されたタイプがバイナリであるか否かです。
	 * @private
	 */
	s.isBinary = function(type) {
		switch (type) {
			case createjs.LoadQueue.IMAGE:
			case createjs.LoadQueue.BINARY:
				return true;
			default:
				return false;
		}
	};

	/**
	 * プラグインを登録します。
	 * プラグインはロードタイプ（音声、画像など）に対応させることができますし、拡張子（png、mp3など）に対応させることもできます。
	 * 現在、タイプ/拡張子ごとに一個だけプラグインを対応させることができます。
	 * プラグインは以下を含むオブジェクトを返さねばなりません:
	 *  <ul><li>callback: 呼び出す関数です。</li>
	 *      <li>types: 対応させるタイプの配列です。</li>
	 *      <li>extensions: 対応させる拡張子の配列です。適用可能なタイプのハンドラが発火されてないときのみ発火します。</li></ul>
	 * プラグインがタイプハンドラと拡張子ハンドラの両方にマッチした場合、タイプハンドラのみが発火されます。
	 * 例えば、タイプがsoundのハンドラと拡張子がmp3のハンドラを保持したとすると、mp3ファイルがロードされたときはタイプハンドラのみが
	 * 発火されます。
	 * @method installPlugin
	 * @param {Function} plugin インストールするプラグインです。
	 */
	p.installPlugin = function(plugin) {
		if (plugin == null || plugin.getPreloadHandlers == null) { return; }
		var map = plugin.getPreloadHandlers();
		if (map.types != null) {
			for (var i=0, l=map.types.length; i<l; i++) {
				this._typeCallbacks[map.types[i]] = map.callback;
			}
		}
		if (map.extensions != null) {
			for (i=0, l=map.extensions.length; i<l; i++) {
				this._extensionCallbacks[map.extensions[i]] = map.callback;
			}
		}
	};

	/**
	 * 同時最大接続数を設定します。
	 * ブラウザやサーバは独自の最大接続数設定を保持できますので、ブラウザが接続を開通するまでは追加の接続は待ち状態となります。
	 * <code>maintainScriptOrder=true</code>の設定の下でタグを使ってスクリプトをロードする場合、ブラウザの制限のため一度に一つの
	 * スクリプトしかロードされません。
	 * @method setMaxConnections
	 * @param {Number} value 許容する同時接続数です。デフォルトでは、LoadQueごとに一つまでしか接続されません。
	 */
	p.setMaxConnections = function (value) {
		this._maxConnections = value;
		if (!this._paused) {
			this._loadNext();
		}
	}

	/**
	 * 一つのファイルをロードします。
	 * 一度に複数のファイルを追加するには{{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}メソッドを使ってください。
	 *
	 * ファイルは常に現在のキューに対して追加されるため、このメソッドは何度でも使用することができます。
	 * キューを最初にクリアするには、{{#crossLink "AbstractLoader/close"}}{{/crossLink}}メソッドを使ってください。
	 * @method loadFile
	 * @param {Object | String} file ファイルオブジェクトあるいはロードするファイルパスです。以下のいずれかを設定出来ます。
     * <ol>
     *     <li>リソースへのパス文字列。この方法で指定したロードアイテムはバックグラウンドでオブジェクト（下記参照）に変換されます。</li>
     *     <li>以下を含むオブジェクト。:<ul>
     *         <li>src: ロードするファイルのソースです。このプロパティは<b>必須</b>です。文字列（推奨します）あるいはHTMLタグを設定できます。</li>
     *         <li>type: ロードするファイルタイプ（画像、音声、JSONなど）です。PreloadJSは拡張子を用いてタイプの自動検出を行います。
     *         サポートされるタイプはLoadQueに<code>LoadQueue.IMAGE</code>のようにして定義されています。
     *         通常のファイルURIでないもの（phpスクリプトなど）を使う場合はタイプを指定することを推奨します。
     *         <li>id: ロードオブジェクトの参照として使用できる識別子です。</li>
     *         <li>data: 任意のデータオブジェクトです。ロードオブジェクトに含まれます。</li>
     *     </ul>
     * </ol>
	 * @param {Boolean} [loadNow=true] 即座にロードを開始する（true）かloadメソッドが呼ばれるのを待つか（false）を指定します。デフォルト値はtrueです。
	 * キューが{{#crossLink "LoadQueue/setPaused"}}{{/crossLink}}を用いて一時停止しており、値がtrueのときは、自動的に再開します。
	 */
	p.loadFile = function(file, loadNow) {
		if (file == null) {
			this._sendError({text: "PRELOAD_NO_FILE"});
			return;
		}
		this._addItem(file);

		if (loadNow !== false) {
			this.setPaused(false);
		}
	}

	/**
	 * アイテムの配列をロードします。
	 * 単独のファイルのロードであれば、{{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}メソッドを使用してください。
	 * マニフェスト内のファイルは定義した順番でリクエストされますが、{{#crossLink "LoadQueue/setMaxConnections"}}{{/crossLink}}
	 * によって最大接続数が1を上回る値に設定されている時、異なる順番でロード完了することがあります。
	 * スクリプトは<code>loadQueue.maintainScriptOrder</code>がtrue（デフォルト値です）である限り、正しい順番でロードされます。
	 *
	 * ファイルは必ず現在のキューに追加されるので、このメソッドは複数回呼び出してファイルを追加することができます。
	 * キューを最初にクリアするには、{{#crossLink "AbstractLoader/close"}}{{/crossLink}}メソッドを使ってください。
	 * @method loadManifest
	 * @param {Array} manifest ロードするファイルのリストです。それぞれのファイルには以下のいずれかを設定できます:
     * <ol>
     *     <li>リソースへのパス文字列。この方法で指定したロードアイテムはバックグラウンドでオブジェクト（下記参照）に変換されます。</li>
     *     <li>以下を含むオブジェクト:<ul>
     *         <li>src: ロードするファイルのソースです。このプロパティは<b>必須</b>です。文字列（推奨します）あるいはHTMLタグを設定できます。</li>
     *         <li>type: ロードするファイルタイプ（画像、音声、JSONなど）です。PreloadJSは拡張子を用いてタイプの自動検出を行います。
     *         サポートされるタイプはLoadQueに<code>LoadQueue.IMAGE</code>のようにして定義されています。
     *         通常のファイルURIでないもの（phpスクリプトなど）を使う場合はタイプを指定することを推奨します。
     *         <li>id: ロードオブジェクトの参照として使用できる識別子です。</li>
     *         <li>data: 任意のデータオブジェクトです。ロードオブジェクトに含まれます。</li>
     *     </ul>
     * </ol>
	 * @param {Boolean} [loadNow=true] 即座にロードを開始する（true）かloadメソッドが呼ばれるのを待つか（false）です。デフォルト値はtrueです。
	 * キューが{{#crossLink "LoadQueue/setPaused"}}{{/crossLink}}を用いて一時停止しており、値がtrueのときは、自動的に再開します。
	 */
	p.loadManifest = function(manifest, loadNow) {
		var data = null;

		if (manifest instanceof Array) {
			if (manifest.length == 0) {
				this._sendError({text: "PRELOAD_MANIFEST_EMPTY"});
				return;
			}
			data = manifest;
		} else {
			if (manifest == null) {
				this._sendError({text: "PRELOAD_MANIFEST_NULL"});
				return;
			}
			data = [manifest];
		}

		for (var i=0, l=data.length; i<l; i++) {
			this._addItem(data[i]);
		}

		if (loadNow !== false) {
			this.setPaused(false);
		}
	};

	// AbstractLoaderの抽象メソッドをオーバーライドします。
	p.load = function() {
		this.setPaused(false);
	};

	/**
	 * ロード開始時に指定された"id"あるいは"src"を用いてロードアイテムを検索します。
	 * @method getItem
	 * @param {String} value ロードアイテムの<code>id</code>あるいは<code>src</code>です。
	 * @return {Object} {{#crossLink "LoadQueue/loadFile"}}{{/crossLink}}あるいは{{#crossLink "LoadQueue/loadManifest"}}{{/crossLink}}
	 * によってリクエストされたロードアイテムです。このオブジェクトは"fileload"イベントの"item"パラメータによっても返されます。
	 */
	p.getItem = function(value) {
		return this._loadItemsById[value] || this._loadItemsBySrc[value];
	};

	/**
	 * ロード開始時に指定された"id"あるいは"src"を用いてロード結果を検索します。
	 * @method getResult
	 * @param {String} value ロードアイテムの<code>id</code>あるいは<code>src</code>です。
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
	 * このオブジェクトは"fileload"イベントの"item"パラメータによっても返されます。
	 * 生の結果を求めてそれがなかった場合はこのフォーマットされた結果が返されます。
	 */
	p.getResult = function(value, rawResult) {
		var item = this._loadItemsById[value] || this._loadItemsBySrc[value];
		if (item == null) { return null; }
		var id = item.id;
		if (rawResult && this._loadedRawResults[id]) {
			return this._loadedRawResults[id];
		}
		return this._loadedResults[id];
	};

	/**
	 * 現在のロードを一時停止あるいは再生します。
	 * アクティブなロードはキャンセルされませんが、アクティブなロードが完了した時、キューにある次のアイテムは処理されません。
	 * LoadQueはデフォルトでは一時停止されません。
	 * @method setPaused
	 * @param {Boolean} value キューを一時停止する（true）か再開する（false）かです。
	 */
	p.setPaused = function(value) {
		this._paused = value;
		if (!this._paused) {
			this._loadNext();
		}
	};

	// AbstractLoaderの抽象メソッドをオーバーライドします。
	p.close = function() {
		while (this._currentLoads.length) {
			this._currentLoads.pop().cancel();
		}
		this._scriptOrder.length = 0;
		this._loadedScripts.length = 0;
		this.loadStartWasDispatched = false;
	};


//Protectedメソッド
	/**
	 * キューにアイテムを追加します。
	 * アイテムはコンテンツをロードするのに必要なプロパティをすべて格納した有用なオブジェクトにフォーマットされます。
	 * ロードキューには、ユーザから渡されたロードアイテムでなく、プリロードを実行するローダーインスタンスが入ります。
	 * ロードアイテムをidあるいはsrcによって検索するには、{{#crossLink "LoadQueue.getItem"}}{{/crossLink}}メソッドを使用してください。
	 * @method _addItem
	 * @param {String|Object} value キューに追加するアイテムです。
	 * @private
	 */
	p._addItem = function(value) {
		var item = this._createLoadItem(value);
		if (item == null) { return; } // Sometimes plugins or types should be skipped.
		var loader = this._createLoader(item);
		if (loader != null) {
			this._loadQueue.push(loader);
			this._loadQueueBackup.push(loader);

			this._numItems++;
			this._updateProgress();

			// Only worry about script order when using XHR to load scripts. Tags are only loading one at a time.
			if (this.maintainScriptOrder
					&& item.type == createjs.LoadQueue.JAVASCRIPT
					&& loader instanceof createjs.XHRLoader) {
				this._scriptOrder.push(item);
				this._loadedScripts.push(null);
			}
		}
	};

	/**
	 * すべての必要なプロパティ（src、type、extension、tag）を格納したロードアイテムを生成します。
	 * アイテムのタイプはブラウザのサポート状況、ファイルタイプに基づいた要件、開発者の設定によって決定されます。
	 * 例えば、XHRは新しいブラウザでサポートされるファイルタイプでのみ使用されます。
	 *
	 * アイテムが返される前に、タイプあるいは拡張子に対応するために登録されたプラグインが発火されます。
	 * それにより、ロードアイテムに変更が加えられることがあります。
	 * @method _createLoadItem
	 * @param {String | Object | HTMLAudioElement | HTMLImageElement} value プリロードする必要のあるアイテムです。
	 * @return {Object} 使用されるローダーインスタンスです。
	 * @private
	 */
	p._createLoadItem = function(value) {
		var item = null;

		// Create/modify a load item
		switch(typeof(value)) {
			case "string":
				item = {
					src: value
				}; break;
			case "object":
				if (window.HTMLAudioElement && value instanceof HTMLAudioElement) {
					item = {
						tag: value,
						src: item.tag.src,
						type: createjs.LoadQueue.SOUND
					};
				} else {
					item = value;
				}
				break;
			default:
				break;
		}

		var match = this._parseURI(item.src);
		if (match != null) { item.ext = match[5]; }
		if (item.type == null) {
			item.type = this._getTypeByExtension(item.ext);
		}

		// Create a tag for the item. This ensures there is something to either load with or populate when finished.
		if (item.tag == null) {
			item.tag = this._createTag(item.type);
		}

		// If there's no id, set one now.
		if (item.id == null || item.id == "") {
            item.id = item.src;
		}

		// Give plugins a chance to modify the loadItem:
		var customHandler = this._typeCallbacks[item.type] || this._extensionCallbacks[item.ext];
		if (customHandler) {
			var result = customHandler(item.src, item.type, item.id, item.data);
			//Plugin will handle the load, so just ignore it.
			if (result === false) {
				return null;

			// Load as normal:
			} else if (result === true) {
				// Do Nothing

			// Result is a loader class:
			} else {
				if (result.src != null) { item.src = result.src; }
				if (result.id != null) { item.id = result.id; }
				if (result.tag != null && result.tag.load instanceof Function) { //Item has what we need load
					item.tag = result.tag;
				}
                if (result.completeHandler != null) {item.completeHandler = result.completeHandler;}  // we have to call back this function when we are done loading
			}

			// Allow type overriding:
			if (result.type) { item.type = result.type; }

			// Update the extension in case the type changed:
			match = this._parseURI(item.src);
			if (match != null) { item.ext = match[5]; }
		}

		// Store the item for lookup. This also helps clean-up later.
		this._loadItemsById[item.id] = item;
		this._loadItemsBySrc[item.src] = item;

		return item;
	};

	/**
	 * ロードアイテムのローダーを生成します。
	 * @method _createLoader
	 * @param {Object} item ローダーを生成するために使用するフォーマットされたロードアイテムです。
	 * @return {AbstractLoader} コンテンツをロードするために使用するローダーです。
	 * @private
	 */
	p._createLoader = function(item) {
		// Initially, try and use the provided/supported XHR mode:
		var useXHR = this.useXHR;

		// Determine the XHR usage overrides:
		switch (item.type) {
			case createjs.LoadQueue.JSON:
			case createjs.LoadQueue.XML:
			case createjs.LoadQueue.TEXT:
				useXHR = true; // Always use XHR2 with text/XML
				break;
			case createjs.LoadQueue.SOUND:
				useXHR = false; // Never load audio using XHR. WebAudio will provide its own loader.
				break;
			// Note: IMAGE, CSS, SCRIPT, SVG can all use TAGS or XHR.
		}

		if (useXHR) {
			return new createjs.XHRLoader(item);
		} else {
			return new createjs.TagLoader(item);
		}
	};


	/**
	 * キューの次のアイテムをロードします。
	 * キューが空の場合（すべてのアイテムがロード完了している場合）はcompleteイベントが発行されます。
	 * キューは{{#crossLink "LoadQueue.setMaxConnections"}}{{/crossLink}}によって指定された最大接続数まで空のスロットを
	 * 埋めます。
	 * 唯一の例外はタグによってロードされるスクリプトで、ロードの順番を維持するために一度に1つだけロードされる必要があります。
	 * @method _loadNext
	 * @private
	 */
	p._loadNext = function() {
		if (this._paused) { return; }

		// Only dispatch loadStart event when the first file is loaded.
		if (!this._loadStartWasDispatched) {
			this._sendLoadStart();
			this._loadStartWasDispatched = true;
		}

		if (this._numItems == this._numItemsLoaded) {
			this.loaded = true;
			this._sendComplete();
			if (this.next && this.next.load) {
				this.next.load();
				//TODO: Test. This was changed from a load.apply
			}
		}

		// Must iterate forwards to load in the right order.
		for (var i=0, l=this._loadQueue.length; i<l; i++) {
			if (this._currentLoads.length >= this._maxConnections) { break; }
			var loader = this._loadQueue[i];

			// Determine if we should be only loading one at a time:
			if (this.maintainScriptOrder
					&& loader instanceof createjs.TagLoader
					&& loader.getItem().type == createjs.LoadQueue.JAVASCRIPT) {
				if (this._currentlyLoadingScript) { continue; } // Later items in the queue might not be scripts.
				this._currentlyLoadingScript = true;
			}
			this._loadQueue.splice(i, 1);
            this._loadItem(loader);
  			i--; l--;
		}
	};

	/**
	 * アイテムのロードを開始します。ロードが開始されるまで、イベントはローダーに追加されません。
	 * @method _loadItem
	 * @param {AbstractLoader} loader 開始するローダーのインスタンスです。現在、XHRLoaderあるいはTagLoaderとなります。
	 * @private
	 */
	p._loadItem = function(loader) {
		loader.addEventListener("progress", createjs.proxy(this._handleProgress, this));
		loader.addEventListener("complete", createjs.proxy(this._handleFileComplete, this));
		loader.addEventListener("error", createjs.proxy(this._handleFileError, this));
		this._currentLoads.push(loader);
		loader.load();
	};

	/**
	 * ローダーがエラーに遭遇したときに発火されるコールバックです。
	 * <code>stopOnError</code>がtrueに設定されていない限りキューはロードを継続します。
	 * @method _handleFileError
	 * @param {Object} event エラーイベントです。関連するエラー情報を格納しています。
	 * @private
	 */
	p._handleFileError = function(event) {
		var loader = event.target;
		this._numItemsLoaded++;
		this._updateProgress();

		var event = {
			//TODO: Add error text?
			item: loader.getItem()
		};
		this._sendError(event);

		if (!this.stopOnError) {
			this._removeLoadItem(loader);
			this._loadNext();
		}
	};

	/**
	 * アイテムがロード完了しました。
	 * アイテム全体がロードされ、すぐ使えるようにパースされ、ロードアイテムの"result"プロパティとして利用可能になっていることを保証します。
	 * パースされたアイテム（JSON、XML、CSS、JavaScriptなどのような）の生のテキストの結果は"rawResult"イベントとして使用可能であり、また
	 * {{#crossLink "LoadQueue/getResult"}}{{/crossLink}}を用いて検索可能です。
	 * @method _handleFileComplete
	 * @param {Object} event ローダーからのイベントオブジェクトです。
	 * @private
	 */
	p._handleFileComplete = function(event) {
		var loader = event.target;
		var item = loader.getItem();

		this._loadedResults[item.id] = loader.getResult();
		if (loader instanceof createjs.XHRLoader) {
			this._loadedRawResults[item.id] = loader.getResult(true);
		}

		this._removeLoadItem(loader);

		// Ensure that script loading happens in the right order.
		if (this.maintainScriptOrder && item.type == createjs.LoadQueue.JAVASCRIPT) {
			if (loader instanceof createjs.TagLoader) {
				this._currentlyLoadingScript = false;
			} else {
				this._loadedScripts[this._scriptOrder.indexOf(item)] = item;
				this._checkScriptLoadOrder(loader);
				return;
			}
		}

		this._processFinishedLoad(item);
	}

	p._processFinishedLoad = function(item) {
		// Old handleFileTagComplete follows here.
		this._numItemsLoaded++;

		this._updateProgress();
		this._sendFileComplete(item);

		this._loadNext();
	};

	/**
	 * スクリプトのロードとイベント発行の正確な順序を保証します。
	 * XHRを使用するとき、スクリプトは追加された順に配列に"null"値として貯めこまれます。
	 * ロード完了した時、値はロードしたアイテムに設定され、イベント発行された時に値は<code>true</code>に設定されます。
	 * このメソッドは単純に配列をイテレートし、<code>null</code>が配列の前要素にないすべてのロードアイテムがイベント発行されたことを保証します。
	 * @method _checkScriptLoadOrder
	 * @private
	 */
	p._checkScriptLoadOrder = function () {
		var l = this._loadedScripts.length;

		for (var i=0;i<l;i++) {
			var item = this._loadedScripts[i];
			if (item === null) { break; } // This is still loading. Do not process further.
			if (item === true) { continue; } // This has completed, and been processed. Move on.

			// This item has finished, and is the next one to get dispatched.
			this._processFinishedLoad(item);
			this._loadedScripts[i] = true;
			i--; l--;
		}
	};

	/**
	 * ロードアイテムが完了したかあるいはキャンセルされました。LoadQueから削除される必要があります。
	 * @method _removeLoadItem
	 * @param {AbstractLoader} loader 削除するローダーインスタンスです。
	 * @private
	 */
	p._removeLoadItem = function(loader) {
		var l = this._currentLoads.length;
		for (var i=0;i<l;i++) {
			if (this._currentLoads[i] == loader) {
				this._currentLoads.splice(i,1); break;
			}
		}
	};

	/**
	 * アイテムがprogressイベントを発行して来ました。
	 * progressを伝搬させ、LoadQue全体のprogressを更新します。
	 * @method _handleProgress
	 * @param {Object} event アイテムのprogressイベントです。
	 * @private
	 */
	p._handleProgress = function(event) {
		var loader = event.target;
		this._sendFileProgress(loader.getItem(), loader.progress);
		this._updateProgress();
	};

	/**
	 * 全体の進捗が変化したので、新しい進捗値を決定し発行します。
	 * アイテムがprogressあるいはcompleteを発行すると全体の進捗値は必ず変化します。
	 * ロード完了するまではアイテムの実際のファイルサイズは知りえず、また、ロード完了してもサイズを知りえるのはXHRでロードされたアイテムのみです。
	 * よって、各アイテムに"slot"を定義し（10アイテム中の1アイテムは10%となります）、既にロードされたアイテムに進捗値をを追加することで全体の進捗値を計算しています。
	 *
	 * 例えば、5/10のアイテムがロード完了したとき、6番目のアイテムが20%ロードされていれば、全体の進捗値は以下になります。：<ul>
	 *      <li>キューにあるアイテムの5/10(50%)</li>
	 *      <li>アイテム6のスロットの20%を追加(2%)</li>
	 *      <li>52%となります</li></ul>
	 * @method _updateProgress
	 * @private
	 */
	p._updateProgress = function () {
		var loaded = this._numItemsLoaded / this._numItems; // Fully Loaded Progress
		var remaining = this._numItems-this._numItemsLoaded;
		if (remaining > 0) {
			var chunk = 0;
			for (var i=0, l=this._currentLoads.length; i<l; i++) {
				chunk += this._currentLoads[i].progress;
			}
			loaded += (chunk / remaining) * (remaining/this._numItems);
		}
		this._sendProgress(loaded);
	}

	/**
	 * メモリから解放するために、アイテムの結果を除去します。
	 * 主にロードされたアイテムと結果は内部のハッシュからクリアされます。
	 * @method _disposeItem
	 * @param {Object} item プリロード用に渡されたアイテムです。
	 * @private
	 */
	p._disposeItem = function(item) {
		delete this._loadedResults[item.id];
		delete this._loadedRawResults[item.id];
		delete this._loadItemsById[item.id];
		delete this._loadItemsBySrc[item.src];
	};


	/**
	 * HTMLタグを生成します。
	 * データをロードする方法が何であれ、タグで返す必要があるかもしれないため、
	 * このメソッドは{{#crossLink "TagLoader"}}{{/crossLink}}の中でなくLoadQueで定義されています。
	 * @method _createTag
	 * @param {String} type アイテムタイプです。アイテムは開発者によって渡されるか、拡張子によって決定されます。
	 * @return {HTMLImageElement|HTMLAudioElement|HTMLScriptElement|HTMLLinkElement|Object} 生成されるタグです。
	 * タグはHTMLのbodyには追加されません。
	 * @private
	 */
	p._createTag = function(type) {
		var tag = null;
		switch (type) {
			case createjs.LoadQueue.IMAGE:
				return document.createElement("img");
			case createjs.LoadQueue.SOUND:
				tag = document.createElement("audio");
				tag.autoplay = false;
				// Note: The type property doesn't seem necessary.
				return tag;
			case createjs.LoadQueue.JAVASCRIPT:
				tag = document.createElement("script");
				tag.type = "text/javascript";
				return tag;
			case createjs.LoadQueue.CSS:
				if (this.useXHR) {
					tag = document.createElement("style");
				} else {
					tag = document.createElement("link");
				}
				tag.rel  = "stylesheet";
				tag.type = "text/css";
				return tag;
			case createjs.LoadQueue.SVG:
				if (this.useXHR) {
					tag = document.createElement("svg");
				} else {
					tag = document.createElement("object");
					tag.type = "image/svg+xml";
				}
				return tag;
		}
		return null;
	};

	/**
	 * 拡張子を用いてオブジェクトのタイプを決定します。
	 * タイプが通常の拡張子でない場合は、ロードするアイテムと一緒にタイプを渡すことができます。
	 * @param {String} extension ロードタイプを決定するために使われるファイル拡張子です。
	 * @return {String} 決定されたロードタイプ（例えば、<code>LoadQueue.IMAGE</code>）です。拡張子から決定できなかった場合はnullとなります。
	 * @private
	 */
	p._getTypeByExtension = function(extension) {
		switch (extension) {
			case "jpeg":
			case "jpg":
			case "gif":
			case "png":
			case "webp":
			case "bmp":
				return createjs.LoadQueue.IMAGE;
			case "ogg":
			case "mp3":
			case "wav":
				return createjs.LoadQueue.SOUND;
			case "json":
				return createjs.LoadQueue.JSON;
			case "xml":
				return createjs.LoadQueue.XML;
			case "css":
				return createjs.LoadQueue.CSS;
			case "js":
				return createjs.LoadQueue.JAVASCRIPT;
			case 'svg':
				return createjs.LoadQueue.SVG;
			default:
				return createjs.LoadQueue.TEXT;
		}
	};

	/**
	 * fileprogressイベント（それとonFileProgressコールバック）を発行します。
	 * イベントの内容の詳細については<code>LoadQueue.fileprogress</code>を見てください。
	 * @method _sendFileProgress
	 * @param {Object} item ロードされているアイテムです。
	 * @param {Number} progress ロードされたアイテムの量です。（0と1の間の値を取ります。）
	 * @protected
	 */
	p._sendFileProgress = function(item, progress) {
		if (this._isCanceled()) {
			this._cleanUp();
			return;
		}
		var event = {
			target: this,
			type: "fileprogress",
			progress: progress,
			loaded: progress,
			total: 1,
			item: item
		};
		this.onFileProgress && this.onFileProgress(event);
		this.dispatchEvent(event);
	};

	/**
	 * fileloadイベント（それとonFileLoadコールバック）を発行します。
	 * イベントの内容の詳細については<code>LoadQueue.fileload</code>を見てください。
	 * @method _sendFileComplete
	 * @param {Object} item ロード中のアイテムです。
	 * @protected
	 */
	p._sendFileComplete = function(item) {
		if (this._isCanceled()) { return; }
		var event = {
			target: this,
			type: "fileload",
			item: item,
			result: this._loadedResults[item.id],
			rawResult: this._loadedRawResults[item.id]
		};

        // This calls a handler specified on the actual load item. Currently, the SoundJS plugin uses this.
        if (item.completeHandler) {
            item.completeHandler(event);
        }

        this.onFileLoad && this.onFileLoad(event);
		this.dispatchEvent(event)
	};

	p.toString = function() {
		return "[PreloadJS LoadQueue]";
	};

	/**
	 * PreloadJSメソッドの関数プロキシです。
	 * デフォルトの動作では、JavaScriptのメソッドはスコープを維持しません。
	 * そのため、メソッドをコールバックとして渡すと呼び出し側のスコープの中でメソッドが呼ばれることになります。
	 * プロキシを使うことでメソッドが正確なスコープの中で呼ばれることを保証します。
	 * @method proxy
	 * @param {Function} method 呼び出す関数です。
	 * @param {Object} scope メソッドが呼び出されるスコープです。
	 * @static
	 * @private
	 * @deprecated createjs.proxyメソッドを推奨します。(LoadQueueのソースを参照してください)
	 */
	createjs.proxy = function(method, scope) {
		return function() {
			return method.apply(scope, arguments);
		};
	}

	createjs.LoadQueue = LoadQueue;


// ヘルパーメソッド
	/**
	 * PreloadJSメソッドの関数プロキシです。
	 * デフォルトの動作では、JavaScriptのメソッドはスコープを維持しません。
	 * そのため、メソッドをコールバックとして渡すと呼び出し側のスコープの中でメソッドが呼ばれることになります。
	 * プロキシを使うことでメソッドが正確なスコープの中で呼ばれることを保証します。
	 * #method proxy
	 * @param {Function} method 呼び出す関数です。
	 * @param {Object} scope メソッドが呼び出されるスコープです。
	 * @param {mixed} [arg]* コールバックに追加される引数です。
	 * @static
	 * @private
	 */
	if (!createjs.proxy) {
		createjs.proxy = function(method, scope) {
			var aArgs = Array.prototype.slice.call(arguments, 2);
			return function() {
				return method.apply(scope, Array.prototype.slice.call(arguments, 0).concat(aArgs));
			};
		}
	}


	// An additional module to determine the current browser, version, operating system, and other environmental variables.
	var BrowserDetect = function() {}

	BrowserDetect.init = function() {
		var agent = navigator.userAgent;
		BrowserDetect.isFirefox = (agent.indexOf("Firefox") > -1);
		BrowserDetect.isOpera = (window.opera != null);
		BrowserDetect.isChrome = (agent.indexOf("Chrome") > -1);
		BrowserDetect.isIOS = agent.indexOf("iPod") > -1 || agent.indexOf("iPhone") > -1 || agent.indexOf("iPad") > -1;
	}

	BrowserDetect.init();

	createjs.LoadQueue.BrowserDetect = BrowserDetect;

	// Patch for IE7 and 8 that don't have indexOf
	// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/Array/indexOf
	if (!Array.prototype.indexOf) {
	    Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
	        if (this == null) {
	            throw new TypeError();
	        }
	        var t = Object(this);
	        var len = t.length >>> 0;
	        if (len === 0) {
	            return -1;
	        }
	        var n = 0;
	        if (arguments.length > 1) {
	            n = Number(arguments[1]);
	            if (n != n) { // shortcut for verifying if it's NaN
	                n = 0;
	            } else if (n != 0 && n != Infinity && n != -Infinity) {
	                n = (n > 0 || -1) * Math.floor(Math.abs(n));
	            }
	        }
	        if (n >= len) {
	            return -1;
	        }
	        var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
	        for (; k < len; k++) {
	            if (k in t && t[k] === searchElement) {
	                return k;
	            }
	        }
	        return -1;
	    }
	}
}());
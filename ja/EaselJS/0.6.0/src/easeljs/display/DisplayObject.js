/*
* DisplayObject
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

/**
 * EaselJSはcanvas向けに保持されたグラフィックスモードを提供するJavascriptライブラリであり、完全な階層構造の表示リスト、
 * コアインタラクションモデル、canvasでの2Dグラフィックスを簡易にするヘルパークラスを含みます。
 * EaselJSはリッチなHTML5Canvasにおけるリッチなグラフィックスやインタラクションに役立つソリューションを提供します。
 *
 * <h4>はじめに</h4>
 * Easelをはじめるために、まずはCANVAS要素を覆う{{#crossLink "Stage"}}{{/crossLink}}を作成し、{{#crossLink "DisplayObject"}}{{/crossLink}}
 * インスタンスを子として加えてみましょう。
 * EaselJSは以下をサポートしています:
 * <ul>
 *      <li>{{#crossLink "Bitmap"}}{{/crossLink}}による画像表示</li>
 *      <li>{{#crossLink "Shape"}}{{/crossLink}}と{{#crossLink "Graphics"}}{{/crossLink}}によるベクターグラフィックス</li>
 *      <li>{{#crossLink "SpriteSheet"}}{{/crossLink}}と{{#crossLink "BitmapAnimation"}}{{/crossLink}}によるビットマップアニメーション
 *      <li>{{#crossLink "Text"}}{{/crossLink}}によるシンプルなテキスト</li>
 *      <li>{{#crossLink "Container"}}{{/crossLink}}による他のDisplayObjectを格納するコンテナ</li>
 *      <li>{{#crossLink "DOMElement"}}{{/crossLink}}によるHTML DOM要素の制御</li>
 * </ul>
 *
 * 全ての表示オブジェクトはステージに子として加えるか、canvasに直接描画できます。
 *
 * <b>ユーザインタラクション</b><br />
 * 全てのステージ上（DOMElementを除く）の表示オブジェクトはマウスあるいはタッチで操作したときにイベントを発行します。
 * EaselJSは使いやすいドラッグアンドドロップモデルだけでなく、hover、press、それとreleaseイベントをサポートします。
 * 詳しくは{{#crossLink "MouseEvent"}}{{/crossLink}}を参照してください。
 *
 * <h4>簡単な例</h4>
 * この例ではEaselJSの描画APIを用いて{{#crossLink "Stage"}}{{/crossLink}}上に{{#crossLink "Shape"}}{{/crossLink}}を生成して配置する方法を説眼します。
 *
 *	    //canvasへの参照を渡してステージを作成します。
 *	    stage = new createjs.Stage("demoCanvas");
 *	    //Shape DisplayOBjectを生成します。
 *	    circle = new createjs.Shape();
 *	    circle.graphics.beginFill("red").drawCircle(0, 0, 40);
 *	    //Shapeインスタンスの位置を設定します。
 *	    circle.x = circle.y = 50;
 *	    //表示リストにShapeインスタンスを加えます。
 *	    stage.addChild(circle);
 *	    //ステージの更新により次のフレームを描画します。
 *	    stage.update();
 *
 * <b>シンプルなアニメーションの例</b><br />
 * この例では、前のデモで作成したシェイプを画面上で動かします。
 *
 *	    //ステージの更新により次のフレームを描画します。
 *	    createjs.Ticker.addEventListener("tick", handleTick);
 *
 *	    function handleTick() {
 *          //円を右に10単位動かします。
 *	    	circle.x += 10;
 *	    	//円を最初の位置に戻します。
 * 	    	if (circle.x > stage.canvas.width) { circle.x = 0; }
 *	    	stage.update();
 *	    }
 *
 * <h4>他の特長</h4>
 * EaselJSは以下をサポートするように構築されています。
 * <ul><li>{{#crossLink "Shadow"}}{{/crossLink}}やCompositeOperationといったcanvasの特長</li>
 *      <li>{{#crossLink "Ticker"}}{{/crossLink}}、オブジェクトが受け取ることのできるグローバルな鼓動</li>
 *      <li>{{#crossLink "ColorMatrixFilter"}}{{/crossLink}}, {{#crossLink "AlphaMaskFilter"}}{{/crossLink}},
 *      {{#crossLink "AlphaMapFilter"}}{{/crossLink}}, {{#crossLink "BoxBlurFilter"}}{{/crossLink}}といったフィルター。
 *      詳しくは{{#crossLink "Filter"}}{{/crossLink}}を参照してください。</li>
 *      <li>簡単にインタラクティブなボタンを作成するための{{#crossLink "ButtonHelper"}}{{/crossLink}}ユーティリティ。</li>
 *      <li>実行時に{{#crossLink "SpriteSheet"}}{{/crossLink}}の機能を構築し管理するのを助ける
 *      {{#crossLink "SpriteSheetUtils"}}{{/crossLink}}と{{#crossLink "SpriteSheetBuilder"}}{{/crossLink}}。
 * </ul>
 *
 * @module EaselJS
 */

// 名前空間:
this.createjs = this.createjs||{};

(function() {

/**
 * DisplayObjectは抽象オブジェクトであり、直接生成されるべきではありません。
 * その代わりに、{{#crossLink "Container"}}{{/crossLink}}, {{#crossLink "Bitmap"}}{{/crossLink}}, and {{#crossLink "Shape"}}{{/crossLink}}
 * のような子クラスを生成してください。
 * DisplayObjectはEaselJSライブラリにおいて全ての表示クラスの基底クラスです。
 * 全ての表示オブジェクトで共有される基本的なプロパティとメソッドを持ち、その中には変形系のプロパティ(x, y, scaleX, scaleY, など)、キャッシュ機構、マウスハンドラがあります。
 * @class DisplayObject
 * @uses EventDispatcher
 * @constructor
 **/
var DisplayObject = function() {
  this.initialize();
}
var p = DisplayObject.prototype;

	/**
	 * クロスドメインコンテンツに対しヒット検査、マウスイベント、getObjectsUnderPointといったものに関連した処理を行った時にエラーが発生するのを抑制します。
	 * @property suppressCrossDomainErrors
	 * @static
	 * @type {Boolean}
	 * @default false
	 **/
	DisplayObject.suppressCrossDomainErrors = false;

	/**
	 * @property _hitTestCanvas
	 * @type {HTMLCanvasElement | Object}
	 * @static
	 * @protected
	 **/
	DisplayObject._hitTestCanvas = createjs.createCanvas?createjs.createCanvas():document.createElement("canvas");
	DisplayObject._hitTestCanvas.width = DisplayObject._hitTestCanvas.height = 1;

	/**
	 * @property _hitTestContext
	 * @type {CanvasRenderingContext2D}
	 * @static
	 * @protected
	 **/
	DisplayObject._hitTestContext = DisplayObject._hitTestCanvas.getContext("2d");

	/**
	 * @property _nextCacheID
	 * @type {Number}
	 * @static
	 * @protected
	 **/
	DisplayObject._nextCacheID = 1;

// イベント:

	/**
	 * ユーザが表示オブジェクト上でマウスの左ボタンを押した時に発行されます。
	 * イベントのプロパティ一覧については{{#crossLink "MouseEvent"}}{{/crossLink}}を参照してください。
	 * @event mousedown
	 * @since 0.6.0
	 */

	/**
	 * ユーザが表示オブジェクト上でマウスの左ボタンを押し、その表示オブジェクト上で離した時に発行されます。
	 * イベントのプロパティ一覧については{{#crossLink "MouseEvent"}}{{/crossLink}}を参照してください。
	 * @event click
	 * @since 0.6.0
	 */

	/**
	 * ユーザが表示オブジェクト上でマウスの左ボタンをダブルクリックしたときに発行されます。
	 * イベントのプロパティ一覧については{{#crossLink "MouseEvent"}}{{/crossLink}}を参照してください。
	 * @event dblClick
	 * @since 0.6.0
	 */

	/**
	 * 表示オブジェクト内にユーザのマウスが入ると発行されます。
	 * このイベントは{{#crossLink "Stage.enableMouseOver"}}{{/crossLink}}によって有効化する必要があります。
	 * イベントのプロパティ一覧については{{#crossLink "MouseEvent"}}{{/crossLink}}を参照してください。
	 * @event mouseover
	 * @since 0.6.0
	 */


	/**
	 * 表示オブジェクトからユーザのマウスが外に出ると発行されます。
	 * このイベントは{{#crossLink "Stage.enableMouseOver"}}{{/crossLink}}によって有効化する必要があります。
	 * イベントのプロパティ一覧については{{#crossLink "MouseEvent"}}{{/crossLink}}を参照してください。
	 * @event mouseout
	 * @since 0.6.0
	 */

	/**
	 * ステージの更新が発生するとき、ステージの上にある各表示オブジェクトに対し発行されます。
	 * これは、パスを描画する前に即座に発行されます。
	 * {{#crossLink "Stage/update"}}{{/crossLink}}が呼ばれるとき、最初にステージ上の全表示オブジェクトにtickイベントが発行され、次に全表示オブジェクトがステージに描画されます。
	 * 子は、親にイベントが発行される前に、深度順にイベントが発行されます。
	 * @event tick
	 * @param {Object} target イベントが発行されるオブジェクトです。
	 * @param {String} type イベントタイプです。
	 * @param {Array} params Stage.update()に渡された全てのパラメータが格納された配列です。
	 * 例えば、stage.update("hello")を実行した場合、paramsは["hello"]になります。
	 * @since 0.6.0
	 */

// パブリック プロパティ:
	/**
	 * 表示オブジェクトのアルファ値（透過度）です。0は完全透過であり、1が完全不透明です。
	 * @property alpha
	 * @type {Number}
	 * @default 1
	 **/
	p.alpha = 1;

	/**
	 * キャッシュがアクティブのとき、キャッシュされたこの表示オブジェクトを保持するcanvasを返します。
	 * 詳しくはcache()メソッドを参照してください。
	 * 読み取り専用
	 * @property cacheCanvas
	 * @type {HTMLCanvasElement | Object}
	 * @default null
	 **/
	p.cacheCanvas = null;

	/**
	 * この表示オブジェクトの一意なIDです。
	 * いくつかの用途において便利に使えます。
	 * Unique ID for this display object. Makes display objects easier for some uses.
	 * @property id
	 * @type {Number}
	 * @default -1
	 **/
	p.id = -1;

	/**
	 * Stage.getObjectsUnderPoint()が実行されるときおよびマウス操作に対しこのオブジェクトを対象にするか否かを指定します。
	 * Containerでtrueにした場合、子のmouseEnabledがtrueであったとしてもContainerが返ります。
	 * @property mouseEnabled
	 * @type {Boolean}
	 * @default true
	 **/
	p.mouseEnabled = true;

	/**
	 * 表示オブジェクトに任意でつけられる名前です。toString()に含まれます。デバッグに役立ちます。
	 * @property name
	 * @type {String}
	 * @default null
	 **/
	p.name = null;

	/**
	 * この表示オブジェクトを含むContainerあるいはStageオブジェクトです。
	 * 何にも追加されていない場合nullを返します。
	 * 読み取り専用
	 * @property parent
	 * @final
	 * @type {Container}
	 * @default null
	 **/
	p.parent = null;

	/**
	 * この表示オブジェクトの登録点のx座標です。
	 * 例えば、100x100pxのBitmapを中心点の周りで回転させたいとき、regXとregYを50に設定します。
	 * @property regX
	 * @type {Number}
	 * @default 0
	 **/
	p.regX = 0;

	/**
	 * この表示オブジェクトの登録点のy座標です。
	 * 例えば、100x100pxのBitmapを中心点の周りで回転させたいとき、regXとregYを50に設定します。
	 * @property regY
	 * @type {Number}
	 * @default 0
	 **/
	p.regY = 0;

	/**
	 * この表示オブジェクトの回転角（度単位）です。
	 * @property rotation
	 * @type {Number}
	 * @default 0
	 **/
	p.rotation = 0;

	/**
	 * この表示オブジェクトの水平方向のスケール値です。
	 * 例えば、scaleXを2に設定した場合、幅が2倍に表示されます。
	 * @property scaleX
	 * @type {Number}
	 * @default 1
	 **/
	p.scaleX = 1;

	/**
	 * この表示オブジェクトの垂直方向のスケール値です。
	 * 例えば、scaleYを0.5に設定した場合、高さが半分に表示されます。
	 * @property scaleY
	 * @type {Number}
	 * @default 1
	 **/
	p.scaleY = 1;

	/**
	 * この表示オブジェクトの水平方向の斜傾倍率です。
	 * @property skewX
	 * @type {Number}
	 * @default 0
	 **/
	p.skewX = 0;

	/**
	 * この表示オブジェクトの垂直方向の斜傾倍率です。
	 * @property skewY
	 * @type {Number}
	 * @default 0
	 **/
	p.skewY = 0;

	/**
	 * この表示オブジェクトに描画する影を定義する影オブジェクトです。
	 * 影を削除する場合はnullを設定してください。
	 * nullの場合、このプロパティは親のコンテナから継承されます。
	 * @property shadow
	 * @type {Shadow}
	 * @default null
	 **/
	p.shadow = null;

	/**
	 * この表示オブジェクトをcanvasに描画するか否か、Stage.getObjectsUnderPoint()実行時に含まれるべきか否かを指定します。
	 * Stage.getObjectsUnderPoint().
	 * @property visible
	 * @type {Boolean}
	 * @default true
	 **/
	p.visible = true;

	/**
	 * この表示オブジェクトのx（水平）座標値です。親からの相対座標です。
	 * @property x
	 * @type {Number}
	 * @default 0
	 **/
	p.x = 0;

	/**
	 * この表示オブジェクトのy（垂直）座標値です。親からの相対座標です。
	 * @property y
	 * @type {Number}
	 * @default 0
	 **/
	p.y = 0;

	/**
	 * この表示オブジェクトのピクセルを背後にあるものと合成する方法を指定します。
	 * nullのときは親コンテナの値を継承します。
	 * 詳しくは、<a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#compositing">
	 * whatwgの合成についての仕様</a>を参照してください。
	 * @property compositeOperation
	 * @type {String}
	 * @default null
	 **/
	p.compositeOperation = null;

	/**
	 * 表示オブジェククトのx値とy値をステージ描画前に丸めるか否かを指定します。
	 * ピクセルにスナッピングすることにより、より鮮明で高速な画像（例えばBitmapやキャッシュされたオブジェクト）の描画が可能になります。
	 * ステージのsnapPixelsEnabledがtrueに設定されている時のみ有効です。
	 * snapToPixelプロパティはBitmapとBitmapAnimationにおいてデフォルトでtrueであり、その他の表示オブジェクトではデフォルトでfalseです。
	 * <br/><br/>
	 * 注意:丸まるのは表示オブジェクトのローカルな位置のみでです。
	 * 表示オブジェクトの全ての先祖（先祖コンテナ）がピクセルにスナッピングされているようにすべきです。
	 * 先祖のsnapToPixelプロパティをtrueに設定することによりそれが可能になります。
	 * @property snapToPixel
	 * @type {Boolean}
	 * @default false
	 * @deprecated 最近のブラウザのハードウェアアクセラレーションにより不要になっています。
	 **/
	p.snapToPixel = false;

	/**
	 * onPressコールバックはユーザが表示オブジェクト上でマウスを押下したときに呼ばれます。
	 * ハンドラには対応するMouseEventインスタンスを格納したパラメータがひとつ渡されます。
	 * onMouseMoveやonMouseUpコールバックを使うことでユーザがマウスボタンを離すまでにそれらのイベントを受け取ることができます。
	 * onPressハンドラがコンテナに設定された場合、子がクリックされた場合にイベントを受け取ります。
	 * @property onPress
	 * @type {Function}
	 * @deprecated "mousedown"イベントを推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onPress = null;

	/**
	 * onClickコールバックはユーザが表示オブジェクト上でマウスを押下し離したときに呼ばれます。
	 * ハンドラには対応するMouseEventインスタンスを格納したパラメータがひとつ渡されます。
	 * onClickハンドラがコンテナに設定された場合、子がクリックされた場合にイベントを受け取ります。
	 * @property onClick
	 * @type {Function}
	 * @deprecated "click"イベントを推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onClick = null;

	/**
	 * onDoubleClickコールバックはユーザが表示オブジェクト上でダブルクリックしたときに呼ばれます。
	 * ハンドラには対応するMouseEventインスタンスを格納したパラメータがひとつ渡されます。
	 * onDoubleClickハンドラがコンテナに設定された場合、子がダブルクリックされた場合にイベントを受け取ります。
	 * @property onDoubleClick
	 * @type {Function}
	 * @deprecated "dblClick"イベントを推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onDoubleClick = null;

	/**
	 * onMouseOverコールバックはユーザが表示オブジェクト上にマウスを侵入させたときに呼ばれます。
	 * このイベントを有効化するにはstage.enableMouseOver()を呼ばねばなりません。
	 * ハンドラには対応するMouseEventインスタンスを格納したパラメータがひとつ渡されます。
	 * @property onMouseOver
	 * @type {Function}
	 * @deprecated "mouseover"イベントを推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onMouseOver = null;

	/**
	 * onMouseOverコールバックはユーザが表示オブジェクト上からマウスを外に出したときに呼ばれます。
	 * このイベントを有効化するにはstage.enableMouseOver()を呼ばねばなりません。
	 * ハンドラには対応するMouseEventインスタンスを格納したパラメータがひとつ渡されます。
	 * @property onMouseOut
	 * @type {Function}
	 * @deprecated "mouseout"イベントを推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onMouseOut = null;

	/**
	 * onTickコールバックはステージが更新されるときにステージ上の各表示オブジェクトに対して呼ばれます。
	 * これはパスを描画する前に即座に発生します。
	 * stage.update()が呼ばれるとき、最初にステージ上の全表示オブジェクトに対しonTickメソッドが呼ばれ、次に全表示オブジェクトがステージに描画されます。
	 * 子は、親のonTickメソッドが呼ばれる前に、深度順にonTickが呼び出されます。
	 * <br/><br/>
	 * stage.update()に渡された全てのパラメータがonTick()ハンドラに渡されます。
	 * 例えば、stage.update("hello")が呼ばれた時、全表日オブジェクトに対してonTick("hello")が呼ばれます。
	 * @property onTick
	 * @type {Function}
	 * @deprecated "tick"イベントを推奨します。将来のバージョンで削除されるでしょう。
	 */
	p.onTick = null;

	/**
	 * この表示オブジェクトに適用するFilterオブジェクトの配列です。
	 * Filterはcache()あるいはupdateCache()が呼ばれた時のみ適用/更新され、キャッシュされた領域にのみ適用されます。
	 * @property filters
	 * @type {Array}
	 * @default null
	 **/
	p.filters = null;

	/**
	* この表示オブジェクトの現在のキャッシュを一意に識別するIDを返します。
	* これは、前回のチェックからキャッシュが更新されたかどうかの判定に使用することができます。
	* @property cacheID
	* @type {Number}
	* @default 0
	*/
	p.cacheID = 0;

	/**
	 * この表示オブジェクトのベクターマスク（クリッピングパス）であるShapeインスタンスです。
	 * (シェイプオブジェクト自身がこの表示オブジェクトの親の子であるかのように)シェイプの変形は表示オブジェクトの親の座標に対し相対的に行われます。
	 * @property mask
	 * @type {Shape}
	 * @default null
	 */
	p.mask = null;

	/**
	 * マウス操作あるいはgetObjectsUnderPointで検査に使われる表示オブジェクトです。
	 * ヒットエリアの変形はこの表示オブジェクトの座標に対して相対的に（あたかもこの表示オブジェクトの子であるかのようにregX/Yに対して相対的に）行われます。
	 * hitAreaは現在hitTest()メソッドに使われて”いません”。
	 *
	 * 特記事項として、hitAreaはStageではサポートされていません。
	 * @property hitArea
	 * @type {DisplayObject}
	 * @default null
	 */
	p.hitArea = null;

	/**
	 * ユーザが表示オブジェクト上でホバーしているときに表示されるCSSカーソル（例えば”ポインタ”、”ヘルプ”、”文字列”など）です。
	 * このプロパティを使うには、stage.enableMouseOver()を用いてmouseoverを有効化する必要があります。
	 * nullの場合はデフォルトカーソルが使われます。
	 * @property cursor
	 * @type {String}
	 * @default null
	 */
	p.cursor = null;


// ミックスイン:
	// EventDispatcherメソッド:
	p.addEventListener = null;
	p.removeEventListener = null;
	p.removeAllEventListeners = null;
	p.dispatchEvent = null;
	p.hasEventListener = null;
	p._listeners = null;
	createjs.EventDispatcher.initialize(p); // EventDispatcherのメソッドを注入する。


// プライベートプロパティ:

	/**
	 * @property _cacheOffsetX
	 * @protected
	 * @type {Number}
	 * @default 0
	 **/
	p._cacheOffsetX = 0;

	/**
	 * @property _cacheOffsetY
	 * @protected
	 * @type {Number}
	 * @default 0
	 **/
	p._cacheOffsetY = 0;

	/**
	 * @property _cacheScale
	 * @protected
	 * @type {Number}
	 * @default 1
	 **/
	p._cacheScale = 1;

	/**
	* @property _cacheDataURLID
	* @protected
	* @type {Number}
	* @default 0
	*/
	p._cacheDataURLID = 0;

	/**
	* @property _cacheDataURL
	* @protected
	* @type {String}
	* @default null
	*/
	p._cacheDataURL = null;

	/**
	 * @property _matrix
	 * @protected
	 * @type {Matrix2D}
	 * @default null
	 **/
	p._matrix = null;


// コンストラクタ:
	// 子クラスからすぐに探し出せるように分離している:

	/**
	 * 初期化メソッドです。
	 * @method initialize
	 * @protected
	*/
	p.initialize = function() {
		this.id = createjs.UID.get();
		this._matrix = new createjs.Matrix2D();
	}

// パブリックメソッド:
	/**
	 * 表示オブジェクトがcanvas描画において可視か否かをtrueあるいはfalseで返します。
	 * ステージの範囲内で可視か否かではありません。
	 * 注意: このメソッドは主に内部での使用を意図したものですが、高度な使用において役に立つでしょう。
	 * @method isVisible
	 * @return {Boolean} Boolean 表示オブジェクトがcanvas描画において可視か否かです。
	 **/
	p.isVisible = function() {
		return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0);
	}

	/**
	 * 表示オブジェクトを、visible, alpha, shadow, そしてtransformの設定を無視して、指定されたコンテキストで描画します。
	 * 描画された場合にtrueを返します（機能をオーバーライドする場合に有用です）。
	 * 注意: このメソッドは主に内部での使用を意図したものですが、高度な使用において役に立つでしょう。
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx canvas2Dコンテキストオブジェクトです。
	 * @param {Boolean} ignoreCache 描画において保存しているキャッシュを無視するか否かを指定します。
	 * 例えば、キャッシュを再構築するのに使われます。（既存のキャッシュが再利用されるのを防ぐために）
	 **/
	p.draw = function(ctx, ignoreCache) {
		var cacheCanvas = this.cacheCanvas;
		if (ignoreCache || !cacheCanvas) { return false; }
		var scale = this._cacheScale;
		ctx.drawImage(cacheCanvas, this._cacheOffsetX, this._cacheOffsetY, cacheCanvas.width/scale, cacheCanvas.height/scale);
		return true;
	}

	/**
	 * この表示オブジェクトの変形、α値、globalCompositeOperation、クリッピングパス（マスク）、shadowを指定されたコンテキストに適用します。
	 * 典型的には描画前に呼ばれます。
	 * @method updateContext
	 * @param {CanvasRenderingContext2D} ctx 更新するcanvas2Dコンテキストオブジェクトです。
	 **/
	p.updateContext = function(ctx) {
		var mtx, mask=this.mask, o=this;

		if (mask && mask.graphics && !mask.graphics.isEmpty()) {
			mtx = mask.getMatrix(mask._matrix);
			ctx.transform(mtx.a,  mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);

			mask.graphics.drawAsPath(ctx);
			ctx.clip();

			mtx.invert();
			ctx.transform(mtx.a,  mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
		}

		mtx = o._matrix.identity().appendTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation, o.skewX, o.skewY, o.regX, o.regY);
		// TODO: should be a better way to manage this setting. For now, using dynamic access to avoid circular dependencies:
		if (createjs["Stage"]._snapToPixelEnabled && o.snapToPixel) { ctx.transform(mtx.a,  mtx.b, mtx.c, mtx.d, mtx.tx+0.5|0, mtx.ty+0.5|0); }
		else { ctx.transform(mtx.a,  mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty); }
		ctx.globalAlpha *= o.alpha;
		if (o.compositeOperation) { ctx.globalCompositeOperation = o.compositeOperation; }
		if (o.shadow) { this._applyShadow(ctx, o.shadow); }
	}

	/**
	 * 新しいcanvasに表示オブジェクトを描画し、それは今後の描画で使い続けます。
	 * 頻繁には変化しない複雑な構成物（例えば動かない多数の子を持ったContainerや複雑なShape）であれば、毎tickで描画される必要はないため、
	 * より高速な描画を可能にします。
	 * キャッシュされた表示オブジェクトは移動、回転、フェードなどを自由に行うことができますが、構成要素が変化した場合、updateCache()あるいはcache()
	 * を呼ぶことにより、手動でキャッシュを更新せねばなりません。
	 * x, y, w, hのパラメータによりキャッシュする領域を指定する必要があります。
	 * これにより表示オブジェクトの座標において描画とキャッシュを行う矩形を定義します。
	 * 例えば、0, 0を中心とした半径25の円をShapeで定義する場合、全シェイプをキャッシュするにはmyShape.cache(-25, -25, 50, 50)を呼びます。
	 * @method cache
	 * @param {Number} x キャッシュ領域のx座標です。
	 * @param {Number} x The x coordinate origin for the cache region.
	 * @param {Number} x キャッシュ領域のy座標です。
	 * @param {Number} y The y coordinate origin for the cache region.
	 * @param {Number} width キャッシュ領域の幅です。
	 * @param {Number} height キャッシュ領域の高さです。
	 * @param {Number} scale オプション。キャッシュが生成されるスケールです。
	 * 例えば、myShape.cache(0,0,100,100,2)によってベクターシェイプをキャッシュする場合、cacheCanvasは200×200ピクセルとなります。
	 * これにより、より高い再現性でスケールや回転が可能になります。
	 * デフォルト値は1です。
	 **/
	p.cache = function(x, y, width, height, scale) {
		// draw to canvas.
		scale = scale||1;
		if (!this.cacheCanvas) { this.cacheCanvas = createjs.createCanvas?createjs.createCanvas():document.createElement("canvas"); }
		this.cacheCanvas.width = Math.ceil(width*scale);
		this.cacheCanvas.height = Math.ceil(height*scale);
		this._cacheOffsetX = x;
		this._cacheOffsetY = y;
		this._cacheScale = scale||1;
		this.updateCache();
	}

	/**
	 * 表示オブジェクトをキャッシュに再描画します。
	 * updateCache()をアクティブなキャッシュを用意せずに呼んだ場合、エラーを発生させます。
	 * compositeOperationがnullの場合、現在のキャッシュは描画前にクリアされます。
	 * そうでない場合は表示オブジェクトは既存のキャッシュ上に指定したcompositeOperationに従って描画されます。
	 * @method updateCache
	 * @param {String} compositeOperation 描画に使用するcompositeOperationです。nullの場合はキャッシュをクリアし再描画します。
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#compositing">
	 * whatwgの合成についての仕様</a>.
	 **/
	p.updateCache = function(compositeOperation) {
		var cacheCanvas = this.cacheCanvas, scale = this._cacheScale, offX = this._cacheOffsetX*scale, offY = this._cacheOffsetY*scale;
		if (!cacheCanvas) { throw "cache() must be called before updateCache()"; }
		var ctx = cacheCanvas.getContext("2d");
		ctx.save();
		if (!compositeOperation) { ctx.clearRect(0, 0, cacheCanvas.width, cacheCanvas.height); }
		ctx.globalCompositeOperation = compositeOperation;
		ctx.setTransform(scale, 0, 0, scale, -offX, -offY);
		this.draw(ctx, true);
		this._applyFilters();
		ctx.restore();
		this.cacheID = DisplayObject._nextCacheID++;
	}

	/**
	 * 現在のキャッシュをクリアします
	 * 詳しくはcache()を参照してください。
	 * @method uncache
	 **/
	p.uncache = function() {
		this._cacheDataURL = this.cacheCanvas = null;
		this.cacheID = this._cacheOffsetX = this._cacheOffsetY = 0;
		this._cacheScale = 1;
	}

	/**
	* キャッシュのデータURLを返します。
	* この表示オブジェクトがキャッシュされてない場合はnullを返します。
	* キャッシュが変化していない場合に新しいデータURLが生成されていないことを確認するためにcacheIDを使用できます。
	* @method getCacheDataURL.
	**/
	p.getCacheDataURL = function() {
		if (!this.cacheCanvas) { return null; }
		if (this.cacheID != this._cacheDataURLID) { this._cacheDataURL = this.cacheCanvas.toDataURL(); }
		return this._cacheDataURL;
	}

	/**
	 * この表示オブジェクトが描画されるステージを返します。
	 * ステージに追加されていない場合はnullを返します。
	 * @method getStage
	 * @return {Stage} 表示オブジェクトがステージの子孫である場合はそのステージインスタンスです。ステージに追加されていない場合はnullです。
	 **/
	p.getStage = function() {
		var o = this;
		while (o.parent) {
			o = o.parent;
		}
		// using dynamic access to avoid circular dependencies;
		if (o instanceof createjs["Stage"]) { return o; }
		return null;
	}

	/**
	 * 指定したxとy位置をこの表示オブジェクトの座標からグローバル（ステージ）座標に変換します。
	 * 例えば、ネストされた表示オブジェクトの特定の点に貼られたHTMLラベルの位置を調べるのに使用できます。
	 * ステージ座標に変換されたxとyプロパティを持ったPointインスタンスを返します。
	 * @method localToGlobal
	 * @param {Number} x この表示オブジェクトにおける変換したいx座標です。
	 * @param {Number} y この表示オブジェクトにおける変換したいy座標です。
	 * @return {Point} ステージ座標に変換されたxとyプロパティを持ったPointインスタンスです。
	 **/
	p.localToGlobal = function(x, y) {
		var mtx = this.getConcatenatedMatrix(this._matrix);
		if (mtx == null) { return null; }
		mtx.append(1, 0, 0, 1, x, y);
		return new createjs.Point(mtx.tx, mtx.ty);
	}

	/**
	 * 指定したxとy位置をグローバル（ステージ）座標からこの表示オブジェクトの座標に変換します。
	 * 例えば、表示オブジェクト上でマウスの現在の位置を調べるのに使用出来ます。
	 * 表示オブジェクトの座標に変換されたxとyプロパティを持ったPointインスタンスを返します。
	 * @method globalToLocal
	 * @param {Number} x ステージにおける変換したいx座標です。
	 * @param {Number} y ステージにおける変換したいy座標です。
	 * @return {Point} 表示オブジェクトの座標に変換されたxとyプロパティを持ったPointインスタンスです。
	 **/
	p.globalToLocal = function(x, y) {
		var mtx = this.getConcatenatedMatrix(this._matrix);
		if (mtx == null) { return null; }
		mtx.invert();
		mtx.append(1, 0, 0, 1, x, y);
		return new createjs.Point(mtx.tx, mtx.ty);
	}

	/**
	 * 指定したxとy位置をこの表示オブジェクトの座標から指定した表示オブジェクトの座標に変換します。
	 * 指定した表示オブジェクトの座標に変換されたxとyプロパティを持ったPointインスタンスを返します。
	 * 実質的に、var pt = this.localToGlobal(x, y); pt = target.globalToLocal(pt.x, pt.y)をするのと同じです。
	 * @method localToLocal
	 * @param {Number} x この表示オブジェクトにおける変換したいx座標です。
	 * @param {Number} y この表示オブジェクトにおける変換したいy座標です。
	 * @param {DisplayObject} target 座標を変換する対象とする表示オブジェクトです。
	 * @return {Point} 指定した表示オブジェクトの座標に変換されたxとyプロパティを持ったPointインスタンスです。
	 **/
	p.localToLocal = function(x, y, target) {
		var pt = this.localToGlobal(x, y);
		return target.globalToLocal(pt.x, pt.y);
	}

	/**
	 * 表示オブジェクトに変形系のプロパティを迅速に設定するためのショートカットメソッドです。
	 * 全てのパラメータがオプションです。
	 * 省略されたパラメータはデフォルト値となります（例：x/yにおいては0、scaleX/Yにおいては1）。
	 * @method setTransform
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} scaleX
	 * @param {Number} scaleY
	 * @param {Number} rotation
	 * @param {Number} skewX
	 * @param {Number} skewY
	 * @param {Number} regX
	 * @param {Number} regY
	 * @return {DisplayObject} このインスタンスを返します。メソッドチェーンに用いることができます。
	*/
	p.setTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
		this.x = x || 0;
		this.y = y || 0;
		this.scaleX = scaleX == null ? 1 : scaleX;
		this.scaleY = scaleY == null ? 1 : scaleY;
		this.rotation = rotation || 0;
		this.skewX = skewX || 0;
		this.skewY = skewY || 0;
		this.regX = regX || 0;
		this.regY = regY || 0;
		return this;
	}

	/**
	 * このオブジェクトの変形に対応した行列を返します。
	 * @method getMatrix
	 * @param {Matrix2D} matrix このパラーメータはオプションです。計算された結果を格納するためのMatrix2Dオブジェクトです。nullの場合は新しく生成された行列オブジェクトが返されます。
	 * @return {Matrix2D} 表示オブジェクトの変形を表現する行列です。
	 **/
	p.getMatrix = function(matrix) {
		var o = this;
		return (matrix ? matrix.identity() : new createjs.Matrix2D()).appendTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation, o.skewX, o.skewY, o.regX, o.regY).appendProperties(o.alpha, o.shadow, o.compositeOperation);
	}

	/**
	 * この表示オブジェクトから最上位の祖先（通常はステージ）までの全祖先Containerの変形を全てかけあわせたMatrix2Dオブジェクトを生成します。
	 * これは、locatToGlobalやglobalToLocalのように座標空間間の座標変換に用いることができます。
	 * @method getConcatenatedMatrix
	 * @param {Matrix2D} matrix このパラーメータはオプションです。計算された結果を格納するためのMatrix2Dオブジェクトです。nullの場合は新しく生成された行列オブジェクトが返されます。
	 * @return {Matrix2D} この表示オブジェクトから最上位の祖先（通常はステージ）までの全祖先Containerの変形を全てかけあわせたMatrix2Dオブジェクトです。
	 **/
	p.getConcatenatedMatrix = function(matrix) {
		if (matrix) { matrix.identity(); }
		else { matrix = new createjs.Matrix2D(); }
		var o = this;
		while (o != null) {
			matrix.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation, o.skewX, o.skewY, o.regX, o.regY).prependProperties(o.alpha, o.shadow, o.compositeOperation);
			o = o.parent;
		}
		return matrix;
	}

	/**
	 * 表示オブジェクトが指定したローカル座標の点と重複あるいは交差しているか否かを検査します。
	 * （言い換えると、指定した点においてalpha > 0のピクセルを描画しているかを検査します）
	 * 表示オブジェクトのalpah、shadow、それとcompositeOperation、regX/Yを含んだ全ての変形系プロパティは無視して判定します。
	 * @method hitTest
	 * @param {Number} x 表示オブジェクトのローカル座標系における点のx値
	 * @param {Number} y 表示オブジェクトのローカル座標系における点のy値
	 * @return {Boolean} DisplayObjectの可視な部分が指定されたローカルな点と交差しているか否かです。
	*/
	p.hitTest = function(x, y) {
		var ctx = DisplayObject._hitTestContext;
		var canvas = DisplayObject._hitTestCanvas;

		ctx.setTransform(1,  0, 0, 1, -x, -y);
		this.draw(ctx);

		var hit = this._testHit(ctx);

		canvas.width = 0;
		canvas.width = 1;
		return hit;
	};

	/**
	 * DisplayObjectインスタンスの複数のプロパティを設定するためのチェーン可能なショートカットメソッドを提供します。
	 * 例:
	 * var shape = stage.addChild( new Shape() ).set({graphics:myGraphics, x:100, y:100, alpha:0.5});
	 * @method set
	 * @param {Object} props DisplayObjectに値をコピーするプロパティを含む汎用オブジェクトです。
	 * @return {DisplayObject} メソッドが呼ばれるDisplayObjectインスタンスを返します（メソッドチェーンに用いることができます）。
	*/
	p.set = function(props) {
		for (var n in props) { this[n] = props[n]; }
		return this;
	}

	/**
	 * DisplayObjectのクローンを返します。
	 * このConainerのクローンを返します。
	 * このインスタンスの現在のコンテキスト特有のいくつかのプロパティはデフォルト値となります（例えば.parentです）。
	 * @method clone
	 * @return {DisplayObject} 現在のDisplayObjectインスタンスのクローンです。
	 **/
	p.clone = function() {
		var o = new DisplayObject();
		this.cloneProps(o);
		return o;
	}

	/**
	 * このオブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} オブジェクトの文字列表現です。
	 **/
	p.toString = function() {
		return "[DisplayObject (name="+  this.name +")]";
	}

// プライベートメソッド:

	// 子クラスでより簡単に使えるように分離している:
	/**
	 * @method cloneProps
	 * @protected
	 * @param {DisplayObject} o 現在のDisplayObjectのプロパティをコピーしたDisplayObjectインスタンスです。
	 **/
	p.cloneProps = function(o) {
		o.alpha = this.alpha;
		o.name = this.name;
		o.regX = this.regX;
		o.regY = this.regY;
		o.rotation = this.rotation;
		o.scaleX = this.scaleX;
		o.scaleY = this.scaleY;
		o.shadow = this.shadow;
		o.skewX = this.skewX;
		o.skewY = this.skewY;
		o.visible = this.visible;
		o.x  = this.x;
		o.y = this.y;
		o.mouseEnabled = this.mouseEnabled;
		o.compositeOperation = this.compositeOperation;
		if (this.cacheCanvas) {
			o.cacheCanvas = this.cacheCanvas.cloneNode(true);
			o.cacheCanvas.getContext("2d").putImageData(this.cacheCanvas.getContext("2d").getImageData(0,0,this.cacheCanvas.width,this.cacheCanvas.height),0,0);
		}
	}

	/**
	 * @method _applyShadow
	 * @protected
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Shadow} shadow
	 **/
	p._applyShadow = function(ctx, shadow) {
		shadow = shadow || Shadow.identity;
		ctx.shadowColor = shadow.color;
		ctx.shadowOffsetX = shadow.offsetX;
		ctx.shadowOffsetY = shadow.offsetY;
		ctx.shadowBlur = shadow.blur;
	}


	/**
	 * @method _tick
	 * @protected
	 **/
	p._tick = function(params) {
		this.onTick&&this.onTick.apply(this, params);
		// because onTick can be really performance sensitive, we'll inline some of the dispatchEvent work.
		// this can probably go away at some point. It only has a noticeable impact with thousands of objects in modern browsers.
		var ls = this._listeners;
		if (ls&&ls["tick"]) { this.dispatchEvent({type:"tick",params:params}); }
	}

	/**
	 * @method _testHit
	 * @protected
	 * @param {CanvasRenderingContext2D} ctx
	 * @return {Boolean}
	 **/
	p._testHit = function(ctx) {
		try {
			var hit = ctx.getImageData(0, 0, 1, 1).data[3] > 1;
		} catch (e) {
			if (!DisplayObject.suppressCrossDomainErrors) {
				throw "An error has occurred. This is most likely due to security restrictions on reading canvas pixel data with local or cross-domain images.";
			}
		}
		return hit;
	}

	/**
	 * @method _applyFilters
	 * @protected
	 **/
	p._applyFilters = function() {
		if (!this.filters || this.filters.length == 0 || !this.cacheCanvas) { return; }
		var l = this.filters.length;
		var ctx = this.cacheCanvas.getContext("2d");
		var w = this.cacheCanvas.width;
		var h = this.cacheCanvas.height;
		for (var i=0; i<l; i++) {
			this.filters[i].applyFilter(ctx, 0, 0, w, h);
		}
	};

	/**
	 * 表示オブジェクトが指定したイベントタイプのリスナーを持っているか否かを返します。
	 * @method _hasMouseHandler
	 * @param {Number} typeMask イベントタイプを指定するビットマスクです。1はpressとclickとdouble click、2はmouse overとmouse outを指定します。
	 * この実装は変更の可能性があります。
	 * @return {Boolean}
	 * @protected
	 **/
	p._hasMouseHandler = function(typeMask) {
		var ls = this._listeners;
		return !!(
				 (typeMask&1 && (this.onPress || this.onClick || this.onDoubleClick ||
				 (ls && (this.hasEventListener("mousedown") || this.hasEventListener("click") || this.hasEventListener("dblclick")))))
				 ||
				 (typeMask&2 && (this.onMouseOver || this.onMouseOut || this.cursor ||
				 (ls && (this.hasEventListener("mouseover") || this.hasEventListener("mouseout")))))
				 );
	};


createjs.DisplayObject = DisplayObject;
}());
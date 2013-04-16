/*
 * Sound
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


// namespace:
this.createjs = this.createjs || {};

/**
 * SoundJS は web 上における音声再生を管理するためのライブラリです。
 * 実際には音声関連の実装を抽出したプラグインを介して動作するため、
 * "どんなメカニズムが必要か？"といった特殊な知識無しに、
 * どんなプラットフォーム上でも音声再生が可能です。
 *
 * 
 * SoundJS は、{{#crossLink "Sound"}}{{/crossLink}} クラスの public API を使います。この API は、以下の機能を提供します。
 * <ul><li>プラグインのインストール</li>
 *      <li>音声データの登録（と事前読み込み(preload)）</li>
 *      <li>音声データの再生</li>
 *      <li>再生中の全音声の音量、消音、停止の操作</li>
 * </ul>
 *
 * <b>version 0.4.0 の時点では "SoundJS"オブジェクトはバージョン情報の提供しかしません。
 * SoundJS の全機能は、"Sound" クラスから提供される事に注意して下さい。
 *
 * <b>音の操作</b><br />
 * 音声を再生すると "SoundInstance" インスタンスが生成されます。このインスタンスを通じて個々の音に対する操作が可能です。
 * <ul><li>再生音声の一時停止、一時停止の解除, 停止</li>
 *      <li>再生音声の音量、消音、定位の操作</li>
 *      <li>音声再生の終了時、ループ時、失敗時のイベントハンドリング</li>
 * </ul>
 *
 * <h4>機能実装例</h4>
 *      createjs.Sound.addEventListener("loadComplete", createjs.proxy(this.loadHandler, this));
 *      createjs.Sound.registerSound("path/to/mySound.mp3|path/to/mySound.ogg", "sound");
 *      function loadHandler(event) {
 *          // この関数は、各音声データが登録されるたびに呼び出されます。
 *          var instance = createjs.Sound.play("sound");  // IDを用いて再生します。sourceを用いる事もできます。
 *          instance.addEventListener("playComplete", createjs.proxy(this.handleComplete, this));
 *          instance.setVolume(0.5);
 *      }
 *
 * @module SoundJS
 * @main SoundJS
 */

(function () {

    //TODO: Interface to validate plugins and throw warnings
    //TODO: Determine if methods exist on a plugin before calling  // OJR this is only an issue if something breaks or user changes something
    //TODO: Interface to validate instances and throw warnings
    //TODO: Surface errors on audio from all plugins
    //TODO: Timeouts  // OJR for?
    /**
     * Sound クラスは、音の生成、全体の音量コントロール、プラグインの管理のための public API を提供します。
     * このクラスの全ての Sound API は static メンバです。
     *
     * <b>登録と事前読み込み(preload)</b><br />
     * 音を再生する前には、<b>必ず</b>登録を行わなければなりません。音の登録は、{{#crossLink "Sound/registerSound"}}{{/crossLink}} メソッドを呼び出すか、
     * 複数の音源に対して{{#crossLink "Sound/registerManifest"}}{{/crossLink}} メソッドを呼び出す事で行います。
     * すぐに登録しない場合でも、{{#crossLink "Sound/play"}}{{/crossLink}} メソッドで音の再生を試みるか、
     * {{#crossLink "Sound/createInstance"}}{{/crossLink}} メソッドで再生せずに音源を生成すると、自動的に登録されます。
     * また、<a href="http://preloadjs.com" target="_blank">PreloadJS</a>を用いた場合は、音源の読み込み完了時に自動的に登録します。
     * 内部ですでに読み込んだ音源を用いる場合は登録用メソッドを用い、外部から読み込む場合は PreloadJS を用いる事をおすすめします。
     * これにより、すぐに使用できるようになります。
     *
     * <b>再生</b><br />
     * 読み込みと登録が完了した音源を一度再生するには、{{#crossLink "Sound/play"}}{{/crossLink}}メソッドを用います。
     * このメソッドは、一時停止、一時停止の解除、消音などが行える {{#crossLink "SoundInstance"}}{{/crossLink}} を返します。
     * コントロール用APIについて、より詳しい解説は{{#crossLink "SoundInstance"}}{{/crossLink}}を参照下さい。
     *
     * <b>プラグイン</b><br />
     * デフォルトでは、{{#crossLink "WebAudioPlugin"}}{{/crossLink}} か {{#crossLink "HTMLAudioPlugin"}}{{/crossLink}} 
     * が（利用可能であれば）用いられます。一方、開発者はプラグインの優先度を変更したり、
     * 新たなプラグイン（たとえば{{#crossLink "FlashPlugin"}}{{/crossLink}}のような）を追加する事ができます。
     * プラグインや再生 API について、より詳しい解説は{{#crossLink "Sound"}}{{/crossLink}}を参照下さい。
     * また、プラグインをインストールしたり、新たなプラグインの優先度を指定する場合は、
     * {{#crossLink "Sound/installPlugins"}}{{/crossLink}} を参照下さい。
     *
     * <h4>実装例</h4>
     *      createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.FlashPlugin]);
     *      createjs.Sound.addEventListener("loadComplete", createjs.proxy(this.loadHandler, (this));
     *      createjs.Sound.registerSound("path/to/mySound.mp3|path/to/mySound.ogg", "sound");
     *      function loadHandler(event) {
     *          // この関数は音源が登録されるたびに呼び出されます。
     *          var instance = createjs.Sound.play("sound");  // IDを用いて再生します。sourceを用いる事もできます。
     *          instance.addEventListener("playComplete", createjs.proxy(this.handleComplete, this));
     *          instance.setVolume(0.5);
     *      }
     *
     * 一度に再生できる同じ音インスタンスの最大数は、{{#crossLink "Sound/registerSound"}}{{/crossLink}}メソッドの引数""data"で指定できます。
     *
     *      createjs.Sound.registerSound("sound.mp3", "soundId", 4);
     *
     * Sound クラスは、PreloadJSで音源の事前読み込み(preload)を行う際のプラグインとしても使用できます。
     * PreloadJS を用いて読み込んだ音源は、Sound クラスによって自動的に登録されます。
     * 音源を事前に読み込んでいない場合は(When audio is not preloaded)、Sound クラスが内部で事前読み込み(internal preload)を行うため、
     * play メッソドが呼び出されると同時に音が再生されない可能性があります。
     * {{#crossLink "Sound/loadComplete"}}{{/crossLink}}イベントを用いれば、内部的に音源の読み込みが完了したタイミングをとる事ができます。
     * 再生の前に全ての音源の読み込みを完了させてある方が望ましいです。
     *
     *      createjs.PreloadJS.installPlugin(createjs.Sound);
     *
     * <h4>ブラウザ/OSにおける既知の問題点</h4>
     * <b>IE9 html Audio の珍奇な振舞い</b><br />
     * IE9 では、一度再生を開始してしまうと、タグでの音量の変更に遅延が生じる事がわかっています。
     * このため全音を消音したとしても、内部で消音が適用されるまでのこの遅延の間は、音が再生され続けます。
     * これは、どこで、どのように音量変更を適用したとしても、タグが音再生に必要な以上、必ず起こります。
     *
     * <b>iOS 6 の制限</b><br />
     * <ul><li>音は初期状態では消音されており、一度ユーザーイベント(タッチイベント)内で再生しないと消音は解除されません。</li>
     *     <li>反対意見にもかかわらず、SoundJSでは音量は内部の GainNode を用いて操作しています。</li></ul>
     *      <li>(Despite suggestions to the opposite, we have control over audio volume through our gain nodes.)</li></ul>
     * 詳細(英語): http://stackoverflow.com/questions/12517000/no-sound-on-ios-6-web-audio-api
     *
     * <b>Android の制限</b><br />
     * <ul><li>Android Chrome は createjs.Sound.BrowserDetect.isChrome で true を返しますが、異なった処理能力を持った異なったブラウザです。</li>
     *      <li>SoundJS で音量操作はできません。ユーザーが端末上でのみ音量を設定できます。</li>
     *      <li>ユーザーイベント(タッチイベント)内でのみ音の再生ができます。これはつまり、現状ループ再生ができません。</li>
     *
     * @class Sound
     * @static
     * @uses EventDispatcher
     */
    function Sound() {
        throw "Sound cannot be instantiated";
    }

    var s = Sound;

    /**
     * 複数の音源のパス文字列を区切るための文字です
     * @property DELIMITER
     * @type {String}
     * @default |
     * @static
     */
    s.DELIMITER = "|";

    /**
     * タイムアウトを検出する時間をミリ秒で指定します（訳注; ソース内に TODO として"実装されてない" と記述されています）
     * @property AUDIO_TIMEOUT
     * @static
     * @type {Number}
     * @default 8000
     */
    s.AUDIO_TIMEOUT = 8000; // TODO: This is not implemeneted  // OJR remove property?

    /**
     * 「すでに最大同時再生音数に達していた場合、同じ音源ファイルで再生中のどれかの音を中断する」INTERRUPT値(interrupt value)です。
     * @property INTERRUPT_ANY
     * @type {String}
     * @default any
     * @static
     */
    s.INTERRUPT_ANY = "any";

    /**
     * 「すでに最大同時再生音数に達していた場合、同じ音源ファイルで再生した時間が最短の音を中断する」INTERRUPT値(interrupt value)です。
     * @property INTERRUPT_EARLY
     * @type {String}
     * @default early
     * @static
     */
    s.INTERRUPT_EARLY = "early";

    /**
     * 「すでに最大同時再生音数に達していた場合、同じ音源ファイルで再生した時間が最長の音を中断する」INTERRUPT値(interrupt value)です。
     * @property INTERRUPT_LATE
     * @type {String}
     * @default late
     * @static
     */
    s.INTERRUPT_LATE = "late";

    /**
     * 「すでに最大同時再生音数に達していた場合でも、同じ音源ファイルで再生中の音は中断しない（訳注；新たな音は再生されず、失敗します）」INTERRUPT値(interrupt value)です。
     * @property INTERRUPT_NONE
     * @type {String}
     * @default none
     * @static
     */
    s.INTERRUPT_NONE = "none";

// The playState in plugins should be implemented with these values.
    /**
     * 「すでに初期化が完了した状態」の playState 値です。
     * @property PLAY_INITED
     * @type {String}
     * @default playInited
     * @static
     */
    s.PLAY_INITED = "playInited";

    /**
     * 「再生または一時停止中」の playState 値です。
     * @property PLAY_SUCCEEDED
     * @type {String}
     * @default playSucceeded
     * @static
     */
    s.PLAY_SUCCEEDED = "playSucceeded";

    /**
     * 「他のインスタンスで中断した」の playState 値です。
     * @property PLAY_INTERRUPTED
     * @type {String}
     * @default playInterrupted
     * @static
     */
    s.PLAY_INTERRUPTED = "playInterrupted";

    /**
     * 「最後まで再生した」の playState 値です。
     * @property PLAY_FINISHED
     * @type {String}
     * @default playFinished
     * @static
     */
    s.PLAY_FINISHED = "playFinished";

    /**
     * 「再生に失敗した」の playState 値です。これは通常、「interrupt modeがINTERRUPT_NONEで再生チャンネルが足りなくなった」
     * 「再生が延滞している」「音源ファイルが見つからない」場合に設定されます。
     * @property PLAY_FAILED
     * @type {String}
     * @default playFailed
     * @static
     */
    s.PLAY_FAILED = "playFailed";

    /**
     * デフォルトでSound クラスが再生<i>しようと試みる</i>拡張子リストです。
     * プラグインはブラウザがこれらのタイプの再生に対応しているかチェックします。
     * つまり、プラグインが初期化される前にこのリストを編集することで、サポートするメディアタイプを追加することができます。
     *
     * 注意; 現在、このリストは {{#crossLink "FlashPlugin"}}{{/crossLink}} では動きません。
     *
     * より詳しい解説は http://en.wikipedia.org/wiki/Audio_file_format にあります。
     * すごく詳しいファイルフォーマットのリストはここにあります http://www.fileinfo.com/filetypes/audio 。
     * フォーマット拡張子の有用なリストはここにあります http://html5doctor.com/html5-audio-the-state-of-play/ 。
     * @property SUPPORTED_EXTENSIONS
     * @type {Array[String]}
     * @default ["mp3", "ogg", "mpeg", "wav", "m4a", "mp4", "aiff", "wma", "mid"]
     */
    s.SUPPORTED_EXTENSIONS = ["mp3", "ogg", "mpeg", "wav", "m4a", "mp4", "aiff", "wma", "mid"];  // OJR does not currently support FlashPlugin

    /**
     * 「再生のために他の拡張子を使用する」拡張子のマップです（codexなど）。このプロパティで、サポートする拡張子の対応表を作れるため、
     * プラグインはその拡張子をサポートしているかどうかを正確に判断する事ができます。このリストに追加することで、
     * プラグインはその拡張しをサポートしているかをより正確に判断する事ができます。
     * @property EXTENSION_MAP
     * @type {Object}
     * @since 0.4.0
     */
    s.EXTENSION_MAP = {
        m4a:"mp4"
    };

    /**
     * ファイルのURIを解析するための正規表現です。この正規表現は、「単純なファイル名」から「query 付きフルドメインURL」まで対応しています。
     * マッチング結果は protocol:$1、domain:$2、path:$3、file:$4、extension:$5、query string:$6 です。
     * @property FILE_PATTERN
     * @type {RegExp}
     * @static
     * @private
     */
    s.FILE_PATTERN = /(\w+:\/{2})?((?:\w+\.){2}\w+)?(\/?[\S]+\/|\/)?([\w\-%\.]+)(?:\.)(\w+)?(\?\S+)?/i;

    /**
     * すでに最大同時再生音数に達していた場合、同じ音源ファイルで現在再生中の音の中断について、デフォルトの挙動を定義します。
     * 現在のデフォルト値は、<code>Sound.INTERRUPT_NONE</code>ですが、この値を差し替えて、再生時の挙動を変更することができます。
     * この値は、{{#crossLink "Sound/play"}}{{/crossLink}} メソッドが INTERRUPT値を指定せずに呼び出された場合のみ適用されます。
     * (訳注;ソース内に「要検討」として「INTERRUPT_ANYの方が妥当ではないか？どちらが妥当かはゲーム開発におけるテストが必要」と書かれています)
     * @property defaultInterruptBehavior
     * @type {String}
     * @default none
     * @static
     * @since 0.4.0
     */
    s.defaultInterruptBehavior = s.INTERRUPT_NONE;  // OJR does s.INTERRUPT_ANY make more sense as default?  Needs game dev testing to see which case makes more sense.

    /**
     * 各 SoundInstance に一意のIDを振るために内部で使用します。
     * @property lastID
     * @type {Number}
     * @static
     * @private
     */
    s.lastId = 0,

    /**
     * 現在使用中のプラグインです。この値が null の場合、プラグインは初期化されていません。
     * プラグインが指定されていない場合、Sound クラスは、デフォルトのプラグイン ({{#crossLink "WebAudioPlugin"}}{{/crossLink}}でダメなら
     * {{#crossLink "HTMLAudioPlugin"}}{{/crossLink}})を適用しようと試みます。
     * @property activePlugin
     * @type {Object}
     * @static
     */
    s.activePlugin = null;

    /**
     * プラグインが登録されたかどうかを示します。false の場合、最初の play() 呼び出しで、デフォルトのプラグイン
     * ({{#crossLink "WebAudioPlugin"}}{{/crossLink}}でダメなら{{#crossLink "HTMLAudioPlugin"}}{{/crossLink}}) がインスタンス化されます。
     * プラグインはすでに登録されているが、適切ではない場合、音再生に失敗します。
     * @property pluginsRegistered
     * @type {Boolean}
     * @default false
     * @static
     * @private
     */
    s.pluginsRegistered = false;

    /**
     * マスターボリュームです。{{#crossLink "Sound/getVolume"}}{{/crossLink}} と {{#crossLink "Sound/setVolume"}}{{/crossLink}} を用いて、
     * 全ての音の音量を変更します。
     * @property masterVolume
     * @type {Number}
     * @default 1
     * @private
     * @since 0.4.0
     */
    s.masterVolume = 1;

    /**
     * マスターミュートです。この値は全ての Sound インスタンスに適用されます。{{#crossLink "Sound/setMute"}}{{/crossLink}}を用いて設定し、{{#crossLink "Sound/getMute"}}{{/crossLink}}を用いてアクセスします。
     * @property masterMute
     * @type {Boolean}
     * @default false
     * @private
     * @static
     * @since 0.4.0
     */
    s.masterMute = false;

    /**
     * 現在再生中の全インスタンスを含む配列です。このプロパティは{{#crossLink "Sound/stop"}}{{/crossLink}}や{{#crossLink "Sound/setVolume"}}{{/crossLink}}といった
     * static API で、Sound クラスが全インスタンスの音量、消音、再生などをコントロールする際に用いられます。
     * インスタンスが再生を終了すると、{{#crossLink "Sound/finishedPlaying"}}{{/crossLink}} メソッドでこの配列から削除されます。
     * インスタンスをもう一度再生させると、{{#crossLink "Sound/beginPlaying"}}{{/crossLink}} メソッドでこの配列に再び追加されます。
     * @property instances
     * @type {Array}
     * @private
     * @static
     */
    s.instances = [];

    /**
     * ID から音源を探し出すためのハッシュテーブルです。
     * @property idHash
     * @type {Object}
     * @private
     * @static
     */
    s.idHash = {};

    /**
     * プラグインに渡す音源のソースから事前読み込み中の音源を探し出すためのハッシュテーブルです。
     * ユーザーから渡されたソース、ID、データを含んでいます。複数のソース、ID、データを保持できます。
     * @property preloadHash
     * @type {Object}
     * @private
     * @static
     */
    s.preloadHash = {};

    /**
     * 音の再生に失敗した場合、替わりに使用するオブジェクトです。これにより、開発者は音の再生が成功したかどうかを確認する事無く、
     * 連続して失敗したインスタンスのメソッドを呼び出すことができます。このインスタンスはメモリ使用量を抑えるため、
     * 一回だけ生成され共有されます。
     * @property defaultSoundInstance
     * @type {Object}
     * @protected
     * @static
     */
    s.defaultSoundInstance = null;

// mix-ins:
    // EventDispatcher methods:
    s.addEventListener = null;
    s.removeEventListener = null;
    s.removeAllEventListeners = null;
    s.dispatchEvent = null;
    s.hasEventListener = null;
    s._listeners = null;

    createjs.EventDispatcher.initialize(s); // inject EventDispatcher methods.


// Events
    /**
     * このイベントは、内部で読み込みが完了した時に発行されます。このイベントは、各 Sound の読み込みが完了する度に発行されるため、
     * 特定の音を操作したい場合は、ハンドラメソッド内で <code>event.src</code> を確認する必要があります。
     * @event loadComplete
     * @param {Object} target イベントを発行したオブジェクトです。
     * @param {String} type イベントタイプです。
     * @param {String} src 音のソースです。デリミタで区切られたソースの場合、読み込みに成功したソースのみ、このイベントを返します。
     * @param {String} [id] 音が内部で登録された時に発行されるIDです。発行されていない場合、null になります。
     * @param {Number|Object} [data] このアイテムに関連付けられた追加データです。追加データが無い場合、undefined になります。
     * @since 0.4.0
     */

// Callbacks
    /**
     * このコールバックは、内部でファイルの読み込みが完了した時に呼び出されます。
     * @property onLoadComplete
     * @type {Function}
     * @deprecated "loadComplete" イベントの使用を推奨します。将来のバージョンで削除される可能性があります。
     * @since 0.4.0
     */
    s.onLoadComplete = null;

    /**
     * @method sendLoadComplete
     * @param {String} src 読み込みが完了したイベントが発行されるべき Sound ファイルです。
     * @private
     * @static
     * @since 0.4.0
     */
    s.sendLoadComplete = function (src) {
        if (!s.preloadHash[src]) {
            return;
        }
        for (var i = 0, l = s.preloadHash[src].length; i < l; i++) {
            var item = s.preloadHash[src][i];
            var event = {
                target:this,
                type:"loadComplete",
                src:item.src, // OJR LM thinks this might be more consistent if it returned item like PreloadJS
                id:item.id,
                data:item.data
            };
            s.preloadHash[src][i] = true;
            s.onLoadComplete && s.onLoadComplete(event);
            s.dispatchEvent(event);
        }
    }

    /**
     * Soundクラスを<a href="http://preloadjs.com" target="_blank">PreloadJS</a>のプラグインとして使用できるように、preloadルールを返します。
     * 適合したタイプや拡張子を持った読み込みは、コールバック関数を呼び出して、Soundクラスで変更可能な返値オブジェクトを使用します。
     * これは、正しいパスの特定や、Soundクラスで音源インスタンスを登録するといった際に、利用されます。
     * このメソッドは PreloadJS 以外からは、呼び出されるべきではありません。
     * @method getPreloadHandlers
     * @return {Object} 以下の情報を持ったオブジェクトです:
     * <ul><li>callback: ファイルが PreloadJS に読み込まれた時に呼び出される関数で、読み込みパラメータの修正、正しいファイルフォーマットの選択、
     *      音源の登録などといった、Soundクラスの様々な機構を提供します。</li>
     *      <li>types: Sound クラスがサポートするファイルタイプのリストです (現在は "sound" 型をサポートしています)。</li>
     *      <li>extensions: Sound クラスがサポートするファイル拡張子ののリストです(Sound.SUPPORTED_EXTENSIONSを参照下さい)。</li></ul>
     * @static
     * @protected
     */
    s.getPreloadHandlers = function () {
        return {
            callback:createjs.proxy(s.initLoad, s),
            types:["sound"],
            extensions:s.SUPPORTED_EXTENSIONS
        };
    }

    /**
     * Sound クラスのプラグインを登録します。プラグインは実際の音の再生を担当します。デフォルトプラグインは、
     * ({{#crossLink "WebAudioPlugin"}}{{/crossLink}} で失敗したら {{#crossLink "HTMLAudioPlugin"}}{{/crossLink}})
     * で、ユーザーが音再生時に他のプラグインが存在していなければインストールされます。
     * <h4>例</h4>
     *      createjs.FlashPlugin.BASE_PATH = "../src/SoundJS/";
     *      createjs.Sound.registerPlugin(createjs.FlashPlugin);
     *
     * 複数のプラグインを登録したい場合は、{{#crossLink "Sound/registerPlugins"}}{{/crossLink}}を使ってください。
     *
     * @method registerPlugin
     * @param {Object} plugin インストールするプラグインのクラスです。
     * @return {Boolean} プラグインの初期化に成功したかを返します。
     * @static
     */
    s.registerPlugin = function (plugin) {
        s.pluginsRegistered = true;
        if (plugin == null) {
            return false;
        }
        // Note: Each plugin is passed in as a class reference, but we store the activePlugin as an instance
        if (plugin.isSupported()) {
            s.activePlugin = new plugin();
            //TODO: Check error on initialization
            return true;
        }
        return false;
    }

    /**
     * Sound クラスプラグインを、リストの順番に登録します。単一のプラグインを登録する場合は、
     * {{#crossLink "Sound/registerPlugin"}}{{/crossLink}}を使用してください。
     *
     * <h4>例</h4>
     *      createjs.FlashPlugin.BASE_PATH = "../src/SoundJS/";
     *      createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
     *
     * @method registerPlugins
     * @param {Array} plugins インストールするプラグインクラスの配列です。
     * @return {Boolean} プラグインの初期化に成功したかを返します。
     * @static
     */
    s.registerPlugins = function (plugins) {
        for (var i = 0, l = plugins.length; i < l; i++) {
            var plugin = plugins[i];
            if (s.registerPlugin(plugin)) {
                return true;
            }
        }
        return false;
    }

    /**
     * デフォルトプラグインを初期化します。このメソッドはユーザーがプラグインを登録せずに音を再生しようとした時に呼びだされ、
     * 手動でプラグインを設定しなくても、Sound クラスが動くようにします。現在の実装では、デフォルトプラグインとして、
     * {{#crossLink "WebAudioPlugin"}}{{/crossLink}} の設定を試み、失敗したら {{#crossLink "HTMLAudioPlugin"}}{{/crossLink}}の設定を試みます。
     * @method initializeDefaultPlugins
     * @returns {Boolean} プラグインが初期化されたか。もしブラウザがどのプラグインも初期化できなければ、false を返します。
     * @private
     * @since 0.4.0
     */
    s.initializeDefaultPlugins = function () {
        if (s.activePlugin != null) {
            return true;
        }
        if (s.pluginsRegistered) {
            return false;
        }
        if (s.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin])) {
            return true;
        }
        return false;
    }

    /**
     * Sound クラスが初期化され、プラグインが有効化されたかどうかを返します。
     * @method isReady
     * @return {Boolean} Sound クラスが初期化されたかを返します。
     * @static
     */
    s.isReady = function () {
        return (s.activePlugin != null);
    }

    /**
     * 使用中のプラグインの機能を返します。これは、プラグインが現在の環境で利用可能か、
     * プラグインが特定の機能をサポートしているかについて判断する事ができます。
     * 返値には以下の情報が含まれています。:
     * <ul>
     *     <li><b>panning:</b> 音の定位を右から左まで指定できるか</li>
     *     <li><b>volume;</b> 音量を指定できるか</li>
     *     <li><b>mp3:</b> MP3 オーディオがサポートされているか</li>
     *     <li><b>ogg:</b> OGG オーディオがサポートされているか</li>
     *     <li><b>wav:</b> Wav オーディオがサポートされているか</li>
     *     <li><b>mpeg:</b> MPEG オーディオがサポートされているか</li>
     *     <li><b>m4a:</b> M4A オーディオがサポートされているか</li>
     *     <li><b>mp4:</b> MP4 オーディオがサポートされているか</li>
     *     <li><b>aiff:</b> aiff オーディオがサポートされているか </li>
     *     <li><b>wma:</b> wma オーディオがサポートされているか</li>
     *     <li><b>mid:</b> mid オーディオがサポートされているか</li>
     *     <li><b>tracks:</b> 最大同時再生数。制限がない場合、-1を返します。</li>
     * @method getCapabilities
     * @return {Object} 使用中のプラグインがサポートする機能を含む Object です。
     * @static
     */
    s.getCapabilities = function () {
        if (s.activePlugin == null) {
            return null;
        }
        return s.activePlugin.capabilities;
    }

    /**
     * 使用中のプラグインが特定の機能をサポートするかを返します。機能の一覧は{{#crossLink "Sound/getCapabilities"}}{{/crossLink}}を参照下さい。
     * @method getCapability
     * @param {String} key 調べる機能を示す文字列です。
     * @return {Number|Boolean} 機能の示す値です。
     * @static
     * @see getCapabilities
     */
    s.getCapability = function (key) {
        if (s.activePlugin == null) {
            return null;
        }
        return s.activePlugin.capabilities[key];
    }

    /**
     * <a href="http://preloadjs.com" target="_blank">PreloadJS</a>のプロセスマニュフェストアイテム(Process manifest items)です。
     * このメソッドはプラグインから使用されるように想定されており、直接操作するものではありません。
     * @method initLoad
     * @param {String | Object} src 読み込むソース又はオブジェクトです。通常はパス文字列ですが、HTMLAudioElementや似た再生オブジェクトを渡す事も可能です。
     * @param {String} [type] オブジェクトのタイプです。通常は "sound" か "null" です。
     * @param {String} [id] 音を再生するためにユーザーが定義できるID(オプション)です。
     * @param {Number|String|Boolean|Object} [data] アイテムと関連したデータです。Sound クラスはdataパラメータをaudioインスタンスのチャンネル数として使いますが、
     * もしこのプロパティが他の情報に使われた場合でも、"channels" プロパティがdataオブジェクトに追加されます。何の値も設定されていない場合、デフォルトのチャンネル数は1です。
     * @return {Boolean|Object} 引数で渡した値を持つObjectを返します。また、プラグインが渡されたオーディオの型を再生できない場合、false を返します。
     * @protected
     * @static
     */
    s.initLoad = function (src, type, id, data) {
        var details = s.registerSound(src, id, data, false);
        if (details == null) {
            return false;
        }
        return details;
    }

    /**
     * Sound クラスで再生するために音源を登録します。この関数は<a href="http://preloadjs.com" target="_blank">PreloadJS</a>を使用した場合、自動的に呼ばれますが、
     * もし自分で音源を登録したい場合は、このメソッドで操作します。適切に準備して読み込むためには、再生する必要のあるすべての音源を登録しておく事が望ましいです。
     * Sound クラスは、必要になった時に内部で読み込みを行います。
     *
     * <h4>例</h4>
     *      createjs.Sound.registerSound("myAudioPath/mySound.mp3|myAudioPath/mySound.ogg", "myID", 3);
     *
     * @method registerSound
     * @param {String | Object} src ソースのパス文字列または、"src" プロパティを含むオブジェクトです。
     * @param {String} [id] 音をあとで再生するためにユーザーが指定できるIDです。
     * @param {Number | Object} [data] アイテムと関連したデータです。Sound クラスはdataパラメータをaudioインスタンスのチャンネル数として使いますが、
     * もしこのプロパティが他の情報に使われた場合でも、"channels" プロパティがdataオブジェクトに追加されます。何の値も設定されていない場合、デフォルトのチャンネル数は1です。
     * @param {Boolean} [preload=true] 外部のPreloaderを使用していないため音源を内部で読み込む必要があるかどうか、を示します。
     * @return {Object} 引数で渡した、音を定義した値を持つObjectを返します。ソースを解釈できなかった場合、falseを返します。
     * @static
     * @since 0.4.0
     */
    s.registerSound = function (src, id, data, preload) {
        if (!s.initializeDefaultPlugins()) {
            return false;
        }

        if (src instanceof Object) {
            src = src.src;
            id = src.id;
            data = src.data;
            //OJR also do? preload = src.preload;
        }
        var details = s.parsePath(src, "sound", id, data);
        if (details == null) {
            return false;
        }

        if (id != null) {
            s.idHash[id] = details.src;
        }

        var numChannels = null; // null will set all SoundChannel to set this to it's internal maxDefault
        if (data != null) {
            if (!isNaN(data.channels)) {
                numChannels = parseInt(data.channels);
            }
            else if (!isNaN(data)) {
                numChannels = parseInt(data);
            }
        }
        var loader = s.activePlugin.register(details.src, numChannels);  // Note only HTML audio uses numChannels

        if (loader != null) {
            if (loader.numChannels != null) {
                numChannels = loader.numChannels;
            } // currently only HTMLAudio returns this
            SoundChannel.create(details.src, numChannels);

            // return the number of instances to the user.  This will also be returned in the load event.
            if (data == null || !isNaN(data)) {
                data = details.data = numChannels || SoundChannel.maxPerChannel();
            } else {
                data.channels = details.data.channels = numChannels || SoundChannel.maxPerChannel();
            }

            // If the loader returns a tag, return it instead for preloading.
            if (loader.tag != null) {
                details.tag = loader.tag;
            }
            else if (loader.src) {
                details.src = loader.src;
            }
            // If the loader returns a complete handler, pass it on to the prelaoder.
            if (loader.completeHandler != null) {
                details.completeHandler = loader.completeHandler;
            }
            details.type = loader.type;
        }

        if (preload != false) {
            if (!s.preloadHash[details.src]) {
                s.preloadHash[details.src] = [];
            }  // we do this so we can store multiple id's and data if needed
            s.preloadHash[details.src].push({src:src, id:id, data:data});  // keep this data so we can return it onLoadComplete
            if (s.preloadHash[details.src].length == 1) {
                s.activePlugin.preload(details.src, loader)
            }
            ;  // if already loaded once, don't load a second time  // OJR note this will disallow reloading a sound if loading fails or the source changes
        }

        return details;
    }

    /**
     * 再生する音源のマニフェストをSound クラスに登録します。
     * 適切に準備して読み込むためには、再生する必要のあるすべての音源を登録しておく事が望ましいです。
     * Sound クラスは、必要になった時に内部で読み込みを行います。
     *
     * <h4>例</h4>
     *      var manifest = [
     *          {src:"assetPath/asset0.mp3|assetPath/asset0.ogg", id:"example"}, // Sound.DELIMITER に注意
     *          {src:"assetPath/asset1.mp3|assetPath/asset1.ogg", id:"1", data:6},
     *          {src:"assetPath/asset2.mp3", id:"works"}
     *      ];
     *      createjs.Sound.addEventListener("loadComplete", doneLoading); // 各音源が読み込まれた時に doneLoading が呼び出されます
     *      createjs.Sound.registerManifest(manifest);
     *
     *
     * @method registerManifest
     * @param {Array} 読み込むオブジェクトの配列です。オブジェクトは{{#crossLink "Sound/registerSound"}}{{/crossLink}}で必要な
     * フォーマットである事が期待されます。: <code>{src:srcURI, id:ID, data:Data, preload:UseInternalPreloader}</code>
     * ただし、"id", "data", "preload" はオプションです。
     * @return {Object} 引数で渡した、音を定義した値を持つObjectを返します。ソースを解釈できなかった場合、falseを返します。
     * @static
     * @since 0.4.0
     */
    s.registerManifest = function (manifest) {
        var returnValues = [];
        for (var i = 0, l = manifest.length; i < l; i++) {
            returnValues[i] = createjs.Sound.registerSound(manifest[i].src, manifest[i].id, manifest[i].data, manifest[i].preload)
        }
        return returnValues;
    }

    /**
     * 指定したソースが内部ローダーで読み込まれたかをチェックします。読み込みを完了していない音源を再生しようとする場合に、
     * 新たな内部読み込みを開始しないように、この関数が必要となります。
     * @method loadComplete
     * @param {String} src 読み込みをチェックする音源のパス文字列またはIDです。
     * @return {Boolean} src がすでに読み込み済みかを返します。
     * @since 0.4.0
     */
    s.loadComplete = function (src) {
        var details = s.parsePath(src, "sound");
        if (details) {
            src = s.getSrcById(details.src);
        } else {
            src = s.getSrcById(src);
        }
        return (s.preloadHash[src][0] == true);  // src only loads once, so if it's true for the first it's true for all
    }

    /**
     * 音源のパス文字列を解析します。通常はマニフェストの項目から読み込まれます。マニフェストのsrc項目では、
     * 単一のファイルパスと、<code>Sound.DELIMITER</code>（デフォルトは"|"）を用いた複数のファイルパスの両方をサポートします。
     * 現在のブラウザ/プラグインでサポートされている初期ファイルパスが使用されます。
     * @method parsePath
     * @param {String} value 音源のパス文字列です。
     * @param {String} [type] パスの型です。この値は通常、"sound" 又は nullです。
     * @param {String} [id] ユーザーが指定した sound ID です。nullの場合、パス文字列が代わりに使われます。
     * @param {Number | String | Boolean | Object} [data] 音源に追加する任意のデータで、通常は音源のチャンネル数を示しています。
     * 現在の実装では、この引数はメソッド内部で使われていません。
     * @return {Object} <code>Sound.activePlugin</code>で登録可能、かつ、<a href="http://preloadjs.com" target="_blank">PreloadJS</a>のような
     * ローダーに対して値を渡せるように整形したオブジェクトを返します。
     * @protected
     */
    s.parsePath = function (value, type, id, data) {
        if (typeof(value) != "string") {value = value.toString();}
        var sounds = value.split(s.DELIMITER);
        var ret = {type:type || "sound", id:id, data:data};
        var c = s.getCapabilities();
        for (var i = 0, l = sounds.length; i < l; i++) {
            var sound = sounds[i];

            var match = sound.match(s.FILE_PATTERN);
            if (match == null) {
                return false;
            }
            var name = match[4];
            var ext = match[5];

            if (c[ext] && s.SUPPORTED_EXTENSIONS.indexOf(ext) > -1) {
                ret.name = name;
                ret.src = sound;
                ret.extension = ext;
                return ret;
            }
        }
        return null;
    }


    /* ---------------
     Static API.
     --------------- */
    /**
     * 音を再生して、そのコントロールを行う{{#crossLink "SoundInstance"}}{{/crossLink}}を返します。
     * 再生に失敗した場合、<code>Sound.PLAY_FAILED</code>の playState 値を持った SoundInstance が返されます。
     * 再生チャンネルの不足が原因で失敗した音であっても、SoundInstance {{#crossLink "SoundInstance/play"}}{{/crossLink}} を呼び出す事ができる点に注意してください。
     * もし利用可能なプラグインが無い場合、音を再生しないがエラーも発生しない<code>Sound.defaultSoundInstance</code>が返されます。
     *
     * <h4>例</h4>
     *      createjs.Sound.registerSound("myAudioPath/mySound.mp3", "myID", 3);
     *      // 読み込みが完了するまで待ちます
     *      createjs.Sound.play("myID");
     *      // このように次々とファイルを呼び出す事もできます
     *      var myInstance = createjs.Sound.play("myAudioPath/mySound.mp3", createjs.Sound.INTERRUPT_ANY, 0, 0, -1, 1, 0);
     *
     * @method play
     * @param {String} src 音源のパス文字列またはIDです。
     * @param {String} [interrupt="none"] 他のインスタンスを中断する方法を指定します。値は Sound クラス内の<code>INTERRUPT_TYPE</code>として定義されています。
     * @param {Number} [delay=0] 音の再生開始の遅延時間をミリ秒で指定します。
     * @param {Number} [offset=0] 音の再生開始位置をミリ秒で指定します。
     * @param {Number} [loop=0] 再生終端に到達した際に何回ループさせるかを指定します。デフォルトは 0（ループしない）で、-1 を指定すると無限ループします。
     * @param {Number} [volume=1] 音量を 0 から 1 の範囲で指定します。マスターボリュームが各チャンネルのボリュームに対してさらに適用されることに注意してください。
     * @param {Number} [pan=0] （もしサポートされていれば）音の左右の定位を -1（左）から1（右）の範囲で指定します。
     * @return {SoundInstance} 再生後に音をコントロールする {{#crossLink "SoundInstance"}}{{/crossLink}} を返します。
     * @static
     */
    s.play = function (src, interrupt, delay, offset, loop, volume, pan) {
        var instance = s.createInstance(src);

        var ok = s.playInstance(instance, interrupt, delay, offset, loop, volume, pan);
        if (!ok) {
            instance.playFailed();
        }
        return instance;
    }

    /**
     * 引数に渡したパス文字列を使って{{#crossLink "SoundInstance"}}{{/crossLink}}を作ります。もしサポートする拡張子をもっていない場合、
     * 安全にメソッドを呼べますが何もしない、デフォルトの SoundInstance が返されます。
     * @method createInstance
     * @param {String} src 音源のパス文字列
     * @return {SoundInstance} コントロールが可能な{{#crossLink "SoundInstance"}}{{/crossLink}}を返します。サポートされていない拡張子に対してはデフォルトの SoundInstance が返されます。
     * @since 0.4.0
     */
    s.createInstance = function (src) {
        //TODO this function appears to be causing a memory leak, and needs spike tested.
        // OJR it is not EventDispatcher.  It appears to be var instance = s.activePlugin.create(src);  HTML makes sense because of the tag pool.  web audio is crashing though.
        // in new SoundInstance
        if (!s.initializeDefaultPlugins()) {
            return s.defaultSoundInstance;
        }
        var details = s.parsePath(src, "sound");
        if (details) {
            src = s.getSrcById(details.src);
        } else {
            src = s.getSrcById(src);
        }

        var dot = src.lastIndexOf(".");
        var ext = src.slice(dot + 1);  // sound have format of "path+name . ext"
        if (dot != -1 && s.SUPPORTED_EXTENSIONS.indexOf(ext) > -1) {  // we have an ext and it is one of our supported,Note this does not mean the plugin supports it.  // OJR consider changing to check against activePlugin.capabilities[ext]
            // make sure that we have a sound channel (sound is registered or previously played)
            SoundChannel.create(src);

            var instance = s.activePlugin.create(src);
        } else var instance = Sound.defaultSoundInstance;  // the src is not supported, so give back a dummy instance.
        // This can happen if PreloadJS fails because the plugin does not support the ext, and was passed an id which
        // will not get added to the idHash.

        instance.uniqueId = s.lastId++;  // OJR moved this here so we can have multiple plugins active in theory

        return instance;
    }

    /**
     * Sound クラスのマスターボリュームを設定します。マスターボリュームは各チャンネルの音量に乗算されます。
     * 各チャンネルの音量を設定するには、代わりにSoundInstance {{#crossLink "SoundInstance/setVolume"}}{{/crossLink}} を使って下さい。
     * @method setVolume
     * @param {Number} value マスターボリュームの値です。指定可能な範囲は0～1の間です。
     * @static
     */
    s.setVolume = function (value) {
        if (Number(value) == null) {
            return false;
        }
        value = Math.max(0, Math.min(1, value));
        s.masterVolume = value;
        if (!this.activePlugin || !this.activePlugin.setVolume || !this.activePlugin.setVolume(value)) {
            var instances = this.instances;  // OJR does this impact garbage collection more than it helps performance?
            for (var i = 0, l = instances.length; i < l; i++) {
                instances[i].setMasterVolume(value);
            }
        }
    }

    /**
     * Sound クラスのマスターボリュームを取得します。マスターボリュームは各チャンネルの音量に乗算されます。
     * 各チャンネルの音量を取得するには、代わりにSoundInstance {{#crossLink "SoundInstance/setVolume"}}{{/crossLink}} を使って下さい。
     * @method getVolume
     * @return {Number} マスターボリュームの値を返します。範囲は0～1の間です。
     * @static
     */
    s.getVolume = function (value) {
        return s.masterVolume;
    }

    /**
     * 全ての出音を消音/消音解除します。{{#crossLink "Sound/setMute"}}{{/crossLink}}を参照下さい。
     * @method mute
     * @param {Boolean} value 音を消音するか/消音解除するかを指定します。
     * @static
     * @deprecated この関数は将来廃止される可能性があります。setMuteを代わりに使ってください。
     */
    s.mute = function (value) {
        this.masterMute = value;
        if (!this.activePlugin || !this.activePlugin.setMute || !this.activePlugin.setMute(value)) {
            var instances = this.instances;
            for (var i = 0, l = instances.length; i < l; i++) {
                instances[i].setMasterMute(value);
            }
        }
    }

    /**
     * 全ての音を消音/消音解除します。消音した音は音量0で再生され続けている点に注意して下さい。
     * グローバルミュートの値は独立して保持しており上書きされますが、各個別のインスタンスの mute プロパティは変更しません。
     * 各インスタンスの消音は、代わりにSoundInstance {{#crossLink "SoundInstance/setVolume"}}{{/crossLink}} を使って下さい。
     * @method setMute
     * @param {Boolean} value 音を消音するか/消音解除するかを指定します。
     * @return {Boolean} 消音が設定されたかどうかを返します。
     * @static
     * @since 0.4.0
     */
    s.setMute = function (value) {
        if (value == null || value == undefined) {
            return false
        }
        ;

        this.masterMute = value;
        if (!this.activePlugin || !this.activePlugin.setMute || !this.activePlugin.setMute(value)) {
            var instances = this.instances;
            for (var i = 0, l = instances.length; i < l; i++) {
                instances[i].setMasterMute(value);
            }
        }
        return true;
    }

    /**
     * グローバルミュートの値を返します。
     * 各インスタンスの消音状態の取得は、代わりにSoundInstance {{#crossLink "SoundInstance/setVolume"}}{{/crossLink}} を使って下さい。
     * @method getMute
     * @return {Boolean} Sound クラスの消音状態を返します。
     * @static
     * @since 0.4.0
     */
    s.getMute = function () {
        return this.masterMute;
    }

    /**
     * 全ての音の再生を停止します（グローバルストップ）。再生を停止した音はポーズでは無く、リセットされます。
     * 停止した音を再生したい場合は、{{#crossLink "SoundInstance.play"}}{{/crossLink}}を呼び出して下さい。
     * @method stop
     * @static
     */
    s.stop = function () {
        var instances = this.instances;
        for (var i = instances.length; i > 0; i--) {
            instances[i - 1].stop();  // NOTE stop removes instance from this.instances
        }
    }


    /* ---------------
     Internal methods
     --------------- */
    /**
     * インスタンスを再生します。この関数はスタティックAPIやプラグインから呼び出されます。
     * この関数はコアクラスから再生遅延をコントロール出来るようにします。
     * @method playInstance
     * @param {SoundInstance} instance 再生を開始するための{{#crossLink "SoundInstance"}}{{/crossLink}}です。
     * @param {String} [interrupt=none] このインスタンスが同じ音源の他のインスタンスからどのように中断されるかを指定します。
   * デフォルトは <code>Sound.INTERRUPT_NONE</code> です。値は Sound クラス内の<code>INTERRUPT_TYPE</code>として定義されています。
     * @param {Number} [delay=0] 音の再生が開始するまでの遅延時間をミリ秒で指定します。
     * @param {Number} [offset=instance.offset] 音の再生を開始する位置をミリ秒で指定します。デフォルトはこのインスタンスの現在の位置です。
     * @param {Number} [loop=0] 音再生のループ回数を指定します。0 でループ無し、-1 で無限ループします。
     * @param {Number} [volume] 音量を 0 から 1 の範囲で指定します。デフォルトは現在インスタンスが持っている値です。
     * @param {Number} [pan] 音の定位を -1（左）から1（右）の範囲で指定します。デフォルトは現在インスタンスが持っている値です。
     * @return {Boolean} 音の再生を開始したかどうかを返します。再生に失敗した音は false を返します。再生遅延を指定した音は true を返しますが、再生時に失敗する可能性があります。
     * @protected
     * @static
     */
    s.playInstance = function (instance, interrupt, delay, offset, loop, volume, pan) {
        interrupt = interrupt || s.defaultInterruptBehavior;
        if (delay == null) {
            delay = 0;
        }
        if (offset == null) {
            offset = instance.getPosition();
        }
        if (loop == null) {
            loop = 0;
        }
        if (volume == null) {
            volume = instance.getVolume();
        }
        if (pan == null) {
            pan = instance.getPan();
        }

        if (delay == 0) {
            var ok = s.beginPlaying(instance, interrupt, offset, loop, volume, pan);
            if (!ok) {
                return false;
            }
        } else {
            //Note that we can't pass arguments to proxy OR setTimeout (IE only), so just wrap the function call.
            var delayTimeoutId = setTimeout(function () {
                s.beginPlaying(instance, interrupt, offset, loop, volume, pan);
            }, delay);
            instance.delayTimeoutId = delayTimeoutId;
        }

        this.instances.push(instance);

        return true;
    }

    /**
     * 再生を開始します。この関数は、すぐに、又は遅延後に、{{#crossLink "Sound/playInstance"}}{{/crossLink}}から呼び出されます。
     * @method beginPlaying
     * @param {SoundInstance} instance 再生を開始する{{#crossLink "SoundInstance"}}{{/crossLink}}です。
     * @param {String} [interrupt=none] このインスタンスが同じ音源の他のインスタンスからどのように中断されるかを指定します。
   * デフォルトは <code>Sound.INTERRUPT_NONE</code> です。値は Sound クラス内の<code>INTERRUPT_TYPE</code>として定義されています。
     * @param {Number} [offset=instance.offset] 音の再生を開始する位置をミリ秒で指定します。デフォルトはこのインスタンスの現在の位置です。
     * @param {Number} [loop=0] 音再生のループ回数を指定します。0 でループ無し、-1 で無限ループします。
     * @param {Number} [volume] 音量を 0 から 1 の範囲で指定します。デフォルトは現在インスタンスが持っている値です。
     * @param {Number} [pan=instance.pan] 音の定位を -1（左）から1（右）の範囲で指定します。デフォルトは現在インスタンスが持っている値です。
     * @return {Boolean} 音の再生を開始したかどうかを返します。再生に失敗した音は false を返します。再生遅延を指定した音は true を返しますが、再生時に失敗する可能性があります。
     * @protected
     * @static
     */
    s.beginPlaying = function (instance, interrupt, offset, loop, volume, pan) {
        if (!SoundChannel.add(instance, interrupt)) {
            return false;
        }
        var result = instance.beginPlaying(offset, loop, volume, pan);
        if (!result) {
            //LM: Should we remove this from the SoundChannel (see finishedPlaying)
            var index = this.instances.indexOf(instance);
            if (index > -1) {
                this.instances.splice(index, 1);
            }
            return false;
        }
        return true;
    }

    /**
     * 登録の時に指定した ID から音源のパス文字列を取得します。IDが見つからない場合、引数で渡した値を返します。
     * @method getSrcById
     * @param {String} value 登録の時に指定した音源の ID です。
     * @return {String} 音源のパス文字列を返します。Returns null if src has been registered with this id. (訳注：すいません。分らなかったので仕様を調べてあとで訳します)
     * @protected
     * @static
     */
    s.getSrcById = function (value) {
        if (s.idHash == null || s.idHash[value] == null) {
            return value;
        }
        return s.idHash[value];
    }

    /**
     * 再生が完了、中断、失敗、停止した音を渡します。このメソッドは、Sound クラスの管理対象からインスタンスをはずします。
     * もう一度音を再生する場合は、Sound クラスの管理対象にあらためて登録されます。このメソッドはインスタンス内部で呼び出される事に注意してください。
     * @method playFinished
     * @param {SoundInstance} instance 再生を終了したインスタンスです。
     * @protected
     * @static
     */
    s.playFinished = function (instance) {
        SoundChannel.remove(instance);
        var index = this.instances.indexOf(instance);
        if (index > -1) {
            this.instances.splice(index, 1);
        }
    }

    /**
     * Sound メソッドの 関数プロキシ です。デフォルトでは JavaScript のメソッドはスコープを保持しないため、
     * メソッドをコールバックとして渡すと、呼び出し元のスコープ内で呼ばれたメソッドとして結果を返します。
     * プロキシを使う事で、正しいスコープ内でのメソッドを呼び出しを保障することができます。
     * @method proxy
     * @param {Function} method 呼び出す関数です。
     * @param {Object} scope 指定したメソッドを呼び出すスコープです。
     * @protected
     * @static
     * @deprecated この関数は将来廃止される可能性があります。createjs.proxy を代わりに使ってください。
     */
    s.proxy = function (method, scope) {
        return function () {
            return method.apply(scope, arguments);
        }
    }

    createjs.Sound = Sound;

    /**
     * Sound メソッドの 関数プロキシ です。デフォルトでは JavaScript のメソッドはスコープを保持しないため、
     * メソッドをコールバックとして渡すと、呼び出し元のスコープ内で呼ばれたメソッドとして結果を返します。
     * プロキシを使う事で、正しいスコープ内でのメソッドを呼び出しを保障することができます。
     * 関数を呼び出す際に引数を渡すことができることを注記します。
     *
     * <h4>例<h4>
     *     myObject.myCallback = createjs.proxy(myHandler, this, arg1, arg2);
     *
     * #method proxy
     * @param {Function} method 呼び出す関数です。
     * @param {Object} scope 指定したメソッドを呼び出すスコープです。
     * @param {mixed} [arg] * コールバック関数に追加パラメータとして渡す引数です。
     * @protected
     * @static
     */
    createjs.proxy = function (method, scope) {
        var aArgs = Array.prototype.slice.call(arguments, 2);
        return function () {
            return method.apply(scope, Array.prototype.slice.call(arguments, 0).concat(aArgs));
        };
    }


    /**
     * 各サウンドタイプの再生可能な {{#crossLink "SoundInstance"}}{{/crossLink}} インスタンスの数を管理する内部クラスです。
     * このメソッドは {{#crossLink "Sound"}}{{/crossLink}} クラスから内部的にのみ使用されます。
     *
     * 再生可能な音数は、1つの音源の過飽和を避ける目的以外にも、（より良いブラウザのサポートによって最近は無くなりつつある
     * としても）ハード性能の制限内に収める目的のため、Sound クラスによって意図的に制限をかけています。
     *
     * 音が再生される際、このクラスは、再生可能なインスタンスがあるか確認し、無ければ、適切な再生中の音を中断します。
     * #class SoundChannel
     * @param {String} src インスタンスの音源のパス文字列です。
     * @param {Number} [max=1] 再生を許可する最大数です。
     * @constructor
     * @protected
     */
    function SoundChannel(src, max) {
        this.init(src, max);
    }

    /* ------------
     Static API
     ------------ */
    /**
     * 音源のパス文字列によってインデックスされたチャンネルのハッシュテーブルです。
     * #property channels
     * @type {Object}
     * @static
     */
    SoundChannel.channels = {};

    /**
     * SoundChannel を生成します。チャンネルがすでに存在する場合、この関数は失敗します。
     * #method create
     * @param {String} src チャンネルの音源のパス文字列です。
     * @param {Number} max このチャンネルが保持できる最大数です。デフォルトは値は {{#crossLink "SoundChannel.maxDefault"}}{{/crossLink}} です。
     * @return {Boolean} チャンネルが生成されたかを返します。
     * @static
     */
    SoundChannel.create = function (src, max) {
        var channel = SoundChannel.get(src);
        //if (max == null) { max = -1; }  // no longer need this check
        if (channel == null) {
            SoundChannel.channels[src] = new SoundChannel(src, max);
            return true;
        }
        return false;
    }
    /**
     * チャンネルにインスタンスを追加します。
     * #method add
     * @param {SoundInstance} instance チャンネルに追加するインスタンスです。
     * @param {String} interrupt 中断方法を指定します。中断モードの詳細は {{#crossLink "Sound/play"}}{{/crossLink}} を参照ください。
     * @return {Boolean} メソッド呼び出しに成功したかを返します。チャンネル数が最大に達している場合、False を返します。
     * @static
     */
    SoundChannel.add = function (instance, interrupt) {
        var channel = SoundChannel.get(instance.src);
        if (channel == null) {
            return false;
        }
        return channel.add(instance, interrupt);
    }
    /**
     * チャンネルからインスタンスを削除します。
     * #method remove
     * @param {SoundInstance} instance チャンネルから削除するインスタンスです。
     * @return メソッド呼び出しに成功したかを返します。指定したインスタンスを再生しているチャンネルが無かった場合、False を返します。
     * @static
     */
    SoundChannel.remove = function (instance) {
        var channel = SoundChannel.get(instance.src);
        if (channel == null) {
            return false;
        }
        channel.remove(instance);
        return true;
    }
    /**
     * このチャンネルが持てる最大音数を取得します。
     * #method
     * @return {Number} このチャンネルが持てる最大音数です。
     */
    SoundChannel.maxPerChannel = function () {
        return p.maxDefault;
    }
    /**
     * 音源のパス文字列からSoundChannelインスタンスを取得します。
     * #method get
     * @param {String} src チャンネルを探索する音源のパス文字列です。
     * @static
     */
    SoundChannel.get = function (src) {
        return SoundChannel.channels[src];
    }

    var p = SoundChannel.prototype = {

        /**
         * このチャンネルの音源のパス文字列
         * #property src
         * @type {String}
         */
        src:null,

        /**
         * このチャンネルの最大インスタンス数です。-1は無制限を意味します。
         * #property max
         * @type {Number}
         */
        max:null,

        /**
         * もし最大値に指定が無かった場合のデフォルト値です。-1が指定された場合にも使われます。
         * #property maxDefault
         * @type {Number}
         * @default 100
         * @since 0.4.0
         */
        maxDefault:100,

        /**
         * 現在音を再生中のインスタンス数です。
         * The current number of active instances.
         * #property length
         * @type {Number}
         */
        length:0,

        /**
         * チャンネルを初期化します。
         * #method init
         * @param {String} src このチャンネルの音源のパス文字列です。
         * @param {Number} max このチャンネルの最大インスタンス数です。
         * @protected
         */
        init:function (src, max) {
            this.src = src;
            this.max = max || this.maxDefault;
            if (this.max == -1) {
                this.max == this.maxDefault;
            }
            this.instances = [];
        },

        /**
         * インデックス値からインスタンスを取得します。
         * #method get
         * @param {Number} index 取得するインスタンスのインデックス値です。
         * @return {SoundInstance} 指定した位置のSoundInstanceです。
         */
        get:function (index) {
            return this.instances[index];
        },

        /**
         * 新たなインスタンスをチャンネルに追加します。
         * #method add
         * @param {SoundInstance} instance 追加するインスタンスです。
         * @return {Boolean} メソッド呼び出しに成功したかを返します。チャンネル数が最大に達している場合、False を返します。
         */
        add:function (instance, interrupt) {
            if (!this.getSlot(interrupt, instance)) {
                return false;
            }
            ;
            this.instances.push(instance);
            this.length++;
            return true;
        },

        /**
         * 再生終了時、または、再生中断時に、インスタンスをチャンネルから削除します。
         * Remove an instance from the channel, either when it has finished playing, or it has been interrupted.
         * #method remove
         * @param {SoundInstance} instance 削除するインスタンスです。
         * @return {Boolean} メソッド呼び出しに成功したかを返します。指定したインスタンスを再生しているチャンネルが無かった場合、False を返します。
         * return false.
         */
        remove:function (instance) {
            var index = this.instances.indexOf(instance);
            if (index == -1) {
                return false;
            }
            this.instances.splice(index, 1);
            this.length--;
            return true;
        },

        /**
         * スロットが有効であれば、中断方法に応じて適切な再生可能なスロットを取得します。
         * #method getSlot
         * @param {String} interrupt 中断方法を指定します。
         * @param {SoundInstance} instance もし再生に成功した場合に追加されるインスタンスです。
         * @return {Boolean} 有効なスロットがあったかどうかを返します。空きスロットが無かった場合、
         * 中断モードに従い、再生中の SoundInstance が中断されます。それでも有効なスロットが無かった場合、
         * この関数は false を返します。
         */
        getSlot:function (interrupt, instance) {
            var target, replacement;

            for (var i = 0, l = this.max; i < l; i++) {
                target = this.get(i);

                // Available Space
                if (target == null) {
                    return true;
                } else if (interrupt == Sound.INTERRUPT_NONE && target.playState != Sound.PLAY_FINISHED) {
                    continue;
                }

                // First replacement candidate
                if (i == 0) {
                    replacement = target;
                    continue;
                }

                // Audio is complete or not playing
                if (target.playState == Sound.PLAY_FINISHED ||
                        target == Sound.PLAY_INTERRUPTED ||
                        target == Sound.PLAY_FAILED) {
                    replacement = target;

                    // Audio is a better candidate than the current target, according to playhead
                } else if (
                        (interrupt == Sound.INTERRUPT_EARLY && target.getPosition() < replacement.getPosition()) ||
                                (interrupt == Sound.INTERRUPT_LATE && target.getPosition() > replacement.getPosition())) {
                    replacement = target;
                }
            }

            if (replacement != null) {
                replacement.interrupt();
                this.remove(replacement);
                return true;
            }
            return false;
        },

        toString:function () {
            return "[Sound SoundChannel]";
        }

    }

    // do not add SoundChannel to namespace


    // This is a dummy sound instance, which allows Sound to return something so developers don't need to check nulls.
    function SoundInstance() {
        this.isDefault = true;
        this.addEventListener = this.removeEventListener = this.removeAllEventListener = this.dispatchEvent = this.hasEventListener = this._listeners = this.interrupt = this.playFailed = this.pause = this.resume = this.play = this.beginPlaying = this.cleanUp = this.stop = this.setMasterVolume = this.setVolume = this.mute = this.setMute = this.getMute = this.setPan = this.getPosition = this.setPosition = function () {
            return false;
        };
        this.getVolume = this.getPan = this.getDuration = function () {
            return 0;
        }
        this.playState = Sound.PLAY_FAILED;
        this.toString = function () {
            return "[Sound Default Sound Instance]";
        }
    }

    Sound.defaultSoundInstance = new SoundInstance();


    /**
     * 現在のブラウザ、バージョン、オペレーティングシステム、その他環境変数を特定するための追加モジュールです。
     * このモジュールは文章公開されていません。
     * #class BrowserDetect
     * @param {Boolean} isFirefox ブラウザが Firefox の場合 true です。
     * @param {Boolean} isOpera  ブラウザが opera の場合 true です。
     * @param {Boolean} isChrome ブラウザが Chrome の場合 true です。Chrome for Android でも true を返しますが、
     * 全く異なった性能を持った全く異なったブラウザである事に注意してください。
     * @param {Boolean} isIOS ブラウザが safari for iOS devices (iPad, iPhone, and iPad) の場合 true です。
     * @param {Boolean} isAndroid ブラウザが Android の場合 true です。
     * @param {Boolean} isBlackberry ブラウザが Blackberry の場合 true です。
     * @constructor
     * @static
     */
    function BrowserDetect() {
    }

    BrowserDetect.init = function () {
        var agent = navigator.userAgent;
        BrowserDetect.isFirefox = (agent.indexOf("Firefox") > -1);
        BrowserDetect.isOpera = (window.opera != null);
        BrowserDetect.isChrome = (agent.indexOf("Chrome") > -1);  // NOTE that Chrome on Android returns true but is a completely different browser with different abilities
        BrowserDetect.isIOS = agent.indexOf("iPod") > -1 || agent.indexOf("iPhone") > -1 || agent.indexOf("iPad") > -1;
        BrowserDetect.isAndroid = (agent.indexOf("Android") > -1);
        BrowserDetect.isBlackberry = (agent.indexOf("Blackberry") > -1);
    }

    BrowserDetect.init();

    createjs.Sound.BrowserDetect = BrowserDetect;


}());

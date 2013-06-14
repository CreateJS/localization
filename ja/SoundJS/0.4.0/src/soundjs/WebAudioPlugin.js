/*
 * WebAudioPlugin for SoundJS
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
 * @module SoundJS
 */

// namespace:
this.createjs = this.createjs || {};

(function () {

	/**
	 * Web Audioを用いてブラウザで音を再生します。WebAudioプラグインは、以下の環境で正常動作を確認しています。
	 * <ul><li>Google Chrome, version 23+ on OS X and Windows</li>
	 *      <li>Safari 6+ on OS X</li>
	 *      <li>Mobile Safari on iOS 6+</li>
	 * </ul>
	 *
	 * WebAudioプラグインはデフォルトのプラグインであり、サポートされていればこのプラグインが使用されます。
	 * プラグインの優先順位を変更するにはSound API {{#crossLink "Sound/registerPlugins"}}{{/crossLink}}メソッドを参照ください。
	 *
	 * <h4>ブラウザ/OSにおける Web Audio の既知の問題点</h4>
	 * <b>Webkit (Chrome and Safari)</b><br />
	 * <ul><li>AudioNode.disconnect が機能していないことがあるようです。
	 * この問題は、多量の音声ファイルを再生している場合に、ファイルサイズの時間による増加を引き起こす可能性があります。</li>
	 *
	 * <b>iOS 6 の制限</b><br />
	 * <ul><li>音は初期設定では消音状態であり、ユーザーが喚起したイベント(touch イベントなど)の内部から呼び出された場合のみ、消音が解除されます。</li>
	 *
	 * @class WebAudioPlugin
	 * @constructor
	 * @since 0.4.0
	 */
	function WebAudioPlugin() {
		this.init();
	}

	var s = WebAudioPlugin;

	/**
	 このプラグインがサポートする機能です。これは <code>WebAudioPlugin/generateCapabilities</code> メソッドで生成されます。
	 * @property capabilities
	 * @type {Object}
	 * @default null
	 * @static
	 */
	s.capabilities = null;

	/**
	 * 現在のbrowser/OSでこのプラグインが使用可能かを返します。
	 * @method isSupported
	 * @return {Boolean} プラグインが初期化されたかを返します。
	 * @static
	 */
	s.isSupported = function () {
        if (location.protocol == "file:") { return false; }  // Web Audio requires XHR, which is not available locally
		s.generateCapabilities();
		if (s.context == null) {
			return false;
		}
		return true;
	};

	/**
	 * このプラグインがサポートする機能を決定します。このメソッドは内部で使用されます。機能の一覧は、Sound クラスの{{#crossLink "Sound/getCapabilities"}}{{/crossLink}}を参照下さい。
	 * @method generateCapabiities
	 * @static
	 * @protected
	 */
	s.generateCapabilities = function () {
		if (s.capabilities != null) {
			return;
		}
		// Web Audio can be in any formats supported by the audio element, from http://www.w3.org/TR/webaudio/#AudioContext-section,
		// therefore tag is still required for the capabilities check
		var t = document.createElement("audio");

		if (t.canPlayType == null) {
			return null;
		}

		// This check is first because it's what is currently used, but the spec calls for it to be AudioContext so this
		//  will probably change in time
		if (window.webkitAudioContext) {
			s.context = new webkitAudioContext();
		} else if (window.AudioContext) {
			s.context = new AudioContext();
		} else {
			return null;
		}

		s.capabilities = {
			panning:true,
			volume:true,
			tracks:-1
		};

		// determine which extensions our browser supports for this plugin by iterating through Sound.SUPPORTED_EXTENSIONS
		var supportedExtensions = createjs.Sound.SUPPORTED_EXTENSIONS;
		var extensionMap = createjs.Sound.EXTENSION_MAP;
		for (var i = 0, l = supportedExtensions.length; i < l; i++) {
			var ext = supportedExtensions[i];
			var playType = extensionMap[ext] || ext;
			s.capabilities[ext] = (t.canPlayType("audio/" + ext) != "no" && t.canPlayType("audio/" + ext) != "") || (t.canPlayType("audio/" + playType) != "no" && t.canPlayType("audio/" + playType) != "");
		}  // OJR another way to do this might be canPlayType:"m4a", codex: mp4

		// 0=no output, 1=mono, 2=stereo, 4=surround, 6=5.1 surround.
		// See http://www.w3.org/TR/webaudio/#AudioChannelSplitter for more details on channels.
		if (s.context.destination.numberOfChannels < 2) {
			s.capabilities.panning = false;
		}

		// set up AudioNodes that all of our source audio will connect to
		s.dynamicsCompressorNode = s.context.createDynamicsCompressor();
		s.dynamicsCompressorNode.connect(s.context.destination);
		s.gainNode = s.context.createGainNode();
		s.gainNode.connect(s.dynamicsCompressorNode);
	}

	var p = s.prototype = {

		capabilities:null, // doc'd above

		/**
		 * このプラグインの音量の初期値です。
		 * @property volume
		 * @type {Number}
		 * @default 1
		 * @protected
		 */
		volume:1,

		/**
		 * WebAudio が音を再生する際に用いるweb audio コンテクストです。WebAudioPlugin と連携する全ての Node は、このコンテクストから生成される必要があります。
		 * @property context
		 * @type {AudioContext}
		 */
		context:null,

		/**
		 * http://www.w3.org/TR/webaudio/#DynamicsCompressorNode によると音質を向上させ音歪みを避けるために使われる DynamicsCompressorNode です。
		 * このノードは<code>context.destination</code>に接続されます。
		 * @property dynamicsCompressorNode
		 * @type {AudioNode}
		 */
		dynamicsCompressorNode:null,

		/**
		 * マスターボリュームを適用するための GainNode です。このノードは<code>dynamicsCompressorNode</code>に接続されます。
		 * @property gainNode
		 * @type {AudioGainNode}
		 */
		gainNode:null,

		/**
		 * ArrayBuffers を保持するために内部で使用される、読み込み時に指定した音源のURIでインデックスされたハッシュテーブルです。
		 * これは一度読み込んだ音源ファイルを、それ以上読み込み/デコードしてしまう事を回避するために使用されます。
		 * 
		 If a load has been started on a file, <code>arrayBuffers[src]</code>
		 * will be set to true. Once load is complete, it is set the the loaded ArrayBuffer instance.
		 * @property arrayBuffers
		 * @type {Object}
		 * @protected
		 */
		arrayBuffers:null,

		/**
		 * コンストラクタによって呼び出される初期化関数です。
		 * @method init
		 * @private
		 */
		init:function () {
			this.capabilities = s.capabilities;
			this.arrayBuffers = {};

			this.context = s.context;
			this.gainNode = s.gainNode;
			this.dynamicsCompressorNode = s.dynamicsCompressorNode;
		},

		/**
		 * 読み込みと設定のために音源を予め登録します。このメソッドは{{#crossLink "Sound"}}{{/crossLink}}から呼び出されます。
		 * WebAudio は、<a href="http://preloadjs.com">PreloadJS</a>が登録に対応できるように、<code>WebAudioLoader</code>インスタンスを生成する事に注意して下さい。
		 * @method register
		 * @param {String} src 音源のファイルパスです。
		 * @param {Number} instances チャンネルが同時に再生できるインスタンス数です。WebAudioPluginはこのプロパティを管理しないことに注意して下さい。
		 * @return {Object} 登録に用いる"tag"を含むオブジェクトを返します。
		 */
		register:function (src, instances) {
			this.arrayBuffers[src] = true;  // This is needed for PreloadJS
			var tag = new WebAudioLoader(src, this);
			return {
				tag:tag
			};
		},

		/**
		 * 指定した音源の読み込みが開始されているかをチェックします。音源が見つかった場合、読み込み中、または読み込み完了とみなせます。
		 * @method isPreloadStarted
		 * @param {String} src チェックする音源のURIです。
		 * @return {Boolean}
		 */
		isPreloadStarted:function (src) {
			return (this.arrayBuffers[src] != null);
		},

		/**
		 * 指定した音源の読み込みが完了したかをチェックします。音源が(trueではなく)定義されていた場合、読み込みは完了しています。
		 * @method isPreloadComplete
		 * @param {String} src 読み込む音源のURIです。
		 * @return {Boolean}
		 */
		isPreloadComplete:function (src) {
			return (!(this.arrayBuffers[src] == null || this.arrayBuffers[src] == true));
		},

		/**
		 * 読み込んだ音源のリストから指定した音源を削除します。このメソッドでは読み込みをキャンセルできないことに注意してください。
		 * @method removeFromPreload
		 * @param {String} src 削除する音源のURIです。
		 * @return {Boolean}
		 */
		removeFromPreload:function (src) {
			delete(this.arrayBuffers[src]);
		},

		/**
		 * 読み込んだ音源のハッシュに音源を追加します。
		 * @method addPreloadResults
		 * @param {String} src 追加する音源のURIです。
		 * @return {Boolean}
		 */
		addPreloadResults:function (src, result) {
			this.arrayBuffers[src] = result;
		},

		/**
		 * 読み込み完了の内部ハンドラです。
		 * @method handlePreloadComplete
		 * @private
		 */
		handlePreloadComplete:function () {
			//LM: I would recommend having the WebAudioLoader include an "event" in the onload, and properly binding this callback.
			createjs.Sound.sendLoadComplete(this.src);  // fire event or callback on Sound
			// note "this" will reference WebAudioLoader object
		},

		/**
		 * 内部的に音源を読み込みます。WebAudioで扱う array buffer の読み込みには XHR2 を使用しています。
		 * @method preload
		 * @param {String} src 読み込む音源のURIです。
		 * @param {Object} このプラグインでは使用しません。
		 * @protected
		 */
		preload:function (src, instance) {
			this.arrayBuffers[src] = true;
			var loader = new WebAudioLoader(src, this);
			loader.onload = this.handlePreloadComplete;
			loader.load();
		},

		/**
		 * sound インスタンスを生成します。まだ sound を読み込んでいない場合、このメソッドで読み込みます。
		 * Create a sound instance. If the sound has not been preloaded, it is internally preloaded here.
		 * @method create
		 * @param {String} src 使用する音源URIです。
		 * @return {SoundInstance} 再生操作に使用する sound インスタンスです。
		 */
		create:function (src) {
			if (!this.isPreloadStarted(src)) {
				this.preload(src);
			}
			return new SoundInstance(src, this);
		},

		/**
		 * このプラグインのマスターボリュームを設定します。マスターボリューム値は全てのSoundInstancesに影響します。
		 * @method setVolume
		 * @param {Number} value 0～1の間のボリューム値です。
		 * @return {Boolean} プラグインがsetVolume呼び出しを実行したかを返します。失敗した場合、Soundクラスは全てのインスタンスに対して手動で処理を行います。
		 */
		setVolume:function (value) {
			this.volume = value;
			this.updateVolume();
			return true;
		},

		/**
		 * マスターオーディオのゲイン値を設定します。外部から呼び出してはいけません。
		 * @method updateVolume
		 * @protected
		 */
		updateVolume:function () {
			var newVolume = createjs.Sound.masterMute ? 0 : this.volume;
			if (newVolume != this.gainNode.gain.value) {
				this.gainNode.gain.value = newVolume;
			}
		},

		/**
		 * このプラグインのマスターボリューム値を取得します。マスターボリューム値は全てのSoundInstancesに影響します。
		 * @method getVolume
		 * @return 0～1の間のボリューム値です。
		 */
		getVolume:function () {
			return this.volume;
		},

		/**
		 * プラグインを介してすべての音を消音します。
		 * @method setMute
		 * @param {Boolean} 全ての音を消音するかどうかの値です。プラグインでの消音は Sound クラスの消音の値
		 * {{#crossLink "Sound/masterMute"}}{{/crossLink}} を参照するだけであり、このプロパティはここでは使用されないことに注意してください。
		 * @return {Boolean} 消音が成功したかどうかを返します。
		 */
		setMute:function (value) {
			this.updateVolume();
			return true;
		},

		toString:function () {
			return "[WebAudioPlugin]";
		}

	}

	createjs.WebAudioPlugin = WebAudioPlugin;


	/**
	 * Sound API のメソッド {{#crossLink "Sound/play"}}{{/crossLink}} や {{#crossLink "Sound/createInstance"}}{{/crossLink}} などが呼ばれた際、
	 * 生成される SoundInstance です。SoundInstance は、ユーザーが操作するために使用中のプラグインによって返されます。
	 *
	 * <h4>Example</h4>
	 *      Sound.play("myAssetPath/mySrcFile.mp3");
	 *
	 * 追加パラメータの数により、音が何で再生されているか簡単に特定する事ができます。
	 * 引数リストは Sound API のメソッド {{#crossLink "Sound/play"}}{{/crossLink}} を参照ください。
	 * 
	 * 一度 SoundInstance が生成されると、ユーザーが音声を直接操作できる SoundInstance の参照を保持することができます。
	 * もし、この参照をユーザーが保持しなかった場合、SoundInstance はその音源を最後まで演奏し（ループして演奏し）、
	 * {{#crossLink "Sound"}}{{/crossLink}} クラスからの参照を解除するため、自動で処分されます。
	 * もし保持した参照の音再生が完了していた場合、{{#crossLink "SoundInstance/play"}}{{/crossLink}}インスタンスのメソッドの呼び出しにより、
	 * 操作するための新たなSoundクラスへの参照が生成されます。
	 *
	 *      var myInstance = Sound.play("myAssetPath/mySrcFile.mp3");
	 *      myInstance.addEventListener("complete", playAgain);
	 *      function playAgain(event) {
	 *          myInstance.play();
	 *      }
	 *
	 * 音の再生が完了した場合、ループした場合、再生に失敗した場合に、インスタンスよりイベントが発行されます。
	 * Events are dispatched from the instance to notify when the sound has completed, looped, or when playback fails
	 *
	 *      var myInstance = Sound.play("myAssetPath/mySrcFile.mp3");
	 *      myInstance.addEventListener("complete", playAgain);
	 *      myInstance.addEventListener("loop", handleLoop);
	 *      myInstance.addEventListener("playbackFailed", handleFailed);
	 *
	 *
	 * @class SoundInstance
	 * @param {String} src 音源のパスとファイル名です。
	 * @param {Object} owner この SoundInstance を生成したプラグインインスタンスです。
	 * @uses EventDispatcher
	 * @constructor
	 */
		// TODO noteGrainOn and noteOff have been deprecated in favor of start and stop, once those are implemented in browsers we should make the switch.  http://www.w3.org/TR/webaudio/#deprecation-section
	function SoundInstance(src, owner) {
		this.init(src, owner);
	}

	var p = SoundInstance.prototype = {

		/**
		 * 音源のファイルパスです。
		 * @property src
		 * @type {String}
		 * @default null
		 * @protected
		 */
		src:null,

		/**
		 * インスタンスの一意の ID です。この ID は <code>Sound</code> によって設定されます。
		 * @property uniqueId
		 * @type {String} | Number
		 * @default -1
		 */
		uniqueId:-1,

		/**
		 * 現在の音の状態(state)を示します。音の状態は<code>Sound</code>クラスの定数で定義されています。
		 * @property playState
		 * @type {String}
		 * @default null
		 */
		playState:null,

		/**
         * このインスタンスを生成したプラグインです。
		 * @property owner
		 * @type {WebAudioPlugin}
		 * @default null
		 * @protected
		 */
		owner:null,

		/**
		 * 再生を開始する位置をミリ秒単位で示します。この値は play が呼び出し時に渡され、そのトラックがどの位置にいるかについて
		 * pause と setPosition で参照されます。この値はWebAudio APIの一貫性のために、ミリ秒単位から秒単位に変換される事に注意してください。
		 * @property offset
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		offset:0,

		/**
		 * 音が再生されるまでの時間をミリ秒単位で示します。
		 * このプロパティは<code>Sound</code>によって操作されます。
		 * @property delay
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		delay:0,


		/**
		 * 0～1の間の値をとる音量です。
		 * アクセスには<code>getVolume</code> と <code>setVolume</code>を使って下さい。
		 * @property volume
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		volume:1,

		/**
		 * -1(左)～1(右)の間の値をとる音の定位です。定位はHTML Audioでは機能しない事に注意して下さい。
		 * アクセスには<code>getPan</code> と <code>setPan</code>を使って下さい。
		 * @property pan
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		pan:0,


		/**
		 * 音源の長さをミリ秒単位で示します。
		 * アクセスには<code>getDuration</code>を使ってください。
		 * @property pan
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		duration:0,

		/**
		 * 残りのループ数です。負値は永久にループします。
		 * @property remainingLoops
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		remainingLoops:0,

		/**
		 * SoundInstance が遅延とともに演奏される際に、<code>Sound</code> によって作られるTimeoutです。
		 * これにより、SoundInstanceが再生開始する前に停止、一時停止、インスタンス削除が行われた場合に、遅延を破棄する事が出来るようにします。
		 * @property delayTimeoutId
		 * @type {timeoutVariable}
		 * @default null
		 * @protected
		 * @since 0.4.0
		 */
		delayTimeoutId:null, // OJR should we clear this when playback begins?  If they call play with delay and then just play it will behave oddly.

		/**
		 * 再生完了を操作するために初期化時に生成される Timeout です。
		 * 停止、一時停止、インスタンス削除が行われた際に、このTimeoutを破棄します。
		 * @property soundCompleteTimeout
		 * @type {timeoutVariable}
		 * @default null
		 * @protected
		 * @since 0.4.0
		 */
		soundCompleteTimeout:null,

		/**
		 * このプロパティは <code>WebAudioPlugin</code> にのみ存在し、上級ユーザーが使用する前提である事に注意してください。
		 * panNode は、左右チャンネルの定位の操作のみ行います。<code>context.destination</code>に繋がっている<code>WebAudioPlugin.gainNode</code>に接続します。
		 * @property panNode
		 * @type {AudioPannerNode}
		 * @default null
		 * @since 0.4.0
		 */
		// OJR expose the Nodes for more advanced users, test with LM how it will impact docs
		panNode:null,

		/**
		 * このプロパティは <code>WebAudioPlugin</code> にのみ存在し、上級ユーザーが使用する前提である事に注意してください。
		 * <code>SoundInstance</code>の音量を操作する GainNode です。<code>panNode</code> と接続されます。
		 * @property gainNode
		 * @type {AudioGainNode}
		 * @default null
		 * @since 0.4.0
		 *
		 */
		gainNode:null,

		/**
		 * このプロパティは <code>WebAudioPlugin</code> にのみ存在し、上級ユーザーが使用する前提である事に注意してください。
		 * sourceNode は、音源です。<code>gainNode</code> と接続されます。
		 * @property sourceNode
		 * @type {AudioSourceNode}
		 * @default null
		 * @since 0.4.0
		 *
		 */
		sourceNode:null,

		/**
		 * 現在の消音状態です。アクセスには<code>getMute</code>と<code>setMute</code>を使用してください。
		 * @property muted
		 * @type {Boolean}
		 * @default false
		 * @protected
		 */
		muted:false,

		/**
		 * 現在の一時停止状態です。設定には<code>pause()</code>と<code>resume()</code>を使用してください。
		 * @property paused
		 * @type {Boolean}
		 * @default false
		 * @protected
		 */
		paused:false,

		/**
		 * WebAudioPluginでのみ有効です。秒単位で示します。再生位置の設定と取得、一時停止からの回復時に使われます。
		 * @property startTime
		 * @type {Number}
		 * @default 0
		 * @since 0.4.0
		 */
		startTime:0,

// mix-ins:
		// EventDispatcher methods:
		addEventListener:null,
		removeEventListener:null,
		removeAllEventListeners:null,
		dispatchEvent:null,
		hasEventListener:null,
		_listeners:null,

		// Proxies, make removing listeners easier.
		endedHandler:null,
		readyHandler:null,
		stalledHandler:null,

// Events
		/**
		 * 音源が再生可能になった際に発行されます。
		 * @event ready
		 * @param {Object} target イベントを発行したターゲットオブジェクトです。
		 * @param {String} type イベントタイプです。
		 * @since 0.4.0
		 */

		/**
		 * 音の再生に成功した際に発行されます。
		 * @event succeeded
		 * @param {Object} target イベントを発行したターゲットオブジェクトです。
		 * @param {String} type イベントタイプです。
		 * @since 0.4.0
		 */

		/**
		 * 音の再生が中断した際に発行されます。これは同じ音源の別のインスタンスが中断オプションで再生された際に起こります。
		 * @event interrupted
		 * @param {Object} target イベントを発行したターゲットオブジェクトです。
		 * @param {String} type イベントタイプです。
		 * @since 0.4.0
		 */

		/**
		 * 音の再生に失敗した際に発行されます。これは同じ音源を再生中のチャンネルが多すぎた場合や、
		 * (また、この場合、他インスンタンスの中断は発生しません)、404エラーなどで音源を再生できなかった場合に起こります。
		 * @event failed
		 * @param {Object} target イベントを発行したターゲットオブジェクトです。
		 * @param {String} type イベントタイプです。
		 * @since 0.4.0
		 */

		/**
		 * 音の再生が完了しループ再生がまだ残っている場合に発行されます。
		 * @event loop
		 * @param {Object} target イベントを発行したターゲットオブジェクトです。
		 * @param {String} type イベントタイプです。
		 * @since 0.4.0
		 */

		/**
		 * 音の再生が完了した際に発行されます。これはループ再生も含めて音の再生が終了したことを意味します。
		 * @event complete
		 * @param {Object} target The object that dispatched the event.
		 * @param {String} type The event type.
		 * @since 0.4.0
		 */

// Callbacks
		/**
		 * 音源が再生可能になった際に呼び出されます。
		 * @property onReady
		 * @type {Function}
		 * @deprecated "ready" イベントを使用してください。将来のバージョンで廃止されます。
		 */
		onReady:null,

		/**
		 * 音の再生に成功した際に呼び出されます。
		 * @property onPlaySucceeded
		 * @type {Function}
		 * @deprecated "succeeded" イベントを使用してください。将来のバージョンで廃止されます。
		 */
		onPlaySucceeded:null,

		/**
		 * 音の再生が中断した際に呼び出されます。
		 * @property onPlayInterrupted
		 * @type {Function}
		 * @deprecated "interrupted" イベントを使用してください。将来のバージョンで廃止されます。
		 */
		onPlayInterrupted:null,

		/**
		 * 音の再生に失敗した際に呼び出されます。
		 * @property onPlayFailed
		 * @type {Function}
		 * @deprecated "failed" イベントを使用してください。将来のバージョンで廃止されます。
		 */
		onPlayFailed:null,

		/**
		 * 音の再生が完了した際に呼び出されます。
		 * @property onComplete
		 * @type {Function}
		 * @deprecated "complete" イベントを使用してください。将来のバージョンで廃止されます。
		 */
		onComplete:null,

		/**
		 * 音の再生が完了しループ再生がまだ残っている場合に呼び出されます。
		 * @property onLoop
		 * @type {Function}
		 * @deprecated "loop" イベントを使用してください。将来のバージョンで廃止されます。
		 */
		onLoop:null,


		/**
		 * SoundInstance の全イベントを発行するためのヘルパーメソッドです。
		 * @method sendEvent
		 * @param {String} type The event type
		 * @private
		 */
		sendEvent:function (type) {
			var event = {
				target:this,
				type:type
			};
			this.dispatchEvent(event);
		},

// Constructor
		/**
		 * SoundInstance を初期化します。このメソッドはコンストラクタから呼び出されます。
		 * @method init
		 * @param {string} src 音源のファイルパスです。
		 * @param {Class} owner このインスタンスを生成したプラグインです。
		 * @protected
		 */
		init:function (src, owner) {
			this.owner = owner;
			this.src = src;

			this.panNode = this.owner.context.createPanner();  // allows us to manipulate left and right audio  // TODO test how this affects when we have mono audio

			this.gainNode = this.owner.context.createGainNode();  // allows us to manipulate instance volume
			this.gainNode.connect(this.panNode);  // connect us to our sequence that leads to context.destination

			if (this.owner.isPreloadComplete(this.src)) {
				this.duration = this.owner.arrayBuffers[this.src].duration * 1000;
			}

			this.endedHandler = createjs.proxy(this.handleSoundComplete, this);
			this.readyHandler = createjs.proxy(this.handleSoundReady, this);
			this.stalledHandler = createjs.proxy(this.handleSoundStalled, this);
		},

		/**
		 * インスタンスをきれいにします。参照を削除し、timerのような追加プロパティをすべて削除します。
		 * @method cleanup
		 * @protected
		 */
		cleanUp:function () {
			// if playbackState is UNSCHEDULED_STATE, then noteON or noteGrainOn has not been called so calling noteOff would throw an error
			if (this.sourceNode && this.sourceNode.playbackState != this.sourceNode.UNSCHEDULED_STATE) {
				this.sourceNode.noteOff(0);
				this.sourceNode = null; // release reference so Web Audio can handle removing references and garbage collection
			}

			if (this.panNode.numberOfOutputs != 0) {
				this.panNode.disconnect(0);
			}  // this works because we only have one connection, and it returns 0 if we've already disconnected it.
			// OJR there appears to be a bug that this doesn't always work in webkit (Chrome and Safari). According to the documentation, this should work. // TODO test in safari

			clearTimeout(this.delayTimeoutId); // clear timeout that plays delayed sound
			clearTimeout(this.soundCompleteTimeout);  // clear timeout that triggers sound complete

			if (window.createjs == null) {
				return;
			}
			createjs.Sound.playFinished(this);
		},

		/**
		 * 発音を中断します。
		 * @method interrupt
		 * @protected
		 */
		interrupt:function () {
			this.playState = createjs.Sound.PLAY_INTERRUPTED;
			if (this.onPlayInterrupted) {
				this.onPlayInterrupted(this);
			}
			this.sendEvent("interrupted");
			this.cleanUp();
			this.paused = false;
		},

		// Playback has stalled, and therefore failed.
		handleSoundStalled:function (event) {
			if (this.onPlayFailed != null) {
				this.onPlayFailed(this);
			}
			this.sendEvent("failed");
		},

		// The sound is ready for playing
		handleSoundReady:function (event) {
			if (window.createjs == null) {
				return;
			}

			if (this.offset > this.getDuration()) {
				this.playFailed();
				return;
			} else if (this.offset < 0) {  // may not need this check if noteGrainOn ignores negative values, this is not specified in the API http://www.w3.org/TR/webaudio/#AudioBufferSourceNode
				this.offset = 0;
			}

			this.playState = createjs.Sound.PLAY_SUCCEEDED;
			this.paused = false;

			this.panNode.connect(this.owner.gainNode);  // this line can cause a memory leak.  Nodes need to be disconnected from the audioDestination or any sequence that leads to it.

			// WebAudio supports BufferSource, MediaElementSource, and MediaStreamSource.
			// NOTE MediaElementSource requires different commands to play, pause, and stop because it uses audio tags.
			// The same is assumed for MediaStreamSource, although it may share the same commands as MediaElementSource.
			this.sourceNode = this.owner.context.createBufferSource();
			this.sourceNode.buffer = this.owner.arrayBuffers[this.src];
			this.duration = this.owner.arrayBuffers[this.src].duration * 1000;
			this.sourceNode.connect(this.gainNode);

			this.soundCompleteTimeout = setTimeout(this.endedHandler, (this.sourceNode.buffer.duration - this.offset) * 1000);  // NOTE *1000 because WebAudio reports everything in seconds but js uses milliseconds

			this.startTime = this.owner.context.currentTime - this.offset;
			this.sourceNode.noteGrainOn(0, this.offset, this.sourceNode.buffer.duration - this.offset);
		},

		// Public API
		/**
		 * インスタンスを再生します。このメソッドは、すでに存在する（サウンドAPI {{#crossLink "createInstance"}}{{/crossLink}} で生成されたか、再生を完了しもう一度再生する必要がある場合） SoundInstances を呼び出します。
		 *
		 * <h4>Example</h4>
		 *      var myInstance = createJS.Sound.createInstance(mySrc);
		 *      myInstance.play(createJS.Sound.INTERRUPT_ANY);
		 *
		 * @method play
		 * @param {String} [interrupt=none] 同じ音源の他のインスタンスをどのように中断するか。
		 * 中断方法を指定する値は、{{#crossLink "Sound"}}{{/crossLink}}内に定数として定義されています。デフォルト値は<code>Sound.INTERRUPT_NONE</code>です。
		 * @param {Number} [delay=0] 再生を開始するまでの遅延をミリ秒単位で指定します。
		 * @param {Number} [offset=0] 再生を開始する位置をミリ秒Soundで指定します。
		 * @param {Number} [loop=0] 繰り返し再生する回数を指定します。永久ループの指定には-1を使用して下さい。
		 * @param {Number} [volume=1] 0～1の間で音量を指定します。
		 * @param {Number} [pan=0] -1(左)～1(右)の間で音の定位を指定します。HTML Audioでは定位は動かない事に注意してください。
		 */
		play:function (interrupt, delay, offset, loop, volume, pan) {
			this.cleanUp();
			createjs.Sound.playInstance(this, interrupt, delay, offset, loop, volume, pan);
		},

		/**
		 * 音再生の準備が完了する（遅延が完了する）とSoundクラスから呼ばれます。音源が読み込まれていれば再生を開始しますが、そうでなければ再生に失敗します。
		 * @method beginPlaying
		 * @param {Number} offset 再生を開始する位置をミリ秒単位で指定します。
		 * @param {Number} loop 繰り返し再生する回数を指定します。永久ループの指定には-1を使用して下さい。
		 * @param {Number} volume 0～1の間で音量を指定します。
		 * @param {Number} pan -1(左)～1(右)の間で音の定位を指定します。HTML Audioでは定位は動かない事に注意してください。
		 * @protected
		 */
		beginPlaying:function (offset, loop, volume, pan) {
			if (window.createjs == null) {
				return;
			}

			if (!this.src) {
				return;
			}

			this.offset = offset / 1000;  //convert ms to sec
			this.remainingLoops = loop;
			this.setVolume(volume);
			this.setPan(pan);

			if (this.owner.isPreloadComplete(this.src)) {
				this.handleSoundReady(null);
				this.onPlaySucceeded && this.onPlaySucceeded(this);
				this.sendEvent("succeeded");
				return 1;
			} else {
				this.playFailed();
				return;
			}
		},

		/**
		 * インスタンスの再生を一時停止します。一時停止中の音源は停止しており、{{#crossLink "SoundInstance/resume"}}{{/crossLink}}によって復帰できます。
		 *
		 * <h4>Example</h4>
		 *      myInstance.pause();
		 *
		 * @method pause
		 * @return {Boolean} 一時停止が成功したかを返します。音源が再生中でない場合、falseを返します。
		 */
		pause:function () {
			if (!this.paused && this.playState == createjs.Sound.PLAY_SUCCEEDED) {
				this.paused = true;

				this.offset = this.owner.context.currentTime - this.startTime;  // this allows us to restart the sound at the same point in playback
				this.sourceNode.noteOff(0);  // note this means the sourceNode cannot be reused and must be recreated

				if (this.panNode.numberOfOutputs != 0) {
					this.panNode.disconnect();
				}  // this works because we only have one connection, and it returns 0 if we've already disconnected it.

				clearTimeout(this.delayTimeoutId); // clear timeout that plays delayed sound
				clearTimeout(this.soundCompleteTimeout);  // clear timeout that triggers sound complete
				return true;
			}
			return false;
		},

		/**
		 * {{#crossLink "SoundInstance/pause"}}{{/crossLink}}で一時停止されたインスタンスを復帰します。
		 * 再生を開始していなし音源では、このメソッドを呼び出しても再生しません。
		 * @method resume
		 * @return {Boolean} 復帰に成功したかを返します。音源が一時停止していない場合、falseを返します。
		 */
		resume:function () {
			if (!this.paused) {
				return false;
			}
			this.handleSoundReady(null);
			return true;
		},

		/**
		 * インスタンスの再生を停止します。停止した音は再生位置がリセットされ、{{#crossLink "SoundInstance/resume"}}{{/crossLink}}呼び出しにも失敗します。
		 * @method stop
		 * @return {Boolean} 停止に成功したかを返します。
		 */
		stop:function () {
			this.playState = createjs.Sound.PLAY_FINISHED;
			this.cleanUp();
			this.offset = 0;  // set audio to start at the beginning
			return true;
		},

		/**
		 * インスタンスの音量を設定します。{{#crossLink "SoundInstance/getVolume"}}{{/crossLink}}で現在の音量を取得する事が出来ます。
		 *
		 * <h4>Example</h4>
		 *      myInstance.setVolume(0.5);
		 *
		 * Sound API の{{#crossLink "Sound/setVolume"}}{{/crossLink}} メソッドを使用して設定するマスターボリュームはインスタンスボリュームの上からさらに適用されます。
		 *
		 * @method setVolume
		 * @param value 0～1の間の音量値です。
		 * @return {Boolean} 呼び出しに成功したかを返します。
		 */
		setVolume:function (value) {
			if (Number(value) == null) {
				return false;
			}
			value = Math.max(0, Math.min(1, value));
			this.volume = value;
			this.updateVolume();
			return true;  // This is always true because even if the volume is not updated, the value is set
		},

		/**
		 * インスタンスボリューム、マスターボリューム、インスタンスの消音、及びマスター消音の値を参考に音量値を更新する内部関数です。
		 * @method updateVolume
		 * @return {Boolean} 音量の更新に成功したかを返します。
		 * @protected
		 */
		updateVolume:function () {
			var newVolume = this.muted ? 0 : this.volume;
			if (newVolume != this.gainNode.gain.value) {
				this.gainNode.gain.value = newVolume;
				return true;
			}
			return false;
		},

		/**
		 * インスタンスの音量値を取得します。実際の出力値は下記式によって計算できます：
		 *
		 *      instance.getVolume() x Sound.getVolume();
		 *
		 * @method getVolume
		 * @return インスタンスの現在の音量を返します。
		 */
		getVolume:function () {
			return this.volume;
		},

		/**
		 * 音の消音、消音解除を行います。消音された音であっても音量0で再生されます。消音していない音であっても Soundクラスの音量、インスタンス音量、Soundクラスのmuteによっては消音される事に注意してください。
		 * @method mute
		 * @param {Boolean} value 音が消音されるか、消音解除されるかを指定します。
		 * @return {Boolean} 消音に成功したかを返します。
		 * @deprecated このメソッドはsetMuteに置き換わりました。
		 */
		mute:function (value) {
			this.muted = value;
			this.updateVolume();
			return true;
		},

		/**
		 * 音の消音、消音解除を行います。消音された音であっても音量0で再生されます。消音していない音であっても Soundクラスの音量、インスタンス音量、Soundクラスのmuteによっては消音される事に注意してください。
		 * @method mute
		 * @param {Boolean} value 音が消音されるか、消音解除されるかを指定します。
		 * @return {Boolean} 消音に成功したかを返します。
		 * @since 0.4.0
		 */
		setMute:function (value) {
			if (value == null || value == undefined) {
				return false
			}
			;
			this.muted = value;
			this.updateVolume();
			return true;
		},

		/**
		 * インスタンスの消音状態を取得します。
		 *
		 * <h4>Example</h4>
		 *      var isMuted = myInstance.getMute();
		 *
		 * @method getMute
		 * @return {Boolean} 消音されているかを返します。
		 * @since 0.4.0
		 */
		getMute:function () {
			return this.muted;
		},

		/**
		 * インスタンスの左右定位を設定します。{{#crossLink "HTMLAudioPlugin"}}{{/crossLink}} は定位に対応しておらず、
		 * {{#crossLink "WebAudioPlugin"}}{{/crossLink}}にのみ実装されていることに注意してください。デフォルトは0（中央）です。
		 * @method setPan
		 * @param {Number} -1(左)～1(右)の間で音の定位を指定します。
		 * @return {Number} 呼び出しに成功したかを返します。
		 */
		setPan:function (value) {
			if (this.owner.capabilities.panning) {
				// OJR consider putting in value check to make sure it stays in -1 to 1 bound
				// Note that panning in WebAudioPlugin can support 3D audio, but our implementation does not.
				this.panNode.setPosition(value, 0, -0.5);  // z need to be -0.5 otherwise the sound only plays in left, right, or center
				this.pan = value;  // Unfortunately panner does not give us a way to access this after it is set http://www.w3.org/TR/webaudio/#AudioPannerNode
			} else {
				return false;
			}
		},

		/**
		 * インスタンスの左右定位を取得します。3D音響の場合 WebAudioPlugin はx値しか返さない事に注意して下さい。
		 * @method getPan
		 * @return {Number} -1(左)～1(右)の間で音の定位を指定します。
		 */
		getPan:function () {
			return this.pan;
		},

		/**
		 * インスタンスの再生を開始する位置をミリ秒単位で取得します。
		 * @method getPosition
		 * @return {Number} 音の再生位置をミリ秒単位で返します。
		 The position of the playhead in the sound, in milliseconds.
		 */
		getPosition:function () {
			if (this.paused || this.sourceNode == null) {
				var pos = this.offset;
			} else {
				var pos = this.owner.context.currentTime - this.startTime;
			}

			return pos * 1000; // pos in seconds * 1000 to give milliseconds
		},

		/**
		 * インスタンスの再生を開始する位置をミリ秒単位で設定します。この値は、音の再生中、一時停止中、また停止中であっても設定することができます。
		 *
		 * <h4>Example</h4>
		 *      myInstance.setPosition(myInstance.getDuration()/2); // set audio to it's halfway point.
		 *
		 * @method setPosition
		 * @param {Number} value 音の再生位置をミリ秒単位で返します。
		 */
		setPosition:function (value) {
			this.offset = value / 1000; // convert milliseconds to seconds

			if (this.sourceNode && this.sourceNode.playbackState != this.sourceNode.UNSCHEDULED_STATE) {  // if playbackState is UNSCHEDULED_STATE, then noteON or noteGrainOn has not been called so calling noteOff would throw an error
				this.sourceNode.noteOff(0);  // we need to stop this sound from continuing to play, as we need to recreate the sourceNode to change position
				clearTimeout(this.soundCompleteTimeout);  // clear timeout that triggers sound complete
			}  // NOTE we cannot just call cleanup because it also calls the Sound function playFinished which releases this instance in SoundChannel

			if (!this.paused && this.playState == createjs.Sound.PLAY_SUCCEEDED) {
				this.handleSoundReady(null);
			}

			return true;
		},

		/**
		 * インスタンスの再生時間をミリ秒単位で取得します。
		 * ほとんどの場合、再生時間を正確にするためには{{#crossLink "SoundInstance/play"}}{{/crossLink}} か 
		 * {{#crossLink "Sound.play"}}{{/crossLink}}によって音を再生する必要があります。
		 * @method getDuration
		 * @return {Number} サウンドインスタンスの再生時間をミリ秒単位で返します。
		 */
		getDuration:function () {
			return this.duration;
		},

		// Audio has finished playing. Manually loop it if required.
		// called internally by soundCompleteTimeout in WebAudioPlugin
		handleSoundComplete:function (event) {
			this.offset = 0;  // have to set this as it can be set by pause during playback

			if (this.remainingLoops != 0) {
				this.remainingLoops--;  // NOTE this introduces a theoretical limit on loops = float max size x 2 - 1

				this.handleSoundReady(null);

				if (this.onLoop != null) {
					this.onLoop(this);
				}
				this.sendEvent("loop");
				return;
			}

			if (window.createjs == null) {
				return;
			}
			this.playState = createjs.Sound.PLAY_FINISHED;
			if (this.onComplete != null) {
				this.onComplete(this);
			}
			this.sendEvent("complete");
			this.cleanUp();
		},

		// Play has failed, which can happen for a variety of reasons.
		playFailed:function () {
			if (window.createjs == null) {
				return;
			}
			this.playState = createjs.Sound.PLAY_FAILED;
			if (this.onPlayFailed != null) {
				this.onPlayFailed(this);
			}
			this.sendEvent("failed");
			this.cleanUp();
		},

		toString:function () {
			return "[WebAudioPlugin SoundInstance]";
		}

	}

	// This is for the above SoundInstance.
	createjs.EventDispatcher.initialize(SoundInstance.prototype); // inject EventDispatcher methods.


	/**
	 * XHR経由でweb audio を読み込む際のヘルパークラスです。このクラスとそのメソッドはHTML化をさける目的で文章化していないことに注意してください。
	 * #class WebAudioLoader
	 * @param {String} src 読み込む音源のファイルパスです。
	 * @param {Object} owner このインスタンスを生成したクラスへの参照です。
	 * @constructor
	 */
	function WebAudioLoader(src, owner) {
		this.init(src, owner);
	}

	var p = WebAudioLoader.prototype = {

		// the request object for or XHR2 request
		request:null,

		owner:null,
		progress:-1,

		/**
		 * 読み込む音源のファイルパスです。このクラスを返した場合のコールバック関数内で使用されます。
		 * #property src
		 * @type {String}
		 */
		src:null,

		/**
		 * 読み込みが完了した際に返す、デコードしたAudioBuffer配列です。
		 * #property result
		 * @type {AudioBuffer}
		 * @protected
		 */
		result:null,

		// Calbacks
		/**
		 * ファイル読み込みが完了した際に発行されるコールバックです。HTMLタグに準じています。
		 * #property onload
		 * @type {Method}
		 */
		onload:null,

		/**
		 * ファイル読み込中に発行されるコールバックです。HTMLタグに準じています。
		 * #property onprogress
		 * @type {Method}
		 */
		onprogress:null,

		/**
		 * エラーが発生した際に発行されるコールバックです。HTMLタグに準じています。
		 * #property onError
		 * @type {Method}
		 * @protected
		 */
		onError:null,

		// constructor
		init:function (src, owner) {
			this.src = src;
			this.owner = owner;
		},

		/**
		 * 読み込みを開始します。
		 * #method load
		 * @param {String} src 音源のファイルパスです。
		 */
		load:function (src) {
			if (src != null) {
				this.src = src;
			}

			this.request = new XMLHttpRequest();
			this.request.open("GET", this.src, true);
			this.request.responseType = "arraybuffer";
			this.request.onload = createjs.proxy(this.handleLoad, this);
			this.request.onError = createjs.proxy(this.handleError, this);
			this.request.onprogress = createjs.proxy(this.handleProgress, this);

			this.request.send();
		},

		/**
		 * loaderが進捗を報告します。
		 * #method handleProgress
		 * @param {Number} loaded ロードした量です。
		 * @param {Number} total ロードする全量です。
		 * @private
		 */
		handleProgress:function (loaded, total) {
			this.progress = loaded / total;
			if (this.onprogress == null) {
				return;
			}
			this.onprogress({loaded:loaded, total:total, progress:this.progress});
		},

		/**
		 * 読み込み完了です。
		 * #method handleLoad
		 * @protected
		 */
		handleLoad:function () {
			s.context.decodeAudioData(this.request.response,
					createjs.proxy(this.handleAudioDecoded, this),
					createjs.proxy(this.handleError, this));
		},

		/**
		 * 音源を検出しました。
		 * #method handleAudioDecoded
		 * @protected
		 */
		handleAudioDecoded:function (decodedAudio) {
			this.progress = 1;
			this.result = decodedAudio;
			this.owner.addPreloadResults(this.src, this.result);
			this.onload && this.onload();
		},

		/**
		 * loader内でエラーが発生しました。
		 * Errors have been caused by the loader.
		 * #method handleError
		 * @protected
		 */
		handleError:function (evt) {
			this.owner.removeFromPreload(this.src);
			this.onerror && this.onerror(evt);
		},

		toString:function () {
			return "[WebAudioPlugin WebAudioLoader]";
		}
	}

}());

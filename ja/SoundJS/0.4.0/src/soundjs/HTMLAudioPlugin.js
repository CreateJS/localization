/*
 * HTMLAudioPlugin for SoundJS
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
	 * HTML &lt;audio&gt; タグを使用してブラウザで音を再生します。このプラグインはデフォルトでは、
	 * Chrome、Safari、iOS で対応されている {{#crossLink "WebAudioPlugin"}}{{/crossLink}} に次いで、２番目の優先度でインストールされます。
	 * このプラグインはそれ以外のブラウザで音を扱います。サポート外のブラウザでは {{#crossLink "FlashPlugin"}}{{/crossLink}} をインストールしてください。
	 *
	 * <h4>ブラウザ/OSにおける HTML Audio の既知の問題点</h4>
	 * <b>全ブラウザ</b><br />
	 * 全てのブラウザ上でのテストの結果、Audio タグインスタンスをいくつまで許可されているかについて上限が設けられています。
	 * もしこの上限を超えた場合、予想できない結果となります。Chrome では音源を登録すると、それらを読み込むためにタグを生成するため、
	 * すぐにこの現象がみられます。全ブラウザで安全に使用するに合計いくつまで audio タグを生成するかの設定には、
	 * {{#crossLink "Sound.MAX_INSTANCES"}}{{/crossLink}} を使用してください。
	 *
	 * <b>IE 9 HTML audio における特異な振る舞い</b><br />
     * IE9 では、一度再生を開始してしまうと、タグでの音量の変更に遅延が生じる事がわかっています。
     * このため全音を消音したとしても、内部で消音が適用されるまでのこの遅延の間は、音が再生され続けます。
     * これは、どこで、どのように音量変更を適用したとしても、タグが音再生に必要な以上、必ず起こります。
     *
     * <b>iOS 6 の制限</b><br />
	 * iOS(6+)では {{#crossLink "WebAudioPlugin"}}{{/crossLink}} を使用してください。HTML Audio は1つのlt;audio&gt;タグしか保持することができず、
	 * 事前の読み込みや自動再生、音源のキャッシュ、ユーザーイベントのハンドラ以外での再生はできません。
	 *
     * <b>Android の制限</b><br />
     * <ul><li>SoundJS で音量操作はできません。ユーザーが端末上でのみ音量を設定できます。</li>
     *     <li>ユーザーイベント(タッチイベント)内でのみ音の再生ができます。これはつまり、現状ループ再生ができません。</li>
     *
	 * 既知の問題点に関する一般的な注意点は、{{#crossLink "Sound"}}{{/crossLink}} を参照ください。
	 *
	 * @class HTMLAudioPlugin
	 * @constructor
	 */
	function HTMLAudioPlugin() {
		this.init();
	}

	var s = HTMLAudioPlugin;

	/**
	 * 再生できる最大インスタンス数です。これはブラウザの制限です。
	 * 実際の数はブラウザによって異なります（また大抵の場合、それはハードに依存します）が、これは安全な見積りです。
	 * @property MAX_INSTANCES
	 * @type {Number}
	 * @default 30
	 * @static
	 */
	s.MAX_INSTANCES = 30;

	/**
	 * このプラグインがサポートする機能です。これは SoundInstance の{{#crossLink "TMLAudioPlugin/generateCapabilities"}}{{/crossLink}}メドッドで生成されます。
	 * 適用可能なプラグイン機能の一覧は、Sound クラスの{{#crossLink "Sound/getCapabilities"}}{{/crossLink}} メソッドを参照下さい。
	 * @property capabilities
	 * @type {Object}
	 * @static
	 */
	s.capabilities = null;

	/**
	 * "canPlayThrough" イベントの固定値です。見やすいコードを書くために使用してください。
	 * @property AUDIO_READY
	 * @type {String}
	 * @default canplaythrough
	 * @static
	 */
	s.AUDIO_READY = "canplaythrough";

	/**
	 * "ended" イベントの固定値です。見やすいコードを書くために使用してください。
	 * @property AUDIO_ENDED
	 * @type {String}
	 * @default ended
	 * @static
	 */
	s.AUDIO_ENDED = "ended";

	/**
	 * "error" イベントの固定値です。見やすいコードを書くために使用してください。
	 * @property AUDIO_ERROR
	 * @type {String}
	 * @default error
	 * @static
	 */
	s.AUDIO_ERROR = "error"; //TODO: Handle error cases

	/**
	 * "stalled" イベントの固定値です。見やすいコードを書くために使用してください。
	 * @property AUDIO_STALLED
	 * @type {String}
	 * @default stalled
	 * @static
	 */
	s.AUDIO_STALLED = "stalled";


	/**
	 * 現在のbrowser/OSでこのプラグインが使用可能かを返します。
	 * 制限はありますが、HTML audio は iOS 以外の最近のほとんどのブラウザで対応しています。
	 * @method isSupported
	 * @return {Boolean} プラグインが初期化されたかを返します。
	 * @static
	 */
	s.isSupported = function () {
		if (createjs.Sound.BrowserDetect.isIOS) {
			return false;
		}
		// You can enable this plugin on iOS by removing this line, but it is not recommended due to the limitations:
		// iOS can only have a single <audio> instance, cannot preload or autoplay, cannot cache sound, and can only be
		// played in response to a user event (click)
		s.generateCapabilities();
		var t = s.tag;  // OJR do we still need this check, when cap will already be null if this is the case
		if (t == null || s.capabilities == null) {
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
		var t = s.tag = document.createElement("audio");
		if (t.canPlayType == null) {
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
	}

	var p = s.prototype = {

		/**
		 * このプラグインがサポートする機能で、{{#crossLink "HTMLAudioPlugin/generateCapabilities"}}{{/crossLink}} で生成されます。
		 * method.
		 */
		capabilities:null,

		/**
		 * 各音源に対して読込み済/読込み中を示す、ID でインデックスされたハッシュです。
		 * @property audioSources
		 * @type {Object}
		 * @protected
		 * @since 0.4.0
		 */
		audioSources:null,

		/**
		 * 許容されるデフォルトインスタンス数です。{{#crossLink "Sound/register"}}{{/crossLink}}メソッドで音源が登録される際に
		 * {{#crossLink "Sound"}}{{/crossLink}} クラスに渡されます。これは、値が設定されていない場合にのみ使用されます。
		 * <b>このプロパティはHTML audioの制限のためだけに存在しています</b>
		 * @property defaultNumChannels
		 * @type {Number}
		 * @default 2
		 * @since 0.4.0
		 */
		defaultNumChannels:2,

		/**
		 * コンストラクタから呼ばれる初期化関数です。
		 * @method init
		 * @private
		 */
		init:function () {
			this.capabilities = s.capabilities;
			this.audioSources = {};
		},

		/**
		 * サウンドインスタンスの読み込み/設定の際、そのインスタンスを登録します。このメソッドは{{#crossLink "Sound"}}{{/crossLink}}から呼び出されます。
		 * このメソッドは、<a href="http://preloadjs.com">PreloadJS</a> が対応できるように、読み込みに用いるタグを含むオブジェクトを返します。
		 * @method register
		 * @param {String} src 音源のファイルパスです。
		 * @param {Number} instances チャンネルが同時に再生できるインスタンス数です。
		 * @return {Object} 読み込みに用いるタグと、内部で幾つのインスタンスを操作できるかをしめす numChannnels値 を含む Object です。
		 */
		register:function (src, instances) {
			this.audioSources[src] = true;  // Note this does not mean preloading has started
			var channel = TagPool.get(src);
			var tag = null;
			var l = instances || this.defaultNumChannels;
			for (var i = 0; i < l; i++) {  // OJR should we be enforcing s.MAX_INSTANCES here?  Does the chrome bug still exist, or can we change this code?
				tag = this.createTag(src);
				channel.add(tag);
			}
			return {
				tag:tag, // Return one instance for preloading purposes
				numChannels:l  // The default number of channels to make for this Sound or the passed in value
			};
		},

		/**
		 * HTML audio タグを生成します。
		 * @method createTag
		 * @param {String} src audio タグに設定する音源ファイルです。
		 * @return {HTMLElement} HTML audio タグのDOMエレメントを返します。
		 * @protected
		 */
		createTag:function (src) {
			var tag = document.createElement("audio");
			tag.autoplay = false;
			tag.preload = "none";
			tag.src = src;
			return tag;
		},

		/**
		 * サウンドインスタンスを生成します。音がまだ読み込まれていない場合、内部的にこの関数で読み込みます。
		 * @method create
		 * @param {String} src 使用する音源のファイルパスです。
		 * @return {SoundInstance} 再生、操作を行うサウンドインスタンスを返します。
		 */
		create:function (src) {
			// if this sound has not be registered, create a tag and preload it
			if (!this.isPreloadStarted(src)) {
				var channel = TagPool.get(src);
				var tag = this.createTag(src);
				channel.add(tag);
				this.preload(src, {tag:tag});
			}

			return new SoundInstance(src, this);
		},

		/**
		 * 指定した音源の読み込みが開始されているかを確認します。
		 * @method isPreloadStarted
		 * @param {String} src 確認する音源のURIです。
		 * @return {Boolean} 読み込みを開始しているかを返します。
		 * @since 0.4.0
		 */
		isPreloadStarted:function (src) {
			return (this.audioSources[src] != null);
		},

		/**
		 * 内部で音源を読み込みます。
		 * @method preload
		 * @param {String} src 読み込む音源のURIです。
		 * @param {Object} instance HTML audio タグが音源を読む込むために使用するプロパティを含むオブジェクトを返します。
		 * @since 0.4.0
		 */
		preload:function (src, instance) {
			this.audioSources[src] = true;
			new HTMLAudioLoader(src, instance.tag);
		},

		toString:function () {
			return "[HTMLAudioPlugin]";
		}

	}

	createjs.HTMLAudioPlugin = HTMLAudioPlugin;


// NOTE Documentation for the SoundInstance class in WebAudioPlugin file. Each plugin generates a SoundInstance that
// follows the same interface.
	function SoundInstance(src, owner) {
		this.init(src, owner);
	}

	var p = SoundInstance.prototype = {

		src:null,
		uniqueId:-1,
		playState:null,
		owner:null,
		loaded:false,
		offset:0,
		delay:0,
		volume:1,
		pan:0,
		duration:0,
		remainingLoops:0,
		delayTimeoutId:null,
		tag:null,
		muted:false,
		paused:false,

// mix-ins:
		// EventDispatcher methods:
		addEventListener:null,
		removeEventListener:null,
		removeAllEventListeners:null,
		dispatchEvent:null,
		hasEventListener:null,
		_listeners:null,

// Callbacks
		onComplete:null,
		onLoop:null,
		onReady:null,
		onPlayFailed:null,
		onPlayInterrupted:null,
		onPlaySucceeded:null,

		// Proxies, make removing listeners easier.
		endedHandler:null,
		readyHandler:null,
		stalledHandler:null,

// Constructor
		init:function (src, owner) {
			this.src = src;
			this.owner = owner;

			this.endedHandler = createjs.proxy(this.handleSoundComplete, this);
			this.readyHandler = createjs.proxy(this.handleSoundReady, this);
			this.stalledHandler = createjs.proxy(this.handleSoundStalled, this);
		},

		sendEvent:function (eventString) {
			var event = {
				target:this,
				type:eventString
			};
			this.dispatchEvent(event);
		},

		cleanUp:function () {
			var tag = this.tag;
			if (tag != null) {
				tag.pause();
				try {
					tag.currentTime = 0;
				} catch (e) {
				} // Reset Position
				tag.removeEventListener(createjs.HTMLAudioPlugin.AUDIO_ENDED, this.endedHandler, false);
				tag.removeEventListener(createjs.HTMLAudioPlugin.AUDIO_READY, this.readyHandler, false);
				TagPool.setInstance(this.src, tag);
				this.tag = null;
			}

			clearTimeout(this.delayTimeoutId);
			if (window.createjs == null) {
				return;
			}
			createjs.Sound.playFinished(this);
		},

		interrupt:function () {
			if (this.tag == null) {
				return;
			}
			this.playState = createjs.Sound.PLAY_INTERRUPTED;
			if (this.onPlayInterrupted) {
				this.onPlayInterrupted(this);
			}
			this.sendEvent("interrupted");
			this.cleanUp();
			this.paused = false;
		},

// Public API
		play:function (interrupt, delay, offset, loop, volume, pan) {
			this.cleanUp(); //LM: Is this redundant?
			createjs.Sound.playInstance(this, interrupt, delay, offset, loop, volume, pan);
		},

		beginPlaying:function (offset, loop, volume, pan) {
			if (window.createjs == null) {
				return -1;
			}
			var tag = this.tag = TagPool.getInstance(this.src);
			if (tag == null) {
				this.playFailed();
				return -1;
			}

			this.duration = this.tag.duration * 1000;
			// OJR would like a cleaner way to do this in init, discuss with LM
			// need this for setPosition on stopped sounds

			tag.addEventListener(createjs.HTMLAudioPlugin.AUDIO_ENDED, this.endedHandler, false);

			// Reset this instance.
			this.offset = offset;
			this.volume = volume;
			this.updateVolume();  // note this will set for mute and masterMute
			this.remainingLoops = loop;

			if (tag.readyState !== 4) {
				tag.addEventListener(createjs.HTMLAudioPlugin.AUDIO_READY, this.readyHandler, false);
				tag.addEventListener(createjs.HTMLAudioPlugin.AUDIO_STALLED, this.stalledHandler, false);
				tag.load();
			} else {
				this.handleSoundReady(null);
			}

			this.onPlaySucceeded && this.onPlaySucceeded(this);
			this.sendEvent("succeeded");
			return 1;
		},

		// Note: Sounds stall when trying to begin playback of a new audio instance when the existing instances
		//  has not loaded yet. This doesn't mean the sound will not play.
		handleSoundStalled:function (event) {
			if (this.onPlayFailed != null) {
				this.onPlayFailed(this);
			}
			this.sendEvent("failed");
			this.cleanUp();  // OJR NOTE this will stop playback, and I think we should remove this and let the developer decide how to handle stalled instances
		},

		handleSoundReady:function (event) {
			if (window.createjs == null) {
				return;
			}
			this.playState = createjs.Sound.PLAY_SUCCEEDED;
			this.paused = false;
			this.tag.removeEventListener(createjs.HTMLAudioPlugin.AUDIO_READY, this.readyHandler, false);

			if (this.offset >= this.getDuration()) {
				this.playFailed();  // OJR: throw error?
				return;
			} else if (this.offset > 0) {
				this.tag.currentTime = this.offset * 0.001;
			}
			if (this.remainingLoops == -1) {
				this.tag.loop = true;
			}
			this.tag.play();
		},

		pause:function () {
			if (!this.paused && this.playState == createjs.Sound.PLAY_SUCCEEDED && this.tag != null) {
				this.paused = true;
				// Note: when paused by user, we hold a reference to our tag. We do not release it until stopped.
				this.tag.pause();

				clearTimeout(this.delayTimeoutId);

				return true;
			}
			return false;
		},

		resume:function () {
			if (!this.paused || this.tag == null) {
				return false;
			}
			this.paused = false;
			this.tag.play();
			return true;
		},

		stop:function () {
			this.offset = 0;
			this.pause();
			this.playState = createjs.Sound.PLAY_FINISHED;
			this.cleanUp();
			return true;
		},

		setMasterVolume:function (value) {
			this.updateVolume();
			return true;
		},

		setVolume:function (value) {
			if (Number(value) == null) {
				return false;
			}
			value = Math.max(0, Math.min(1, value));
			this.volume = value;
			this.updateVolume();
			return true;
		},

		updateVolume:function () {
			if (this.tag != null) {
				var newVolume = (this.muted || createjs.Sound.masterMute) ? 0 : this.volume * createjs.Sound.masterVolume;
				if (newVolume != this.tag.volume) {
					this.tag.volume = newVolume;
				}
				return true;
			} else {
				return false;
			}
		},

		getVolume:function (value) {
			return this.volume;
		},

		mute:function (isMuted) {
			this.muted = isMuted;
			this.updateVolume();
			return true;
		},

		setMasterMute:function (isMuted) {
			this.updateVolume();
			return true;
		},

		setMute:function (isMuted) {
			if (isMuted == null || isMuted == undefined) {
				return false
			}
			;

			this.muted = isMuted;
			this.updateVolume();
			return true;
		},

		getMute:function () {
			return this.muted;
		},

		setPan:function (value) {
			return false;
		}, // Can not set pan in HTML

		getPan:function () {
			return 0;
		},

		getPosition:function () {
			if (this.tag == null) {
				return this.offset;
			}
			return this.tag.currentTime * 1000;
		},

		setPosition:function (value) {
			if (this.tag == null) {
				this.offset = value
			} else try {
				this.tag.currentTime = value * 0.001;
			} catch (error) { // Out of range
				return false;
			}
			return true;
		},

		getDuration:function () {  // NOTE this will always return 0 until sound has been played.
			return this.duration;
		},

		handleSoundComplete:function (event) {
			this.offset = 0;

			if (this.remainingLoops != 0) {
				this.remainingLoops--;

				//try { this.tag.currentTime = 0; } catch(error) {}
				this.tag.play();
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
			return "[HTMLAudioPlugin SoundInstance]";
		}

	}

	createjs.EventDispatcher.initialize(SoundInstance.prototype);

	// Do not add SoundInstance to namespace.


	/**
	 * HTMLAudioElement タグを用いて html audio を読み込むための内部ヘルパークラスです。
	 * Flash and WebAudio plugins と異なり、PreloadJS はこの読み込みクラスを使わない点に注意してください。
	 * また、HTMLドキュメントの生成を避けるために、このクラスとメソッドはドキュメント化されません。
	 * #class HTMLAudioLoader
	 * @param {String} src 読み込む音源のファイルパスです。
	 * @param {HTMLAudioElement} tag 読み込む音源の Audio タグです。
	 * @constructor
	 * @private
	 * @since 0.4.0
	 */
	function HTMLAudioLoader(src, tag) {
		this.init(src, tag);
	}

	HTMLAudioLoader.prototype = {

		/**
		 * 読み込む音源のファイルパスです。
		 * #property src
		 * @type {String}
		 * @default null
		 * @protected
		 */
		src:null,

		/**
		 * 音源を読み込んで入れる Audio タグです。
		 * #property tag
		 * @type {AudioTag}
		 * @default null
		 * @protected
		 */
		tag:null,

		/**
		 * 進行度を通知する間隔です。
		 * #property preloadTimer
		 * @type {String}
		 * @default null
		 * @protected
		 */
		preloadTimer:null,

		// Proxies, make removing listeners easier.
		loadedHandler:null,

		// constructor
		init:function (src, tag) {
			this.src = src;
			this.tag = tag;

			this.preloadTimer = setInterval(createjs.proxy(this.preloadTick, this), 200);


			// This will tell us when audio is buffered enough to play through, but not when its loaded.
			// The tag doesn't keep loading in Chrome once enough has buffered, and we have decided that behaviour is sufficient.
			// Note that canplaythrough callback doesn't work in Chrome, we have to use the event.
			this.loadedHandler = createjs.proxy(this.sendLoadedEvent, this);  // we need this bind to be able to remove event listeners
			this.tag.addEventListener && this.tag.addEventListener("canplaythrough", this.loadedHandler);
			this.tag.onreadystatechange = createjs.proxy(this.sendLoadedEvent, this);  // OJR not 100% sure we need this, just copied from PreloadJS

			this.tag.preload = "auto";
			this.tag.src = src;
			this.tag.load();

		},

		/**
		 * 読み込みの進行度を通知するために使用します。
		 * #method preloadTick
		 * @protected
		 */
		preloadTick:function () {
			var buffered = this.tag.buffered;
			var duration = this.tag.duration;

			if (buffered.length > 0) {
				if (buffered.end(0) >= duration - 1) {
					this.handleTagLoaded();
				}
			}
		},

		/**
		 * タグの読み込みが完了した際に内部的に呼ばれるハンドラです。
		 * #method handleTagLoaded
		 * @protected
		 */
		handleTagLoaded:function () {
			clearInterval(this.preloadTimer);
		},

		/**
		 * Sound クラスに対して読み込みの完了を伝えるために使用します。
		 * #method sendLoadedEvent
		 * @param {Object} evt load イベントです
		 */
		sendLoadedEvent:function (evt) {
			this.tag.removeEventListener && this.tag.removeEventListener("canplaythrough", this.loadedHandler);  // cleanup and so we don't send the event more than once
			this.tag.onreadystatechange = null;  // cleanup and so we don't send the event more than once
			createjs.Sound.sendLoadComplete(this.src);  // fire event or callback on Sound
		},

		// used for debugging
		toString:function () {
			return "[HTMLAudioPlugin HTMLAudioLoader]";
		}
	}

	// Do not add HTMLAudioLoader to namespace


	/**
	 * TagPool は HTMLAudio タグインスタンスのオブジェクトプールです。Chrome では、データを読み込む前に
	 * 再生に必要な分の HTML audio タグインスタンスをあらかじめ生成しておく必要があり、生成していないと音が再生できません。
	 * (注釈: これはChrome のバグと思われます)
	 * #class TagPool
	 * @param {String} src チャンネルで使用する音源のファイルパスです。
	 * @private
	 */
	function TagPool(src) {
		this.init(src);
	}

	/**
	 * ファイルパスでインデックスされた、サウンドチャンネルを探すためのハッシュテーブルです。
	 * #property tags
	 * @static
	 * @private
	 */
	TagPool.tags = {};

	/**
	 * タグのプールを取得します。プールがない場合は生成して返します。
	 * #method get
	 * @param {String} src audio タグで使用される音源のファイルパスです。
	 * @static
	 * @private
	 */
	TagPool.get = function (src) {
		var channel = TagPool.tags[src];
		if (channel == null) {
			channel = TagPool.tags[src] = new TagPool(src);
		}
		return channel;
	}

	/**
	 * タグインスタンスを取得します。これはショートカットメソッドです。
	 * #method getInstance
	 * @param {String} src タグで使用される音源のファイルパスです。
	 * @static
	 * @private
	 */
	TagPool.getInstance = function (src) {
		var channel = TagPool.tags[src];
		if (channel == null) {
			return null;
		}
		return channel.get();
	}

	/**
	 * タグインスタンスを返します（訳注；原文では Return a tag instance.と書かれています）。これはショートカットメソッドです。
	 * #method setInstance
	 * @param {String} src タグで使用される音源のファイルパスです。
	 * @param {HTMLElement} tag 設定する Audio タグです。
	 * @static
	 * @private
	 */
	TagPool.setInstance = function (src, tag) {
		var channel = TagPool.tags[src];
		if (channel == null) {
			return null;
		}
		return channel.set(tag);
	}

	TagPool.prototype = {

		/**
		 * タグプールのソースです。
		 * #property src
		 * @type {String}
		 * @private
		 */
		src:null,

		/**
		 * プール内にストックされている HTMLAudio タグの総数です。これは一度に再生できるインスタンスの最大数です。
		 * #property length
		 * @type {Number}
		 * @default 0
		 * @private
		 */
		length:0,

		/**
		 * 未使用の HTMLAudio タグの数です。
		 * #property available
		 * @type {Number}
		 * @default 0
		 * @private
		 */
		available:0,

		/**
		 * プール内の全タグのリストです。
		 * #property tags
		 * @type {Array}
		 * @private
		 */
		tags:null,

		// constructor
		init:function (src) {
			this.src = src;
			this.tags = [];
		},

		/**
		 * HTMLAudio タグをプールに追加します。
		 * #method add
		 * @param {HTMLAudioElement} tag 再生に使用するタグです。
		 */
		add:function (tag) {
			this.tags.push(tag);
			this.length++;
			this.available++;
		},

		/**
		 * 再生のために、HTMLAudioElement を取得します。このメソッドはタグエレメントをプールから取り出します。
		 * Get an HTMLAudioElement for immediate playback. This takes it out of the pool.
		 * #method get
		 * @return {HTMLAudioElement} An HTML audio tag.
		 */
		get:function () {
			if (this.tags.length == 0) {
				return null;
			}
			this.available = this.tags.length;
			var tag = this.tags.pop();
			if (tag.parentNode == null) {
				document.body.appendChild(tag);
			}
			return tag;
		},

		/**
		 * HTMLAudioElement 使用できるようにプールに戻します。
		 * #method set
		 * @param {HTMLAudioElement} tag HTML audio タグです。
		 */
		set:function (tag) {
			var index = this.tags.indexOf(tag);
			if (index == -1) {
				this.tags.push(tag);
			}
			this.available = this.tags.length;
		},

		toString:function () {
			return "[HTMLAudioPlugin TagPool]";
		}

	}

	// do not add TagPool to namespace

}());

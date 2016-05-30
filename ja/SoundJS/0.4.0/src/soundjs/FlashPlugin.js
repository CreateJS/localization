/*
 * FlashPlugin for SoundJS
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

// namespace:zz
this.createjs = this.createjs || {};

(function () {

	/**
	 * Flash インスタンスを用いて音を再生します。このプラグインはデフォルトでは使用されないため、
	 * {{#crossLink "Sound/registerPlugins"}}{{/crossLink}} メソッドを用いて {{#crossLink "Sound"}}{{/crossLink}} に手動で登録する必要があります。
	 * このプラグインは IE8 のような古いブラウザへの対応が必要な場合にのみ組み込むことが推奨されます。
	 *
	 * このプラグインは FlashAudioPlugin.swf と swfObject.js (swfObject.js は圧縮した FlashPlugin-X.X.X.min.js ファイル内に含まれています) を必要とします 。
	 * このプラグインを使用する際には、スクリプトが swf ファイルを見つけられるように <code>FlashPlugin.BASE_PATH</code> が設定されているかを確認してください。
	 *
	 * <h4>実装例</h4>
	 *      createjs.FlashPlugin.BASE_PATH = "../src/SoundJS/";
	 *      createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
	 *      // WebAudio と HTMLAudio が動かなかった場合の予備として FlashPlugin を追加します。
	 *
	 * @class FlashPlugin
	 * @constructor
	 */
	function FlashPlugin() {
		this.init();
	}

	var s = FlashPlugin;

	/**
	 * プラグインがサポートする機能です。このプロパティは {{#crossLink "WebAudioPlugin/generateCapabilities"}}{{/crossLink}} メソッド内で生成されます。
	 * 機能の一覧は、Sound クラスの{{#crossLink "Sound/getCapabilities"}}{{/crossLink}}を参照下さい。
	 * @property capabilities
	 * @type {Object}
	 * @static
	 */
	s.capabilities = null;

	/**
	 * FlashAudioPlugin.swf の HTML ページからの相対パスです。このパスが正しくないとプラグインが作動しない点に注意してください。
	 * @property BASE_PATH
	 * @type {String}
	 * @default src/SoundJS
	 * @static
	 */
	s.BASE_PATH = "src/SoundJS/";

	/**
	 * 現在のbrowser/OSでこのプラグインが使用可能かを返します。
	 * @method isSupported
	 * @return {Boolean} If the plugin can be initialized.
	 * @static
	 */
	s.isSupported = function () {
		if (createjs.Sound.BrowserDetect.isIOS) {
			return false;
		}
		s.generateCapabilities();
		if (swfobject == null) {
			return false;
		}
		return swfobject.hasFlashPlayerVersion("9.0.0");
		//TODO: Internal detection instead of SWFObject?
	};

	/**
	 * このプラグインがサポートする機能を返します。このメソッドは内部で使用されます。機能の一覧は、Sound クラスの{{#crossLink "Sound/getCapabilities"}}{{/crossLink}}を参照下さい。
	 * @method generateCapabiities
	 * @static
	 * @protected
	 */
	s.generateCapabilities = function () {
		if (s.capabilities != null) {
			return;
		}
		// TODO change to support file types using SUPPORTED_EXTENSIONS like other plugins if possible
		// see http://helpx.adobe.com/flash/kb/supported-codecs-flash-player.html
		var c = s.capabilities = {
			panning:true,
			volume:true,
			tracks:-1,
			mp3:true,
			ogg:false,
			mpeg:true,
			wav:true,
			m4a:true,
			mp4:true,
			aiff:false, // not listed in player but is Supported by Flash so this may be true
			wma:false,
			mid:false
		};
	};


	var p = s.prototype = {

		/**
		 * 各音源に対して読込み済/読込み中を示す、ID でインデックスされたハッシュです。
		 * @property audioSources
		 * @type {Object}
		 * @protected
		 */
		audioSources:null, // object hash that tells us if an audioSource has started loading

		/**
		 * プラグイン内部の音量の値です。
		 * @property volume
		 * @type {Number}
		 * @default 1
		 * @protected
		 */
		volume:1,

		/**
		 * Flashコンテンツを生成するための DIV タグ要素の id 名です。
		 * @property CONTAINER_ID
		 * @type {String}
		 * @default flashAudioContainer
		 * @protected
		 */
		CONTAINER_ID:"flashAudioContainer",

		/**
		 * このプラグインがサポートする機能を定義するObjectです。プラグイン機能のより詳細な情報は、Sound クラスの{{#crossLink "Sound/getCapabilities"}}{{/crossLink}}を参照下さい。
		 * @property capabilities
		 * @type {Object}
		 * @protected
		 */
		capabilities:null,

// FlashPlugin Specifics
		/**
		 * Flash インスタンスを保持するために生成される DIV タグ要素への参照です。
		 * @property container
		 * @type {HTMLDivElement}
		 * @protected
		 */
		container:null,

		/**
		 * 生成される Flash インスタンスへの参照です。
		 * @property flash
		 * @type {Object | Embed}
		 * @protected
		 */
		flash:null,

		/**
		 * Flash オブジェクトが生成され、初期化が完了しているかを示します。
		 * このプロパティは JavaScript から Flash へ <code>ExternalInterface</code> による呼び出しを行うために用意されています。
		 * @property flashReady
		 * @type {Boolean}
		 * @default false
		 */
		flashReady:false,

		/**
		 * Flash 内の関連 ID でインデックスされた SoundInscance のハッシュです。
		 * このハッシュは、JavaScript内の音と、Flash内で関連したインスタンスを結びつけるために使われます。
		 * @property flashInstances
		 * @type {Object}
		 * @protected
		 */
		flashInstances:null,

		/**
		 * Flash 内の関連 ID でインデックスされた Sound Preload インスタンスのハッシュです。
		 * このハッシュは、Flash 内で読み込む音と、JavaScript内の関連したインスタンスを結びつけるために使われます。
		 * @property flashPreloadInstances
		 * @type {Object}
		 * @protected
		 */
		flashPreloadInstances:null,

		/**
		 * 音源のファイルパスでインデックスされた Sound Preload インスタンスのハッシュです。
		 * このハッシュは Flash オブジェクトが使用不可能で、内部読み込みを行おうとした場合に、音源を読み込むために使われます。
		 * @property preloadInstances
		 * @type {Object}
		 * @protected
		 * @since 0.4.0
		 */
		preloadInstances:null,

		/**
		 * 読み込み待ちの Sound Preload インスタンスの配列です。Flash の初期化が完了すると、この配列のインスタンスが読み込まれます。
		 * @property queuedInstances
		 * @type {Object}
		 * @protected
		 */
		queuedInstances:null,

		/**
		 * 全Flashイベントをコンソール上に(コンソールが存在すれば)出力する、開発者向けのフラグです。デバッグ時にご使用ください。
		 *
		 *      Sound.activePlugin.showOutput = true;
		 *
		 * @property showOutput
		 * @type {Boolean}
		 * @default false
		 */
		showOutput:false,

		/**
		 * コンストラクタから呼び出される初期化用関数です。
		 * @method init
		 * @protected
		 */
		init:function () {
			this.capabilities = s.capabilities;
			this.audioSources = {};

			this.flashInstances = {};
			this.flashPreloadInstances = {};
			this.preloadInstances = {};
			this.queuedInstances = [];

			// Create DIV
			var c = this.container = document.createElement("div");
			c.id = this.CONTAINER_ID;
			c.appendChild(document.createTextNode("Default Content Here"));
			document.body.appendChild(c);

			// Embed SWF
			var val = swfobject.embedSWF(s.BASE_PATH + "FlashAudioPlugin.swf", this.CONTAINER_ID, "1", "1", //550", "400",
					"9.0.0", null, null, null, null,
					createjs.proxy(this.handleSWFReady, this)
			);

			//TODO: Internal detection instead of swfobject
		},

		/**
		 * 音の読み込みと再生を行う SWF オブジェクトを初期化します。
		 * @method handleSWFReady
		 * @param {Object} event swf への参照を含んでいます。
		 * @protected
		 */
		handleSWFReady:function (event) {
			this.flash = event.ref;
			this.loadTimeout = setTimeout(createjs.proxy(this.handleTimeout, this), 2000);  // OJR note this function doesn't do anything right now
		},

		/**
		 * 音の読み込みと再生を行う Flash アプリケーションの準備が完了した場合に
		 * 再生を開始する前に全ての処理が完了しているかを確認するために Flash からの呼び出しを待ちます。
		 * @method handleFlashReady
		 * @protected
		 */
		handleFlashReady:function () {
			this.flashReady = true;

			// Anything that needed to be preloaded, can now do so.
			for (var i = 0, l = this.queuedInstances.length; i < l; i++) {
				this.flash.register(this.queuedInstances[i]);  // NOTE this flash function currently does nothing
			}
			this.queuedInstances = null;

			// Associate flash instance with any preloadInstance that already exists.
			for (var n in this.flashPreloadInstances) {
				this.flashPreloadInstances[n].initialize(this.flash);
			}

			// load sounds that tried to preload before flash was ready
			for (var n in this.preloadInstances) {
				this.preloadInstances[n].initialize(this.flash);
			}
			this.preloadInstances = null;

			// Associate flash instance with any sound instance that has already been played.
			for (var n in this.flashInstances) {
				this.flashInstances[n].initialize(this.flash);
			}
		},

		/**
		 * Flash が初期化されない場合に呼び出されます。通常、swfが見つからないか、パスが間違えている事を意味します。
		 * @method handleTimeout
		 * @protected
		 */
		handleTimeout:function () {
			//LM: Surface to user? AUDIO_FLASH_FAILED
			// OJR we could dispatch an error event
		},

		/**
		 * サウンドインスタンスの読み込み/設定の際、そのインスタンスを登録します。
		 * Flash は ブラウザキャッシュにアクセスできないため、FlashPlugin は 読み込み用 SoundSoundLoader インスタンスを返すことに注意してください。
		 * @method register
		 * @param {String} src 音源のファイルパスです。
		 * @param {Number} instances チャンネルが同時に再生できるインスタンス数です。
		 * @return {Object} 読み込みに用いるタグを含む Object です。
		 */
		register:function (src, instances) {
			//Note that currently, registering with the flash instance does nothing.
			this.audioSources[src] = true;  // NOTE this does not mean preloading has started
			if (!this.flashReady) {
				this.queuedInstances.push(src);
			} else {
				this.flash.register(src);  // NOTE this flash function currently does nothing  // OJR remove this entire thing, as it does nothing?
			}
			var tag = new SoundLoader(src, this, this.flash);
			return {
				tag:tag
			};
		},

		/**
		 * サウンドインスタンスを生成します。音がまだ読み込まれていない場合、内部的にこの関数で読み込みます。
		 * @method create
		 * @param {String} src 音源のファイルパスです。
		 * @return {SoundInstance} 再生、操作を行うサウンドインスタンスを返します。
		 */
		create:function (src) {
			if (!this.isPreloadStarted(src)) {
				this.preload(src);
			}

			try {
				var instance = new SoundInstance(src, this, this.flash);
				return instance;
			} catch (err) {  // OJR why would this ever fail?
				//console.log("Error: Please ensure you have permission to play audio from this location.", err);
			}
			return null;
		},

		/**
		 * 指定した音源の読み込みが開始されているかを確認します。
		 * もし音源が見つかった場合、その音源は読み込み中か、読み込みを完了してるものと見なせます。
		 * @method isPreloadStarted
		 * @param {String} src 確認する音源のURIです。
		 * @return {Boolean}
		 */
		isPreloadStarted:function (src) {
			return (this.audioSources[src] != null);
		},

		/**
		 * サウンドインスタンスを読み込みます。このプラグインでは全音の読み込みと再生に Flash を用います。
		 * Preload a sound instance. This plugin uses Flash to preload and play all sounds.
		 * @method preload
		 * @param {String} src 音源のファイルパスです。
		 * @param {Object} instance このプラグインでは使用しません。
		 */
		preload:function (src, instance) {
			this.audioSources[src] = true;  // NOTE this does not mean preloading has started, just that it will
			var loader = new SoundLoader(src, this, this.flash);
			loader.load();  // this will handle if flash is not ready
			/*if (!loader.load(src)) {  // NOTE this returns false if flash is not ready
			 this.preloadInstances[src] = loader;
			 }*/
		},

		/**
		 * 全部の SoundInstance に影響を与える、プラグインのマスターボリュームを設定します。
		 * @method setVolume
		 * @param {Number} value 0 から 1 の間の音量値です。
		 * @return {Boolean} プラグインが音量設定を実行したらtrueを返します。false の場合、Sound クラスは全インスタンスに対して手動で実行しなくてはなりません。
		 * @since 0.4.0
		 */
		setVolume:function (value) {
			this.volume = value;
			return this.updateVolume();
		},

		/**
		 * 内部でマスター音のゲイン値を設定するための関数です。外部から呼び出さないで下さい。
		 * @method updateVolume
		 * @return {Boolean}
		 * @protected
		 * @since 0.4.0
		 */
		updateVolume:function () {
			var newVolume = createjs.Sound.masterMute ? 0 : this.volume;
			return this.flash.setMasterVolume(newVolume);
		},

		/**
		 * 全部の SoundInstance に影響を与える、プラグインのマスターボリュームを取得します。
		 * @method getVolume
		 * @return 0 から 1 の間の音量値を返します。
		 * @since 0.4.0
		 */
		getVolume:function () {
			return this.volume;
		},

		/**
		 * プラグインから全音を消音します。
		 * @method setMute
		 * @param {Boolean} value If all sound should be muted or not. Note that plugin-level muting just looks up
		 * the mute value of Sound {{#crossLink "Sound/masterMute"}}{{/crossLink}}, so this property is not used here.
		 * @return {Boolean} If the mute call succeeds.
		 * @since 0.4.0
		 */
		setMute:function (isMuted) {
			return this.updateVolume();
		},

// Flash Communication
		/**
		 * Flash loader インスタンスを<code>SoundLoader</code> インスタンスと結びつけるために使われます。
		 * @method registerPreloadInstance
		 * @param {String} flashId SoundLoader を識別するために用いる ID です。
		 * @param {SoundLoader} instance インスタンスを返します。
		 */
		registerPreloadInstance:function (flashId, instance) {
			this.flashPreloadInstances[flashId] = instance;
		},

		/**
		 * <code>SoundLoader</code> インスタンスを Flash と切り離すために使われます。
		 * @method unregisterPreloadInstance
		 * @param {String} flashId SoundLoader を識別するために用いる ID です。
		 */
		unregisterPreloadInstance:function (flashId) {
			delete this.flashPreloadInstances[flashId];
		},

		/**
		 * Flash サウンドインスタンスを{#crossLink "SoundInstance"}}{{/crossLink}}と結びつけるために使われます。
		 * @method registerSoundInstance
		 * @param {String} flashId SoundInstance を識別するために用いる ID です。
		 * @param {SoundLoader} instance インスタンスを返します。（訳注：SoundLoaderとなっていますが、SoundInstanceの間違えと思われます）
		 */
		registerSoundInstance:function (flashId, instance) {
			this.flashInstances[flashId] = instance;
		},

		/**
		 * {{#crossLink "SoundInstance"}}{{/crossLink}} を Flash と切り離すために使われます。
		 * @method unregisterSoundInstance
		 * @param {String} flashId SoundInstance を識別するために用いる ID です。
		 * @param {SoundLoader} instance インスタンスを返します。（訳注：SoundLoaderとなっていますが、SoundInstanceの間違えと思われます）
		 */
		unregisterSoundInstance:function (flashId) {
			delete this.flashInstances[flashId];
		},

		/**
		 * Flash の trace 出力をコンソールに出力するために使われます。
		 * @method flashLog
		 * @param {String} data 出力する情報です。
		 */
		flashLog:function (data) {
			try {
				this.showOutput && console.log(data);
			} catch (error) {
			}
		},

		/**
		 * Flash のイベントに対応し、Flash ID を用いて {{#crossLink "SoundInstance"}}{{/crossLink}} との連携を図ります。
		 * Flash から与えられるメソッドと引数はそのまま SoundInstance 上で実行されます。
		 * @method handleSoundEvent
		 * @param {String} flashId SoundInstance を識別するために用いる ID です。
		 * @param {String} method 実行するメソッドを指定します。
		 */
		handleSoundEvent:function (flashId, method) {
			var instance = this.flashInstances[flashId];
			if (instance == null) {
				return;
			}
			var args = [];
			for (var i = 2, l = arguments.length; i < l; i++) {
				args.push(arguments[i]);
			}
			try {
				if (args.length == 0) {
					instance[method]();
				} else {
					instance[method].apply(instance, args);
				}
			} catch (error) {
			}
		},

		/**
		 * Flash のイベントに対応し、Flash ID を用いて {{#crossLink "SoundInstance"}}{{/crossLink}} との連携を図ります。
		 * Flash から与えられるメソッドと引数はそのまま SoundInstance 上で実行されます。
		 * @method handleSoundEvent
		 * @param {String} flashId SoundInstance を識別するために用いる ID です。
		 * @param {String} method 実行するメソッドを指定します。
		 */
		handlePreloadEvent:function (flashId, method) {
			var instance = this.flashPreloadInstances[flashId];
			if (instance == null) {
				return;
			}
			var args = [];
			for (var i = 2, l = arguments.length; i < l; i++) {
				args.push(arguments[i]);
			}
			try {
				if (args.length == 0) {
					instance[method]();
				} else {
					instance[method].apply(instance, args);
				}
			} catch (error) {
			}
		},

		/**
		 * FlashPlugin クラスで対応する予定の Flash のイベントを扱います。現在 ready イベントのみ実行します。
		 * @method handleEvent
		 * @param {String} method 実行するメソッドを指定します。
		 */
		handleEvent:function (method) {
			//Sound.log("Handle Event", method);
			switch (method) {
				case "ready":
					clearTimeout(this.loadTimeout);
					this.handleFlashReady();
					break;
			}
		},

		/**
		 * Flash のエラーイベントを扱います。現在、この関数はなにもしない事に注意してください。
		 * Handles error events from Flash. Note this function currently does not process any events.
		 * @method handleErrorEvent
		 * @param {String} error Indicates the error.
		 */
		handleErrorEvent:function (error) {
		},

		toString:function () {
			return "[FlashPlugin]";
		}

	}

	createjs.FlashPlugin = FlashPlugin;


// NOTE documentation for this class can be found online or in WebAudioPlugin.SoundInstance
// NOTE audio control is shuttled to a flash player instance via the flash reference.
	function SoundInstance(src, owner, flash) {
		this.init(src, owner, flash);
	}

	var p = SoundInstance.prototype = {

		src:null,
		uniqueId:-1,
		owner:null,
		capabilities:null,
		flash:null,
		flashId:null, // To communicate with Flash
		loop:0,
		volume:1,
		pan:0,
		offset:0, // used for setPosition on a stopped instance
		duration:0,
		delayTimeoutId:null,
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

// Constructor
		init:function (src, owner, flash) {
			this.src = src;
			this.owner = owner;
			this.flash = flash;
		},

		initialize:function (flash) {
			this.flash = flash;
		},

// Public API

		interrupt:function () {
			this.playState = createjs.Sound.PLAY_INTERRUPTED;
			if (this.onPlayInterrupted != null) {
				this.onPlayInterrupted(this);
			}
			this.flash.interrupt(this.flashId);
			this.sendEvent("interrupted");
			this.cleanUp();
			this.paused = false;
		},

		cleanUp:function () {
			clearTimeout(this.delayTimeoutId);
			this.owner.unregisterSoundInstance(this.flashId);
			createjs.Sound.playFinished(this);
		},

		play:function (interrupt, delay, offset, loop, volume, pan) {
			createjs.Sound.playInstance(this, interrupt, delay, offset, loop, volume, pan);
		},

		beginPlaying:function (offset, loop, volume, pan) {
			this.loop = loop;
			this.paused = false;

			if (!this.owner.flashReady) {
				return false;
			}

			this.offset = offset;

			this.flashId = this.flash.playSound(this.src, offset, loop, volume, pan);
			if (this.flashId == null) {
				if (this.onPlayFailed != null) {
					this.onPlayFailed(this);
				}
				this.cleanUp();
				return false;
			}

			//this.duration = this.flash.getDuration(this.flashId);  // this is 0 at this point
			if (this.muted) {
				this.setMute(true);
			}
			this.playState = createjs.Sound.PLAY_SUCCEEDED;
			this.owner.registerSoundInstance(this.flashId, this);
			this.onPlaySucceeded && this.onPlaySucceeded(this);
			this.sendEvent("succeeded");
			return true;
		},

		playFailed:function () {
			this.playState = createjs.Sound.PLAY_FAILED;
			if (this.onPlayFailed != null) {
				this.onPlayFailed(this);
			}
			this.sendEvent("failed");
			this.cleanUp();
		},

		pause:function () {
			if (!this.paused && this.playState == createjs.Sound.PLAY_SUCCEEDED) {
				this.paused = true;
				clearTimeout(this.delayTimeoutId);
				return this.flash.pauseSound(this.flashId);
			}
			return false;
		},

		resume:function () {
			if (!this.paused) {
				return false;
			}
			this.paused = false;
			return this.flash.resumeSound(this.flashId);
		},

		stop:function () {
			this.playState = createjs.Sound.PLAY_FINISHED;
			this.paused = false;
			this.offset = 0;  // flash destroys the wrapper, so we need to track offset on our own
			var ok = this.flash.stopSound(this.flashId);
			this.cleanUp();
			return ok;
		},

		setVolume:function (value) {
			if (Number(value) == null) {
				return false;
			}
			value = Math.max(0, Math.min(1, value));
			this.volume = value;
			return this.flash.setVolume(this.flashId, value)
		},

		getVolume:function () {
			return this.volume;
		},

		mute:function (value) {
			this.muted = value;
			return value ? this.flash.muteSound(this.flashId) : this.flash.unmuteSound(this.flashId);
		},

		setMute:function (value) {
			this.muted = value;
			return value ? this.flash.muteSound(this.flashId) : this.flash.unmuteSound(this.flashId);
		},

		getMute:function () {
			return this.muted;
		},

		getPan:function () {
			return this.pan;
		},

		setPan:function (value) {
			this.pan = value;
			return this.flash.setPan(this.flashId, value);
		},

		getPosition:function () {
			var value = -1;
			if (this.flash && this.flashId) {
				value = this.flash.getPosition(this.flashId); // this returns -1 on stopped instance
			}
			if (value != -1) {
				this.offset = value;
			}
			return this.offset;
		},

		setPosition:function (value) {
			this.offset = value;  //
			this.flash && this.flashId && this.flash.setPosition(this.flashId, value);
			return true;  // this is always true now, we either hold value internally to set later or set immediately
		},

		getDuration:function () {
			var value = -1;
			if (this.flash && this.flashId) {
				value = this.flash.getDuration(this.flashId);
			}
			if (value != -1) {
				this.duration = value;
			}
			return this.duration;
		},

// Flash callbacks, only exist in FlashPlugin
		sendEvent:function (eventString) {
			var event = {
				target:this,
				type:eventString
			};
			this.dispatchEvent(event);
		},

		/**
		 * Flash から呼び出されます。Flash が音の再生を終了したことを通知します。
		 * #method handleSoundFinished
		 * @protected
		 */
		handleSoundFinished:function () {
			this.playState = createjs.Sound.PLAY_FINISHED;
			if (this.onComplete != null) {
				this.onComplete(this);
			}
			this.sendEvent("complete");
			this.cleanUp();
		},

		/**
		 * Flash から呼び出されます。Flash が音を最後まで再生しループしたことを通知します。
		 * #method handleSoundLoop
		 * @protected
		 */
		handleSoundLoop:function () {
			if (this.onLoop != null) {
				this.onLoop(this);
			}
			this.sendEvent("loop");
		},

		toString:function () {
			return "[FlashPlugin SoundInstance]"
		}

	}

	// Note this is for SoundInstance above.
	createjs.EventDispatcher.initialize(SoundInstance.prototype);

	// do not add SoundInstance to namespace


	/**
	 * SoundLoader は、PreloadJS や SoundJS 内部から Flash のコンテンツを読み込む機構を提供します。
	 * インスタンスは preloader で受け取り、load メソッドはアセットが必要になった際に呼び出されます。
	 *
	 * SoundLoader は　&lt;audio&gt;
	 * SoundLoader has the same APIs as an &lt;audio&gt; tag. The instance calls the <code>onload</code>, <code>onprogress</code>,
	 * and <code>onerror</code> callbacks when necessary.
	 *
	 * #class SoundLoader
	 * @param {String} src The path to the sound
	 * @param {Object} flash The flash instance that will do the preloading.
	 * @private
	 */
	function SoundLoader(src, owner, flash) {
		this.init(src, owner, flash);
	}

	var p = SoundLoader.prototype = {

		/**
		 * 生成される Flash インスタンスへの参照です。
		 * #property flash
		 * @type {Object | Embed}
		 */
		flash:null,

		/**
		 * 読み込む音源のファイルパスです。
		 * #property src
		 * @type {String}
		 */
		src:null,

		/**
		 * flash との連携をとるために使用するIDです。
		 * #property flashId
		 * @type {String}
		 */
		flashId:null,

		/**
		 * 進行度のパーセントです。
		 * #property progress
		 * @type {Number}
		 * @default -1
		 */
		progress:-1,

		/**
		 * 音源の準備が整ったかを示すために使われます。readyState=4 が準備完了を示します。
		 * #property readyState
		 * @type {Number}
		 * @default 0
		 */
		readyState:0,

		/**
		 * <code>load</code> が呼ばれたかを示します。
		 * #property loading
		 * @type {Boolean}
		 * @default false
		 */
		loading:false,

		/**
		 * このインスタンスを生成したプラグインです。<code>FlashPlugin</code> インスタンスになります。
		 * #property owner
		 * @type {Object}
		 */
		owner:null,

// Calbacks
		/**
		 * 読み込みが完了すると呼び出されるコールバック関数です。HTMLタグ名の風習に従っています。
		 * #property onload
		 * @type {Method}
		 */
		onload:null,

		/**
		 * 読み込み中に呼び出されるコールバック関数です。HTMLタグ名の風習に従っています。
		 * #property onprogress
		 * @type {Method}
		 */
		onprogress:null,

		/**
		 * 読み込み中にエラーが発生した場合に呼び出されるコールバック関数です。HTMLタグ名の風習に従っています。
		 * #property onerror
		 * @type {Method}
		 */
		onerror:null,

		// constructor
		init:function (src, owner, flash) {
			this.src = src;
			this.owner = owner;
			this.flash = flash;
		},

		/**
		 * Flash が初期化される際、呼び出されます。この関数よりも前に load が呼び出されていた場合、この関数内で改めて呼び出します。
		 * #method initialize
		 * @param {Object | Embed} flash Flash インスタンスへの参照です
		 */
		initialize:function (flash) {
			this.flash = flash;
			if (this.loading) {
				this.loading = false;
				this.load(this.src);
			}
		},

		/**
		 * 読み込みを開始します。
		 * #method load
		 * @param {String} src 音源のファイルパスです。
		 * @return {Boolean} 読み込みを開始したかを返します。Flashが初期化されていなかった場合、load は失敗します。
		 */
		load:function (src) {
			if (src != null) {
				this.src = src;
			}
			if (this.flash == null || !this.owner.flashReady) {
				this.loading = true;
				// register for future preloading
				this.owner.preloadInstances[this.src] = this; // OJR this would be better as an API call
				return false;
			}

			this.flashId = this.flash.preload(this.src);
			// Associate this preload instance with the FlashID, so callbacks can route here.
			this.owner.registerPreloadInstance(this.flashId, this);
			return true;
		},

		/**
		 * Flash からProgressイベントを受け取り、コールバック関数に渡します。
		 * Receive progress from Flash and pass it to callback.
		 * #method handleProgress
		 * @param {Number} loaded Amount loaded
		 * @param {Number} total Total amount to be loaded.
		 */
		handleProgress:function (loaded, total) {
			this.progress = loaded / total;
			this.onprogress && this.onprogress({loaded:loaded, total:total, progress:this.progress});
		},

		/**
		 * 音の読み込みが完了した時点で Flash 呼び出されます。readyState値を設定し、コールバック関数・イベントを発行します。
		 * #method handleComplete
		 */
		handleComplete:function () {
			this.progress = 1;
			this.readyState = 4;
			createjs.Sound.sendLoadComplete(this.src);  // fire event or callback on Sound // can't use onload callback because we need to pass the source
			this.onload && this.onload();
		},

		/**
		 * Flash からエラーイベントを受け取り、コールバック関数に渡します。
		 * @param {Event} error
		 */
		handleError:function (error) {
			this.onerror && this.onerror(error);
		},

		toString:function () {
			return "[FlashPlugin SoundLoader]";
		}

	}

	// do not add SoundLoader to namespace

}());
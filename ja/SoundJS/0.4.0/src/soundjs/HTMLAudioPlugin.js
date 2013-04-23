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
	 * HTML &lt;audio&gt; �^�O���g�p���ău���E�U�ŉ����Đ����܂��B���̃v���O�C���̓f�t�H���g�ł́A
	 * Chrome�ASafari�AiOS �őΉ�����Ă��� {{#crossLink "WebAudioPlugin"}}{{/crossLink}} �Ɏ����ŁA�Q�Ԗڂ̗D��x�ŃC���X�g�[������܂��B
	 * ���̃v���O�C���͂���ȊO�̃u���E�U�ŉ��������܂��B�T�|�[�g�O�̃u���E�U�ł� {{#crossLink "FlashPlugin"}}{{/crossLink}} ���C���X�g�[�����Ă��������B
	 *
	 * <h4>�u���E�U/OS�ɂ����� HTML Audio �̊��m�̖��_</h4>
	 * <b>�S�u���E�U</b><br />
	 * �S�Ẵu���E�U��ł̃e�X�g�̌��ʁAAudio �^�O�C���X�^���X�������܂ŋ�����Ă��邩�ɂ��ď�����݂����Ă��܂��B
	 * �������̏���𒴂����ꍇ�A�\�z�ł��Ȃ����ʂƂȂ�܂��BChrome �ł͉�����o�^����ƁA������ǂݍ��ނ��߂Ƀ^�O�𐶐����邽�߁A
	 * �����ɂ��̌��ۂ��݂��܂��B�S�u���E�U�ň��S�Ɏg�p����ɍ��v�����܂� audio �^�O�𐶐����邩�̐ݒ�ɂ́A
	 * {{#crossLink "Sound.MAX_INSTANCES"}}{{/crossLink}} ���g�p���Ă��������B
	 *
	 * <b>IE 9 HTML audio �ɂ�������قȐU�镑��</b><br />
     * IE9 �ł́A��x�Đ����J�n���Ă��܂��ƁA�^�O�ł̉��ʂ̕ύX�ɒx���������鎖���킩���Ă��܂��B
     * ���̂��ߑS�������������Ƃ��Ă��A�����ŏ������K�p�����܂ł̂��̒x���̊Ԃ́A�����Đ����ꑱ���܂��B
     * ����́A�ǂ��ŁA�ǂ̂悤�ɉ��ʕύX��K�p�����Ƃ��Ă��A�^�O�����Đ��ɕK�v�Ȉȏ�A�K���N����܂��B
     *
     * <b>iOS 6 �̐���</b><br />
	 * iOS(6+)�ł� {{#crossLink "WebAudioPlugin"}}{{/crossLink}} ���g�p���Ă��������BHTML Audio ��1��lt;audio&gt;�^�O�����ێ����邱�Ƃ��ł����A
	 * ���O�̓ǂݍ��݂⎩���Đ��A�����̃L���b�V���A���[�U�[�C�x���g�̃n���h���ȊO�ł̍Đ��͂ł��܂���B
	 *
     * <b>Android �̐���</b><br />
     * <ul><li>SoundJS �ŉ��ʑ���͂ł��܂���B���[�U�[���[����ł̂݉��ʂ�ݒ�ł��܂��B</li>
     *     <li>���[�U�[�C�x���g(�^�b�`�C�x���g)���ł̂݉��̍Đ����ł��܂��B����͂܂�A���󃋁[�v�Đ����ł��܂���B</li>
     *
	 * ���m�̖��_�Ɋւ����ʓI�Ȓ��ӓ_�́A{{#crossLink "Sound"}}{{/crossLink}} ���Q�Ƃ��������B
	 *
	 * @class HTMLAudioPlugin
	 * @constructor
	 */
	function HTMLAudioPlugin() {
		this.init();
	}

	var s = HTMLAudioPlugin;

	/**
	 * �Đ��ł���ő�C���X�^���X���ł��B����̓u���E�U�̐����ł��B
	 * ���ۂ̐��̓u���E�U�ɂ���ĈقȂ�܂��i�܂����̏ꍇ�A����̓n�[�h�Ɉˑ����܂��j���A����͈��S�Ȍ��ς�ł��B
	 * @property MAX_INSTANCES
	 * @type {Number}
	 * @default 30
	 * @static
	 */
	s.MAX_INSTANCES = 30;

	/**
	 * ���̃v���O�C�����T�|�[�g����@�\�ł��B����� SoundInstance ��{{#crossLink "TMLAudioPlugin/generateCapabilities"}}{{/crossLink}}���h�b�h�Ő�������܂��B
	 * �K�p�\�ȃv���O�C���@�\�̈ꗗ�́ASound �N���X��{{#crossLink "Sound/getCapabilities"}}{{/crossLink}} ���\�b�h���Q�Ɖ������B
	 * @property capabilities
	 * @type {Object}
	 * @static
	 */
	s.capabilities = null;

	/**
	 * "canPlayThrough" �C�x���g�̌Œ�l�ł��B���₷���R�[�h���������߂Ɏg�p���Ă��������B
	 * @property AUDIO_READY
	 * @type {String}
	 * @default canplaythrough
	 * @static
	 */
	s.AUDIO_READY = "canplaythrough";

	/**
	 * "ended" �C�x���g�̌Œ�l�ł��B���₷���R�[�h���������߂Ɏg�p���Ă��������B
	 * @property AUDIO_ENDED
	 * @type {String}
	 * @default ended
	 * @static
	 */
	s.AUDIO_ENDED = "ended";

	/**
	 * "error" �C�x���g�̌Œ�l�ł��B���₷���R�[�h���������߂Ɏg�p���Ă��������B
	 * @property AUDIO_ERROR
	 * @type {String}
	 * @default error
	 * @static
	 */
	s.AUDIO_ERROR = "error"; //TODO: Handle error cases

	/**
	 * "stalled" �C�x���g�̌Œ�l�ł��B���₷���R�[�h���������߂Ɏg�p���Ă��������B
	 * @property AUDIO_STALLED
	 * @type {String}
	 * @default stalled
	 * @static
	 */
	s.AUDIO_STALLED = "stalled";


	/**
	 * ���݂�browser/OS�ł��̃v���O�C�����g�p�\����Ԃ��܂��B
	 * �����͂���܂����AHTML audio �� iOS �ȊO�̍ŋ߂̂قƂ�ǂ̃u���E�U�őΉ����Ă��܂��B
	 * @method isSupported
	 * @return {Boolean} �v���O�C�������������ꂽ����Ԃ��܂��B
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
	 * ���̃v���O�C�����T�|�[�g����@�\�����肵�܂��B���̃��\�b�h�͓����Ŏg�p����܂��B�@�\�̈ꗗ�́ASound �N���X��{{#crossLink "Sound/getCapabilities"}}{{/crossLink}}���Q�Ɖ������B
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
		 * ���̃v���O�C�����T�|�[�g����@�\�ŁA{{#crossLink "HTMLAudioPlugin/generateCapabilities"}}{{/crossLink}} �Ő�������܂��B
		 * method.
		 */
		capabilities:null,

		/**
		 * �e�����ɑ΂��ēǍ��ݍ�/�Ǎ��ݒ��������AID �ŃC���f�b�N�X���ꂽ�n�b�V���ł��B
		 * @property audioSources
		 * @type {Object}
		 * @protected
		 * @since 0.4.0
		 */
		audioSources:null,

		/**
		 * ���e�����f�t�H���g�C���X�^���X���ł��B{{#crossLink "Sound/register"}}{{/crossLink}}���\�b�h�ŉ������o�^�����ۂ�
		 * {{#crossLink "Sound"}}{{/crossLink}} �N���X�ɓn����܂��B����́A�l���ݒ肳��Ă��Ȃ��ꍇ�ɂ̂ݎg�p����܂��B
		 * <b>���̃v���p�e�B��HTML audio�̐����̂��߂����ɑ��݂��Ă��܂�</b>
		 * @property defaultNumChannels
		 * @type {Number}
		 * @default 2
		 * @since 0.4.0
		 */
		defaultNumChannels:2,

		/**
		 * �R���X�g���N�^����Ă΂�鏉�����֐��ł��B
		 * @method init
		 * @private
		 */
		init:function () {
			this.capabilities = s.capabilities;
			this.audioSources = {};
		},

		/**
		 * �T�E���h�C���X�^���X�̓ǂݍ���/�ݒ�̍ہA���̃C���X�^���X��o�^���܂��B���̃��\�b�h��{{#crossLink "Sound"}}{{/crossLink}}����Ăяo����܂��B
		 * ���̃��\�b�h�́A<a href="http://preloadjs.com">PreloadJS</a> ���Ή��ł���悤�ɁA�ǂݍ��݂ɗp����^�O���܂ރI�u�W�F�N�g��Ԃ��܂��B
		 * @method register
		 * @param {String} src �����̃t�@�C���p�X�ł��B
		 * @param {Number} instances �`�����l���������ɍĐ��ł���C���X�^���X���ł��B
		 * @return {Object} �ǂݍ��݂ɗp����^�O�ƁA�����Ŋ�̃C���X�^���X�𑀍�ł��邩�����߂� numChannnels�l ���܂� Object �ł��B
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
		 * HTML audio �^�O�𐶐����܂��B
		 * @method createTag
		 * @param {String} src audio �^�O�ɐݒ肷�鉹���t�@�C���ł��B
		 * @return {HTMLElement} HTML audio �^�O��DOM�G�������g��Ԃ��܂��B
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
		 * �T�E���h�C���X�^���X�𐶐����܂��B�����܂��ǂݍ��܂�Ă��Ȃ��ꍇ�A�����I�ɂ��̊֐��œǂݍ��݂܂��B
		 * @method create
		 * @param {String} src �g�p���鉹���̃t�@�C���p�X�ł��B
		 * @return {SoundInstance} �Đ��A������s���T�E���h�C���X�^���X��Ԃ��܂��B
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
		 * �w�肵�������̓ǂݍ��݂��J�n����Ă��邩���m�F���܂��B
		 * @method isPreloadStarted
		 * @param {String} src �m�F���鉹����URI�ł��B
		 * @return {Boolean} �ǂݍ��݂��J�n���Ă��邩��Ԃ��܂��B
		 * @since 0.4.0
		 */
		isPreloadStarted:function (src) {
			return (this.audioSources[src] != null);
		},

		/**
		 * �����ŉ�����ǂݍ��݂܂��B
		 * @method preload
		 * @param {String} src �ǂݍ��މ�����URI�ł��B
		 * @param {Object} instance HTML audio �^�O��������ǂލ��ނ��߂Ɏg�p����v���p�e�B���܂ރI�u�W�F�N�g��Ԃ��܂��B
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
	 * HTMLAudioElement �^�O��p���� html audio ��ǂݍ��ނ��߂̓����w���p�[�N���X�ł��B
	 * Flash and WebAudio plugins �ƈقȂ�APreloadJS �͂��̓ǂݍ��݃N���X���g��Ȃ��_�ɒ��ӂ��Ă��������B
	 * �܂��AHTML�h�L�������g�̐���������邽�߂ɁA���̃N���X�ƃ��\�b�h�̓h�L�������g������܂���B
	 * #class HTMLAudioLoader
	 * @param {String} src �ǂݍ��މ����̃t�@�C���p�X�ł��B
	 * @param {HTMLAudioElement} tag �ǂݍ��މ����� Audio �^�O�ł��B
	 * @constructor
	 * @private
	 * @since 0.4.0
	 */
	function HTMLAudioLoader(src, tag) {
		this.init(src, tag);
	}

	HTMLAudioLoader.prototype = {

		/**
		 * �ǂݍ��މ����̃t�@�C���p�X�ł��B
		 * #property src
		 * @type {String}
		 * @default null
		 * @protected
		 */
		src:null,

		/**
		 * ������ǂݍ���œ���� Audio �^�O�ł��B
		 * #property tag
		 * @type {AudioTag}
		 * @default null
		 * @protected
		 */
		tag:null,

		/**
		 * �i�s�x��ʒm����Ԋu�ł��B
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
		 * �ǂݍ��݂̐i�s�x��ʒm���邽�߂Ɏg�p���܂��B
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
		 * �^�O�̓ǂݍ��݂����������ۂɓ����I�ɌĂ΂��n���h���ł��B
		 * #method handleTagLoaded
		 * @protected
		 */
		handleTagLoaded:function () {
			clearInterval(this.preloadTimer);
		},

		/**
		 * Sound �N���X�ɑ΂��ēǂݍ��݂̊�����`���邽�߂Ɏg�p���܂��B
		 * #method sendLoadedEvent
		 * @param {Object} evt load �C�x���g�ł�
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
	 * TagPool �� HTMLAudio �^�O�C���X�^���X�̃I�u�W�F�N�g�v�[���ł��BChrome �ł́A�f�[�^��ǂݍ��ޑO��
	 * �Đ��ɕK�v�ȕ��� HTML audio �^�O�C���X�^���X�����炩���ߐ������Ă����K�v������A�������Ă��Ȃ��Ɖ����Đ��ł��܂���B
	 * (����: �����Chrome �̃o�O�Ǝv���܂�)
	 * #class TagPool
	 * @param {String} src �`�����l���Ŏg�p���鉹���̃t�@�C���p�X�ł��B
	 * @private
	 */
	function TagPool(src) {
		this.init(src);
	}

	/**
	 * �t�@�C���p�X�ŃC���f�b�N�X���ꂽ�A�T�E���h�`�����l����T�����߂̃n�b�V���e�[�u���ł��B
	 * #property tags
	 * @static
	 * @private
	 */
	TagPool.tags = {};

	/**
	 * �^�O�̃v�[�����擾���܂��B�v�[�����Ȃ��ꍇ�͐������ĕԂ��܂��B
	 * #method get
	 * @param {String} src audio �^�O�Ŏg�p����鉹���̃t�@�C���p�X�ł��B
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
	 * �^�O�C���X�^���X���擾���܂��B����̓V���[�g�J�b�g���\�b�h�ł��B
	 * #method getInstance
	 * @param {String} src �^�O�Ŏg�p����鉹���̃t�@�C���p�X�ł��B
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
	 * �^�O�C���X�^���X��Ԃ��܂��i�󒍁G�����ł� Return a tag instance.�Ə�����Ă��܂��j�B����̓V���[�g�J�b�g���\�b�h�ł��B
	 * #method setInstance
	 * @param {String} src �^�O�Ŏg�p����鉹���̃t�@�C���p�X�ł��B
	 * @param {HTMLElement} tag �ݒ肷�� Audio �^�O�ł��B
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
		 * �^�O�v�[���̃\�[�X�ł��B
		 * #property src
		 * @type {String}
		 * @private
		 */
		src:null,

		/**
		 * �v�[�����ɃX�g�b�N����Ă��� HTMLAudio �^�O�̑����ł��B����͈�x�ɍĐ��ł���C���X�^���X�̍ő吔�ł��B
		 * #property length
		 * @type {Number}
		 * @default 0
		 * @private
		 */
		length:0,

		/**
		 * ���g�p�� HTMLAudio �^�O�̐��ł��B
		 * #property available
		 * @type {Number}
		 * @default 0
		 * @private
		 */
		available:0,

		/**
		 * �v�[�����̑S�^�O�̃��X�g�ł��B
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
		 * HTMLAudio �^�O���v�[���ɒǉ����܂��B
		 * #method add
		 * @param {HTMLAudioElement} tag �Đ��Ɏg�p����^�O�ł��B
		 */
		add:function (tag) {
			this.tags.push(tag);
			this.length++;
			this.available++;
		},

		/**
		 * �Đ��̂��߂ɁAHTMLAudioElement ���擾���܂��B���̃��\�b�h�̓^�O�G�������g���v�[��������o���܂��B
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
		 * HTMLAudioElement �g�p�ł���悤�Ƀv�[���ɖ߂��܂��B
		 * #method set
		 * @param {HTMLAudioElement} tag HTML audio �^�O�ł��B
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

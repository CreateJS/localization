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

// namespace:
this.createjs = this.createjs || {};

(function () {

	/**
	 * Flash �C���X�^���X��p���ĉ����Đ����܂��B���̃v���O�C���̓f�t�H���g�ł͎g�p����Ȃ����߁A
	 * {{#crossLink "Sound/registerPlugins"}}{{/crossLink}} ���\�b�h��p���� {{#crossLink "Sound"}}{{/crossLink}} �Ɏ蓮�œo�^����K�v������܂��B
	 * ���̃v���O�C���� IE8 �̂悤�ȌÂ��u���E�U�ւ̑Ή����K�v�ȏꍇ�ɂ̂ݑg�ݍ��ނ��Ƃ���������܂��B
	 *
	 * ���̃v���O�C���� FlashAudioPlugin.swf �� swfObject.js (swfObject.js �͈��k���� FlashPlugin-X.X.X.min.js �t�@�C�����Ɋ܂܂�Ă��܂�) ��K�v�Ƃ��܂� �B
	 * ���̃v���O�C�����g�p����ۂɂ́A�X�N���v�g�� swf �t�@�C������������悤�� <code>FlashPlugin.BASE_PATH</code> ���ݒ肳��Ă��邩���m�F���Ă��������B
	 *
	 * <h4>������</h4>
	 *      createjs.FlashPlugin.BASE_PATH = "../src/SoundJS/";
	 *      createjs.Sound.registerPlugins([createjs.WebAudioPlugin, createjs.HTMLAudioPlugin, createjs.FlashPlugin]);
	 *      // WebAudio �� HTMLAudio �������Ȃ������ꍇ�̗\���Ƃ��� FlashPlugin ��ǉ����܂��B
	 *
	 * @class FlashPlugin
	 * @constructor
	 */
	function FlashPlugin() {
		this.init();
	}

	var s = FlashPlugin;

	/**
	 * �v���O�C�����T�|�[�g����@�\�ł��B���̃v���p�e�B�� {{#crossLink "WebAudioPlugin/generateCapabilities"}}{{/crossLink}} ���\�b�h���Ő�������܂��B
	 * �@�\�̈ꗗ�́ASound �N���X��{{#crossLink "Sound/getCapabilities"}}{{/crossLink}}���Q�Ɖ������B
	 * @property capabilities
	 * @type {Object}
	 * @static
	 */
	s.capabilities = null;

	/**
	 * FlashAudioPlugin.swf �� HTML �y�[�W����̑��΃p�X�ł��B���̃p�X���������Ȃ��ƃv���O�C�����쓮���Ȃ��_�ɒ��ӂ��Ă��������B
	 * @property BASE_PATH
	 * @type {String}
	 * @default src/SoundJS
	 * @static
	 */
	s.BASE_PATH = "src/SoundJS/";

	/**
	 * ���݂�browser/OS�ł��̃v���O�C�����g�p�\����Ԃ��܂��B
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
	 * ���̃v���O�C�����T�|�[�g����@�\��Ԃ��܂��B���̃��\�b�h�͓����Ŏg�p����܂��B�@�\�̈ꗗ�́ASound �N���X��{{#crossLink "Sound/getCapabilities"}}{{/crossLink}}���Q�Ɖ������B
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
		 * �e�����ɑ΂��ēǍ��ݍ�/�Ǎ��ݒ��������AID �ŃC���f�b�N�X���ꂽ�n�b�V���ł��B
		 * @property audioSources
		 * @type {Object}
		 * @protected
		 */
		audioSources:null, // object hash that tells us if an audioSource has started loading

		/**
		 * �v���O�C�������̉��ʂ̒l�ł��B
		 * @property volume
		 * @type {Number}
		 * @default 1
		 * @protected
		 */
		volume:1,

		/**
		 * Flash�R���e���c�𐶐����邽�߂� DIV �^�O�v�f�� id ���ł��B
		 * @property CONTAINER_ID
		 * @type {String}
		 * @default flashAudioContainer
		 * @protected
		 */
		CONTAINER_ID:"flashAudioContainer",

		/**
		 * ���̃v���O�C�����T�|�[�g����@�\���`����Object�ł��B�v���O�C���@�\�̂��ڍׂȏ��́ASound �N���X��{{#crossLink "Sound/getCapabilities"}}{{/crossLink}}���Q�Ɖ������B
		 * @property capabilities
		 * @type {Object}
		 * @protected
		 */
		capabilities:null,

// FlashPlugin Specifics
		/**
		 * Flash �C���X�^���X��ێ����邽�߂ɐ�������� DIV �^�O�v�f�ւ̎Q�Ƃł��B
		 * @property container
		 * @type {HTMLDivElement}
		 * @protected
		 */
		container:null,

		/**
		 * ��������� Flash �C���X�^���X�ւ̎Q�Ƃł��B
		 * @property flash
		 * @type {Object | Embed}
		 * @protected
		 */
		flash:null,

		/**
		 * Flash �I�u�W�F�N�g����������A���������������Ă��邩�������܂��B
		 * ���̃v���p�e�B�� JavaScript ���� Flash �� <code>ExternalInterface</code> �ɂ��Ăяo�����s�����߂ɗp�ӂ���Ă��܂��B
		 * @property flashReady
		 * @type {Boolean}
		 * @default false
		 */
		flashReady:false,

		/**
		 * Flash ���̊֘A ID �ŃC���f�b�N�X���ꂽ SoundInscance �̃n�b�V���ł��B
		 * ���̃n�b�V���́AJavaScript���̉��ƁAFlash���Ŋ֘A�����C���X�^���X�����т��邽�߂Ɏg���܂��B
		 * @property flashInstances
		 * @type {Object}
		 * @protected
		 */
		flashInstances:null,

		/**
		 * Flash ���̊֘A ID �ŃC���f�b�N�X���ꂽ Sound Preload �C���X�^���X�̃n�b�V���ł��B
		 * ���̃n�b�V���́AFlash ���œǂݍ��މ��ƁAJavaScript���̊֘A�����C���X�^���X�����т��邽�߂Ɏg���܂��B
		 * @property flashPreloadInstances
		 * @type {Object}
		 * @protected
		 */
		flashPreloadInstances:null,

		/**
		 * �����̃t�@�C���p�X�ŃC���f�b�N�X���ꂽ Sound Preload �C���X�^���X�̃n�b�V���ł��B
		 * ���̃n�b�V���� Flash �I�u�W�F�N�g���g�p�s�\�ŁA�����ǂݍ��݂��s�����Ƃ����ꍇ�ɁA������ǂݍ��ނ��߂Ɏg���܂��B
		 * @property preloadInstances
		 * @type {Object}
		 * @protected
		 * @since 0.4.0
		 */
		preloadInstances:null,

		/**
		 * �ǂݍ��ݑ҂��� Sound Preload �C���X�^���X�̔z��ł��BFlash �̏���������������ƁA���̔z��̃C���X�^���X���ǂݍ��܂�܂��B
		 * @property queuedInstances
		 * @type {Object}
		 * @protected
		 */
		queuedInstances:null,

		/**
		 * �SFlash�C�x���g���R���\�[�����(�R���\�[�������݂����)�o�͂���A�J���Ҍ����̃t���O�ł��B�f�o�b�O���ɂ��g�p���������B
		 *
		 *      Sound.activePlugin.showOutput = true;
		 *
		 * @property showOutput
		 * @type {Boolean}
		 * @default false
		 */
		showOutput:false,

		/**
		 * �R���X�g���N�^����Ăяo����鏉�����p�֐��ł��B
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
		 * ���̓ǂݍ��݂ƍĐ����s�� SWF �I�u�W�F�N�g�����������܂��B
		 * @method handleSWFReady
		 * @param {Object} event swf �ւ̎Q�Ƃ��܂�ł��܂��B
		 * @protected
		 */
		handleSWFReady:function (event) {
			this.flash = event.ref;
			this.loadTimeout = setTimeout(createjs.proxy(this.handleTimeout, this), 2000);  // OJR note this function doesn't do anything right now
		},

		/**
		 * ���̓ǂݍ��݂ƍĐ����s�� Flash �A�v���P�[�V�����̏��������������ꍇ��
		 * �Đ����J�n����O�ɑS�Ă̏������������Ă��邩���m�F���邽�߂� Flash ����̌Ăяo����҂��܂��B
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
		 * Flash ������������Ȃ��ꍇ�ɌĂяo����܂��B�ʏ�Aswf��������Ȃ����A�p�X���ԈႦ�Ă��鎖���Ӗ����܂��B
		 * @method handleTimeout
		 * @protected
		 */
		handleTimeout:function () {
			//LM: Surface to user? AUDIO_FLASH_FAILED
			// OJR we could dispatch an error event
		},

		/**
		 * �T�E���h�C���X�^���X�̓ǂݍ���/�ݒ�̍ہA���̃C���X�^���X��o�^���܂��B
		 * Flash �� �u���E�U�L���b�V���ɃA�N�Z�X�ł��Ȃ����߁AFlashPlugin �� �ǂݍ��ݗp SoundSoundLoader �C���X�^���X��Ԃ����Ƃɒ��ӂ��Ă��������B
		 * @method register
		 * @param {String} src �����̃t�@�C���p�X�ł��B
		 * @param {Number} instances �`�����l���������ɍĐ��ł���C���X�^���X���ł��B
		 * @return {Object} �ǂݍ��݂ɗp����^�O���܂� Object �ł��B
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
		 * �T�E���h�C���X�^���X�𐶐����܂��B�����܂��ǂݍ��܂�Ă��Ȃ��ꍇ�A�����I�ɂ��̊֐��œǂݍ��݂܂��B
		 * @method create
		 * @param {String} src �����̃t�@�C���p�X�ł��B
		 * @return {SoundInstance} �Đ��A������s���T�E���h�C���X�^���X��Ԃ��܂��B
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
		 * �w�肵�������̓ǂݍ��݂��J�n����Ă��邩���m�F���܂��B
		 * �������������������ꍇ�A���̉����͓ǂݍ��ݒ����A�ǂݍ��݂��������Ă���̂ƌ��Ȃ��܂��B
		 * @method isPreloadStarted
		 * @param {String} src �m�F���鉹����URI�ł��B
		 * @return {Boolean}
		 */
		isPreloadStarted:function (src) {
			return (this.audioSources[src] != null);
		},

		/**
		 * �T�E���h�C���X�^���X��ǂݍ��݂܂��B���̃v���O�C���ł͑S���̓ǂݍ��݂ƍĐ��� Flash ��p���܂��B
		 * Preload a sound instance. This plugin uses Flash to preload and play all sounds.
		 * @method preload
		 * @param {String} src �����̃t�@�C���p�X�ł��B
		 * @param {Object} instance ���̃v���O�C���ł͎g�p���܂���B
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
		 * �S���� SoundInstance �ɉe����^����A�v���O�C���̃}�X�^�[�{�����[����ݒ肵�܂��B
		 * @method setVolume
		 * @param {Number} value 0 ���� 1 �̊Ԃ̉��ʒl�ł��B
		 * @return {Boolean} �v���O�C�������ʐݒ�����s������true��Ԃ��܂��Bfalse �̏ꍇ�ASound �N���X�͑S�C���X�^���X�ɑ΂��Ď蓮�Ŏ��s���Ȃ��Ă͂Ȃ�܂���B
		 * @since 0.4.0
		 */
		setVolume:function (value) {
			this.volume = value;
			return this.updateVolume();
		},

		/**
		 * �����Ń}�X�^�[���̃Q�C���l��ݒ肷�邽�߂̊֐��ł��B�O������Ăяo���Ȃ��ŉ������B
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
		 * �S���� SoundInstance �ɉe����^����A�v���O�C���̃}�X�^�[�{�����[�����擾���܂��B
		 * @method getVolume
		 * @return 0 ���� 1 �̊Ԃ̉��ʒl��Ԃ��܂��B
		 * @since 0.4.0
		 */
		getVolume:function () {
			return this.volume;
		},

		/**
		 * �v���O�C������S�����������܂��B
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
		 * Flash loader �C���X�^���X��<code>SoundLoader</code> �C���X�^���X�ƌ��т��邽�߂Ɏg���܂��B
		 * @method registerPreloadInstance
		 * @param {String} flashId SoundLoader �����ʂ��邽�߂ɗp���� ID �ł��B
		 * @param {SoundLoader} instance �C���X�^���X��Ԃ��܂��B
		 */
		registerPreloadInstance:function (flashId, instance) {
			this.flashPreloadInstances[flashId] = instance;
		},

		/**
		 * <code>SoundLoader</code> �C���X�^���X�� Flash �Ɛ؂藣�����߂Ɏg���܂��B
		 * @method unregisterPreloadInstance
		 * @param {String} flashId SoundLoader �����ʂ��邽�߂ɗp���� ID �ł��B
		 */
		unregisterPreloadInstance:function (flashId) {
			delete this.flashPreloadInstances[flashId];
		},

		/**
		 * Flash �T�E���h�C���X�^���X��{#crossLink "SoundInstance"}}{{/crossLink}}�ƌ��т��邽�߂Ɏg���܂��B
		 * @method registerSoundInstance
		 * @param {String} flashId SoundInstance �����ʂ��邽�߂ɗp���� ID �ł��B
		 * @param {SoundLoader} instance �C���X�^���X��Ԃ��܂��B�i�󒍁FSoundLoader�ƂȂ��Ă��܂����ASoundInstance�̊ԈႦ�Ǝv���܂��j
		 */
		registerSoundInstance:function (flashId, instance) {
			this.flashInstances[flashId] = instance;
		},

		/**
		 * {{#crossLink "SoundInstance"}}{{/crossLink}} �� Flash �Ɛ؂藣�����߂Ɏg���܂��B
		 * @method unregisterSoundInstance
		 * @param {String} flashId SoundInstance �����ʂ��邽�߂ɗp���� ID �ł��B
		 * @param {SoundLoader} instance �C���X�^���X��Ԃ��܂��B�i�󒍁FSoundLoader�ƂȂ��Ă��܂����ASoundInstance�̊ԈႦ�Ǝv���܂��j
		 */
		unregisterSoundInstance:function (flashId) {
			delete this.flashInstances[flashId];
		},

		/**
		 * Flash �� trace �o�͂��R���\�[���ɏo�͂��邽�߂Ɏg���܂��B
		 * @method flashLog
		 * @param {String} data �o�͂�����ł��B
		 */
		flashLog:function (data) {
			try {
				this.showOutput && console.log(data);
			} catch (error) {
			}
		},

		/**
		 * Flash �̃C�x���g�ɑΉ����AFlash ID ��p���� {{#crossLink "SoundInstance"}}{{/crossLink}} �Ƃ̘A�g��}��܂��B
		 * Flash ����^�����郁�\�b�h�ƈ����͂��̂܂� SoundInstance ��Ŏ��s����܂��B
		 * @method handleSoundEvent
		 * @param {String} flashId SoundInstance �����ʂ��邽�߂ɗp���� ID �ł��B
		 * @param {String} method ���s���郁�\�b�h���w�肵�܂��B
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
		 * Flash �̃C�x���g�ɑΉ����AFlash ID ��p���� {{#crossLink "SoundInstance"}}{{/crossLink}} �Ƃ̘A�g��}��܂��B
		 * Flash ����^�����郁�\�b�h�ƈ����͂��̂܂� SoundInstance ��Ŏ��s����܂��B
		 * @method handleSoundEvent
		 * @param {String} flashId SoundInstance �����ʂ��邽�߂ɗp���� ID �ł��B
		 * @param {String} method ���s���郁�\�b�h���w�肵�܂��B
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
		 * FlashPlugin �N���X�őΉ�����\��� Flash �̃C�x���g�������܂��B���� ready �C�x���g�̂ݎ��s���܂��B
		 * @method handleEvent
		 * @param {String} method ���s���郁�\�b�h���w�肵�܂��B
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
		 * Flash �̃G���[�C�x���g�������܂��B���݁A���̊֐��͂Ȃɂ����Ȃ����ɒ��ӂ��Ă��������B
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
		 * Flash ����Ăяo����܂��BFlash �����̍Đ����I���������Ƃ�ʒm���܂��B
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
		 * Flash ����Ăяo����܂��BFlash �������Ō�܂ōĐ������[�v�������Ƃ�ʒm���܂��B
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
	 * SoundLoader �́APreloadJS �� SoundJS �������� Flash �̃R���e���c��ǂݍ��ދ@�\��񋟂��܂��B
	 * �C���X�^���X�� preloader �Ŏ󂯎��Aload ���\�b�h�̓A�Z�b�g���K�v�ɂȂ����ۂɌĂяo����܂��B
	 *
	 * SoundLoader �́@&lt;audio&gt;
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
		 * ��������� Flash �C���X�^���X�ւ̎Q�Ƃł��B
		 * #property flash
		 * @type {Object | Embed}
		 */
		flash:null,

		/**
		 * �ǂݍ��މ����̃t�@�C���p�X�ł��B
		 * #property src
		 * @type {String}
		 */
		src:null,

		/**
		 * flash �Ƃ̘A�g���Ƃ邽�߂Ɏg�p����ID�ł��B
		 * #property flashId
		 * @type {String}
		 */
		flashId:null,

		/**
		 * �i�s�x�̃p�[�Z���g�ł��B
		 * #property progress
		 * @type {Number}
		 * @default -1
		 */
		progress:-1,

		/**
		 * �����̏����������������������߂Ɏg���܂��BreadyState=4 �����������������܂��B
		 * #property readyState
		 * @type {Number}
		 * @default 0
		 */
		readyState:0,

		/**
		 * <code>load</code> ���Ă΂ꂽ���������܂��B
		 * #property loading
		 * @type {Boolean}
		 * @default false
		 */
		loading:false,

		/**
		 * ���̃C���X�^���X�𐶐������v���O�C���ł��B<code>FlashPlugin</code> �C���X�^���X�ɂȂ�܂��B
		 * #property owner
		 * @type {Object}
		 */
		owner:null,

// Calbacks
		/**
		 * �ǂݍ��݂���������ƌĂяo�����R�[���o�b�N�֐��ł��BHTML�^�O���̕��K�ɏ]���Ă��܂��B
		 * #property onload
		 * @type {Method}
		 */
		onload:null,

		/**
		 * �ǂݍ��ݒ��ɌĂяo�����R�[���o�b�N�֐��ł��BHTML�^�O���̕��K�ɏ]���Ă��܂��B
		 * #property onprogress
		 * @type {Method}
		 */
		onprogress:null,

		/**
		 * �ǂݍ��ݒ��ɃG���[�����������ꍇ�ɌĂяo�����R�[���o�b�N�֐��ł��BHTML�^�O���̕��K�ɏ]���Ă��܂��B
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
		 * Flash �������������ہA�Ăяo����܂��B���̊֐������O�� load ���Ăяo����Ă����ꍇ�A���̊֐����ŉ��߂ČĂяo���܂��B
		 * #method initialize
		 * @param {Object | Embed} flash Flash �C���X�^���X�ւ̎Q�Ƃł�
		 */
		initialize:function (flash) {
			this.flash = flash;
			if (this.loading) {
				this.loading = false;
				this.load(this.src);
			}
		},

		/**
		 * �ǂݍ��݂��J�n���܂��B
		 * #method load
		 * @param {String} src �����̃t�@�C���p�X�ł��B
		 * @return {Boolean} �ǂݍ��݂��J�n��������Ԃ��܂��BFlash������������Ă��Ȃ������ꍇ�Aload �͎��s���܂��B
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
		 * Flash ����Progress�C�x���g���󂯎��A�R�[���o�b�N�֐��ɓn���܂��B
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
		 * ���̓ǂݍ��݂������������_�� Flash �Ăяo����܂��BreadyState�l��ݒ肵�A�R�[���o�b�N�֐��E�C�x���g�𔭍s���܂��B
		 * #method handleComplete
		 */
		handleComplete:function () {
			this.progress = 1;
			this.readyState = 4;
			createjs.Sound.sendLoadComplete(this.src);  // fire event or callback on Sound // can't use onload callback because we need to pass the source
			this.onload && this.onload();
		},

		/**
		 * Flash ����G���[�C�x���g���󂯎��A�R�[���o�b�N�֐��ɓn���܂��B
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
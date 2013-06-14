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
	 * Web Audio��p���ău���E�U�ŉ����Đ����܂��BWebAudio�v���O�C���́A�ȉ��̊��Ő��퓮����m�F���Ă��܂��B
	 * <ul><li>Google Chrome, version 23+ on OS X and Windows</li>
	 *      <li>Safari 6+ on OS X</li>
	 *      <li>Mobile Safari on iOS 6+</li>
	 * </ul>
	 *
	 * WebAudio�v���O�C���̓f�t�H���g�̃v���O�C���ł���A�T�|�[�g����Ă���΂��̃v���O�C�����g�p����܂��B
	 * �v���O�C���̗D�揇�ʂ�ύX����ɂ�Sound API {{#crossLink "Sound/registerPlugins"}}{{/crossLink}}���\�b�h���Q�Ƃ��������B
	 *
	 * <h4>�u���E�U/OS�ɂ����� Web Audio �̊��m�̖��_</h4>
	 * <b>Webkit (Chrome and Safari)</b><br />
	 * <ul><li>AudioNode.disconnect ���@�\���Ă��Ȃ����Ƃ�����悤�ł��B
	 * ���̖��́A���ʂ̉����t�@�C�����Đ����Ă���ꍇ�ɁA�t�@�C���T�C�Y�̎��Ԃɂ�鑝���������N�����\��������܂��B</li>
	 *
	 * <b>iOS 6 �̐���</b><br />
	 * <ul><li>���͏����ݒ�ł͏�����Ԃł���A���[�U�[�����N�����C�x���g(touch �C�x���g�Ȃ�)�̓�������Ăяo���ꂽ�ꍇ�̂݁A��������������܂��B</li>
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
	 ���̃v���O�C�����T�|�[�g����@�\�ł��B����� <code>WebAudioPlugin/generateCapabilities</code> ���\�b�h�Ő�������܂��B
	 * @property capabilities
	 * @type {Object}
	 * @default null
	 * @static
	 */
	s.capabilities = null;

	/**
	 * ���݂�browser/OS�ł��̃v���O�C�����g�p�\����Ԃ��܂��B
	 * @method isSupported
	 * @return {Boolean} �v���O�C�������������ꂽ����Ԃ��܂��B
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
	 * ���̃v���O�C�����T�|�[�g����@�\�����肵�܂��B���̃��\�b�h�͓����Ŏg�p����܂��B�@�\�̈ꗗ�́ASound �N���X��{{#crossLink "Sound/getCapabilities"}}{{/crossLink}}���Q�Ɖ������B
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
		 * ���̃v���O�C���̉��ʂ̏����l�ł��B
		 * @property volume
		 * @type {Number}
		 * @default 1
		 * @protected
		 */
		volume:1,

		/**
		 * WebAudio �������Đ�����ۂɗp����web audio �R���e�N�X�g�ł��BWebAudioPlugin �ƘA�g����S�Ă� Node �́A���̃R���e�N�X�g���琶�������K�v������܂��B
		 * @property context
		 * @type {AudioContext}
		 */
		context:null,

		/**
		 * http://www.w3.org/TR/webaudio/#DynamicsCompressorNode �ɂ��Ɖ��������コ�����c�݂�����邽�߂Ɏg���� DynamicsCompressorNode �ł��B
		 * ���̃m�[�h��<code>context.destination</code>�ɐڑ�����܂��B
		 * @property dynamicsCompressorNode
		 * @type {AudioNode}
		 */
		dynamicsCompressorNode:null,

		/**
		 * �}�X�^�[�{�����[����K�p���邽�߂� GainNode �ł��B���̃m�[�h��<code>dynamicsCompressorNode</code>�ɐڑ�����܂��B
		 * @property gainNode
		 * @type {AudioGainNode}
		 */
		gainNode:null,

		/**
		 * ArrayBuffers ��ێ����邽�߂ɓ����Ŏg�p�����A�ǂݍ��ݎ��Ɏw�肵��������URI�ŃC���f�b�N�X���ꂽ�n�b�V���e�[�u���ł��B
		 * ����͈�x�ǂݍ��񂾉����t�@�C�����A����ȏ�ǂݍ���/�f�R�[�h���Ă��܂�����������邽�߂Ɏg�p����܂��B
		 * 
		 If a load has been started on a file, <code>arrayBuffers[src]</code>
		 * will be set to true. Once load is complete, it is set the the loaded ArrayBuffer instance.
		 * @property arrayBuffers
		 * @type {Object}
		 * @protected
		 */
		arrayBuffers:null,

		/**
		 * �R���X�g���N�^�ɂ���ČĂяo����鏉�����֐��ł��B
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
		 * �ǂݍ��݂Ɛݒ�̂��߂ɉ�����\�ߓo�^���܂��B���̃��\�b�h��{{#crossLink "Sound"}}{{/crossLink}}����Ăяo����܂��B
		 * WebAudio �́A<a href="http://preloadjs.com">PreloadJS</a>���o�^�ɑΉ��ł���悤�ɁA<code>WebAudioLoader</code>�C���X�^���X�𐶐����鎖�ɒ��ӂ��ĉ������B
		 * @method register
		 * @param {String} src �����̃t�@�C���p�X�ł��B
		 * @param {Number} instances �`�����l���������ɍĐ��ł���C���X�^���X���ł��BWebAudioPlugin�͂��̃v���p�e�B���Ǘ����Ȃ����Ƃɒ��ӂ��ĉ������B
		 * @return {Object} �o�^�ɗp����"tag"���܂ރI�u�W�F�N�g��Ԃ��܂��B
		 */
		register:function (src, instances) {
			this.arrayBuffers[src] = true;  // This is needed for PreloadJS
			var tag = new WebAudioLoader(src, this);
			return {
				tag:tag
			};
		},

		/**
		 * �w�肵�������̓ǂݍ��݂��J�n����Ă��邩���`�F�b�N���܂��B���������������ꍇ�A�ǂݍ��ݒ��A�܂��͓ǂݍ��݊����Ƃ݂Ȃ��܂��B
		 * @method isPreloadStarted
		 * @param {String} src �`�F�b�N���鉹����URI�ł��B
		 * @return {Boolean}
		 */
		isPreloadStarted:function (src) {
			return (this.arrayBuffers[src] != null);
		},

		/**
		 * �w�肵�������̓ǂݍ��݂��������������`�F�b�N���܂��B������(true�ł͂Ȃ�)��`����Ă����ꍇ�A�ǂݍ��݂͊������Ă��܂��B
		 * @method isPreloadComplete
		 * @param {String} src �ǂݍ��މ�����URI�ł��B
		 * @return {Boolean}
		 */
		isPreloadComplete:function (src) {
			return (!(this.arrayBuffers[src] == null || this.arrayBuffers[src] == true));
		},

		/**
		 * �ǂݍ��񂾉����̃��X�g����w�肵���������폜���܂��B���̃��\�b�h�ł͓ǂݍ��݂��L�����Z���ł��Ȃ����Ƃɒ��ӂ��Ă��������B
		 * @method removeFromPreload
		 * @param {String} src �폜���鉹����URI�ł��B
		 * @return {Boolean}
		 */
		removeFromPreload:function (src) {
			delete(this.arrayBuffers[src]);
		},

		/**
		 * �ǂݍ��񂾉����̃n�b�V���ɉ�����ǉ����܂��B
		 * @method addPreloadResults
		 * @param {String} src �ǉ����鉹����URI�ł��B
		 * @return {Boolean}
		 */
		addPreloadResults:function (src, result) {
			this.arrayBuffers[src] = result;
		},

		/**
		 * �ǂݍ��݊����̓����n���h���ł��B
		 * @method handlePreloadComplete
		 * @private
		 */
		handlePreloadComplete:function () {
			//LM: I would recommend having the WebAudioLoader include an "event" in the onload, and properly binding this callback.
			createjs.Sound.sendLoadComplete(this.src);  // fire event or callback on Sound
			// note "this" will reference WebAudioLoader object
		},

		/**
		 * �����I�ɉ�����ǂݍ��݂܂��BWebAudio�ň��� array buffer �̓ǂݍ��݂ɂ� XHR2 ���g�p���Ă��܂��B
		 * @method preload
		 * @param {String} src �ǂݍ��މ�����URI�ł��B
		 * @param {Object} ���̃v���O�C���ł͎g�p���܂���B
		 * @protected
		 */
		preload:function (src, instance) {
			this.arrayBuffers[src] = true;
			var loader = new WebAudioLoader(src, this);
			loader.onload = this.handlePreloadComplete;
			loader.load();
		},

		/**
		 * sound �C���X�^���X�𐶐����܂��B�܂� sound ��ǂݍ���ł��Ȃ��ꍇ�A���̃��\�b�h�œǂݍ��݂܂��B
		 * Create a sound instance. If the sound has not been preloaded, it is internally preloaded here.
		 * @method create
		 * @param {String} src �g�p���鉹��URI�ł��B
		 * @return {SoundInstance} �Đ�����Ɏg�p���� sound �C���X�^���X�ł��B
		 */
		create:function (src) {
			if (!this.isPreloadStarted(src)) {
				this.preload(src);
			}
			return new SoundInstance(src, this);
		},

		/**
		 * ���̃v���O�C���̃}�X�^�[�{�����[����ݒ肵�܂��B�}�X�^�[�{�����[���l�͑S�Ă�SoundInstances�ɉe�����܂��B
		 * @method setVolume
		 * @param {Number} value 0�`1�̊Ԃ̃{�����[���l�ł��B
		 * @return {Boolean} �v���O�C����setVolume�Ăяo�������s��������Ԃ��܂��B���s�����ꍇ�ASound�N���X�͑S�ẴC���X�^���X�ɑ΂��Ď蓮�ŏ������s���܂��B
		 */
		setVolume:function (value) {
			this.volume = value;
			this.updateVolume();
			return true;
		},

		/**
		 * �}�X�^�[�I�[�f�B�I�̃Q�C���l��ݒ肵�܂��B�O������Ăяo���Ă͂����܂���B
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
		 * ���̃v���O�C���̃}�X�^�[�{�����[���l���擾���܂��B�}�X�^�[�{�����[���l�͑S�Ă�SoundInstances�ɉe�����܂��B
		 * @method getVolume
		 * @return 0�`1�̊Ԃ̃{�����[���l�ł��B
		 */
		getVolume:function () {
			return this.volume;
		},

		/**
		 * �v���O�C������Ă��ׂẲ����������܂��B
		 * @method setMute
		 * @param {Boolean} �S�Ẳ����������邩�ǂ����̒l�ł��B�v���O�C���ł̏����� Sound �N���X�̏����̒l
		 * {{#crossLink "Sound/masterMute"}}{{/crossLink}} ���Q�Ƃ��邾���ł���A���̃v���p�e�B�͂����ł͎g�p����Ȃ����Ƃɒ��ӂ��Ă��������B
		 * @return {Boolean} �����������������ǂ�����Ԃ��܂��B
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
	 * Sound API �̃��\�b�h {{#crossLink "Sound/play"}}{{/crossLink}} �� {{#crossLink "Sound/createInstance"}}{{/crossLink}} �Ȃǂ��Ă΂ꂽ�ہA
	 * ��������� SoundInstance �ł��BSoundInstance �́A���[�U�[�����삷�邽�߂Ɏg�p���̃v���O�C���ɂ���ĕԂ���܂��B
	 *
	 * <h4>Example</h4>
	 *      Sound.play("myAssetPath/mySrcFile.mp3");
	 *
	 * �ǉ��p�����[�^�̐��ɂ��A�������ōĐ�����Ă��邩�ȒP�ɓ��肷�鎖���ł��܂��B
	 * �������X�g�� Sound API �̃��\�b�h {{#crossLink "Sound/play"}}{{/crossLink}} ���Q�Ƃ��������B
	 * 
	 * ��x SoundInstance �����������ƁA���[�U�[�������𒼐ڑ���ł��� SoundInstance �̎Q�Ƃ�ێ����邱�Ƃ��ł��܂��B
	 * �����A���̎Q�Ƃ����[�U�[���ێ����Ȃ������ꍇ�ASoundInstance �͂��̉������Ō�܂ŉ��t���i���[�v���ĉ��t���j�A
	 * {{#crossLink "Sound"}}{{/crossLink}} �N���X����̎Q�Ƃ��������邽�߁A�����ŏ�������܂��B
	 * �����ێ������Q�Ƃ̉��Đ����������Ă����ꍇ�A{{#crossLink "SoundInstance/play"}}{{/crossLink}}�C���X�^���X�̃��\�b�h�̌Ăяo���ɂ��A
	 * ���삷�邽�߂̐V����Sound�N���X�ւ̎Q�Ƃ���������܂��B
	 *
	 *      var myInstance = Sound.play("myAssetPath/mySrcFile.mp3");
	 *      myInstance.addEventListener("complete", playAgain);
	 *      function playAgain(event) {
	 *          myInstance.play();
	 *      }
	 *
	 * ���̍Đ������������ꍇ�A���[�v�����ꍇ�A�Đ��Ɏ��s�����ꍇ�ɁA�C���X�^���X���C�x���g�����s����܂��B
	 * Events are dispatched from the instance to notify when the sound has completed, looped, or when playback fails
	 *
	 *      var myInstance = Sound.play("myAssetPath/mySrcFile.mp3");
	 *      myInstance.addEventListener("complete", playAgain);
	 *      myInstance.addEventListener("loop", handleLoop);
	 *      myInstance.addEventListener("playbackFailed", handleFailed);
	 *
	 *
	 * @class SoundInstance
	 * @param {String} src �����̃p�X�ƃt�@�C�����ł��B
	 * @param {Object} owner ���� SoundInstance �𐶐������v���O�C���C���X�^���X�ł��B
	 * @uses EventDispatcher
	 * @constructor
	 */
		// TODO noteGrainOn and noteOff have been deprecated in favor of start and stop, once those are implemented in browsers we should make the switch.  http://www.w3.org/TR/webaudio/#deprecation-section
	function SoundInstance(src, owner) {
		this.init(src, owner);
	}

	var p = SoundInstance.prototype = {

		/**
		 * �����̃t�@�C���p�X�ł��B
		 * @property src
		 * @type {String}
		 * @default null
		 * @protected
		 */
		src:null,

		/**
		 * �C���X�^���X�̈�ӂ� ID �ł��B���� ID �� <code>Sound</code> �ɂ���Đݒ肳��܂��B
		 * @property uniqueId
		 * @type {String} | Number
		 * @default -1
		 */
		uniqueId:-1,

		/**
		 * ���݂̉��̏��(state)�������܂��B���̏�Ԃ�<code>Sound</code>�N���X�̒萔�Œ�`����Ă��܂��B
		 * @property playState
		 * @type {String}
		 * @default null
		 */
		playState:null,

		/**
         * ���̃C���X�^���X�𐶐������v���O�C���ł��B
		 * @property owner
		 * @type {WebAudioPlugin}
		 * @default null
		 * @protected
		 */
		owner:null,

		/**
		 * �Đ����J�n����ʒu���~���b�P�ʂŎ����܂��B���̒l�� play ���Ăяo�����ɓn����A���̃g���b�N���ǂ̈ʒu�ɂ��邩�ɂ���
		 * pause �� setPosition �ŎQ�Ƃ���܂��B���̒l��WebAudio API�̈�ѐ��̂��߂ɁA�~���b�P�ʂ���b�P�ʂɕϊ�����鎖�ɒ��ӂ��Ă��������B
		 * @property offset
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		offset:0,

		/**
		 * �����Đ������܂ł̎��Ԃ��~���b�P�ʂŎ����܂��B
		 * ���̃v���p�e�B��<code>Sound</code>�ɂ���đ��삳��܂��B
		 * @property delay
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		delay:0,


		/**
		 * 0�`1�̊Ԃ̒l���Ƃ鉹�ʂł��B
		 * �A�N�Z�X�ɂ�<code>getVolume</code> �� <code>setVolume</code>���g���ĉ������B
		 * @property volume
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		volume:1,

		/**
		 * -1(��)�`1(�E)�̊Ԃ̒l���Ƃ鉹�̒�ʂł��B��ʂ�HTML Audio�ł͋@�\���Ȃ����ɒ��ӂ��ĉ������B
		 * �A�N�Z�X�ɂ�<code>getPan</code> �� <code>setPan</code>���g���ĉ������B
		 * @property pan
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		pan:0,


		/**
		 * �����̒������~���b�P�ʂŎ����܂��B
		 * �A�N�Z�X�ɂ�<code>getDuration</code>���g���Ă��������B
		 * @property pan
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		duration:0,

		/**
		 * �c��̃��[�v���ł��B���l�͉i�v�Ƀ��[�v���܂��B
		 * @property remainingLoops
		 * @type {Number}
		 * @default 0
		 * @protected
		 */
		remainingLoops:0,

		/**
		 * SoundInstance ���x���ƂƂ��ɉ��t�����ۂɁA<code>Sound</code> �ɂ���č����Timeout�ł��B
		 * ����ɂ��ASoundInstance���Đ��J�n����O�ɒ�~�A�ꎞ��~�A�C���X�^���X�폜���s��ꂽ�ꍇ�ɁA�x����j�����鎖���o����悤�ɂ��܂��B
		 * @property delayTimeoutId
		 * @type {timeoutVariable}
		 * @default null
		 * @protected
		 * @since 0.4.0
		 */
		delayTimeoutId:null, // OJR should we clear this when playback begins?  If they call play with delay and then just play it will behave oddly.

		/**
		 * �Đ������𑀍삷�邽�߂ɏ��������ɐ�������� Timeout �ł��B
		 * ��~�A�ꎞ��~�A�C���X�^���X�폜���s��ꂽ�ۂɁA����Timeout��j�����܂��B
		 * @property soundCompleteTimeout
		 * @type {timeoutVariable}
		 * @default null
		 * @protected
		 * @since 0.4.0
		 */
		soundCompleteTimeout:null,

		/**
		 * ���̃v���p�e�B�� <code>WebAudioPlugin</code> �ɂ̂ݑ��݂��A�㋉���[�U�[���g�p����O��ł��鎖�ɒ��ӂ��Ă��������B
		 * panNode �́A���E�`�����l���̒�ʂ̑���̂ݍs���܂��B<code>context.destination</code>�Ɍq�����Ă���<code>WebAudioPlugin.gainNode</code>�ɐڑ����܂��B
		 * @property panNode
		 * @type {AudioPannerNode}
		 * @default null
		 * @since 0.4.0
		 */
		// OJR expose the Nodes for more advanced users, test with LM how it will impact docs
		panNode:null,

		/**
		 * ���̃v���p�e�B�� <code>WebAudioPlugin</code> �ɂ̂ݑ��݂��A�㋉���[�U�[���g�p����O��ł��鎖�ɒ��ӂ��Ă��������B
		 * <code>SoundInstance</code>�̉��ʂ𑀍삷�� GainNode �ł��B<code>panNode</code> �Ɛڑ�����܂��B
		 * @property gainNode
		 * @type {AudioGainNode}
		 * @default null
		 * @since 0.4.0
		 *
		 */
		gainNode:null,

		/**
		 * ���̃v���p�e�B�� <code>WebAudioPlugin</code> �ɂ̂ݑ��݂��A�㋉���[�U�[���g�p����O��ł��鎖�ɒ��ӂ��Ă��������B
		 * sourceNode �́A�����ł��B<code>gainNode</code> �Ɛڑ�����܂��B
		 * @property sourceNode
		 * @type {AudioSourceNode}
		 * @default null
		 * @since 0.4.0
		 *
		 */
		sourceNode:null,

		/**
		 * ���݂̏�����Ԃł��B�A�N�Z�X�ɂ�<code>getMute</code>��<code>setMute</code>���g�p���Ă��������B
		 * @property muted
		 * @type {Boolean}
		 * @default false
		 * @protected
		 */
		muted:false,

		/**
		 * ���݂̈ꎞ��~��Ԃł��B�ݒ�ɂ�<code>pause()</code>��<code>resume()</code>���g�p���Ă��������B
		 * @property paused
		 * @type {Boolean}
		 * @default false
		 * @protected
		 */
		paused:false,

		/**
		 * WebAudioPlugin�ł̂ݗL���ł��B�b�P�ʂŎ����܂��B�Đ��ʒu�̐ݒ�Ǝ擾�A�ꎞ��~����̉񕜎��Ɏg���܂��B
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
		 * �������Đ��\�ɂȂ����ۂɔ��s����܂��B
		 * @event ready
		 * @param {Object} target �C�x���g�𔭍s�����^�[�Q�b�g�I�u�W�F�N�g�ł��B
		 * @param {String} type �C�x���g�^�C�v�ł��B
		 * @since 0.4.0
		 */

		/**
		 * ���̍Đ��ɐ��������ۂɔ��s����܂��B
		 * @event succeeded
		 * @param {Object} target �C�x���g�𔭍s�����^�[�Q�b�g�I�u�W�F�N�g�ł��B
		 * @param {String} type �C�x���g�^�C�v�ł��B
		 * @since 0.4.0
		 */

		/**
		 * ���̍Đ������f�����ۂɔ��s����܂��B����͓��������̕ʂ̃C���X�^���X�����f�I�v�V�����ōĐ����ꂽ�ۂɋN����܂��B
		 * @event interrupted
		 * @param {Object} target �C�x���g�𔭍s�����^�[�Q�b�g�I�u�W�F�N�g�ł��B
		 * @param {String} type �C�x���g�^�C�v�ł��B
		 * @since 0.4.0
		 */

		/**
		 * ���̍Đ��Ɏ��s�����ۂɔ��s����܂��B����͓����������Đ����̃`�����l�������������ꍇ��A
		 * (�܂��A���̏ꍇ�A���C���X���^���X�̒��f�͔������܂���)�A404�G���[�Ȃǂŉ������Đ��ł��Ȃ������ꍇ�ɋN����܂��B
		 * @event failed
		 * @param {Object} target �C�x���g�𔭍s�����^�[�Q�b�g�I�u�W�F�N�g�ł��B
		 * @param {String} type �C�x���g�^�C�v�ł��B
		 * @since 0.4.0
		 */

		/**
		 * ���̍Đ������������[�v�Đ����܂��c���Ă���ꍇ�ɔ��s����܂��B
		 * @event loop
		 * @param {Object} target �C�x���g�𔭍s�����^�[�Q�b�g�I�u�W�F�N�g�ł��B
		 * @param {String} type �C�x���g�^�C�v�ł��B
		 * @since 0.4.0
		 */

		/**
		 * ���̍Đ������������ۂɔ��s����܂��B����̓��[�v�Đ����܂߂ĉ��̍Đ����I���������Ƃ��Ӗ����܂��B
		 * @event complete
		 * @param {Object} target The object that dispatched the event.
		 * @param {String} type The event type.
		 * @since 0.4.0
		 */

// Callbacks
		/**
		 * �������Đ��\�ɂȂ����ۂɌĂяo����܂��B
		 * @property onReady
		 * @type {Function}
		 * @deprecated "ready" �C�x���g���g�p���Ă��������B�����̃o�[�W�����Ŕp�~����܂��B
		 */
		onReady:null,

		/**
		 * ���̍Đ��ɐ��������ۂɌĂяo����܂��B
		 * @property onPlaySucceeded
		 * @type {Function}
		 * @deprecated "succeeded" �C�x���g���g�p���Ă��������B�����̃o�[�W�����Ŕp�~����܂��B
		 */
		onPlaySucceeded:null,

		/**
		 * ���̍Đ������f�����ۂɌĂяo����܂��B
		 * @property onPlayInterrupted
		 * @type {Function}
		 * @deprecated "interrupted" �C�x���g���g�p���Ă��������B�����̃o�[�W�����Ŕp�~����܂��B
		 */
		onPlayInterrupted:null,

		/**
		 * ���̍Đ��Ɏ��s�����ۂɌĂяo����܂��B
		 * @property onPlayFailed
		 * @type {Function}
		 * @deprecated "failed" �C�x���g���g�p���Ă��������B�����̃o�[�W�����Ŕp�~����܂��B
		 */
		onPlayFailed:null,

		/**
		 * ���̍Đ������������ۂɌĂяo����܂��B
		 * @property onComplete
		 * @type {Function}
		 * @deprecated "complete" �C�x���g���g�p���Ă��������B�����̃o�[�W�����Ŕp�~����܂��B
		 */
		onComplete:null,

		/**
		 * ���̍Đ������������[�v�Đ����܂��c���Ă���ꍇ�ɌĂяo����܂��B
		 * @property onLoop
		 * @type {Function}
		 * @deprecated "loop" �C�x���g���g�p���Ă��������B�����̃o�[�W�����Ŕp�~����܂��B
		 */
		onLoop:null,


		/**
		 * SoundInstance �̑S�C�x���g�𔭍s���邽�߂̃w���p�[���\�b�h�ł��B
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
		 * SoundInstance �����������܂��B���̃��\�b�h�̓R���X�g���N�^����Ăяo����܂��B
		 * @method init
		 * @param {string} src �����̃t�@�C���p�X�ł��B
		 * @param {Class} owner ���̃C���X�^���X�𐶐������v���O�C���ł��B
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
		 * �C���X�^���X�����ꂢ�ɂ��܂��B�Q�Ƃ��폜���Atimer�̂悤�Ȓǉ��v���p�e�B�����ׂč폜���܂��B
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
		 * �����𒆒f���܂��B
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
		 * �C���X�^���X���Đ����܂��B���̃��\�b�h�́A���łɑ��݂���i�T�E���hAPI {{#crossLink "createInstance"}}{{/crossLink}} �Ő������ꂽ���A�Đ���������������x�Đ�����K�v������ꍇ�j SoundInstances ���Ăяo���܂��B
		 *
		 * <h4>Example</h4>
		 *      var myInstance = createJS.Sound.createInstance(mySrc);
		 *      myInstance.play(createJS.Sound.INTERRUPT_ANY);
		 *
		 * @method play
		 * @param {String} [interrupt=none] ���������̑��̃C���X�^���X���ǂ̂悤�ɒ��f���邩�B
		 * ���f���@���w�肷��l�́A{{#crossLink "Sound"}}{{/crossLink}}���ɒ萔�Ƃ��Ē�`����Ă��܂��B�f�t�H���g�l��<code>Sound.INTERRUPT_NONE</code>�ł��B
		 * @param {Number} [delay=0] �Đ����J�n����܂ł̒x�����~���b�P�ʂŎw�肵�܂��B
		 * @param {Number} [offset=0] �Đ����J�n����ʒu���~���bSound�Ŏw�肵�܂��B
		 * @param {Number} [loop=0] �J��Ԃ��Đ�����񐔂��w�肵�܂��B�i�v���[�v�̎w��ɂ�-1���g�p���ĉ������B
		 * @param {Number} [volume=1] 0�`1�̊Ԃŉ��ʂ��w�肵�܂��B
		 * @param {Number} [pan=0] -1(��)�`1(�E)�̊Ԃŉ��̒�ʂ��w�肵�܂��BHTML Audio�ł͒�ʂ͓����Ȃ����ɒ��ӂ��Ă��������B
		 */
		play:function (interrupt, delay, offset, loop, volume, pan) {
			this.cleanUp();
			createjs.Sound.playInstance(this, interrupt, delay, offset, loop, volume, pan);
		},

		/**
		 * ���Đ��̏�������������i�x������������j��Sound�N���X����Ă΂�܂��B�������ǂݍ��܂�Ă���΍Đ����J�n���܂����A�����łȂ���΍Đ��Ɏ��s���܂��B
		 * @method beginPlaying
		 * @param {Number} offset �Đ����J�n����ʒu���~���b�P�ʂŎw�肵�܂��B
		 * @param {Number} loop �J��Ԃ��Đ�����񐔂��w�肵�܂��B�i�v���[�v�̎w��ɂ�-1���g�p���ĉ������B
		 * @param {Number} volume 0�`1�̊Ԃŉ��ʂ��w�肵�܂��B
		 * @param {Number} pan -1(��)�`1(�E)�̊Ԃŉ��̒�ʂ��w�肵�܂��BHTML Audio�ł͒�ʂ͓����Ȃ����ɒ��ӂ��Ă��������B
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
		 * �C���X�^���X�̍Đ����ꎞ��~���܂��B�ꎞ��~���̉����͒�~���Ă���A{{#crossLink "SoundInstance/resume"}}{{/crossLink}}�ɂ���ĕ��A�ł��܂��B
		 *
		 * <h4>Example</h4>
		 *      myInstance.pause();
		 *
		 * @method pause
		 * @return {Boolean} �ꎞ��~��������������Ԃ��܂��B�������Đ����łȂ��ꍇ�Afalse��Ԃ��܂��B
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
		 * {{#crossLink "SoundInstance/pause"}}{{/crossLink}}�ňꎞ��~���ꂽ�C���X�^���X�𕜋A���܂��B
		 * �Đ����J�n���Ă��Ȃ������ł́A���̃��\�b�h���Ăяo���Ă��Đ����܂���B
		 * @method resume
		 * @return {Boolean} ���A�ɐ�����������Ԃ��܂��B�������ꎞ��~���Ă��Ȃ��ꍇ�Afalse��Ԃ��܂��B
		 */
		resume:function () {
			if (!this.paused) {
				return false;
			}
			this.handleSoundReady(null);
			return true;
		},

		/**
		 * �C���X�^���X�̍Đ����~���܂��B��~�������͍Đ��ʒu�����Z�b�g����A{{#crossLink "SoundInstance/resume"}}{{/crossLink}}�Ăяo���ɂ����s���܂��B
		 * @method stop
		 * @return {Boolean} ��~�ɐ�����������Ԃ��܂��B
		 */
		stop:function () {
			this.playState = createjs.Sound.PLAY_FINISHED;
			this.cleanUp();
			this.offset = 0;  // set audio to start at the beginning
			return true;
		},

		/**
		 * �C���X�^���X�̉��ʂ�ݒ肵�܂��B{{#crossLink "SoundInstance/getVolume"}}{{/crossLink}}�Ō��݂̉��ʂ��擾���鎖���o���܂��B
		 *
		 * <h4>Example</h4>
		 *      myInstance.setVolume(0.5);
		 *
		 * Sound API ��{{#crossLink "Sound/setVolume"}}{{/crossLink}} ���\�b�h���g�p���Đݒ肷��}�X�^�[�{�����[���̓C���X�^���X�{�����[���̏ォ�炳��ɓK�p����܂��B
		 *
		 * @method setVolume
		 * @param value 0�`1�̊Ԃ̉��ʒl�ł��B
		 * @return {Boolean} �Ăяo���ɐ�����������Ԃ��܂��B
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
		 * �C���X�^���X�{�����[���A�}�X�^�[�{�����[���A�C���X�^���X�̏����A�y�у}�X�^�[�����̒l���Q�l�ɉ��ʒl���X�V��������֐��ł��B
		 * @method updateVolume
		 * @return {Boolean} ���ʂ̍X�V�ɐ�����������Ԃ��܂��B
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
		 * �C���X�^���X�̉��ʒl���擾���܂��B���ۂ̏o�͒l�͉��L���ɂ���Čv�Z�ł��܂��F
		 *
		 *      instance.getVolume() x Sound.getVolume();
		 *
		 * @method getVolume
		 * @return �C���X�^���X�̌��݂̉��ʂ�Ԃ��܂��B
		 */
		getVolume:function () {
			return this.volume;
		},

		/**
		 * ���̏����A�����������s���܂��B�������ꂽ���ł����Ă�����0�ōĐ�����܂��B�������Ă��Ȃ����ł����Ă� Sound�N���X�̉��ʁA�C���X�^���X���ʁASound�N���X��mute�ɂ���Ă͏�������鎖�ɒ��ӂ��Ă��������B
		 * @method mute
		 * @param {Boolean} value ������������邩�A������������邩���w�肵�܂��B
		 * @return {Boolean} �����ɐ�����������Ԃ��܂��B
		 * @deprecated ���̃��\�b�h��setMute�ɒu�������܂����B
		 */
		mute:function (value) {
			this.muted = value;
			this.updateVolume();
			return true;
		},

		/**
		 * ���̏����A�����������s���܂��B�������ꂽ���ł����Ă�����0�ōĐ�����܂��B�������Ă��Ȃ����ł����Ă� Sound�N���X�̉��ʁA�C���X�^���X���ʁASound�N���X��mute�ɂ���Ă͏�������鎖�ɒ��ӂ��Ă��������B
		 * @method mute
		 * @param {Boolean} value ������������邩�A������������邩���w�肵�܂��B
		 * @return {Boolean} �����ɐ�����������Ԃ��܂��B
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
		 * �C���X�^���X�̏�����Ԃ��擾���܂��B
		 *
		 * <h4>Example</h4>
		 *      var isMuted = myInstance.getMute();
		 *
		 * @method getMute
		 * @return {Boolean} ��������Ă��邩��Ԃ��܂��B
		 * @since 0.4.0
		 */
		getMute:function () {
			return this.muted;
		},

		/**
		 * �C���X�^���X�̍��E��ʂ�ݒ肵�܂��B{{#crossLink "HTMLAudioPlugin"}}{{/crossLink}} �͒�ʂɑΉ����Ă��炸�A
		 * {{#crossLink "WebAudioPlugin"}}{{/crossLink}}�ɂ̂ݎ�������Ă��邱�Ƃɒ��ӂ��Ă��������B�f�t�H���g��0�i�����j�ł��B
		 * @method setPan
		 * @param {Number} -1(��)�`1(�E)�̊Ԃŉ��̒�ʂ��w�肵�܂��B
		 * @return {Number} �Ăяo���ɐ�����������Ԃ��܂��B
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
		 * �C���X�^���X�̍��E��ʂ��擾���܂��B3D�����̏ꍇ WebAudioPlugin ��x�l�����Ԃ��Ȃ����ɒ��ӂ��ĉ������B
		 * @method getPan
		 * @return {Number} -1(��)�`1(�E)�̊Ԃŉ��̒�ʂ��w�肵�܂��B
		 */
		getPan:function () {
			return this.pan;
		},

		/**
		 * �C���X�^���X�̍Đ����J�n����ʒu���~���b�P�ʂŎ擾���܂��B
		 * @method getPosition
		 * @return {Number} ���̍Đ��ʒu���~���b�P�ʂŕԂ��܂��B
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
		 * �C���X�^���X�̍Đ����J�n����ʒu���~���b�P�ʂŐݒ肵�܂��B���̒l�́A���̍Đ����A�ꎞ��~���A�܂���~���ł����Ă��ݒ肷�邱�Ƃ��ł��܂��B
		 *
		 * <h4>Example</h4>
		 *      myInstance.setPosition(myInstance.getDuration()/2); // set audio to it's halfway point.
		 *
		 * @method setPosition
		 * @param {Number} value ���̍Đ��ʒu���~���b�P�ʂŕԂ��܂��B
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
		 * �C���X�^���X�̍Đ����Ԃ��~���b�P�ʂŎ擾���܂��B
		 * �قƂ�ǂ̏ꍇ�A�Đ����Ԃ𐳊m�ɂ��邽�߂ɂ�{{#crossLink "SoundInstance/play"}}{{/crossLink}} �� 
		 * {{#crossLink "Sound.play"}}{{/crossLink}}�ɂ���ĉ����Đ�����K�v������܂��B
		 * @method getDuration
		 * @return {Number} �T�E���h�C���X�^���X�̍Đ����Ԃ��~���b�P�ʂŕԂ��܂��B
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
	 * XHR�o�R��web audio ��ǂݍ��ލۂ̃w���p�[�N���X�ł��B���̃N���X�Ƃ��̃��\�b�h��HTML����������ړI�ŕ��͉����Ă��Ȃ����Ƃɒ��ӂ��Ă��������B
	 * #class WebAudioLoader
	 * @param {String} src �ǂݍ��މ����̃t�@�C���p�X�ł��B
	 * @param {Object} owner ���̃C���X�^���X�𐶐������N���X�ւ̎Q�Ƃł��B
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
		 * �ǂݍ��މ����̃t�@�C���p�X�ł��B���̃N���X��Ԃ����ꍇ�̃R�[���o�b�N�֐����Ŏg�p����܂��B
		 * #property src
		 * @type {String}
		 */
		src:null,

		/**
		 * �ǂݍ��݂����������ۂɕԂ��A�f�R�[�h����AudioBuffer�z��ł��B
		 * #property result
		 * @type {AudioBuffer}
		 * @protected
		 */
		result:null,

		// Calbacks
		/**
		 * �t�@�C���ǂݍ��݂����������ۂɔ��s�����R�[���o�b�N�ł��BHTML�^�O�ɏ����Ă��܂��B
		 * #property onload
		 * @type {Method}
		 */
		onload:null,

		/**
		 * �t�@�C���ǂݍ����ɔ��s�����R�[���o�b�N�ł��BHTML�^�O�ɏ����Ă��܂��B
		 * #property onprogress
		 * @type {Method}
		 */
		onprogress:null,

		/**
		 * �G���[�����������ۂɔ��s�����R�[���o�b�N�ł��BHTML�^�O�ɏ����Ă��܂��B
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
		 * �ǂݍ��݂��J�n���܂��B
		 * #method load
		 * @param {String} src �����̃t�@�C���p�X�ł��B
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
		 * loader���i����񍐂��܂��B
		 * #method handleProgress
		 * @param {Number} loaded ���[�h�����ʂł��B
		 * @param {Number} total ���[�h����S�ʂł��B
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
		 * �ǂݍ��݊����ł��B
		 * #method handleLoad
		 * @protected
		 */
		handleLoad:function () {
			s.context.decodeAudioData(this.request.response,
					createjs.proxy(this.handleAudioDecoded, this),
					createjs.proxy(this.handleError, this));
		},

		/**
		 * ���������o���܂����B
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
		 * loader���ŃG���[���������܂����B
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

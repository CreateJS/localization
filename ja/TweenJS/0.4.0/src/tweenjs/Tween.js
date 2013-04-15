/*
* Tween
* ドキュメント、更新、例については、 http://createjs.com/ を参照してください。
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
 * TweenJS Javascriptライブラリは、シンプルですがパワフルなトゥイーンのインタフェースを提供します。
 * これは、オブジェクトの数値プロパティやCSSのスタイルプロパティ間のトゥイーンをサポートし、トゥイーンやアクションを
 * 一緒にチェーンすることで、複雑なシーケンスを作成することを可能にします。
 *
 * <h4>単純なトゥイーン</h4>
 * このトゥイーンは、ターゲットのalphaプロパティを0から1まで１秒でトゥイーンし、関数<code>onComplete</code>を呼びます。
 *
 *	    target.alpha = 0;
 *	    Tween.get(target).to({alpha:1}, 1000).call(onComplete);
 *	    function onComplete() {
 *	    	//Tween complete
 *	    }
 *
 * <h4>チェーン可能なトゥイーン</h4> 
 * このトゥイーンは、0.5秒待ち、ターゲットのalphaプロパティを1秒で0にトゥイーンし、そのvisibleをfalseにします。
 * そして、関数<code>onComplete</code>を呼びます。
 *
 *	    target.alpha = 1;
 *	    Tween.get(target).wait(500).to({alpha:0, visible:false}, 1000).call(onComplete);
 *	    function onComplete() {
 *	    	//Tween complete
 *	    }
 *
 * @module TweenJS
 */
 
// TODO: 可能なら、END アクションモードを追加する。 (only runs actions that == position)?
// TODO: ポーズをtick登録から分離する方法を評価する

// 名前空間:
this.createjs = this.createjs||{};

(function() {
/**
 * トゥイーンインスタンスは、単一ターゲットのプロパティをトゥイーンする。インスタンスメソッドは、簡単な構築と順序づけのために
 * チェーンさせることができる:
 *
 * <h4>例</h4>
 *
 *      target.alpha = 1;
 *	    Tween.get(target)
 *	         .wait(500)
 *	         .to({alpha:0, visible:false}, 1000)
 *	         .call(onComplete);
 *	    function onComplete() {
 *	    	//Tween complete
 *	    }
 *
 * 複数のトゥイーンは、同じインスタンスを指すことができる。しかしながら、それらが同じプロパティに影響を与える場合に
 * 予期しないふるまいとなる可能性がある。
 * オブジェクトのすべてのトゥイーンを止めるには、{{#crossLink "Tween/removeTweens"}}{{/crossLink}} を使うか、もしくは
 * <code>override:true</code>をプロパティの引数で渡してください。
 *
 *      Tween.get(target, {override:true}).to({x:100});
 *
 * ターゲットのプロパティが変化したときに知らせてもらうには、"change"イベントを登録してください。
 *
 *      Tween.get(target, {override:true}).to({x:100}).addEventListener("change", handleChange);
 *      function handleChange(event) {
 *          // The tween changed.
 *      }
 *
 * 追加パラメータのドキュメントは、トゥイーン {{#crossLink "Tween/get"}}{{/crossLink}} メソッドを参照してください。
 * @class Tween
 * @constructor
 */
var Tween = function(target, props, pluginData) {
  this.initialize(target, props, pluginData);
}
var p = Tween.prototype;

// 静的インスタンス:
	/** 
	 * setPositionと共に使用するためにアクションモード以外に定義する定数
	 * @property NONE
	 * @type Number
	 * @default 0
	 * @static
	 **/
	Tween.NONE = 0;
	
	/** 
	 * setPositionと共に使用するためにループアクションモードを定義する定数
	 * @property LOOP
	 * @type Number
	 * @default 1
	 * @static
	 **/
	Tween.LOOP = 1;
	
	/** 
	 * setPositionと共に使用するためにリバースアクションモードを定義する定数
	 * @property REVERSE
	 * @type Number
	 * @default 2
	 * @static
	 **/
	Tween.REVERSE = 2;

	/**
	 * ディフォルトの割り当てを使わないようにトゥイーンに伝えるためにプラグインによって返される定数
	 * @property IGNORE
	 * @type Object
	 * @static
	 */
	Tween.IGNORE = {};
	
	/** 
	 * @property _listeners
	 * @type Array[Tween]
	 * @static
	 * @protected 
	 **/
	Tween._tweens = [];
	
	/** 
	 * @property _plugins
	 * @type Object
	 * @static
	 * @protected 
	 **/
	Tween._plugins = {};

	/**
	 * 新しいトゥイーンインスタンスを返す。これは "new Tween(...)"を使うのと機能的に同じです。
	 * しかし、TweenJSのチェーンされた構文でよりきれいに見えます。
	 * @example
	 *	var tween = createjs.Tween.get(target);
	 * @method get
	 * @static
	 * @param {Object} target トゥイーンされたプロパティを持つターゲットオブジェクト
	 * @param {Object} props このツゥイーンインスタンスを適用するプロパティ（例. <code>{loop:true, paused:true}</code>）。
	 * すべてのプロパティのディフォルトはfalse。サポートされるプロパティは:<UL>
	 *    <LI> loop: このツゥイーンにループをセットする。</LI>
	 *    <LI> useTicks: すべての期間にミリ秒の代わりにtickを使用する。</LI>
	 *    <LI> ignoreGlobalPause: このトゥイーン上でGlobalPauseを無視する。</LI>
	 *    <LI> override: trueならば、 同じターゲットを持つ他のトゥイーンを削除するためにTween.removeTweens(target)が呼ばれる。
	 *    <LI> paused: 一時停止されたツゥイーンが開始するかどうかを示す。</LI>
	 *    <LI> position: このツゥイーンの最初の位置を示す。</LI>
	 *    <LI> onChange: このツゥイーンのonChangeハンドラを指定する。これは "change"イベントを後継として将来廃止される可能性が
	 *    あることに注意してください。</LI>
	 * </UL>
	 * @param {Object} [pluginData] インストールされたプラグインによって使用されるデータを含むオブジェクト。
	 * 詳細は個々のプラグインのドキュメントを参照してください。
	 * @param {Boolean} [override=false] trueなら、同じターゲットの先行するツゥイーンは削除されます。これは、
	 * <code>Tween.removeTweens(target)</code>を呼ぶことと同じです。
	 * @return {Tween} 作成されたトゥイーンへの参照。追加のチェーンされたツゥイーン、メソッド呼び出し、コールバックは
	 * 返されたツゥイーンインスタンスに適用することができます。
	 **/
	Tween.get = function(target, props, pluginData, override) {
		if (override) { Tween.removeTweens(target); }
		return new Tween(target, props, pluginData);
	}
	
	/**
	 * すべてのツゥイーンを進めます。これは、通常（EaselJSライブラリで利用可能な）Tickerクラスを使います。しかし、
	 * もし、独自の"heartbeat"実装が使いたい場合は、手動でそれを呼ぶこともできます。
	 * @method tick
	 * @static
	 * @param {Number} delta 最後のtickからの時間の変化（単位ミリ秒）。すべてのツゥイーンで<code>useTicks</code>がtrueでないことが
	 * 要求されます。
	 * @param {Boolean} paused グローバルポーズが実施されているかどうかを示します。 <code>ignoreGlobalPause</code>がセットされた
	 * トゥイーンはこれを無視します。しかし、もしこれがtrueなら、すべてのトゥイーンはポーズします。
	 **/
	Tween.tick = function(delta, paused) {
		var tweens = Tween._tweens.slice(); // to avoid race conditions.
		for (var i=tweens.length-1; i>=0; i--) {
			var tween = tweens[i];
			if ((paused && !tween.ignoreGlobalPause) || tween._paused) { continue; }
			tween.tick(tween._useTicks?1:delta);
		}
	}
	if (createjs.Ticker) { createjs.Ticker.addListener(Tween,false); }
	
	
	/** 
	 * ターゲットのすべての存在するツィーンを削除します。
	 * <code>override</code>プロパティがtrueなら、新しいトゥイーンによって、これは自動的に呼ばれます。
	 * @method removeTweens
	 * @static
	 * @param {Object} target 存在するトゥイーンを削除するためのターゲットオブジェクト。
	 **/
	Tween.removeTweens = function(target) {
		if (!target.tweenjs_count) { return; }
		var tweens = Tween._tweens;
		for (var i=tweens.length-1; i>=0; i--) {
			if (tweens[i]._target == target) {
				tweens[i]._paused = true;
				tweens.splice(i,1);
			}
		}
		target.tweenjs_count = 0;
	}
	
	/** 
	 * （指定されていれば）ターゲットオブジェクト上に有効なトゥイーンがあるか、一般的かを示します。
	 * @method hasActiveTweens
	 * @static
	 * @param {Object} target オプション。指定されなければ、戻り値は、いずれかのターゲット上でアクティブなツゥイーンがあるか
	 * どうかを示します。
	 * @return {Boolean} アクティブツゥイーンがあるかどうかを示すブール値。
	 **/
	Tween.hasActiveTweens = function(target) {
		if (target) { return target.tweenjs_count; }
		return Tween._tweens && Tween._tweens.length;
	}
	
	/** 
	 * トゥイーン時にどうプロパティを扱うかを修正できるプラグインをインストールします。
	 * TweenJSプラグインをどのように書くかの例は CSSPluginを参照してください。
	 * @method installPlugin
	 * @static
	 * @param {Object} plugin インストールするプラグインクラス
	 * @param {Array} properties プラグインが扱うプロパティの配列
	 **/
	Tween.installPlugin = function(plugin, properties) {
		var priority = plugin.priority;
		if (priority == null) { plugin.priority = priority = 0; }
		for (var i=0,l=properties.length,p=Tween._plugins;i<l;i++) {
			var n = properties[i];
			if (!p[n]) { p[n] = [plugin]; }
			else {
				var arr = p[n];
				for (var j=0,jl=arr.length;j<jl;j++) {
					if (priority < arr[j].priority) { break; }
				}
				p[n].splice(j,0,plugin);
			}
		}
	}
	
	/** 
	 * tickシステムでのトゥイーンを登録もしくは解除します。
	 * @method _register
	 * @static
	 * @protected 
	 **/
	Tween._register = function(tween, value) {
		var target = tween._target;
		if (value) {
			// TODO: ES5においてdevが封印されたオブジェクトを使うなら、このアプローチは失敗するかもしれません。
			if (target) { target.tweenjs_count = target.tweenjs_count ? target.tweenjs_count+1 : 1; }
			Tween._tweens.push(tween);
		} else {
			if (target) { target.tweenjs_count--; }
			var i = Tween._tweens.indexOf(tween);
			if (i != -1) { Tween._tweens.splice(i,1); }
		}
	}
    
    // mix-ins:
    // EventDispatcher methods:
    p.addEventListener = null;
    p.removeEventListener = null;
    p.removeAllEventListeners = null;
    p.dispatchEvent = null;
    p.hasEventListener = null;
    p._listeners = null;

    createjs.EventDispatcher.initialize(p); // EventDispatcherメソッドを注入する。  

// パブリックプロパティ:
	/**
	 * グローバルポーズがアクティブのとき、このツゥイーンは再生を継続します。たとえば、TweenJSがTickerを使用しているなら、
	 * これをtrueにセットすることで（ディフォルト）、<code>Ticker.setPaused(true)</code>が呼ばれるとき、このトゥイーンはポーズします。
	 * 詳細は、Tween.tick()を参照してください。プロパティのパラメータ経由で設定できます。
	 * @property ignoreGlobalPause
	 * @type Boolean
	 * @default false
	 **/
	p.ignoreGlobalPause = false;
	
	/**
	 * trueなら、最後まで達したときにトゥイーンはループします。プロパティのパラメータ経由でセット可能です。
	 * @property loop
	 * @type {Boolean}
	 * @default false
	 **/
	p.loop = false;
	
	/**
	 * リードオンリー。このトゥイーンの合計の期間をミリ秒単位で示します。（もしくは、useTicksがtrueなら、tick単位)
	 * この値は、トゥイーンが修正されるなら、自動的に更新されます。直接、値を変更することは予期しないふるまいになる
	 * 可能性があります。
	 * @property duration
	 * @type {Number}
	 * @default 0
	 **/
	p.duration = 0;
	
	/**
	 * インストールされるプラグインによって使用されるデータを指定できるようにします。それぞれのプラグインは、これを別に使います。
	 * しかし、通常はプラグインクラスとして同じ名前でプラグインデータのプロパティに設定します。
	 * @example
	 *	myTween.pluginData.PluginClassName = data;
	 * <br/>
	 * ほとんどのプラグインは、これらを有効または無効にするプロパティもサポートします。
	 * これは通常は、プラグインのクラス名に "_enabled"を続けます。<br/>
	 * @example 
	 *	myTween.pluginData.PluginClassName_enabled = false;<br/>
	 * <br/>
	 * いくつかのプラグインは、オブジェクトにインスタンスデータも保存します。これは通常、_PluginClassName
	 * という名前のプロパティになります。詳細は、個々のプラグインのドキュメントを参照してください。
	 * @property pluginData
	 * @type {Object}
	 **/
	p.pluginData = null;
	
	/**
	 * 単一パラメータでこのツゥイーンインスタンスを参照して、トゥイーンの位置の変更する場合に呼び出されます。
	 * @property onChange
	 * @type {Function}
	 **/
	p.onChange = null;
    
    /**
	 * 単一パラメータでこのツゥイーンインスタンスを参照して、トゥイーンの位置の変更する場合に呼び出されます。
     * @event change
     * @since 0.4.0
	 **/
    p.change = null;
	
	/**
	 * リードオンリー。このトゥイーンのターゲット。これは、トゥイーンされるプロパティが変更するオブジェクトです。
	 * トゥイーンが生成された後、このプロパティを変更することでは、他の効果はありません。
	 * @property target
	 * @type {Object}
	 **/
	p.target = null;
	
	/**
	 * リードオンリー。現在の正常化された(Normalized)トゥイーンの位置。これは常に0からdurationの間の値となります
	 * 直接このプロパティを変更することでは、他の効果はありません。
	 * @property position
	 * @type {Object}
	 **/
	p.position = null;

// プライベートプロパティ:
	
	/**
	 * @property _paused
	 * @type {Boolean}
	 * @default false
	 * @protected
	 **/
	p._paused = false;
	
	/**
	 * @property _curQueueProps
	 * @type {Object}
	 * @protected
	 **/
	p._curQueueProps = null;
	
	/**
	 * @property _initQueueProps
	 * @type {Object}
	 * @protected
	 **/
	p._initQueueProps = null;
	
	/**
	 * @property _steps
	 * @type {Array}
	 * @protected
	 **/
	p._steps = null;
	
	/**
	 * @property _actions
	 * @type {Array}
	 * @protected
	 **/
	p._actions = null;
	
	/**
	 * Raw position.
	 * @property _prevPosition
	 * @type {Number}
	 * @default 0
	 * @protected
	 **/
	p._prevPosition = 0;

	/**
	 * 現在のステップ内の位置
	 * @property _stepPosition
	 * @type {Number}
	 * @default 0
	 * @protected
	 */
	p._stepPosition = 0; // これはMovieClipが必要としている。
	
	/**
	 * 正常化された(Normalized)位置
	 * @property _prevPos
	 * @type {Number}
	 * @default -1
	 * @protected
	 **/
	p._prevPos = -1;
	
	/**
	 * @property _target
	 * @type {Object}
	 * @protected
	 **/
	p._target = null;
	
	/**
	 * @property _useTicks
	 * @type {Boolean}
	 * @default false
	 * @protected
	 **/
	p._useTicks = false;
	
// コンストラクタ:
	/** 
	 * @method initialize
	 * @param {Object} target
	 * @param {Object} props
	 * @param {Object} pluginData
	 * @protected
	 **/
	p.initialize = function(target, props, pluginData) {
		this.target = this._target = target;
		if (props) {
			this._useTicks = props.useTicks;
			this.ignoreGlobalPause = props.ignoreGlobalPause;
			this.loop = props.loop;
			this.onChange = props.onChange;
			if (props.override) { Tween.removeTweens(target); }
		}
		
		this.pluginData = pluginData || {};
		this._curQueueProps = {};
		this._initQueueProps = {};
		this._steps = [];
		this._actions = [];
		if (props&&props.paused) { this._paused=true; }
		else { Tween._register(this,true); }
		if (props&&props.position!=null) { this.setPosition(props.position, Tween.NONE); }
	}
	
// パブリックメソッド:
	/** 
	 * 待ちのキューをつくります（基本的に空のトゥイーン）
	 * @example                                                   
	 *	//このトゥイーンはalphaが0になる前に1秒待ちます。
	 *	createjs.Tween.get(target).wait(1000).to({alpha:0}, 1000);
	 * @method wait
	 * @param {Number} duration ミリ秒単位の待ち時間 (もしくは、<code>useTicks</code>がtrueなら、tick単位)。
	 * @return {Tween} このトゥイーンインスタンス（変更呼び出しのための）。
	 **/
	p.wait = function(duration) {
		if (duration == null || duration <= 0) { return this; }
		var o = this._cloneProps(this._curQueueProps);
		return this._addStep({d:duration, p0:o, e:this._linearEase, p1:o});
	}

	/** 
	 * 現在の値からターゲットプロパティへのトゥイーンのキューをつくります。これらの値にジャンプするためにdurationに
	 * 0をセットします。数値プロパティは、現在の値からターゲット値までで、トゥイーンします。非数値プロパティは、
	 * 指定されたdurationの終わりで、セットされます。
	 * @example
	 *	createjs.Tween.get(target).to({alpha:0}, 1000);
	 * @method to
	 * @param {Object} props このトゥイーンのプロパティのターゲット値に指定したオブジェクト。
	 *      （例．　<code>{x:300}</code>は、ターゲットのxプロパティを300にトゥイーンします。）
	 * @param {Number} duration オプション。ミリ秒単位での待ち時間（もしくは、<code>useTicks</code>がtrueなら、tick単位。
	 *      ディフォルトは、0。
	 * @param {Function} ease オプション。このトゥイーンのイージング関数。ディフォルトは、リニア。
	 * @return {Tween} このトゥイーンインスタンス（変更呼び出しのための）。
	 **/
	p.to = function(props, duration, ease) {
		if (isNaN(duration) || duration < 0) { duration = 0; }
		return this._addStep({d:duration||0, p0:this._cloneProps(this._curQueueProps), e:ease, p1:this._cloneProps(this._appendQueueProps(props))});
	}
	
	/** 
	 * 指定した関数を呼ぶためのアクションのキューをつくります。
	 *	@example
	 *   	//would call myFunction() after 1s.      
	 *   	myTween.wait(1000).call(myFunction);
	 * @method call
	 * @param {Function} callback 呼び出すための関数。
	 * @param {Array} params オプション。関数と共に呼び出すパラメータ。これがない場合は、関数はこのトゥイーンを指す
	 *      単一のパラメータのみで呼び出されます。
	 * @param {Object} scope オプション。関数を呼ぶためのスコープ。これがない場合は、ターゲットのスコープで呼び出されます。
	 * @return {Tween} このトゥイーンインスタンス（変更呼び出しのための）。
	 **/
	p.call = function(callback, params, scope) {
		return this._addAction({f:callback, p:params ? params : [this], o:scope ? scope : this._target});
	}
	
	// TODO: これと0 duration .toの間の明確化を追加する
	/** 
	 * 指定されたターゲット上で指定したプロパティをセットするアクションのキューをつくります。ターゲットがnullなら、
	 * このトゥイーンのターゲットを使います。
	 * @example
	 *	myTween.wait(1000).set({visible:false},foo);
	 * @method set
	 * @param {Object} props セットするプロパティ（例. <code>{visible:false}</code>）。
	 * @param {Object} target オプション。プロパティをセットするターゲット。これがなければ、そのトゥイーンのターゲットにセットされます。
	 * @return {Tween} このトゥイーンインスタンス（変更呼び出しのための）。
	 **/
	p.set = function(props, target) {
		return this._addAction({f:this._set, o:this, p:[props, target ? target : this._target]});
	}
	
	/** 
	 * 指定されたトゥイーンを再生する（ポーズを解除する）ためのアクションのキューをつくります。
	 * これは複数トゥイーンのシーケンスを可能にします。
	 * @example 
	 *	myTween.to({x:100},500).play(otherTween);
	 * @method play
	 * @param {Tween} tween 再生するためのトゥイーン。
	 * @return {Tween} このトゥイーンインスタンス（変更呼び出しのための）。
	 **/
	p.play = function(tween) {
		return this.call(tween.setPaused, [false], tween);
	}

	/** 
	 * 指定されたトゥイーンを停止するためのアクションのキューをつくります。
	 * @method pause
	 * @param {Tween} tween 再生するためのトゥイーン。nullならば、このトゥイーンを停止します。
	 * @return {Tween} このトゥイーンインスタンス（変更呼び出しのための）。
	 **/
	p.pause = function(tween) {
		if (!tween) { tween = this; }
		return this.call(tween.setPaused, [true], tween);
	}
	
	/** 
	 * 指定された位置にトゥイーンを進めます。
	 * @method setPosition
	 * @param {Number} value シークするミリ秒単位の位置（もしくは、useTicksがtrueなら、tick単位）
	 * @param {Number} actionsMode アクションをどう扱うかを示すオプションのパラメータ（例. call, set, play, pause):
	 *      <code>Tween.NONE</code> (0) - アクションを実行しません。<code>Tween.LOOP</code> (1) - もし新しい位置が古い位置より小さいなら、
	 *      古い位置とdurationの間のアクションをすべて実行し、0と新しい位置の間のアクションをすべて実行します。ディフォルトは、<code>LOOP</code>になります。
	 *      <code>Tween.REVERSE</code> (2) - もし、新しい位置が古い位置より前ならば、この間のすべてのアクションを逆に実行します。
	 * @return {Boolean} このトゥイーンが完了したら、trueを返します。(例. すべてのトゥイーンを実行し、loopがfalseならば）
	 **/
	p.setPosition = function(value, actionsMode) {
		if (value < 0) { value = 0; }
		if (actionsMode == null) { actionsMode = 1; }
		
		// normalize position:
		var t = value;
		var end = false;
		if (t >= this.duration) {
			if (this.loop) { t = t%this.duration; }
			else {
				t = this.duration;
				end = true;
			}
		}
		if (t == this._prevPos) { return end; }
		
		
		var prevPos = this._prevPos;
		this.position = this._prevPos = t; // アクションがpositionを変更する前にこれをセットします
		this._prevPosition = value;
		
		// トゥイーンを扱います:
		if (this._target) {
			if (end) {
				// 終わりのゼロlengthステップの問題に対処します。
				this._updateTargetProps(null,1);
			} else if (this._steps.length > 0) {
				// 新しいトゥイーンのindexを探します:
				for (var i=0, l=this._steps.length; i<l; i++) {
					if (this._steps[i].t > t) { break; }
				}
				var step = this._steps[i-1];
				this._updateTargetProps(step,(this._stepPosition = t-step.t)/step.d);
			}
		}
		
		// アクションを実行します:
		if (actionsMode != 0 && this._actions.length > 0) {
			if (this._useTicks) {
				// 着地したアクションだけを実行します。
				this._runActions(t,t);
			} else if (actionsMode == 1 && t<prevPos) {
				if (prevPos != this.duration) { this._runActions(prevPos, this.duration); }
				this._runActions(0, t, true);
			} else {
				this._runActions(prevPos, t);
			}
		}

		if (end) { this.setPaused(true); }
		
		this.onChange&&this.onChange(this);
        this.dispatchEvent("change");
		return end;
	}

	/** 
	 * このトゥイーンを指定された量のミリ秒単位の時間によって進めます（もしくは、 <code>useTicks</code>がtrueの場合は、tick単位）。
	 * これは通常トゥイーンエンジンによって自動的に呼び出されます（<code>Tween.tick</code>経由）。しかし、上級者向けに見えるようにしてあります。
	 * @method tick
	 * @param {Number} delta 進めるためのミリ秒単位の時間（もしくは、 <code>useTicks</code>がtrueの場合は、tick単位）
	 **/
	p.tick = function(delta) {
		if (this._paused) { return; }
		this.setPosition(this._prevPosition+delta);
	}

	/** 
	 * このトゥイーンの一時停止もしくは再生
	 * @method setPaused
	 * @param {Boolean} value トゥイーンが一時停止されるべきか(true)、再生されるべきか(false)を指定します。
	 * @return {Tween} このトゥイーンインスタンス（変更呼び出しのための）。
	 **/
	p.setPaused = function(value) {
		this._paused = !!value;
		Tween._register(this, !value);
		return this;
	}

	// 小さいapi (主にツールのアプトプットのための):
	p.w = p.wait;
	p.t = p.to;
	p.c = p.call;
	p.s = p.set;

	/**
	 * このオブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} インスタンスの文字列表現。
	 **/
	p.toString = function() {
		return "[Tween]";
	}
	
	/**
	 * @method clone
	 * @protected
	 **/
	p.clone = function() {
		throw("Tween can not be cloned.")
	}

// プライベートメソッド:
	/**
	 * @method _updateTargetProps
	 * @param {Object} step
	 * @param {Number} ratio
	 * @protected
	 **/
	p._updateTargetProps = function(step, ratio) {
		var p0,p1,v,v0,v1,arr;
		if (!step && ratio == 1) {
			p0 = p1 = this._curQueueProps;
		} else {
			// apply ease to ratio.
			if (step.e) { ratio = step.e(ratio,0,1,1); }
			p0 = step.p0;
			p1 = step.p1;
		}

		for (n in this._initQueueProps) {
			if ((v0 = p0[n]) == null) { p0[n] = v0 = this._initQueueProps[n]; }
			if ((v1 = p1[n]) == null) { p1[n] = v1 = v0; }
			if (v0 == v1 || ratio == 0 || ratio == 1 || (typeof(v0) != "number")) {
				// 未実装 - 開始、終了、値変更なし、もしくは値が非数値。
				v = ratio == 1 ? v1 : v0;
			} else {
				v = v0+(v1-v0)*ratio;
			}
			
			var ignore = false;
			if (arr = Tween._plugins[n]) {
				for (var i=0,l=arr.length;i<l;i++) {
					var v2 = arr[i].tween(this, n, v, p0, p1, ratio, !!step&&p0==p1, !step);
					if (v2 == Tween.IGNORE) { ignore = true; }
					else { v = v2; }
				}
			}
			if (!ignore) { this._target[n] = v; }
		}
		
	}
	
	/**
	 * @method _runActions
	 * @param {Number} startPos
	 * @param {Number} endPos
	 * @param {Boolean} includeStart
	 * @protected
	 **/
	p._runActions = function(startPos, endPos, includeStart) {
		var sPos = startPos;
		var ePos = endPos;
		var i = -1;
		var j = this._actions.length;
		var k = 1;
		if (startPos > endPos) {
			// 逆向きに実行する際はすべてがひっくり返ります:
			sPos = endPos;
			ePos = startPos;
			i = j;
			j = k = -1;
		}
		while ((i+=k) != j) {
			var action = this._actions[i];
			var pos = action.t;
			if (pos == ePos || (pos > sPos && pos < ePos) || (includeStart && pos == startPos) ) {
				action.f.apply(action.o, action.p);
			}
		}
	}

	/**
	 * @method _appendQueueProps
	 * @param {Object} o
	 * @protected
	 **/
	p._appendQueueProps = function(o) {
		var arr,oldValue,i, l, injectProps;
		for (var n in o) {
			if (this._initQueueProps[n] === undefined) {
				oldValue = this._target[n];
				
				// プラグインの初期化:
				if (arr = Tween._plugins[n]) {
					for (i=0,l=arr.length;i<l;i++) {
						oldValue = arr[i].init(this, n, oldValue);
					}
				}
				this._initQueueProps[n] = oldValue===undefined?null:oldValue;
			} else {
				oldValue = this._curQueueProps[n];
			}
			
			if (arr = Tween._plugins[n]) {
				injectProps = injectProps||{};
				for (i=0, l=arr.length;i<l;i++) {
					// TODO: 次のバージョンで .stepのためのチェックを削除すること。過去との互換性のために存在します。
					if (arr[i].step) { arr[i].step(this, n, oldValue, o[n], injectProps); }
				}
			}
			this._curQueueProps[n] = o[n];
		}
		if (injectProps) { this._appendQueueProps(injectProps); }
		return this._curQueueProps;
	}

	/**
	 * @method _cloneProps
	 * @param {Object} props
	 * @protected
	 **/
	p._cloneProps = function(props) {
		var o = {};
		for (var n in props) {
			o[n] = props[n];
		}
		return o;
	}

	/**
	 * @method _addStep
	 * @param {Object} o
	 * @protected
	 **/
	p._addStep = function(o) {
		if (o.d > 0) {
			this._steps.push(o);
			o.t = this.duration;
			this.duration += o.d;
		}
		return this;
	}
	
	/**
	 * @method _addAction
	 * @param {Object} o
	 * @protected
	 **/
	p._addAction = function(o) {
		o.t = this.duration;
		this._actions.push(o);
		return this;
	}

	/**
	 * @method _set
	 * @param {Object} props
	 * @param {Object} o
	 * @protected
	 **/
	p._set = function(props, o) {
		for (var n in props) {
			o[n] = props[n];
		}
	}
	
createjs.Tween = Tween;
}());

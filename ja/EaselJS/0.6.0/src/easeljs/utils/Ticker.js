/*
* Ticker
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

// 名前空間:
this.createjs = this.createjs||{};

(function() {

// コンストラクタ:
/**
 * Tickerは、設定した間隔による、一元的なtickまたはハートビートのブロードキャストを提供しています。
 * リスナーは設定された時間間隔が経過したとき通知されるように、tickイベントを登録することができます。
 *
 * 注意点として、tickイベントが呼び出される間隔は目標間隔であり、CPU負荷が高い場合、より遅い間隔でブロードキャストされるかもしれません。
 * Tickerクラスは静的インターフェースを使用し(ex. <code>Ticker.getPaused()</code>)、インスタンス化すべきではありません。
 *
 * <h4>Example</h4>
 *      createjs.Ticker.addEventListener("tick", handleTick);
 *      function handleTick(event) {
 *          // フレームごとにアクションが呼び出されます
 *      }
 * @class Ticker
 * @uses EventDispatcher
 * @static
 **/
var Ticker = function() {
	throw "Ticker cannot be instantiated.";
}

// イベント:

	/**
	 * tickごとに送出されます。
	 * @event tick
	 * @param {Object} target イベントを送出するする対象のオブジェクト。
	 * @param {String} type イベントタイプ。
	 * @param {Boolean} paused 現在Tickerが一時停止中かどうかを示します。
	 * @param {Number} delta 最後のtickから経過した時間（ms）。
	 * @param {Number} time Tilcerが初期化されてからの合計時間（ms）。
	 * @param {Number} runTime Tickerが初期化されてから、一時停止していない状態での合計時間(ms)。
	 * 	例えば、Tickerが初期化されてから一時停止していた合計時間は、time-runtimeで求めることができます。
	 * @since 0.6.0
	 */

// パブリック静的プロパティ:
	/**
	 * requestAnimationFrameがブラウザでサポートされており、Tickerがそれを使用するべきかどうかを示します。falseの場合、TickerはsetTimeoutを使用します。
	 * RAF(requestAnimationFrame)を使用する場合、フレームレートとして60を割った数を指定することが推奨されています(ex. 15, 20, 30, 60).
	 * @property useRAF
	 * @static
	 * @type {Boolean}
	 * @default false
	 **/
	Ticker.useRAF = false;
	
// ミックスイン:
	// EventDispatcher メソッド:
	Ticker.addEventListener = null;
	Ticker.removeEventListener = null;
	Ticker.removeAllEventListeners = null;
	Ticker.dispatchEvent = null;
	Ticker.hasEventListener = null;
	Ticker._listeners = null;
	createjs.EventDispatcher.initialize(Ticker); // EventDispatcher メソッドを注入する。
	
// プライベート静的プロパティ:

	
	/** 
	 * @property _listeners
	 * @type {Array}
	 * @protected 
	 **/
	Ticker._listeners = null;
	
	/** 
	 * @property _pauseable
	 * @type {Array}
	 * @protected 
	 **/
	Ticker._pauseable = null;
	
	/** 
	 * @property _paused
	 * @type {Boolean}
	 * @protected 
	 **/
	Ticker._paused = false;
	
	/** 
	 * @property _inited
	 * @type {Boolean}
	 * @protected 
	 **/
	Ticker._inited = false;
	
	/** 
	 * @property _startTime
	 * @type {Number}
	 * @protected 
	 **/
	Ticker._startTime = 0;
	
	/** 
	 * @property _pausedTime
	 * @type {Number}
	 * @protected 
	 **/
	Ticker._pausedTime=0;
	
	/** 
	 * すでに経過したtick数
	 * @property _ticks
	 * @type {Number}
	 * @protected 
	 **/
	Ticker._ticks = 0;
	
	/**
	 * Tickerが一時停止中に経過したtick数
	 * @property _pausedTicks
	 * @type {Number}
	 * @protected 
	 **/
	Ticker._pausedTicks = 0;
	
	/** 
	 * @property _interval
	 * @type {Number}
	 * @protected 
	 **/
	Ticker._interval = 50; // リードオンリー
	
	/** 
	 * @property _lastTime
	 * @type {Number}
	 * @protected 
	 **/
	Ticker._lastTime = 0;
	
	/** 
	 * @property _times
	 * @type {Array}
	 * @protected 
	 **/
	Ticker._times = null;
	
	/** 
	 * @property _tickTimes
	 * @type {Array}
	 * @protected 
	 **/
	Ticker._tickTimes = null;
	
	/** 
	 * @property _rafActive
	 * @type {Boolean}
	 * @protected 
	 **/
	Ticker._rafActive = false;
	
	/** 
	 * @property _timeoutID
	 * @type {Number}
	 * @protected 
	 **/
	Ticker._timeoutID = null;
	
	
// パブリック静的メソッド:
	/**
	 * tickイベントのリスナーを追加します。リスナーはtickメソッドを公開しているオブジェクト、または関数でなければなりません。
	 * リスナーは各tick / 間隔ごとに1度呼び出されます。この間隔は.setInterval(ms)メソッドによって指定されます。
	 * tickメソッドまたは関数には、2つのパラメータが渡されます。
	 * 前回のtickから今回までの経過時間とTickerが一時停止中かどうかを示すBoolean値です。
	 * @method addListener
	 * @static
	 * @param {Object} o リスナーとして追加するオブジェクト、または関数。
	 * @param {Boolean} pauseable falseの場合、TickerがTicker.pause()によって一時停止している場合でも、
	 * リスナーは継続して呼び出されます。デフォルト値はtrueです。
	 * @deprecated "tick" イベントの採用のため。将来のバージョンで削除されます。
	 **/
	Ticker.addListener = function(o, pauseable) {
		if (o == null) { return; }
		Ticker.removeListener(o);
		Ticker._pauseable[Ticker._listeners.length] = (pauseable == null) ? true : pauseable;
		Ticker._listeners.push(o);
	}
	
	/**
	 * 初期化、またはタイマーをリセットして、全ての関連するリスナー、FPS測定データ、起動中のtickをクリアします。
	 * 最初のリスナーが登録された際、自動的に呼び出されます。
	 * @method init
	 * @static
	 **/
	Ticker.init = function() {
		Ticker._inited = true;
		Ticker._times = [];
		Ticker._tickTimes = [];
		Ticker._pauseable = [];
		Ticker._listeners = [];
		Ticker._times.push(Ticker._lastTime = Ticker._startTime = Ticker._getTime());
		Ticker.setInterval(Ticker._interval);
	}
	
	/**
	 * 指定したリスナーを削除します。
	 * @method removeListener
	 * @static
	 * @param {Object} o tickイベントのリスナーとなっているオブジェクト、またはメソッド。
	 * @deprecated "tick" イベントの採用のため。将来のバージョンで削除されます。
	 **/
	Ticker.removeListener = function(o) {
		var listeners = Ticker._listeners;
		if (!listeners) { return; }
		var index = listeners.indexOf(o);
		if (index != -1) {
			listeners.splice(index, 1);
			Ticker._pauseable.splice(index, 1);
		}
	}
	
	/**
	 * 全てのリスナーを削除します。
	 * @method removeAllListeners
	 * @static
	 * @deprecated "tick" イベントの採用のため。将来のバージョンで削除されます。
	 **/
	Ticker.removeAllListeners = function() {
		Ticker._listeners = [];
		Ticker._pauseable = [];
	}
	
	/**
	 * tickごとの間隔となる目標時間(ms)を設定します。デフォルト値は50です（20 FPS）。
	 * 注意点として、tickごとの実際の時間はCPUの処理に依存し、設定値よりも大きくなるかもしれません。
	 * @method setInterval
	 * @static
	 * @param {Number} interval tickごとの時間(ms)。デフォルト値は50です。
	 **/
	Ticker.setInterval = function(interval) {
		Ticker._interval = interval;
		if (!Ticker._inited) { return; }
		Ticker._setupTick();
	}
	
	/**
	 * tickごとの時間間隔について、現在の目標時間を返します。
	 * @method getInterval
	 * @static
	 * @return {Number} tickイベント間の、現在の目標時間間隔(ms)。
	 **/
	Ticker.getInterval = function() {
		return Ticker._interval;
	}
	
	/**
	 * 1秒ごとの目標フレームレート(FPS)を設定します。 例えば、40msの間隔の場合、getFPS()は 25 を返します(1000ms / 40ms = 25fps)。
	 * @method setFPS
	 * @static
	 * @param {Number} value 1秒ごとにブロードキャストされる目標tick数
	 **/	
	Ticker.setFPS = function(value) {
		Ticker.setInterval(1000/value);
	}
	
	/**
	 * 1秒ごとの目標フレームレート(FPS)を返します。例えば、40msの間隔の場合、getFPS()は 25 を返します(1000ms / 40ms = 25fps)。
	 * @method getFPS
	 * @static
	 * @return {Number} 現在の、1秒ごとにブロードキャストされる目標tick数
	 **/
	Ticker.getFPS = function() {
		return 1000/Ticker._interval;
	}
	
	/**
	 * 実測による、1秒ごとの tick数を返します。
	 * @method getMeasuredFPS
	 * @static
	 * @param {Number} ticks （オプション） 実測による1秒ごとのtick数を計算する際に使用する、過去のtick数。 デフォルト値は1秒ごとのtick数。
	 * @return {Number} 実測による、1秒ごとのtick数。パフォーマンスの影響を受けるため、これは目標FPSとは異なるかもしれません。
	 **/
	Ticker.getMeasuredFPS = function(ticks) {
		if (Ticker._times.length < 2) { return -1; }
		
		// デフォルトでは、過去の1秒間のfpsを計算する:
		if (ticks == null) { ticks = Ticker.getFPS()|0; }
		ticks = Math.min(Ticker._times.length-1, ticks);
		return 1000/((Ticker._times[0]-Ticker._times[ticks])/ticks);
	}
	
	/**
	 * Tickerが一時停止中の場合、pausableなリスナーはイベントを受け取りません。詳細はaddListenerを参照してください。
	 * @method setPaused
	 * @static
	 * @param {Boolean} value Tickerが一時停止（true）または非停止（false）のどちらかを示します。
	 **/
	Ticker.setPaused = function(value) {
		Ticker._paused = value;
	}
	
	/**
	 * TickerがsetPausedの呼び出しにより、現在一時停止しているかどうかを、真偽値で返します。
	 * @method getPaused
	 * @static
	 * @return {Boolean} Tickerが現在一時停止しているかどうか。
	 **/
	Ticker.getPaused = function() {
		return Ticker._paused;
	}
	
	/**
	 * ティッカーが初期化されてからの経過秒数(ms)を返します。
	 * 例えば、時間と同期したアニメーションにおいて、経過した時間の正確な量を求めるためにこれを使用することができます。
	 * @method getTime
	 * @static
	 * @param {Boolean} runTime trueの場合、Tickerが一時停止していない間の経過時間のみが返されます。
	 * falseの場合、tickイベントのリスナーが追加されてからの、全ての経過時間が返されます。
	 * デフォルト値はfalseです。
	 * @return {Number} Tickerが初期化されてからの経過時間(ms)。
	 **/
	Ticker.getTime = function(runTime) {
		return Ticker._getTime() - Ticker._startTime - (runTime ? Ticker._pausedTime : 0);
	}
	
	/**
	 * Tickerによってブロードキャストされたtickの数を返します。
	 * @method getTicks
	 * @static
	 * @param {Boolean} pauseable Tickerが一時停止している間にブロードキャストされていたtickを含めるかどうかを示します。
	 * trueの場合、Tickerが一時停止していない間に発生したtickイベントの数のみが返されます。
	 * falseの場合、Tickerが一時停止している間に発生したtickイベントによる数も、戻り値に含まれます。
	 * デフォルト値はfalseです。
	 * @return {Number} これまでにブロードキャストされたtickの数を返します。
	 **/
	Ticker.getTicks = function(pauseable) {
		return  Ticker._ticks - (pauseable ?Ticker._pausedTicks : 0);
	}
	
// プライベート静的メソッド:
	/**
	 * @method _handleAF
	 * @protected
	 **/
	Ticker._handleAF = function() {
		Ticker._rafActive = false;
		Ticker._setupTick();
		// RAFは60Hzよりも若干速く実行されているように見えるため、少しだけ進み気味の調整をした状態で、十分な時間が経過すると実行される:
		if (Ticker._getTime() - Ticker._lastTime >= (Ticker._interval-1)*0.97) {
			Ticker._tick();
		}
	}
	
	/**
	 * @method _handleTimeout
	 * @protected
	 **/
	Ticker._handleTimeout = function() {
		Ticker.timeoutID = null;
		Ticker._setupTick();
		Ticker._tick();
	}
	
	/**
	 * @method _setupTick
	 * @protected
	 **/
	Ticker._setupTick = function() {
		if (Ticker._rafActive || Ticker.timeoutID != null) { return; } // avoid duplicates
		if (Ticker.useRAF) {
			var f = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
			if (f) {
				f(Ticker._handleAF);
				Ticker._rafActive = true;
				return;
			}
		}
		Ticker.timeoutID = setTimeout(Ticker._handleTimeout, Ticker._interval);
	}
	
	/**
	 * @method _tick
	 * @protected
	 **/
	Ticker._tick = function() {
		var time = Ticker._getTime();
		Ticker._ticks++;
		
		var elapsedTime = time-Ticker._lastTime;
		
		var paused = Ticker._paused;
		
		if (paused) {
			Ticker._pausedTicks++;
			Ticker._pausedTime += elapsedTime;
		}
		Ticker._lastTime = time;
		
		var pauseable = Ticker._pauseable;
		var listeners = Ticker._listeners.slice();
		var l = listeners ? listeners.length : 0;
		for (var i=0; i<l; i++) {
			var listener = listeners[i];
			if (listener == null || (paused && pauseable[i])) { continue; }
			if (listener.tick) { listener.tick(elapsedTime, paused); }
			else if (listener instanceof Function) { listener(elapsedTime, paused); }
		}
		
		Ticker.dispatchEvent({type:"tick", paused:paused, delta:elapsedTime, time:time, runTime:time-Ticker._pausedTime})
		
		Ticker._tickTimes.unshift(Ticker._getTime()-time);
		while (Ticker._tickTimes.length > 100) { Ticker._tickTimes.pop(); }
		
		Ticker._times.unshift(time);
		while (Ticker._times.length > 100) { Ticker._times.pop(); }
	}
	
	/**
	 * @method _getTime
	 * @protected
	 **/
	var now = window.performance && (performance.now || performance.mozNow || performance.msNow || performance.oNow || performance.webkitNow);
	Ticker._getTime = function() {
		return (now&&now.call(performance))||(new Date().getTime());
	}
	
	
	Ticker.init();

createjs.Ticker = Ticker;
}());

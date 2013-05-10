/*
* MovieClip
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

/**
 * MovieClipクラスはEaselJS {{#crossLink "Container"}}{{/crossLink}}と共にTweenJSタイムラインと連携します。
 * それは、タイムラインアニメーション、状態の変更や同期されたアクションをカプセル化するオブジェクトを生成することが
 * できるようにします。正しくムービークリップを設定する際の固有の複雑さのために、それは主に出力のために意図され、
 * メインEaselJSライブラリには含まれません。
 *
 * いくつかの譲歩は将来的に時間ベースのタイムラインをサポートするために行われてきたけれども、tickベースであれば（時間
 * ベースでなく）現在のMovieClipにのみ正しく動作します。

 * @class MovieClip
 * @main MovieClip
 * @extends Container
 * @constructor
 * @param {String} mode modeプロパティの初期値。MovieClip.INDEPENDENT, MovieClip.SINGLE_FRAME, or MovieClip.SYNCHEDのうちの一つ。
 * @param {Number} startPosition startPositionプロパティの初期値。
 * @param {Boolean} loop loopプロパティの初期値。
 * @param {Object} labels このMovieClipに関連するタイムラインインスタンスに渡すラベルのハッシュ
 **/
var MovieClip = function(mode, startPosition, loop, labels) {
  this.initialize(mode, startPosition, loop, labels);
}
var p = MovieClip.prototype = new createjs.Container();

	/**
	 * リードオンリー。 MovieClipは、たとえ親がポーズしていても、親と独立して進みます。
	 * これは、ディフォルトモードです。
	 * @property INDEPENDENT
	 * @static
	 * @type String
	 * @default "independent"
	 **/
	MovieClip.INDEPENDENT = "independent";
	
	/**
	 * リードオンリー。MovieClipは、（startPositionプロパティで決定された）単一のフレームしか表示しません。
	 * @property SINGLE_FRAME
	 * @static
	 * @type String
	 * @default "single"
	 **/
	MovieClip.SINGLE_FRAME = "single";
	
	/**
	 * リードオンリー。MovieClipは、親が進むとき、進められるのみで、親MovieClipの位置と同期されます。
	 * @property SYNCHED
	 * @static
	 * @type String
	 * @default "synched"
	 **/
	MovieClip.SYNCHED = "synched";

// パブリックプロパティ:
	
	/**
	 * このMovieClipがどのようにその時間を進行するかを制御します。0 (INDEPENDENT), 1 (SINGLE_FRAME), or 2 (SYNCHED)
	 * のうちのいずれかにする必要があります。ふるまいの説明は、それぞれの定数を参照してください。
	 * @property mode
	 * @type String
	 * @default null
	 **/
	p.mode;

	/**
	 * このムービークリップで最初のフレームとして何を再生するか、もしくはモードがSINGLE_FRAMEの場合、表示のための
	 * フレームのみかを指定します。
	 * @property startPosition
	 * @type Number
	 * @default 0
	 */
	p.startPosition = 0;
	
	/**
	 * このMovieClipがそのタイムラインの終わりに到達した際にループすべきかどうかを示します。
	 * @property loop
	 * @type Boolean
	 * @default true
	 */
	p.loop = true;
	
	/**
	 * リードオンリー。ムービークリップの現在のフレーム。
	 * @property currentFrame
	 * @type Number
	 */
	p.currentFrame = 0;

	/**
	 * このMovieClipに関連づけられているTweenJSタイムライン。これは、MovieClipインスタンスが初期化されるときに
	 * 自動的に作成されます。
	 * @property timeline
	 * @type Timeline
	 * @default null
	 */
	p.timeline = null;

	/**
	 * もし trueならば、MovieClipの位置はtickによって進行しません。
	 * @property paused
	 * @type Boolean
	 * @default false
	 */
	p.paused = false;
	
	/**
	 * もし trueならば、このMovieClipのツゥイーン上のアクションは、再生ヘッドが進行するときに実行されます。
	 * @property actionsEnabled
	 * @type Boolean
	 * @default true
	 */
	p.actionsEnabled = true;
	
	/**
	 * もし trueならば、MovieClipはタイムラインがディスプレイリストに追加するときはいつでも、自動的に
	 * 先頭フレームにリセットされます。これは、mode=INDEPENDENTのMovieClipにのみ適用します。
	 * <br><br>
	 * たとえば、子MovieClipインスタンスのボディと、各フレームで異なるコスチュームを持つキャラクタアニメーション
	 * があるとすると、自動的にリセットされることを気にかけず、フレームをマニュアルで変更できるように、
	 * body.autoReset = falseにセットします。
	 * @property autoReset
	 * @type Boolean
	 * @default true
	 */
	p.autoReset = true;
	
	
	
// プライベートプロパティ:

	/**
	 * @property _synchOffset
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._synchOffset = 0;
	
	/**
	 * @property _prevPos
	 * @type Number
	 * @default -1
	 * @private
	 */
	p._prevPos = -1; // TODO: -1の代わりに ._resetブールプロパティを使うことで評価する。
	
	/**
	 * @property _prevPosition
	 * @type Number
	 * @default 0
	 * @private
	 */
	p._prevPosition = 0;
	
	/**
	 * MovieClipによって積極的に管理されるディスプレイオブジェクトのリスト
	 * @property _managed
	 * @type Object
	 * @private
	 */
	p._managed;
	
// コンストラクタ:

	/**
	 * @property DisplayObject_initialize
	 * @type Function
	 * @private
	 **/
	p.Container_initialize = p.initialize;

	/** 
	 * コンストラクタに呼び出される初期化メソッド。
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function(mode, startPosition, loop, labels) {
		this.mode = mode||MovieClip.INDEPENDENT;
		this.startPosition = startPosition || 0;
		this.loop = loop;
		props = {paused:true, position:startPosition, useTicks:true};
		this.Container_initialize();
		this.timeline = new createjs.Timeline(null, labels, props);
		this._managed = {};
	}
	
// パブリックメソッド:
	/**
	 * キャンバスに描かれた場合、表示オブジェクトが可視かどうかを示すtrueもしくはfalseを返します。
	 * これは、ステージの境界内に表示されるかどうかを考慮することはありません。
	 * NOTE: このメソッドは、高度な目的で使用する場合に有用かも知れませんが、主に内部で使用するためのものです。
	 * @method isVisible
	 * @return {Boolean} キャンバスに描かれた場合に、表示オブジェクトが可視かどうかを示すブール値
	 **/
	p.isVisible = function() {
		// 子は描画に置かれるので、コンテンツを持っていない場合は判断できません。
		return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0);
	};
	
	/**
	 * @property Container_draw
	 * @type Function
	 * @private
	 **/
	p.Container_draw = p.draw;
	
	/**
	 * 指定されたコンテキストに、visible, alpha, shadow, transformを無視して描画します。
	 * 描画が処理された場合はtrueを返します（オーバーライド機能に便利）。
	 * NOTE: このメソッドは、高度な目的で使用する場合に有用かも知れませんが、主に内部で使用するためのものです。
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx 描きこむキャンバス2Dコンテキスト。
	 * @param {Boolean} ignoreCache 描画操作が現在のキャッシュを無視するかどうかを指定します。
	 * たとえば、キャッシュを描画するために使用されます（自身に戻って単に既存キャッシュを描画することを防ぐために）。
	 **/
	p.draw = function(ctx, ignoreCache, _mtx) {
		// draw to cache first:
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		this._updateTimeline();
		this.Container_draw(ctx, ignoreCache, _mtx);
	}
	
	
	/**
	 * pausedをfalseにセットします。
	 * @method play
	 **/
	p.play = function() {
		this.paused = false;
	}
	
	/**
	 * pausedをtrueにセットします。
	 * @method stop
	 **/
	p.stop = function() {
		this.paused = true;
	}
	
	/**
	 * このムービークリップを指定した位置もしくはラベルに進めて、pausedをfalseにセットします。
	 * @method gotoAndPlay
	 * @param {String|Number} positionOrLabel
	 **/
	p.gotoAndPlay = function(positionOrLabel) {
		this.paused = false;
		this._goto(positionOrLabel);
	}
	
	/**
	 * このムービークリップを指定した位置もしくはラベルに進めて、pausedをtrueにセットします。
	 * @method gotoAndStop
	 * @param {String|Number} positionOrLabel
	 **/
	p.gotoAndStop = function(positionOrLabel) {
		this.paused = true;
		this._goto(positionOrLabel);
	}
	
	/**
	 * MovieClipインスタンスはクローンできません。
	 * @method clone
	 **/
	p.clone = function() {
		// TODO: このためのサポートを追加？ タイムライン＆再ターゲットのツゥイーンをクロースすることは必要 - かなり難しい。
		throw("MovieClip cannot be cloned.")
	}
	
	/**
	 * このオブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} インスタンスの文字列表現。
	 **/
	p.toString = function() {
		return "[MovieClip (name="+  this.name +")]";
	}
	
// プライベートメソッド:
	
	/**
	 * @property Container__tick
	 * @type Function
	 * @private
	 **/
	p.Container__tick = p._tick;
	
	/**
	 * @method _tick
	 * @private
	 **/
	p._tick = function(params) {
		if (!this.paused && this.mode == MovieClip.INDEPENDENT) {
			this._prevPosition = (this._prevPos < 0) ? 0 : this._prevPosition+1;
		}
		this.Container__tick(params);
	}
	
	/**
	 * @method _goto
	 * @private
	 **/
	p._goto = function(positionOrLabel) {
		var pos = this.timeline.resolve(positionOrLabel);
		if (pos == null) { return; }
		// リセットのために新しい位置の上書きから_updateTimelineを防ぎます:
		if (this._prevPos == -1) { this._prevPos = NaN; }
		this._prevPosition = pos;
		this._updateTimeline();
	}
	
	/**
	 * @method _reset
	 * @private
	 **/
	p._reset = function() {
		this._prevPos = -1;
		this.currentFrame = 0;
	}
	
	/**
	 * @method _updateTimeline
	 * @private
	 **/
	p._updateTimeline = function() {
		var tl = this.timeline;
		var tweens = tl._tweens;
		var kids = this.children;
		
		var synched = this.mode != MovieClip.INDEPENDENT;
		tl.loop = this.loop==null?true:this.loop;
		
		// これがグラフィックであればアクションを無視して、タイムラインの位置を更新します。
		if (synched) {
			// TODO: _synchOffsetは何とかして親に提供された場合は、親の変更は問題が発生しないため、はるかに理想的です。
			// _offについても同様です（あまり重要ではないですが）。
			tl.setPosition(this.startPosition + (this.mode==MovieClip.SINGLE_FRAME?0:this._synchOffset), createjs.Tween.NONE);
		} else {
			tl.setPosition(this._prevPos < 0 ? 0 : this._prevPosition, this.actionsEnabled ? null : createjs.Tween.NONE);
		}
		
		this._prevPosition = tl._prevPosition;
		if (this._prevPos == tl._prevPos) { return; }
		this.currentFrame = this._prevPos = tl._prevPos;
		
		for (var n in this._managed) { this._managed[n] = 1; }
		
		for (var i=tweens.length-1;i>=0;i--) {
			var tween = tweens[i];
			var target = tween._target;
			if (target == this) { continue; } // TODO: これは、アクショントゥイーンであると仮定している。正しいか？
			var offset = tween._stepPosition;
			
			if (target instanceof createjs.DisplayObject) {
				// モーショントゥイーン。
				this._addManagedChild(target, offset);
			} else {
				// 状態トゥイーン。
				this._setState(target.state, offset);
			}
		}
		
		for (i=kids.length-1; i>=0; i--) {
			var id = kids[i].id;
			if (this._managed[id] == 1) {
				this.removeChildAt(i);
				delete(this._managed[id]);
			}
		}
	}
	
	/**
	 * @method _setState
	 * @private
	 **/
	p._setState = function(state, offset) {
		if (!state) { return; }
		for (var i=0,l=state.length;i<l;i++) {
			var o = state[i];
			var target = o.t;
			var props = o.p;
			for (var n in props) { target[n] = props[n]; }
			this._addManagedChild(target, offset);
		}
	}
	
	/**
	 * タイムラインに子を追加し、管理された子としてセットします。
	 * @method _addManagedChild
	 * @private
	 **/
	p._addManagedChild = function(child, offset) {
		if (child._off) { return; }
		this.addChild(child);
		
		if (child instanceof MovieClip) {
			child._synchOffset = offset;
			// TODO: これはFlashと正確には一致しません。Flashは、名前を変更されたり、タイムラインから削除され、それがリセットされた場合に、クリップのトラックを失います。
			if (child.mode == MovieClip.INDEPENDENT && child.autoReset && !this._managed[child.id]) { child._reset(); }
		}
		this._managed[child.id] = 2;
	}
	

createjs.MovieClip = MovieClip;



	/**
	 * このプラグインは、トゥイーンのstartPositionプロパティを防ぐため、<a href="http://tweenjs.com" target="_blank">TweenJS</a>で動作します。
	 * @private
	 * @class MovieClipPlugin
	 * @constructor
	 **/
	var MovieClipPlugin = function() {
	  throw("MovieClipPlugin cannot be instantiated.")
	}
	
	/**
	 * @method priority
	 * @private
	 **/
	MovieClipPlugin.priority = 100; // とても高いプライオリティ、最初に実行するべき

	/**
	 * @method install
	 * @private
	 **/
	MovieClipPlugin.install = function() {
		createjs.Tween.installPlugin(MovieClipPlugin, ["startPosition"]);
	}
	
	/**
	 * @method init
	 * @private
	 **/
	MovieClipPlugin.init = function(tween, prop, value) {
		return value;
	}
	
	/**
	 * @method step
	 * @private
	 **/
	MovieClipPlugin.step = function() {
		// unused.
	}
	
	/** 
	 * @method tween
	 * @private
	 **/
	MovieClipPlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end) {
		if (!(tween.target instanceof MovieClip)) { return value; }
		return (ratio == 1 ? endValues[prop] : startValues[prop]);
	}

	MovieClipPlugin.install();

}());

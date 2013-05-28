/*
* SpriteSheetBuilder
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
 * SpriteSheetBuilder は、実行時に、どんな表示オブジェクトからもスプライトシートを生成することを可能にします。
 * これにより、アセットをベクターグラフィックとして保持し （ファイルサイズを抑えるため）、実行にはスプライトシート
 * として描画してより良いパフォーマンスを得ることが可能になります。
 *
 * スプライトシートは同期又は非同期に生成できます。そのため、大きなスプライトシートも UI を固まらせることなく
 * 生成できます。
 *
 * 生成されたスプライトシートで使われる "画像" は、実際には canvas の要素です。そして、その大きさは
 * <code>maxWidth</code> または <code>maxHeight</code> の値に最も近い 2 の階乗の値になります。
  * @class SpriteSheetBuilder
 * @uses EventDispatcher
 * @constructor
 **/
var SpriteSheetBuilder = function() {
  this.initialize();
}
var p = SpriteSheetBuilder.prototype;

// 定数:
	SpriteSheetBuilder.ERR_DIMENSIONS = "frame dimensions exceed max spritesheet dimensions";
	SpriteSheetBuilder.ERR_RUNNING = "a build is already running";

// イベント:

	/**
	 * 完了時に発行されます。
	 * @event complete
	 * @param {Object} target イベントを発行したオブジェクトです。
	 * @param {String} type イベントの種類です。
	 * @since 0.6.0
	 */
	
	/**
	 * 非同期の生成が進行すると発行されます。
	 * @event progress
	 * @param {Object} target イベントを発行したオブジェクトです。
	 * @param {String} type イベントの種類です。
	 * @param {Number} progress 現在の進行を示す値です (0-1)。
	 * @since 0.6.0
	 */

// パブリックプロパティ:

	/**
	 * 生成されたスプライトシートの画像（個々のフレームでは無く）の幅の最大値です。指定する値には、2 の階乗
	 * (例 1024, 2048, 4096) の使用が推奨されます。フレーム全てが最大値に収まらない場合は、必要に応じて
	 * 追加の画像が生成されます。
	 * @property maxWidth
	 * @type Number
	 * @default 2048
	*/
	p.maxWidth = 2048;

	/**
	 * 生成されたスプライトシートの画像（個々のフレームでは無く）の高さの最大値です。指定する値には、2 の階乗
	 * (例 1024, 2048, 4096) の使用が推奨されます。フレーム全てが最大値に収まらない場合は、必要に応じて
	 * 追加の画像が生成されます。
	 * @property maxHeight
	 * @type Number
	 * @default 2048
	 **/
	p.maxHeight = 2048;

	/**
	 * 生成されるスプライトシートです。生成が正常に完了するまでは、この値は null です。
	 * @property spriteSheet
	 * @type SpriteSheet
	 **/
	p.spriteSheet = null;
	
	/**
	 * 全てのフレームをスプライトシートに描画する際に適用される拡大率です。この値は、addFrame の呼び出し時に
	 * 指定された拡大率に乗算されます。これを使うと、例えば、特定のデバイスの解像度（例 タブレットとモバイル）
	 * に合わせてスプライトシートを実行時に生成できます。
	 * @property defaultScale
	 * @type Number
	 * @default 1
	 **/
	p.scale = 1;
	
	/**
	* フレームの間で使用するパディングです。描画されたベクターコンテンツのアンチエイリアスの保存に便利です。
	* @property padding
	* @type Number
	* @default 1
	**/
	p.padding = 1;
	
	/**
	 * 生成に使用できる時間の割合を示す 0.01 から 0.99 の間の値です。1 秒あたりに生成に使用される秒数と考える
	 * こともできます。例えば、値が 0.3 の場合、生成 1 回あたり約 15ms の使用で、毎秒 20 回実行されるでしょう。
	 * （これで利用可能な時間の 30%、又は 1 秒あたり 0.3 秒になります）
	 * Defaults to 0.3.
	 * @property timeSlice
	 * @type Number
	 * @default 0.3
	 **/
	p.timeSlice = 0.3;
	
	/**
	 * 読み取り専用です。生成の進行状況を示す 0 から 1 の間の値です。生成実行前の値は -1 です。
	 * @property progress
	 * @type Number
	 * @default -1
	 **/
	p.progress = -1;
	
	/**
	 * 
	 * @property onComplete
	 * @type Function
	 * @default null
	 **/
	 
	/**
	 * 生成完了時に呼ばれるコールバック関数です。このインスタンスを示す引数 1 つと呼び出されます。
	 * @property onComplete
	 * @type Function
	 * @deprecated "complete" イベントの追加により、将来のバージョンからは削除されるでしょう。
	 */
	p.onComplete = null;
	 
	/**
	 * 非同期の生成が進行すると呼ばれるコールバック関数です。このインスタンスへの参照と、進行状況を示す値
	 * (0-1) の引数 2 つと呼び出されます。
	 * @property onProgress
	 * @type Function
	 * @deprecated "complete" イベントの追加により、将来のバージョンからは削除されるでしょう。
	 */
	p.onProgress = null;
	
// ミックスイン:
	// EventDispatcher メソッド:
	p.addEventListener = null;
	p.removeEventListener = null;
	p.removeAllEventListeners = null;
	p.dispatchEvent = null;
	p.hasEventListener = null;
	p._listeners = null;
	createjs.EventDispatcher.initialize(p); // inject EventDispatcher methods.

// プライベートプロパティ:

	/**
	 * @property _frames
	 * @protected
	 * @type Array
	 **/
	p._frames = null;
	
	/**
	 * @property _animations
	 * @protected
	 * @type Array
	 **/
	p._animations = null;
	
	/**
	 * @property _data
	 * @protected
	 * @type Array
	 **/
	p._data = null;
	
	/**
	 * @property _nextFrameIndex
	 * @protected
	 * @type Number
	 **/
	p._nextFrameIndex = 0;
	
	/**
	 * @property _index
	 * @protected
	 * @type Number
	 **/
	p._index = 0;
	
	/**
	 * @property _timerID
	 * @protected
	 * @type Number
	 **/
	p._timerID = null;
	
	/**
	 * @property _scale
	 * @protected
	 * @type Number
	 **/
	p._scale = 1;

// コンストラクタ:
	/**
	 * 初期化用のメソッドです。
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function() {
		this._frames = [];
		this._animations = {};
	}

// パブリックメソッド:
	
	/**
	 * {{#crossLink "SpriteSheet"}}{{/crossLink}} にフレームを追加します。フレームは {{#crossLink "SpriteSheetBuilder/build"}}{{/crossLink}} メソッドを
	 * 呼ぶまで追加されません。オプションの設定用の引数を使って、描画の直前に関数を実行できます。例えば、1 つの
	 * ソースを、異なるフレームを生成するために操作したり子を変更しながら、複数回足すことが可能です。
	 *
	 * ソースに対する変形 (x, y, scale, rotate, alpha) は regX/Y を除いて無視されることに注意して下さい。ソースの
	 * オブジェクトを変形してそれをスプライトシートに適用させるには、{{#crossLink "Container"}}{{/crossLink}} 内に配置し、
	 * Container をソースとして渡します。
	 * @method addFrame
	 * @param {DisplayObject} source フレームに描画するソースの {{#crossLink "DisplayObject"}}{{/crossLink}}  です。
	 * @param {Rectangle} [sourceRect] フレームに描画するソースの領域を定義する {{#crossLink "Rectangle"}}{{/crossLink}} です。
	 * 指定されていない場合は、ソースから <code>getBounds</code> メソッド、bounds 属性、または <code>nominalBounds</code> 属性
	 * を探して使います。いずれも見つからなかった場合、フレームはスキップされます。
	 * @param {Number} [scale=1] オプションです。フレームに描画する際の拡大率です。デフォルトは 1 です。
	 * @param {Function} [setupFunction] オプションです。フレームに描画する直前に呼び出される関数を指定します。
	 * @param {Array} [setupParams] 描画直前に呼び出される関数に渡す引数です。
	 * @param {Object} [setupScope] 描画直前に呼び出される関数のスコープです。
	 * @return {Number} 追加されたフレームのインデックス値です。sourceRect が決定できなかった場合は null になります。
	 **/
	p.addFrame = function(source, sourceRect, scale, setupFunction, setupParams, setupScope) {
		if (this._data) { throw SpriteSheetBuilder.ERR_RUNNING; }
		var rect = sourceRect||source.bounds||source.nominalBounds;
		if (!rect&&source.getBounds) { rect = source.getBounds(); }
		if (!rect) { return null; }
		scale = scale||1;
		return this._frames.push({source:source, sourceRect:rect, scale:scale, funct:setupFunction, params:setupParams, scope:setupScope, index:this._frames.length, height:rect.height*scale})-1;
	}
	
	/**
	 * 生成されるスプライトシートに含まれるアニメーションを追加します。
	 * @method addAnimation
	 * @param {String} アニメーションの名前です。
	 * @param {Array} frames アニメーションを構成するフレームのインデックスの配列です。例えば、 [3,6,5] は、
	 * フレームを 3, 6, 5 の順に再生するアニメーションの記述になります。
	 * @param {String} [next] このアニメーションが終了時、次に再生するアニメーションの名前です。false を指定すると
	 * このアニメーション終了時に再生が停止します。デフォルトでは同じアニメーションが最初から繰り返し再生されます。
	 * @param {Number} [frequency] このアニメーションのフレームを進める頻度です。例えば、値が 2 であれば、
	 * 2 つ目の刻み毎にアニメーションが進行します。
	 **/
	p.addAnimation = function(name, frames, next, frequency) {
		if (this._data) { throw SpriteSheetBuilder.ERR_RUNNING; }
		this._animations[name] = {frames:frames, next:next, frequency:frequency};
	}
	
	/**
	 * MovieClip に含まれるフレームトラベルをこの builder に追加します。ラベルはアニメーションの開始位置と終了位置を
	 * 示すものとして追加されます。例えば、全フレーム数が 15 の MovieClip 内で、"foo" という名前のラベルがフレーム 0 に、
	 * "bar" という名前のラベルがフレーム 10 にあれば、"foo" という名前でフレーム 0 から 9 間で再生するアニメーションを、
	 * "bar" という名前でフレーム 10 から 14 を再生するアニメーションを追加します。
	 *
	 * このメソッドは actionsEnabled が false の状態で最後のフレームまで MovieClip 全てを走査します。
	 * @method addMovieClip
	 * @param {MovieClip} source スプライトシートに追加するソースとなる MovieClip です。
	 * @param {Rectangle} [sourceRect] フレームに描画するソースの領域を定義する {{#crossLink "Rectangle"}}{{/crossLink}} です。
	 * 指定されていない場合は、ソースから <code>getBounds</code> メソッド、bounds 属性、または <code>nominalBounds</code> 属性
	 * を探して使います。いずれも見つからなかった場合、MovieClip は追加されません。
	 * @param {Number} [scale=1] フレームに描画する際の拡大率です。
	 **/
	p.addMovieClip = function(source, sourceRect, scale) {
		if (this._data) { throw SpriteSheetBuilder.ERR_RUNNING; }
		var rects = source.frameBounds;
		var rect = sourceRect||source.bounds||source.nominalBounds;
		if (!rect&&source.getBounds) { rect = source.getBounds(); }
		if (!rect && !rects) { return null; }
		
		var baseFrameIndex = this._frames.length;
		var duration = source.timeline.duration;
		for (var i=0; i<duration; i++) {
			var r = (rects&&rects[i]) ? rects[i] : rect;
			this.addFrame(source, r, scale, function(frame) {
				var ae = this.actionsEnabled;
				this.actionsEnabled = false;
				this.gotoAndStop(frame);
				this.actionsEnabled = ae;
			}, [i], source);
		}
		var labels = source.timeline._labels;
		var lbls = [];
		for (var n in labels) {
			lbls.push({index:labels[n], label:n});
		}
		if (lbls.length) {
			lbls.sort(function(a,b){ return a.index-b.index; });
			for (var i=0,l=lbls.length; i<l; i++) {
				var label = lbls[i].label;
				var start = baseFrameIndex+lbls[i].index;
				var end = baseFrameIndex+((i == l-1) ? duration : lbls[i+1].index);
				var frames = [];
				for (var j=start; j<end; j++) { frames.push(j); }
				this.addAnimation(label, frames, true); // for now, this loops all animations.
			}
		}
	}
	
	/**
	 * 現在のフレーム情報から、SpriteSheet のインスタンスを生成します。
	 * @method build
	 * @return SpriteSheet 生成された SpriteSheet のインスタンスです。既に生成中、またはエラー時は null です。
	 **/
	p.build = function() {
		if (this._data) { throw SpriteSheetBuilder.ERR_RUNNING; }
		this._startBuild();
		while (this._drawNext()) {}
		this._endBuild();
		return this.spriteSheet;
	}
	
	/**
	 * 現在のフレーム情報から、非同期で {{#crossLink "SpriteSheet"}}{{/crossLink}} のインスタンスを生成します。
	 * <code>timeSlice</code> で指定された時間を使って 1 秒間に 20 回実行されます。完了すると指定された
	 * コールバックを呼び出します。
	 * @method buildAsync
	 * @param {Number} [timeSlice] このインスタンスの timeSlice 属性に設定します。
	 **/
	p.buildAsync = function(timeSlice) {
		if (this._data) { throw SpriteSheetBuilder.ERR_RUNNING; }
		this.timeSlice = timeSlice;
		this._startBuild();
		var _this = this;
		this._timerID = setTimeout(function() { _this._run(); }, 50-Math.max(0.01, Math.min(0.99, this.timeSlice||0.3))*50);
	}
	
	/**
	 * 進行中の非同期の生成を中止します。
	 * @method stopAsync
	 **/
	p.stopAsync = function() {
		clearTimeout(this._timerID);
		this._data = null;
	}
	
	/**
	 * SpriteSheetBuilder のインスタンスは複製できません。
	 * @method clone
	 **/
	p.clone = function() {
		throw("SpriteSheetBuilder cannot be cloned.");
	}

	/**
	 * このオブジェクトの文字列での表現を返します。
	 * @method toString
	 * @return {String} このインスタンスの文字列表現です。
	 **/
	p.toString = function() {
		return "[SpriteSheetBuilder]";
	}

// プライベートメソッド:
	/**
	 * @method _startBuild
	 * @protected
	 **/
	p._startBuild = function() {
		var pad = this.padding||0;
		this.progress = 0;
		this.spriteSheet = null;
		this._index = 0;
		this._scale = this.scale;
		var dataFrames = [];
		this._data = {
			images: [],
			frames: dataFrames,
			animations: this._animations // TODO: should we "clone" _animations in case someone adds more animations after a build?
		};
		
		var frames = this._frames.slice();
		frames.sort(function(a,b) { return (a.height<=b.height) ? -1 : 1; });
		
		if (frames[frames.length-1].height+pad*2 > this.maxHeight) { throw SpriteSheetBuilder.ERR_DIMENSIONS; }
		var y=0, x=0;
		var img = 0;
		while (frames.length) {
			var o = this._fillRow(frames, y, img, dataFrames, pad);
			if (o.w > x) { x = o.w; }
			y += o.h;
			if (!o.h || !frames.length) {
				var canvas = createjs.createCanvas?createjs.createCanvas():document.createElement("canvas");
				canvas.width = this._getSize(x,this.maxWidth);
				canvas.height = this._getSize(y,this.maxHeight);
				this._data.images[img] = canvas;
				if (!o.h) {
					x=y=0;
					img++;
				}
			}
		}
	}
	
	/**
	 * @method _getSize
	 * @protected
	 * @return {Number} 
	 **/
	p._getSize = function(size,max) {
		var pow = 4;
		while (Math.pow(2,++pow) < size){}
		return Math.min(max,Math.pow(2,pow));
	}
	
	/**
	 * @method _fillRow
	 * @protected
	 * @return {Number} 行の幅と高さを返します。
	 **/
	p._fillRow = function(frames, y, img, dataFrames, pad) {
		var w = this.maxWidth;
		var maxH = this.maxHeight;
		y += pad;
		var h = maxH-y;
		var x = pad;
		var height = 0;
		for (var i=frames.length-1; i>=0; i--) {
			var frame = frames[i];
			var sc = this._scale*frame.scale;
			var rect = frame.sourceRect;
			var source = frame.source;
			var rx = Math.floor(sc*rect.x-pad);
			var ry = Math.floor(sc*rect.y-pad);
			var rh = Math.ceil(sc*rect.height+pad*2);
			var rw = Math.ceil(sc*rect.width+pad*2);
			if (rw > w) { throw SpriteSheetBuilder.ERR_DIMENSIONS; }
			if (rh > h || x+rw > w) { continue; }
			frame.img = img;
			frame.rect = new createjs.Rectangle(x,y,rw,rh);
			height = height || rh;
			frames.splice(i,1);
			dataFrames[frame.index] = [x,y,rw,rh,img,Math.round(-rx+sc*source.regX-pad),Math.round(-ry+sc*source.regY-pad)];
			x += rw;
		}
		return {w:x, h:height};
	}
	
	/**
	 * @method _endBuild
	 * @protected
	 **/
	p._endBuild = function() {
		this.spriteSheet = new createjs.SpriteSheet(this._data);
		this._data = null;
		this.progress = 1;
		this.onComplete&&this.onComplete(this);
		this.dispatchEvent("complete");
	}
	
	/**
	 * @method _run
	 * @protected
	 **/
	p._run = function() {
		var ts = Math.max(0.01, Math.min(0.99, this.timeSlice||0.3))*50;
		var t = (new Date()).getTime()+ts;
		var complete = false;
		while (t > (new Date()).getTime()) {
			if (!this._drawNext()) { complete = true; break; }
		}
		if (complete) {
			this._endBuild();
		} else {
			var _this = this;
			this._timerID = setTimeout(function() { _this._run(); }, 50-ts);
		}
		var p = this.progress = this._index/this._frames.length;
		this.onProgress&&this.onProgress(this, p);
		this.dispatchEvent({type:"progress", progress:p});
	}
	
	/**
	 * @method _drawNext
	 * @protected
	 * @return Boolean 最後の描画であれば false を返します。
	 **/
	p._drawNext = function() {
		var frame = this._frames[this._index];
		var sc = frame.scale*this._scale;
		var rect = frame.rect;
		var sourceRect = frame.sourceRect;
		var canvas = this._data.images[frame.img];
		var ctx = canvas.getContext("2d");
		frame.funct&&frame.funct.apply(frame.scope, frame.params);
		ctx.save();
		ctx.beginPath();
		ctx.rect(rect.x, rect.y, rect.width, rect.height);
		ctx.clip();
		ctx.translate(Math.ceil(rect.x-sourceRect.x*sc), Math.ceil(rect.y-sourceRect.y*sc));
		ctx.scale(sc,sc);
		frame.source.draw(ctx); // display object will draw itself.
		ctx.restore();
		return (++this._index) < this._frames.length;
	}

createjs.SpriteSheetBuilder = SpriteSheetBuilder;
}());
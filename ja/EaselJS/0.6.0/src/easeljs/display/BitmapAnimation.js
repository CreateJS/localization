/*
* BitmapAnimation
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

// 名前空間
this.createjs = this.createjs||{};

(function() {

/**
 * スプライトシート画像からフレームやフレームの順列（すなわちアニメーション）を表示します
 * スプライトシートとは単一の画像（通常はアニメーションのフレーム）が結合された画像の集まりのことです。
 * 例えば、100×100の8枚の画像からなるアニメーションは2行4列の400×200のスプライトシートに結合できます。
 * あなたは個々のフレームを表示することもできれば、アニメーションとしてフレームの順列を再生することもできますし、複数のアニメーションを順番に再生することもできます。
 *
 * より詳細なフレームとアニメーションの設定に関する情報は {{#crossLink "SpriteSheet"}}{{/crossLink}} クラスを見てください。
 *
 * <h4>例</h4>
 *      var instance = new createjs.BitmapAnimation(spriteSheet);
 *      instance.gotoAndStop("frameName");
 *
 * @class BitmapAnimation
 * @extends DisplayObject
 * @uses EventDispatcher
 * @constructor
 * @param {SpriteSheet} spriteSheet 再生するスプライトシートインスタンスです。それはソース画像、フレーム面積、フレームデータの情報を含みます。
 * 詳しくは {{#crossLink "SpriteSheet"}}{{/crossLink}} を見てください。
 **/
var BitmapAnimation = function(spriteSheet) {
  this.initialize(spriteSheet);
}
var p = BitmapAnimation.prototype = new createjs.DisplayObject();

// イベント:

	/**
	 * アニメーションが終了地点に達した時に発火されます。
	 * @event animationend
	 * @param {Object} target イベントを発火したオブジェクトです。
	 * @param {String} type イベントのタイプです。
	 * @param {String} name 終了したアニメーション名です。
	 * @param {String} next 次に再生されるアニメーション名あるいはnullです。アニメーションがループしている時、これは現在のアニメーション名と同じものになります。
	 * @since 0.6.0
	 */

// パブリックプロパティ:

	/**
	 * アニメーションが終了地点に達した時に呼び出される関数を指定します。
	 * これは3つの引数とともに呼び出されます。:
	 * 第一にこのインスタンスの参照、第二に終了したアニメーション名、第三に次に再生されるアニメーション名です。
	 * @property onAnimationEnd
	 * @type {Function}
	 * @deprecated "animationend"イベントの使用を推奨します。こちらは将来のバージョンで削除される予定です。
	 */
	p.onAnimationEnd = null;

	/**
	 * 次のdrawメソッドの呼び出しで描画されるフレームです。
	 * 特記事項として、スプライトシートデータによっては、この値は連続していません。
	 * 読み取り専用
	 * @property currentFrame
	 * @type {Number}
	 * @default -1
	 **/
	p.currentFrame = -1;

	/**
	 * 現在再生中のアニメーションを返します。読み取り専用。
	 * @property currentAnimation
	 * @type {String}
	 * @final
	 **/
	p.currentAnimation = null; // READ-ONLY

	/**
	 * アニメーションが各tickで自動的に進まないようにします。
	 * 例えば、あなたがアイコン用のスプライトシートを作成した場合、pausedをtrueに設定し<code>currentFrame</code>を設定することで、
	 * 適切なアイコンを表示することができます。
	 * @property paused
	 * @type {Boolean}
	 * @default false
	 **/
	p.paused = true;

	/**
	 * 再生するスプライトシートインスタンスです。それはソース画像、フレーム面積、フレームデータの情報を含みます。
	 * 詳しくは {{#crossLink "SpriteSheet"}}{{/crossLink}} を見てください。
	 * @property spriteSheet
	 * @type {SpriteSheet}
	 **/
	p.spriteSheet = null;

	/**
	 * Bitmapをcanvasに描画するときにグローバルなピクセル座標として描画するか否かを指定します。
	 * @property snapToPixel
	 * @type {Boolean}
	 * @default true
	 **/
	p.snapToPixel = true;

	/**
	 * 1より大きなfrequencyを持つ複数のアニメーションを同時に再生するときに使われ、再生ヘッドのtickによる進み方にオフセットをつけることができます。
	 * 例えば、あなたがfrequencyが2で、ひとつはoffsetが1に設定された2つのBitmapAnimationを作成するとしましょう。
	 * 両方2tickごとに進みますが、交互のtickで進むこととなります。
	 * つまり、ひとつのインスタンスは奇数tickで進み、もうひとつは偶数tickで進みます。
	 * @property offset
	 * @type {Number}
	 * @default 0
	 */
	p.offset = 0;


	/**
	 * 現在再生中のアニメーションの現在のフレーム番号です。
	 * 正常に再生されていれば、0からn-1の値を連続的にとります。
	 * nは現在のアニメーションのフレーム数です。
	 * @property currentAnimationFrame
	 * @type {Number}
	 * @default 0
	 **/
	p.currentAnimationFrame = 0;

// ミックスイン:
	// EventDispatcherのメソッド:
	p.addEventListener = null;
	p.removeEventListener = null;
	p.removeAllEventListeners = null;
	p.dispatchEvent = null;
	p.hasEventListener = null;
	p._listeners = null;
	createjs.EventDispatcher.initialize(p); // EventDispatcherのメソッドの注入。

// プライベートプロパティ:
	/**
	 * @property _advanceCount
	 * @protected
	 * @type {Number}
	 * @default 0
	 **/
	p._advanceCount = 0;

	/**
	 * @property _animation
	 * @protected
	 * @type {Object}
	 * @default null
	 **/
	p._animation = null;

// コンストラクタ:
	/**
	 * @property DisplayObject_initialize
	 * @type {Function}
	 * @private
	 **/
	p.DisplayObject_initialize = p.initialize;

	/**
	 * 初期化メソッドです。
	 * @method initialize
	 * @protected
	*/
	p.initialize = function(spriteSheet) {
		this.DisplayObject_initialize();
		this.spriteSheet = spriteSheet;
	}

	/**
	 * 表示オブジェクトがcanvasに描画されている場合、それが可視であるか否かを示します。
	 * これは、ステージの範囲内に表示されているか否かを示すものではありません。
	 * 注意: このメソッドは主に内部での使用を意図したものですが、高度な使用において役に立つでしょう。
	 * @method isVisible
	 * @return {Boolean} Boolean indicating whether the display object would be visible if drawn to a canvas
	 **/
	p.isVisible = function() {
		var hasContent = this.cacheCanvas || (this.spriteSheet.complete && this.currentFrame >= 0);
		return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
	}

	/**
	 * @property DisplayObject_draw
	 * @type {Function}
	 * @private
	 **/
	p.DisplayObject_draw = p.draw;

	/**
	 * 表示オブジェクトを、visible, alpha, shadow, そしてtransformの設定を無視して、指定されたコンテキストで描画します。
	 * 描画された場合にtrueを返します（機能をオーバーライドする場合に有用です）。
	 * 注意: このメソッドは主に内部での使用を意図したものですが、高度な使用において役に立つでしょう。
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx canvas2Dコンテキストオブジェクトです。
	 * @param {Boolean} ignoreCache 描画において保存しているキャッシュを無視するか否かを指定します。
	 * 例えば、キャッシュを再構築するのに使われます。（既存のキャッシュが再利用されるのを防ぐために）
	 **/
	p.draw = function(ctx, ignoreCache) {
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		this._normalizeFrame();
		var o = this.spriteSheet.getFrame(this.currentFrame);
		if (!o) { return; }
		var rect = o.rect;
		ctx.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, -o.regX, -o.regY, rect.width, rect.height);
		return true;
	}

	// 注意, このセクションのAPIはBitmapから指定されたAPI（DislayObjectのもの）を使用しています。
	// Bitmapには実装がありません。

	/**
	 * Bitmapインスタンスの内容は既に単純なフォーマットであるため、キャッシュは不要です。
	 * パフォーマンスを下げるのでBitmapインスタンスをキャッシュすべきでは<b>ありません</b>。
	 * @method cache
	 **/

	/**
	 * Bitmapインスタンスの内容は既に単純なフォーマットであるため、キャッシュは不要です。
	 * パフォーマンスを下げるのでBitmapインスタンスをキャッシュすべきでは<b>ありません</b>。
	 * @method updateCache
	 **/

	/**
	 * Bitmapインスタンスの内容は既に単純なフォーマットであるため、キャッシュは不要です。
	 * パフォーマンスを下げるのでBitmapインスタンスをキャッシュすべきでは<b>ありません</b>。
	 * @method uncache
	 **/

	/**
	 * 一時停止されていたアニメーションを再生開始します。
	 * BitmapAnimationは{{#crossLink "BitmapAnimation/stop"}}{{/crossLink}}あるいは{{#crossLink "BitmapAnimation/gotoAndStop"}}{{/crossLink}}
	 * の呼び出しで一時停止できます。
	 * フレームが1つだけのアニメーションの場合は変化しません。
	 * @method play
	 **/
	p.play = function() {
		this.paused = false;
	}

	/**
	 * 再生中のアニメーションを停止します。
	 * BitmapAnimationは{{#crossLink "BitmapAnimation/stop"}}{{/crossLink}}あるいは{{#crossLink "BitmapAnimation/gotoAndStop"}}{{/crossLink}}
	 * の呼び出しで一時停止できます。
	 * BitmapAnimationは{{#crossLink "BitmapAnimation/gotoAndPlay"}}{{/crossLink}}によって再生されます。
	 * 特記事項として、{{#crossLink "BitmapAnimation/gotoAndPlay"}}{{/crossLink}}あるいは{{#crossLink "BitmapAnimation/play"}}{{/crossLink}}
	 * の呼び出しにより再生を再開できます。
	 * @method stop
	 **/
	p.stop = function() {
		this.paused = true;
	}

	/**
	 * pausedをfalseに設定し、指定したアニメーション名、フレーム名、あるいはフレーム番号のアニメーションを再生します。
	 * @method gotoAndPlay
	 * @param {String|Number} frameOrAnimation 再生ヘッドを移動して再生開始するフレーム番号あるいはアニメーション名です。
	 **/
	p.gotoAndPlay = function(frameOrAnimation) {
		this.paused = false;
		this._goto(frameOrAnimation);
	}

	/**
	 * pausedをtrueに設定し、指定したアニメーション名、フレーム名、あるいはフレーム番号でシークします。
	 * @method gotoAndStop
	 * @param {String|Number} frameOrAnimation 再生ヘッドを移動して停止するフレーム番号あるいはアニメーション名です。
	 **/
	p.gotoAndStop = function(frameOrAnimation) {
		this.paused = true;
		this._goto(frameOrAnimation);
	}

	/**
	 * 再生ヘッドを進めます。これは各tickのデフォルト動作として呼び出されます。
	 * @method advance
	*/
	p.advance = function() {
		if (this._animation) { this.currentAnimationFrame++; }
		else { this.currentFrame++; }
		this._normalizeFrame();
	}

	/**
	 * 現在のフレームの原点から見た境界を{{#crossLink "Rectangle"}}{{/crossLink}}の形で返します。
	 * 例えば、90×70の<code>regX=50</code>と<code>regY=40</code>のフレームでは[x=-50, y=-40, width=90, height=70]のRectangleが返ります。
	 *
	 * SpriteSheetの{{#crossLink "SpriteSheet/getFrameBounds"}}{{/crossLink}}メソッドも参照してください。
	 * @method getBounds
	 * @return {Rectangle} Rectangleインスタンスです。フレームが存在しない場合、あるいは画像が完全に読み込まれていない場合はnullを返します。
	 **/
	p.getBounds = function() {
		return this.spriteSheet.getFrameBounds(this.currentFrame);
	}

	/**
	 * BitmapAnimationインスタンスのクローンを返します。
	 * 特記事項として、SpriteSheetインスタンスはクローンで生成したインスタンス間で共有されます。
	 * @method clone
	 * @return {BitmapAnimation} BitmapAnimationインスタンスのクローンです。
	 **/
	p.clone = function() {
		var o = new BitmapAnimation(this.spriteSheet);
		this.cloneProps(o);
		return o;
	}

	/**
	 * オブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} オブジェクトの文字列表現です。
	 **/
	p.toString = function() {
		return "[BitmapAnimation (name="+  this.name +")]";
	}

// プライベートメソッド:
	/**
	 * @property DisplayObject__tick
	 * @type {Function}
	 * @private
	 **/
	p.DisplayObject__tick = p._tick;

	/**
	 * pausedがtrueでない場合に <code>currentFrame</code> を進めます。
	 * これは{{#crossLink "Stage"}}{{/crossLink}}がtickを実行した時に自動的に呼ばれます。
	 * @protected
	 * @method _tick
	 **/
	p._tick = function(params) {
		var f = this._animation ? this._animation.frequency : 1;
		if (!this.paused && ((++this._advanceCount)+this.offset)%f == 0) {
			this.advance();
		}
		this.DisplayObject__tick(params);
	}


	/**
	 * 現在のフレーム番号を設定し、アニメーションを進め、コールバックを適切に発火します。
	 * @protected
	 * @method _normalizeCurrentFrame
	 **/
	p._normalizeFrame = function() {
		var animation = this._animation;
		var frame = this.currentFrame;
		var paused = this.paused;
		var l;

		if (animation) {
			l = animation.frames.length;
			if (this.currentAnimationFrame >= l) {
				var next = animation.next;
				if (this._dispatchAnimationEnd(animation, frame, paused, next, l-1)) {
					// do nothing, something changed in the event stack.
				} else if (next) {
					this._goto(next);
				} else {
					this.paused = true;
					this.currentAnimationFrame = animation.frames.length-1;
					this.currentFrame = animation.frames[this.currentAnimationFrame];
				}
			} else {
				this.currentFrame = animation.frames[this.currentAnimationFrame];
			}
		} else {
			l = this.spriteSheet.getNumFrames();
			if (frame >= l) {
				if (!this._dispatchAnimationEnd(animation, frame, paused, l-1)) { this.currentFrame = 0; }
			}
		}
	}

	/**
	 * "animationend"イベントを発火します。
	 * イベントハンドラがアニメーションを変化させた場合trueを返します。
	 * (例: calling {{#crossLink "BitmapAnimation/stop"}}{{/crossLink}},
	 * {{#crossLink "BitmapAnimation/gotoAndPlay"}}{{/crossLink}}, など。)
	 * @property _dispatchAnimationEnd
	 * @private
	 * @type {Function}
	 **/
	p._dispatchAnimationEnd = function(animation, frame, paused, next, end) {
		var name = animation ? animation.name : null;
		this.onAnimationEnd&&this.onAnimationEnd(this, name, next);
		this.dispatchEvent({type:"animationend", name:name, next:next});
		if (!paused && this.paused) { this.currentAnimationFrame = end; }
		return (this.paused != paused || this._animation != animation || this.currentFrame != frame);
	}

	/**
	 * @property DisplayObject_cloneProps
	 * @private
	 * @type {Function}
	 **/
	p.DisplayObject_cloneProps = p.cloneProps;

	/**
	 * @method cloneProps
	 * @param {Text} o
	 * @protected
	 **/
	p.cloneProps = function(o) {
		this.DisplayObject_cloneProps(o);
		o.onAnimationEnd = this.onAnimationEnd;
		o.currentFrame = this.currentFrame;
		o.currentAnimation = this.currentAnimation;
		o.paused = this.paused;
		o.offset = this.offset;
		o._animation = this._animation;
		o.currentAnimationFrame = this.currentAnimationFrame;
	}

	/**
	 * 再生ヘッドを指定したフレーム番号あるいはアニメーション名に移動します。
	 * @method _goto
	 * @param {String|Number} frameOrAnimation 再生ヘッドを移動させるフレーム番号あるいはアニメーション名です。
	 * @protected
	 **/
	p._goto = function(frameOrAnimation) {
		if (isNaN(frameOrAnimation)) {
			var data = this.spriteSheet.getAnimation(frameOrAnimation);
			if (data) {
				this.currentAnimationFrame = 0;
				this._animation = data;
				this.currentAnimation = frameOrAnimation;
				this._normalizeFrame();
			}
		} else {
			this.currentAnimation = this._animation = null;
			this.currentFrame = frameOrAnimation;
		}
	}

createjs.BitmapAnimation = BitmapAnimation;
}());

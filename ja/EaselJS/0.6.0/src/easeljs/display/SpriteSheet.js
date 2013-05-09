/*
* SpriteSheet
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
 * スプライトシートに関連するプロパティやメソッドをカプセル化します。スプライトシートは、より大きいイメージ（あるいは
 * 複数のイメージ）に合成された一連のイメージです（たいていはアニメーションフレーム）。たとえば、８個の100x100のイメージ
 * で構成されるアニメーションは、単一の400x200のスプライトシート（２段にまたがった４フレーム）に合成されます。
 *
 * スプライトシートコンストラクタに渡されるデータは、３つの重要な情報を定義します:<ol>
 *    <li> 使用する単一のイメージもしくは複数イメージ。</li>
 *    <li> 個々のイメージフレームの位置。このデータは、２つの方法のうち１つで表現されます:
 *    規則的なグリッドの並びで同じ大きさのフレームとして、もしくは不規則に（不連続に）並べられた個々に定義され可変サイズの
 *    フレームとして。</li>
 *    <li> 同じく、アニメーションは２つの方法で表現されます: 開始と終了フレーム [0,3]と定義される一連の連続するフレームとして、
 *    あるいは、フレームのリスト [0,1,2,3]として。</li>
 * </OL>
 *
 * <h4>スプライトシートの書式</h4>
 *
 *      data = {
 *
 *          // イメージの定義:
 *          // 使用するイメージもしくはイメージURIのリスト。スプライトシートはあらかじめロードして扱うことができます。
 *          // その順序は、それらのフレーム定義のインデックス値を決定づけます。
 *          images: [image1, "path/to/image2.png"],
 *
 *          // フレームの定義:
 * 	        // フレームを定義するシンプルな方法は、フレームが連続しているのでフレームサイズのみを要求します:
 * 	        // フレームのwidth/heightを定義してください。そして、任意にフレームカウントと登録座標のx/yを定義してください。
 * 	        // カウントが除外された場合は、イメージの寸法に基づいて自動的に計算されます。
 * 	        frames: {width:64, height:64, count:20, regX: 32, regY:64},
 *
 * 	        // もしくは、フレームの個々の矩形を定義する複雑な方法です。
 * 	        // ５番目の値は、"images"で定義されたリストごとのイメージインデックスです（ディフォルトは0）。
 * 	        frames: [
 * 	        	// x, y, width, height, imageIndex, regX, regY
 * 	        	[0,0,64,64,0,32,64],
 * 	        	[64,0,96,64,0]
 * 	        ],
 *
 *          // アニメーションの定義:
 *
 * 	        // シンプルなアニメーションの定義。フレームの連続した範囲を定義してください。
 * 	        // 順序づけるために"次の"アニメーションの名前もオプションとして定義してください。
 * 	        // 次にfalseをセットすると、終わりに到達したときに、ポーズとなります。
 * 	        animations: {
 * 	        	// start, end, next, frequency
 * 	        	run: [0,8],
 * 	        	jump: [9,12,"run",2],
 * 	        	stand: 13
 * 	        }
 *
 *          // アニメーション内でインデックスによってフレームごとに指定する複雑なアプローチ。
 *          animations: {
 *          	run: {
 *          		frames: [1,2,3,3,2,1]
 *          	},
 *          	jump: {
 *          		frames: [1,4,5,6,1],
 *          		next: "run",
 *          		frequency: 2
 *          	},
 *          	stand: { frames: [7] }
 *          }
 *
 * 	        // 上の２つのアプローチは組み合わせることができます。単一のフレーム定義を使うこともできます:
 * 	        animations: {
 * 	        	run: [0,8,true,2],
 * 	        	jump: {
 * 	        		frames: [8,9,10,9,8],
 * 	        		next: "run",
 * 	        		frequency: 2
 * 	        	},
 * 	        	stand: 7
 * 	        }
 *      }
 *
 * <h4>例</h4>
 * ２つのアニメーション フレーム0-4でループする"run"とフレーム5-8から再生する"jump"と共に規則的な50x50のグリッドに
 * 配置された単一のイメージ "sprites.jpg"を持つシンプルなスプライトシートを定義するためには:
 *
 *      var data = {
 *          images: ["sprites.jpg"],
 *          frames: {width:50, height:50},
 *          animations: {run:[0,4], jump:[5,8,"run"]}
 *      };
 *      var animation = new createjs.BitmapAnimation(data);
 *      animation.gotoAndPlay("run");
 *
 * @class SpriteSheet
 * @constructor
 * @param data
 * @uses EventDispatcher
 **/
var SpriteSheet = function(data) {
  this.initialize(data);
}
var p = SpriteSheet.prototype;

// イベント:

	/**
	 * すべてのイメージがロードされるときに発行されます。スプライトシートが初期化されるときにイメージが完全に
	 * ロードされない場合は、これは発火(fire)だけすることに注意してください。前もってリスナを追加することで、complete
	 * プロパティをチェックすべきです。例
	 * <pre><code>var sheet = new SpriteSheet(data);
	 * if (!sheet.complete) {
	 *  &nbsp; // not preloaded, listen for onComplete:
	 *  &nbsp; sheet.addEventListener("complete", handler);
	 * }</code></pre>
	 * @event complete
	 * @param {Object} target イベントが発行されるオブジェクト。
	 * @param {String} type イベントタイプ。
	 * @since 0.6.0
	 */

// パブリックプロパティ:
	/**
	 * すべてのイメージのロードが完了したかどうかを示すリードオンリーのプロパティ。
	 * @property complete
	 * @type Boolean
	 **/
	p.complete = true;
	
	
	/**
	 * onCompleteコールバックは、すべてのイメージがロードされたときにコールされます。スプライトシートが初期化されるときに
	 * イメージが完全にロードされない場合は、これは発火(fire)だけすることに注意してください。前もってonCompleteハンドラを
	 * 追加することで、completeプロパティをチェックすべきです。例
	 * <pre><code>var sheet = new SpriteSheet(data);
	 * if (!sheet.complete) {
	 *  &nbsp; // not preloaded, listen for onComplete:
	 *  &nbsp; sheet.onComplete = handler;
	 * }</code></pre>
	 * @property onComplete
	 * @type Function
	 * @deprecated "complete"イベントを支持して。将来のバージョンでは削除される。
	 **/
	p.onComplete = null;

// mix-ins:
	// EventDispatcher methods:
	p.addEventListener = null;
	p.removeEventListener = null;
	p.removeAllEventListeners = null;
	p.dispatchEvent = null;
	p.hasEventListener = null;
	p._listeners = null;
	createjs.EventDispatcher.initialize(p); // inject EventDispatcher methods.

// プライベートプロパティ:
	/**
	 * @property _animations
	 * @protected
	 **/
	p._animations = null;
	
	/**
	 * @property _frames
	 * @protected
	 **/
	p._frames = null;
	
	/**
	 * @property _images
	 * @protected
	 **/
	p._images = null;
	
	/**
	 * @property _data
	 * @protected
	 **/
	p._data = null;
	
	/**
	 * @property _loadCount
	 * @protected
	 **/
	p._loadCount = 0;
	
	// シンプルなフレーム定義のみ:
	/**
	 * @property _frameHeight
	 * @protected
	 **/
	p._frameHeight = 0;
	
	/**
	 * @property _frameWidth
	 * @protected
	 **/
	p._frameWidth = 0;
	
	/**
	 * @property _numFrames
	 * @protected
	 **/
	p._numFrames = 0;
	
	/**
	 * @property _regX
	 * @protected
	 **/
	p._regX = 0;
	
	/**
	 * @property _regY
	 * @protected
	 **/
	p._regY = 0;

// コンストラクタ:
	/**
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function(data) {
		var i,l,o,a;
		if (data == null) { return; }
		
		// imagesの解析:
		if (data.images && (l=data.images.length) > 0) {
			a = this._images = [];
			for (i=0; i<l; i++) {
				var img = data.images[i];
				if (typeof img == "string") {
					var src = img;
					img = new Image();
					img.src = src;
				}
				a.push(img);
				if (!img.getContext && !img.complete) {
					this._loadCount++;
					this.complete = false;
					(function(o) { img.onload = function() { o._handleImageLoad(); } })(this);
				}
			}
		}
		
		// framesの解析:
		if (data.frames == null) { // nothing
		} else if (data.frames instanceof Array) {
			this._frames = [];
			a = data.frames;
			for (i=0,l=a.length;i<l;i++) {
				var arr = a[i];
				this._frames.push({image:this._images[arr[4]?arr[4]:0], rect:new createjs.Rectangle(arr[0],arr[1],arr[2],arr[3]), regX:arr[5]||0, regY:arr[6]||0 });
			}
		} else {
			o = data.frames;
			this._frameWidth = o.width;
			this._frameHeight = o.height;
			this._regX = o.regX||0;
			this._regY = o.regY||0;
			this._numFrames = o.count;
			if (this._loadCount == 0) { this._calculateFrames(); }
		}
		
		// animationsの解析:
		if ((o=data.animations) != null) {
			this._animations = [];
			this._data = {};
			var name;
			for (name in o) {
				var anim = {name:name};
				var obj = o[name];
				if (typeof obj == "number") { // single frame
					a = anim.frames = [obj];
				} else if (obj instanceof Array) { // simple
					if (obj.length == 1) { anim.frames = [obj[0]]; }
					else {
						anim.frequency = obj[3];
						anim.next = obj[2];
						a = anim.frames = [];
						for (i=obj[0];i<=obj[1];i++) {
							a.push(i);
						}
					}
				} else { // complex
					anim.frequency = obj.frequency;
					anim.next = obj.next;
					var frames = obj.frames;
					a = anim.frames = (typeof frames == "number") ? [frames] : frames.slice(0);
				}
				anim.next = (a.length < 2 || anim.next == false) ? null : (anim.next == null || anim.next == true) ? name : anim.next;
				if (!anim.frequency) { anim.frequency = 1; }
				this._animations.push(name);
				this._data[name] = anim;
			}
		}
		
	}

// パブリックメソッド:
	/**
	 * 指定されたアニメーションにおけるトータルのフレーム数を返します。もしくは、animationパラメータが
	 * 除外された場合はすべてのスプライトシートにおける数を返します。
     * @method getNumFrames
	 * @param {String} animation フレーム数を取得するアニメーションの名前。
	 * @return {Number} アニメーションにおけるフレーム数、もしくは、animationパラメータが除外された場合は、すべてのスプライトシートにおける数。
	*/
	p.getNumFrames = function(animation) {
		if (animation == null) {
			return this._frames ? this._frames.length : this._numFrames;
		} else {
			var data = this._data[animation];
			if (data == null) { return 0; }
			else { return data.frames.length; }
		}
	}
	
	/**
	 * 文字列としてのすべての利用可能なアニメーション名の配列を返します。
	 * @method getAnimations
	 * @return {Array} このスプライトシート上で利用可能なアニメーション名の配列。
	 **/
	p.getAnimations = function() {
		return this._animations.slice(0);
	}
	
	/**
	 * 指定されたアニメーションを定義するオブジェクトを返します。返されたオブジェクトは、
	 * アニメーションにおけるフレームidの配列を含むframesプロパティ、このアニメーションを
	 * 進める頻度を示すfrequencyプロパティ、nameプロパティ、ディフォルトの次のアニメーションを
	 * 支持するnextプロパティを持っています。アニメーションがループするなら、nameとnextプロパティ
	 * は、同じになります。
	 * @method getAnimation
	 * @param {String} name 取得するアニメーションの名前。
	 * @return {Object} frames, frequency, name, nextプロパティを持つ汎用オブジェクト。
	 **/
	p.getAnimation = function(name) {
		return this._data[name];
	}
	
	/**
	 * イメージと指定されたフレームの元の矩形を示すオブジェクトを返します。返されたオブジェクトは、
	 * 見つかったフレームにおけるimageオブジェクトへの参照を持つimageプロパティを持っており、
	 * そのイメージ内のフレームの境界を定義するRectangleインスタンスを含むrectプロパティを持っています。
	 * @method getFrame
	 * @param {Number} frameIndex フレームのインデックス。
	 * @return {Object} imageとrectプロパティを持つ汎用オブジェクト。フレームが存在しない場合、もしくはイメージが完全にロードされていない場合は、nullを返します。 
	 **/
	p.getFrame = function(frameIndex) {
		var frame;
		if (this.complete && this._frames && (frame=this._frames[frameIndex])) { return frame; }
		return null;
	};
	
	/**
	 * その開始位置に対して指定されたフレームの境界を定義するRectangleインスタンスを返します。たとえば、regX 50、regY 40で
	 * 90 x 70のフレームは、[x=-50, y=-40, width=90, height=70]の矩形を返します。
	 * @method getFrameBounds
	 * @param {Number} frameIndex フレームのインデックス。
	 * @return {Rectangle} Rectangleインスタンス。フレームが存在しない場合、もしくはイメージが完全にロードされていない場合は、nullを返します。
	 **/
	p.getFrameBounds = function(frameIndex) {
		var frame = this.getFrame(frameIndex);
		return frame ? new createjs.Rectangle(-frame.regX, -frame.regY, frame.rect.width, frame.rect.height) : null;
	};
	
	/**
	 * このオブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} インスタンスの文字列表現。
	 **/
	p.toString = function() {
		return "[SpriteSheet]";
	}

	/**
	 * SpriteSheetインスタンスのクローンを返します。
	 * @method clone
	 * @return {SpriteSheet} SpriteSheetインスタンスのクローン。
	 **/
	p.clone = function() {
		// TODO: それらを再利用できるので、SpriteSheetインスタンスのクローンを作成する理由は実際にはありません。
		var o = new SpriteSheet();
		o.complete = this.complete;
		o._animations = this._animations;
		o._frames = this._frames;
		o._images = this._images;
		o._data = this._data;
		o._frameHeight = this._frameHeight;
		o._frameWidth = this._frameWidth;
		o._numFrames = this._numFrames;
		o._loadCount = this._loadCount;
		return o;
	}
	
// プライベートメソッド:
	/**
	 * @method _handleImageLoad
	 * @protected
	 **/
	p._handleImageLoad = function() {
		if (--this._loadCount == 0) {
			this._calculateFrames();
			this.complete = true;
			this.onComplete&&this.onComplete();
			this.dispatchEvent("complete");
		}
	}
	
	/**
	 * @method _calculateFrames
	 * @protected
	 **/
	p._calculateFrames = function() {
		if (this._frames || this._frameWidth == 0) { return; }
		this._frames = [];
		var ttlFrames = 0;
		var fw = this._frameWidth;
		var fh = this._frameHeight;
		for (var i=0,imgs = this._images; i<imgs.length; i++) {
			var img = imgs[i];
			var cols = (img.width+1)/fw|0;
			var rows = (img.height+1)/fh|0;
			var ttl = this._numFrames>0 ? Math.min(this._numFrames-ttlFrames,cols*rows) : cols*rows;
			for (var j=0;j<ttl;j++) {
				this._frames.push({image:img, rect:new createjs.Rectangle(j%cols*fw,(j/cols|0)*fh,fw,fh), regX:this._regX, regY:this._regY });
			}
			ttlFrames += ttl;
		}
		this._numFrames = ttlFrames;
	}

createjs.SpriteSheet = SpriteSheet;
}());

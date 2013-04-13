/*
 * MotionGuidePlugin
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

// 名前空間:
this.createjs = this.createjs||{};

(function() {
	/**
	 * モーションガイドと共に動作するTweenJSプラグイン。
	 *
	 * 使用するには、TweenJSがロードされた後でプラグインをインストールします。次に、以下に述べるように、オブジェクトと
	 * 共に'guide'プロパティをトゥイーンします。
	 *
	 *       createjs.MotionGuidePlugin.install();
	 *
	 * <h4>例</h4>
	 *
	 *      // モーションガイドを使う
	 *	    Tween.get(target).to({guide:{ path:[0,0, 0,200,200,200, 200,0,0,0] }},7000);
	 *	    // ラインを可視化する
	 *	    graphics.moveTo(0,0).curveTo(0,200,200,200).curveTo(200,0,0,0);
	 *
	 * それぞれのパスは、そこで高速のパフォーマンスを確保するために事前の計算を必要とします。事前の計算のために、パスの
	 * 内部サポートは中間のトゥイーンを変更しません。Guideオブジェクトのプロパティは以下になります:<UL>
	 *      <LI> path: 必須, Array : moveToと1からn個のcurveTo呼び出しにより描画するためのx/yを示します。</LI>
	 *      <LI> start: オプション, 0-1 : 初期位置, 同じパスが続くのでなければ、ディフォルトは0。</LI>
	 *      <LI> end: オプション, 0-1 : 最終位置, 何も指定されなければ、ディフォルトは1。</LI>
	 *      <LI> orient: オプション, bool : その位置でのカーブに沿ったターゲットの回転をセットします。</LI>
	 * </UL>
	 * Guideオブジェクトは、たとえすべてのプロパティが同じ場合でも、トゥイーン間で共有されるべきではありません。
	 * ライブラリはバックグランドでこれらのオブジェクトに情報を保存し、それらを共有することで予期しないふるまいを引き起こします。
	 * トゥイーンの0-1以外の範囲の値は、定義されたカーブの適切な部分から、最良の推測となるでしょう。
	 *
	 * @class MotionGuidePlugin
	 * @constructor
	 **/
	var MotionGuidePlugin = function() {
		throw("MotionGuidePlugin cannot be instantiated.")
	};

	// 静的インタフェース:
	/**
	 * @property priority
	 * @protected
	 * @static
	 **/
	MotionGuidePlugin.priority = 0; // 高プライオリティ、すぐに実行するべき

	/**
	 * TweenJSと共に使用するために、このプラグインをインストールします。このプラグインを有効にするために、TweenJSが
	 * ロードされた後で一度これを呼び出してください。
	 * @method install
	 * @static
	 **/
	MotionGuidePlugin.install = function() {
		createjs.Tween.installPlugin(MotionGuidePlugin, ["guide", "x", "y", "rotation"]);
		return createjs.Tween.IGNORE;
	};

	/**
	 * @method init
	 * @protected
	 * @static
	 **/
	MotionGuidePlugin.init = function(tween, prop, value) {
		var target = tween.target;
		if(!target.hasOwnProperty("x")){ target.x = 0; }
		if(!target.hasOwnProperty("y")){ target.y = 0; }
		if(!target.hasOwnProperty("rotation")){ target.rotation = 0; }
		return prop=="guide"?null:value;
	};

	/**
	 * @method step
	 * @protected
	 * @static
	 **/
	MotionGuidePlugin.step = function(tween, prop, startValue, endValue, injectProps) {
		if(prop != "guide"){ return endValue; }
		var temp, data = endValue;
		if(!data.hasOwnProperty("path")){ data.path = []; }
		var path = data.path;
		if(!data.hasOwnProperty("end")){ data.end = 1; }
		if(!data.hasOwnProperty("start")){
			data.start = (startValue&&startValue.hasOwnProperty("end")&&startValue.path===path)?startValue.end:0;
		}
		if(data.hasOwnProperty("_segments") && data._length){ return endValue; }
		var l = path.length;
		var accuracy = 10;		// 以下の正確さを改善するために調整してください、しかしパフォーマンスは犠牲になります (# of seg)
		if(l >= 6 && (l-2) % 4 == 0){	// 十分な点の数 && startを無視することでエントリごとにふさわしい数を含む
			data._segments = [];
			data._length = 0;
			for(var i=2; i<l; i+=4){
				var sx = path[i-2], sy = path[i-1];
				var cx = path[i+0], cy = path[i+1];
				var ex = path[i+2], ey = path[i+3];
				var oldX = sx, oldY = sy;
				var tempX, tempY, total = 0;
				var sublines = [];
				for(var j=1; j<=accuracy; j++){
					var t = j/accuracy;
					var inv = 1 - t;
					tempX = inv*inv * sx + 2 * inv * t * cx + t*t * ex;
					tempY = inv*inv * sy + 2 * inv * t * cy + t*t * ey;
					total += sublines[sublines.push(Math.sqrt((temp=tempX-oldX)*temp + (temp=tempY-oldY)*temp))-1];
					oldX = tempX;
					oldY = tempY;
				}
				data._segments.push(total);
				data._segments.push(sublines);
				data._length += total;
			}
		} else {
			throw("invalid 'path' data, please see documentation for valid paths");
		}

		temp = data.orient;
		data.orient = false;
		MotionGuidePlugin.calc(data, data.end, injectProps);
		data.orient = temp;
		return endValue;
	};

	/**
	 * @method tween
	 * @protected
	 * @static
	 **/
	MotionGuidePlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end) {
		var data = endValues.guide;
		if(data == undefined || data === startValues.guide){ return value; }
		if(data.lastRatio != ratio){
			// first time through so calculate what I need to
			var t = ((data.end-data.start)*(wait?data.end:ratio)+data.start);
			MotionGuidePlugin.calc(data, t, tween.target);
			if(data.orient){ tween.target.rotation += startValues.rotation||0; }
			data.lastRatio = ratio;
		}
		if(!data.orient && prop == "rotation"){ return value; }
		return tween.target[prop];
	};

	/**
	 * パスに沿って与えられた比率により、パスにふさわしいx/y/rotation情報を決定します。
	 * すべてのオプションパラメータが指定されたpathオブジェクトを仮定します。
	 * @param data トゥイーンにおける"guide:"プロパティに渡すDataオブジェクト
	 * @param ratio 0-1 パスに沿った距離, 0-1以外の値は、"最良の推測"
	 * @param target 結果をコピーするためのオブジェクト, 指定されない場合は新しいオブジェクトが使われます
	 * @return {Object} トゥイーンされたプロパティ付きのターゲットオブジェクトもしくは、新しいオブジェクト
	 * @static
	 */
	MotionGuidePlugin.calc = function(data, ratio, target) {
		if(data._segments == undefined){ MotionGuidePlugin.validate(data); }
		if(target == undefined){ target = {x:0, y:0, rotation:0}; }
		var seg = data._segments;
		var path = data.path;

		// segmentを見つける
		var pos = data._length * ratio;
		var cap = seg.length - 2;
		var n = 0;
		while(pos > seg[n] && n < cap){
			pos -= seg[n];
			n+=2;
		}

		// sublineを見つける
		var sublines = seg[n+1];
		var i = 0;
		cap = sublines.length-1;
		while(pos > sublines[i] && i < cap){
			pos -= sublines[i];
			i++;
		}
		var t = (i/++cap)+(pos/(cap*sublines[i]));

		// x/yを見つける
		n = (n*2)+2;
		var inv = 1 - t;
		target.x = inv*inv * path[n-2] + 2 * inv * t * path[n+0] + t*t * path[n+2];
		target.y = inv*inv * path[n-1] + 2 * inv * t * path[n+1] + t*t * path[n+3];

		// 方向
		if(data.orient){
			target.rotation = 57.2957795 * Math.atan2(
				(path[n+1]-path[n-1])*inv + (path[n+3]-path[n+1])*t,
				(path[n+0]-path[n-2])*inv + (path[n+2]-path[n+0])*t);
		}

		return target;
	};

	// パブリックプロパティ:

	// プライベートプロパティ:

	// コンストラクタ:

	// パブリックメソッド:

	// プライベートメソッド:

	createjs.MotionGuidePlugin = MotionGuidePlugin;
}());

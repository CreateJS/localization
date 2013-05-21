/*
* Graphics
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
* Graphicsクラスで使用される内部クラスです。Graphics内の命令リストを作成するために使用されます。
* @class Command
* @protected
* @constructor
**/
function Command(f, params, path) {
	this.f = f;
	this.params = params;
	this.path = path==null ? true : path;
}

/**
* @method exec
* @protected
* @param {Object} scope
**/
Command.prototype.exec = function(scope) { this.f.apply(scope, this.params); }

/**
 * Graphicsクラスは、ベクター描画命令を生成して指定したコンテクストに描画するための、容易に使用できるAPIを提供します。
 * 注意点として、Graphicsは{{#crossLink "DisplayObject/draw"}}{{/crossLink}}を直接呼び出すことにより、Easelフレームワークに依存せず使用することができますし、
 * {{#crossLink "Shape"}}{{/crossLink}}オブジェクトを使用してEaselの表示オブジェクトのコンテクスト内でベクターグラフィックスを描画することも可能です。
 *
 * <h4>Example</h4>
 *      var g = new Graphics();
 *	    g.setStrokeStyle(1);
 *	    g.beginStroke(Graphics.getRGB(0,0,0));
 *	    g.beginFill(Graphics.getRGB(255,0,0));
 *	    g.drawCircle(0,0,3);
 *
 *	    var s = new Shape(g);
 *	    	s.x = 100;
 *	    	s.y = 100;
 *
 *	    stage.addChild(s);
 *	    stage.update();
 *
 * 注意点として、Graphicsの全ての描画メソッドはGraphicsインスタンスを返すので、お互いに連鎖させることができます。
 * 例えば下のコードは赤い線、青の塗りつぶしの矩形を描画する命令を生成した後、指定したcontext2Dに表示しています:
 *
 *      myGraphics.beginStroke("#F00").beginFill("#00F").drawRect(20, 20, 100, 50).draw(myContext2D);
 *
 * <h4>短縮版 API</h4>
 * Graphicsクラスはまた"短縮版 API"を含んでおり、これはGraphicsの全てのメソッドへのショートカットである1または2文字のメソッド群です。
 * これらのメソッドはコンパクトな命令を作成するために重要で、Toolkit for CreateJSで可読性のあるコードを生成するために使用されます。
 * 全ての短縮版メソッドはprotectedとして記述されているため、ドキュメント中ではprotectedについての説明を有効にすることで閲覧することができます。
 *
 * <table>
 *     <tr><td><b>Tiny</b></td><td><b>メソッド</b></td><td><b>短縮版</b></td><td><b>Method</b></td></tr>
 *     <tr><td>mt</td><td>{{#crossLink "Graphics/moveTo"}}{{/crossLink}} </td>
 *     <td>lt</td> <td>{{#crossLink "Graphics/lineTo"}}{{/crossLink}}</td></tr>
 *     <tr><td>at</td><td>{{#crossLink "Graphics/arcTo"}}{{/crossLink}} </td>
 *     <td>bt</td><td>{{#crossLink "Graphics/bezierCurveTo"}}{{/crossLink}} </td></tr>
 *     <tr><td>qt</td><td>{{#crossLink "Graphics/quadraticCurveTo"}}{{/crossLink}} (also curveTo)</td>
 *     <td>r</td><td>{{#crossLink "Graphics/rect"}}{{/crossLink}} </td></tr>
 *     <tr><td>cp</td><td>{{#crossLink "Graphics/closePath"}}{{/crossLink}} </td>
 *     <td>c</td><td>{{#crossLink "Graphics/clear"}}{{/crossLink}} </td></tr>
 *     <tr><td>f</td><td>{{#crossLink "Graphics/beginFill"}}{{/crossLink}} </td>
 *     <td>lf</td><td>{{#crossLink "Graphics/beginLinearGradientFill"}}{{/crossLink}} </td></tr>
 *     <tr><td>rf</td><td>{{#crossLink "Graphics/beginRadialGradientFill"}}{{/crossLink}} </td>
 *     <td>bf</td><td>{{#crossLink "Graphics/beginBitmapFill"}}{{/crossLink}} </td></tr>
 *     <tr><td>ef</td><td>{{#crossLink "Graphics/endFill"}}{{/crossLink}} </td>
 *     <td>ss</td><td>{{#crossLink "Graphics/setStrokeStyle"}}{{/crossLink}} </td></tr>
 *     <tr><td>s</td><td>{{#crossLink "Graphics/beginStroke"}}{{/crossLink}} </td>
 *     <td>ls</td><td>{{#crossLink "Graphics/beginLinearGradientStroke"}}{{/crossLink}} </td></tr>
 *     <tr><td>rs</td><td>{{#crossLink "Graphics/beginRadialGradientStroke"}}{{/crossLink}} </td>
 *     <td>bs</td><td>{{#crossLink "Graphics/beginBitmapStroke"}}{{/crossLink}} </td></tr>
 *     <tr><td>es</td><td>{{#crossLink "Graphics/endStroke"}}{{/crossLink}} </td>
 *     <td>dr</td><td>{{#crossLink "Graphics/drawRect"}}{{/crossLink}} </td></tr>
 *     <tr><td>rr</td><td>{{#crossLink "Graphics/drawRoundRect"}}{{/crossLink}} </td>
 *     <td>rc</td><td>{{#crossLink "Graphics/drawRoundRectComplex"}}{{/crossLink}} </td></tr>
 *     <tr><td>dc</td><td>{{#crossLink "Graphics/drawCircle"}}{{/crossLink}} </td>
 *     <td>de</td><td>{{#crossLink "Graphics/drawEllipse"}}{{/crossLink}} </td></tr>
 *     <tr><td>dp</td><td>{{#crossLink "Graphics/drawPolyStar"}}{{/crossLink}} </td>
 *     <td>p</td><td>{{#crossLink "Graphics/decodePath"}}{{/crossLink}} </td></tr>
 * </table>
 *
 * ここでは上記の実例として, 短縮版APIを代用しています。
 *
 *      myGraphics.s("#F00").f("#00F").r(20, 20, 100, 50).draw(myContext2D);
 *
 * @class Graphics
 * @constructor
 * @for Graphics
 **/
var Graphics = function() {
	this.initialize();
};
var p = Graphics.prototype;

// 静的パブリックメソッド:
	
	
	/**
	 * 指定されたRGBカラー数値に基づいて、"rgba(255,255,255,1.0)"形式、
	 * または透明度がnullの場合は"rgb(255,255,255)"の形式で、CSSと互換性のある色の文字列を返します。例えば、
	 *
	 *      Graphics.getRGB(50, 100, 150, 0.5);
	 *
	 * は"rgba(50,100,150,0.5)"を返します。また、最初のパラメータとして単体の16進数カラー値、
	 * 2番目のパラメータとして透明度(オプション)の受け渡しもサポートします。例えば、
	 *
	 *      Graphics.getRGB(0xFF00FF, 0.2);
	 *
	 * は"rgba(255,0,255,0.2)"を返します。
	 * @method getRGB
	 * @static
	 * @param {Number} r 0から0xFF(255)の間の、色の赤成分。
	 * @param {Number} g 0から0xFF(255)の間の、色の緑成分。
	 * @param {Number} b 0から0xFF(255)の間の、色の青成分。
	 * @param {Number} （オプション） 0が完全に透明から、1が完全に不透明の間の、色の透明度。
	 * @return {String} 指定されたRGBカラー数値に基づいた、"rgba(255,255,255,1.0)"形式、
	 * または透明度がnullの場合は"rgb(255,255,255)"の形式で、CSSと互換性のある色の文字列
	 **/
	Graphics.getRGB = function(r, g, b, alpha) {
		if (r != null && b == null) {
			alpha = g;
			b = r&0xFF;
			g = r>>8&0xFF;
			r = r>>16&0xFF;
		}
		if (alpha == null) {
			return "rgb("+r+","+g+","+b+")";
		} else {
			return "rgba("+r+","+g+","+b+","+alpha+")";
		}
	};
	
	/**
	 * 指定されたHSLカラー数値に基づいて、"hsla(360,100,100,1.0)"形式、
	 * または透明度がnullの場合は"hsl(360,100,100)"の形式で、CSSと互換性のある色の文字列を返します。
	 * 例えば、以下の場合は"hsl(150,100,70)"を返します。
	 *
	 *      Graphics.getHSL(150, 100, 70);
	 *
	 * @method getHSL
	 * @static
	 * @param {Number} hue 0から360までの、色の色相。
	 * @param {Number} saturation 0から100までの、色の彩度。
	 * @param {Number} lightness 0から100までの、色の明度。
	 * @param {Number} alpha (オプション) 0が完全に透明から、1が完全に不透明の間の、色の透明度。
	 * @return {String} 指定されたHSLカラー数値に基づいた、"hsla(360,100,100,1.0)"形式、
	 * または透明度がnullの場合は"hsl(360,100,100)"の形式で、CSSと互換性のある色の文字列。
	 **/
	Graphics.getHSL = function(hue, saturation, lightness, alpha) {
		if (alpha == null) {
			return "hsl("+(hue%360)+","+saturation+"%,"+lightness+"%)";
		} else {
			return "hsla("+(hue%360)+","+saturation+"%,"+lightness+"%,"+alpha+")";
		}
	};
	
	/**
	 * 値をBase64文字列に変換します。{{#crossLink "Graphics/decodePath"}}{{/crossLink}}で使用されます。
	 * @property BASE_64
	 * @static
	 * @final
	 * @type {Object}
	 **/
	Graphics.BASE_64 = {"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,"J":9,"K":10,"L":11,"M":12,"N":13,"O":14,"P":15,"Q":16,"R":17,"S":18,"T":19,"U":20,"V":21,"W":22,"X":23,"Y":24,"Z":25,"a":26,"b":27,"c":28,"d":29,"e":30,"f":31,"g":32,"h":33,"i":34,"j":35,"k":36,"l":37,"m":38,"n":39,"o":40,"p":41,"q":42,"r":43,"s":44,"t":45,"u":46,"v":47,"w":48,"x":49,"y":50,"z":51,"0":52,"1":53,"2":54,"3":55,"4":56,"5":57,"6":58,"7":59,"8":60,"9":61,"+":62,"/":63};
		
	
	/**
	 * {{#crossLink "Graphics/setStrokeStyle"}}{{/crossLink}}の線端パラメータを表す数値を、
	 * 対応する文字列値に変換します。これは主に短縮版API用です。変換は以下のようになります:
	 * 0 は "なし", 1 は "丸型", and 2 は "角型"。
	 * 例は、線端を"角型"に設定する場合です：
	 *
	 *      myGraphics.ss(16, 2);
	 *
	 * @property STROKE_CAPS_MAP
	 * @static
	 * @final
	 * @type {Array}
	 **/
	Graphics.STROKE_CAPS_MAP = ["butt", "round", "square"];
	
	/**
	 * {{#crossLink "Graphics/setStrokeStyle"}}{{/crossLink}}の結合スタイル値を表す数値を、
	 * 対応する文字列値に変換します。これは主に短縮版API用です。変換は以下のようになります:
	 * 0 は "マイター"、1 は "ラウンド"、2 は "ベベル"。
	 * 例は、結合スタイルを"ベベル"に設定する場合です：
	 *      myGraphics.ss(16, 0, 2);
	 *
	 * @property STROKE_JOINTS_MAP
	 * @static
	 * @final
	 * @type {Array}
	 **/
	Graphics.STROKE_JOINTS_MAP = ["miter", "round", "bevel"];
	
	/**
	 * @property _ctx
	 * @static
	 * @protected
	 * @type {CanvasRenderingContext2D}
	 **/
	Graphics._ctx = (createjs.createCanvas?createjs.createCanvas():document.createElement("canvas")).getContext("2d");
	
	/**
	 * @property beginCmd
	 * @static
	 * @protected
	 * @type {Command}
	 **/
	Graphics.beginCmd = new Command(Graphics._ctx.beginPath, [], false);
	
	/**
	 * @property fillCmd
	 * @static
	 * @protected
	 * @type {Command}
	 **/
	Graphics.fillCmd = new Command(Graphics._ctx.fill, [], false);
	
	/**
	 * @property strokeCmd
	 * @static
	 * @protected
	 * @type {Command}
	 **/
	Graphics.strokeCmd = new Command(Graphics._ctx.stroke, [], false);
	
// パブリックプロパティ

// プライベートプロパティ
	/**
	 * @property _strokeInstructions
	 * @protected
	 * @type {Array}
	 **/
	p._strokeInstructions = null;

	/**
	 * @property _strokeStyleInstructions
	 * @protected
	 * @type {Array}
	 **/
	p._strokeStyleInstructions = null;
	
	/**
	 * @property _ignoreScaleStroke
	 * @protected
	 * @type Boolean
	 **/
	p._ignoreScaleStroke = false;
	
	/**
	 * @property _fillInstructions
	 * @protected
	 * @type {Array}
	 **/
	p._fillInstructions = null;
	
	/**
	 * @property _instructions
	 * @protected
	 * @type {Array}
	 **/
	p._instructions = null;
	
	/**
	 * @property _oldInstructions
	 * @protected
	 * @type {Array}
	 **/
	p._oldInstructions = null;
	
	/**
	 * @property _activeInstructions
	 * @protected
	 * @type {Array}
	 **/
	p._activeInstructions = null;
	
	/**
	 * @property _active
	 * @protected
	 * @type {Boolean}
	 * @default false
	 **/
	p._active = false;
	
	/**
	 * @property _dirty
	 * @protected
	 * @type {Boolean}
	 * @default false
	 **/
	p._dirty = false;
	
	/** 
	 * 初期化メソッド
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function() {
		this.clear();
		this._ctx = Graphics._ctx;
	};
	
	/**
	 * Graphicsインスタンスが描画命令を持っていない場合、trueを返します。
	 * @method isEmpty
	 * @return {Boolean} Graphicsインスタンスが描画命令を持っていない場合、trueを返します。
	 **/
	p.isEmpty = function() {
		return !(this._instructions.length || this._oldInstructions.length || this._activeInstructions.length);
	};
	
	/**
	 * 指定されたコンテキストに、それ自身の表示・非表示、透明度、影、変形は無視して、表示オブジェクトを描画します。
	 * 描画が処理された場合trueを返します (機能をオーバーライドするのに有用)。
	 *
	 * 注意：このメソッドは主に内部的な用途のためのものですが、高度な利用方法にも有用かもしれません。
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx 描画する対象の、canvas2Dコンテクストオブジェクト。
	 **/
	p.draw = function(ctx) {
		if (this._dirty) { this._updateInstructions(); }
		var instr = this._instructions;
		for (var i=0, l=instr.length; i<l; i++) {
			instr[i].exec(ctx);
		}
	};
	
	/**
	 * Graphicsインスタンスに対して線の描画のみを行い、塗りやストロークを含む線以外の命令をスキップします。
	 * 例えば、DisplayObject.clippingPathにおいて、クリッピングパスを描画するために使用されます。
	 * @method drawAsPath
	 * @param {CanvasRenderingContext2D} ctx 描画する対象の、canvas2Dコンテクストオブジェクト。
	 **/
	p.drawAsPath = function(ctx) {
		if (this._dirty) { this._updateInstructions(); }
		var instr, instrs = this._instructions;
		for (var i=0, l=instrs.length; i<l; i++) {
			// the first command is always a beginPath command.
			if ((instr = instrs[i]).path || i==0) { instr.exec(ctx); }
		}
	};
	
// context2D命令に直接対応するパブリックメソッド:
	/**
	 * 指定した座標に描画点を移動します。
	 * @method moveTo
	 * @param {Number} x 描画点の移動先のx座標。
	 * @param {Number} y 描画点の移動先のy座標。
	 * @return {Graphics} メソッドが呼び出されたGraphicsインスタンス（連鎖した呼び出しに有用）。
	 **/
	p.moveTo = function(x, y) {
		this._activeInstructions.push(new Command(this._ctx.moveTo, [x, y]));
		return this;
	};
	
	/**
	 * 現在の描画位置から指定した座標に対して線を描画します。指定した座標は、新しい現在の描画位置になります。
	 *
	 * より詳しい情報は
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#complex-shapes-(paths)">
	 * whatwg spec</a>
	 * を参照してください。
	 * @method lineTo
	 * @param {Number} x 線を描画する先となる描画点のx座標。
	 * @param {Number} y 線を描画する先となる描画点のy座標。
	 * @return {Graphics} メソッドが呼び出されたGraphicsインスタンス（連鎖した呼び出しに有用）。
	 **/
	p.lineTo = function(x, y) {
		this._dirty = this._active = true;
		this._activeInstructions.push(new Command(this._ctx.lineTo, [x, y]));
		return this;
	};
	
	/**
	 * 指定した制御点と半径で円弧を描画します。詳細な情報は、
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-arcto">
	 * を参照してください。
	 * whatwg spec</a>.
	 * @method arcTo
	 * @param {Number} x1
	 * @param {Number} y1
	 * @param {Number} x2
	 * @param {Number} y2
	 * @param {Number} radius
	 * @return {Graphics} メソッドが呼び出されたGraphicsインスタンス（連鎖した呼び出しに有用）。
	 **/
	p.arcTo = function(x1, y1, x2, y2, radius) {
		this._dirty = this._active = true;
		this._activeInstructions.push(new Command(this._ctx.arcTo, [x1, y1, x2, y2, radius]));
		return this;
	};
	
	/**
	 * 半径、始点の角度、終点の角度、中心店の座標(x, y)から定義される円弧を描画します。
	 * 以下の例では、半径20で中心点が(100, 100)の完全な円を描画します:
	 *
	 *      arc(100, 100, 20, 0, Math.PI*2);
	 *
	 * 詳細な情報は、
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-arc">whatwg spec</a>.
	 * を参照してください。
	 * @method arc
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} radius
	 * @param {Number} ラジアン単位による始点の角度。
	 * @param {Number} ラジアン単位による終点の角度。
	 * @param {Boolean} anticlockwise
	 * @return {Graphics} メソッドが呼び出されたGraphicsインスタンス（連鎖した呼び出しに有用）。
	 **/
	p.arc = function(x, y, radius, startAngle, endAngle, anticlockwise) {
		this._dirty = this._active = true;
		if (anticlockwise == null) { anticlockwise = false; }
		this._activeInstructions.push(new Command(this._ctx.arc, [x, y, radius, startAngle, endAngle, anticlockwise]));
		return this;
	};
	
	/**
	 * 制御点(cpx, cpy)を使用して、現在の描画位置から二次曲線(x, y)を描画します。
	 * 詳細な情報は、
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-quadraticcurveto">
	 * whatwg spec</a>
	 * を参照してください。
	 * @method quadraticCurveTo
	 * @param {Number} cpx
	 * @param {Number} cpy
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Graphics} メソッドが呼び出されたGraphicsインスタンス（連鎖した呼び出しに有用）。
	 **/
	p.quadraticCurveTo = function(cpx, cpy, x, y) {
		this._dirty = this._active = true;
		this._activeInstructions.push(new Command(this._ctx.quadraticCurveTo, [cpx, cpy, x, y]));
		return this;
	};
	
	/**
	 * 制御点（cp1x、cp1y）と（cp2x、cp2y）を使用して、現在の描画位置から（x、y）にベジエ曲線を描画します。
	 * 詳細な情報は、
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-beziercurveto">
	 * whatwg spec</a>
	 * を参照してください。
	 * @method bezierCurveTo
	 * @param {Number} cp1x
	 * @param {Number} cp1y
	 * @param {Number} cp2x
	 * @param {Number} cp2y
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Graphics} メソッドが呼び出されたGraphicsインスタンス（連鎖した呼び出しに有用）。
	 **/
	p.bezierCurveTo = function(cp1x, cp1y, cp2x, cp2y, x, y) {
		this._dirty = this._active = true;
		this._activeInstructions.push(new Command(this._ctx.bezierCurveTo, [cp1x, cp1y, cp2x, cp2y, x, y]));
		return this;
	};
	
	/**
	 * 現在の塗りとストロークを使用して、指定された幅と高さで（x、y）の位置に四角形を描画します。
	 * 詳細な情報は、
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#dom-context-2d-rect">
	 * whatwg spec</a>
	 * を参照してください。
	 * @method rect
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w 四角形の幅
	 * @param {Number} h 四角形の高さ
	 * @return {Graphics} メソッドが呼び出されたGraphicsインスタンス（連鎖した呼び出しに有用）。
	 **/
	p.rect = function(x, y, w, h) {
		this._dirty = this._active = true;
		this._activeInstructions.push(new Command(this._ctx.rect, [x, y, w, h]));
		return this;
	};
	
	/**
	 * 最後に設定された塗りまたはストロークを使用して、
	 * 現在の描画ポイントから最初の描画ポイントに有効な線を引き、現在のパスを閉じます。
	 * @method closePath
	 * @return {Graphics} メソッドが呼び出されたGraphicsインスタンス（連鎖した呼び出しに有用）。
	 **/
	p.closePath = function() {
		if (this._active) {
			this._dirty = true;
			this._activeInstructions.push(new Command(this._ctx.closePath, []));
		}
		return this;
	};
	
	
//  Flash graphics APIに大よそ対応するパブリックメソッド:
	/**
	 * Clears all drawing instructions, effectively resetting this Graphics instance.
	 * @method clear
	 * @return {Graphics} メソッドが呼び出されたGraphicsインスタンス（連鎖した呼び出しに有用）。
	 **/
	p.clear = function() {
		this._instructions = [];
		this._oldInstructions = [];
		this._activeInstructions = [];
		this._strokeStyleInstructions = this._strokeInstructions = this._fillInstructions = null;
		this._active = this._dirty = false;
		return this;
	};
	
	/**
	 * Begins a fill with the specified color. This ends the current sub-path.
	 * @method beginFill
	 * @param {String} color A CSS compatible color value (ex. "red", "#FF0000", or "rgba(255,0,0,0.5)"). Setting to
	 * null will result in no fill.
	 * @return {Graphics} メソッドが呼び出されたGraphicsインスタンス（連鎖した呼び出しに有用）。
	 **/
	p.beginFill = function(color) {
		if (this._active) { this._newPath(); }
		this._fillInstructions = color ? [new Command(this._setProp, ["fillStyle", color], false), Graphics.fillCmd] : null;
		return this;
	};
	
	/**
	 * Begins a linear gradient fill defined by the line (x0, y0) to (x1, y1). This ends the current sub-path. For
	 * example, the following code defines a black to white vertical gradient ranging from 20px to 120px, and draws a square to display it:
	 *
	 *      myGraphics.beginLinearGradientFill(["#000","#FFF"], [0, 1], 0, 20, 0, 120).drawRect(20, 20, 120, 120);
	 *
	 * @method beginLinearGradientFill
	 * @param {Array} colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define a gradient
	 * drawing from red to blue.
	 * @param {Array} ratios An array of gradient positions which correspond to the colors. For example, [0.1, 0.9] would draw
	 * the first color to 10% then interpolating to the second color at 90%.
	 * @param {Number} x0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param {Number} y0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param {Number} x1 The position of the second point defining the line that defines the gradient direction and size.
	 * @param {Number} y1 The position of the second point defining the line that defines the gradient direction and size.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginLinearGradientFill = function(colors, ratios, x0, y0, x1, y1) {
		if (this._active) { this._newPath(); }
		var o = this._ctx.createLinearGradient(x0, y0, x1, y1);
		for (var i=0, l=colors.length; i<l; i++) {
			o.addColorStop(ratios[i], colors[i]);
		}
		this._fillInstructions = [new Command(this._setProp, ["fillStyle", o], false), Graphics.fillCmd];
		return this;
	};
	
	/**
	 * Begins a radial gradient fill. This ends the current sub-path. For example, the following code defines a red to
	 * blue radial gradient centered at (100, 100), with a radius of 50, and draws a circle to display it:
	 *
	 *      myGraphics.beginRadialGradientFill(["#F00","#00F"], [0, 1], 100, 100, 0, 100, 100, 50).drawCircle(100, 100, 50);
	 *
	 * @method beginRadialGradientFill
	 * @param {Array} colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define
	 * a gradient drawing from red to blue.
	 * @param {Array} ratios An array of gradient positions which correspond to the colors. For example, [0.1,
	 * 0.9] would draw the first color to 10% then interpolating to the second color at 90%.
	 * @param {Number} x0 Center position of the inner circle that defines the gradient.
	 * @param {Number} y0 Center position of the inner circle that defines the gradient.
	 * @param {Number} r0 Radius of the inner circle that defines the gradient.
	 * @param {Number} x1 Center position of the outer circle that defines the gradient.
	 * @param {Number} y1 Center position of the outer circle that defines the gradient.
	 * @param {Number} r1 Radius of the outer circle that defines the gradient.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginRadialGradientFill = function(colors, ratios, x0, y0, r0, x1, y1, r1) {
		if (this._active) { this._newPath(); }
		var o = this._ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
		for (var i=0, l=colors.length; i<l; i++) {
			o.addColorStop(ratios[i], colors[i]);
		}
		this._fillInstructions = [new Command(this._setProp, ["fillStyle", o], false), Graphics.fillCmd];
		return this;
	};
	
	/**
	 * Begins a pattern fill using the specified image. This ends the current sub-path.
	 * @method beginBitmapFill
	 * @param {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} image The Image, Canvas, or Video object to use as the pattern.
	 * @param {String} repetition Optional. Indicates whether to repeat the image in the fill area. One of "repeat", "repeat-x",
	 * "repeat-y", or "no-repeat". Defaults to "repeat".
	 * @param {Matrix2D} matrix Optional. Specifies a transformation matrix for the bitmap fill. This transformation will be applied relative to the parent transform.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginBitmapFill = function(image, repetition, matrix) {
		if (this._active) { this._newPath(); }
		repetition = repetition || "";
		var o = this._ctx.createPattern(image, repetition);
		var cmd = new Command(this._setProp, ["fillStyle", o], false);
		var arr;
		if (matrix) {
			arr = [
				cmd,
				new Command(this._ctx.save, [], false),
				new Command(this._ctx.transform, [matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty], false),
				Graphics.fillCmd,
				new Command(this._ctx.restore, [], false)
			];
		} else {
			arr = [cmd, Graphics.fillCmd];
		}
		this._fillInstructions = arr;
		return this;
	};
	
	/**
	 * Ends the current sub-path, and begins a new one with no fill. Functionally identical to <code>beginFill(null)</code>.
	 * @method endFill
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.endFill = function() {
		return this.beginFill();
	};
	
	/**
	 * Sets the stroke style for the current sub-path. Like all drawing methods, this can be chained, so you can define
	 * the stroke style and color in a single line of code like so:
	 *
	 *      myGraphics.setStrokeStyle(8,"round").beginStroke("#F00");
	 *
	 * @method setStrokeStyle
	 * @param {Number} thickness The width of the stroke.
	 * @param {String | Number} [caps=0] Indicates the type of caps to use at the end of lines. One of butt,
	 * round, or square. Defaults to "butt". Also accepts the values 0 (butt), 1 (round), and 2 (square) for use with
	 * the tiny API.
	 * @param {String | Number} [joints=0] Specifies the type of joints that should be used where two lines meet.
	 * One of bevel, round, or miter. Defaults to "miter". Also accepts the values 0 (miter), 1 (round), and 2 (bevel)
	 * for use with the tiny API.
	 * @param {Number} [miterLimit=10] If joints is set to "miter", then you can specify a miter limit ratio which
	 * controls at what point a mitered joint will be clipped.
	 * @param {Boolean} [ignoreScale=false] If true, the stroke will be drawn at the specified thickness regardless
	 * of active transformations.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.setStrokeStyle = function(thickness, caps, joints, miterLimit, ignoreScale) {
		if (this._active) { this._newPath(); }
		this._strokeStyleInstructions = [
			new Command(this._setProp, ["lineWidth", (thickness == null ? "1" : thickness)], false),
			new Command(this._setProp, ["lineCap", (caps == null ? "butt" : (isNaN(caps) ? caps : Graphics.STROKE_CAPS_MAP[caps]))], false),
			new Command(this._setProp, ["lineJoin", (joints == null ? "miter" : (isNaN(joints) ? joints : Graphics.STROKE_JOINTS_MAP[joints]))], false),
			new Command(this._setProp, ["miterLimit", (miterLimit == null ? "10" : miterLimit)], false)
			];
		this._ignoreScaleStroke = ignoreScale;
		return this;
	};
	
	/**
	 * Begins a stroke with the specified color. This ends the current sub-path.
	 * @method beginStroke
	 * @param {String} color A CSS compatible color value (ex. "#FF0000", "red", or "rgba(255,0,0,0.5)"). Setting to
	 * null will result in no stroke.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginStroke = function(color) {
		if (this._active) { this._newPath(); }
		this._strokeInstructions = color ? [new Command(this._setProp, ["strokeStyle", color], false)] : null;
		return this;
	};
	
	/**
	 * Begins a linear gradient stroke defined by the line (x0, y0) to (x1, y1). This ends the current sub-path. For
	 * example, the following code defines a black to white vertical gradient ranging from 20px to 120px, and draws a
	 * square to display it:
	 *
	 *      myGraphics.setStrokeStyle(10).beginLinearGradientStroke(["#000","#FFF"], [0, 1], 0, 20, 0, 120).drawRect(20, 20, 120, 120);
	 *
	 * @method beginLinearGradientStroke
	 * @param {Array} colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define
	 * a gradient drawing from red to blue.
	 * @param {Array} ratios An array of gradient positions which correspond to the colors. For example, [0.1,
	 * 0.9] would draw the first color to 10% then interpolating to the second color at 90%.
	 * @param {Number} x0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param {Number} y0 The position of the first point defining the line that defines the gradient direction and size.
	 * @param {Number} x1 The position of the second point defining the line that defines the gradient direction and size.
	 * @param {Number} y1 The position of the second point defining the line that defines the gradient direction and size.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.beginLinearGradientStroke = function(colors, ratios, x0, y0, x1, y1) {
		if (this._active) { this._newPath(); }
		var o = this._ctx.createLinearGradient(x0, y0, x1, y1);
		for (var i=0, l=colors.length; i<l; i++) {
			o.addColorStop(ratios[i], colors[i]);
		}
		this._strokeInstructions = [new Command(this._setProp, ["strokeStyle", o], false)];
		return this;
	};

	
	/**
	 * Begins a radial gradient stroke. This ends the current sub-path. For example, the following code defines a red to
	 * blue radial gradient centered at (100, 100), with a radius of 50, and draws a rectangle to display it:
	 *
	 *      myGraphics.setStrokeStyle(10)
	 *          .beginRadialGradientStroke(["#F00","#00F"], [0, 1], 100, 100, 0, 100, 100, 50)
	 *          .drawRect(50, 90, 150, 110);
	 *
	 * @method beginRadialGradientStroke
	 * @param {Array} colors An array of CSS compatible color values. For example, ["#F00","#00F"] would define
	 * a gradient drawing from red to blue.
	 * @param {Array} ratios An array of gradient positions which correspond to the colors. For example, [0.1,
	 * 0.9] would draw the first color to 10% then interpolating to the second color at 90%, then draw the second color
	 * to 100%.
	 * @param {Number} x0 Center position of the inner circle that defines the gradient.
	 * @param {Number} y0 Center position of the inner circle that defines the gradient.
	 * @param {Number} r0 Radius of the inner circle that defines the gradient.
	 * @param {Number} x1 Center position of the outer circle that defines the gradient.
	 * @param {Number} y1 Center position of the outer circle that defines the gradient.
	 * @param {Number} r1 Radius of the outer circle that defines the gradient.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)	
	 **/
	p.beginRadialGradientStroke = function(colors, ratios, x0, y0, r0, x1, y1, r1) {
		if (this._active) { this._newPath(); }
		var o = this._ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
		for (var i=0, l=colors.length; i<l; i++) {
			o.addColorStop(ratios[i], colors[i]);
		}
		this._strokeInstructions = [new Command(this._setProp, ["strokeStyle", o], false)];
		return this;
	};
	
	/**
	 * Begins a pattern fill using the specified image. This ends the current sub-path. Note that unlike bitmap fills, strokes
	 * do not currently support a matrix parameter due to limitations in the canvas API.
	 * @method beginBitmapStroke
	 * @param {HTMLImageElement | HTMLCanvasElement | HTMLVideoElement} image The Image, Canvas, or Video object to use
	 * as the pattern.
	 * @param {String} [repetition=repeat] Optional. Indicates whether to repeat the image in the fill area. One of "repeat",
	 * "repeat-x", "repeat-y", or "no-repeat". Defaults to "repeat".
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)	
	 **/
	p.beginBitmapStroke = function(image, repetition) {
		if (this._active) { this._newPath(); }
		repetition = repetition || "";
		var o = this._ctx.createPattern(image, repetition);
		this._strokeInstructions = [new Command(this._setProp, ["strokeStyle", o], false)];
		return this;
	};

	/**
	 * Ends the current sub-path, and begins a new one with no stroke. Functionally identical to <code>beginStroke(null)</code>.
	 * @method endStroke
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.endStroke = function() {
		this.beginStroke();
		return this;
	};
	
	/**
	 * Maps the familiar ActionScript <code>curveTo()</code> method to the functionally similar {{#crossLink "Graphics/quadraticCurveTo"}}{{/crossLink}}
	 * method.
	 * @method curveTo
	 * @type {Function}
	 **/
	p.curveTo = p.quadraticCurveTo;
	
	/**
	 * Maps the familiar ActionScript <code>drawRect()</code> method to the functionally similar {{#crossLink "Graphics/rect"}}{{/crossLink}}
	 * method.
	 * @method drawRect
	 * @type {Function}
	 **/
	p.drawRect = p.rect;
	
	/**
	 * Draws a rounded rectangle with all corners with the specified radius.
	 * @method drawRoundRect
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w
	 * @param {Number} h
	 * @param {Number} radius Corner radius.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.drawRoundRect = function(x, y, w, h, radius) {
		this.drawRoundRectComplex(x, y, w, h, radius, radius, radius, radius);
		return this;
	};
	
	/**
	 * Draws a rounded rectangle with different corner radii. Supports positive and negative corner radii.
	 * @method drawRoundRectComplex
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} w
	 * @param {Number} h
	 * @param {Number} radiusTL Top left corner radius.
	 * @param {Number} radiusTR Top right corner radius.
	 * @param {Number} radiusBR Bottom right corner radius.
	 * @param {Number} radiusBL Bottom left corner radius.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.drawRoundRectComplex = function(x, y, w, h, radiusTL, radiusTR, radiusBR, radiusBL) {
		var max = (w<h?w:h)/2;
		var mTL=0, mTR=0, mBR=0, mBL=0;
		if (radiusTL < 0) { radiusTL *= (mTL=-1); }
		if (radiusTL > max) { radiusTL = max; }
		if (radiusTR < 0) { radiusTR *= (mTR=-1); }
		if (radiusTR > max) { radiusTR = max; }
		if (radiusBR < 0) { radiusBR *= (mBR=-1); }
		if (radiusBR > max) { radiusBR = max; }
		if (radiusBL < 0) { radiusBL *= (mBL=-1); }
		if (radiusBL > max) { radiusBL = max; }
		
		this._dirty = this._active = true;
		var arcTo=this._ctx.arcTo, lineTo=this._ctx.lineTo;
		this._activeInstructions.push(
			new Command(this._ctx.moveTo, [x+w-radiusTR, y]),
			new Command(arcTo, [x+w+radiusTR*mTR, y-radiusTR*mTR, x+w, y+radiusTR, radiusTR]),
			new Command(lineTo, [x+w, y+h-radiusBR]),
			new Command(arcTo, [x+w+radiusBR*mBR, y+h+radiusBR*mBR, x+w-radiusBR, y+h, radiusBR]),
			new Command(lineTo, [x+radiusBL, y+h]),
			new Command(arcTo, [x-radiusBL*mBL, y+h+radiusBL*mBL, x, y+h-radiusBL, radiusBL]),
			new Command(lineTo, [x, y+radiusTL]),
			new Command(arcTo, [x-radiusTL*mTL, y-radiusTL*mTL, x+radiusTL, y, radiusTL]),
			new Command(this._ctx.closePath)
		);
		return this;
	};
	
	/**
	 * Draws a circle with the specified radius at (x, y).
	 *
	 *      var g = new Graphics();
	 *	    g.setStrokeStyle(1);
	 *	    g.beginStroke(Graphics.getRGB(0,0,0));
	 *	    g.beginFill(Graphics.getRGB(255,0,0));
	 *	    g.drawCircle(0,0,3);
	 *
	 *	    var s = new Shape(g);
	 *		s.x = 100;
	 *		s.y = 100;
	 *
	 *	    stage.addChild(s);
	 *	    stage.update();
	 *
	 * @method drawCircle
	 * @param {Number} x x coordinate center point of circle.
	 * @param {Number} y y coordinate center point of circle.
	 * @param {Number} radius Radius of circle.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.drawCircle = function(x, y, radius) {
		this.arc(x, y, radius, 0, Math.PI*2);
		return this;
	};
	
	/**
	 * Draws an ellipse (oval) with a specified width (w) and height (h). Similar to {{#crossLink "Graphics/drawCircle"}}{{/crossLink}},
	 * except the width and height can be different.
	 * @method drawEllipse
	 * @param {Number} x x coordinate center point of ellipse.
	 * @param {Number} y y coordinate center point of ellipse.
	 * @param {Number} w height (horizontal diameter) of ellipse. The horizontal radius will be half of this number.
	 * @param {Number} h width (vertical diameter) of ellipse. The vertical radius will be half of this number.
	 * @return {Graphics} The Graphics instance the method is called on (useful for chaining calls.)
	 **/
	p.drawEllipse = function(x, y, w, h) {
		this._dirty = this._active = true;
		var k = 0.5522848;
		var ox = (w / 2) * k;
		var oy = (h / 2) * k;
		var xe = x + w;
		var ye = y + h;
		var xm = x + w / 2;
		var ym = y + h / 2;
			
		this._activeInstructions.push(
			new Command(this._ctx.moveTo, [x, ym]),
			new Command(this._ctx.bezierCurveTo, [x, ym-oy, xm-ox, y, xm, y]),
			new Command(this._ctx.bezierCurveTo, [xm+ox, y, xe, ym-oy, xe, ym]),
			new Command(this._ctx.bezierCurveTo, [xe, ym+oy, xm+ox, ye, xm, ye]),
			new Command(this._ctx.bezierCurveTo, [xm-ox, ye, x, ym+oy, x, ym])
		);
		return this;
	};
	
	/**
	 * ポイントサイズが0より大きい場合は星型、またはポイントサイズが0である場合は指定した頂点数の正多角形を描画します。
	 * 例えば、次のコードでは中心が100、100、半径が50の、慣れ親しんだ五芒星のシェイプを描画します：
	 *      myGraphics.beginFill("#FF0").drawPolyStar(100, 100, 50, 5, 0.6, -90);
	 *      // 注意: -90では最初の点が垂直になります
	 *
	 * @method drawPolyStar
	 * @param {Number} シェイプの中心のx座標。
	 * @param {Number} シェイプの中心のy座標。
	 * @param {Number} radius シェイプの外半径。
	 * @param {Number} sides 星、または多角形の側面にある点の数。
	 * @param {Number} pointSize 星の各点の尖り具合（谷）の深さ。pointSizeが0の場合、正多角形が描画されます(谷がない), pointSizeが1の場合、無限に尖っていることになるため、なにも描画されません。
	 * @param {Number} angle 最初の点/コーナーの角度。 例えば0の場合は、中央の右側にある最初の点が直接描画されます。
	 * @return {Graphics} メソッドが呼び出されたGraphicインスタンス (連鎖した呼び出しに有用)。
	 **/
	p.drawPolyStar = function(x, y, radius, sides, pointSize, angle) {
		this._dirty = this._active = true;
		if (pointSize == null) { pointSize = 0; }
		pointSize = 1-pointSize;
		if (angle == null) { angle = 0; }
		else { angle /= 180/Math.PI; }
		var a = Math.PI/sides;
		
		this._activeInstructions.push(new Command(this._ctx.moveTo, [x+Math.cos(angle)*radius, y+Math.sin(angle)*radius]));
		for (var i=0; i<sides; i++) {
			angle += a;
			if (pointSize != 1) {
				this._activeInstructions.push(new Command(this._ctx.lineTo, [x+Math.cos(angle)*radius*pointSize, y+Math.sin(angle)*radius*pointSize]));
			}
			angle += a;
			this._activeInstructions.push(new Command(this._ctx.lineTo, [x+Math.cos(angle)*radius, y+Math.sin(angle)*radius]));
		}
		return this;
	};
	
	/**
	 * 圧縮されたエンコードパスの文字列を、連続した描画命令にデコードします。
	 * このフォーマットは人間が読み取ることを意図しておらず、オーサリングツールで使用されます。
	 * このフォーマットではbase64文字セットを使用しています。各文字は連続する描画命令を定義するための6ビット文字に変換されます。
	 *
	 * 各コマンドは、単一の"ヘッダー"文字と、それに続くxおよびy座標の値を交互に繋げた変数から構成された文字列に圧縮されます。
	 * ヘッダービットは左から右へ読みます(ほとんどの場合は右端ビットまで):1～3ビットは、操作の種類を指定します。
	 * (0-moveTo, 1-lineTo, 2-quadraticCurveTo, 3-bezierCurveTo, 4-closePath, 5-7 未使用)
	 * ビット4は座標の値に12ビット（2文字）または18ビット(3文字)のどちらを使用するかを示します。5と6のビットは現在未使用です。
	 *
	 * ヘッダに続くのは、0（closePath）、2（moveTo, LINETO）、4（quadraticCurveTo）、または6（bezierCurveTo）のパラメータです。
	 * これらのパラメータは、2または3文字によって表される（コマンド文字のビット4で示されます）、x/y座標を交互に並べたものです。
	 * これらの文字は、1ビットの符号（1は負、0が正）と、それに続く11（2文字）または17（3文字）ビットの整数値から構成されています。
	 * 全ての座標値は、1ピクセルの1/10の単位です。
	 * 絶対値による移動操作の場合を除き、この値は、以前のxまたはy位置からの相対値です（適切なものが選択されます）。
	 *
	 * 例えば、"A3cAAMAu4AAA"の文字列は、-150,0から始まり150,0で終わる直線を表します。
	 * <br />A - bits 000000. 最初の3ビット(000)はmoveTo命令を示します。ビット4(0)はパラメータごとに2文字であることを示します。
	 * <br />n0 - 110111011100. xの絶対値は-150.0pxです。最初のビットは負の値であることを示し、残りのビット列は1ピクセルの1/10の単位で1500であることを示します。
	 * <br />AA - 000000000000. yの絶対座標は0です。
	 * <br />I - 001100. 最初の3ビット(001)はlineTo命令を示します。ビット4(1)はパラメータごとに3文字であることを示します。
	 * <br />Au4 - 000000101110111000. xの相対値は300.0pxです。これは前のx座標である-150.0pxに加算され、絶対座標では+150.0pxになります。
	 * <br />AAA - 000000000000000000. yの相対値は0です。
	 * 
	 * @method decodePath
	 * @param {String} str デコードするパス文字列。
	 * @return {Graphics} メソッドが呼び出されたGraphicインスタンス (連鎖した呼び出しに有用)。
	 **/
	p.decodePath = function(str) {
		var instructions = [this.moveTo, this.lineTo, this.quadraticCurveTo, this.bezierCurveTo, this.closePath];
		var paramCount = [2, 2, 4, 6, 0];
		var i=0, l=str.length;
		var params = [];
		var x=0, y=0;
		var base64 = Graphics.BASE_64;
		
		while (i<l) {
			var c = str.charAt(i);
			var n = base64[c];
			var fi = n>>3; // highest order bits 1-3 code for operation.
			var f = instructions[fi];
			// check that we have a valid instruction & that the unused bits are empty:
			if (!f || (n&3)) { throw("bad path data (@"+i+"): "+c); }
			var pl = paramCount[fi];
			if (!fi) { x=y=0; } // move operations reset the position.
			params.length = 0;
			i++;
			var charCount = (n>>2&1)+2;  // 4th header bit indicates number size for this operation.
			for (var p=0; p<pl; p++) {
				var num = base64[str.charAt(i)];
				var sign = (num>>5) ? -1 : 1;
				num = ((num&31)<<6)|(base64[str.charAt(i+1)]);
				if (charCount == 3) { num = (num<<6)|(base64[str.charAt(i+2)]); }
				num = sign*num/10;
				if (p%2) { x = (num += x); }
				else { y = (num += y); }
				params[p] = num;
				i += charCount;
			}
			f.apply(this,params);
		}
		return this;
	};
	
	/**
	 * Graphicsインスタンスの複製を返します。
	 * @method clone
	 * @return {Graphics} 現在のGraphicsインスタンスの複製。
	 **/
	p.clone = function() {
		var o = new Graphics();
		o._instructions = this._instructions.slice();
		o._activeInstructions = this._activeInstructions.slice();
		o._oldInstructions = this._oldInstructions.slice();
		if (this._fillInstructions) { o._fillInstructions = this._fillInstructions.slice(); }
		if (this._strokeInstructions) { o._strokeInstructions = this._strokeInstructions.slice(); }
		if (this._strokeStyleInstructions) { o._strokeStyleInstructions = this._strokeStyleInstructions.slice(); }
		o._active = this._active;
		o._dirty = this._dirty;
		return o;
	};
		
	/**
	 * このオブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} このインスタンスの文字列表現。
	 **/
	p.toString = function() {
		return "[Graphics]";
	};
	
	
// 小さいAPI:
	/** moveToへのショートカット。
	 * @method mt
	 * @protected
	 * @type {Function}
	 **/
	p.mt = p.moveTo;
	
	/** lineToへのショートカット。
	 * @method lt
	 * @protected
	 * @type {Function}
	 **/
	p.lt = p.lineTo;
	
	/** arcToへのショートカット。
	 * @method at
	 * @protected
	 * @type {Function}
	 **/
	p.at = p.arcTo;
	
	/** bezierCurveToへのショートカット。
	 * @method bt
	 * @protected
	 * @type {Function}
	 **/
	p.bt = p.bezierCurveTo;
	
	/** quadraticCurveTo / curveToへのショートカット。
	 * @method qt
	 * @protected
	 * @type {Function}
	 **/
	p.qt = p.quadraticCurveTo;
	
	/** arcへのショートカット。
	 * @method a
	 * @protected
	 * @type {Function}
	 **/
	p.a = p.arc;
	
	/** rectへのショートカット。
	 * @method r
	 * @protected
	 * @type {Function}
	 **/
	p.r = p.rect;
	
	/** closePathへのショートカット。
	 * @method cp
	 * @protected
	 * @type {Function}
	 **/
	p.cp = p.closePath;
	
	/** clearへのショートカット。
	 * @method c
	 * @protected
	 * @type {Function}
	 **/
	p.c = p.clear;
	
	/** beginFillへのショートカット。
	 * @method f
	 * @protected
	 * @type {Function}
	 **/
	p.f = p.beginFill;
	
	/** beginLinearGradientFillへのショートカット。
	 * @method lf
	 * @protected
	 * @type {Function}
	 **/
	p.lf = p.beginLinearGradientFill;
	
	/** beginRadialGradientFillへのショートカット。
	 * @method rf
	 * @protected
	 * @type {Function}
	 **/
	p.rf = p.beginRadialGradientFill;
	
	/** beginBitmapFillへのショートカット。
	 * @method bf
	 * @protected
	 * @type {Function}
	 **/
	p.bf = p.beginBitmapFill;
	
	/** endFillへのショートカット。
	 * @method ef
	 * @protected
	 * @type {Function}
	 **/
	p.ef = p.endFill;
	
	/** setStrokeStyleへのショートカット。
	 * @method ss
	 * @protected
	 * @type {Function}
	 **/
	p.ss = p.setStrokeStyle;
	
	/** beginStrokeへのショートカット。
	 * @method s
	 * @protected
	 * @type {Function}
	 **/
	p.s = p.beginStroke;
	
	/** beginLinearGradientStrokeへのショートカット。
	 * @method ls
	 * @protected
	 * @type {Function}
	 **/
	p.ls = p.beginLinearGradientStroke;
	
	/** beginRadialGradientStrokeへのショートカット。
	 * @method rs
	 * @protected
	 * @type {Function}
	 **/
	p.rs = p.beginRadialGradientStroke;
	
	/** beginBitmapStrokeへのショートカット。
	 * @method bs
	 * @protected
	 * @type {Function}
	 **/
	p.bs = p.beginBitmapStroke;
	
	/** endStrokeへのショートカット。
	 * @method es
	 * @protected
	 * @type {Function}
	 **/
	p.es = p.endStroke;
	
	/** drawRectへのショートカット。
	 * @method dr
	 * @protected
	 * @type {Function}
	 **/
	p.dr = p.drawRect;
	
	/** drawRoundRectへのショートカット。
	 * @method rr
	 * @protected
	 * @type {Function}
	 **/
	p.rr = p.drawRoundRect;
	
	/** drawRoundRectComplexへのショートカット。
	 * @method rc
	 * @protected
	 * @type {Function}
	 **/
	p.rc = p.drawRoundRectComplex;
	
	/** drawCircleへのショートカット。
	 * @method dc
	 * @protected
	 * @type {Function}
	 **/
	p.dc = p.drawCircle;
	
	/** drawEllipseへのショートカット。
	 * @method de
	 * @protected
	 * @type {Function}
	 **/
	p.de = p.drawEllipse;
	
	/** drawPolyStarへのショートカット。
	 * @method dp
	 * @protected
	 * @type {Function}
	 **/
	p.dp = p.drawPolyStar;
	
	/** decodePathへのショートカット。
	 * @method p
	 * @protected
	 * t@ype Function
	 **/
	p.p = p.decodePath;
	
	
// プライベートメソッド:
	/**
	 * @method _updateInstructions
	 * @protected
	 **/
	p._updateInstructions = function() {
		this._instructions = this._oldInstructions.slice();
		this._instructions.push(Graphics.beginCmd);
		
		this._instructions.push.apply(this._instructions, this._activeInstructions);
		
		if (this._fillInstructions) { this._instructions.push.apply(this._instructions, this._fillInstructions); }
		if (this._strokeInstructions) {
			if (this._strokeStyleInstructions) {
				this._instructions.push.apply(this._instructions, this._strokeStyleInstructions);
			}
			this._instructions.push.apply(this._instructions, this._strokeInstructions);
			if (this._ignoreScaleStroke) {
				this._instructions.push(
					new Command(this._ctx.save, [], false),
					new Command(this._ctx.setTransform, [1,0,0,1,0,0], false),
					Graphics.strokeCmd,
					new Command(this._ctx.restore, [], false)
				);
			} else {
				this._instructions.push(Graphics.strokeCmd);
			}
		}
	};
	
	/**
	 * @method _newPath
	 * @protected
	 **/
	p._newPath = function() {
		if (this._dirty) { this._updateInstructions(); }
		this._oldInstructions = this._instructions;
		this._activeInstructions = [];
		this._active = this._dirty = false;
	};
	
	// プロパティを設定するコマンドの作成に使用します:
	/**
	 * プロパティを設定するコマンドの作成に使用します
	 * @method _setProp
	 * @param {String} name
	 * @param {String} value
	 * @protected
	 **/
	p._setProp = function(name, value) {
		this[name] = value;
	};

createjs.Graphics = Graphics;
}());

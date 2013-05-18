/*
* Text
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
 * ディスプレイリストに１行もしくはそれ以上の行のダイナミックテキスト（ユーザ編集不可）を表示します。行ラップサポート
 * （lineWidthを使用して）は、非常に基本的で、スペースもしくはタブのみでラップします。Textの代替として、キャンバスの
 * 上もしくは下に、{{#crossLink "DisplayObject/localToGlobal"}}{{/crossLink}} もしくは、{{#crossLink "DOMElement"}}{{/crossLink}}
 * を使って相対的に、HTMLテキストを置くこともできます。
 *
 * <b>Textは、HTMLテキストをサポートしていないことに注意してください。そして、一度に１つのフォントしか表示できません。</b>
 * 複数フォントのスタイルを使うためには、複数のテキストインスタンスを作成し、それらをマニュアルで位置付ける必要があります。
 *
 * <h4>例</h4>
 *      var text = new createjs.Text("Hello World", "20px Arial", #ff7700");
 *      text.x = 100;
 *      text.textBaseline = "alphabetic";
 *
 * CreateJSのTextは、WEBフォント（キャンバスと同じルール）をサポートしています。フォントは、それが表示される前に
 * ロードされ、ブラウザによってサポートされていなければいけません。
 *
 * @class Text
 * @extends DisplayObject
 * @constructor
 * @param {String} [text] 表示するテキスト。
 * @param {String} [font] 使用するフォントスタイル。CSSのfont属性で有効な値が指定できます（例. "bold 36px Arial"）。
 * @param {String} [color] テキストに描画する色。 CSSの color属性で有効な値が指定できます（例. "#F00", "red", or "#FF0000")。
 **/
var Text = function(text, font, color) {
  this.initialize(text, font, color);
}
var p = Text.prototype = new createjs.DisplayObject();


	/**
	 * @property _workingContext
	 * @type CanvasRenderingContext2D
	 * @private
	 **/
	Text._workingContext = (createjs.createCanvas?createjs.createCanvas():document.createElement("canvas")).getContext("2d");

// パブリックプロパティ:
	/**
	 * 表示するテキスト。
	 * @property text
	 * @type String
	 **/
	p.text = "";
	
	/**
	 * 使用するフォントスタイル。CSSのfont属性で有効な値が指定できます（例. "bold 36px Arial"）。 
	 * @property font
	 * @type String
	 **/
	p.font = null;
	
	/**
	 * テキストに描画する色。 CSSの color属性で有効な値が指定できます（例. "#F00"）。ディフォルトは、"#000"。
	 * @property color
	 * @type String
	 **/
	p.color = "#000";
	
	/**
	 * 水平方向のテキストアライメント。"start", "end", "left", "right", "center"のいずれか。
	 * 詳細は、次を参照 
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#text-styles">
	 * whatwg spec</a>。 ディフォルトは、"left"。
	 * @property textAlign
	 * @type String
	 **/
	p.textAlign = "left";
	
	/** フォント上の垂直方向のアライメントポイント。"top", "hanging", "middle", "alphabetic", "ideographic"
	 * もしくは"bottom"のいずれか。詳細な情報は次を参照
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#text-styles">
	 * whatwg spec</a>。ディフォルトは、"top"。
	 * @property textBaseline
	 * @type String
	*/
	p.textBaseline = "top";
	
	/** テキストを描画するための最大幅。もし、maxWidthが指定された場合は(not null)、テキストはこの幅に合うように
	 * 縮小されます。詳細な情報は、次を参照
	 * <a href="http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#text-styles">
	 * whatwg spec</a>.
	 * @property maxWidth
	 * @type Number
	*/
	p.maxWidth = null;
	
	/** trueなら、テキストはストローク（outline)として描画されます。falseなら、テキストは塗りつぶされます。
	 * @property outline
	 * @type Boolean
	 **/
	p.outline = false;
	
	/** 複数行テキストのための行の高さ（ベースライン間の垂直間隔）を示します。nullもしくは、0なら、
	 * getMeasuredLineHeightの値が使用されます。
	 * @property lineHeight
	 * @type Number
	 **/
	p.lineHeight = 0;
	
	/**
	 * 複数行にラップされる前のテキストの１行のための最大幅を示します。nullなら、
	 * テキストはラップされません。
	 * @property lineWidth
	 * @type Number
	 **/
	p.lineWidth = null;
	
// コンストラクタ:
	/**
	 * @property DisplayObject_initialize
	 * @private
	 * @type Function
	 **/
	p.DisplayObject_initialize = p.initialize;
	
	/** 
	 * 初期化メソッド。
	 * @method initialize
	 * @protected
	*/
	p.initialize = function(text, font, color) {
		this.DisplayObject_initialize();
		this.text = text;
		this.font = font;
		this.color = color ? color : "#000";
	}
	
	/**
	 * もし、キャンバスに描画する場合は、ディスプレイオブジェクトが可視かどうかを示すtrueもしくはfalseを返します。
	 * これはステージの境界内で可視かどうかを考慮することはありません。
	 * NOTE: このメソッドは、高度な目的で使用する場合に有用かも知れませんが、主に内部で使用するためのものです。
	 * @method isVisible
	 * @return {Boolean} キャンバスに描画される場合に、ディスプレイオブジェクトが可視かどうか。
	 **/
	p.isVisible = function() {
		var hasContent = this.cacheCanvas || (this.text != null && this.text !== "");
		return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
	}

	/**
	 * @property DisplayObject_draw
	 * @private
	 * @type Function
	 **/
	p.DisplayObject_draw = p.draw;
	
	/**
	 * visible, alpha, shadow, transformを無視して、指定したコンテキストにテキストを描画します。
	 * 描画が処理された場合はtrueを返します（機能性をオーバーライドするのに有用です）。
	 * NOTE: このメソッドは、高度な目的で使用する場合に有用かも知れませんが、主に内部で使用するためのものです。
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx 描画するキャンバス2Dコンテキストオブジェクト。
	 * @param {Boolean} ignoreCache 描画処理が現在のキャッシュを無視するかどうかを示します。
	 * たとえば、キャッシュを描画するのに使用されます（それ自身に戻って既存のキャッシュを描画することを防ぐために）。
	 **/
	p.draw = function(ctx, ignoreCache) {
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }
		
		if (this.outline) { ctx.strokeStyle = this.color; }
		else { ctx.fillStyle = this.color; }
		ctx.font = this.font;
		ctx.textAlign = this.textAlign||"start";
		ctx.textBaseline = this.textBaseline||"alphabetic";

		this._drawText(ctx);
		return true;
	}
	
	/**
	 * ラッピングをせずにテキストの測定されたtransformなしの幅を返します。
	 * @method getMeasuredWidth
	 * @return {Number} テキストの測定されたtransformなしの幅。
	 **/
	p.getMeasuredWidth = function() {
		return this._getWorkingContext().measureText(this.text).width;
	}

	/**
	 * lineHeightプロパティを無視して、テキストのおおよその行の高さを返します。これは、大部分のフォントの
	 * おおよそのem、文字"M"の幅に1.2をかけたものに基づいています。
	 * @method getMeasuredLineHeight
	 * @return {Number} lineHeightプロパティを無視したテキストのおおよその行の高さ。 これは、大部分のフォントの
	 * おおよそのem、文字"M"の幅に1.2をかけたものに基づいています。
	 **/
	p.getMeasuredLineHeight = function() {
		return this._getWorkingContext().measureText("M").width*1.2;
	}

	/**
	 * lineHeight（指定されていれば）もしくはgetMeasuredLineHeight()のいずれかに対して行数をかけて
	 * 複数行のテキストのおおよその高さを返します。この操作は、関連するCPUコストを持っている、テキストの
	 * 流れるロジックが実行する必要があることに注意してください。
	 * @method getMeasuredHeight
	 * @return {Number} 描画される複数行のおおよその高さ。
	 **/
	p.getMeasuredHeight = function() {
		return this._drawText()*(this.lineHeight||this.getMeasuredLineHeight());
	}
	
	/**
	 * テキストインスタンスのクローンを返します。
	 * @method clone
	 * @return {Text} テキストインスタンスのクローン。
	 **/
	p.clone = function() {
		var o = new Text(this.text, this.font, this.color);
		this.cloneProps(o);
		return o;
	}
		
	/**
	 * このオブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} インスタンスの文字列表現。
	 **/
	p.toString = function() {
		return "[Text (text="+  (this.text.length > 20 ? this.text.substr(0, 17)+"..." : this.text) +")]";
	}
	
// プライベートメソッド:
	
	/**
	 * @property DisplayObject_cloneProps
	 * @private
	 * @type Function
	 **/
	p.DisplayObject_cloneProps = p.cloneProps;

	/** 
	 * @method cloneProps
	 * @param {Text} o
	 * @protected 
	 **/
	p.cloneProps = function(o) {
		this.DisplayObject_cloneProps(o);
		o.textAlign = this.textAlign;
		o.textBaseline = this.textBaseline;
		o.maxWidth = this.maxWidth;
		o.outline = this.outline;
		o.lineHeight = this.lineHeight;
		o.lineWidth = this.lineWidth;
	}

	/** 
	 * @method _getWorkingContext
	 * @protected 
	 **/
	p._getWorkingContext = function() {
		var ctx = Text._workingContext;
		ctx.font = this.font;
		ctx.textAlign = this.textAlign||"start";
		ctx.textBaseline = this.textBaseline||"alphabetic";
		return ctx;
	}
	 
	/**
	 * 複数行のテキストを描画します。
	 * @method _getWorkingContext
	 * @protected
	 * @return {Number} 描画した行数。
	 **/
	p._drawText = function(ctx) {
		var paint = !!ctx;
		if (!paint) { ctx = this._getWorkingContext(); }
		var lines = String(this.text).split(/(?:\r\n|\r|\n)/);
		var lineHeight = this.lineHeight||this.getMeasuredLineHeight();
		var count = 0;
		for (var i=0, l=lines.length; i<l; i++) {
			var w = ctx.measureText(lines[i]).width;
			if (this.lineWidth == null || w < this.lineWidth) {
				if (paint) { this._drawTextLine(ctx, lines[i], count*lineHeight); }
				count++;
				continue;
			}

			// split up the line
			var words = lines[i].split(/(\s)/);
			var str = words[0];
			for (var j=1, jl=words.length; j<jl; j+=2) {
				// Line needs to wrap:
				if (ctx.measureText(str + words[j] + words[j+1]).width > this.lineWidth) {
					if (paint) { this._drawTextLine(ctx, str, count*lineHeight); }
					count++;
					str = words[j+1];
				} else {
					str += words[j] + words[j+1];
				}
			}
			if (paint) { this._drawTextLine(ctx, str, count*lineHeight); } // Draw remaining text
			count++;
		}
		return count;
	}
	
	/** 
	 * @method _drawTextLine
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {Text} text
	 * @param {Number} y
	 * @protected 
	 **/
	p._drawTextLine = function(ctx, text, y) {
		// Chrome 17 will fail to draw the text if the last param is included but null, so we feed it a large value instead:
			if (this.outline) { ctx.strokeText(text, 0, y, this.maxWidth||0xFFFF); }
			else { ctx.fillText(text, 0, y, this.maxWidth||0xFFFF); }
		
	}

createjs.Text = Text;
}());
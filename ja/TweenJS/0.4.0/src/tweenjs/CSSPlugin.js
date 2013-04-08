/*
* CSSPlugin
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
 * 数値のCSS文字列プロパティ（例. top, left）と共に動作するTweenJSプラグインです。
 * TweenJSがロードされた後に単純にinstallを使用します:
 *
 *      createjs.CSSPlugin.install();
 *
 * CSSプロパティは、<code>cssSuffixMap</code>プロパティを修正することで調整できます。
 * 現在は、top、left、bottom、right、width、heightは、後ろに "px"サフィックスをつけます。
 * @class CSSPlugin
 * @constructor
 **/
var CSSPlugin = function() {
  throw("CSSPlugin cannot be instantiated.")
}
	
// 静的インタフェース:
	/** 
	 * CSSトゥイーンのためのディフォルトのサフィックスマップを定義します。これは、個々のトゥイーンにcssSuffixMap値を
	 * 指定することで、トゥイーン基盤ごとに上書き可能です。このオブジェクトは、それらのプロパティが読み出し、または
	 * 設定されるときに、サフィックスにCSSプロパティ名をマップします。たとえば、フォーム{top:"px"}のマップは、"top"
	 * CSSプロパティがトゥイーンするときに"px"サフィックスを指定すべきことを示します（例. target.style.top = "20.5px"）。
	 * これは、"css"コンフィグプロパティをtrueに設定すると共にトゥイーンに適用します。
	 * @property cssSuffixMap
	 * @type Object
	 * @static
	 **/
	CSSPlugin.cssSuffixMap = {top:"px",left:"px",bottom:"px",right:"px",width:"px",height:"px",opacity:""};
	
	/**
	 * @property priority
	 * @protected
	 * @static
	 **/
	CSSPlugin.priority = -100; // とても低いプライオリティ、最後に実行するべき

	/**
	 * TweenJSと共に使用するために、このプラグインをインストールします。このプラグインを有効にするために
	 * TweenJSがロードされた後で一度、これを呼び出してください。
	 * @method install
	 * @static
	 **/
	CSSPlugin.install = function() {
		var arr = [], map = CSSPlugin.cssSuffixMap;
		for (var n in map) { arr.push(n); }
		createjs.Tween.installPlugin(CSSPlugin, arr);
	}
	
	
	/**
	 * @method init
	 * @protected
	 * @static
	 **/
	CSSPlugin.init = function(tween, prop, value) {
		var sfx0,sfx1,style,map = CSSPlugin.cssSuffixMap;
		if ((sfx0 = map[prop]) == null || !(style = tween.target.style)) { return value; }
		var str = style[prop];
		if (!str) { return 0; } // no style set.
		var i = str.length-sfx0.length;
		if ((sfx1 = str.substr(i)) != sfx0) {
			throw("CSSPlugin Error: Suffixes do not match. ("+sfx0+":"+sfx1+")");
		} else {
			return parseInt(str.substr(0,i));
		}
	}
	
	/**
	 * @method step
	 * @protected
	 * @static
	 **/
	CSSPlugin.step = function(tween, prop, startValue, endValue, injectProps) {
		// unused
	}
	
	
	/**
	 * @method tween
	 * @protected
	 * @static
	 **/
	CSSPlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end) {
		var style,map = CSSPlugin.cssSuffixMap;
		if (map[prop] == null || !(style = tween.target.style)) { return value; }
		style[prop] = value+map[prop];
		return createjs.Tween.IGNORE;
	}

// パブリックプロパティ:

// プライベートプロパティ:
	
// コンストラクタ:
	
// パブリックメソッド:


// プライベートメソッド:
	
createjs.CSSPlugin = CSSPlugin;
}());

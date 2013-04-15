/*
* SamplePlugin
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
 * TweenJSプラグインのサンプル。このプラグインは、実際には決してトゥイーンに影響を与えません。単にTweenJSプラグインの
 * 作り方を記録することを意図するものです。インライン・コメントのためにコードを見てください。
 *
 * TweenJSプラグインは単に、１つのプロパティ(priority)と３つのメソッド (init, step, and tween)を公開しているだけのオブジェクトです。
 * 通常、プラグインは同様に<code>install</code>メソッドも公開しています。けれども、これは厳密には必要ありません。
 * @class SamplePlugin
 * @constructor
 **/
var SamplePlugin = function() {
  throw("SamplePlugin cannot be instantiated.")
};
	
// 静的インタフェース:
	/**
	 * TweenJSによって、このプラグインを呼ぶときに決定するために使われます。高プライオリティのプラグインは、
	 * 低プライオリティのプラグインの前に呼ばれるメソッドを持っています。priorityの値は、任意の正または負の数値です。
	 * @property priority
	 * @static
	 **/
	SamplePlugin.priority = 0;

	/**
	 * TweenJSと一緒に使用するために、このプラグインをインストールします。そして、このプラグインが扱うプロパティのリストを
	 * 登録します。このプラグインを有効にするために、TweenJSがロードされた後で一度、これを呼び出してください。
	 * @method install
	 * @static
	 **/
	SamplePlugin.install = function() {
		// "test"プロパティで動作するためにこのプラグインを登録します。
		createjs.Tween.installPlugin(SamplePlugin, ["test"]);
	};
	
	/**
	 * このプラグインが登録される新しいトゥイーンプロパティが初期化するときにTweenJSによって呼ばれます。
	 * 一般的に、<code>Plugin.init</code>呼び出しは、<code>Plugin.to</code>に続いて即座に行われます。
	 * @method init
	 * @param {Tween} tween 関連するトゥイーンインスタンス。
	 * @param {String} prop 初期化されるプロパティの名前。
	 * @param {any} value トゥインのターゲット上のプロパティの現在値。
	 * @return {any} プロパティの開始トゥイーン値。多くの場合、単に値のパラメータを返します。
	 * しかし、いくつかのプラグインは開始値の変更が必要になるかもしれません。
	 * @static
	 **/
	SamplePlugin.init = function(tween, prop, value) {
		console.log("init", prop, value);
		
		// 修正なしのプロパティ値を返します:
		return value;
	};
	
	/**
	 * プラグインが登録されるプロパティを含むトゥイーンに新しいステップが追加されるときにTweenJSによって呼び出されます。
	 * （すなわち、新しい"to"アクションがトゥイーンに追加されるとき）。
	 * @param {Tween} tween 関連するトゥイーンインスタンス。
	 * @param {String} prop トゥイーンされるプロパティの名前。
	 * @param {any} startValue 始まりのステップにおけるプロパティの値。もし、これが最初のステップなら、初期値と同じになります。
	 * もしくは、そうでないなら、前のステップのendValueと同じになります。
	 * @param {Object} injectProps プラグインが、このステップ上で更新すべき他のプロパティに追加できる汎用オブジェクト。
	 * @param {any} endValue 最後のステップにおけるプロパティの値。
	 * @static
	 **/
	SamplePlugin.step = function(tween, prop, startValue, endValue, injectProps) {
		console.log("to: ", prop, startValue, endValue);
	};
	
	/**
	 * このプラグインが登録されるトゥイーンプロパティを進めるときに呼び出されます。
	 * @method tween
	 * @param {Tween} tween 関連するトゥイーンインスタンス。
	 * @param {String} prop トゥイーンされるプロパティの名前。
	 * @param {any} value TweenJSによって計算された、プロパティの現在のトゥイーンされた値。
	 * @param {Object} startValues 現在のステップの始まりにおけるすべてのプロパティのハッシュ値。startValues[prop]を
	 * 使うことで現在のプロパティの開始値にアクセスできます。
	 * @param {Object} endValues 現在のステップの終わりにおけるすべてのプロパティのハッシュ値。
	 * @param {Number} ratio 現在のステップでのイースのプログレスを示す値。この数値は通常0と1の間になります。
	 * けれども、いくつかのイースはこの範囲外の値を生成します。
	 * @param {Boolean} wait 現在のステップが"wait"ステップかどうかを示します。
	 * @param {Boolean} end トゥイーンが終わりに到達したかどうかを示します。
	 * @return {any} ターゲットプロパティに代入された値を返します。たとえば、<code>Math.round(value)</code>は、
	 * 整数としての計算値を代入します。Tween.IGNOREは、ターゲットプロパティに値を代入するのを防ぎます。
	 * @static
	 **/
	SamplePlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end) {
		// ratioは、イースされたratio
		console.log("tween", prop, value, ratio, wait, end);
		
		// 修正されていないトゥイーン値を返します（ディフォルトのトゥイーンのふるまいを使います）:
		return value;
	};
	
createjs.SamplePlugin = SamplePlugin;
}());

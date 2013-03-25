/*
* Timeline
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
 * Timelineクラスは、複数のトゥイーンを同期し、１つのグループとして管理するようにします。
 * タイムラインがループしている場合は、トゥイーンの"loop"プロパティがfalseになっていてもタイムライン上のトゥイーンが
 * ループするようにみえる場合があることに注意してください。
 * @class Timeline
 * @param tweens このタイムラインに追加するトゥイーンの配列。詳しくは addTweenを見てください。
 * @param labels gotoAndPlay/Stop用のラベルを定義するオブジェクト。 
 * 詳細は {{#crossLink "Timeline/setLabels"}}{{/crossLink}}を見てください。
 * @param props このトゥイーンインスタンスに適用する構成プロパティ (ex. {loop:true})。
 * すべてのプロパティのディフォルトは falseとなります。
 * サポートされるプロパティは次のとおり:<UL>
 *    <LI> loop: このトゥイーンにloopプロパティを設定します。</LI>
 *    <LI> useTicks: すべての時間にミリ秒ではなく tickを使用します。</LI>
 *    <LI> ignoreGlobalPause: このトゥイーンに ignoreGlobalPause を設定します。</LI>
 *    <LI> paused: 一時停止されたトゥイーンが開始するかどうかを示します。</LI>
 *    <LI> position: このタイムラインの最初の位置を示します。</LI>
 *    <LI> onChanged: このタイムラインの onChange ハンドラを示します。</LI>
 * </UL>
 * @constructor
 **/
var Timeline = function(tweens, labels, props) {
  this.initialize(tweens, labels, props);
}
var p = Timeline.prototype;

// パブリックプロパティ:
	
	/**
	 * グローバルポーズがアクティブのとき、このタイムラインの再生を継続します。
	 * @property ignoreGlobalPause
	 * @type Boolean
	 **/
	p.ignoreGlobalPause = false;
	
	/**
	 * ミリ秒（useTicksがtrueの場合はtick）単位でこのタイムラインのトータルの時間を示すリードオンリープロパティ。
	 * この値はタイムラインの変更に応じて通常自動的に更新されます。詳しくは updateDuration を見てください。
	 * @property duration
	 * @type Number
	 **/
	p.duration = 0;
	
	/**
	 * trueなら、タイムラインは最後に到達したときにループします。propsパラメータ経由で設定できます。
	 * @property loop
	 * @type Boolean
	 **/
	p.loop = false;
	
	/**
	 * このタイムラインの位置が変わるたびに、このタイムラインインスタンスを参照する単一のパラメータと共に呼ばれます。
	 * @property onChange
	 * @type Function
	 **/
	p.onChange = null;
	
	/**
	 * リードオンリー。現在の正規化されたタイムラインの位置。これは常に0とdurationの間の値となります。
	 * このプロパティを直接変更することは、何の影響もありません。
	 * @property position
	 * @type Object
	 **/
	p.position = null;

// プライベートプロパティ:
	
	/**
	 * @property _paused
	 * @type Boolean
	 * @protected
	 **/
	p._paused = false;
	
	/**
	 * @property _tweens
	 * @type Array[Tween]
	 * @protected
	 **/
	p._tweens = null;
	
	/**
	 * @property _labels
	 * @type Array[String]
	 * @protected
	 **/
	p._labels = null;
	
	/**
	 * @property _prevPosition
	 * @type Number
	 * @protected
	 **/
	p._prevPosition = 0;
	
	/**
	 * @property _prevPos
	 * @type Number
	 * @protected
	 **/
	p._prevPos = -1;
	
	/**
	 * @property _useTicks
	 * @type Boolean
	 * @protected
	 **/
	p._useTicks = false;
	
// コンストラクタ:
	/** 
	* 初期化メソッド。
	* @method initialize
	* @protected
	**/
	p.initialize = function(tweens, labels, props) {
		this._tweens = [];
		if (props) {
			this._useTicks = props.useTicks;
			this.loop = props.loop;
			this.ignoreGlobalPause = props.ignoreGlobalPause;
			this.onChange = props.onChange;
		}
		if (tweens) { this.addTween.apply(this, tweens); }
		this.setLabels(labels);
		if (props&&props.paused) { this._paused=true; }
		else { createjs.Tween._register(this,true); }
		if (props&&props.position!=null) { this.setPosition(props.position, createjs.Tween.NONE); }
	}
	
// パブリックメソッド:
	/** 
	 * １つ以上のトゥイーン（もしくはタイムライン）をこのタイムラインに追加します。
	 * それらのトゥイーンは（通常のtickシステムから削除するために）一時停止し、このタイムラインによって管理されます。
	 * １つのトゥイーンを複数のタイムラインに追加することで、予期しないふるまいが生じます。
	 * @method addTween
	 * @param tween 追加するトゥイーン。複数の引数を受け入れます。
	 * @return Tween 指定された最初のトゥイーン。
	 **/
	p.addTween = function(tween) {
		var l = arguments.length;
		if (l > 1) {
			for (var i=0; i<l; i++) { this.addTween(arguments[i]); }
			return arguments[0];
		} else if (l == 0) { return null; }
		this.removeTween(tween);
		this._tweens.push(tween);
		tween.setPaused(true);
		tween._paused = false;
		tween._useTicks = this._useTicks;
		if (tween.duration > this.duration) { this.duration = tween.duration; }
		if (this._prevPos >= 0) { tween.setPosition(this._prevPos, createjs.Tween.NONE); }
		return tween;
	}

	/** 
	 * このタイムラインから１つ以上のトゥイーンを削除します。
	 * @method removeTween
	 * @param tween 削除されるトゥイーン。複数の引数を受け入れます。
	 * @return Boolean すべてのトゥイーンが正常に削除された場合に trueを返します。
	 **/
	p.removeTween = function(tween) {
		var l = arguments.length;
		if (l > 1) {
			var good = true;
			for (var i=0; i<l; i++) { good = good && this.removeTween(arguments[i]); }
			return good;
		} else if (l == 0) { return false; }
		var index = this._tweens.indexOf(tween);
		if (index != -1) {
			this._tweens.splice(index,1);
			if (tween.duration >= this.duration) { this.updateDuration(); }
			return true;
		} else { return false; }
	}
	
	/** 
	 * gotoAndPlay/Stopで使用されるラベルを追加します。
	 * @method addLabel
	 * @param label ラベル名。
	 * @param position このラベルが描画される位置。
	 **/
	p.addLabel = function(label, position) {
		this._labels[label] = position;
	}

	/** 
	 * gotoAndPlay/Stop用のラベルを定義します。以前に設定されたラベルを上書きします。
	 * @method addLabel
	 * @param o 書式 {labelName:time} （timeはミリ秒単位。useTicksがtrueの場合はtick単位。）でgotoAndPlay/Stop用のラベルを定義するオブジェクト。 
	 **/
	p.setLabels = function(o) {
		this._labels = o ?  o : {};
	}
	
	/** 
	 * 一時停止を解除し、指定された位置もしくはラベルにジャンプします。
	 * @method gotoAndPlay
	 * @param positionOrLabel ミリ秒単位（useTicksがtrueならtick）の位置。
	 **/
	p.gotoAndPlay = function(positionOrLabel) {
		this.setPaused(false);
		this._goto(positionOrLabel);
	}
	
	/** 
	 * このタイムラインを一時停止し、指定された位置もしくはラベルにジャンプします。
	 * @method gotoAndStop
	 * @param positionOrLabel ミリ秒単位（useTicksがtrueならtick）の位置もしくはジャンプするラベル。
	 **/
	p.gotoAndStop = function(positionOrLabel) {
		this.setPaused(true);
		this._goto(positionOrLabel);
	}
	
	/** 
	 * 指定された位置にタイムラインを進めます。
	 * @method setPosition
	 * @param value ミリ秒単位（useTicksがtrueならtick）でシークする位置。
	 * @param actionsMode どうアクションを扱うかを示す任意のパラメータ。詳細はTween.setPositionを見てください。
	 * @return Boolean タイムラインが完了された場合にtrueを返します。（すなわち、すべてのタイムラインが実行され、loopがfalse）
	 **/
	p.setPosition = function(value, actionsMode) {
		if (value < 0) { value = 0; }
		var t = this.loop ? value%this.duration : value;
		var end = !this.loop && value >= this.duration;
		if (t == this._prevPos) { return end; }
		this._prevPosition = value;
		this.position = this._prevPos = t; // in case an action changes the current frame.
		for (var i=0, l=this._tweens.length; i<l; i++) {
			this._tweens[i].setPosition(t, actionsMode);
			if (t != this._prevPos) { return false; } // an action changed this timeline's position.
		}
		if (end) { this.setPaused(true); }
		this.onChange&&this.onChange(this);
		return end;
	}
	
	/** 
	 * このタイムラインを一時停止もしくは再生します。
	 * @method setPaused
	 * @param value トゥイーンが一時停止されるべきか(true)、再生されるべきか(false)を示します。
	 **/
	p.setPaused = function(value) {
		this._paused = !!value;
		createjs.Tween._register(this, !value);
	}
	
	/** 
	 * タイムラインの時間を再計算します。
	 * トゥイーンが追加または削除される際に時間は自動的に更新されますが、このメソッドはトゥイーンがタイムラインに
	 * 追加された後で修正する場合に有益です。
	 * @method updateDuration
	 **/
	p.updateDuration = function() {
		this.duration = 0;
		for (var i=0,l=this._tweens.length; i<l; i++) {
			tween = this._tweens[i];
			if (tween.duration > this.duration) { this.duration = tween.duration; }
		}
	}
	
	/** 
	 * このタイムラインをミリ秒単位（useTicksがtrueの場合はtick）で指定した分だけ進めます。
	 * これは通常自動的にトゥイーンエンジンによって（Tween.tick経由で）呼ばれますが、上級者用に見せています。
	 * @method tick
	 * @param delta ミリ秒単位（useTicksがtrueの場合はtick）で進める時間。
	 **/
	p.tick = function(delta) {
		this.setPosition(this._prevPosition+delta);
	}
	 
	/** 
	 * 数値による位置が渡された場合、それは変更されることなく返されます。文字列が渡された場合、対応するフレーム
	 * ラベルが返されます。もしくは、一致するラベルがない場合は、nullが返されます。
	 * @method resolve
	 * @param positionOrLabel 数値による位置もしくはラベル文字列。
	 **/
	p.resolve = function(positionOrLabel) {
		var pos = parseFloat(positionOrLabel);
		if (isNaN(pos)) { pos = this._labels[positionOrLabel]; }
		return pos;
	}

	/**
	* このオブジェクトの文字列の表現を返します。
	* @method toString
	* @return {String} インスタンスの文字列表現。
	**/
	p.toString = function() {
		return "[Timeline]";
	}
	
	/**
	 * @method clone
	 * @protected
	 **/
	p.clone = function() {
		throw("Timeline can not be cloned.")
	}
	
// プライベートメソッド:
	/**
	 * @method _goto
	 * @protected
	 **/
	p._goto = function(positionOrLabel) {
		var pos = this.resolve(positionOrLabel);
		if (pos != null) { this.setPosition(pos); }
	}
	
createjs.Timeline = Timeline;
}());

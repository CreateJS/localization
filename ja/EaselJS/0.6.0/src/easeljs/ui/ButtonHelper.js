/*
* Shape
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
 * ButtonHelperはインタラクティブなボタンを{{#crossLink "MovieClip"}}{{/crossLink}}または{{#crossLink "BitmapAnimation"}}{{/crossLink}}インスタンスから
 * 生成するヘルパークラスです。本クラスはオブジェクトからのマウスイベントを傍受し、自動的に{{#crossLink "BitmapAnimation/gotoAndStop"}}{{/crossLink}}
 * または{{#crossLink "BitmapAnimation/gotoAndPlay"}}{{/crossLink}}を呼び、それぞれのアニメーションラベル、ポインタカーソルを追加、そして
 * 当たり判定フレームをユーザが定義できるようにします。
 *
 * ButtonHelperインスタンスはステージに追加する必要はありません。しかし、ガベージコレクションを防ぐために参照を保持しておくべきです。
 *
 * @example
 *      var helper = new createjs.ButtonHelper(myInstance, "out", "over", "down", false, myInstance, "hit");
 *
 * @param {BitmapAnimation|MovieClip} target 管理するインスタンス。
 * @param {String} [outLabel="out"] ボタンからロールアウトした際に飛ぶラベルまたはアニメーション。
 * @param {String} [overLabel="over"] ボタンにロールオーバーした際に飛ぶラベルまたはアニメーション。
 * @param {String} [downLabel="down"] ボタンを押下した際に飛ぶラベルまたはアニメーション。
 * @param {Boolean} [play=false] 状態が変化した際にヘルパーが"gotoAndPlay"を呼ぶか、または"gotoAndStop"を呼ぶか。
 * @param {DisplayObject} [hitArea] ボタンに対して当たり判定用の随意アイテム。もしこれが定義されていない場合、
 * ボタンの表示状態が代わりに利用される。"target"引数と同じインスタンスを利用することができることに注意してください。
 * @param {String} [hitLabel] hitAreaの境界を定義するhitAreaインスタンス上のラベルまたはアニメーション。
 * もしnullの場合はhitAreaの初期状態が使われます。
 * @constructor
 */
var ButtonHelper = function(target, outLabel, overLabel, downLabel, play, hitArea, hitLabel) {
	this.initialize(target, outLabel, overLabel, downLabel, play, hitArea, hitLabel);
}
var p = ButtonHelper.prototype;

// パブリックプロパティ:
	/**
	 * 読み取り専用。本ボタンヘルパーの対象
	 * @property target
	 * @type MovieClip | BitmapAnimation
	 **/
	p.target = null;
	
	/**
     * マウスカーソルが対象から外れた際に表示するラベル名またはフレーム数。初期状態は"over"に対して。
	 * @property overLabel
	 * @type String | Number
	 **/
	p.overLabel = null;
	
	/**
     * マウスカーソルが対象に重なった際に表示するラベル名またはフレーム数。初期状態は"out"に対して。
	 * @property outLabel
	 * @type String | Number
	 **/
	p.outLabel = null;
	
	/**
     * 対象を押下した際に表示するラベル名またはフレーム数。初期状態は"down"に対して。
	 * @property downLabel
	 * @type String | Number
	 **/
	p.downLabel = null;
	
	/**
	 * trueの場合、ButtonHelperはgotoAndPlayを呼ぶ。falseの場合はgotoAndStopを呼ぶ。 初期状態はfalse。
	 * @property play
	 * @default false
	 * @type Boolean
	 **/
	p.play = false;
	
//  プライベートプロパティ
	/**
	 * @property _isPressed
	 * @type Boolean
	 * @protected
	 **/
	p._isPressed = false;
	
	/**
	 * @property _isPressed
	 * @type Boolean
	 * @protected
	 **/
	p._isOver = false;
	
// コンストラクタ:
	/** 
	 * 初期化メソッド
	 * @method initialize
	 * @protected
	 **/
	p.initialize = function(target, outLabel, overLabel, downLabel, play, hitArea, hitLabel) {
		if (!target.addEventListener) { return; }
		this.target = target;
		target.cursor = "pointer";
		this.overLabel = overLabel == null ? "over" : overLabel;
		this.outLabel = outLabel == null ? "out" : outLabel;
		this.downLabel = downLabel == null ? "down" : downLabel;
		this.play = play;
		this.setEnabled(true);
		this.handleEvent({});
		if (hitArea) {
			if (hitLabel) {
				hitArea.actionsEnabled = false;
				hitArea.gotoAndStop&&hitArea.gotoAndStop(hitLabel);
			}
			target.hitArea = hitArea;
		}
	};
	
// パブリックメソッド:
	/** 
	 * 対象に対してボタンの機能を有効または無効にする
	 * @method setEnabled
	 * @param {Boolean} value
	 **/
	p.setEnabled = function(value) {
		var o = this.target;
		if (value) {
			o.addEventListener("mouseover", this);
			o.addEventListener("mouseout", this);
			o.addEventListener("mousedown", this);
		} else {
			o.removeEventListener("mouseover", this);
			o.removeEventListener("mouseout", this);
			o.removeEventListener("mousedown", this);
		}
	};
		
	/**
	 * 本オブジェクトを文字列で表現したものを返却する
	 * @method toString
	 * @return {String} インスタンスを文字列で表現したもの
	 **/
	p.toString = function() {
		return "[ButtonHelper]";
	};
	
	
// プロテクテッドメソッド:
	/**
	 * @method handleEvent
	 * @protected
	 **/
	p.handleEvent = function(evt) {
		var label, t = this.target, type = evt.type;
		
		if (type == "mousedown") {
			evt.addEventListener("mouseup", this);
			this._isPressed = true;
			label = this.downLabel;
		} else if (type == "mouseup") {
			this._isPressed = false;
			label = this._isOver ? this.overLabel : this.outLabel;
		} else if (type == "mouseover") {
			this._isOver = true;
			label = this._isPressed ? this.downLabel : this.overLabel;
		} else { // マウスアウトとデフォルト
			this._isOver = false;
			label = this._isPressed ? this.overLabel : this.outLabel;
		}
		if (this.play) {
			t.gotoAndPlay&&t.gotoAndPlay(label);
		} else {
			t.gotoAndStop&&t.gotoAndStop(label);
		}
	};

createjs.ButtonHelper = ButtonHelper;
}());
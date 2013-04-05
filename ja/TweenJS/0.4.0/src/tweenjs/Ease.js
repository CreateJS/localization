/*
* Ease
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

// コンストラクタ:
/**
 * Easeクラスは、TweenJSと共に使用するためのイージング関数のコレクションを提供します。それは、標準の４パラメータイージング
 * 署名を使いません。代わりにトゥイーンの現在のリニア比(0から1)を示す単一のパラメータを使います。
 *
 * Ease上のほとんどのメソッドは、イージング関数として直接渡すことができます:
 *
 *      Tween.get(target).to({x:100}, 500, Ease.linear);
 *
 * しかしながら、"get"で始まるメソッドはパラメータの値に基づいてイージング関数を返します:
 *
 *      Tween.get(target).to({y:200}, 500, Ease.getPowIn(2.2));
 *
 * <a href="http://tweenjs.com">TweenJS.com</a>のさまざまなイースタイプの概要は
 * <a href="http://www.createjs.com/#!/TweenJS/demos/sparkTable">spark table demo</a>を参照してください。
 *
 * <i>数式の由来はRobert Pennerによります。</i>
 * @class Ease
 * @static
 **/
var Ease = function() {
	throw "Ease cannot be instantiated.";
}

// パブリックスタティックメソッド:
	/** 
	 * @method linear
	 * @static
	 **/
	Ease.linear = function(t) { return t; }
	
	/** 
	 * linearと同一。
	 * @method none
	 * @static
	 **/
	Ease.none = Ease.linear;
	
	/** 
	 * Flash Proにおける単純な-100から100までのイージングを模倣しています。
	 * @method get
	 * @param amount イースの強さや方向を示す -1(ease in)から 1 (ease out)までの値。
	 * @static
	 **/
	Ease.get = function(amount) {
		if (amount < -1) { amount = -1; }
		if (amount > 1) { amount = 1; }
		return function(t) {
			if (amount==0) { return t; }
			if (amount<0) { return t*(t*-amount+1+amount); }
			return t*((2-t)*amount+(1-amount));
		}
	}
	
	/** 
	 * 設定可能な指数関数のイース。
	 * @method getPowIn
	 * @param pow 使用する指数 (例. 3 は、３次のイースを返します）。
	 * @static
	 **/
	Ease.getPowIn = function(pow) {
		return function(t) {
			return Math.pow(t,pow);
		}
	}
	
	
	/** 
	 * 設定可能な指数関数のイース。
	 * @method getPowOut
	 * @param pow 使用する指数 (例. 3 は、３次のイースを返します）。
	 * @static
	 **/
	Ease.getPowOut = function(pow) {
		return function(t) {
			return 1-Math.pow(1-t,pow);
		}
	}
	
	
	/** 
	 * 設定可能な指数関数のイース。
	 * @method getPowInOut
	 * @param pow 使用する指数 (例. 3 は、３次のイースを返します）。
	 * @static
	 **/
	Ease.getPowInOut = function(pow) {
		return function(t) {
			if ((t*=2)<1) return 0.5*Math.pow(t,pow);
			return 1-0.5*Math.abs(Math.pow(2-t,pow));
		}
	}
	
	
	/** 
	 * @method quadIn
	 * @static
	 **/
	Ease.quadIn = Ease.getPowIn(2);
	/** 
	 * @method quadOut
	 * @static
	 **/
	Ease.quadOut = Ease.getPowOut(2);
	/** 
	 * @method quadInOut
	 * @static
	 **/
	Ease.quadInOut = Ease.getPowInOut(2);
	
	
	/** 
	 * @method cubicIn
	 * @static
	 **/
	Ease.cubicIn = Ease.getPowIn(3);
	/** 
	 * @method cubicOut
	 * @static
	 **/
	Ease.cubicOut = Ease.getPowOut(3);
	/** 
	 * @method cubicInOut
	 * @static
	 **/
	Ease.cubicInOut = Ease.getPowInOut(3);
	
	
	/** 
	 * @method quartIn
	 * @static
	 **/
	Ease.quartIn = Ease.getPowIn(4);
	/** 
	 * @method quartOut
	 * @static
	 **/
	Ease.quartOut = Ease.getPowOut(4);
	/** 
	 * @method quartInOut
	 * @static
	 **/
	Ease.quartInOut = Ease.getPowInOut(4);
	
	
	/** 
	 * @method quintIn
	 * @static
	 **/
	Ease.quintIn = Ease.getPowIn(5);
	/** 
	 * @method quintOut
	 * @static
	 **/
	Ease.quintOut = Ease.getPowOut(5);
	/** 
	 * @method quintInOut
	 * @static
	 **/
	Ease.quintInOut = Ease.getPowInOut(5);
	
	
	/** 
	 * @method sineIn
	 * @static
	 **/
	Ease.sineIn = function(t) {
		return 1-Math.cos(t*Math.PI/2);
	}
	
	/** 
	 * @method sineOut
	 * @static
	 **/
	Ease.sineOut = function(t) {
		return Math.sin(t*Math.PI/2);
	}
	
	/** 
	 * @method sineInOut
	 * @static
	 **/
	Ease.sineInOut = function(t) {
		return -0.5*(Math.cos(Math.PI*t) - 1)
	}
	
	
	/** 
	 * 設定可能な "back in"イース。
	 * @method getBackIn
	 * @param amount イースの強さ。
	 * @static
	 **/
	Ease.getBackIn = function(amount) {
		return function(t) {
			return t*t*((amount+1)*t-amount);
		}
	}
	/** 
	 * @method backIn
	 * @static
	 **/
	Ease.backIn = Ease.getBackIn(1.7);
	
	/** 
	 * 設定可能な "back out"イース。
	 * @method getBackOut
	 * @param amount イースの強さ。
	 * @static
	 **/
	Ease.getBackOut = function(amount) {
		return function(t) {
			return (--t*t*((amount+1)*t + amount) + 1);
		}
	}
	/** 
	 * @method backOut
	 * @static
	 **/
	Ease.backOut = Ease.getBackOut(1.7);
	
	/** 
	 * 設定可能な "back in out"イース。
	 * @method getBackInOut
	 * @param amount イースの強さ。
	 * @static
	 **/
	Ease.getBackInOut = function(amount) {
		amount*=1.525;
		return function(t) {
			if ((t*=2)<1) return 0.5*(t*t*((amount+1)*t-amount));
			return 0.5*((t-=2)*t*((amount+1)*t+amount)+2);
		}
	}
	/** 
	 * @method backInOut
	 * @static
	 **/
	Ease.backInOut = Ease.getBackInOut(1.7);
	
	
	/** 
	 * @method circIn
	 * @static
	 **/
	Ease.circIn = function(t) {
		return -(Math.sqrt(1-t*t)- 1);
	}
	
	/** 
	 * @method circOut
	 * @static
	 **/
	Ease.circOut = function(t) {
		return Math.sqrt(1-(--t)*t);
	}
	
	/** 
	 * @method circInOut
	 * @static
	 **/
	Ease.circInOut = function(t) {
		if ((t*=2) < 1) return -0.5*(Math.sqrt(1-t*t)-1);
		return 0.5*(Math.sqrt(1-(t-=2)*t)+1);
	}
	
	/** 
	 * @method bounceIn
	 * @static
	 **/
	Ease.bounceIn = function(t) {
		return 1-Ease.bounceOut(1-t);
	}
	
	/** 
	 * @method bounceOut
	 * @static
	 **/
	Ease.bounceOut = function(t) {
		if (t < 1/2.75) {
			return (7.5625*t*t);
		} else if (t < 2/2.75) {
			return (7.5625*(t-=1.5/2.75)*t+0.75);
		} else if (t < 2.5/2.75) {
			return (7.5625*(t-=2.25/2.75)*t+0.9375);
		} else {
			return (7.5625*(t-=2.625/2.75)*t +0.984375);
		}
	}
	
	/** 
	 * @method bounceInOut
	 * @static
	 **/
	Ease.bounceInOut = function(t) {
		if (t<0.5) return Ease.bounceIn (t*2) * .5;
		return Ease.bounceOut(t*2-1)*0.5+0.5;
	}
	
	
	/** 
	 * 設定可能な弾性のイース。
	 * @method getElasticIn
	 * @param amplitude
	 * @param period
	 * @static
	 **/
	Ease.getElasticIn = function(amplitude,period) {
		var pi2 = Math.PI*2;
		return function(t) {
			if (t==0 || t==1) return t;
			var s = period/pi2*Math.asin(1/amplitude);
			return -(amplitude*Math.pow(2,10*(t-=1))*Math.sin((t-s)*pi2/period));
		}
	}
	/** 
	 * @method elasticIn
	 * @static
	 **/
	Ease.elasticIn = Ease.getElasticIn(1,0.3);
	
	/** 
	 * 設定可能な弾性のイース。
	 * @method getElasticOut
	 * @param amplitude
	 * @param period
	 * @static
	 **/
	Ease.getElasticOut = function(amplitude,period) {
		var pi2 = Math.PI*2;
		return function(t) {
			if (t==0 || t==1) return t;
			var s = period/pi2 * Math.asin(1/amplitude);
			return (amplitude*Math.pow(2,-10*t)*Math.sin((t-s)*pi2/period )+1);
		}
	}
	/** 
	 * @method elasticOut
	 * @static
	 **/
	Ease.elasticOut = Ease.getElasticOut(1,0.3);
	
	/** 
	 * 設定可能な弾性のイース。
	 * @method getElasticInOut
	 * @param amplitude
	 * @param period
	 * @static
	 **/
	Ease.getElasticInOut = function(amplitude,period) {
		var pi2 = Math.PI*2;
		return function(t) {
			var s = period/pi2 * Math.asin(1/amplitude);
			if ((t*=2)<1) return -0.5*(amplitude*Math.pow(2,10*(t-=1))*Math.sin( (t-s)*pi2/period ));
			return amplitude*Math.pow(2,-10*(t-=1))*Math.sin((t-s)*pi2/period)*0.5+1;
		}
	}
	/** 
	 * @method elasticInOut
	 * @static
	 **/
	Ease.elasticInOut = Ease.getElasticInOut(1,0.3*1.5);
	
createjs.Ease = Ease;
}());

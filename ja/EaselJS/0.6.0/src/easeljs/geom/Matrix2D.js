/*
* Matrix2D
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
 * アフィン変換行列を表します。また、行列を生成し結合するツールを提供します。
 * @class Matrix2D
 * @constructor
 * @param {Number} a 新しい行列の a プロパティを指定します。
 * @param {Number} b 新しい行列の b プロパティを指定します。
 * @param {Number} c 新しい行列の c プロパティを指定します。
 * @param {Number} d 新しい行列の d プロパティを指定します。
 * @param {Number} tx 新しい行列の tx プロパティを指定します。
 * @param {Number} ty 新しい行列の ty プロパティを指定します。
 **/
var Matrix2D = function(a, b, c, d, tx, ty) {
  this.initialize(a, b, c, d, tx, ty);
}
var p = Matrix2D.prototype;

// 静的なパブリックプロパティ:

	/**
	 * 単位行列で、無変換を表します。読み取り専用です。
	 * @property identity
	 * @static
	 * @type Matrix2D
	 **/
	Matrix2D.identity = null; // set at bottom of class definition.

	/**
	 * 度をラジアンに変換するための乗数です。Matrix2D が内部的に使用します。読み取り専用です。
	 * @property DEG_TO_RAD
	 * @static
	 * @final
	 * @type Number
	 **/
	Matrix2D.DEG_TO_RAD = Math.PI/180;


// パブリックプロパティ:
	/**
	 * 3x3 アフィン変換行列の (0, 0) の位置の値です。
	 * @property a
	 * @type Number
	 **/
	p.a = 1;

	/**
	 * 3x3 アフィン変換行列の (0, 1) の位置の値です。
	 * @property b
	 * @type Number
	 **/
	p.b = 0;

	/**
	 * 3x3 アフィン変換行列の (1, 0) の位置の値です。
	 * @property c
	 * @type Number
	 **/
	p.c = 0;

	/**
	 * 3x3 アフィン変換行列の (1, 1) の位置の値です。
	 * @property d
	 * @type Number
	 **/
	p.d = 1;

	/**
	 * 3x3 アフィン変換行列の (2, 0) の位置の値です。
	 * @property tx
	 * @type Number
	 **/
	p.tx = 0;

	/**
	 * 3x3 アフィン変換行列の (2, 1) の位置の値です。
	 * @property ty
	 * @type Number
	 **/
	p.ty = 0;

	/**
	 * 表示オブジェクトに適用されるアルファを表すプロパティです。これは行列操作に含まれるものではありませんが
	 * getConcatenatedMatrix のような連結されたアルファを提供する操作で使われます。
	 * @property alpha
	 * @type Number
	 **/
	p.alpha = 1;

	/**
	 * 表示オブジェクトに適用されるシャドーを表すプロパティです。これは行列操作に含まれるものではありませんが
	 * getConcatenatedMatrix のような連結されたシャドーを提供する操作で使われます。
	 * @property shadow
	 * @type Shadow
	 **/
	p.shadow  = null;

	/**
	 * 表示オブジェクトに適用される合成処理を表すプロパティです。これは行列操作に含まれるものではありませんが
	 * getConcatenatedMatrix のような連結された合成処理を提供する操作で使われます。利用可能な合成処理の一覧は、
	 * <a href="https://developer.mozilla.org/ja/Canvas_tutorial/Compositing">https://developer.mozilla.org/ja/Canvas_tutorial/Compositing</a> をご覧ください。
	 * @property compositeOperation
	 * @type String
	 **/
	p.compositeOperation = null;

// コンストラクタ:
	/**
	 * 初期化用のメソッドです。
	 * @method initialize
	 * @protected
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	*/
	p.initialize = function(a, b, c, d, tx, ty) {
		if (a != null) { this.a = a; }
		this.b = b || 0;
		this.c = c || 0;
		if (d != null) { this.d = d; }
		this.tx = tx || 0;
		this.ty = ty || 0;
		return this;
	}

// パブリックメソッド:
	/**
	 * 指定された行列の要素を、この行列の前から連結します。全ての引数は必須です。
	 * @method prepend
	 * @param {Number} a
	 * @param {Number} b
	 * @param {Number} c
	 * @param {Number} d
	 * @param {Number} tx
	 * @param {Number} ty
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	 **/
	p.prepend = function(a, b, c, d, tx, ty) {
		var tx1 = this.tx;
		if (a != 1 || b != 0 || c != 0 || d != 1) {
			var a1 = this.a;
			var c1 = this.c;
			this.a  = a1*a+this.b*c;
			this.b  = a1*b+this.b*d;
			this.c  = c1*a+this.d*c;
			this.d  = c1*b+this.d*d;
		}
		this.tx = tx1*a+this.ty*c+tx;
		this.ty = tx1*b+this.ty*d+ty;
		return this;
	}

	/**
	 * 指定された行列の要素をこの行列の後から連結します。全ての引数は必須です。
	 * @method append
	 * @param {Number} a
	 * @param {Number} b
	 * @param {Number} c
	 * @param {Number} d
	 * @param {Number} tx
	 * @param {Number} ty
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	 **/
	p.append = function(a, b, c, d, tx, ty) {
		var a1 = this.a;
		var b1 = this.b;
		var c1 = this.c;
		var d1 = this.d;

		this.a  = a*a1+b*c1;
		this.b  = a*b1+b*d1;
		this.c  = c*a1+d*c1;
		this.d  = c*b1+d*d1;
		this.tx = tx*a1+ty*c1+this.tx;
		this.ty = tx*b1+ty*d1+this.ty;
		return this;
	}

	/**
	 * P定された行列を、この行列の前から連結します。
	 * @method prependMatrix
	 * @param {Matrix2D} matrix
	 **/
	p.prependMatrix = function(matrix) {
		this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		this.prependProperties(matrix.alpha, matrix.shadow,  matrix.compositeOperation);
		return this;
	}

	/**
	 * 指定された行列をこの行列の後から連結します。
	 * @method appendMatrix
	 * @param {Matrix2D} matrix
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	 **/
	p.appendMatrix = function(matrix) {
		this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
		this.appendProperties(matrix.alpha, matrix.shadow,  matrix.compositeOperation);
		return this;
	}

	/**
	 * 指定された表示オブジェクトの変換属性から行列のプロパティを生成し、この行列の前から連結します。
	 * 例えば、表示オブジェクトから新しい行列を生成するために利用できます。var mtx = new Matrix2D();
	 * mtx.prependTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
	 * @method prependTransform
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} scaleX
	 * @param {Number} scaleY
	 * @param {Number} rotation
	 * @param {Number} skewX
	 * @param {Number} skewY
	 * @param {Number} regX オプションです。
	 * @param {Number} regY オプションです。
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	 **/
	p.prependTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
		if (rotation%360) {
			var r = rotation*Matrix2D.DEG_TO_RAD;
			var cos = Math.cos(r);
			var sin = Math.sin(r);
		} else {
			cos = 1;
			sin = 0;
		}

		if (regX || regY) {
			// append the registration offset:
			this.tx -= regX; this.ty -= regY;
		}
		if (skewX || skewY) {
			// TODO: can this be combined into a single prepend operation?
			skewX *= Matrix2D.DEG_TO_RAD;
			skewY *= Matrix2D.DEG_TO_RAD;
			this.prepend(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
			this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
		} else {
			this.prepend(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
		}
		return this;
	}

	/**
	 * 指定された表示オブジェクトの変換属性から行列のプロパティを生成し、この行列の後から連結します。
	 * 例えば、表示オブジェクトから新しい行列を生成するために利用できます。var mtx = new Matrix2D();
	 * mtx.appendTransform(o.x, o.y, o.scaleX, o.scaleY, o.rotation);
	 * @method appendTransform
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} scaleX
	 * @param {Number} scaleY
	 * @param {Number} rotation
	 * @param {Number} skewX
	 * @param {Number} skewY
	 * @param {Number} regX オプションです。
	 * @param {Number} regY オプションです。
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	 **/
	p.appendTransform = function(x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
		if (rotation%360) {
			var r = rotation*Matrix2D.DEG_TO_RAD;
			var cos = Math.cos(r);
			var sin = Math.sin(r);
		} else {
			cos = 1;
			sin = 0;
		}

		if (skewX || skewY) {
			// TODO: can this be combined into a single append?
			skewX *= Matrix2D.DEG_TO_RAD;
			skewY *= Matrix2D.DEG_TO_RAD;
			this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y);
			this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, 0, 0);
		} else {
			this.append(cos*scaleX, sin*scaleX, -sin*scaleY, cos*scaleY, x, y);
		}

		if (regX || regY) {
			// prepend the registration offset:
			this.tx -= regX*this.a+regY*this.c; 
			this.ty -= regX*this.b+regY*this.d;
		}
		return this;
	}

	/**
	 * この行列に回転変換を適用します。
	 * @method rotate
	 * @param {Number} angle ラジアン単位の角度です。度を使用する場合は <code>Math.PI/180</code> で乗算をします。
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	 **/
	p.rotate = function(angle) {
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);

		var a1 = this.a;
		var c1 = this.c;
		var tx1 = this.tx;

		this.a = a1*cos-this.b*sin;
		this.b = a1*sin+this.b*cos;
		this.c = c1*cos-this.d*sin;
		this.d = c1*sin+this.d*cos;
		this.tx = tx1*cos-this.ty*sin;
		this.ty = tx1*sin+this.ty*cos;
		return this;
	}

	/**
	 * この行列にスキュー変換を適用します。
	 * @method skew
	 * @param {Number} skewX 水平方向に傾斜させる角度を度で指定します。
	 * @param {Number} skewY 垂直方向に傾斜させる角度を度で指定します。
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	*/
	p.skew = function(skewX, skewY) {
		skewX = skewX*Matrix2D.DEG_TO_RAD;
		skewY = skewY*Matrix2D.DEG_TO_RAD;
		this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0);
		return this;
	}

	/**
	 * この行列に拡大／縮小の変換を適用します。
	 * @method scale
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	 **/
	p.scale = function(x, y) {
		this.a *= x;
		this.d *= y;
		this.tx *= x;
		this.ty *= y;
		return this;
	}

	/**
	 * 行列を x 軸と y 軸に沿って平行移動します。
	 * @method translate
	 * @param {Number} x
	 * @param {Number} y
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	 **/
	p.translate = function(x, y) {
		this.tx += x;
		this.ty += y;
		return this;
	}

	/**
	 * この行列のプロパティを単位行列（無変換になる行列）の値にします。
	 * @method identity
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	 **/
	p.identity = function() {
		this.alpha = this.a = this.d = 1;
		this.b = this.c = this.tx = this.ty = 0;
		this.shadow = this.compositeOperation = null;
		return this;
	}

	/**
	 * 反対の変換を行う逆行列を生成します。
	 * @method invert
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	 **/
	p.invert = function() {
		var a1 = this.a;
		var b1 = this.b;
		var c1 = this.c;
		var d1 = this.d;
		var tx1 = this.tx;
		var n = a1*d1-b1*c1;

		this.a = d1/n;
		this.b = -b1/n;
		this.c = -c1/n;
		this.d = a1/n;
		this.tx = (c1*this.ty-d1*tx1)/n;
		this.ty = -(a1*this.ty-b1*tx1)/n;
		return this;
	}

	/**
	 * Rこの行列が単位行列であるかを判別します。
	 * @method isIdentity
	 * @return {Boolean}
	 **/
	p.isIdentity = function() {
		return this.tx == 0 && this.ty == 0 && this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1;
	}

	/**
	 * 行列を変換属性 (x, y, scaleX, scaleY, and rotation) に分解します。これらの値は、表示結果は同じでも
	 * 行列の生成に使用した変換属性とは一致しないかもしれないことに注意して下さい。
	 * @method decompose
	 * @param {Object} target 変換属性を適用するオブジェクトです。null の場合は新しいオブジェクトが返されます。
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	*/
	p.decompose = function(target) {
		// TODO: it would be nice to be able to solve for whether the matrix can be decomposed into only scale/rotation
		// even when scale is negative
		if (target == null) { target = {}; }
		target.x = this.tx;
		target.y = this.ty;
		target.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
		target.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);

		var skewX = Math.atan2(-this.c, this.d);
		var skewY = Math.atan2(this.b, this.a);

		if (skewX == skewY) {
			target.rotation = skewY/Matrix2D.DEG_TO_RAD;
			if (this.a < 0 && this.d >= 0) {
				target.rotation += (target.rotation <= 0) ? 180 : -180;
			}
			target.skewX = target.skewY = 0;
		} else {
			target.skewX = skewX/Matrix2D.DEG_TO_RAD;
			target.skewY = skewY/Matrix2D.DEG_TO_RAD;
		}
		return target;
	}

	/**
	 * 行列の全てのプロパティを指定された値で再初期化します。
	 * @method appendProperties
	 * @param {Number} a
	 * @param {Number} b
	 * @param {Number} c
	 * @param {Number} d
	 * @param {Number} tx
	 * @param {Number} ty
	 * @param {Number} alpha 望まれるアルファの値です。
	 * @param {Shadow} shadow 望まれるシャドーの値です。
	 * @param {String} compositeOperation 望まれる合成処理の値です。
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	*/
	p.reinitialize = function(a,b,c,d,tx,ty,alpha,shadow,compositeOperation) {
		this.initialize(a,b,c,d,tx,ty);
		this.alpha = alpha || 1;
		this.shadow = shadow;
		this.compositeOperation = compositeOperation;
		return this;
	}

	/**
	 * 現在の行列に指定されたビジュアル属性を後ろから連結します。
	 * @method appendProperties
	 * @param {Number} alpha 望まれるアルファの値です。
	 * @param {Shadow} shadow 望まれるシャドーの値です。
	 * @param {String} compositeOperation 望まれる合成処理の値です。
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	*/
	p.appendProperties = function(alpha, shadow, compositeOperation) {
		this.alpha *= alpha;
		this.shadow = shadow || this.shadow;
		this.compositeOperation = compositeOperation || this.compositeOperation;
		return this;
	}

	/**
	 * 現在の行列に指定されたビジュアル属性を前から連結します。
	 * @method prependProperties
	 * @param {Number} alpha 望まれるアルファの値です。
	 * @param {Shadow} shadow 望まれるシャドーの値です。
	 * @param {String} compositeOperation 望まれる合成処理の値です。
	 * @return {Matrix2D} この行列です。呼び出しの連結に便利です。
	*/
	p.prependProperties = function(alpha, shadow, compositeOperation) {
		this.alpha *= alpha;
		this.shadow = this.shadow || shadow;
		this.compositeOperation = this.compositeOperation || compositeOperation;
		return this;
	}

	/**
	 * この Matrix2D インスタンスの複製を返します。
	 * @method clone
	 * @return {Matrix2D} 現在の Matrix2D インスタンスの複製です。
	 **/
	p.clone = function() {
		var mtx = new Matrix2D(this.a, this.b, this.c, this.d, this.tx, this.ty);
		mtx.shadow = this.shadow;
		mtx.alpha = this.alpha;
		mtx.compositeOperation = this.compositeOperation;
		return mtx;
	}

	/**
	 * このオブジェクトの文字列での表現を返します。
	 * @method toString
	 * @return {String} このインスタンスの文字列表現です。
	 **/
	p.toString = function() {
		return "[Matrix2D (a="+this.a+" b="+this.b+" c="+this.c+" d="+this.d+" tx="+this.tx+" ty="+this.ty+")]";
	}

	// this has to be populated after the class is defined:
	Matrix2D.identity = new Matrix2D(1, 0, 0, 1, 0, 0);

createjs.Matrix2D = Matrix2D;
}());
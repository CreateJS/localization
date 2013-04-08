/*
* Container
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
 * Containerは入れ子にできる表示リストであり、他の表示リストを格納することができます。
 * 例えば、腕、脚、胴体それと頭のインスタンスをPerson Containerとしてまとめることができ、個々の相対距離を保ったままグループとして変形することができます。
 * Containerの子の <code>transform</code> プロパティと <code>alpha</code> プロパティは親のContainerと連結されたものとなります。
 *
 * 例えば、<code>x=50</code>で<code>alpha=0.7</code>のContainerの中に置かれたx=100でalpha=0.5の{{#crossLink "Shape"}}{{/crossLink}}は、
 * x=150とalpha=0.35としてcanvasに描画されます。
 * Containerによりいくらかのオーバーヘッドができますので、一般的に一個だけの子を持つ用途のためにContainerを作るべきではありません。
 *
 * <h4>例</h4>
 *      var container = new createjs.Container();
 *      container.addChild(bitmapInstance, shapeInstance);
 *      container.x = 100;
 *
 * @class Container
 * @extends DisplayObject
 * @constructor
 **/
var Container = function() {
  this.initialize();
}
var p = Container.prototype = new createjs.DisplayObject();

// パブリックプロパティ:
	/**
	 * 子の表示リストの配列です。
	 * 通常、こちらを使って直接アクセスするのではなく、{{#crossLink "Container/addChild"}}{{/crossLink}},
	 * {{#crossLink "Container/removeChild"}}{{/crossLink}}, {{#crossLink "Container/swapChildren"}}{{/crossLink}}といった
	 * 子を管理するメソッドを用いるべきです。
	 * こちらは上級者のために設けられています。
	 * @property children
	 * @type Array
	 * @default null
	 **/
	p.children = null;

// コンストラクタ:

	/**
	 * @property DisplayObject_initialize
	 * @type Function
	 * @private
	 **/
	p.DisplayObject_initialize = p.initialize;

	/**
	 * 初期化メソッドです。
	 * @method initialize
	 * @protected
	*/
	p.initialize = function() {
		this.DisplayObject_initialize();
		this.children = [];
	}

// パブリックメソッド:

	/**
	 * 表示オブジェクトがcanvasに描画されている場合、それが可視であるか否かを示します。
	 * これは、ステージの範囲内に表示されているか否かを示すものではありません。
	 * 注意: このメソッドは主に内部での使用を意図したものですが、高度な使用において役に立つでしょう。
	 * @method isVisible
	 * @return {Boolean} Boolean 表示オブジェクトがcanvasに描画されている場合、それが可視であるか否かを示します。
	 **/
	p.isVisible = function() {
		var hasContent = this.cacheCanvas || this.children.length;
		return !!(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && hasContent);
	}

	/**
	 * @property DisplayObject_draw
	 * @type Function
	 * @private
	 **/
	p.DisplayObject_draw = p.draw;

	/**
	 * 表示オブジェクトを、visible, alpha, shadow, そしてtransformの設定を無視して、指定されたコンテキストで描画します。
	 * 描画された場合にtrueを返します（機能をオーバーライドする場合に有用です）。
	 * 注意: このメソッドは主に内部での使用を意図したものですが、高度な使用において役に立つでしょう。
	 * @method draw
	 * @param {CanvasRenderingContext2D} ctx canvas2Dコンテキストオブジェクトです。
	 * @param {Boolean} ignoreCache 描画において保存しているキャッシュを無視するか否かを指定します。
	 * 例えば、キャッシュを再構築するのに使われます。（既存のキャッシュが再利用されるのを防ぐために）
	 **/
	p.draw = function(ctx, ignoreCache) {
		if (this.DisplayObject_draw(ctx, ignoreCache)) { return true; }

		// 描画中に表示リストが変化する問題が発生しないようにする
		var list = this.children.slice(0);
		for (var i=0,l=list.length; i<l; i++) {
			var child = list[i];
			if (!child.isVisible()) { continue; }

			// 子を描画する
			ctx.save();
			child.updateContext(ctx);
			child.draw(ctx);
			ctx.restore();
		}
		return true;
	}

	/**
	 * 表示リストの最前面に子を追加します。
	 * "addChild(child1, child2, ...);"のようにして複数の子を追加することができます。
	 * 追加された子を返します。
	 * 複数追加された場合は最後の子を返します。
	 *
	 * <h4>例</h4>
	 *      container.addChild(bitmapInstance, shapeInstance);
	 *
	 * @method addChild
	 * @param {DisplayObject} child 追加する子表示オブジェクトです。
	 * @return {DisplayObject} 追加された子です。複数追加された場合は最後の子です。
	 **/
	p.addChild = function(child) {
		if (child == null) { return child; }
		var l = arguments.length;
		if (l > 1) {
			for (var i=0; i<l; i++) { this.addChild(arguments[i]); }
			return arguments[l-1];
		}
		if (child.parent) { child.parent.removeChild(child); }
		child.parent = this;
		this.children.push(child);
		return child;
	}

	/**
	 * 子を表示リストの指定したインデックスに追加し、parentを追加したContainerに設定します。
	 * インデックスが指定したインデックス以上であった子は、インデックスが1増えます。
	 * "addChild(child1, child2, ...);"のようにして複数の子を追加することができます。
	 * 指定するインデックスは0以上numChildren以下でなければいけません。
	 * 例えば、表示リストにおいてmyShapeをotherShapeの背面に加えたい場合は次のようにできます。
	 * container.addChildAt(myShape, container.getChildIndex(otherShape))
	 * これにより、otherShapeのインデックスは1増えます。
	 * 追加された子を返します。
	 * 複数追加された場合は最後の子を返します。
	 * インデックスが範囲外のときは何も起きません。
	 * @method addChildAt
	 * @param {DisplayObject} child 追加する子表示オブジェクトです。
	 * @param {Number} index 子を追加するインデックスです。
	 * @return {DisplayObject} 追加された子です。複数追加された場合は最後の子です。
	 **/
	p.addChildAt = function(child, index) {
		var l = arguments.length;
		var indx = arguments[l-1]; // 同じ名前をインデックス引数に使わないこと。あるいは代わりにarugments[1]を使うこと。
		if (indx < 0 || indx > this.children.length) { return arguments[l-2]; }
		if (l > 2) {
			for (var i=0; i<l-1; i++) { this.addChildAt(arguments[i], indx+i); }
			return arguments[l-2];
		}
		if (child.parent) { child.parent.removeChild(child); }
		child.parent = this;
		this.children.splice(index, 0, child);
		return child;
	}

	/**
	 * 指定した子を表示リストから削除します。
	 * 特記事項として、インデックスが既知の場合はremoveChildAt()を用いた方が高速です。
	 * "removeChild(child1, child2, ...);"のようにして複数の子を削除することができます。
	 * すべての指定した子が削除された場合はtrueを返し、表示リストに無い子が一つでもあればfalseを返します。
	 * @method removeChild
	 * @param {DisplayObject} child 削除する子です。
	 * @return {Boolean} すべての指定した子が削除された場合はtrue、表示リストに無い子が一つでもあればfalseです。
	 **/
	p.removeChild = function(child) {
		var l = arguments.length;
		if (l > 1) {
			var good = true;
			for (var i=0; i<l; i++) { good = good && this.removeChild(arguments[i]); }
			return good;
		}
		return this.removeChildAt(this.children.indexOf(child));
	}

	/**
	 * 表示リストにおいて指定したインデックスの子を削除し、それらのparentをnullに設定します。
	 * "removeChildAt(2, 7, ...);"のようにして複数の子を削除することができます。
	 * すべての指定した子が削除された場合はtrueを返し、インデックス範囲外の子が一つでもあればfalseを返します。
	 * @param {Number} index 削除する子のインデックスです。
	 * @return {Boolean} true if the child (or children) was removed, or false if any index was out of range.
	 * @return {Boolean} すべての指定した子が削除された場合はtrue、インデックス範囲外の子が一つでもあればfalseです。
	 **/
	p.removeChildAt = function(index) {
		var l = arguments.length;
		if (l > 1) {
			var a = [];
			for (var i=0; i<l; i++) { a[i] = arguments[i]; }
			a.sort(function(a, b) { return b-a; });
			var good = true;
			for (var i=0; i<l; i++) { good = good && this.removeChildAt(a[i]); }
			return good;
		}
		if (index < 0 || index > this.children.length-1) { return false; }
		var child = this.children[index];
		if (child) { child.parent = null; }
		this.children.splice(index, 1);
		return true;
	}

	/**
	 * 表示リストの全ての子を削除します。
	 * @method removeAllChildren
	 **/
	p.removeAllChildren = function() {
		var kids = this.children;
		while (kids.length) { kids.pop().parent = null; }
	}

	/**
	 * 指定したインデックスの子を返します。
	 * @method getChildAt
	 * @param {Number} index 取得する子のインデックスです。
	 * @return {DisplayObject} 指定したインデックスの子です。
	 **/
	p.getChildAt = function(index) {
		return this.children[index];
	}

	/**
	 * 指定したnameを持つ子を返します。
	 * @method getChildByName
	 * @param {String} name 取得する子のnameです。
	 * @return {DisplayObject} 指定したnameを持つ子です。
	 **/
	p.getChildByName = function(name) {
		var kids = this.children;
		for (var i=0,l=kids.length;i<l;i++) {
			if(kids[i].name == name) { return kids[i]; }
		}
		return null;
	}

	/**
	 * 子のリストに対して配列ソートを行います。
	 * @method sortChildren
	 * @param {Function} sortFunction 子のリストのソートに用いる関数です。詳しくはjavascriptのArray.sortドキュメントを参照してください。
	 **/
	p.sortChildren = function(sortFunction) {
		this.children.sort(sortFunction);
	}

	/**
	 * 表示リストにおいて指定した子のインデックスを返します。
	 * 表示リストにない場合は-1を返します。
	 * @method getChildIndex
	 * @param {DisplayObject} child インデックスを取得する子です。
	 * @return {Number} 指定した子のインデックスです。子が見つからない場合は-1を返します。
	 **/
	p.getChildIndex = function(child) {
		return this.children.indexOf(child);
	}

	/**
	 * 表示リストの子の数を返します。
	 * @method getNumChildren
	 * @return {Number} 表示リストの子の数です。
	 **/
	p.getNumChildren = function() {
		return this.children.length;
	}

	/**
	 * 指定した2つのインデックスの子同士を交換します。
	 * インデックスが範囲外の場合、何も起きません。
	 * @param {Number} index1
	 * @param {Number} index2
	 * @method swapChildrenAt
	 **/
	p.swapChildrenAt = function(index1, index2) {
		var kids = this.children;
		var o1 = kids[index1];
		var o2 = kids[index2];
		if (!o1 || !o2) { return; }
		kids[index1] = o2;
		kids[index2] = o1;
	}

	/**
	 * 指定した2つの子の深度を交換します。
	 * どちらか一つでもこのコンテナの子でなければ何も起きません。
	 * @param {DisplayObject} child1
	 * @param {DisplayObject} child2
	 * @method swapChildren
	 **/
	p.swapChildren = function(child1, child2) {
		var kids = this.children;
		var index1,index2;
		for (var i=0,l=kids.length;i<l;i++) {
			if (kids[i] == child1) { index1 = i; }
			if (kids[i] == child2) { index2 = i; }
			if (index1 != null && index2 != null) { break; }
		}
		if (i==l) { return; } // TODO: throw error?
		kids[index1] = child2;
		kids[index2] = child1;
	}

	/**
	 * 指定した子の深度を変更します。
	 * 指定した子がこのコンテナにない場合、あるいは指定したインデックスが範囲外の場合は、何も起きません。
	 * @param {DisplayObject} child
	 * @param {Number} index
	 * @method setChildIndex
	 **/
	p.setChildIndex = function(child, index) {
		var kids = this.children, l=kids.length;
		if (child.parent != this || index < 0 || index >= l) { return; }
		for (var i=0;i<l;i++) {
			if (kids[i] == child) { break; }
		}
		if (i==l || i == index) { return; }
		kids.splice(i,1);
		if (index<i) { index--; }
		kids.splice(index,0,child);
	}

	/**
	 * 指定した表示オブジェクトがこのContainer自身かあるいは子孫である場合、trueを返します。
	 * 子孫であるとは、このContainerの子、孫、ひ孫、・・・であることです。
	 * @method contains
	 * @param {DisplayObject} child チェックするDisplayObjectです。
	 * @return {Boolean} 指定した表示オブジェクトがこのContainer自身あるいは子孫である場合、trueです。
	 **/
	p.contains = function(child) {
		while (child) {
			if (child == this) { return true; }
			child = child.parent;
		}
		return false;
	}

	/**
	 * 表示オブジェクトが指定したローカル座標の点と重複あるいは交差しているか否かを検査します。
	 * （言い換えると、指定した点においてalpha > 0のピクセルを描画しているかを検査します）
	 * 表示オブジェクトのalpah、shadow、それとcompositeOperation、regX/Yを含んだ全ての変形系プロパティは無視して判定します。
	 *
	 * @method hitTest
	 * @param {Number} x 表示オブジェクトのローカル座標系における点のx値です。
	 * @param {Number} y 表示オブジェクトのローカル座標系における点のy値です。
	 * @return {Boolean} DisplayObjectの可視な部分が指定されたローカルな点と交差しているか否かです。
	 **/
	p.hitTest = function(x, y) {
		// TODO: optimize to use the fast cache check where possible.
		return (this.getObjectUnderPoint(x, y) != null);
	}

	/**
	 * このコンテナに含まれる表示オブジェクトの中で、指定した座標下にあるものすべてを配列で返します。
	 * このルーチンはmouseEnabledがfalseになっている表示オブジェクトを全て無視します。
	 * 配列は表示の深度順にソートされており、最前面にあるものがインデックス0となります。
	 * このメソッドはシェイプベースのヒット検出を用いており、処理コストが高いため、注意して使用することを推奨します。
	 * 例えば、マウス化のオブジェクトを検出するときは、mousemoveイベントによって判定するのではなく、tick時、マウスの座標値が変化した場合に限定して使用するとよいでしょう。
	 * @method getObjectsUnderPoint
	 * @param {Number} x コンテナに含まれる検出対象のx座標
	 * @param {Number} y コンテナに含まれる検出対象のy座標
	 * @return {Array} 指定した座標下にあるDisplayObjectの配列
	 **/
	p.getObjectsUnderPoint = function(x, y) {
		var arr = [];
		var pt = this.localToGlobal(x, y);
		this._getObjectsUnderPoint(pt.x, pt.y, arr);
		return arr;
	}

	/**
	 * getObjectsUnderPoint()に類似していますが、最前面にある表示オブジェクトのみを返します。
	 * こちらのメソッドはgetObjectsUnderPoint()よりかなり速く動作しますが、やはり処理は高コストです。
	 * 詳しくはgetObjectsUnderPoint()を参照してください。
	 * @method getObjectUnderPoint
	 * @param {Number} x コンテナに含まれる検出対象のx座標
	 * @param {Number} y コンテナに含まれる検出対象のy座標
	 * @return {DisplayObject} 指定した座標下にある最前面の表示オブジェクト
	 **/
	p.getObjectUnderPoint = function(x, y) {
		var pt = this.localToGlobal(x, y);
		return this._getObjectsUnderPoint(pt.x, pt.y);
	}

	/**
	 * このConainerのクローンを返します。
	 * このインスタンスの現在のコンテキスト特有のいくつかのプロパティはデフォルト値となります（例えば.parentです）。
	 * @param {Boolean} trueの場合、このコンテナの全子孫の再帰的なクローンが行われます。
	 * falseの場合、このコンテナのプロパティのクローンは行われますが、作成されたインスタンスは子を持ちません。
	 * @return {Container} 現在のインスタンスのクローンです。
	 **/
	p.clone = function(recursive) {
		var o = new Container();
		this.cloneProps(o);
		if (recursive) {
			var arr = o.children = [];
			for (var i=0, l=this.children.length; i<l; i++) {
				var clone = this.children[i].clone(recursive);
				clone.parent = o;
				arr.push(clone);
			}
		}
		return o;
	}

	/**
	 * このオブジェクトの文字列表現を返します。
	 * @method toString
	 * @return {String} オブジェクトの文字列表現です。
	 **/
	p.toString = function() {
		return "[Container (name="+  this.name +")]";
	}

// プライベート プロパティ:
	/**
	 * @property DisplayObject__tick
	 * @type Function
	 * @private
	 **/
	p.DisplayObject__tick = p._tick;

	/**
	 * @method _tick
	 * @protected
	 **/
	p._tick = function(params) {
		for (var i=this.children.length-1; i>=0; i--) {
			var child = this.children[i];
			if (child._tick) { child._tick(params); }
		}
		this.DisplayObject__tick(params);
	}

	/**
	 * @method _getObjectsUnderPoint
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Array} arr
	 * @param {Number} mouseEvents 探索するイベントタイプを指定するビットマスク値です。
	 * ビット1はpressとclickとdouble clickを指定し、ビット2はmouse overとmouse outを指定します。
	 * このメソッドの実装は変更の可能性があります。
	 * @return {Array}
	 * @protected
	 **/
	p._getObjectsUnderPoint = function(x, y, arr, mouseEvents) {
		var ctx = createjs.DisplayObject._hitTestContext;
		var canvas = createjs.DisplayObject._hitTestCanvas;
		var mtx = this._matrix;
		var hasHandler = this._hasMouseHandler(mouseEvents);

		// if we have a cache handy & this has a handler, we can use it to do a quick check.
		// we can't use the cache for screening children, because they might have hitArea set.
		if (!this.hitArea && this.cacheCanvas && hasHandler) {
			this.getConcatenatedMatrix(mtx);
			ctx.setTransform(mtx.a,  mtx.b, mtx.c, mtx.d, mtx.tx-x, mtx.ty-y);
			ctx.globalAlpha = mtx.alpha;
			this.draw(ctx);
			if (this._testHit(ctx)) {
				canvas.width = 0;
				canvas.width = 1;
				return this;
			}
		}

		// draw children one at a time, and check if we get a hit:
		var l = this.children.length;
		for (var i=l-1; i>=0; i--) {
			var child = this.children[i];
			var hitArea = child.hitArea;
			if (!child.visible || (!hitArea && !child.isVisible()) || (mouseEvents && !child.mouseEnabled)) { continue; }
			var childHasHandler = mouseEvents && child._hasMouseHandler(mouseEvents);

			// if a child container has a handler and a hitArea then we only need to check its hitArea, so we can treat it as a normal DO:
			if (child instanceof Container && !(hitArea && childHasHandler)) {
				var result;
				if (hasHandler) {
					// only concerned about the first hit, because this container is going to claim it anyway:
					result = child._getObjectsUnderPoint(x, y);
					if (result) { return this; }
				} else {
					result = child._getObjectsUnderPoint(x, y, arr, mouseEvents);
					if (!arr && result) { return result; }
				}
			} else if (!mouseEvents || hasHandler || childHasHandler) {
				child.getConcatenatedMatrix(mtx);

				if (hitArea) {
					mtx.appendTransform(hitArea.x, hitArea.y, hitArea.scaleX, hitArea.scaleY, hitArea.rotation, hitArea.skewX, hitArea.skewY, hitArea.regX, hitArea.regY);
					mtx.alpha = hitArea.alpha;
				}

				ctx.globalAlpha = mtx.alpha;
				ctx.setTransform(mtx.a,  mtx.b, mtx.c, mtx.d, mtx.tx-x, mtx.ty-y);
				(hitArea||child).draw(ctx);
				if (!this._testHit(ctx)) { continue; }
				canvas.width = 0;
				canvas.width = 1;
				if (hasHandler) { return this; }
				else if (arr) { arr.push(child); }
				else { return child; }
			}
		}
		return null;
	};

createjs.Container = Container;
}());
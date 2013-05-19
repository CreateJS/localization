/*
* SpriteSheetUtils
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
// コンストラクタ:
/**
 * SpriteSheetUtilsクラスは、{{#crossLink "SpriteSheet"}}{{/crossLink}}と協調して動作する静的メソッドの集合です。
 * スプライトシートは連続した複数の画像(通常はアニメーションフレーム）が格子状に一枚の画像にまとめられたものです。
 * 例えば、8枚の100x100 の画像によって構成されるアニメーションは、400x200のスプライトシートにまとめることができます（4フレームごとに2列）。
 * SpriteSheetUtils クラスは静的なインターフェースを提供しており、インスタンス化すべきではありません。
 * @class SpriteSheetUtils
 * @static
 **/
var SpriteSheetUtils = function() {
	throw "SpriteSheetUtils cannot be instantiated";
}

	/**
	 * @property _workingCanvas
	 * @static
	 * @type HTMLCanvasElement | Object
	 * @protected
	*/
	SpriteSheetUtils._workingCanvas = createjs.createCanvas?createjs.createCanvas():document.createElement("canvas");

	/**
	 * @property _workingContext
	 * @static
	 * @type CanvasRenderingContext2D
	 * @protected
	*/
	SpriteSheetUtils._workingContext = SpriteSheetUtils._workingCanvas.getContext("2d");

// public static methods:
	/**
	 * <b>これは実験的なメソッドであり、おそらくバグがあります。問題があれば報告してください。</b><br/><br/>
	 * 既存のスプライトシートに対して、元のフレームを水平方向、垂直方向、または両方に反転する形で拡張します。
	 * また、適切なアニメーションとフレームのデータを追加します。反転されたアニメーションは元々のものに接頭辞が追加された名前を持ちます（_h, _v, _hv から適切なもの）。
	 * スプライトシートの画像は、このメソッドを使用する前に完全にロードされるよう気を付けてください。
	 * <br/><br/>
	 * 例:<br/>
	 * SpriteSheetUtils.addFlippedFrames(mySpriteSheet, true, true);
	 * 上の例では、水平方向に反転されたフレームと、垂直方向に反転されたフレームを追加します。
	 * <br/><br/>
	 * 注記として、全ての表示オブジェクトは、scaleXまたはscaleYプロパティをマイナスに設定することでも、反転させることができます。
	 * この方法では、いくつかのブラウザ（特に、ハードウェアアクセラレートされたCanvasを持たないもの）では若干パフォーマンスに悪影響があります。
	 * このことが、addFlippedFramesを使用できるようにしている理由です。
	 * @method addFlippedFrames
	 * @static
	 * @param {SpriteSheet} spriteSheet 
	 * @param {Boolean} horizontal trueの場合、水平に反転されたフレームが追加されます。
	 * @param {Boolean} vertical trueの場合、垂直に反転されたフレームが追加されます。
	 * @param {Boolean} both trueの場合、水平および垂直に反転されたフレームが追加されます。
	 **/
	SpriteSheetUtils.addFlippedFrames = function(spriteSheet, horizontal, vertical, both) {
		if (!horizontal && !vertical && !both) { return; }
		
		var count = 0;
		if (horizontal) { SpriteSheetUtils._flip(spriteSheet,++count,true,false); }
		if (vertical) { SpriteSheetUtils._flip(spriteSheet,++count,false,true); }
		if (both) { SpriteSheetUtils._flip(spriteSheet,++count,true,true); }
	}

	/**
	 * 特定のスプライトシートから、1フレームを新しいPNG画像として返します。
	 * 注意点としては、ほとんど全ての場合において、この方法によりフレームを分割し、Bitmapインスタンスとして表示するよりも、
	 * 一時停止したBitmapAnimationインスタンスを用いたほうがより良い結果になります。
	 * @method extractFrame
	 * @static
	 * @param {Image} spriteSheet フレームを抽出する元となるSpriteSheetインスタンス
	 * @param {Number} frame 抽出したいフレーム番号またはアニメーション名。
	 * アニメーション名が指定された場合、アニメーション中の最初のフレームのみが抽出されます。
	 * @return {Image} 特定のスプライトシートから1フレーム抽出された新しいPNG画像
	*/
	SpriteSheetUtils.extractFrame = function(spriteSheet, frame) {
		if (isNaN(frame)) {
			frame = spriteSheet.getAnimation(frame).frames[0];
		}
		var data = spriteSheet.getFrame(frame);
		if (!data) { return null; }
		var r = data.rect;
		var canvas = SpriteSheetUtils._workingCanvas;
		canvas.width = r.width;
		canvas.height = r.height;
		SpriteSheetUtils._workingContext.drawImage(data.image, r.x, r.y, r.width, r.height, 0, 0, r.width, r.height);
		var img = new Image();
		img.src = canvas.toDataURL("image/png");
		return img;
	}

	/**
	 * 1画像のRGBチャンネルと、別の画像のアルファチャンネルを結合します。
	 * このメソッドでは色のデータを含む圧縮されたJPEG画像とアルファチャンネルを含むモノクロのPNG32画像を使用することも可能です。
	 * 特定の種類の画像（JPEG圧縮としてレンダリングされるような詳細を持つ物）を使用することは、単体のRGBAのPNG32形式画像にくらべて、多大なファイルサイズの節約になります。
	 * このメソッドはとても高速です（通常、実行の度に1～2ms程度）。
	 * @method mergeAlpha
	 * @static
	 * @param {Image} rbgImage RGBチャンネルを持つ画像（またはCanvas）。
	 * @param {Image} alphaImage アルファチャンネルを持つ画像（またはCanvas）。
	 * @param {Canvas} canvas (オプション). 指定した場合、そのCanvasが使用され、戻り値として返されます。それ以外の場合、新しいCanvasが生成されます。
	 * @return {Canvas} 画像データと結合されたCanvas。これはBitmapやSpriteSheetのソースとして使用することができます。
	*/
	SpriteSheetUtils.mergeAlpha = function(rgbImage, alphaImage, canvas) {
		if (!canvas) { canvas = createjs.createCanvas?createjs.createCanvas():document.createElement("canvas"); }
		canvas.width = Math.max(alphaImage.width, rgbImage.width);
		canvas.height = Math.max(alphaImage.height, rgbImage.height);
		var ctx = canvas.getContext("2d");
		ctx.save();
		ctx.drawImage(rgbImage,0,0);
		ctx.globalCompositeOperation = "destination-in";
		ctx.drawImage(alphaImage,0,0);
		ctx.restore();
		return canvas;
	}

	
// private static methods:
	SpriteSheetUtils._flip = function(spriteSheet, count, h, v) {
		var imgs = spriteSheet._images;
		var canvas = SpriteSheetUtils._workingCanvas;
		var ctx = SpriteSheetUtils._workingContext;
		var il = imgs.length/count;
		for (var i=0;i<il;i++) {
			var src = imgs[i];
			src.__tmp = i; // a bit hacky, but faster than doing indexOf below.
			canvas.width = 0; // make sure it clears.
			canvas.width = src.width;
			canvas.height = src.height;
			ctx.setTransform(h?-1:1, 0, 0, v?-1:1, h?src.width:0, v?src.height:0);
			ctx.drawImage(src,0,0);
			var img = new Image();
			img.src = canvas.toDataURL("image/png");
			// work around a strange bug in Safari:
			img.width = src.width;
			img.height = src.height;
			imgs.push(img);
		}
		
		var frames = spriteSheet._frames;
		var fl = frames.length/count;
		for (i=0;i<fl;i++) {
			src = frames[i];
			var rect = src.rect.clone();
			img = imgs[src.image.__tmp+il*count];
			
			var frame = {image:img,rect:rect,regX:src.regX,regY:src.regY};
			if (h) {
				rect.x = img.width-rect.x-rect.width; // update rect
				frame.regX = rect.width-src.regX; // update registration point
			}
			if (v) {
				rect.y = img.height-rect.y-rect.height;  // update rect
				frame.regY = rect.height-src.regY; // update registration point
			}
			frames.push(frame);
		}
		
		var sfx = "_"+(h?"h":"")+(v?"v":"");
		var names = spriteSheet._animations;
		var data = spriteSheet._data;
		var al = names.length/count;
		for (i=0;i<al;i++) {
			var name = names[i];
			src = data[name];
			var anim = {name:name+sfx,frequency:src.frequency,next:src.next,frames:[]};
			if (src.next) { anim.next += sfx; }
			frames = src.frames;
			for (var j=0,l=frames.length;j<l;j++) {
				anim.frames.push(frames[j]+fl*count);
			}
			data[anim.name] = anim;
			names.push(anim.name);
		}
	}
	

createjs.SpriteSheetUtils = SpriteSheetUtils;
}());
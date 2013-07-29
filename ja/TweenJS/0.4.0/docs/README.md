# TweenJS

TweenJS は JavaScript のためのシンプルなトゥイーンエンジンです。
EaselJS ライブラリと統合しやすいように開発されていますが、依存しておらず、特有のものはありません（でも、デフォルトでは同じ Ticker クラスを使用しています）。
オブジェクトの数値系のプロパティと CSS スタイルプロパティの両方のトゥイーンをサポートしています。

## Example

API はシンプルですがとてもパワフルで、チェインコマンドによって複雑なトゥイーンを簡単に作ることが出来ます。

    var tween = createjs.Tween.get(myTarget).to({x:300},400).set({label:"hello!"}).wait(500).to({alpha:0,visible:false},1000).call(onComplete);

この上の例では、下記のような新しいトゥイーンインスタンスを作成します。

* あるターゲットの x の値を 400ms で 300 にし、"Hello!" というラベルをセットします。
* 500ms 一時停止します。
* ターゲットの透明度を 1秒 で 0 にし、さらに visible を false に設定します。
* onComplete 関数を呼び出します。

トゥイーンは二つの要素で構成されています：ステップとアクション

ステップはトゥイーン後のプロパティと一緒にそれにかかる時間をワンセットで定義します（かかる時間が 0 であっても）。
ステップは "to" と "wait" メソッドがあります。
ステップはひたすら定義です。
任意でトゥイーンの位置を指定できますし、つねに同じ位置に同じプロパティを設定できます。

アクションは時間を持たず、ステップの間に実行されます。
"call"、"set"、"play"、"pause" メソッドがあります。
これらはただしい順序で実行されますが、シーケンスの中での厳密な瞬間の時間で実行されるわけでは有りません。
play と pause のアクションによってトゥイーンをインタラクションさせるなど、様々なことを実現する事が出来ます。

このライブラリは alpha です。テスト中で（大規模にはやっていません）、何か変更が行われる可能性があります。

トゥイーンは不特定多数のコンフィギュレーションプロパティをサポートしており、新しいトゥイーンを作成するときの第二引数で指定できます：

createjs.Tween.get(target, {loop:true, useTicks:true, css:true, ignoreGlobalPause:true}).to(etc...);

全てのコンフィギュレーションプロパティはデフォルトでは false になっています。
そのプロパティは：

loop - トゥイーンが終了したらループするかどうかを指定します
useTicks - トゥイーンの時間を、ミリ秒ではなくティックで動作するようにします
css - いくつかの CSS プロパティの CSS マッピングを有効にします
ignoreGlobalPause - Ticker が一時停止してもトゥイーンの時間は進めるようにします

Tween.get を使ったとき、第三引数を true に指定するとターゲット上のアクティブなトゥイーンを上書きすることもできます。
createjs.Tween.get(target,null,true); // ターゲットに既に設定されているトゥイーンを上書きします。


## Support and Resources

* サンプルと更なる情報は [TweenJS website](http://tweenjs.com/)
* 熟読：[documetation](http://createjs.com/Docs/TweenJS/)
* 質問や他のユーザーとの議論は [Community](http://community.createjs.com) サイトへ。
* 詳細な情報は [examples](https://github.com/CreateJS/TweenJS/tree/master/examples) and [API documentation](http://createjs.com/Docs/TweenJS/) をごらんください。

[gskinner.com](http://www.gskinner.com) が開発しており、MIT license 下でフリーでリリースされており、つまり大抵のことにお使いいただけると言う事です（商用利用も可）。クレジット表記が可能であればうれしいですが、必須ではありません。

TweenJS は現在 alpha です。我々は近いうちに、ライブラリ、サンプル、ドキュメントなどに大きな改良を行っています。既存の API に変更が加わる可能性がある事に注意してください。

## Classes

**Tween**
新しい Tween インスタンスを返します。

**Timeline**
Timeline クラスは複数のトゥイーンを同期し、グループとして管理する事ができます。

**Ease**
Ease クラスは TweenJS に対してイージング関数を提供します。標準の 4 つのイージングに指定するパラメータは使いません。一つのパラメータで 0 から 1 のリニアなトゥイーンを指定できます。

## Thanks

Ease クラスの基礎は、[Robert Penner](http://flashblog.robertpenner.com/) のイージング関数のおかげです。



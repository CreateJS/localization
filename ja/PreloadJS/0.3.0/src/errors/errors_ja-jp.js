var logs = {
	PRELOAD_NO_FILE: "指定されたファイルは nul です。",
	PRELOAD_MANIFEST_EMPTY: "指定されたマニフェストにはロードするファイルが含まれていません。",
	PRELOAD_MANIFEST_NULL: "指定されたマニフェストは null です。",
	POLYFILL_BIND: "Function.bind PolyFill を使用します。",
	POLYFILL_INDEXOF: "Array.indexOf PolyFill を使用します。"
}
createjs && createjs.Log && createjs.Log.addKeys(logs);
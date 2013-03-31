(function() {
	var logs = {
		AUDIO_FAILED_404: "ファイル %DETAILS が再生できません。404 ファイルが見つかりませんでした。",
		AUDIO_FAILED_INTERRUPT: "ファイル %DETAILS% が再生できません。割り込みに利用可能なチャネルがありません。",
		AUDIO_FAILED_NOT_LOADED: "ファイル %DETAILS% が再生できません。まだ読み込みが未完了です。",
		AUDIO_FLASH_FAILED: "Flash を初期化することができませんでした。"
	}
	createjs.Log && createjs.Log.addKeys(logs);
}())
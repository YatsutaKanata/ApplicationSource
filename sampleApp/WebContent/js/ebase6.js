/**
 * javascript for ebase6
 */
$(function(){

	var messages = {}; //メッセージ配列
	var msgidlist = [ 'TOPDBEXE','BTNSUBMIT','BTNSUBMIT','BTNSUBMIT','LBXMLKEY','LBXMLSELCT','ADDWORK' ];

	//POST処理作成
	$.postJSON = function(url, data, callback) {
		$.post(url, data, callback, "json");
	};

	//初回稼働時
	$(document).ready(function(){
		//ラングコードを取得
		var lang = navigator.language || navigator.userLanguage;
		if(lang != "ja") lang="en";
		//メッセージ配列の生成
		$.postJSON("DQube",{actionID:'MSGGET01' ,ids:msgidlist , lang:lang}, function(jres){
			for(j=0;j<msgidlist.length;j++){
				id = msgidlist[j];
				messages[id] = jres.message[id];
			}
		});
	});

	//ALL menu close
	function menuClose() {
		$('#ebase6_shadow').css('display', 'none');
		$('#ebase6_menulist').css('display', 'none');
		$('#ebase6_popup').css('display', 'none');
	};

	//初期処理
	$('a[id=initialsetup]').click(function(){
		$.postJSON("DQube",{actionID:'INITILIZ'}, function(jres){
			alert(jres.result["result"]);
			return false;
		});
	});

	// 2018-03-22 M.Enya Add
	// 追加処理
	function addWork() {
		//var sql = prompt("input sql","");
		var id = $('#ebase6_popup_id').val();
		var value = $('#ebase6_popup_value').val();

		$('#dataTable').remove();
		$('#ebase6_pamview').remove();

		var field = document.getElementById("datafield");

		var pamView = document.createElement("div");
		field.appendChild(pamView);
		pamView.className = "ebase6_pamview";
		pamView.id = "ebase6_pamview";

		var table = document.createElement("table");
		field.appendChild(table);
		table.className = "tablesorter";
		table.id = "dataTable";

		//submit処理開始
		//$.ajaxSetup({ async: false }); //同期
		$.postJSON("DQube",{actionID:'ADDWORK01',id:id, value:value}, function(jres){

			pamView.innerHTML="SQL [ " + jres.pams["sql"] + " ]";

			//DOM型で要素をAppendしていく
			var theadElem = document.createElement("thead");
			var trElem = document.createElement("tr");
			table.appendChild(theadElem);
			theadElem.appendChild(trElem);

			var ssSearch = document.getElementById("ss_select");

			for(i=0;i<jres.keys.length;i++){
				//テーブルにカラム名を表示
				var col = jres.keys[i];
				var thElem = document.createElement("th");
				trElem.appendChild(thElem);
				thElem.className = jres.tblColData[col]["classname"];
				thElem.innerHTML=jres.tblColData[col]["name"];
			}

			//データ行を作成
			var tbodyElem = document.createElement("tbody");
			table.appendChild(tbodyElem);

			//データのヒットがない場合、空行を作成
			if(jres.tblData.length==0){
				var trElem = document.createElement("tr");
				tbodyElem.appendChild(trElem);
				for(i=0;i<jres.keys.length;i++){
					var tdElem = document.createElement("td");
					trElem.appendChild(tdElem);
				}
			}

			for(j=0;j<jres.tblData.length;j++){ //データの書きだし
				var trElem = document.createElement("tr");
				tbodyElem.appendChild(trElem);
				for(i=0;i<jres.keys.length;i++){
					var tdElem = document.createElement("td");
					trElem.appendChild(tdElem);
					tdElem.style.background = "#fff";
					var col = jres.keys[i];
					tdElem.innerHTML = jres.tblData[j][col];
				}
			}


			$("#dataTable").tablesorter({
				widgets: ['zebra'],
				sortList: [[0, 1]]
			});
			$("#dataTable").trigger("update");

			//$.ajaxSetup({ async: true }); //同期の解除
			return false;
		});
	}
	$('a[id=addWork]').click(function(){
		$('#ebase6_popup').css('width', '300');
		$('#ebase6_popup').css('height', '200');
		$('#ebase6_popup').css('margin', '-150px 0 0 -100px');
		$('#ebase6_shadow').css('display', 'block'); //他入力欄をシャドウ化
		$('#ebase6_popup').css('display', 'block'); //ポップアップ表示
		$('#ebase6_popup_title').html(messages['ADDWORK']); //ポップアップにメッセージ表示
		$('#ebase6_popup_body').empty(); //ボディ初期化
		$('#ebase6_popup_foot').empty(); //フッター初期化
		//実行ボタン作成
		var btn = document.createElement("input");
		btn.setAttribute('type',"button");
		btn.setAttribute('value',messages['BTNSUBMIT']);
		btn.setAttribute('id',"ebase6_popup_submit");
		$('#ebase6_popup_foot').append(btn);
		$('#ebase6_popup_submit').off("click"); //実行ボタンの処理を初期化
		$('#ebase6_popup_submit').on("click" , addWork ); //実行ボタンの処理変更
		$('#ebase6_popup_submit').on("click" , menuClose ); //ポップアップを閉じる
		//入力欄作成
		var id_inp = document.createElement("textarea");
		id_inp.setAttribute('id',"ebase6_popup_id");
		id_inp.style.cssText = 'position:absolute;left:0;width:128px;height:64px;';
		$('#ebase6_popup_body').append(id_inp);
		//入力欄作成
		var value_inp = document.createElement("textarea");
		value_inp.setAttribute('id',"ebase6_popup_value");
		value_inp.style.cssText = 'position:absolute;right:0;width:128px;height:64px;';
		$('#ebase6_popup_body').append(value_inp);
	});
	// 2018-03-22 M.Enya Add
	//DB処理
	function sqlExecute() {
		//var sql = prompt("input sql","");
		var sql = $('#ebase6_popup_sql').val();

		$('#dataTable').remove();
		$('#ebase6_pamview').remove();

		var field = document.getElementById("datafield");

		var pamView = document.createElement("div");
		field.appendChild(pamView);
		pamView.className = "ebase6_pamview";
		pamView.id = "ebase6_pamview";

		var table = document.createElement("table");
		field.appendChild(table);
		table.className = "tablesorter";
		table.id = "dataTable";

		//submit処理開始
		//$.ajaxSetup({ async: false }); //同期
		$.postJSON("DQube",{actionID:'SQLEXE01',sqltxt:sql}, function(jres){

			pamView.innerHTML="SQL [ " + jres.pams["sql"] + " ]";

			//DOM型で要素をAppendしていく
			var theadElem = document.createElement("thead");
			var trElem = document.createElement("tr");
			table.appendChild(theadElem);
			theadElem.appendChild(trElem);

			var ssSearch = document.getElementById("ss_select");

			for(i=0;i<jres.keys.length;i++){
				//テーブルにカラム名を表示
				var col = jres.keys[i];
				var thElem = document.createElement("th");
				trElem.appendChild(thElem);
				thElem.className = jres.tblColData[col]["classname"];
				thElem.innerHTML=jres.tblColData[col]["name"];
			}

			//データ行を作成
			var tbodyElem = document.createElement("tbody");
			table.appendChild(tbodyElem);

			//データのヒットがない場合、空行を作成
			if(jres.tblData.length==0){
				var trElem = document.createElement("tr");
				tbodyElem.appendChild(trElem);
				for(i=0;i<jres.keys.length;i++){
					var tdElem = document.createElement("td");
					trElem.appendChild(tdElem);
				}
			}

			for(j=0;j<jres.tblData.length;j++){ //データの書きだし
				var trElem = document.createElement("tr");
				tbodyElem.appendChild(trElem);
				for(i=0;i<jres.keys.length;i++){
					var tdElem = document.createElement("td");
					trElem.appendChild(tdElem);
					tdElem.style.background = "#fff";
					var col = jres.keys[i];
					tdElem.innerHTML = jres.tblData[j][col];
				}
			}


			$("#dataTable").tablesorter({
				widgets: ['zebra'],
				sortList: [[0, 1]]
			});
			$("#dataTable").trigger("update");

			//$.ajaxSetup({ async: true }); //同期の解除
			return false;
		});
	}
	$('a[id=dbexe]').click(function(){
		$('#ebase6_popup').css('width', '300');
		$('#ebase6_popup').css('height', '200');
		$('#ebase6_popup').css('margin', '-150px 0 0 -100px');
		$('#ebase6_shadow').css('display', 'block'); //他入力欄をシャドウ化
		$('#ebase6_popup').css('display', 'block'); //ポップアップ表示
		$('#ebase6_popup_title').html(messages['TOPDBEXE']); //ポップアップにメッセージ表示
		$('#ebase6_popup_body').empty(); //ボディ初期化
		$('#ebase6_popup_foot').empty(); //フッター初期化
		//実行ボタン作成
		var btn = document.createElement("input");
		btn.setAttribute('type',"button");
		btn.setAttribute('value',messages['BTNSUBMIT']);
		btn.setAttribute('id',"ebase6_popup_submit");
		$('#ebase6_popup_foot').append(btn);
		$('#ebase6_popup_submit').off("click"); //実行ボタンの処理を初期化
		$('#ebase6_popup_submit').on("click" , sqlExecute ); //実行ボタンの処理変更
		$('#ebase6_popup_submit').on("click" , menuClose ); //ポップアップを閉じる
		//入力欄作成
		var inp = document.createElement("textarea");
		inp.setAttribute('id',"ebase6_popup_sql");
		inp.style.cssText = 'position:absolute;left:0;width:295px;height:128px;';
		$('#ebase6_popup_body').append(inp);
	});

	//XML処理
	function xmlExecute() {
		var xml = $('#ebase6_popup_xml').val();
		var key = $('#ebase6_popup_xmlkey').val();

		$('#dataTable').remove();
		$('#ebase6_pamview').remove();

		var field = document.getElementById("datafield");

		var pamView = document.createElement("div");
		field.appendChild(pamView);
		pamView.className = "ebase6_pamview";
		pamView.id = "ebase6_pamview";

		var table = document.createElement("table");
		field.appendChild(table);
		table.className = "tablesorter";
		table.id = "dataTable";

		//submit処理開始
		//$.ajaxSetup({ async: false }); //同期
		$.postJSON("DQube",{actionID:'XMLEXE01' , xmlfile:xml, xmlKey:key}, function(jres){

			pamView.innerHTML="XML [ " + jres.pams["xml"] + " ] KEY [ " + jres.pams["key"] + " ]";

			//DOM型で要素をAppendしていく
			var theadElem = document.createElement("thead");
			var trElem = document.createElement("tr");
			table.appendChild(theadElem);
			theadElem.appendChild(trElem);

			var ssSearch = document.getElementById("ss_select");

			for(i=0;i<jres.keys.length;i++){
				//テーブルにカラム名を表示
				var col = jres.keys[i];
				var thElem = document.createElement("th");
				trElem.appendChild(thElem);
				thElem.className = jres.tblColData[col]["classname"];
				thElem.innerHTML=jres.tblColData[col]["name"];

			}

			//データ行を作成
			var tbodyElem = document.createElement("tbody");
			table.appendChild(tbodyElem);

			//データのヒットがない場合、空行を作成
			if(jres.tblData.length==0){
				var trElem = document.createElement("tr");
				tbodyElem.appendChild(trElem);
				for(i=0;i<jres.keys.length;i++){
					var tdElem = document.createElement("td");
					trElem.appendChild(tdElem);
				}
			}

			for(j=0;j<jres.tblData.length;j++){ //データの書きだし
				var trElem = document.createElement("tr");
				tbodyElem.appendChild(trElem);
				for(i=0;i<jres.keys.length;i++){
					var tdElem = document.createElement("td");
					trElem.appendChild(tdElem);
					tdElem.style.background = "#fff";
					var col = jres.keys[i];
					tdElem.innerHTML = jres.tblData[j][col];
				}
			}


			$("#dataTable").tablesorter({
				widgets: ['zebra'],
				sortList: [[0, 1]]
			});
			$("#dataTable").trigger("update");

			//$.ajaxSetup({ async: true }); //同期の解除
			return false;
		});
	}
	$('a[id=xmlexe]').click(function(){
		$('#ebase6_popup').css('width', '300');
		$('#ebase6_popup').css('height', '200');
		$('#ebase6_popup').css('margin', '-150px 0 0 -100px');
		$('#ebase6_shadow').css('display', 'block'); //他入力欄をシャドウ化
		$('#ebase6_popup').css('display', 'block'); //ポップアップ表示
		$('#ebase6_popup_title').html(messages['TOPXMLEXE']); //ポップアップにメッセージ表示
		$('#ebase6_popup_body').empty(); //ボディ初期化
		$('#ebase6_popup_foot').empty(); //フッター初期化
		//実行ボタン作成
		var btn = document.createElement("input");
		btn.setAttribute('type',"button");
		btn.setAttribute('value',messages['BTNSUBMIT']);
		btn.setAttribute('id',"ebase6_popup_submit");
		$('#ebase6_popup_foot').append(btn);
		$('#ebase6_popup_submit').off("click"); //実行ボタンの処理を初期化
		$('#ebase6_popup_submit').on("click" , xmlExecute ); //実行ボタンの処理変更
		$('#ebase6_popup_submit').on("click" , menuClose ); //ポップアップを閉じる
		//入力欄作成
		var $label1 = $('<label>'+messages['LBXMLSELCT']+'</label>');
		$('#ebase6_popup_body').append($label1);
		$('#ebase6_popup_body').append("<br>");
		var sect = document.createElement("select");
		sect.setAttribute('id',"ebase6_popup_xml");
		sect.style.cssText = 'width:295px';
		$('#ebase6_popup_body').append(sect);
		var characters = {
			System: 'control/system.xml',
			Control: 'control/control.xml',
			Message: 'control/message.xml',
			Column: 'control/colname.xml'
			},
			$select = $('#ebase6_popup_xml'),
		    $option,
		    isSelected;
		$.each(characters, function (name, value) {
		    isSelected = (value === 'Control');
		    $option = $('<option>')
		        .val(value)
		        .text(name)
		        .prop('selected', isSelected);
		    $select.append($option);
		});
		$('#ebase6_popup_body').append("<br>");
		var $label2 = $('<label>'+messages['LBXMLKEY']+'</label>');
		$('#ebase6_popup_body').append($label2);
		$('#ebase6_popup_body').append("<br>");
		var inp = document.createElement("input");
		inp.setAttribute('type',"text");
		inp.setAttribute('id',"ebase6_popup_xmlkey");
		$('#ebase6_popup_body').append(inp);
	});

	//メンテナンスボタンをクリック
	$('#ebase6_conmenu_mente').click(function(){
		if($('#ebase6_menulist').css('display') == "block"){
			menuClose();
		}else{
			$('#ebase6_menulist').css('display', 'block');
		}

	});

	//ログオン処理
	$('#ebase6_logon').click(function(){
		$('#ebase6_initial_body').css('display', 'none');
		$('#ebase6_shadow').css('display', 'none');
	});

	//ポップアップクローズ
	$('#ebase6_popup_close').click(function(){
		$('#ebase6_popup').css('display', 'none');
		$('#ebase6_shadow').css('display', 'none');
	});

	/* NAVIGATION FRAME */
	var navPX = $("#ebase6_nav").offset().left + window.pageXOffset;
	var navPY = $("#ebase6_nav").offset().top + window.pageYOffset;
	var winTop = $("#ebase6_body").scrollTop();
	$("#ebase6_nav").css('position','absolute');
	$("#ebase6_nav").animate({top: winTop + "px"}, "slow");

	//スクロールをするたびに実行
	$("#ebase6_body").scroll(function () {
		winTop = $("#ebase6_body").scrollTop();
		$("#ebase6_nav").stop(); //これがないと連続して実行されたときに変な動きになります。
		$("#ebase6_nav").css('position','absolute');
		$("#ebase6_nav").animate({top: winTop + "px"}, "slow");

	});
});


//2018-3-27 T.Tatsuya Add
//追加処理
document.getElementById("#goodsView").click = function() {
	document.getElementById("#ebase6_submenu").innerHTML = "在庫管理";
	};



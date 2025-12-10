$(document).ready(function() {
	let poems = {}; // JSON 資料
	const lotsRatio = [20, 20, 15, 15, 20, 10]; // lots 1~6 機率
	const bobeiRatio = [40, 30, 20, 10]; // bobei 1~4 機率

	// 工具函式：加入訊息
	function appendMsg(content, type) {
		// 對使用者訊息做 HTML escape，並保留換行（轉為 <br>）
		function escapeHtml(str) {
			if (typeof str !== 'string') return str;
			return str
				.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;')
				.replace(/'/g, '&#39;');
		}
		let out = content;
		if (type === 'msg-user') {
			out = escapeHtml(String(content)).replace(/\n/g, '<br>');
		}
		$("#chatArea").append(`<div class="message ${type}">${out}</div>`);
		$("#chatArea").scrollTop($("#chatArea")[0].scrollHeight);
	}

	// 按機率抽籤
	function pickWithRatio(ratioArray) {
		const rand = Math.random() * 100;
		let sum = 0;
		for (let i = 0; i < ratioArray.length; i++) {
			sum += ratioArray[i];
			if (rand <= sum) return i + 1;
		}
		return ratioArray.length;
	}

	function drawLots() {
		const lotIndex = pickWithRatio(lotsRatio);
		const bobeiIndex = pickWithRatio(bobeiRatio);
		return { lotIndex, bobeiIndex };
	}

	// 回應使用者
	function answerUser(action, input) {
		switch (action) {
			case "御神籤": {
				const r = drawLots();
				const c = `<img src="./img/lots_${r.lotIndex}.jpg" style="width:60px;height:60px;object-fit:cover;">`;
				appendMsg(c, "msg-bot");
				break;
			}

			case "擲筊": {
				const r = drawLots();
				const c = `<img src="./img/bobei_${r.bobeiIndex}.jpg" style="width:60px;height:60px;object-fit:cover;">`;
				appendMsg(c, "msg-bot");
				break;
			}

			case "籤筊": {
				const r = drawLots();
				const c = `
        <img src="./img/lots_${r.lotIndex}.jpg" style="width:60px;height:60px;object-fit:cover;">
        <img src="./img/bobei_${r.bobeiIndex}.jpg" style="width:60px;height:60px;object-fit:cover;">
      `;
				appendMsg(c, "msg-bot");
				break;
			}

			case "籤詩": {
				const levels = Object.keys(poems);
				if (!levels.length) return appendMsg("籤詩尚未載入，請稍候…", "msg-bot");

				const level = levels[Math.floor(Math.random() * levels.length)];
				const list = poems[level];
				if (!list || !list.length) return appendMsg("此等級籤詩資料尚未準備好", "msg-bot");

				const pick = list[Math.floor(Math.random() * list.length)];
				const c = `
        <div><strong>【${level}】</strong></div>
        <div><strong>${pick.poem.replace(/\n/g, "<br>")}</strong></div>
        <div>${pick.meaning}</div>
      `;
				appendMsg(c, "msg-bot");
				break;
			}

			case "骰子": {
  let max = parseInt($("#diceFaces").val(), 10);

  // 沒填 or 非數字 → 視為 6 面骰
  if (!max || isNaN(max) || max < 1) max = 6;

  const num = Math.floor(Math.random() * max) + 1;

  const colors = [
    "#E8A0A0","#E6A9C2","#D09AD8",
    "#9FB9E3","#8EC5BB","#A7D28C",
    "#F0C36C","#E5A97A"
  ];
  const bg = colors[Math.floor(Math.random() * colors.length)];

  const box = `
    <div style="
      display:inline-flex;
      justify-content:center;
      align-items:center;
      width:60px;
      height:60px;
      background:${bg};
      border-radius:12px;
      font-weight:bold;
      color:#fff;
      font-size:28px;
      font-family:'Comic Sans MS','Chalkboard SE','Microsoft JhengHei UI',sans-serif;
    ">
      ${num}
    </div>
  `;
  appendMsg(box, "msg-bot");
  break;
}


			default:
				appendMsg(input, "msg-bot");
		}
	}

$("#actionSelect").change(function () {
  const action = $(this).val();
  const $wrap = $("#diceInputWrap");

  if (action === "骰子") {
    $wrap.html(`
      <input id="diceFaces" class="form-control" 
             placeholder="請輸入骰子面數（預設6面）"
             type="number" 
             min="1" 
             max="999" 
             value="6">
    `);
    $('#sendBtn').addClass('w-100'); 
  } else {
    $wrap.empty(); // 清空
  }
});


	// 載入 JSON
	$.getJSON("./papers.json", function(data) {
		poems = data;
	});

	// 打開/關閉 modal
	// toggle 開關 modal
	$("#btn-witch").click(() => {
		if ($("#witchModal").is(":visible")) {
			$("#witchModal").fadeOut(150);
		} else {
			$("#witchModal").fadeIn(150);
		}
	});
	$("#closeModal").click(() => {
		$("#witchModal").fadeOut(150);
	});

	// 送出訊息事件（綁定一次即可）
	function sendMessage() {
		const val = $("#userInput").val().trim();
		const action = $("#actionSelect").val();

		if (!val && action === "input") return;

		if (action === "input") appendMsg(val, "msg-user");
		else appendMsg(val || action, "msg-user");

		$("#userInput").val("");
		setTimeout(() => answerUser(action, val), 400);
	}

	$("#sendBtn").click(sendMessage);
$("#userInput").keydown(function (e) {
  if (e.key === "Enter") {
    if (e.shiftKey) {
      // Shift + Enter → 換行，不送出
      return; 
    } else {
      // Enter → 送出
      e.preventDefault(); // 阻止預設換行
      sendMessage();
    }
  }
});

});

$(document).ready(function() {
	let countdownInterval;
	const saved = localStorage.getItem("levelCalcData");
	if (saved) {
		const data = JSON.parse(saved);
		$("#level").val(data.level);
		$("#totalExp").val(data.totalExp);
		$("#currentExp").val(data.currentExp);
		$("#expPerHour").val(data.expPerHour);
		$("#recordTime").val(data.recordTime);
		$("#freeBoost").prop("checked", data.freeBoost || false);
		$("#crystalBoostCheck").prop("checked", data.crystalBoostCheck || false);
		$("#crystalCount").val(data.crystalCount || 0);
	}
	function saveData() {
		const data = {
			level: $("#level").val(),
			totalExp: $("#totalExp").val(),
			currentExp: $("#currentExp").val(),
			expPerHour: $("#expPerHour").val(),
			recordTime: $("#recordTime").val(),
			freeBoost: $("#freeBoost").prop("checked"),
			crystalBoostCheck: $("#crystalBoostCheck").prop("checked"),
			crystalCount: $("#crystalCount").val(),
		};
		localStorage.setItem("levelCalcData", JSON.stringify(data));
	}
	function startCountdown(levelUpTime) {
		if (countdownInterval) clearInterval(countdownInterval);
		function updateCountdown() {
			const now = new Date();
			let diff = levelUpTime - now;
			if (diff <= 0) {
				$("#countdown").text("已升等！");
				clearInterval(countdownInterval);
				return;
			}
			const hours = Math.floor(diff / 3600000);
			diff -= hours * 3600000;
			const minutes = Math.floor(diff / 60000);
			diff -= minutes * 60000;
			const seconds = Math.floor(diff / 1000);
			$("#countdown").text(`距離升等剩餘：${hours} 小時 ${minutes} 分 ${seconds} 秒`);
		}
		updateCountdown();
		countdownInterval = setInterval(updateCountdown, 1000);
	}
	function calculate() {
		console.log("test");
		const level = Number($("#level").val());
		const totalExp = Number($("#totalExp").val());
		const currentExp = Number($("#currentExp").val());
		const expPerHour = Number($("#expPerHour").val());
		const recordTimeVal = $("#recordTime").val();
		console.log("data", level, totalExp, currentExp, expPerHour, recordTimeVal);
		if (!recordTimeVal || !totalExp || !currentExp || !expPerHour) {
			$("#result").text("請輸入完整資料。");
			$("#countdown").text("");
			return;
		}
		let recordTime = new Date(recordTimeVal);
		let neededExp = totalExp - currentExp;
		let hoursToLevelUp = neededExp / expPerHour;
		let levelUpTime = new Date(recordTime.getTime() + hoursToLevelUp * 3600000);
		// 處理加速
		let boostHours = 0;
		if ($("#freeBoost").prop("checked")) boostHours += 2;
		if ($("#crystalBoostCheck").prop("checked")) {
			const crystals = Number($("#crystalCount").val()) || 0;
			boostHours += crystals * 2;
		}
		levelUpTime = new Date(levelUpTime.getTime() - boostHours * 3600000);
		const resultText = `目前等級：${level} <br>所需經驗：${neededExp.toLocaleString()} <br>預計升級時間：${levelUpTime.toLocaleString()}`;
		$("#result").html(resultText);
		saveData();
		startCountdown(levelUpTime);
	}
	$(
		"#level, #totalExp, #currentExp, #expPerHour, #recordTime, #freeBoost, #crystalBoostCheck, #crystalCount"
	).on("input change", calculate);
	$("#updateTimeBtn").click(function() {
		const now = new Date();
		const pad = n => n.toString().padStart(2, "0");
		const yyyy = now.getFullYear();
		const mm = pad(now.getMonth() + 1);
		const dd = pad(now.getDate());
		const hh = pad(now.getHours());
		const mi = pad(now.getMinutes());
		$("#recordTime").val(`${yyyy}-${mm}-${dd}T${hh}:${mi}`);
		calculate();
	});
	$("#clearBtn").click(function() {
		$("#level, #totalExp, #currentExp, #expPerHour, #recordTime").val("");
		$("#freeBoost").prop("checked", false);
		$("#crystalBoostCheck").prop("checked", false);
		$("#crystalCount").val(0);
		$("#result").text("");
		$("#countdown").text("");
		if (countdownInterval) clearInterval(countdownInterval);
		localStorage.removeItem("levelCalcData");
	});
	calculate();
});

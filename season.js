// season.js - 賽季專用腳本
// 依賴 jQuery，請在 season.html 中於此檔之前載入 jQuery

/*
  程式分成幾個區塊：
  - 常數資料 (slotEffects)
  - 計算函式 (computeScores / performCalculation)
  - UI 事件綁定（遺物雙向同步、經驗計算、模態框）
  - 儲存機制：使用 localStorage（替代原本 cookie）
*/

const slotEffects = [
	{ need: 56, effect: "裝備升華3%", import: false },
	{ need: 72, effect: "寶石獲取5%", import: false },
	{ need: 88, effect: "副本翻倍2%", import: false },
	{ need: 104, effect: "經驗獲取2%", import: true },
	{ need: 128, effect: "裝備升華3%", import: false },
	{ need: 152, effect: "寶石獲取5%", import: false },
	{ need: 176, effect: "副本翻倍2%", import: false },
	{ need: 200, effect: "經驗獲取2%", import: true },
	{ need: 230, effect: "裝備升華3%", import: false },
	{ need: 260, effect: "寶石獲取5%", import: false },
	{ need: 290, effect: "副本翻倍2%", import: false },
	{ need: 320, effect: "經驗獲取2%", import: true },
	{ need: 360, effect: "裝備升華3%", import: false },
	{ need: 400, effect: "寶石獲取5%", import: false },
	{ need: 440, effect: "副本翻倍2%", import: false },
	{ need: 480, effect: "經驗獲取2%", import: true },
	{ need: 530, effect: "裝備升華3%", import: false },
	{ need: 580, effect: "寶石獲取5%", import: false },
	{ need: 630, effect: "副本翻倍2%", import: false },
	{ need: 680, effect: "經驗獲取2%", import: true },
	{ need: 740, effect: "裝備升華3%", import: false },
	{ need: 800, effect: "寶石獲取5%", import: false },
	{ need: 860, effect: "副本翻倍2%", import: false },
	{ need: 920, effect: "經驗獲取2%", import: true },
	{ need: 990, effect: "裝備升華3%", import: false },
	{ need: 1060, effect: "寶石獲取5%", import: false },
	{ need: 1130, effect: "副本翻倍2%", import: false },
	{ need: 1200, effect: "經驗獲取2%", import: true },
	{ need: 1280, effect: "裝備升華3%", import: false },
	{ need: 1360, effect: "寶石獲取5%", import: false },
	{ need: 1440, effect: "副本翻倍2%", import: false },
	{ need: 1520, effect: "經驗獲取2%", import: true },
];
const scoreRules = {
	1: {
		// season 1 defaults (editable later)
		rolePerLevel: 100,
		equipPerLevel: 18,
		skillPerLevel: 7,
		beastPerLevel: 8,
		relicPerLevel: 33,
		baseLevel: 100,
		relicBase: 13,
		equipCount: 5,
		skillCount: 8,
		beastCount: 4,
		relicCount: 5,
		relicScale: 20,
		seasonBonusCore: 0,
	},
	2: {
		rolePerLevel: 100,
		equipPerLevel: 18,
		skillPerLevel: 7,
		beastPerLevel: 8,
		relicPerLevel: 33,
		// base levels used for subtraction
		baseLevel: 130,
		relicBase: 13,
		// counts / multipliers
		equipCount: 5,
		skillCount: 8,
		beastCount: 4,
		relicCount: 5,
		relicScale: 20,
		seasonBonusCore: 45,
	},
	3: {
		// season 3 defaults (initially same as season 2)
		rolePerLevel: 100,
		equipPerLevel: 18,
		skillPerLevel: 7,
		beastPerLevel: 8,
		relicPerLevel: 33,
		baseLevel: 130,
		relicBase: 13,
		equipCount: 5,
		skillCount: 8,
		beastCount: 4,
		relicCount: 5,
		relicScale: 20,
		seasonBonusCore: 0,
	},
};
// --------------------
// 計算核心：回傳分數與欄位資訊
// --------------------
function computeScores() {
	const season = parseInt($("#seasonSelect").val(), 10) || 2;
	// scoring rules per season (centralized JSON-like config)

	const rule = scoreRules[season] || scoreRules[2];
	// 使用 startLevel（若尚無則退回到 baseLevel 舊值）
	const baseLevel = "startLevel" in rule ? rule.startLevel : rule.baseLevel;

	// 角色
	const roleLevel = parseFloat($("#roleLevel").val()) || 0;
	const roleScore = (roleLevel - baseLevel) * rule.rolePerLevel;

	// 裝備 (使用平均 * count * perLevel)
	const equips = $(".equip").map((_, e) => parseFloat(e.value) || 0).get();
	const equipAvg = equips.reduce((a, b) => a + b, 0) / rule.equipCount;
	const equipScore =
		(equipAvg - baseLevel) * rule.equipPerLevel * rule.equipCount;

	// 技能
	const skills = $(".skill").map((_, e) => parseFloat(e.value) || 0).get();
	const skillAvg = skills.reduce((a, b) => a + b, 0) / rule.skillCount;
	const skillScore =
		(skillAvg - baseLevel) * rule.skillPerLevel * rule.skillCount;

	// 幻獸
	const beasts = $(".beast").map((_, e) => parseFloat(e.value) || 0).get();
	const beastAvg = beasts.reduce((a, b) => a + b, 0) / rule.beastCount;
	const beastScore =
		(beastAvg - baseLevel) * rule.beastPerLevel * rule.beastCount;

	// 遺物：使用大欄位平均與配置的 relicPerLevel / relicScale
	const relicBigs = $(".relic-big")
		.map((_, e) => parseFloat(e.value) || 0)
		.get();
	const relicAvg = relicBigs.reduce((a, b) => a + b, 0) / rule.relicCount;
	const relicScore = Math.round(
		(relicAvg - rule.relicBase) * rule.relicPerLevel * rule.relicScale
	);

	const totalScore =
		roleScore + equipScore + skillScore + beastScore + relicScore;
	const core = totalScore / 27 + (rule.seasonBonusCore || 0);
	const lastCore = season === 1 ? 0 : parseFloat($("#lastCore").val()) || 0;
	const totalCore = core + lastCore;

	return {
		season,
		rule,
		baseLevel,
		roleLevel,
		roleScore,
		equipAvg,
		equipScore,
		skillAvg,
		skillScore,
		beastAvg,
		beastScore,
		relicAvg,
		relicScore,
		totalScore,
		core,
		lastCore,
		totalCore,
		coreFloor: Math.floor(core),
		totalCoreFloor: Math.floor(totalCore),
	};
}

function updateSuggestionHints(season = 2) {
  const targetCore = parseFloat($('#targetCore').val()) || 0;
  if (targetCore <= 0) {
    $('.suggestion-hint').empty();
    return;
  }

  const r = computeScores(); // 取得當前分數和等級
  const rule = scoreRules[season];
  const lastCore = r.lastCore || 0;

  // -------- 當前總分 --------
  const roleScore = r.roleScore != null ? r.roleScore : r.roleLevel * rule.rolePerLevel;
  const equipScore = r.equipScore || 0;
  const skillScore = r.skillScore || 0;
  const beastScore = r.beastScore || 0;
  const relicScore = r.relicScore || 0;
  const currentScoreTotal = roleScore + equipScore + skillScore + beastScore + relicScore;

  // -------- 判斷是否已達標 --------
  const totalCoreExact = Math.floor(currentScoreTotal / 27) + (rule.seasonBonusCore || 0) + lastCore;
  if (totalCoreExact >= targetCore) {
    $('.suggestion-hint').html('✓ 已達標！').removeClass('text-muted').addClass('text-success');
    return;
  }

  // -------- 剩餘需要補的分數 --------
  let remainingScore = (targetCore - lastCore) * 27 - currentScoreTotal;
  if (remainingScore < 0) remainingScore = 0;

  // -------- 古遺物先補最多兩等 --------
  const relicDeltaMax = 2;
  const relicScoreDelta = relicDeltaMax * rule.relicPerLevel;
  const relicDelta = Math.min(remainingScore, relicScoreDelta) / rule.relicPerLevel;
  const relicTarget = Math.max(r.relicAvg, Math.ceil(r.relicAvg + relicDelta));

  remainingScore -= relicDelta * rule.relicPerLevel;
  if (remainingScore < 0) remainingScore = 0;

  // -------- 剩餘分配給主項 --------
  const mainTotalUnit =
    rule.rolePerLevel +
    rule.equipPerLevel * rule.equipCount +
    rule.skillPerLevel * rule.skillCount +
    rule.beastPerLevel * rule.beastCount;

  const roleWeight = rule.rolePerLevel / mainTotalUnit;
  const equipWeight = (rule.equipPerLevel * rule.equipCount) / mainTotalUnit;
  const skillWeight = (rule.skillPerLevel * rule.skillCount) / mainTotalUnit;
  const beastWeight = (rule.beastPerLevel * rule.beastCount) / mainTotalUnit;

  const roleDelta = remainingScore * roleWeight / rule.rolePerLevel;
  const equipDelta = remainingScore * equipWeight / (rule.equipPerLevel * rule.equipCount);
  const skillDelta = remainingScore * skillWeight / (rule.skillPerLevel * rule.skillCount);
  const beastDelta = remainingScore * beastWeight / (rule.beastPerLevel * rule.beastCount);

  // -------- 建議等級 --------
  const roleTarget = Math.max(r.roleLevel, Math.ceil(r.roleLevel + roleDelta));
  const equipTarget = Math.max(r.equipAvg, Math.ceil(r.equipAvg + equipDelta));
  const skillTarget = Math.max(r.skillAvg, Math.ceil(r.skillAvg + skillDelta));
  const beastTarget = Math.max(r.beastAvg, Math.ceil(r.beastAvg + beastDelta));

  // -------- 更新提示 --------
  $('#roleLevel').closest('div').find('.suggestion-hint')
    .html(`建議: ${roleTarget}`).removeClass('text-success').addClass('text-muted');

  $('.equip-item').each((_, el) => {
    $(el).find('.suggestion-hint').html(`建議: ${equipTarget}`).removeClass('text-success').addClass('text-muted');
  });

  $('.skill-item').each((_, el) => {
    $(el).find('.suggestion-hint').html(`建議: ${skillTarget}`).removeClass('text-success').addClass('text-muted');
  });

  $('.beast-item').each((_, el) => {
    $(el).find('.suggestion-hint').html(`建議: ${beastTarget}`).removeClass('text-success').addClass('text-muted');
  });

  $('.relic-suggestion-hint').each((_, el) => {
    $(el).html(`建議: ${relicTarget}`).removeClass('text-success').addClass('text-muted');
  });
}

// 點擊「套用」按鈕時，將建議等級套用到各輸入框
$("#applyBtn").on("click", function() {
	const season = parseInt($("#seasonSelect").val(), 10) || 2;
	updateSuggestionHints(season);
	// 取得建議等級並套用
	const roleHint = $("#roleLevel")
		.closest("div")
		.find(".suggestion-hint")
		.text();
	const roleMatch = roleHint.match(/建議:\s*(\d+)/);
	if (roleMatch) $("#roleLevel").val(roleMatch[1]);
	$(".equip-item").each((_, el) => {
		const hint = $(el).find(".suggestion-hint").text();
		const match = hint.match(/建議:\s*(\d+)/);
		if (match) $(el).find("input").val(match[1]);
	});
	$(".skill-item").each((_, el) => {
		const hint = $(el).find(".suggestion-hint").text();
		const match = hint.match(/建議:\s*(\d+)/);
		if (match) $(el).find("input").val(match[1]);
	});
	$(".beast-item").each((_, el) => {
		const hint = $(el).find(".suggestion-hint").text();
		const match = hint.match(/建議:\s*(\d+)/);
		if (match) $(el).find("input").val(match[1]);
	});

	$(".relic-suggestion-hint").each((index, el) => {
		const hint = $(el).text();
		const match = hint.match(/建議:\s*(\d+)/);
		if (match) {
			$(`.relic-big[data-group="${index}"]`).val(match[1]);
		}
	});
	// 重新計算
	performCalculation();
});

// 點擊「計算」按鈕時，更新建議提示
$("#calcBtn").on("click", function() {
	console.log("計算按鈕點擊");
	updateSuggestionHints();
});

// 將 computeScores 的結果呈現在 UI 上
function performCalculation() {
	const r = computeScores();
	$("#roleScoreDisplay").text(Math.floor(r.roleScore));
	$("#equipScoreDisplay").text(Math.floor(r.equipScore));
	$("#skillScoreDisplay").text(Math.floor(r.skillScore));
	$("#beastScoreDisplay").text(Math.floor(r.beastScore));
	$("#relicScoreDisplay").text(Math.floor(r.relicScore));

	// 根據賽季顯示/隱藏「已擁有原初之心」欄位（第一賽季不需要）
	$("#lastCore").parent().closest("div").toggle(r.season !== 1);

	// 計算已解鎖檔位
	// 將 slotEffects 分為已解鎖 / 未解鎖（資料內已有 import 屬性），並以雙欄形式顯示（桌面兩欄，手機一欄）
	const unlocked = [];
	const locked = [];
	for (const s of slotEffects) {
		const item = Object.assign({}, s, { important: !!s.import });
		if (r.totalCoreFloor >= s.need) unlocked.push(item);
		else locked.push(item);
	}

	function listHtmlCompact(arr) {
		if (arr.length === 0) return '<div class="text-muted">無</div>';
		let out = '<ul class="list-group">';
		for (const it of arr) {
			out += `<li class="list-group-item align-items-center gap-2 py-2 px-1 ${it.important
				? "has-important"
				: ""}">
          <div class="star-icon">${it.important ? "★" : ""}</div>
          <div class="flex-fill"><div class="small text-muted">${it.effect}</div></div>
          <div style="min-width:64px;text-align:center;"><span class="badge bg-primary">${it.need}</span></div>
        </li>`;
		}
		out += "</ul>";
		return out;
	}

	const colsHtml = `
    <div class="mt-2 d-flex flex-column flex-md-row gap-3 slot-columns">
      <div class="flex-fill">
        <h6 class="mb-2">未解鎖 <small class="text-muted">(${locked.length})</small></h6>
        ${listHtmlCompact(locked)}
      </div>
      <div class="flex-fill">
        <h6 class="mb-2">已解鎖 <small class="text-muted">(${unlocked.length})</small></h6>
        ${listHtmlCompact(unlocked)}
      </div>
    </div>
  `;

	const html = `
    <div><strong>總評分:</strong> ${Math.floor(r.totalScore)}</div>
    <div><strong>本賽季可獲得原初之心:</strong> ${r.coreFloor}</div>
    <div><strong>加上上賽季:</strong> ${r.totalCoreFloor}</div>
    <div class="mt-2"><strong>檔位狀態:</strong></div>
    <div>${colsHtml}</div>
  `;
	$("#seasonResult").html(html);
}

// --------------------
// 快速填寫功能：輸入數值後更新該類別的所有input
// --------------------
$("#equipTarget").on("input", function() {
	const value = parseFloat($(this).val()) || 0;
	if (value > 0) {
		$(".equip").val(value);
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(performCalculation, 100);
	}
});

$("#skillTarget").on("input", function() {
	const value = parseFloat($(this).val()) || 0;
	if (value > 0) {
		$(".skill").val(value);
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(performCalculation, 100);
	}
});

$("#beastTarget").on("input", function() {
	const value = parseFloat($(this).val()) || 0;
	if (value > 0) {
		$(".beast").val(value);
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(performCalculation, 100);
	}
});

$("#relicTarget").on("input", function() {
	const value = parseFloat($(this).val()) || 0;
	if (value > 0) {
		$(".relic-big").val(value);
		window.updatingBig = true;
		$(".relic-small").val(value);
		window.updatingBig = false;
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(performCalculation, 100);
	}
});

// --------------------
// debounce 與初始計算
// --------------------
let debounceTimer;
$("input, select").on("input change", function() {
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(performCalculation, 300);
});
$(document).ready(performCalculation);

// --------------------
// 遺物雙向同步（小欄位 → 大欄位，與 大欄位 → 小欄位）
// 使用全域旗標避免回圈更新
// --------------------
window.updatingBig = false;
window.updatingSmall = false;

$(document).on("input", ".relic-small", function() {
	const group = $(this).data("group");
	const smalls = $(`.relic-small[data-group="${group}"]`)
		.map((_, e) => parseFloat(e.value) || 0)
		.get();
	const sum = smalls.reduce((a, b) => a + b, 0);
	const bigVal = sum / 4;
	window.updatingBig = true;
	$(`.relic-big[data-group="${group}"]`).val(
		Number.isFinite(bigVal) ? bigVal : 0
	);
	window.updatingBig = false;
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(performCalculation, 300);
});

$(document).on("input", ".relic-big", function() {
	if (window.updatingBig) return;
	const group = $(this).data("group");
	const bigVal = parseFloat($(this).val()) || 0;
	window.updatingSmall = true;
	$(`.relic-small[data-group="${group}"]`).each((_, el) => {
		el.value = bigVal;
	});
	window.updatingSmall = false;
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(performCalculation, 100);
});
$(document).on("click mousedown touchstart", ".relic-big", function(e) {
	e.stopPropagation();
});

// 防止點擊 summary 中的 input 時觸發 details 展開（手機版改善點擊體驗）
$(document).on("click", ".relic-details summary input", function(e) {
	e.stopPropagation();
});

// --------------------
// 經驗計算按鈕
// --------------------
$("#calcLevel").on("click", function() {
	const totalExp = parseFloat($("#totalExp").val()) || 0;
	const currentExp = parseFloat($("#currentExp").val()) || 0;
	if (totalExp <= 0) {
		alert("請輸入總經驗");
		return;
	}
	// 計算百分比 (0..1)，四捨五入到小數第2位
	let pct = currentExp / totalExp;
	if (!isFinite(pct) || pct < 0) pct = 0;
	if (pct > 1) pct = 1;
	const pctRounded = parseFloat(pct.toFixed(2));

	// 將百分比加入角色等級的小數部分（保留整數部分）
	const roleInput = $("#roleLevel");
	const currentRole = parseFloat(roleInput.val()) || 0;
	const base = Math.floor(currentRole);
	const newLevel = base + pctRounded;
	roleInput.val(newLevel.toFixed(2));

	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(performCalculation, 100);
});

// 替代沒有載入 Bootstrap JS 時的 collapse 切換：
$('button[data-bs-target="#expCalc"]').on("click", function(e) {
	e.preventDefault();
	$("#expCalc").slideToggle(150);
	// focus 到總經驗欄位以利輸入
	setTimeout(() => {
		$("#totalExp").focus();
	}, 160);
});

// --------------------
// 儲存機制：使用 localStorage
// keys: 'seasonSaves' (object map), 'seasonLastState' (single last state)
// --------------------
function getSaves() {
	try {
		return JSON.parse(localStorage.getItem("seasonSaves")) || {};
	} catch (e) {
		return {};
	}
}

function saveSaves(obj) {
	localStorage.setItem("seasonSaves", JSON.stringify(obj));
}

function getLastState() {
	try {
		return JSON.parse(localStorage.getItem("seasonLastState"));
	} catch (e) {
		return null;
	}
}

function setLastState(data) {
	localStorage.setItem("seasonLastState", JSON.stringify(data));
}

// 取得當前表單數據（同原功能）
function getCurrentData() {
	return {
		roleLevel: parseFloat($("#roleLevel").val()) || 0,
		lastCore: parseInt($("#lastCore").val()) || 0,
		targetCore: parseFloat($("#targetCore").val()) || 0,
		equips: $(".equip").map((_, e) => parseFloat(e.value) || 0).get(),
		skills: $(".skill").map((_, e) => parseFloat(e.value) || 0).get(),
		beasts: $(".beast").map((_, e) => parseFloat(e.value) || 0).get(),
		relicSmalls: $(".relic-small")
			.map((_, e) => parseFloat(e.value) || 0)
			.get(),
		relicBigs: $(".relic-big").map((_, e) => parseFloat(e.value) || 0).get(),
		season: parseInt($("#seasonSelect").val()) || 2,
	};
}

function loadData(data) {
	if (!data) return;
	$("#roleLevel").val(data.roleLevel);
	$("#lastCore").val(data.lastCore);
	$("#targetCore").val(data.targetCore || 0);
	$(".equip").each((i, el) => {
		el.value = data.equips[i] || 130;
	});
	$(".skill").each((i, el) => {
		el.value = data.skills[i] || 130;
	});
	$(".beast").each((i, el) => {
		el.value = data.beasts[i] || 20;
	});
	$(".relic-small").each((i, el) => {
		el.value = data.relicSmalls[i] || 13;
	});
	$(".relic-big").each((i, el) => {
		el.value = data.relicBigs[i] || 13;
	});
	$("#seasonSelect").val(data.season);
	clearTimeout(debounceTimer);
	debounceTimer = setTimeout(performCalculation, 100);
}

// --------------------
// 模態框操作（浮動按鈕）
// --------------------
const dataBtn = $("#dataBtn");
const modalOverlay = $("#modalOverlay");
const dataModal = $("#dataModal");
const btnSave = $("#btnSave");
const btnLoad = $("#btnLoad");
const btnCloseModal = $("#btnCloseModal");
const saveName = $("#saveName");
const goalCore = $("#goalCore");
const savedStates = $("#savedStates");

dataBtn.on("click", () => openModal());
modalOverlay.on("click", () => closeModal());
btnCloseModal.on("click", () => closeModal());

function openModal() {
	modalOverlay.addClass("show");
	dataModal.addClass("show");
	loadSavedList();
}
function closeModal() {
	modalOverlay.removeClass("show");
	dataModal.removeClass("show");
}

btnSave.on("click", function() {
	const name = saveName.val().trim();
	if (!name) {
		alert("請輸入存檔名稱");
		return;
	}
	const data = getCurrentData();
	const saves = getSaves();
	saves[name] = { data, time: new Date().toLocaleString() };
	saveSaves(saves);
	setLastState(data);
	alert("狀態已保存: " + name);
	saveName.val("");
	loadSavedList();
});

btnLoad.on("click", function() {
	const selected = savedStates.val();
	if (!selected) {
		alert("請選擇要載入的狀態");
		return;
	}
	const saves = getSaves();
	if (saves[selected]) {
		loadData(saves[selected].data);
		closeModal();
		alert("狀態已載入: " + selected);
	}
});

function loadSavedList() {
	const saves = getSaves();
	savedStates.html('<option value="">-- 選擇要載入的狀態 --</option>');
	for (const name in saves)
		savedStates.append(
			`<option value="${name}">${name} (${saves[name].time})</option>`
		);
}

// 頁面載入時恢復 localStorage 中的最後狀態（如有）
$(document).ready(function() {
	const saved = getLastState();
	if (saved) loadData(saved);
});

// 切換已解鎖 / 未解鎖 tab 的委派處理
$(document).on("click", "#seasonResult .slot-tab-link", function(e) {
	e.preventDefault();
	const target = $(this).data("target");
	$("#seasonResult").find(".tab-pane").addClass("d-none");
	$(`#${target}`).removeClass("d-none");
	$("#seasonResult").find(".slot-tab-link").removeClass("active");
	$(this).addClass("active");
});

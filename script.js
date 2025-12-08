$(document).ready(function () {

  /* ====== 原本的計算功能 ====== */
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
      crystalCount: $("#crystalCount").val()
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
      const h = Math.floor(diff / 3600000);
      diff -= h * 3600000;
      const m = Math.floor(diff / 60000);
      diff -= m * 60000;
      const s = Math.floor(diff / 1000);

      $("#countdown").text(`距離升等剩餘：${h} 小時 ${m} 分 ${s} 秒`);
    }

    updateCountdown();
    countdownInterval = setInterval(updateCountdown, 1000);
  }

  function calculate() {
    const level = Number($("#level").val());
    const totalExp = Number($("#totalExp").val());
    const currentExp = Number($("#currentExp").val());
    const expPerHour = Number($("#expPerHour").val());
    const recordTimeVal = $("#recordTime").val();

    if (!recordTimeVal || !totalExp || !currentExp || !expPerHour) {
      $("#result").text("請輸入完整資料。");
      $("#countdown").text("");
      return;
    }

    let recordTime = new Date(recordTimeVal);
    let neededExp = totalExp - currentExp;
    let hoursToLevelUp = neededExp / expPerHour;
    let levelUpTime = new Date(recordTime.getTime() + hoursToLevelUp * 3600000);

    let boostHours = 0;
    if ($("#freeBoost").prop("checked")) boostHours += 2;
    if ($("#crystalBoostCheck").prop("checked")) {
      const crystals = Number($("#crystalCount").val()) || 0;
      boostHours += crystals * 2;
    }
    levelUpTime = new Date(levelUpTime.getTime() - boostHours * 3600000);

    $("#result").text(
      `目前等級：${level}
所需經驗：${neededExp.toLocaleString()}
預計升級時間：${levelUpTime.toLocaleString()}`
    );

    saveData();
    startCountdown(levelUpTime);
  }

  $("#level, #totalExp, #currentExp, #expPerHour, #recordTime, #freeBoost, #crystalBoostCheck, #crystalCount")
    .on("input change", calculate);

  $("#updateTimeBtn").click(function () {
    const now = new Date();
    const pad = n => n.toString().padStart(2, "0");
    $("#recordTime").val(
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
    );
    calculate();
  });

  $("#clearBtn").click(function () {
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

  /* ====== 占卜功能 ====== */

  const papers = [
    "凡事順勢而為 ✧٩(ˊᗜˋ*)و✧",
    "耐心一點，會看到變化 o(>_<)o",
    "適合休整，避免情緒衝動 ( ˘•ω•˘ )",
    "有人會伸出援手 (｡•̀ᴗ-)✧",
    "目前的擔心有些放大了 (･ัω･ั)",
    "轉折正在形成 ヾ(•ω•`)o",
    "需要用更實際的角度判斷 (・・;)",
    "保持彈性會比較順 (*´∀`*)",
    "不必急著下結論〜 (・・ )",
    "結果不是壞的，只是慢一點 ( ´･ω･` )"
  ];

  function appendMsg(text, type) {
    $("#chatArea").append(
      `<div class="message ${type}">${text}</div>`
    );
    $("#chatArea").scrollTop($("#chatArea")[0].scrollHeight);
  }

  function answerUser(q) {
    const pick = papers[Math.floor(Math.random() * papers.length)];
    appendMsg(pick, "msg-bot");
  }

  $("#btn-witch").click(() => $("#witchModal").fadeIn(150));
  $("#closeModal").click(() => $("#witchModal").fadeOut(150));

  $("#sendBtn").click(function () {
    const val = $("#userInput").val().trim();
    if (!val) return;

    appendMsg(val, "msg-user");
    $("#userInput").val("");

    setTimeout(() => answerUser(val), 400);
  });

  $("#userInput").keypress(function (e) {
    if (e.key === "Enter") $("#sendBtn").click();
  });

  /* 其他按鈕（lot、bobei、paper）簡易功能 */
  $("#btn-lot").click(() => {
    appendMsg("LOT：結果偏向中性 (・・ )", "msg-bot");
    $("#witchModal").fadeIn(150);
  });

  $("#btn-bobei").click(() => {
    appendMsg("BOBEI：有疑慮，需要重新確認 (*・_・)ノ", "msg-bot");
    $("#witchModal").fadeIn(150);
  });

  $("#btn-paper").click(() => {
    const pick = papers[Math.floor(Math.random() * papers.length)];
    appendMsg("籤文：" + pick, "msg-bot");
    $("#witchModal").fadeIn(150);
  });

});

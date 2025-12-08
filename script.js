$(document).ready(function () {
  let poems = {}; // JSON 資料
  const lotsRatio = [20, 20, 15, 15, 20, 10]; // lots 1~6 機率
  const bobeiRatio = [40, 30, 20, 10];       // bobei 1~4 機率

  // 工具函式：加入訊息
  function appendMsg(content, type) {
    $("#chatArea").append(`<div class="message ${type}">${content}</div>`);
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
    if (action === "御神籤") {
      const result = drawLots();
      const content = `<img src="./img/lots_${result.lotIndex}.jpg" alt="lots" style="width:60px;height:60px;object-fit:cover;">`;
      appendMsg(content, "msg-bot");
    } else if (action === "擲筊") {
      const result = drawLots();
      const content = `<img src="./img/bobei_${result.bobeiIndex}.jpg" alt="bobei" style="width:60px;height:60px;object-fit:cover;">`;
      appendMsg(content, "msg-bot");
    } else if (action === "籤筊") {
      const result = drawLots();
      const content = `
        <img src="./img/lots_${result.lotIndex}.jpg" alt="lots" style="width:60px;height:60px;object-fit:cover;">
        <img src="./img/bobei_${result.bobeiIndex}.jpg" alt="bobei" style="width:60px;height:60px;object-fit:cover;">
      `;
      appendMsg(content, "msg-bot");
    } else if (action === "籤詩") {
      const levels = Object.keys(poems);
      if (levels.length === 0) {
        appendMsg("籤詩尚未載入，請稍候…", "msg-bot");
        return;
      }
      const level = levels[Math.floor(Math.random() * levels.length)];
      const paperList = poems[level];
      if (!paperList || paperList.length === 0) {
        appendMsg("此等級籤詩資料尚未準備好", "msg-bot");
        return;
      }
      const pick = paperList[Math.floor(Math.random() * paperList.length)];

      const content = `
        <div><strong>【${level}】</strong></div>
        <div><strong>${pick.poem.replace(/\n/g,"<br>")}</strong></div>
        <div>${pick.meaning}</div>
      `;
      appendMsg(content, "msg-bot");
    } else {
      appendMsg(input, "msg-bot");
    }
  }

  // 載入 JSON
  $.getJSON("./papers.json", function(data) {
    poems = data;
  });

  // 打開/關閉 modal
  $("#btn-witch").click(() => $("#witchModal").fadeIn(150));
  $("#closeModal").click(() => $("#witchModal").fadeOut(150));

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
  $("#userInput").keypress(function (e) {
    if (e.key === "Enter") sendMessage();
  });
});

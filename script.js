$(document).ready(function () {

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

  function appendMsg(content, type) {
    $("#chatArea").append(`<div class="message ${type}">${content}</div>`);
    $("#chatArea").scrollTop($("#chatArea")[0].scrollHeight);
  }

  function answerUser(action, input) {
    if(action === "lot") {
      // 擲筊 icon
      const lotIndex = Math.floor(Math.random() * 6) + 1;
      const bobeiIndex = Math.floor(Math.random() * 4) + 1;
      const content = `
        <img src="./img/lots_${lotIndex}.png" alt="lots">
        <img src="./img/bobei_${bobeiIndex}.png" alt="bobei">
      `;
      appendMsg(content, "msg-bot");
    }
    else if(action === "paper") {
      const pick = papers[Math.floor(Math.random() * papers.length)];
      appendMsg(pick, "msg-bot");
    }
    else {
      appendMsg(input, "msg-bot");
    }
  }

  $("#btn-witch").click(() => $("#witchModal").fadeIn(150));
  $("#closeModal").click(() => $("#witchModal").fadeOut(150));

  $("#sendBtn").click(function () {
    const val = $("#userInput").val().trim();
    const action = $("#actionSelect").val();

    if (!val && action === "input") return;

    if (action === "input") appendMsg(val, "msg-user");
    else appendMsg(val || action, "msg-user");

    $("#userInput").val("");

    setTimeout(() => answerUser(action, val), 400);
  });

  $("#userInput").keypress(function (e) {
    if (e.key === "Enter") $("#sendBtn").click();
  });
});

// Assert v4: tin nhắc KHÔNG emoji + không ~ (kiểm tra production thật)
export default async function assertChatPrompt(page) {
  const results = [];
  const check = (name, ok, detail = "") => results.push({ name, ok, detail });

  await page.waitForSelector('button[aria-label="Mở chat AI"]', { timeout: 15000 });
  check("widget mounted", true);

  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent("sang-chat-prompt", {
        detail: { text: "Dạ em đã nhận yêu cầu của anh (mã #abcd1234). Anh cho em biết thêm nhu cầu chi tiết để em tư vấn chuẩn hơn nha — gõ ngay ở đây cũng được ạ.", requestCode: "abcd1234" },
      })
    );
  });
  await page.waitForTimeout(800);

  const state = await page.evaluate(() => {
    const panel = [...document.querySelectorAll("div")].find(
      (d) => d.textContent?.includes("Trợ lý SangDupont") && d.offsetParent !== null
    );
    const text = panel ? panel.textContent : "";
    return {
      panelVisible: !!panel,
      hasEmoji: /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(text),
      hasTilde: text.includes("~"),
      hasRequestText: text.includes("của anh (mã #abcd1234)"),
    };
  });

  check("panel mở", state.panelVisible);
  check("tin nhắc hiển thị", state.hasRequestText);
  check("KHÔNG emoji", !state.hasEmoji);
  check("KHÔNG dấu ~", !state.hasTilde);
  return results;
}

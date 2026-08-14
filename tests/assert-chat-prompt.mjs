// Assert v2: tin nhắc dùng "anh" (không "anh/chị") + panel mở + tin hiện
export default async function assertChatPrompt(page) {
  const results = [];
  const check = (name, ok, detail = "") => results.push({ name, ok, detail });

  await page.waitForSelector('button[aria-label="Mở chat AI"]', { timeout: 15000 });
  check("widget mounted", true);

  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent("sang-chat-prompt", {
        detail: { text: "Dạ em đã nhận yêu cầu của anh (mã #abcd1234) 👍 Anh cho em biết thêm nhu cầu chi tiết để em tư vấn chuẩn hơn nha — gõ ngay ở đây cũng được ạ 😊", requestCode: "abcd1234" },
      })
    );
  });
  await page.waitForTimeout(800);

  const state = await page.evaluate(() => {
    const panel = [...document.querySelectorAll("div")].find(
      (d) => d.textContent?.includes("Trợ lý SangDupont") && d.offsetParent !== null
    );
    return {
      panelVisible: !!panel,
      hasAnh: panel ? panel.textContent.includes("của anh (mã #abcd1234)") : false,
      hasAnhChi: panel ? panel.textContent.includes("anh/chị") : false,
    };
  });

  check("panel mở", state.panelVisible);
  check("dùng 'anh' (không anh/chị)", state.hasAnh && !state.hasAnhChi, JSON.stringify(state));
  return results;
}

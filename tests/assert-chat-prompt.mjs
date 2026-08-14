// Assert: widget nhắc bổ sung thông tin — dispatch sang-chat-prompt → panel mở + tin nhắn hiện
// Chạy: bash tests/browser-verify.sh tests/assert-chat-prompt.mjs https://sangdupont.vercel.app/vi
export default async function assertChatPrompt(page) {
  const results = [];
  const check = (name, ok, detail = "") => results.push({ name, ok, detail });

  // 1) Đợi hydration (bubble xuất hiện)
  await page.waitForSelector('button[aria-label="Mở chat AI"]', { timeout: 15000 });
  check("widget mounted (bubble)", true);

  // 2) Dispatch event mở chat + nhắc (giống LeadForm sau submit)
  await page.evaluate(() => {
    window.dispatchEvent(
      new CustomEvent("sang-chat-prompt", {
        detail: { text: "Dạ em đã nhận yêu cầu của anh/chị (mã #abcd1234) 👍 Anh/chị cho em biết thêm nhu cầu chi tiết để em tư vấn chuẩn hơn nha — gõ ngay ở đây cũng được ạ 😊", requestCode: "abcd1234" },
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
      promptShown: panel ? panel.textContent.includes("mã #abcd1234") && panel.textContent.includes("cho em biết thêm") : false,
    };
  });

  check("panel mở sau event", state.panelVisible);
  check("tin nhắc bổ sung hiện", state.promptShown);

  // 3) Kiểm tra bubble đổi thành "Đóng chat" (trạng thái open)
  const bubbleClose = await page.$('button[aria-label="Đóng chat"]');
  check("bubble đổi Đóng chat", !!bubbleClose);

  return results;
}

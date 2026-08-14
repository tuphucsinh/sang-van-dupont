// Assert v3: đóng widget BẰNG NÚT NỔI → phải gọi lead_summary (fetch kèm request_code)
export default async function assertChatPrompt(page) {
  const results = [];
  const check = (name, ok, detail = "") => results.push({ name, ok, detail });

  await page.waitForSelector('button[aria-label="Mở chat AI"]', { timeout: 15000 });
  check("widget mounted", true);

  // Chặn fetch để ghi lại các call + dispatch prompt gắn requestCode
  await page.evaluate(() => {
    window.__calls = [];
    const orig = window.fetch;
    window.fetch = (...args) => {
      try { window.__calls.push(String(args[1]?.body || "")); } catch {}
      return orig(...args);
    };
    window.dispatchEvent(
      new CustomEvent("sang-chat-prompt", {
        detail: { text: "test đóng widget", requestCode: "deadbeef" },
      })
    );
  });
  await page.waitForTimeout(500);

  // Panel mở — click NÚT NỔI (aria-label "Đóng chat") để đóng
  const btn = await page.$('button[aria-label="Đóng chat"]');
  check("panel mở (nút nổi thành Đóng chat)", !!btn);
  await btn.click();
  await page.waitForTimeout(800);

  const state = await page.evaluate(() => {
    const calls = window.__calls || [];
    const leadCall = calls.find((c) => c.includes("lead_summary"));
    return {
      closed: ![...document.querySelectorAll("div")].some(
        (d) => d.textContent?.includes("Trợ lý SangDupont") && d.offsetParent !== null
      ),
      leadCallSent: !!leadCall,
      hasCode: leadCall ? leadCall.includes("deadbeef") : false,
    };
  });

  check("widget đã đóng", state.closed);
  check("đã gửi lead_summary khi đóng", state.leadCallSent);
  check("kèm request_code đúng", state.hasCode);
  return results;
}

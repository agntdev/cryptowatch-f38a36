import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const store = resolveUserStore();

const composer = new Composer<Ctx>();

composer.callbackQuery("settings", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = String(ctx.from!.id);
  const data = await store.getUser(userId);
  const watchlistStr = data.watchlist.length > 0 ? data.watchlist.join(", ") : "empty";
  const alertCount = data.alerts.length;
  const text =
    `⚙️ Your settings:\n\n` +
    `📋 Watchlist: ${watchlistStr}\n` +
    `⏰ Summary: ${data.summaryTime}\n` +
    `🌙 Quiet hours: ${data.quietHoursStart}–${data.quietHoursEnd}\n` +
    `⏱ Cooldown: ${data.cooldownDuration} min\n` +
    `🔔 Alerts: ${alertCount} set`;
  const kb = inlineKeyboard([
    [inlineButton("⏰ Summary time", "summary:settings"), inlineButton("🌙 Quiet hours", "quiet:settings")],
    [inlineButton("⏱ Cooldown", "cooldown:settings"), inlineButton("🔔 Alerts", "alert:list")],
    [inlineButton("⬅️ Back to menu", "menu:main")],
  ]);
  await ctx.reply(text, { reply_markup: kb });
});

export default composer;

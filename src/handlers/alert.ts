import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("alert:show", async (ctx) => {
  await ctx.answerCallbackQuery();
  const store = resolveUserStore();
  const userId = String(ctx.from!.id);
  const data = await store.getUser(userId);
  if (data.watchlist.length === 0) {
    await ctx.reply("Your watchlist is empty — add a coin first.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }
  const rows = data.watchlist.map((t) => [
    inlineButton(`🔔 ${t}`, `alert:pick:${t}`),
  ]);
  rows.push([inlineButton("⬅️ Back to menu", "menu:main")]);
  await ctx.reply("Which coin do you want to set an alert for?", {
    reply_markup: inlineKeyboard(rows),
  });
});

composer.callbackQuery(/^alert:pick:([A-Za-z0-9]+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const ticker = ctx.match![1]!.toUpperCase();
  ctx.session.step = "awaiting_alert_threshold";
  ctx.session.temp = { alertTicker: ticker, alertType: "threshold" };
  await ctx.reply(
    `Enter the price threshold for ${ticker} (e.g. 50000):`,
    { reply_markup: inlineKeyboard([[inlineButton("Use % change instead", `alert:percent:${ticker}`), inlineButton("❌ Cancel", "menu:main")]]) },
  );
});

composer.callbackQuery(/^alert:percent:([A-Za-z0-9]+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const ticker = ctx.match![1]!.toUpperCase();
  ctx.session.step = "awaiting_alert_percent";
  ctx.session.temp = { alertTicker: ticker, alertType: "percent" };
  await ctx.reply(
    `Enter the percent change threshold for ${ticker} (e.g. 5 for 5%):`,
    { reply_markup: inlineKeyboard([[inlineButton("❌ Cancel", "menu:main")]]) },
  );
});

composer.callbackQuery("alert:list", async (ctx) => {
  await ctx.answerCallbackQuery();
  const store = resolveUserStore();
  const userId = String(ctx.from!.id);
  const data = await store.getUser(userId);
  if (data.alerts.length === 0) {
    await ctx.reply("No alerts set yet — tap 🔔 Set alert from the menu.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }
  const lines = data.alerts.map((a) => {
    if (a.threshold) return `${a.ticker}: notify at $${a.threshold.toLocaleString()}`;
    return `${a.ticker}: notify on ${a.percent}% change`;
  });
  await ctx.reply(`🔔 Your alerts:\n\n${lines.join("\n")}`, {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;

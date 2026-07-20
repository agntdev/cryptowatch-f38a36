import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { validateTicker } from "../lib/coingecko.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

function isValidHHMM(s: string): boolean {
  return /^\d{2}:\d{2}$/.test(s) && parseInt(s.slice(0, 2)) < 24 && parseInt(s.slice(3)) < 60;
}

composer.on("message:text", async (ctx, next) => {
  const step = ctx.session.step;
  if (!step) {
    await next();
    return;
  }
  const text = ctx.message.text.trim();
  const userId = String(ctx.from!.id);
  const store = resolveUserStore();
  const kb = inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]);

  if (step === "awaiting_custom_ticker") {
    ctx.session.step = undefined;
    ctx.session.temp = undefined;
    const ticker = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (ticker.length < 2) {
      await ctx.reply("Enter a valid ticker (2+ letters, e.g. SOL):", { reply_markup: kb });
      return;
    }
    const data = await store.getUser(userId);
    if (data.watchlist.includes(ticker)) {
      await ctx.reply(`${ticker} is already in your watchlist.`, { reply_markup: kb });
      return;
    }
    const valid = await validateTicker(ticker);
    if (!valid) {
      await ctx.reply(`Couldn't find a coin with ticker "${ticker}". Check the spelling and try again.`, { reply_markup: kb });
      return;
    }
    data.watchlist.push(ticker);
    await store.setUser(userId, data);
    await ctx.reply(`✅ Added ${ticker} to your watchlist.`, { reply_markup: kb });
    return;
  }

  if (step === "awaiting_alert_threshold") {
    ctx.session.step = undefined;
    const ticker = ctx.session.temp?.alertTicker;
    ctx.session.temp = undefined;
    const num = parseFloat(text.replace(/[$,]/g, ""));
    if (isNaN(num) || num <= 0) {
      await ctx.reply("Enter a valid price (e.g. 50000):", { reply_markup: kb });
      return;
    }
    const data = await store.getUser(userId);
    data.alerts.push({
      id: `${ticker}:${num}:${Date.now()}`,
      ticker: ticker!,
      threshold: num,
      createdAt: Date.now(),
    });
    await store.setUser(userId, data);
    await ctx.reply(`✅ Alert set: notify when ${ticker} reaches $${num.toLocaleString()}.`, { reply_markup: kb });
    return;
  }

  if (step === "awaiting_alert_percent") {
    ctx.session.step = undefined;
    const ticker = ctx.session.temp?.alertTicker;
    ctx.session.temp = undefined;
    const num = parseFloat(text.replace(/%/g, ""));
    if (isNaN(num) || num <= 0) {
      await ctx.reply("Enter a valid percent (e.g. 5 for 5%):", { reply_markup: kb });
      return;
    }
    const data = await store.getUser(userId);
    data.alerts.push({
      id: `${ticker}:${num}%:${Date.now()}`,
      ticker: ticker!,
      percent: num,
      createdAt: Date.now(),
    });
    await store.setUser(userId, data);
    await ctx.reply(`✅ Alert set: notify when ${ticker} changes ${num}%.`, { reply_markup: kb });
    return;
  }

  if (step === "awaiting_summary_time") {
    ctx.session.step = undefined;
    if (!isValidHHMM(text)) {
      await ctx.reply("Enter a valid time in HH:MM format (e.g. 08:00):", { reply_markup: kb });
      return;
    }
    const data = await store.getUser(userId);
    data.summaryTime = text;
    await store.setUser(userId, data);
    await ctx.reply(`✅ Morning summary set for ${text}.`, { reply_markup: kb });
    return;
  }

  if (step === "awaiting_quiet_start") {
    ctx.session.step = "awaiting_quiet_end";
    if (!isValidHHMM(text)) {
      ctx.session.step = "awaiting_quiet_start";
      await ctx.reply("Enter a valid time in HH:MM format (e.g. 22:00):", { reply_markup: kb });
      return;
    }
    ctx.session.temp = { quietStart: text };
    await ctx.reply(
      "Enter quiet hours end (HH:MM, e.g. 08:00):",
      { reply_markup: kb },
    );
    return;
  }

  if (step === "awaiting_quiet_end") {
    ctx.session.step = undefined;
    const start = ctx.session.temp?.quietStart as string | undefined;
    ctx.session.temp = undefined;
    if (!isValidHHMM(text)) {
      await ctx.reply("Enter a valid time in HH:MM format (e.g. 08:00):", { reply_markup: kb });
      return;
    }
    const data = await store.getUser(userId);
    data.quietHoursStart = start ?? "22:00";
    data.quietHoursEnd = text;
    await store.setUser(userId, data);
    await ctx.reply(`✅ Quiet hours set: ${data.quietHoursStart}–${text}.`, { reply_markup: kb });
    return;
  }

  if (step === "awaiting_cooldown") {
    ctx.session.step = undefined;
    const num = parseInt(text, 10);
    if (isNaN(num) || num < 1 || num > 1440) {
      await ctx.reply("Enter a number of minutes (1–1440, e.g. 30):", { reply_markup: kb });
      return;
    }
    const data = await store.getUser(userId);
    data.cooldownDuration = num;
    await store.setUser(userId, data);
    await ctx.reply(`✅ Cooldown set to ${num} minutes.`, { reply_markup: kb });
    return;
  }

  await next();
});

export default composer;

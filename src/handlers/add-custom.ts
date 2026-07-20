import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("add:custom", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_custom_ticker";
  await ctx.reply("Enter the coin ticker (e.g. SOL, DOGE, ADA):", {
    reply_markup: inlineKeyboard([[inlineButton("❌ Cancel", "menu:main")]]),
  });
});

export default composer;

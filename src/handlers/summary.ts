import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const store = resolveUserStore();

const composer = new Composer<Ctx>();

composer.callbackQuery("summary:settings", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_summary_time";
  await ctx.reply(
    "Enter the summary time (HH:MM, e.g. 08:00):",
    { reply_markup: inlineKeyboard([[inlineButton("❌ Cancel", "menu:main")]]) },
  );
});

export default composer;

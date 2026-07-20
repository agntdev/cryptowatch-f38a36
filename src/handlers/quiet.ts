import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const store = resolveUserStore();

const composer = new Composer<Ctx>();

composer.callbackQuery("quiet:settings", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_quiet_start";
  await ctx.reply(
    "Enter quiet hours start (HH:MM, e.g. 22:00):",
    { reply_markup: inlineKeyboard([[inlineButton("❌ Cancel", "menu:main")]]) },
  );
});

export default composer;

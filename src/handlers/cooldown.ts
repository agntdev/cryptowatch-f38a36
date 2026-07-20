import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const store = resolveUserStore();

const composer = new Composer<Ctx>();

composer.callbackQuery("cooldown:settings", async (ctx) => {
  await ctx.answerCallbackQuery();
  ctx.session.step = "awaiting_cooldown";
  await ctx.reply(
    "Enter cooldown duration in minutes (e.g. 30):",
    { reply_markup: inlineKeyboard([[inlineButton("❌ Cancel", "menu:main")]]) },
  );
});

export default composer;

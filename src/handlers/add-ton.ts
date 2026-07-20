import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const store = resolveUserStore();

const composer = new Composer<Ctx>();

composer.callbackQuery("add:TON", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = String(ctx.from!.id);
  const data = await store.getUser(userId);
  if (data.watchlist.includes("TON")) {
    await ctx.reply("TON is already in your watchlist.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }
  data.watchlist.push("TON");
  await store.setUser(userId, data);
  await ctx.reply("✅ Added TON to your watchlist.", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;

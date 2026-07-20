import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("add:BTC", async (ctx) => {
  await ctx.answerCallbackQuery();
  const store = resolveUserStore();
  const userId = String(ctx.from!.id);
  const data = await store.getUser(userId);
  if (data.watchlist.includes("BTC")) {
    await ctx.reply("BTC is already in your watchlist.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }
  data.watchlist.push("BTC");
  await store.setUser(userId, data);
  await ctx.reply("✅ Added BTC to your watchlist.", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;

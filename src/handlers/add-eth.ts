import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("add:ETH", async (ctx) => {
  await ctx.answerCallbackQuery();
  const store = resolveUserStore();
  const userId = String(ctx.from!.id);
  const data = await store.getUser(userId);
  if (data.watchlist.includes("ETH")) {
    await ctx.reply("ETH is already in your watchlist.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }
  data.watchlist.push("ETH");
  await store.setUser(userId, data);
  await ctx.reply("✅ Added ETH to your watchlist.", {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;

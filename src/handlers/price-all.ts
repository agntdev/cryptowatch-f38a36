import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { fetchPrices } from "../lib/coingecko.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const store = resolveUserStore();

const composer = new Composer<Ctx>();

composer.callbackQuery("price:all", async (ctx) => {
  await ctx.answerCallbackQuery();
  const userId = String(ctx.from!.id);
  const data = await store.getUser(userId);
  if (data.watchlist.length === 0) {
    await ctx.reply("Your watchlist is empty — tap Add to get started.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }
  try {
    const prices = await fetchPrices(data.watchlist);
    if (prices.length === 0) {
      await ctx.reply("Couldn't fetch prices right now. Try again in a moment.", {
        reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
      });
      return;
    }
    const lines = prices.map((p) => {
      const sign = p.change24h >= 0 ? "+" : "";
      return `${p.ticker}: $${p.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${sign}${p.change24h.toFixed(1)}%)`;
    });
    await ctx.reply(`📊 Prices:\n\n${lines.join("\n")}`, {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
  } catch {
    await ctx.reply("Couldn't fetch prices right now. Try again in a moment.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
  }
});

export default composer;

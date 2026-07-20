import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const composer = new Composer<Ctx>();

composer.callbackQuery("remove:show", async (ctx) => {
  await ctx.answerCallbackQuery();
  const store = resolveUserStore();
  const userId = String(ctx.from!.id);
  const data = await store.getUser(userId);
  if (data.watchlist.length === 0) {
    await ctx.reply("Your watchlist is empty — nothing to remove.", {
      reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
    });
    return;
  }
  const rows = data.watchlist.map((t) => [
    inlineButton(`🗑 ${t}`, `remove:${t}`),
  ]);
  rows.push([inlineButton("⬅️ Back to menu", "menu:main")]);
  await ctx.reply("Tap a coin to remove it from your watchlist:", {
    reply_markup: inlineKeyboard(rows),
  });
});

composer.callbackQuery(/^remove:([A-Za-z0-9]+)$/, async (ctx) => {
  await ctx.answerCallbackQuery();
  const ticker = ctx.match![1]!.toUpperCase();
  const store = resolveUserStore();
  const userId = String(ctx.from!.id);
  const data = await store.getUser(userId);
  data.watchlist = data.watchlist.filter((t) => t !== ticker);
  await store.setUser(userId, data);
  await ctx.reply(`✅ Removed ${ticker} from your watchlist.`, {
    reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]),
  });
});

export default composer;

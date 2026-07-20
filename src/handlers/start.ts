import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { mainMenuKeyboard, registerMainMenuItem } from "../toolkit/index.js";

registerMainMenuItem({ label: "➕ Add BTC", data: "add:BTC", order: 10 });
registerMainMenuItem({ label: "➕ Add ETH", data: "add:ETH", order: 11 });
registerMainMenuItem({ label: "➕ Add TON", data: "add:TON", order: 12 });
registerMainMenuItem({ label: "➕ Add custom", data: "add:custom", order: 13 });
registerMainMenuItem({ label: "📊 Check price", data: "price:all", order: 20 });
registerMainMenuItem({ label: "🗑 Remove coin", data: "remove:show", order: 21 });
registerMainMenuItem({ label: "🔔 Set alert", data: "alert:show", order: 30 });
registerMainMenuItem({ label: "⚙️ Settings", data: "settings", order: 40 });

const composer = new Composer<Ctx>();

const WELCOME = "👋 Welcome! Tap a button below to get started.";

composer.command("start", async (ctx) => {
  await ctx.reply(WELCOME, { reply_markup: mainMenuKeyboard() });
});

composer.callbackQuery("menu:main", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText(WELCOME, { reply_markup: mainMenuKeyboard() });
});

export default composer;

import { Composer } from "grammy";
import type { Ctx } from "../bot.js";
import { resolveUserStore } from "../lib/store.js";
import { inlineButton, inlineKeyboard } from "../toolkit/index.js";

const store = resolveUserStore();
const OWNER_IDS = (process.env.OWNER_IDS ?? "").split(",").filter(Boolean);

const composer = new Composer<Ctx>();

composer.command("owner", async (ctx) => {
  const userId = String(ctx.from!.id);
  if (OWNER_IDS.length > 0 && !OWNER_IDS.includes(userId)) {
    await ctx.reply("This command is for the bot owner only.");
    return;
  }
  const allIds = await store.getAllUserIds();
  const totalUsers = allIds.length;
  let alertLines: string[] = [];
  for (const uid of allIds.slice(0, 50)) {
    const data = await store.getUser(uid);
    for (const a of data.alerts) {
      alertLines.push(`${a.ticker}: ${a.threshold ? `$${a.threshold}` : `${a.percent}%`}`);
    }
  }
  const topAlerts = alertLines.length > 0 ? alertLines.slice(0, 10).join(", ") : "none";
  await ctx.reply(
    `👑 Owner dashboard\n\nTotal users: ${totalUsers}\nTop alerts: ${topAlerts}`,
    { reply_markup: inlineKeyboard([[inlineButton("⬅️ Back to menu", "menu:main")]]) },
  );
});

export default composer;

// this file is part of https://github.com/butthx/nochnbot.
import GModel from "../schema/database";
import { Composer, Context } from "grammy";
import isAdmin from "../utils/isAdmin";
export const bot = new Composer();
bot.command("start", (ctx) => {
  return ctx.reply(
    `Hi, i can delete message from user which using channel to sending message. also this user banned that channel from your group, so the owner can't use it again for sending message in your group.\n\n<b>How to use?</b>\n<i>Just add me in your group! and make me an admin in your group with permission deleteMessages and banUsers!</i>\n\nSource Code : https://github.com/butthx/nochnbot`,
    {
      parse_mode: "HTML",
      reply_to_message_id: ctx.message?.message_id,
      allow_sending_without_reply: true,
    }
  );
});

// this file is part of https://github.com/butthx/nochnbot.
import GModel from '../schema/database';
import { Composer, Context } from 'grammy';
import isAdmin from '../utils/isAdmin';
export const bot = new Composer();
const help_message = `1. add me in your group.
2. Make me an admin in that group with delete messages and baning users permissions.
3. Done.

<b>Some Tips</b>

1. To ignore channel use <code>/ignore</code> with replying message or you can pass with channel ids. for more help type <code>/ignore</code>.
2. To unignore channel use <code>/unignore</code> with replying message or you can pass with channel ids. for more help type <code>/unignore</code>.
3. To get all list of ignored channel use <code>ignorelist</code>.
4. If you want to set a channel as log chat, send <code>/setlog</code> in channel and forward to your group. You must add me in that channel to work.

<b>Available Commands</b>

/start - ✨ getting start message.
/ignore - ✅ unban and allow that user to sending message as channel (admin only).
/ignorelist - 📋 get list ignored channel.
/unignore - ⛔️ ban an unallow that user to sending message as channel (admin only).
/setlog - 🗞️ setting log chat (admin only).
/unsetlog - 🗑️ remove the log chat (admin only).`;
bot.callbackQuery('help', (ctx) => {
  try {
    return ctx.editMessageText(help_message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Back',
              callback_data: 'start',
            },
          ],
        ],
      },
    });
  } catch (error) {
    return error;
  }
});
bot.command('help', (ctx) => {
  try {
    return ctx.reply(help_message, {
      parse_mode: 'HTML',
      reply_to_message_id: ctx.message?.message_id,
      allow_sending_without_reply: true,
    });
  } catch (error) {
    return error;
  }
});

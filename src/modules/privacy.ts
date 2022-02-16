// this file is part of https://github.com/butthx/nochnbot.
import GModel from '../schema/database';
import { Composer, Context } from 'grammy';
import isAdmin from '../utils/isAdmin';
export const bot = new Composer();
const privacy_message = `By using this bot, you agree to the applicable privacy policy and terms of service. <a href="https://github.com/butthx/nochnbot/wiki/Privacy-Policy">Read more.</a>`;
bot.callbackQuery('privacy', (ctx) => {
  return ctx.editMessageText(privacy_message, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'back',
            callback_data: 'start',
          },
        ],
      ],
    },
  });
});
bot.command('privacy', (ctx) => {
  return ctx.reply(privacy_message, {
    parse_mode: 'HTML',
    reply_to_message_id: ctx.message?.message_id,
    allow_sending_without_reply: true,
  });
});

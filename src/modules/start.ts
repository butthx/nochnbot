// this file is part of https://github.com/butthx/nochnbot.
import GModel from '../schema/database';
import { Composer, Context } from 'grammy';
import isAdmin from '../utils/isAdmin';
export const bot = new Composer();
const start_message = `Hi, i can delete message from user which using channel to sending message. also this user banned that channel from your group, so the owner can't use it again for sending message in your group.`;
bot.callbackQuery('start', (ctx) => {
  return ctx.editMessageText(start_message, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '❓ Help',
            callback_data: 'help',
          },
          {
            text: '🔒 Privacy Policy',
            callback_data: 'privacy',
          },
        ],
        [
          {
            text: '📦 Source',
            url: 'https://github.com/butthx/nochnbot',
          },
          {
            text: '🧚🏻‍♂️ Support',
            url: 'https://t.me/butthxdiscuss',
          },
        ],
        [
          {
            text: '🗞️ Channel',
            url: 'https://t.me/butthxforward',
          },
        ],
      ],
    },
  });
});
bot.command('start', (ctx) => {
  return ctx.reply(start_message, {
    parse_mode: 'HTML',
    reply_to_message_id: ctx.message?.message_id,
    allow_sending_without_reply: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '❓ Help',
            callback_data: 'help',
          },
          {
            text: '🔒 Privacy Policy',
            callback_data: 'privacy',
          },
        ],
        [
          {
            text: '📦 Source',
            url: 'https://github.com/butthx/nochnbot',
          },
          {
            text: '🧚🏻‍♂️ Support',
            url: 'https://t.me/butthxdiscuss',
          },
        ],
        [
          {
            text: '🗞️ Channel',
            url: 'https://t.me/butthxforward',
          },
        ],
      ],
    },
  });
});

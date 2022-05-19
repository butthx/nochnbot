// this file is part of https://github.com/butthx/nochnbot.
import GModel from '../schema/database';
import { Composer, Context } from 'grammy';
import isAdmin from '../utils/isAdmin';
export const bot = new Composer();
let start_keyboard = [
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
      url: process.env.GROUP_URL ?? 'https://t.me/butthxdiscuss',
    },
  ],
  [
    {
      text: '🗞️ Channel',
      url: process.env.CHANNEL_URL ?? 'https://t.me/butthxforward',
    },
  ],
];
let start_message = `Hi, i can delete message from user which using channel to sending message. also this user banned that channel from your group, so the owner can't use it again for sending message in your group.`;
bot.callbackQuery('start', (ctx) => {
  try {
    if (ctx.me.id === 5093059646) {
      //@ts-ignore
      start_keyboard[2].push({
        text: '⭐ Give Star',
        callback_data: 'star',
      });
    } else {
      start_message += `\n\n<i>This bot is using source code of @nochannel_robot.</i>`;
    }
    return ctx.editMessageText(start_message, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: start_keyboard,
      },
    });
  } catch (error) {
    return error;
  }
});
bot.command('start', (ctx) => {
  try {
    if (ctx.me.id === 5093059646) {
      //@ts-ignore
      start_keyboard[2].push({
        text: '⭐ Give Star',
        callback_data: 'star',
      });
    } else {
      start_message += `\n\n<i>This bot is using source code of @nochannel_robot.</i>`;
    }
    return ctx.reply(start_message, {
      parse_mode: 'HTML',
      reply_to_message_id: ctx.message?.message_id,
      allow_sending_without_reply: true,
      reply_markup: {
        inline_keyboard: start_keyboard,
      },
    });
  } catch (error) {
    return error;
  }
});
bot.callbackQuery('star', async (ctx) => {
  try {
    return ctx.editMessageText(
      `If you like this bot, please give five star.\nThanks you for using this bot.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Bots Archive',
                url: 'https://t.me/BotsArchive/2350',
              },
              {
                text: 'Telegramic',
                url: 'https://t.me/tlgrmcbot?start=nochannel_robot-review',
              },
            ],
            [
              {
                text: 'Back',
                callback_data: 'start',
              },
            ],
          ],
        },
      }
    );
  } catch (error) {
    return error;
  }
});

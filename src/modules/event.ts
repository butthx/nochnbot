// this file is part of https://github.com/butthx/nochnbot.
import GModel from '../schema/database';
import { Composer, Context } from 'grammy';
import isAdmin from '../utils/isAdmin';
import generateCache from '../utils/cache';
import fs from 'fs';
export const bot = new Composer();
bot.use(async (ctx, next) => {
  try {
    if (ctx.chat?.type == 'private') {
      return next();
    }
    if (ctx.message?.sender_chat) {
      let dir = fs.readdirSync('./');
      let ignore: string[] = [];
      let log: string | undefined;
      if (dir.includes('ignore.json')) {
        let file = fs.readFileSync('./ignore.json', 'utf8');
        let json = JSON.parse(file);
        if (json[String(ctx.chat?.id)]) {
          ignore = json[String(ctx.chat?.id)].ignore;
          log = json[String(ctx.chat?.id)].log;
        } else {
          let data = await GModel.findOne({ chatId: String(ctx.chat?.id) });
          if (data !== null) {
            ignore = data.ignore;
            log = data.log;
          } else {
            data = new GModel();
            data.chatId = String(ctx.chat?.id);
            data = await data.save();
          }
          generateCache();
        }
      } else {
        let data = await GModel.findOne({ chatId: String(ctx.chat?.id) });
        if (data !== null) {
          ignore = data.ignore;
          log = data.log;
        } else {
          data = new GModel();
          data.chatId = String(ctx.chat?.id);
          data = await data.save();
        }
        generateCache();
      }
      if (
        ctx.message?.sender_chat?.type == 'channel' &&
        !ctx.message?.is_automatic_forward &&
        !ignore.includes(String(ctx.message?.sender_chat?.id))
      ) {
        await ctx.api.deleteMessage(ctx.chat?.id!, ctx.message?.message_id!);
        await ctx.banChatSenderChat(ctx.message?.sender_chat?.id);
        if (log) {
          try {
            let msg = await ctx.api.forwardMessage(log!, ctx.chat?.id!, ctx.message?.message_id!, {
              protect_content: true,
              disable_notification: true,
            });
            await ctx.api.sendMessage(
              msg.chat?.id!,
              `forwarded message from <code>${ctx.chat?.type}</code> (<code>${ctx.chat?.id}</code>)\n#report`,
              {
                reply_to_message_id: msg?.message_id,
                parse_mode: 'HTML',
                allow_sending_without_reply: true,
                protect_content: true,
              }
            );
          } catch (error) {}
        }
      }
    }
    return next();
  } catch (error) {
    return next();
  }
});
bot.on('message:new_chat_members', (ctx) => {
  if (ctx.message?.new_chat_members) {
    let u = ctx.message.new_chat_members[0];
    if (u.id == ctx.me.id) {
      return ctx.reply(
        `Hi Thanks you for adding me, i can delete message from user which using channel to sending message. also this user banned that channel from your group, so the owner can't use it again for sending message in your group.\nSource Code : https://github.com/butthx/nochnbot\nSupport Group : @butthxdiscuss`,
        {
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
        }
      );
    }
  }
});

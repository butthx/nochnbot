// this file is part of https://github.com/butthx/nochnbot.
import GModel from '../schema/database';
import { Composer, Context } from 'grammy';
import isAdmin from '../utils/isAdmin';
import remove from '../utils/removeSameIds';
import generateCache from '../utils/cache';
export const bot = new Composer();
bot.command('unsetlog', async (ctx) => {
  try {
    if (ctx.chat?.type == 'private') {
      return ctx.reply(`This command only can use in groups!`, {
        reply_to_message_id: ctx.message?.message_id,
        allow_sending_without_reply: true,
      });
    }

    if (ctx.message?.sender_chat?.type == 'channel' && !ctx.message?.is_automatic_forward) {
      return ctx.reply(`Click the button below to verify that you are an admin.`, {
        reply_to_message_id: ctx.message?.message_id,
        allow_sending_without_reply: true,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'i am admin',
                callback_data: `unsetlog`,
              },
            ],
          ],
        },
      });
    }
    if (!(await isAdmin(ctx))) {
      return ctx.reply(`Are you admin?`, {
        reply_to_message_id: ctx.message?.message_id,
        allow_sending_without_reply: true,
      });
    }
    let data = await GModel.findOne({
      chatId: String(ctx.chat?.id),
    });
    if (data == null) {
      data = new GModel();
      data.chatId = String(ctx.chat?.id);
    }
    if (!data.log) {
      return ctx.reply(`This chat is not connected to any log.`, {
        reply_to_message_id: ctx.message?.message_id,
        parse_mode: 'HTML',
        allow_sending_without_reply: true,
      });
    }
    data.log = undefined;
    generateCache();
    data = await data.save();
    return ctx.reply(`Successfully unsetlog this chat.`, {
      reply_to_message_id: ctx.message?.message_id,
      parse_mode: 'HTML',
      allow_sending_without_reply: true,
    });
  } catch (error: any) {
    return ctx.reply(error.message, {
      reply_to_message_id: ctx.message?.message_id,
      allow_sending_without_reply: true,
    });
  }
});
bot.callbackQuery(/setlog/, async (ctx) => {
  try {
    if (ctx.callbackQuery.message?.reply_to_message) {
      let allowed = ['creator', 'administrator'];
      let user = await ctx.getChatMember(Number(ctx.from?.id));
      if (!allowed.includes(user.status)) {
        return ctx.answerCallbackQuery('Are you admin??');
      }
      let data = await GModel.findOne({
        chatId: String(ctx.chat?.id),
      });
      if (data == null) {
        data = new GModel();
        data.chatId = String(ctx.chat?.id);
      }
      if (!data.log) {
        return ctx.editMessageText(`This chat is not connected to any log.`, {
          parse_mode: 'HTML',
        });
      }
      data.log = undefined;
      data = await data.save();
      generateCache();
      return ctx.editMessageText(`Successfully unsetlog this chat`, {
        parse_mode: 'HTML',
      });
    }
    return ctx.editMessageText(`Error : message not found.`, {
      parse_mode: 'HTML',
    });
  } catch (error: any) {
    return ctx.editMessageText(error.message);
  }
});

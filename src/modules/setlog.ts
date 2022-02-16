// this file is part of https://github.com/butthx/nochnbot.
import GModel from '../schema/database';
import { Composer, Context } from 'grammy';
import isAdmin from '../utils/isAdmin';
import remove from '../utils/removeSameIds';
import generateCache from '../utils/cache';
export const bot = new Composer();
bot.command('setlog', async (ctx) => {
  try {
    if (ctx.chat?.type == 'private') {
      return ctx.reply(`This command only can use in groups!`, {
        reply_to_message_id: ctx.message?.message_id,
        allow_sending_without_reply: true,
      });
    }
    if (ctx.message?.forward_from && !ctx.message?.forward_from_chat) {
      return ctx.reply(
        `Please forward message from group or channel. Make sure that not from user and if you click the text <code>forward from ...</code> it redirect to correct chat.`,
        {
          reply_to_message_id: ctx.message?.message_id,
          parse_mode: 'HTML',
          allow_sending_without_reply: true,
        }
      );
    }
    if (ctx.message?.forward_from_chat) {
      if (ctx.message?.sender_chat?.type == 'channel' && !ctx.message?.is_automatic_forward) {
        return ctx.reply(`Click the button below to verify that you are an admin.`, {
          reply_to_message_id: ctx.message?.message_id,
          allow_sending_without_reply: true,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'i am admin',
                  callback_data: `setlog ${ctx.message?.forward_from_chat.id}`,
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
      try {
        let forward_from_chat = ctx.message?.forward_from_chat;
        await ctx.api.sendMessage(
          forward_from_chat?.id!,
          `This <code>${forward_from_chat?.type}</code> has been set as log of ${ctx.chat?.type} <code>${ctx.chat?.id}</code> by <code>${ctx.from?.id}</code>. All message log will have a protect content.`,
          {
            parse_mode: 'HTML',
            protect_content: true,
          }
        );
        let data = await GModel.findOne({
          chatId: String(ctx.chat?.id),
        });
        if (data == null) {
          data = new GModel();
          data.chatId = String(ctx.chat?.id);
        }
        data.log = String(forward_from_chat?.id);
        data = await data.save();
        generateCache();
        return ctx.reply(
          `Successfully make <code>${forward_from_chat?.id}</code> as chat log of this <code>${ctx.chat?.type}</code>.\n\n<i>Now the privacy policy depends on this group policy, No longer relying on bots about a setlog.</i>`,
          {
            reply_to_message_id: ctx.message?.message_id,
            parse_mode: 'HTML',
            allow_sending_without_reply: true,
          }
        );
      } catch (error: any) {
        return ctx.reply(error.message, {
          reply_to_message_id: ctx.message?.message_id,
          allow_sending_without_reply: true,
        });
      }
    }
    return ctx.reply(
      `<b>Setting a log channel</b>\nTo setting a log channel you can:\n- add me in target channel, send <code>/setlog</code> in that channel, then forward that message to your groups\n- for setting group as log, send <code>/setlog</code> with anonymous admin, then forward it.`,
      {
        reply_to_message_id: ctx.message?.message_id,
        parse_mode: 'HTML',
        allow_sending_without_reply: true,
      }
    );
  } catch (error: any) {
    return ctx.reply(error.message, {
      reply_to_message_id: ctx.message?.message_id,
      allow_sending_without_reply: true,
    });
  }
});
bot.callbackQuery(/setlog (.*)/, async (ctx) => {
  try {
    if (ctx.callbackQuery.message?.reply_to_message) {
      let allowed = ['creator', 'administrator'];
      let user = await ctx.getChatMember(Number(ctx.from?.id));
      if (!allowed.includes(user.status)) {
        return ctx.answerCallbackQuery('Are you admin??');
      }
      try {
        let forward_from_chat = ctx.callbackQuery.message?.reply_to_message?.forward_from_chat;
        await ctx.api.sendMessage(
          forward_from_chat?.id!,
          `This <code>${forward_from_chat?.type}</code> has been set as log of ${ctx.chat?.type} <code>${ctx.chat?.id}</code> by <code>${ctx.from?.id}</code>. All message log will have a protect content.`,
          {
            parse_mode: 'HTML',
            protect_content: true,
          }
        );
        let data = await GModel.findOne({
          chatId: String(ctx.chat?.id),
        });
        if (data == null) {
          data = new GModel();
          data.chatId = String(ctx.chat?.id);
        }
        data.log = String(forward_from_chat?.id);
        data = await data.save();
        generateCache();
        return ctx.editMessageText(
          `Successfully make <code>${forward_from_chat?.id}</code> as chat log of this <code>${ctx.chat?.type}</code>.\n\n<i>Now the privacy policy depends on this group policy, No longer relying on bots about a setlog.</i>`,
          {
            parse_mode: 'HTML',
          }
        );
      } catch (error: any) {
        return ctx.editMessageText(error.message);
      }
    }
    return ctx.editMessageText(`Error : message not found.`, {
      parse_mode: 'HTML',
    });
  } catch (error: any) {
    return ctx.editMessageText(error.message);
  }
});

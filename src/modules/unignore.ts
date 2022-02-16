// this file is part of https://github.com/butthx/nochnbot.
import GModel from '../schema/database';
import { Composer, Context } from 'grammy';
import isAdmin from '../utils/isAdmin';
import remove from '../utils/removeSameIds';
import generateCache from '../utils/cache';
export const bot = new Composer();
async function unignoreFnText(ctx) {
  try {
    let text = remove(String(ctx.message?.text).split(' '));
    let data = await GModel.findOne({
      chatId: String(ctx.chat?.id),
    });
    let results = `<b>Unignoring ${text.length} channels.</b>`;
    let msg = await ctx.reply(results, {
      reply_to_message_id: ctx.message?.message_id,
      parse_mode: 'HTML',
      allow_sending_without_reply: true,
    });
    if (data == null) {
      let Data = new GModel();
      Data.chatId = String(ctx.chat?.id);
      data = Data;
    }
    for (let i = 0; i < text.length; i++) {
      let chatId = text[i];
      if (isNaN(Number(chatId))) {
        results += `\n<b>${chatId}</b> - not a number!`;
        continue;
      }
      if (chatId[0] !== '-') {
        results += `\n<b>${chatId}</b> - not a channel!`;
        continue;
      }
      //@ts-ignore
      if (data.ignore.includes(chatId)) {
        results += `\n<b>${chatId}</b> - removed`;
        //@ts-ignore
        let arr = remove(data.ignore, false);
        for (let c = 0; c < arr.length; c++) {
          if (arr[c] === chatId) {
            //@ts-ignore
            arr.splice(c, 1);
          }
        }
        //@ts-ignore
        data.ignore = arr;
        if (data.log) {
          try {
            await ctx.api.sendMessage(
              data.log!,
              `<b>New unignored channel.</b>\nChannelId : <code>${chatId}</code>\nChatId : <code>${
                ctx.chat?.id
              }</code>\nAdmin : <a href="${ctx.from.id}">${
                ctx.from.last_name
                  ? ctx.from.first_name + ' ' + ctx.from.last_name
                  : ctx.from.first_name
              }</a>\nAdminId : <code>${ctx.from.id}</code>\n#remove`,
              {
                parse_mode: 'HTML',
                protect_content: true,
              }
            );
          } catch (error) {}
        }
      } else {
        results += `\n<b>${chatId}</b> - already`;
      }
      await ctx.banChatSenderChat(Number(chatId));
      continue;
    }
    //@ts-ignore
    data = await data.save();
    generateCache();
    return ctx.api.editMessageText(msg.chat.id, msg.message_id, results, {
      parse_mode: 'HTML',
    });
  } catch (error: any) {
    return ctx.reply(error.message, {
      reply_to_message_id: ctx.message?.message_id,
      allow_sending_without_reply: true,
    });
  }
}
async function unignoreFnReply(ctx) {
  try {
    let msgR = ctx.message?.reply_to_message;
    if (msgR?.sender_chat?.type == 'channel' && !msgR?.is_automatic_forward) {
      let data = await GModel.findOne({
        chatId: String(ctx.chat?.id),
      });
      let results = `<b>Uningnore 1 channels.</b>`;
      let msg = await ctx.reply(results, {
        reply_to_message_id: ctx.message?.message_id,
        parse_mode: 'HTML',
        allow_sending_without_reply: true,
      });
      if (data == null) {
        let Data = new GModel();
        Data.chatId = String(ctx.chat?.id);
        data = Data;
      }
      let chatId = String(msgR?.sender_chat?.id);
      //@ts-ignore
      if (data.ignore.includes(chatId)) {
        results += `\n<b>${chatId}</b> - removed`;
        //@ts-ignore
        let arr = remove(data.ignore, false);
        for (let c = 0; c < arr.length; c++) {
          if (arr[c] === chatId) {
            //@ts-ignore
            arr.splice(c, 1);
          }
        }
        //@ts-ignore
        data.ignore = arr;
        if (data.log) {
          try {
            await ctx.api.sendMessage(
              data.log!,
              `<b>New unignored channel.</b>\nChannelId : <code>${chatId}</code>\nChatId : <code>${
                ctx.chat?.id
              }</code>\nAdmin : <a href="${ctx.from.id}">${
                ctx.from.last_name
                  ? ctx.from.first_name + ' ' + ctx.from.last_name
                  : ctx.from.first_name
              }</a>\nAdminId : <code>${ctx.from.id}</code>\n#remove`,
              {
                parse_mode: 'HTML',
                protect_content: true,
              }
            );
          } catch (error) {}
        }
      } else {
        results += `\n<b>${chatId}</b> - already`;
      }
      await ctx.banChatSenderChat(Number(chatId));
      //@ts-ignore
      data = await data.save();
      generateCache();
      return ctx.api.editMessageText(msg.chat.id, msg.message_id, results, {
        parse_mode: 'HTML',
      });
    }
    return ctx.reply(
      `<b>Unignoring Channel.</b>\nTo unignoring channel you can :\n<b>-</b> Reply message from channel with <code>/unignore</code>\n<b>-</b> Send <code>/unignore [chatId]</code> with channel id. Channel id must be a number, not a username. Example : <code>/unignore -1001234567890 -1002345678901 -1003456789012</code>. For multiple channel, separate channelId with spaces like example.`,
      {
        parse_mode: 'HTML',
        reply_to_message_id: ctx.message?.message_id,
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
async function unignoreFn(ctx) {
  try {
    let text = remove(String(ctx.message?.text).split(' '));
    if (text.length > 0) {
      /*if (text.length > 10) {
        return ctx.reply(
          `The list of chatId is redundant, max 10 chatId at a same time.`,
          {
            reply_to_message_id: ctx.message?.message_id,
            allow_sending_without_reply: true,
          }
        );
      }*/
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
                  callback_data: `unignore`,
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
      return unignoreFnText(ctx);
    }
    if (ctx.message?.reply_to_message) {
      if (ctx.chat?.type == 'private') {
        return ctx.reply(`This command only can use in groups!`, {
          reply_to_message_id: ctx.message?.message_id,
          allow_sending_without_reply: true,
        });
      }
      if (
        ctx.message?.sender_chat?.type == 'channel' &&
        !ctx.message?.is_automatic_forward &&
        ctx.message?.reply_to_message?.sender_chat &&
        !ctx.message?.reply_to_message?.is_automatic_forward
      ) {
        return ctx.reply(`Click the button below to verify that you are an admin.`, {
          reply_to_message_id: ctx.message?.message_id,
          allow_sending_without_reply: true,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'i am admin',
                  callback_data: `unignore_rpl ${ctx.message?.reply_to_message?.sender_chat?.id}`,
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
      return unignoreFnReply(ctx);
    }
    return ctx.reply(
      `<b>Unignoring Channel.</b>\nTo unignoring channel you can :\n<b>-</b> Reply message from channel with <code>/unignore</code>\n<b>-</b> Send <code>/unignore [chatId]</code> with channel id. Channel id must be a number, not a username. Example : <code>/unignore -1001234567890 -1002345678901 -1003456789012</code>. For multiple channel, separate channelId with spaces like example.`,
      {
        parse_mode: 'HTML',
        reply_to_message_id: ctx.message?.message_id,
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
bot.command('unignore', unignoreFn);
bot.callbackQuery(/^unignore\_rpl (.*)/, async (ctx) => {
  try {
    let allowed = ['creator', 'administrator'];
    let user = await ctx.getChatMember(Number(ctx.callbackQuery.from?.id));
    if (!allowed.includes(user.status)) {
      return ctx.answerCallbackQuery('Are you admin??');
    }
    let text = remove(String(ctx.callbackQuery.data).split(' '));
    let data = await GModel.findOne({
      chatId: String(ctx.chat?.id),
    });
    let results = `<b>Unignoring ${text.length} channels.</b>`;
    await ctx.editMessageText(results, {
      parse_mode: 'HTML',
    });
    if (data == null) {
      let Data = new GModel();
      Data.chatId = String(ctx.chat?.id);
      data = Data;
    }
    for (let i = 0; i < text.length; i++) {
      let chatId = text[i];
      if (isNaN(Number(chatId))) {
        results += `\n<b>${chatId}</b> - not a number!`;
        continue;
      }
      if (chatId[0] !== '-') {
        results += `\n<b>${chatId}</b> - not a channel!`;
        continue;
      }
      //@ts-ignore
      if (data.ignore.includes(chatId)) {
        results += `\n<b>${chatId}</b> - removed`;
        //@ts-ignore
        let arr = remove(data.ignore, false);
        for (let c = 0; c < arr.length; c++) {
          if (arr[c] === chatId) {
            //@ts-ignore
            arr.splice(c, 1);
          }
        }
        //@ts-ignore
        data.ignore = arr;
        if (data.log) {
          try {
            await ctx.api.sendMessage(
              data.log!,
              `<b>New unignored channel.</b>\nChannelId : <code>${chatId}</code>\nChatId : <code>${
                ctx.chat?.id
              }</code>\nAdmin : <a href="${ctx.from.id}">${
                ctx.from.last_name
                  ? ctx.from.first_name + ' ' + ctx.from.last_name
                  : ctx.from.first_name
              }</a>\nAdminId : <code>${ctx.from.id}</code>\n#remove`,
              {
                parse_mode: 'HTML',
                protect_content: true,
              }
            );
          } catch (error) {}
        }
      } else {
        results += `\n<b>${chatId}</b> - already`;
      }
      await ctx.banChatSenderChat(Number(chatId));
      continue;
    }
    //@ts-ignore
    data = await data.save();
    generateCache();
    return ctx.editMessageText(results, {
      parse_mode: 'HTML',
    });
  } catch (error: any) {
    return ctx.editMessageText(error.message);
  }
});
bot.callbackQuery('unignore', async (ctx) => {
  try {
    if (ctx.callbackQuery.message?.reply_to_message) {
      let allowed = ['creator', 'administrator'];
      let user = await ctx.getChatMember(Number(ctx.callbackQuery.from?.id));
      if (!allowed.includes(user.status)) {
        return ctx.answerCallbackQuery('Are you admin??');
      }
      let text = remove(String(ctx.callbackQuery.message?.reply_to_message?.text).split(' '));
      let data = await GModel.findOne({
        chatId: String(ctx.chat?.id),
      });
      let results = `<b>Unignoring ${text.length} channels.</b>`;
      await ctx.editMessageText(results, {
        parse_mode: 'HTML',
      });
      if (data == null) {
        let Data = new GModel();
        Data.chatId = String(ctx.chat?.id);
        data = Data;
      }
      for (let i = 0; i < text.length; i++) {
        let chatId = text[i];
        if (isNaN(Number(chatId))) {
          results += `\n<b>${chatId}</b> - not a number!`;
          continue;
        }
        if (chatId[0] !== '-') {
          results += `\n<b>${chatId}</b> - not a channel!`;
          continue;
        }
        //@ts-ignore
        if (data.ignore.includes(chatId)) {
          results += `\n<b>${chatId}</b> - removed`;
          //@ts-ignore
          let arr = remove(data.ignore, false);
          for (let c = 0; c < arr.length; c++) {
            if (arr[c] === chatId) {
              //@ts-ignore
              arr.splice(c, 1);
            }
          }
          //@ts-ignore
          data.ignore = arr;
          if (data.log) {
            try {
              await ctx.api.sendMessage(
                data.log!,
                `<b>New unignored channel.</b>\nChannelId : <code>${chatId}</code>\nChatId : <code>${
                  ctx.chat?.id
                }</code>\nAdmin : <a href="${ctx.from.id}">${
                  ctx.from.last_name
                    ? ctx.from.first_name + ' ' + ctx.from.last_name
                    : ctx.from.first_name
                }</a>\nAdminId : <code>${ctx.from.id}</code>\n#remove`,
                {
                  parse_mode: 'HTML',
                  protect_content: true,
                }
              );
            } catch (error) {}
          }
        } else {
          results += `\n<b>${chatId}</b> - already`;
        }
        await ctx.banChatSenderChat(Number(chatId));
        continue;
      }
      //@ts-ignore
      data = await data.save();
      generateCache();
      return ctx.editMessageText(results, {
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

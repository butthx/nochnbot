require("dotenv").config();
const { Telegraf } = require("telegraf");
const express = require("express");
const fs = require("fs");
const app = express();
if (!process.env.BOT_TOKEN) {
  console.log("BOT_TOKEN is required!");
  process.exit(1);
}
const bot = new Telegraf(String(process.env.BOT_TOKEN));
//app.use(bot.webhookCallback("/"));
bot.use(async (ctx, next) => {
  try {
    if (ctx.chat.type == "private") {
      return next();
    }
    if (ctx.message.sender_chat) {
      let dir = fs.readdirSync("./");
      let ignore = [];
      if (dir.includes("ignore.json")) {
        let file = fs.readFileSync("./ignore.json", "utf8");
        let json = JSON.parse(file);
        if (json[ctx.message.chat.id]) {
          ignore = json[ctx.message.chat.id];
        }
      }
      if (
        ctx.message.sender_chat.type == "channel" &&
        !ctx.message.is_automatic_forward &&
        !ignore.includes(ctx.message.sender_chat.id)
      ) {
        await ctx.deleteMessage(ctx.message.message_id);
        await ctx.banChatSenderChat(ctx.message.sender_chat.id);
      }
    }
    return next();
  } catch (error) {
    return next();
  }
});
bot.start((ctx) => {
  return ctx.replyWithHTML(
    `Hi, i can delete message from user which using channel to sending message. also this user banned that channel from your group, so the owner can't use it again for sending message in your group.\n\n<b>How to use?</b>\n<i>Just add me in your group! and make me an admin in your group with permission deleteMessages and banUsers!</i>\n\nSource Code : https://github.com/butthx/nochnbot`
  );
});
async function isAdmin(ctx) {
  let user = await ctx.getChatMember(ctx.message.from.id);
  let allowed = ["creator", "administrator"];
  if (ctx.message.from.username == "GroupAnonymousBot") {
    return true;
  }
  return allowed.includes(user.status);
}
bot.command("ignore", async (ctx) => {
  try {
    let help = `<b>Ignoring Channel.</b>\nTo ignoring channel you can :\n<b>-</b> Reply message from channel with <code>/ignore</code>\n<b>-</b> Send <code>/ignore [chatId]</code> with channel id. Channel id must be a number, not a username. Example : <code>/ignore -1001234567890 -1002345678901 -1003456789012</code>. For multiple channel, separate channelId with spaces like example.`;
    if (ctx.chat.type == "private") {
      return ctx.replyWithHTML(`This command only can use in groups!`);
    }
    let text = ctx.message.text.split(" ");
    text.splice(0, 1);
    let me = await ctx.getChatMember(ctx.botInfo.id);
    if (me.status !== "administrator") {
      return ctx.reply(`I am not admin in here!`);
    }
    if (!(await isAdmin(ctx))) {
      return ctx.reply(`are you admin in here?`);
    }
    if (text.length > 0) {
      let msg = await ctx.replyWithHTML(`Please Wait..`,{
        reply_to_message_id : ctx.message.message_id
      });
      for (let id of text) {
        if (!isNaN(id) && id[0] == "-") {
          let channelId = Number(id);
          let dir = fs.readdirSync("./"); 
          if(dir.includes("ignore.json")){
            let file = await fs.readFileSync("./ignore.json", "utf8");
            let json = JSON.parse(file);
            if(json[ctx.chat.id]){
              let data = json[ctx.chat.id]; 
              if (!data.includes(channelId)) {
                data.push(channelId);
                json[ctx.message.chat.id] = data;
              }
            }else{
              json[ctx.message.chat.id] = [
               channelId
              ];
            }
            await fs.writeFileSync("./ignore.json", JSON.stringify(json));
          }else{
            let json = {};
            json[ctx.message.chat.id] = [
              channelId
            ];
            await fs.writeFileSync("./ignore.json", JSON.stringify(json));
          }
        }
        try{
          await ctx.unbanChatSenderChat(
            channelId
          );
        }catch(e){}
      }
      return ctx.telegram.editMessageText(msg.chat.id,msg.message_id,undefined,"Done!");
    } else {
      if (!ctx.message.reply_to_message) {
        return ctx.replyWithHTML(help);
      }
      if (ctx.message.reply_to_message.sender_chat) {
        if (
          ctx.message.reply_to_message.sender_chat.type !== "channel" ||
          ctx.message.reply_to_message.is_automatic_forward
        ) {
          return ctx.replyWithHTML(help);
        }
      }
      let msg = await ctx.replyWithHTML(
        `Sure, I will ignoring and unbanning this user.`,
        {
          reply_to_message_id: ctx.message.reply_to_message.message_id,
        }
      );
      let dir = fs.readdirSync("./");
      if (dir.includes("ignore.json")) {
        let file = await fs.readFileSync("./ignore.json", "utf8");
        let json = JSON.parse(file);
        if (json[ctx.message.chat.id]) {
          let data = json[ctx.message.chat.id];
          if (!data.includes(ctx.message.reply_to_message.sender_chat.id)) {
            data.push(ctx.message.reply_to_message.sender_chat.id);
            json[ctx.message.chat.id] = data;
          }
        } else {
          json[ctx.message.chat.id] = [
            ctx.message.reply_to_message.sender_chat.id,
          ];
        }
        await fs.writeFileSync("./ignore.json", JSON.stringify(json));
      } else {
        let json = {};
        json[ctx.message.chat.id] = [
          ctx.message.reply_to_message.sender_chat.id,
        ];
        await fs.writeFileSync("./ignore.json", JSON.stringify(json));
      }
      await ctx.unbanChatSenderChat(
        ctx.message.reply_to_message.sender_chat.id
      );
      return ctx.telegram.editMessageText(msg.chat.id,msg.message_id,undefined,"Done!");
    }
    return ctx.replyWithHTML(help);
  } catch (error) {
    return ctx.replyWithHTML(
      `Sorry, i can't ignore this person cause : <code>${error.message}</code>.\nPlease report this issue to developer (@butthxdiscuss) or open new issue in github!\nhttps://github.com/butthx/nochnbot`
    );
  }
});
bot.command("unignore", async (ctx) => {
  try {
    let help = `<b>Unignoring Channel.</b>\nTo unignoring channel you can :\n<b>-</b> Reply message from channel with <code>/unignore</code>\n<b>-</b> Send <code>/unignore [chatId]</code> with channel id. Channel id must be a number, not a username. Example : <code>/unignore -1001234567890 -1002345678901 -1003456789012</code>. For multiple channel, separate channelId with spaces like example.`;
    if (ctx.chat.type == "private") {
      return ctx.replyWithHTML(`This command only can use in groups!`);
    }
    let text = ctx.message.text.split(" ");
    text.splice(0, 1);
    let me = await ctx.getChatMember(ctx.botInfo.id);
    if (me.status !== "administrator") {
      return ctx.reply(`I am not admin in here!`);
    }
    if (!(await isAdmin(ctx))) {
      return ctx.reply(`are you admin in here?`);
    }
    if (text.length > 0) {
      let msg = await ctx.replyWithHTML(`Please Wait..`,{
        reply_to_message_id : ctx.message.message_id
      });
      for (let id of text) {
        if (!isNaN(id) && id[0] == "-") {
          let channelId = Number(id);
          let dir = fs.readdirSync("./"); 
          if(dir.includes("ignore.json")){
            let file = await fs.readFileSync("./ignore.json", "utf8");
            let json = JSON.parse(file);
            if(json[ctx.chat.id]){
              let data = json[ctx.chat.id]; 
              for(let i = 0; i < data.length; i++){
                if(data[i] == channelId){
                  data.splice(i,1)
                }
              }
              json[ctx.chat.id] = data;
            }
            await fs.writeFileSync("./ignore.json", JSON.stringify(json));
          }
        }
        try{
          await ctx.banChatSenderChat(
            channelId
          );
        }catch(e){}
      }
      return ctx.telegram.editMessageText(msg.chat.id,msg.message_id,undefined,"Done!");
    } else {
      if (!ctx.message.reply_to_message) {
        return ctx.replyWithHTML(help);
      }
      if (ctx.message.reply_to_message.sender_chat) {
        if (
          ctx.message.reply_to_message.sender_chat.type !== "channel" ||
          ctx.message.reply_to_message.is_automatic_forward
        ) {
          return ctx.replyWithHTML(help);
        }
      }
      let msg = await ctx.replyWithHTML(
        `Sure, I will unignoring and banning this user.`,
        {
          reply_to_message_id: ctx.message.reply_to_message.message_id,
        }
      );
      let dir = fs.readdirSync("./");
      if (dir.includes("ignore.json")) {
        let file = await fs.readFileSync("./ignore.json", "utf8");
        let json = JSON.parse(file);
        if (json[ctx.message.chat.id]) {
          let data = json[ctx.message.chat.id];
          for(let i = 0; i < data.length; i++){
            if(data[i] == ctx.message.reply_to_message.sender_chat.id){
              data.splice(i,1)
            }
          }
          json[ctx.chat.id] = data;
        }
        await fs.writeFileSync("./ignore.json", JSON.stringify(json));
      }
      await ctx.banChatSenderChat(
        ctx.message.reply_to_message.sender_chat.id
      );
      return ctx.telegram.editMessageText(msg.chat.id,msg.message_id,undefined,"Done!");
    }
    return ctx.replyWithHTML(help);
  } catch (error) {
    return ctx.replyWithHTML(
      `Sorry, i can't unignore this person cause : <code>${error.message}</code>.\nPlease report this issue to developer (@butthxdiscuss) or open new issue in github!\nhttps://github.com/butthx/nochnbot`
    );
  }
});
bot.on("new_chat_member", (ctx) => {
  if (ctx.message.new_chat_member.id == ctx.botInfo.id) {
    return ctx.replyWithHTML(
      `Hi, thanks for using me,i can delete message from user which using channel to sending message. also this user banned that channel from your group, so the owner can't use it again for sending message in your group.\n\n<b>How to use?</b>\n<i>Just add me in your group! and make me an admin in your group with permission deleteMessages and banUsers!</i>\n\nSource Code : https://github.com/butthx/nochnbot`
    );
  }
});
bot.catch((error, ctx) => {
  try {
    return ctx.replyWithHTML(
      `Sorry, I can't work properly cause: <code>${error.message}</code>.\nPlease report this issue to developer (@butthxdiscuss) or open new issue in github!\nhttps://github.com/butthx/nochnbot`
    );
  } catch (e) {
    return console.log(e);
  }
});
bot.launch();
//app.listen(process.env.PORT || 3000,()=>{
//  return console.log("bot running")
//});

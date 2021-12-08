require("dotenv").config();
const {Telegraf} = require("telegraf");
const express = require("express");
const fs = require("fs");
const app = express(); 
if(!process.env.BOT_TOKEN){
  console.log("BOT_TOKEN is required!");
  process.exit(1);
}
const bot = new Telegraf(String(process.env.BOT_TOKEN));
bot.use(async (ctx,next) => {
  try{
    await next();
    let dir = fs.readdirSync("./"); 
    let ignore = [];
    if(dir.includes("ignore.json")){
      let file = fs.readFileSync("./ignore.json","utf8");
      let json = JSON.parse(file);
      if(json[ctx.message.chat.id]){
        ignore = json[ctx.message.chat.id];
      }
    }
    if(ctx.message.sender_chat){
      if(ctx.message.sender_chat.type == "channel" && !ctx.message.is_automatic_forward && !ignore.includes(ctx.message.sender_chat.id)){
        await ctx.deleteMessage(ctx.message.message_id);
        await ctx.banChatSenderChat(ctx.message.sender_chat.id);
      }
    }
    return true;
  }catch(error){ 
    ctx.replyWithHTML(`Sorry, i can't banned this person cause : <code>${error.message}</code>.\nPlease report this issue to developer (@butthxdiscuss) or open new issue in github!\nhttps://github.com/butthx/nochnbot`);
    return next();
  }
});
bot.start(ctx => {
  return ctx.replyWithHTML(`Hi, i can delete message from user which using channel to sending message. also this user banned that channel from your group, so the owner can't use it again for sending message in your group.\n\n<b>How to use?</b>\n<i>Just add me in your group! and make me an admin in your group with permission deleteMessages and banUsers!</i>\n\nSource Code : https://github.com/butthx/nochnbot`);
});
bot.command("ignore",async (ctx)=>{
  try{ 
    let me = await ctx.getChatMember(ctx.botInfo.id); 
    if(me.status !== 'administrator'){
      return ctx.reply(`I am not admin in here!`);
    }
    if(ctx.message.sender_chat.id !== ctx.message.chat.id){
      let user = await ctx.getChatMember(ctx.message.from.id);
      if(user.status !== "administrator" || user.status !== "creator"){
        return ctx.reply(`are you admin in here?`);
      }
    }
    if(!ctx.message.reply_to_message){
      return ctx.replyWithHTML(`Please reply message from channel which using by user to sending message.`);
    }
    if(ctx.message.reply_to_message.sender_chat){
      if((ctx.message.reply_to_message.sender_chat.type !== "channel") || (ctx.message.reply_to_message.is_automatic_forward)){
        return ctx.replyWithHTML(`Please reply message from channel which using by user to sending message.`);
      }
      await ctx.replyWithHTML(`Sure! I will unbanning and ignoring this person.`,{
        reply_to_message_id : ctx.message.reply_to_message.message_id
      });
      let dir = fs.readdirSync("./"); 
      if(dir.includes("ignore.json")){
        let file = await fs.readFileSync("./ignore.json","utf8");
        let json = JSON.parse(file) ;
        if(json[ctx.message.chat.id]){
          let data = json[ctx.message.chat.id];
          if(!data.includes(ctx.message.reply_to_message.sender_chat.id)){
            json[ctx.message.chat.id] = data.push(ctx.message.reply_to_message.sender_chat.id);
          }
        }else{
          json[ctx.message.chat.id] = [ctx.message.reply_to_message.sender_chat.id];
        }
        await fs.writeFileSync("./ignore.json",JSON.stringify(json));
      }else{
        let json = {};
        json[ctx.message.chat.id] = [ctx.message.reply_to_message.sender_chat.id]; 
        await fs.writeFileSync("./ignore.json",JSON.stringify(json));
      }
      await ctx.unbanChatSenderChat(ctx.message.reply_to_message.sender_chat.id); 
      return ctx.replyWithHTML(`Done! This person now can chat with channels again.`,{
        reply_to_message_id : ctx.message.reply_to_message.message_id
      });
    }
    return ctx.replyWithHTML(`Please reply message from channel which using by user to sending message.`);
  }catch(error){
    return ctx.replyWithHTML(`Sorry, i can't ignore this person cause : <code>${error.message}</code>.\nPlease report this issue to developer (@butthxdiscuss) or open new issue in github!\nhttps://github.com/butthx/nochnbot`);
  }
}); 
bot.command("unignore",async (ctx) => {
  try{ 
    let me = await ctx.getChatMember(ctx.botInfo.id); 
    if(me.status !== 'administrator'){
      return ctx.reply(`I am not admin in here!`);
    }
    if(ctx.message.sender_chat.id !== ctx.message.chat.id){
      let user = await ctx.getChatMember(ctx.message.from.id);
      if(user.status !== "administrator" || user.status !== "creator"){
        return ctx.reply(`are you admin in here?`);
      }
    }
    if(!ctx.message.reply_to_message){
      return ctx.replyWithHTML(`Please reply message from channel which using by user to sending message.`);
    }
    if(ctx.message.reply_to_message.sender_chat){
      if((ctx.message.reply_to_message.sender_chat.type !== "channel") || (ctx.message.reply_to_message.is_automatic_forward)){
        return ctx.replyWithHTML(`Please reply message from channel which using by user to sending message.`);
      }
      await ctx.replyWithHTML(`Sure! I will banning.`,{
        reply_to_message_id : ctx.message.reply_to_message.message_id
      });
      let dir = fs.readdirSync("./"); 
      if(dir.includes("ignore.json")){
        let file = await fs.readFileSync("./ignore.json","utf8");
        let json = JSON.parse(file) ;
        if(json[ctx.message.chat.id]){
          let data = json[ctx.message.chat.id];
          if(data.includes(ctx.message.reply_to_message.sender_chat.id)){ 
            for(let i = 0; i < data.length; i++){
              if(data[i] == ctx.message.reply_to_message.sender_chat.id){
                data.splice(i,1);
              }
            }
          }
          json[ctx.message.chat.id] = data;
        }
        await fs.writeFileSync("./ignore.json",JSON.stringify(json));
      }
      await ctx.banChatSenderChat(ctx.message.reply_to_message.sender_chat.id); 
      return ctx.replyWithHTML(`Done! This person now can't chat with channels again.`,{
        reply_to_message_id : ctx.message.reply_to_message.message_id
      });
    }
    return ctx.replyWithHTML(`Please reply message from channel which using by user to sending message.`);
  }catch(error){
    return ctx.replyWithHTML(`Sorry, i can't unignore this person cause : <code>${error.message}</code>.\nPlease report this issue to developer (@butthxdiscuss) or open new issue in github!\nhttps://github.com/butthx/nochnbot`);
  }
});
bot.on("new_chat_member",(ctx)=>{
  if(ctx.message.new_chat_member.id == ctx.botInfo.id){
    return ctx.replyWithHTML(`Hi, thanks for using me,i can delete message from user which using channel to sending message. also this user banned that channel from your group, so the owner can't use it again for sending message in your group.\n\n<b>How to use?</b>\n<i>Just add me in your group! and make me an admin in your group with permission deleteMessages and banUsers!</i>\n\nSource Code : https://github.com/butthx/nochnbot`);
  }
});
bot.catch((error,ctx)=>{
  try{
    return ctx.replyWithHTML(`Sorry, I can't work properly cause: <code>${error.message}</code>.\nPlease report this issue to developer (@butthxdiscuss) or open new issue in github!\nhttps://github.com/butthx/nochnbot`);
  }catch(e){
    console.log(e);
  }
});
bot.launch(); 
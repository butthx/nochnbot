// this file is part of https://github.com/butthx/nochnbot.
import GModel from "../schema/database"
import {Composer,Context} from "grammy"
import isAdmin from "../utils/isAdmin"
import generateCache from "../utils/cache"
import fs from "fs"
export const bot = new Composer()
bot.use(async (ctx,next)=>{
  try{
    if (ctx.chat?.type == "private") {
      return next();
    }
    if(ctx.message?.sender_chat){
      let dir = fs.readdirSync("./")
      let ignore:string[] = []
      if(dir.includes("ignore.json")){
        let file = fs.readFileSync("./ignore.json","utf8") 
        let json = JSON.parse(file) 
        if(json[String(ctx.chat?.id)]){
          ignore = json[String(ctx.chat?.id)]
        }else{
          let data = await GModel.findOne({
            chatId : String(ctx.chat?.id)
          })
          if(data !== null){
            ignore = data.ignore
          }
          generateCache()
        }
      }else{
        let data = await GModel.findOne({
          chatId : String(ctx.chat?.id)
        })
        if(data !== null){
          ignore = data.ignore
        } 
        generateCache()
      } 
      if(
        ctx.message?.sender_chat?.type == "channel" && 
        !ctx.message?.is_automatic_forward && 
        !ignore.includes(String(ctx.message?.sender_chat?.id))
       ){
        await ctx.api.deleteMessage(ctx.chat?.id!,ctx.message?.message_id!);
        await ctx.banChatSenderChat(ctx.message?.sender_chat?.id);
      }
    }
    return next()
  }catch(error){
    return next()
  }
})
bot.on("message:new_chat_members",(ctx)=>{
  if (ctx.message?.new_chat_members) {
    let u = ctx.message.new_chat_members[0]
    if(u.id == ctx.me.id){
      return ctx.reply(
        `Hi, thanks for using me,i can delete message from user which using channel to sending message. also this user banned that channel from your group, so the owner can't use it again for sending message in your group.\n\n<b>How to use?</b>\n<i>Just add me in your group! and make me an admin in your group with permission deleteMessages and banUsers!</i>\n\nSource Code : https://github.com/butthx/nochnbot`,{
          parse_mode : "HTML"
        }
      );
    }
  }
})
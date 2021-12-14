// this file is part of https://github.com/butthx/nochnbot.
import GModel from "../schema/database"
import {Composer,Context} from "grammy"
import isAdmin from "../utils/isAdmin"
import generateCache from "../utils/cache"
export const bot = new Composer()
async function ignoreFnText (ctx){
  try{
    let text = String(ctx.message?.text).split(" ") 
    text.splice(0,1)
    let data = await GModel.findOne({
      chatId : String(ctx.chat?.id)
    })
    let results = `<b>Ignoring ${text.length} channels.</b>`
    let msg = await ctx.reply(results,{
      reply_to_message_id : ctx.message?.message_id,
      parse_mode : "HTML"
    })
    if(data == null){
      let Data = new GModel()
      Data.chatId = String(ctx.chat?.id)
      data = Data
    }
    for(let i = 0; i < text.length; i++) {
      let chatId = text[i]
      if(isNaN(Number(chatId))) {
        results += `\n<b>${chatId}</b> - not a number!`
        continue;
      }
      if(chatId[0] !== "-"){
        results += `\n<b>${chatId}</b> - not a channel!`
        continue;
      }
      //@ts-ignore
      if(!data.ignore.includes(chatId)){
        results += `\n<b>${chatId}</b> - new`
        //@ts-ignore
        data.ignore.push(chatId)
      }else{
        results += `\n<b>${chatId}</b> - already`
      }
      await ctx.unbanChatSenderChat(Number(chatId))
      continue;
    }
    //@ts-ignore
    data = await data.save()
    generateCache()
    return ctx.api.editMessageText(msg.chat.id,msg.message_id,results,{
        parse_mode : "HTML"
      })
  }catch(error:any){
    return ctx.reply(error.message,{
      reply_to_message_id : ctx.message?.message_id
    })
  }
}
async function ignoreFnReply (ctx) {
  try{
    let msgR = ctx.message?.reply_to_message 
    if(msgR?.sender_chat?.type == "channel" && !msgR?.is_automatic_forward){
      let data = await GModel.findOne({
        chatId : String(ctx.chat?.id)
      }) 
      let results = `<b>Ignoring 1 channels.</b>`
      let msg = await ctx.reply(results,{
        reply_to_message_id : ctx.message?.message_id,
        parse_mode : "HTML"
      }) 
      if(data == null){
        let Data = new GModel()
        Data.chatId = String(ctx.chat?.id)
        data = Data
      } 
      let chatId = String(msgR?.sender_chat?.id) 
      //@ts-ignore
      if(!data.ignore.includes(chatId)){
        results += `\n<b>${chatId}</b> - new`
        //@ts-ignore
        data.ignore.push(chatId)
      }else{
        results += `\n<b>${chatId}</b> - already`
      }
      await ctx.unbanChatSenderChat(Number(chatId)) 
      //@ts-ignore
      data = await data.save()
      generateCache
      return ctx.api.editMessageText(msg.chat.id,msg.message_id,results,{
          parse_mode : "HTML"
        })
    }
    return ctx.reply(`<b>Ignoring Channel.</b>\nTo ignoring channel you can :\n<b>-</b> Reply message from channel with <code>/ignore</code>\n<b>-</b> Send <code>/ignore [chatId]</code> with channel id. Channel id must be a number, not a username. Example : <code>/ignore -1001234567890 -1002345678901 -1003456789012</code>. For multiple channel, separate channelId with spaces like example.`,{
      parse_mode : "HTML",
      reply_to_message_id : ctx.message?.message_id
    })
  }catch(error:any){
    return ctx.reply(error.message,{
      reply_to_message_id : ctx.message?.message_id
    })
  }
}
async function ignoreFn (ctx) {
  try{
    let text = String(ctx.message?.text).split(" ") 
    text.splice(0,1)
    if(text.length > 0){ 
      if(!await isAdmin(ctx)){
        return ctx.reply(`Are you admin?`,{
          reply_to_message_id : ctx.message?.message_id
        })
      }
      return ignoreFnText(ctx)
    }
    if(ctx.message?.reply_to_message){ 
      if(!await isAdmin(ctx)){
        return ctx.reply(`Are you admin?`,{
          reply_to_message_id : ctx.message?.message_id
        })
      }
      return ignoreFnReply(ctx)
    }
    return ctx.reply(`<b>Ignoring Channel.</b>\nTo ignoring channel you can :\n<b>-</b> Reply message from channel with <code>/ignore</code>\n<b>-</b> Send <code>/ignore [chatId]</code> with channel id. Channel id must be a number, not a username. Example : <code>/ignore -1001234567890 -1002345678901 -1003456789012</code>. For multiple channel, separate channelId with spaces like example.`,{
      parse_mode : "HTML",
      reply_to_message_id : ctx.message?.message_id
    })
  }catch(error:any){
    return ctx.reply(error.message,{
      reply_to_message_id : ctx.message?.message_id
    })
  }
}
bot.command("ignore",ignoreFn)
bot.command("ignorelist",async (ctx)=>{
  try{
    let data = await GModel.findOne({
      chatId : String(ctx.chat?.id)
    })
    if(data == null){
      return ctx.reply(`<b>No ignore list.</b>`,{
        reply_to_message_id : ctx.message?.message_id,
        parse_mode : "HTML"
      })
    } 
    return ctx.reply(`<code>${data.ignore.join(" ")}</code>`,{
        reply_to_message_id : ctx.message?.message_id,
        parse_mode : "HTML"
      })
  }catch(error:any){
    return ctx.reply(error.message,{
      reply_to_message_id : ctx.message?.message_id
    })
  }
})
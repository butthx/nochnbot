// this file is part of https://github.com/butthx/nochnbot.
import GModel from "../schema/database"
import {Composer,Context} from "grammy"
import isAdmin from "../utils/isAdmin"
export const bot = new Composer()
async function unignoreFnText (ctx){
  try{
    let text = String(ctx.message?.text).split(" ") 
    text.splice(0,1)
    let data = await GModel.findOne({
      chatId : String(ctx.chat?.id)
    })
    let results = `<b>Unignoring ${text.length} channels.</b>`
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
        results += `\n<b>${chatId}</b> - removed`
        //@ts-ignore
        let arr = data.ignore 
        for(let c = 0; c < arr.length; c++){
          if(arr[c] === chatId){
            //@ts-ignore
            arr.splice(c,1)
          }
        }
        //@ts-ignore
        data.ignore = arr
      }else{
        results += `\n<b>${chatId}</b> - already`
      }
      await ctx.banChatSenderChat(Number(chatId))
      continue;
    }
    //@ts-ignore
    data = await data.save()
    return ctx.api.editMessageText(msg.chat.id,msg.message_id,results,{
        parse_mode : "HTML"
      })
  }catch(error:any){
    return ctx.reply(error.message,{
      reply_to_message_id : ctx.message?.message_id
    })
  }
}
async function unignoreFnReply (ctx) {
  try{
    let msgR = ctx.message?.reply_to_message 
    if(msgR?.sender_chat?.type == "channel" && !msgR?.is_automatic_forward){
      let data = await GModel.findOne({
        chatId : String(ctx.chat?.id)
      }) 
      let results = `<b>Uningnore 1 channels.</b>`
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
      if(data.ignore.includes(chatId)){
        results += `\n<b>${chatId}</b> - removed`
        //@ts-ignore
        let arr = data.ignore 
        for(let c = 0; c < arr.length; c++){
          if(arr[c] === chatId){
            //@ts-ignore
            arr.splice(c,1)
          }
        }
        //@ts-ignore
        data.ignore = arr
      }else{
        results += `\n<b>${chatId}</b> - already`
      }
      await ctx.banChatSenderChat(Number(chatId)) 
      //@ts-ignore
      data = await data.save()
      return ctx.api.editMessageText(msg.chat.id,msg.message_id,results,{
          parse_mode : "HTML"
        })
    }
    return ctx.reply(`<b>Unignoring Channel.</b>\nTo unignoring channel you can :\n<b>-</b> Reply message from channel with <code>/unignore</code>\n<b>-</b> Send <code>/unignore [chatId]</code> with channel id. Channel id must be a number, not a username. Example : <code>/unignore -1001234567890 -1002345678901 -1003456789012</code>. For multiple channel, separate channelId with spaces like example.`,{
      parse_mode : "HTML",
      reply_to_message_id : ctx.message?.message_id
    })
  }catch(error:any){
    return ctx.reply(error.message,{
      reply_to_message_id : ctx.message?.message_id
    })
  }
}
async function unignoreFn (ctx) {
  try{
    let text = String(ctx.message?.text).split(" ") 
    text.splice(0,1)
    if(text.length > 0){ 
      if(!await isAdmin(ctx)){
        return ctx.reply(`Are you admin?`,{
          reply_to_message_id : ctx.message?.message_id
        })
      }
      return unignoreFnText(ctx)
    }
    if(ctx.message?.reply_to_message){ 
      if(!await isAdmin(ctx)){
        return ctx.reply(`Are you admin?`,{
          reply_to_message_id : ctx.message?.message_id
        })
      }
      return unignoreFnReply(ctx)
    }
    return ctx.reply(`<b>Unignoring Channel.</b>\nTo unignoring channel you can :\n<b>-</b> Reply message from channel with <code>/unignore</code>\n<b>-</b> Send <code>/unignore [chatId]</code> with channel id. Channel id must be a number, not a username. Example : <code>/unignore -1001234567890 -1002345678901 -1003456789012</code>. For multiple channel, separate channelId with spaces like example.`,{
      parse_mode : "HTML",
      reply_to_message_id : ctx.message?.message_id
    })
  }catch(error:any){
    return ctx.reply(error.message,{
      reply_to_message_id : ctx.message?.message_id
    })
  }
}
bot.command("unignore",unignoreFn)
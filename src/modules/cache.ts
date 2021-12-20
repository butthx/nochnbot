// this file is part of https://github.com/butthx/nochnbot.
import GModel from "../schema/database"
import {Composer,Context} from "grammy"
import isAdmin from "../utils/isAdmin"
import fs from "fs"
export const bot = new Composer()

bot.command("import",async (ctx)=>{
  try{
  if(ctx.from?.id == (process.env.OWNER_ID ? Number(process.env.OWNER_ID) : 124180554) && ctx.message?.reply_to_message && ctx.message?.reply_to_message?.text){
    let json = JSON.parse(ctx.message?.reply_to_message?.text)
    for(let [key,value] of Object.entries(json)){
      let results = `Success importing data.`
      let msg = await ctx.api.sendMessage(Number(key),`<b>Importing data from old database.</b>`,{
        parse_mode : "HTML"
      }) 
      let data = await GModel.findOne({
        chatId : String(key)
      })
      if(data == null){
        let Data = new GModel() 
        Data.chatId = String(key)
        data = Data
      }
      //@ts-ignore
      for(let id of value){
        //@ts-ignore
        data.ignore.push(String(id))
        results += `\n<b>${id}</b> - success`
      }
      await ctx.api.editMessageText(msg.chat.id,msg.message_id,results,{
        parse_mode : "HTML"
      })
      await data.save()
    }
  }
  }catch(error:any){
    return ctx.reply(error.message,{
      reply_to_message_id : ctx.message?.message_id,
      allow_sending_without_reply: true
    })
  }
})
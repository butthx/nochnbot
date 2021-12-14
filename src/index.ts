// this file is part of https://github.com/butthx/nochnbot.
import dotenv from "dotenv"
import {connect} from "mongoose"
import {Bot,webhookCallback,Composer} from "grammy"
import express from "express"
import path from "path"
import fs from "fs"
import generateCache from "./utils/cache"

dotenv.config()

if(!process.env.BOT_TOKEN){
  throw new Error("\"env.BOT_TOKEN\" is missing.")
}
if(!process.env.MONGODB_URI){
  throw new Error("\"env.MONGODB_URI\" is missing.")
}

const app = express()
const bot = new Bot(String(process.env.BOT_TOKEN))
//app.use(express.json())
//app.use(webhookCallback(bot))

async function loadPlugins(){
  let dirname:string = path.join(__dirname,"modules")
  let fileList:Array<string> = fs.readdirSync(dirname)
  fileList.filter(file => file.endsWith(".js") || file.endsWith(".ts"))
  for(let fileName of fileList){
    let file = path.join(dirname,fileName) 
    const plugins = require(file) 
    for(let [key,value] of Object.entries(plugins)){
      if(value instanceof Composer){ 
        //@ts-ignore
        value as Composer 
        //@ts-ignore
        bot.use(value.middleware())
      }
    }
  }
}


connect(String(process.env.MONGODB_URI)) // connecting to database
generateCache() // create cache
loadPlugins() // load all plugins
bot.catch((error)=>{ // catching error
  return error.ctx.reply(error.message,{
    reply_to_message_id : error.ctx.message?.message_id
  })
})
bot.start() // running bot
//app.listen(process.env.PORT || 3000) // running bot
console.log("bot running.")
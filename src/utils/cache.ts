// this file is part of https://github.com/butthx/nochnbot.
import GModel from "../schema/database";
import { Composer, Context } from "grammy";
import isAdmin from "./isAdmin";
import fs from "fs";
export default async function generateCache() {
  try {
    let json = {};
    let data = await GModel.find({});
    for (let i = 0; i < data.length; i++) {
      //@ts-ignore
      let o = data[i];
      //@ts-ignore
      json[o.chatId] = o.ignore;
    }
    await fs.writeFileSync("./ignore.json", JSON.stringify(json));
    return true;
  } catch (error: any) {
    return error.message;
  }
}

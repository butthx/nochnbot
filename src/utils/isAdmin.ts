// this file is part of https://github.com/butthx/nochnbot.
import {Context} from "grammy"
export default async function isAdmin (ctx:Context){
  let allowed = ["creator", "administrator"];
  if (ctx.from?.username == "GroupAnonymousBot") {
    return true;
  }
  let user = await ctx.getChatMember(Number(ctx.from?.id));
  return allowed.includes(user.status);
}
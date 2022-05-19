// this file is part of https://github.com/butthx/nochnbot.

import { Context } from 'grammy';

export async function buildMsg(ctx: Context) {
  if (ctx.message) {
    let msg = ctx.message;
    if (msg.text) {
      return msg.text;
    } else {
      return new msgMedia().build(ctx).toString();
    }
  }
  return 'unknown message, please check the recent action.';
}
export type TypeMsgMedia =
  | 'sticker'
  | 'voice'
  | 'video'
  | 'animation'
  | 'document'
  | 'dice'
  | 'video_note'
  | 'audio'
  | 'photo';
export class msgMedia {
  type!: TypeMsgMedia;
  msg_id!: number;
  raw!: any;
  caption?:string;
  constructor() {}
  build(ctx: Context) {
    let isMedia: Array<TypeMsgMedia> = [
      'sticker',
      'voice',
      'video',
      'animation',
      'document',
      'dice',
      'video_note',
      'audio',
      'photo',
    ];
    if (ctx.message) {
      let msg = ctx.message;
      this.msg_id = msg.message_id;
      for (let [key, value] of Object.entries(msg)) {
        //@ts-ignore
        if (isMedia.includes(key)) {
          this.raw = value;
          //@ts-ignore
          this.type = key;
        }
      }
      this.caption = msg.caption
    }
    return this;
  }
  toString() {
    return `msgMedia ${JSON.stringify(this, null, 2)}`;
  }
}

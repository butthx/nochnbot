// this file is part of https://github.com/butthx/nochnbot.

import { Schema, model, Document } from 'mongoose';


export interface GInterface extends Document {
  chatId:string; 
  ignore:Array<string>;
}
export const GSchema = new Schema({
  chatId : {
    type : String,
    required : true
  },
  ignore : {
    type : Array,
    default : new Array()
  }
})
GSchema.set('strict', false)
GSchema.set('timestamps', true)

const GModel = model<GInterface>("groups",GSchema)
export default GModel
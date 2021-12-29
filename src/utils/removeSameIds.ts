// this file is part of https://github.com/butthx/nochnbot.
export default function remove(array:Array<any>,splice:boolean=true){
  if(splice) array.splice(0,1)
  let r:Array<any> = new Array() 
  for(let a of array){
    if(!r.includes(a)){
      r.push(a)
    }
  }
  return r
}
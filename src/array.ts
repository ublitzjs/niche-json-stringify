/**
* Serialise an array of integers in Bun.
* */
export function num_arr_bun(DATA: number[]): string {
  var l = DATA.length;
  if(!l) return '[]'
  var result = '['+ DATA[0]
  for(var i = 1; i < l; i++){
    result+=","+DATA[i]
  }
  return result + ']'
}
/**
* Serialise an array of integers in NodeJS. 
* */
export function num_arr_node(DATA: number[]): string {
  var l = DATA.length;
  if(!l) return '[]'
  var result = '['+ DATA[0]
  for(var i = 1; i < l; i++){
    result+=",";
    result+=DATA[i];
  }
  return result + ']'
}
/**
* Serialise an array of boolean values.
* The fastest in Bun for all lengths of arrays and in NodeJS for arrays with length < 20
* */
export function bool_arr_bun(DATA: boolean[]): string {
  var l = DATA.length;
  if(!l) return '[]'
  var result = '['+(DATA[0]?'true':'false')
  for(var i = 1; i < l; i++){
    result+=","+(DATA[i]?'true':'false')
  }
  return result + ']'
}
/**
* Serialise an array of boolean values.
* */
export function bool_arr_node(DATA: boolean[]): string {
  var l = DATA.length;
  if(!l) return '[]'
  var result = '['+(DATA[0]?'true':'false')
  for(var i = 1; i < l; i++){
    result+=",";
    result+=DATA[i]?'true':'false'
  }
  return result + ']'
}
/**
* Serialise an array of strings in NodeJS without escaping characters
* */
export function str_arr_node(DATA: string[]): string {
  if(DATA.length > 60) return JSON.stringify(DATA);
  let r=DATA.join('","');return r?'["'+r+'"]':'[]'
}
/**
* Generate a serialiser for a string[], which escapes characters.
* Usually slower than JSON.stringify
* @param esc escaping function, like CJSescape or FJSescape
* */
export function str_arr_esc_gen(esc: (str:string)=>string): (DATA:string[])=>string {
  return (DATA)=>{
    var l = DATA.length;
    if (!l) return '[]'
    else if(DATA.length > 60) return JSON.stringify(DATA)
    var result = '[' + esc(DATA[0]!)
    for (var i = 1; i < l; i++) {
      result += ',' + esc(DATA[i]!)
    }
    return result + ']'
  }
}
/**
* Serialise an array of strings in Bun without escaping characters
* */
export function str_arr_bun(DATA: string[]): string {
  var l = DATA.length;
  if (!l) return '[]'
  var result = '["'+DATA[0]!+'"'
  for(var i = 1; i < l; i++){
    result+=',"'+DATA[i]+'"'
  }
  return result + ']'
}


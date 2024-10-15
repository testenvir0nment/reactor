/*
const a = {};
const p = new variableProxy(a);



p.for[myevar]["bar"][123].push(123)
if (a?.for?.[myevar]?.["bar"]?.[123] === 123) {

}
setValue( data, p.for[myevar]["bar"], 123);


const PROPERTY = 0;
const ESCAPE = 2;

const lex = characters => {
  let tokens = [];
  let token = "";
  let escapping = false;
  for (let i = 0; i < characters.length; i++) {
    const c = characters[i];
    if (escapping) {
      token += c;
      escapping = false;
    } else if (".[]-".find(c) > -1) {
      if (token != "") {
        tokens.push(token);
        token = "";
      }
      tokens.push(c);
    } else if (c === "\\") {
      state = ESCAPE;
    } else {
      token += c;
    }
  }
  return tokens;
}
*/
/*
start = string property | [ subscript | empty
property = . string property | [ subscript | empty
subscript = index ] property | empty
index = - number | number | empty

*/
/*
const START = 0;
const PROPERTY = 1;
const SUBSCRIPT = 2;

let state = START;
const parse = lexed => {
  if ()
}
*/
//cosnt regex = /([^.]+|\[[^\]*])(\.[^.]+|\[[^\]]*\])*/g;

/*
path = property pathTail | [ index ] pathTail | ε
subscriptTail = index ] pathTail
pathTail = . property pathTail | [ subscriptTail | ε

*/
/*
path = property | subscript | ε
property = key pathTail
key = /\w+/
subscript = [ index ] pathTail
index = - number | number | ε
number = /\d+/
pathTail = . property | subscript | ε
*/
/*
const path = (lexed, i) => {
  if (i === lexed.length) {
    return [];
  }
  if (/^\w+$/.test(lexed[i])) {
    return property(lexed, i);
  }
  if (lexed[i] === "[") {
    return subscript(lexed, i);
  }
  throw new Error("Invalid path");
};

const property = (lexed, i) => {
  const key = lexed[i];
  return [{ type: "property", key }, ...pathTail(lexed, i + 1)];
};

const subscript = (lexed, i) => {
  if (/^\d+$/.test(lexed[i + 1])) {
    return [{ type: "subscript", index: parseInt(lexed[i + 1]) }, ...pathTail(lexed, i + 3)];
  }

const createLens = path => {

}


const get(keys, object) {
  if (keys.length === 0) {
    return object;
  }
}
*/

/*
Utils to get and set values using . and bracket syntax to traverse
objects and arrays. (i.e. "a.b", "a[1].b")
This is the parsing grammar used:
name -> id nameTail
nameTail -> "[" number "]" nameTail
            "." name
            end
id -> /[^\[\]\.]+/
number -> /[0-9]+/
*/

const LEFT_BRACKET = value => value === "[";
const RIGHT_BRACKET = value => value === "]";
const DOT = value => value === ".";
const IDENTIFIER = value =>
  value !== "[" && value !== "]" && value !== "." && value !== null;
const NUMBER = value => /^-?[0-9]+$/.test(value);
const END = value => value === null;

const next = (tokens, expected = () => true) => {
  const { value, done } = tokens.next();
  const token = done ? null : value;
  if (!expected(token)) {
    throw new Error("Invalid name");
  }
  return token;
};

const lex = name => {
  return name.match(/\[|\]|\.|[^.[\]]+/g).values();
};

const toObject = mixed => {
  const obj = mixed || {};
  if (typeof obj !== "object") {
    // throw new Error("Expected an object");
    return {};
  }
  return obj;
};

const toArray = mixed => {
  const array = mixed || [];
  if (!Array.isArray(array)) {
    // throw new Error("Expected an array");
    return [];
  }
  return array;
};

const setRules = onFinalValue => ({
  onObjectProperty(obj, id, recursiveReturn) {
    obj[id] = recursiveReturn;
    return obj;
  },
  onArrayProperty(array, index, recursiveReturn) {
    array[index] = recursiveReturn;
    return array;
  },
  onFinalValue
});

const getRules = {
  onObjectProperty(obj, id, recursiveReturn) {
    return recursiveReturn;
  },
  onArrayProperty(array, index, recursiveReturn) {
    return recursiveReturn;
  },
  onFinalValue(oldValue) {
    return oldValue;
  }
};

const noopRules = {
  onObjectProperty: () => undefined,
  onArrayProperty: () => undefined,
  onFinalValue: () => undefined
};

// These are mutually recursive functions, so declare the second one before
// it is used to get around linting rules.
let parseNameTail;

const parseName = (mixed, tokens, rules) => {
  const obj = toObject(mixed);
  const id = next(tokens, IDENTIFIER);
  const recursiveReturn = parseNameTail(obj[id], tokens, rules);
  return rules.onObjectProperty(obj, id, recursiveReturn);
};

parseNameTail = (mixed, tokens, rules) => {
  const firstToken = next(tokens);
  if (LEFT_BRACKET(firstToken)) {
    let index = parseInt(next(tokens, NUMBER));
    next(tokens, RIGHT_BRACKET);
    const array = toArray(mixed);
    if (index < 0) {
      index = array.length + index;
    }
    const recursiveReturn = parseNameTail(array[index], tokens, rules);
    return rules.onArrayProperty(array, index, recursiveReturn);
  }
  if (DOT(firstToken)) {
    return parseName(mixed, tokens, rules);
  }
  if (END(firstToken)) {
    return rules.onFinalValue(mixed);
  }
  throw new Error("Invalid name");
};

export const getValue = (obj, name) => {
  return parseName(obj, lex(name), getRules);
};

export const setValue = (obj, name, value) => {
  return parseName(obj, lex(name), setRules(() => value));
};

export const addArrayElement = (obj, name) => {
  return parseName(obj, lex(name), setRules(oldValue => {
    const array = oldValue || [];
    array.push(undefined);
    return array;
  }));
}

export const validate = name => {
  parseName({}, lex(name), noopRules);
}

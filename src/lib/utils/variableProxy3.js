/*
const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
    address: {
      type: "object",
      properties: {
        street: { type: "string" },
        city: { type: "string" },
        state: { type: "string" },
        zip: { type: "string" },
      },
    },
    phoneNumbers: {
      type: "array",
      items: { type: "string" },
    },
  },
}
*/

const MUTATING_ARRAY_FUNCTIONS = ["copyWithin", "fill", "pop", "push", "reverse", "shift", "sort", "splice", "unshift"];

const set = (data, schema, path, value) => {
  if (path.length === 1) {
    data[path[0]] = value;
  } else {
    const childSchema = schema.type === "object" ? schema.properties[path[0]] : schema.items;
    if (data[path[0]] === undefined) {
      data[path[0]] = childSchema.type === "object" ? {} : [];
    }
    set(data[path[0]], childSchema, path.slice(1), value);
  }
};

const get = (data, path) => {
  if (path.length === 0) {
    return data;
  }
  if (data[path[0]] === undefined || data[path[0]] === null) {
    return data[path[0]];
  }
  return get(data[path[0]], path.slice(1));
};

const createLens = (data, schema, path) => ({
  withKey: (key) => {
    return createLens(data, schema, [...path, key]);
  },
  get: () => {
    return get(data, path);
  },
  set: (value) => {
    return set(data, schema, path, value);
  }
});

const createProxyFunction = (lens, func, defaultValue, canMutate) => {
  return new Proxy(func, {
    apply(target, _thisArg, args) {
      let value = lens.get();
      if (value === undefined && canMutate) {
        lens.set(defaultValue);
        value = defaultValue;
      }
      return Reflect.apply(target, value, args);
    }
  });
};

const createProxy = (schema, lens) => {
  if (schema.type === "object") {
    return new Proxy(
      {},
      {
        get(target, key) {
          const value = Reflect.get(target, key);
          if (typeof value === "function") {
            return createProxyFunction(lens, value, {}, false);
          }
          if (Object.keys(schema.properties).includes(key)) {
            return createProxy(schema.properties[key], lens.withKey(key));
          }
          if (key === "toJSON") {
            return () => lens.get();
          }
          // TODO: don't throw errors, log a warning.
          throw new Error("Invalid key");
        },
        set(_target, key, value) {
          if (Object.keys(schema.properties).includes(key)) {
            lens.withKey(key).set(value);
            return true;
          }
          // TODO: don't throw errors, log a warning.
          throw new Error("Invalid key");
        },
        ownKeys(_target) {
          return Reflect.ownKeys(lens.get() || {});
        },
        has(_target, key) {
          return Reflect.has(lens.get() || {}, key);
        }
      }
    );
  }
  if (schema.type === "array") {
    return new Proxy([], {
      get(target, key) {
        const value = Reflect.get(target, key);
        if (typeof value === "function") {
          console.log("get", key);
          return createProxyFunction(lens, value, [], MUTATING_ARRAY_FUNCTIONS.includes(key));
        }
        if (key === "length") {
          return lens.get()?.length || 0;
        }
        if (key.match(/^\d+$/)) {
          return createProxy(schema.items, lens.withKey(key));
        }
        // TODO: don't throw errors, log a warning.
        throw new Error("Invalid key");
      },
      set(_target, key, value) {
        if (key.match(/^\d+$/)) {
          lens.withKey(key).set(value);
          return true;
        }
        if (key === "length") {
          const newValue = lens.get() || [];
          newValue.length = key;
          lens.set(newValue);
          return true;
        }
        // TODO: don't throw errors, log a warning.
        throw new Error("Invalid key");
      }
    });
  }
  // Return the value if it's not an object or array.
  return lens.get();
};

export default (schema, data) => {
  return createProxy(schema, createLens(data, schema, []));
};

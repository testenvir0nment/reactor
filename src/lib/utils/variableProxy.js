

const arrayOrObject = func => {
  let type = null;
  const value = {};

  // We proxy on a function to allow us to use the apply trap
  return new Proxy(() => undefined, {
    get(target, key) {
      console.log("get", key);
      if (Array.prototype[key]) {
        return arrayOrObject((...args) => {
          type = "array";
          value.length = value.length || 0;
          return Array.prototype[key].apply(value, args);
        });
      }
      if (key === "toJSON") {
        return arrayOrObject(() => {
          if (type === "array") {
            return Array.from(value);
          }
          if (type === "function") {
            return undefined;
          }
          return value;
        });
      }
      if (key.match(/^\d+$/)) {
        type = "array";
        value.length = Math.max(value.length || 0, Number.parseInt(key, 10) + 1);
      } else {
        type = "object";
      }
      value[key] = value[key] || arrayOrObject();
      return value[key];
    },
    set(target, key, val) {
      console.log("set", key);
      if (key.match(/^\d+$/)) {
        type = "array";
        value.length = Math.max(value.length || 0, Number.parseInt(key, 10) + 1);
      } else {
        type = "object";
      }
      value[key] = val;
      return true;
    },
    apply(target, thisArg, args) {
      type = "function";
      console.log("apply", args);
      return func(...args);
    }
  });
};


const createProxy = target => {
  return new Proxy(target, {
    get(target, key) {
      console.log("root get", key);
      if (key === "toJSON") {
        return target[key];
      }
      if (key in target === false) {
        target[key] = arrayOrObject();
      }
      if (typeof target[key] === "object") {
        return createProxy(target[key]);
      }
      return target[key];
    }
  });
};

export default createProxy;

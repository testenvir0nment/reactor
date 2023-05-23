
export default (name, createPart) => (...args) => {
  const part = createPart(...args);
  part.accept = visitor => visitor[`visit${name}`](...args);
  return part;
};

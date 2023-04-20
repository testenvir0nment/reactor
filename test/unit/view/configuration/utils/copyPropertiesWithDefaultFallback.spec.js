import copyPropertiesWithDefaultFallback from "../../../../../src/view/configuration/utils/copyPropertiesWithDefaultFallback";

describe("copyPropertiesWithDefaultFallback", () => {
  it("should copy only the keys specified", () => {
    const toObj = {};
    const fromObj = {
      a: "foo",
      b: "bar",
      c: ""
    };
    const defaultsObj = {
      a: "",
      b: "",
      c: ""
    };
    const keys = ["a", "b"];
    copyPropertiesWithDefaultFallback({
      toObj,
      fromObj,
      defaultsObj,
      keys
    });
    expect(Object.keys(toObj)).toEqual(keys);
  });

  it("should copy the default values when the key has not changed", () => {
    const toObj = {};
    const fromObj = {
      a: "",
      b: "bar",
      c: ""
    };
    const defaultsObj = {
      a: "",
      b: "",
      c: ""
    };
    const keys = ["a", "b"];
    copyPropertiesWithDefaultFallback({
      toObj,
      fromObj,
      defaultsObj,
      keys
    });
    expect(toObj).toEqual({ a: "", b: "bar" });
  });
});

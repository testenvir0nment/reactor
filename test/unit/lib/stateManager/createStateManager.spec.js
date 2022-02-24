/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createStateManager from "../../../../src/lib/stateManager/createStateManager";

describe("createStateManager", () => {
  let stateManager;

  const cacheIdsByName = {
    var1: "cacheId1",
    var2: "cacheId2"
  };

  const turbine = {
    getDataElementValue(name) {
      if (cacheIdsByName[name]) {
        return stateManager.getVariableByCacheId(cacheIdsByName[name]);
      }
      return "Unknown data element value";
    }
  };

  beforeEach(() => {
    stateManager = createStateManager({ turbine });
  });

  it("initializes variables to undefined", () => {
    expect(stateManager.getVariableByCacheId("cacheId1")).toBeUndefined();
  });

  it("throws an error on an invalid data element", () => {
    expect(() => stateManager.useVariableByName("var3")).toThrowError();
  });

  it("updates a variable", () => {
    const [value, setValue] = stateManager.useVariableByName("var1");
    expect(value).toBeUndefined();
    setValue({ a: 1 });
    expect(stateManager.getVariableByCacheId("cacheId1")).toEqual({ a: 1 });
  });

  it("updates multiple variables", () => {
    let [, setValue] = stateManager.useVariableByName("var1");
    setValue({ a: 1 });
    [, setValue] = stateManager.useVariableByName("var2");
    setValue({ b: 2 });
    [, setValue] = stateManager.useVariableByName("var1");
    setValue({ a: 1, c: 3 });
    expect(stateManager.getVariableByCacheId("cacheId1")).toEqual({
      a: 1,
      c: 3
    });
    expect(stateManager.getVariableByCacheId("cacheId2")).toEqual({ b: 2 });
  });
});

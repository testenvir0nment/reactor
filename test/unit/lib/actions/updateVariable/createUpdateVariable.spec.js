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

import createUpdateVariable from "../../../../../src/lib/actions/updateVariable/createUpdateVariable";

describe("Update variable", () => {
  let stateManager;
  let value;
  let setValue;
  let updateVariable;

  beforeEach(() => {
    stateManager = jasmine.createSpyObj("stateManager", ["useVariableByName"]);
    setValue = jasmine.createSpy("setValue");
    stateManager.useVariableByName.and.callFake(() => [value, setValue]);
    updateVariable = createUpdateVariable({ stateManager });
  });

  it("gets the correct data element", () => {
    updateVariable({ dataElement: "myelement1", instructions: [] });
    expect(stateManager.useVariableByName).toHaveBeenCalledOnceWith(
      "myelement1"
    );
  });

  it("works with no instructions", () => {
    value = { a: 1 };
    updateVariable({ dataElement: "myelement1", instructions: [] });
    expect(setValue).toHaveBeenCalledOnceWith({ a: 1 });
  });

  it("calls set", () => {
    value = { a: 1 };
    updateVariable({
      dataElement: "myelement1",
      instructions: [{ path: "b", operator: "set", value: 2 }]
    });
    expect(setValue).toHaveBeenCalledOnceWith({ a: 1, b: 2 });
  });

  it("calls clear", () => {
    value = { a: 1 };
    updateVariable({
      dataElement: "myelement1",
      instructions: [{ path: "a", operator: "delete" }]
    });
    expect(setValue).toHaveBeenCalledOnceWith({});
  });

  it("calls push", () => {
    value = { a: 1 };
    updateVariable({
      dataElement: "myelement1",
      instructions: [{ path: "b", operator: "push" }]
    });
    expect(setValue).toHaveBeenCalledOnceWith({ a: 1, b: [undefined] });
  });

  it("handles multiple instructions", () => {
    value = { a: 1 };
    updateVariable({
      dataElement: "myelement1",
      instructions: [
        { path: "b.0", operator: "set", value: "item1" },
        { path: "b", operator: "push" },
        { path: "b.-1", operator: "set", value: "item2" },
        { path: "a", operator: "delete" }
      ]
    });
    expect(setValue).toHaveBeenCalledOnceWith({ b: ["item1", "item2"] });
  });

  it("treats unknown operator as a no-op", () => {
    value = { a: 1 };
    updateVariable({
      dataElement: "myelement1",
      instructions: [{ path: "b", operator: "unknown", value: "item1" }]
    });
    expect(setValue).toHaveBeenCalledOnceWith({ a: 1 });
  });
});

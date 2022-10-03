/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import createSetConsent from "../../../../../src/lib/actions/setConsent/createSetConsent";

describe("Set Consent", () => {
  ["in", "out"].forEach(generalConsent => {
    it(`executes setConsent command with "${generalConsent}" general consent`, async () => {
      const promiseReturnedFromInstance = Promise.resolve("myvalue");
      const instance = jasmine
        .createSpy()
        .and.returnValue(promiseReturnedFromInstance);
      const instanceManager = jasmine.createSpyObj("instanceManager", {
        getInstance: Promise.resolve(instance)
      });
      const action = createSetConsent({ instanceManager });
      const returnValue = await action({
        instanceName: "myinstance",
        identityMap: "%dataelement123%",
        consent: [
          {
            standard: "Adobe",
            version: "1.0",
            value: { general: generalConsent }
          }
        ]
      });

      expect(returnValue).toEqual("myvalue");
      expect(instanceManager.getInstance).toHaveBeenCalledWith("myinstance");
      expect(instance).toHaveBeenCalledWith("setConsent", {
        identityMap: "%dataelement123%",
        consent: [
          {
            standard: "Adobe",
            version: "1.0",
            value: {
              general: generalConsent
            }
          }
        ]
      });
    });
  });

  ["", null, undefined].forEach(identityMap => {
    it(`doesn't pass identityMap when it is ${JSON.stringify(
      identityMap
    )}`, async () => {
      const instance = jasmine.createSpy();
      const instanceManager = { getInstance: () => Promise.resolve(instance) };
      const action = createSetConsent({ instanceManager });
      await action({
        instanceName: "myinstance",
        identityMap,
        consent: [{ standard: "IAB TCF", version: "2.0", value: "1234abcd" }]
      });
      expect(instance).toHaveBeenCalledWith("setConsent", {
        consent: [{ standard: "IAB TCF", version: "2.0", value: "1234abcd" }]
      });
    });
  });

  it("throws an error when no matching instance found", () => {
    const instanceManager = {
      getInstance: () => Promise.resolve()
    };
    const action = createSetConsent({ instanceManager });

    return expectAsync(
      action({
        instanceName: "myinstance",
        purposes: "none"
      })
    ).toBeRejectedWithError(
      'Failed to set consent for instance "myinstance". No matching instance was configured with this name.'
    );
  });
});

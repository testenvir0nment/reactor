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

import analyticsXdm from "../../../../../src/lib/dataElements/analyticsXdm/index";

fdescribe("analyticsXdm", () => {

  let delimiters;

  beforeEach(() => {
    delimiters = {};
  })

  const test = (tracker, expected) => {
    const xdm = analyticsXdm({ tracker, delimiters });
    console.log(JSON.stringify(xdm, null, 2));
    expect(xdm).toEqual(expected);
  }

  it("handles empty object", () => {
    test({}, {});
  });

  it("handles undefined object", () => {
    test(undefined, {});
  });

  [
    ["abc", "abc"],
    [true, "true"],
    [1, "1"],
    [-3.14, "-3.14"]
  ].forEach(([input, output]) => {
    it(`converts an evar with input ${input}`, () => {
      test({ eVar201: input }, {
        "_experience": {
          "analytics": {
            "customDimensions": {
              "eVars": {
                "eVar201": output
              }
            }
          }
        }
      })
    });
  });

  it("converts props", () => {
    delimiters = { prop2: ","};
    test({ prop1: "myprop1", prop2: "my,list" }, {
      "_experience": {
        "analytics": {
          "customDimensions": {
            "props": {
              "prop1": "myprop1"
            },
            "listProps": {
              "prop2": {
                "delimiter": ",",
                "values": ["my","list"]
              }
            }
          }
        }
      }
    });
  });

  it("converts hierarchies", () => {
    test({ hier1: "my|hier1" }, {
      "_experience": {
        "analytics": {
          "customDimensions": {
            "hierarchies": {
              "hier1": {
                "delimiter": "|",
                "values": ["my", "hier1"]
              }
            }
          }
        }
      }
    });
  });

  it("converts lists", () => {
    test({ list3: "my,list" }, {
      "_experience": {
        "analytics": {
          "customDimensions": {
            "lists": {
              "list3": [
                {
                  "value": "my"
                },
                {
                  "value": "list"
                }
              ]
            }
          }
        }
      }
    });
  });

  it("converts a campaign code", () => {
    test({ campaign: "1234" }, {
      "marketing": {
        "trackingCode": "1234"
      }
    });
  });

  it("converts a currencyCode", () => {
    test({ currencyCode: "USD" }, {
      "commerce": {
        "order": {
          "currencyCode": "USD"
        }
      }
    });
  });

  it("converts a channel", () => {
    test({ channel: "mychannel" }, {
      "web": {
        "webPageDetails": {
          "siteSection": "mychannel"
        }
      }
    });
  });

  it("converts the pageURL", () => {
    test({ pageURL: "mypageurl" }, {
      "web": {
        "webPageDetails": {
          "URL": "mypageurl"
        }
      }
    });
  });

  it("converts the pageName", () => {
    test({ pageName: "mypagename" }, {
      "web": {
        "webPageDetails": {
          "name": "mypagename"
        }
      }
    });
  });

  it("converts the pageType", () => {
    test({ pageType: "errorPage" }, {
      "web": {
        "webPageDetails": {
          "errorPage": true
        }
      }
    });
  });

  it("converts the pageType when it isn't an errorPage", () => {
    test({ pageType: "mypagetype" }, {});
  });

  it("converts purchaseID", () => {
    test({ purchaseID: "1234myid" }, {
      "commerce": {
        "order": {
          "purchaseID": "1234myid"
        }
      }
    });
  });

  it("converts the referrer", () => {
    test({ referrer: "https://example.com" }, {
      "web": {
        "webReferrer": {
          "URL": "https://example.com"
        }
      }
    });
  });

  it("converts the server", () => {
    test({ server: "123abc" }, {
      "web": {
        "webPageDetails": {
          "server": "123abc"
        }
      }
    });
  });

  it("converts the state", () => {
    test({ state: "UT" }, {
      "placeContext": {
        "geo": {
          "stateProvince": "UT"
        }
      }
    });
  });

  it("converts the transactionID", () => {
    test({ transactionID: "1234-abcd" }, {
      "commerce": {
        "order": {
          "payments": {
            "transactionID": "1234-abcd"
          }
        }
      }
    });
  });

  it("converts the zip code", () => {
    test({ zip: "90210" }, {
      "placeContext": {
        "geo": {
          "postalCode": "90210"
        }
      }
    });
  });

});

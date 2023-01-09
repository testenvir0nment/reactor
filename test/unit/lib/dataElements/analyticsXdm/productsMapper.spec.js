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

import xdmFromTracker from "../../../../../src/lib/dataElements/analyticsXdm/index";

describe("products", () => {
  const test = (input, expected) => {
    expect(xdmFromTracker({ tracker: { products: input } })).toEqual(expected);
  };

  it("handles empty string", () => {
    test("", {});
  });

  it("handles undefined", () => {
    test(undefined, {});
  });

  it("handles one semicolon", () => {
    test(";", {});
  });

  it("handles bad evar names", () => {
    test(";product1;;;;foo=bar", {
      productListItems: [
        {
          name: "product1"
        }
      ]
    });
  });

  it("handles evar names with different case", () => {
    test(";product2;;;;evar1=bar", {
      productListItems: [
        {
          name: "product2",
          _experience: {
            analytics: {
              customDimensions: {
                eVars: {
                  eVar1: "bar"
                }
              }
            }
          }
        }
      ]
    });
  });

  it("handles bad event names", () => {
    test(";product3;;;event1001=123", {
      productListItems: [
        {
          name: "product3"
        }
      ]
    });
  });

  it("handles bad event values", () => {
    test(";product4;;;event1=foo", {
      productListItems: [
        {
          name: "product4"
        }
      ]
    });
  });

  it("handles all the events", () => {
    test(";product5;;;event1=0.1|event142=142|event444=444", {
      productListItems: [
        {
          name: "product5",
          _experience: {
            analytics: {
              event1to100: {
                event1: { value: 0.1 }
              },
              event101to200: {
                event142: { value: 142 }
              },
              event401to500: {
                event444: { value: 444 }
              }
            }
          }
        }
      ]
    });
  });

  it("works1", () => {
    const input =
      "Example category 1;Example product 1;3;12.60;event1=1.4|event2=9;eVar1=Merchandising value|eVar2=Another merchandising value,Example category 2;Example product 2;1;59.99;event3=6.99|event4=1;eVar3=Merchandising value 3|eVar4=Example value four";
    test(input, {
      productListItems: [
        {
          lineItemId: "Example category 1",
          name: "Example product 1",
          quantity: 3,
          priceTotal: 12.6,
          _experience: {
            analytics: {
              customDimensions: {
                eVars: {
                  eVar1: "Merchandising value",
                  eVar2: "Another merchandising value"
                }
              },
              event1to100: {
                event1: {
                  value: 1.4
                },
                event2: {
                  value: 9
                }
              }
            }
          }
        },
        {
          lineItemId: "Example category 2",
          name: "Example product 2",
          quantity: 1,
          priceTotal: 59.99,
          _experience: {
            analytics: {
              customDimensions: {
                eVars: {
                  eVar3: "Merchandising value 3",
                  eVar4: "Example value four"
                }
              },
              event1to100: {
                event3: {
                  value: 6.99
                },
                event4: {
                  value: 1
                }
              }
            }
          }
        }
      ]
    });
  });

  it("parses only product and category", () => {
    // Common on individual product pages
    test("Example category;Example product", {
      productListItems: [
        {
          lineItemId: "Example category",
          name: "Example product"
        }
      ]
    });
  });

  it("parses only the product name", () => {
    test(";Example product", {
      productListItems: [
        {
          name: "Example product"
        }
      ]
    });
  });

  it("parses one product with a category and another that does not.", () => {
    // Note the comma and adjacent semicolon to omit category.
    test("Example category;Example product 1,;Example product 2", {
      productListItems: [
        {
          lineItemId: "Example category",
          name: "Example product 1"
        },
        {
          name: "Example product 2"
        }
      ]
    });
  });

  it("parses a visitor purchasing a single product with a quantity and price", () => {
    test(";Example product;1;6.99", {
      productListItems: [
        {
          name: "Example product",
          quantity: 1,
          priceTotal: 6.99
        }
      ]
    });
  });

  it("parses multiple products with different quantities", () => {
    test(
      ";Example product 1;9;26.91,Example category;Example product 2;4;9.96",
      {
        productListItems: [
          {
            name: "Example product 1",
            quantity: 9,
            priceTotal: 26.91
          },
          {
            lineItemId: "Example category",
            name: "Example product 2",
            quantity: 4,
            priceTotal: 9.96
          }
        ]
      }
    );
  });

  it("parses currency event1 only to product 2 and not product 1", () => {
    test(
      ";Example product 1;1;1.99,Example category 2;Example product 2;1;2.69;event1=1.29",
      {
        productListItems: [
          {
            name: "Example product 1",
            quantity: 1,
            priceTotal: 1.99
          },
          {
            lineItemId: "Example category 2",
            name: "Example product 2",
            quantity: 1,
            priceTotal: 2.69,
            _experience: {
              analytics: {
                event1to100: {
                  event1: {
                    value: 1.29
                  }
                }
              }
            }
          }
        ]
      }
    );
  });
});

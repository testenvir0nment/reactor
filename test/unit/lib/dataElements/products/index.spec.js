/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import products from "../../../../../src/lib/dataElements/products/index";

describe("products", () => {

  it("handles empty string", () => {
    expect(products({ products: "" })).toEqual([]);
  });

  it("handles undefined", () => {
    expect(products({ products: undefined })).toEqual([]);
  });

  it("handles undefined settings", () => {
    expect(products()).toEqual([]);
  });

  it("handles one semicolon", () => {
    expect(products({ products: ";" })).toEqual([]);
  });

  it("handles bad evar names", () => {
    expect(products({ products: ";product1;;;;foo=bar"})).toEqual([
      {
        "name": "product1"
      }
    ]);
  });

  it("handles evar names with different case", () => {
    expect(products({ products: ";product2;;;;evar1=bar"})).toEqual([
      {
        "name": "product2",
        "_experience": {
          "analytics": {
            "customDimensions": {
              "eVars": {
                "eVar1": "bar"
              }
            }
          }
        }
      }
    ]);
  });

  it("handles bad event names", () => {
    expect(products({ products: ";product3;;;event1001=123"})).toEqual([
      {
        "name": "product3"
      }
    ]);
  });

  it("handles bad event values", () => {
    expect(products({ products: ";product4;;;event1=foo"})).toEqual([
      {
        "name": "product4"
      }
    ]);
  });

  it("handles all the events", () => {
    expect(products({ products: ";product5;;;event1=0.1|event142=142|event444=444"})).toEqual([
      {
        "name": "product5",
        "_experience": {
          "analytics": {
            "event1to100": {
              "event1": { value: 0.1 }
            },
            "event101to200": {
              "event142": { value: 142 }
            },
            "event401to500": {
              "event444": { value: 444 }
            }
          }
        }
      }
    ]);
  });

  it("works1", () => {
    const input = "Example category 1;Example product 1;3;12.60;event1=1.4|event2=9;eVar1=Merchandising value|eVar2=Another merchandising value,Example category 2;Example product 2;1;59.99;event3=6.99|event4=1;eVar3=Merchandising value 3|eVar4=Example value four";
    expect(products({ products: input })).toEqual([
      {
        "lineItemId": "Example category 1",
        "name": "Example product 1",
        "quantity": 3,
        "priceTotal": 12.6,
        "_experience": {
          "analytics": {
            "customDimensions": {
              "eVars": {
                "eVar1": "Merchandising value",
                "eVar2": "Another merchandising value"
              }
            },
            "event1to100": {
              "event1": {
                "value": 1.4
              },
              "event2": {
                "value": 9
              }
            }
          }
        }
      },
      {
        "lineItemId": "Example category 2",
        "name": "Example product 2",
        "quantity": 1,
        "priceTotal": 59.99,
        "_experience": {
          "analytics": {
            "customDimensions": {
              "eVars": {
                "eVar3": "Merchandising value 3",
                "eVar4": "Example value four"
              }
            },
            "event1to100": {
              "event3": {
                "value": 6.99
              },
              "event4": {
                "value": 1
              }
            }
          }
        }
      }
    ]);
  });

  it("parses only product and category", () => {
    // Common on individual product pages
    expect(products({ products: "Example category;Example product"})).toEqual([
      {
        "lineItemId": "Example category",
        "name": "Example product"
      }
    ]);
  });

  it("parses only the product name", () => {
    expect(products({ products: ";Example product"})).toEqual([
      {
        "name": "Example product"
      }
    ]);
  });

  it("parses one product with a category and another that does not.", () => {
    // Note the comma and adjacent semicolon to omit category.
    expect(products({ products: "Example category;Example product 1,;Example product 2"})).toEqual([
      {
        "lineItemId": "Example category",
        "name": "Example product 1"
      },
      {
        "name": "Example product 2"
      }
    ]);
  });

  it("parses a visitor purchasing a single product with a quantity and price", () => {
    expect(products({ products: ";Example product;1;6.99"})).toEqual([
      {
        "name": "Example product",
        "quantity": 1,
        "priceTotal": 6.99
      }
    ]);
  });

  it("parses multiple products with different quantities", () => {
    expect(products({ products: ";Example product 1;9;26.91,Example category;Example product 2;4;9.96"})).toEqual([
      {
        "name": "Example product 1",
        "quantity": 9,
        "priceTotal": 26.91
      },
      {
        "lineItemId": "Example category",
        "name": "Example product 2",
        "quantity": 4,
        "priceTotal": 9.96
      }
    ]);
  });

  it("parses currency event1 only to product 2 and not product 1", () => {
    expect(products({ products: ";Example product 1;1;1.99,Example category 2;Example product 2;1;2.69;event1=1.29" })).toEqual([
      {
        "name": "Example product 1",
        "quantity": 1,
        "priceTotal": 1.99
      },
      {
        "lineItemId": "Example category 2",
        "name": "Example product 2",
        "quantity": 1,
        "priceTotal": 2.69,
        "_experience": {
          "analytics": {
            "event1to100": {
              "event1": {
                "value": 1.29
              }
            }
          }
        }
      }
    ]);
  });
});

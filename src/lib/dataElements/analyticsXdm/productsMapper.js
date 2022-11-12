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

const { setValue } = require("../../utils/pathUtils");

const DEFAULT_ITEM = ["","","","","",""];

const parseKeyValue = keyValues => {
  return keyValues.split("|").filter(keyValue => keyValue !== "").map(keyValue => keyValue.split("="));
};

const createParseNumberedKeyValues = (prefix, max) => {
  const l = prefix.length;
  return keyValues => {
    return parseKeyValue(keyValues)
      .filter(([key, value]) => {
        return key.length > l && key.substring(0,l).toLowerCase() === prefix && value !== ""
      })
      .map(([key, value]) => [parseInt(key.substring(l), 10), value])
      .filter(([key]) => key > 0 && key <= max);
  };
};

const parseEvents = keyValues => {
  return createParseNumberedKeyValues("event", 1000)(keyValues)
    .filter(([, value]) => !isNaN(value));
};
const parseEvars = createParseNumberedKeyValues("evar", 250);

const addEventsTo = (eventsKeyValues, result) => {
  eventsKeyValues.forEach(([key, value]) => {
    const start = Math.floor(key / 100) * 100;
    const subKey = `event${start + 1}to${start + 100}`;
    result[subKey] = result[subKey] || {};
    result[subKey][`event${key}`] = { value: Number(value) }
  });
};

module.exports = (products, xdm) => {
  const productListItems = products.split(",").map(item => {
    const [category, productName, quantity, price, events, evars] = item.split(";").concat(DEFAULT_ITEM);
    const quantityInteger = parseInt(quantity, 10);
    const priceNumber = Number(price);
    const eventsKeyValues = parseEvents(events);
    const evarsKeyValues = parseEvars(evars);
    const result = {};
    if (category !== "") {
      result.lineItemId = category;
    }
    if (productName !== "") {
      result.name = productName;
    }
    if (quantity !== "" && !isNaN(quantityInteger)) {
      result.quantity = quantityInteger;
    }
    if (price !== "" && !isNaN(priceNumber)) {
      result.priceTotal = priceNumber;
    }
    if (evarsKeyValues.length > 0) {
      result._experience = {
        analytics: {
          customDimensions: {
            eVars: evarsKeyValues.reduce((memo, [key, value]) => {
              memo[`eVar${key}`] = value;
              return memo;
            }, {})
          }
        }
      }
    }
    if (eventsKeyValues.length > 0) {
      result._experience = result._experience || { analytics: {} };
      addEventsTo(eventsKeyValues, result._experience.analytics);
    }
    return result;
  }).filter(result => Object.keys(result).length !== 0);

  if (productListItems.length > 0) {
    setValue(xdm, "productListItems", productListItems);
  }
 };

/*
Copyright 2023 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const { setValue } = require("../../utils/pathUtils");

const stringMapper = dest => (value, xdm) => {
  return setValue(xdm, dest, `${value}`);
};

const errorPageMapper = (value, xdm) => {
  if (value === "errorPage") {
    return setValue(xdm, "web.webPageDetails.errorPage", true);
  }
  return xdm;
};

const staticKeyMapper = mappers => (key, value, xdm) => {
  if (!mappers[key]) {
    return undefined;
  }
  if (value) {
    return mappers[key](value, xdm);
  }
  return xdm;
};

const numberedKeyMapper = (prefix, max, mapper) => (key, value, xdm) => {
  if (key.length <= prefix.length) {
    return undefined;
  }
  if (key.substring(0, prefix.length) !== prefix) {
    return undefined;
  }
  const i = parseInt(key.substring(prefix.length), 10);
  if (i <= 0 || i > max) {
    return undefined;
  }
  if (value) {
    return mapper(i, value, xdm);
  }
  return xdm;
};

const propMapper = delimiters => (key, value, xdm) => {
  const delimiter = delimiters[`prop${key}`];
  if (delimiter) {
    const values = `${value}`.split(delimiter);
    return setValue(
      xdm,
      `_experience.analytics.customDimensions.listProps.prop${key}`,
      { delimiter, values }
    );
  }
  return setValue(
    xdm,
    `_experience.analytics.customDimensions.props.prop${key}`,
    `${value}`
  );
};

const hierMapper = delimiters => (key, value, xdm) => {
  const delimiter = delimiters[`hier${key}`] || "|";
  const values = `${value}`.split(delimiter);
  return setValue(
    xdm,
    `_experience.analytics.customDimensions.hierarchies.hier${key}`,
    { delimiter, values }
  );
};

const listMapper = delimiters => (key, value, xdm) => {
  const list = `${value}`
    .split(delimiters[`list${key}`] || ",")
    .map(item => ({ value: item }));
  return setValue(
    xdm,
    `_experience.analytics.customDimensions.lists.list${key}`,
    list
  );
};

const evarMapper = (key, value, xdm) => {
  return setValue(
    xdm,
    `_experience.analytics.customDimensions.eVars.eVar${key}`,
    `${value}`
  );
};

module.exports = ({ getTracker, productsMapper, eventsMapper }) => settings => {
  const { delimiters = {} } = settings || {};

  const tracker = getTracker();
  if (!tracker) {
    throw new Error(
      `Could not find tracker. You need to install the Adobe Analytics extension to use this data element.`
    );
  }

  const mappers = [];
  mappers.push(
    staticKeyMapper({
      campaign: stringMapper("marketing.trackingCode"),
      currencyCode: stringMapper("commerce.order.currencyCode"),
      channel: stringMapper("web.webPageDetails.siteSection"),
      events: eventsMapper,
      pageURL: stringMapper("web.webPageDetails.URL"),
      pageName: stringMapper("web.webPageDetails.name"),
      pageType: errorPageMapper,
      purchaseID: stringMapper("commerce.order.purchaseID"),
      products: productsMapper,
      referrer: stringMapper("web.webReferrer.URL"),
      server: stringMapper("web.webPageDetails.server"),
      state: stringMapper("placeContext.geo.stateProvince"),
      transactionID: stringMapper("commerce.order.payments.transactionID"),
      zip: stringMapper("placeContext.geo.postalCode")
    })
  );
  mappers.push(numberedKeyMapper("prop", 75, propMapper(delimiters)));
  mappers.push(numberedKeyMapper("hier", 5, hierMapper(delimiters)));
  mappers.push(numberedKeyMapper("list", 3, listMapper(delimiters)));
  mappers.push(numberedKeyMapper("eVar", 250, evarMapper));

  let xdm = {};
  Object.keys(tracker || {}).forEach(key => {
    let i = 0;
    let newXdm;
    while (newXdm === undefined && i < mappers.length) {
      newXdm = mappers[i](key, tracker[key], xdm);
      i += 1;
    }
    if (newXdm !== undefined) {
      xdm = newXdm;
    }
  });
  return xdm;
};

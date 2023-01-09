const { setValue } = require("../../utils/pathUtils");
const productsMapper = require("./productsMapper");
const eventsMapper = require("./eventsMapper");

const stringMapper = dest => (value, xdm) => {
  setValue(xdm, dest, `${value}`);
};

const errorPageMapper = (value, xdm) => {
  if (value === "errorPage") {
    setValue(xdm, "web.webPageDetails.errorPage", true);
  }
};

const staticKeyMapper = mappers => (key, value, xdm) => {
  if (!mappers[key]) {
    return false;
  }
  if (value) {
    mappers[key](value, xdm);
  }
  return true;
};

const numberedKeyMapper = (prefix, max, mapper) => (key, value, xdm) => {
  if (key.length <= prefix.length) {
    return false;
  }
  if (key.substring(0, prefix.length) !== prefix) {
    return false;
  }
  const i = parseInt(key.substring(prefix.length), 10);
  if (i <= 0 || i > max) {
    return false;
  }
  if (value) {
    mapper(i, value, xdm);
  }
  return true;
};

const propMapper = delimiters => (key, value, xdm) => {
  const delimiter = delimiters[`prop${key}`];
  if (delimiter) {
    const values = `${value}`.split(delimiter);
    setValue(
      xdm,
      `_experience.analytics.customDimensions.listProps.prop${key}`,
      { delimiter, values }
    );
  } else {
    setValue(
      xdm,
      `_experience.analytics.customDimensions.props.prop${key}`,
      `${value}`
    );
  }
};

const hierMapper = delimiters => (key, value, xdm) => {
  const delimiter = delimiters[`hier${key}`] || "|";
  const values = `${value}`.split(delimiter);
  setValue(
    xdm,
    `_experience.analytics.customDimensions.hierarchies.hier${key}`,
    { delimiter, values }
  );
};

const listMapper = delimiters => (key, value, xdm) => {
  const list = `${value}`
    .split(delimiters[`list${key}`] || ",")
    .map(item => ({ value: item }));
  setValue(
    xdm,
    `_experience.analytics.customDimensions.lists.list${key}`,
    list
  );
};

const evarMapper = (key, value, xdm) => {
  setValue(
    xdm,
    `_experience.analytics.customDimensions.eVars.eVar${key}`,
    `${value}`
  );
};

module.exports = settings => {
  const { tracker, delimiters = {} } = settings || {};

  let trackerObject;
  if (typeof tracker === "string") {
    trackerObject = window[tracker];
    if (!trackerObject) {
      throw new Error(`Could not find tracker at "window.${tracker}".`);
    }
  } else {
    trackerObject = tracker;
  }

  if (typeof trackerObject !== "object") {
    throw new Error("Tracker was not an object.");
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

  const xdm = {};
  Object.keys(tracker || {}).forEach(key => {
    let i = 0;
    let found = false;
    while (!found && i < mappers.length) {
      found = mappers[i](key, tracker[key], xdm);
      i += 1;
    }
  });
  return xdm;
};

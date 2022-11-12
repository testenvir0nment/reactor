const { setValue } = require("../../utils/pathUtils");

const DEFAULT_EVENTS = {
  "purchase": "purchases",
  "prodView": "productListViews",
  "scOpen": "productListOpens",
  "scAdd": "productListAdds",
  "scRemove": "productListRemoves",
  "scView": "productListViews",
  "scCheckout": "checkouts"
};

module.exports = (events, xdm) => {
  `${events}`.split(",").forEach(event => {
    const [key, value = "1"] = event.split("=");
    let path;
    if (DEFAULT_EVENTS[key]) {
      path = `commerce.${DEFAULT_EVENTS[key]}.value`;
    } else {
      if (key.length <= 5 || key.substring(0, 5) !== "event") {
        return;
      }
      const i = parseInt(key.substring(5), 10);
      if (i < 1 || i > 1000) {
        return;
      }
      const start = Math.floor(key / 100) * 100;
      path = `_experience.analytics.event${start + 1}to${start + 100}.event${i}`;
    }
    const [value2, id] = `${value}`.split(":").reverse();

    const parsedValue = Number(value2);
    if (isNaN(parsedValue)) {
      return;
    }

    setValue(xdm, `${path}.value`, parsedValue);
    if (id) {
      setValue(xdm, `${path}.id`, id);
    }
  });
};

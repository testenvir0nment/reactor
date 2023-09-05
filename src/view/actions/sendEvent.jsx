import React from "react";
import { Link } from "@adobe/react-spectrum";

import checkbox from "../forms/checkbox";
import comboBox from "../forms/comboBox";
import instancePicker from "../forms/instancePicker";
import form from "../forms/form";
import radioGroup from "../forms/radioGroup";
import section from "../forms/section";
import dataElement from "../forms/dataElement";
import stringArray from "../forms/stringArray";
import disabledTextField from "../forms/disabledTextField";
import conditional from "../forms/conditional";
import disabledCheckbox from "../forms/disabledCheckbox";
import configOverrides from "../forms/configOverrides";

import eventTypes from "./constants/eventTypes";

import renderForm from "../forms/renderForm";
import textField from "../forms/textField";

const UNGUIDED = "unguided";
const FETCH = "fetch";
const COLLECT = "collect";

const xdmFieldDescription = (
  <>
    Provide a data element which returns an object matching your XDM schema. You
    may want to use the{" "}
    <Link>
      <a
        href="https://experienceleague.adobe.com/docs/experience-platform/edge/extension/data-element-types.html?lang=en#xdm-object"
        target="_blank"
        rel="noopener noreferrer"
      >
        XDM Object
      </a>
    </Link>{" "}
    data element type to build this object. You can also combine objects using
    the{" "}
    <Link>
      <a
        href="https://experienceleague.adobe.com/docs/experience-platform/tags/extensions/adobe/core/overview.html?lang=en#merged-objects"
        target="_blank"
        rel="noopener noreferrer"
      >
        Merged Objects
      </a>
    </Link>{" "}
    data element type from the Core extension.
  </>
);

const wrapGetInitialValues = getInitialValues => ({ initInfo }) => {
  const { personalization = {}, ...otherSettings } = initInfo.settings || {};
  return getInitialValues({
    initInfo: {
      ...initInfo,
      settings: { ...personalization, ...otherSettings }
    }
  });
};

const wrapGetSettings = getSettings => ({ values }) => {
  const {
    decisionScopes,
    surfaces,
    sendNotifications,
    metadata,
    ...otherValues
  } = getSettings({ values });
  return {
    ...otherValues,
    personalization: {
      decisionScopes,
      surfaces,
      sendNotifications,
      metadata
    }
  };
};

const eventTypeField = comboBox({
  name: "type",
  label: "Type",
  description:
    "Enter an event type to populate the `eventType` XDM field. Select a predefined value or enter a custom value.",
  dataElementDescription: "Enter a data element that resolves to an event type.",
  items: Object.keys(eventTypes)
    .reduce((items, key) => {
      items.push({ value: key, label: eventTypes[key] });
      return items;
    }, [])
});

const fetchEventTypeField = disabledTextField({
  name: "type",
  label: "Type",
  description:
    "Enter an event type to populate the `eventType` XDM field. Select a predefined value or enter a custom value.",
  value: "decisioning.propositionFetch",
  valueLabel: "Decisioning Proposition Fetch"
});

const xdmField = dataElement({
  name: "xdm",
  label: "XDM",
  description: xdmFieldDescription
});

const dataField = dataElement({
  name: "data",
  label: "Data",
  description: "Provide a data element which returns an object to send as data."
});

const includePendingDisplayNotificationsField = checkbox({
  name: "includePendingDisplayNotifications",
  label: "Include pending display notifications",
  description:
    "Check this to include pending display notifications in the response. This will populate the `_experience.decisioning` XDM field with information about rendered personalization.",
  defaultValue: false
});

const disabledIncludePendingDisplayNotificationsField = disabledCheckbox({
  name: "includePendingDisplayNotifications",
  label: "Include pending display notifications",
  description:
    "Check this to include pending display notifications in the response. This will populate the `_experience.decisioning` XDM field with information about rendered personalization.",
  value: true
});

const propositionEventTypeField = conditional({
  args: "propositions",
  condition: propositions => propositions !== "none"
}, [
  comboBox({
    name: "propositionEventType",
    label: "Display or interact notification",
    description:
      "Enter an event type to populate the `propositionEventType` XDM field. Select a predefined value or enter a data element.",
    items: [
      { value: "display", label: "Display" },
      { value: "interact", label: "Interact" }
    ]
  })
]);

const documentUnloadingField = checkbox({
  name: "documentUnloading",
  label: "Document will unload",
  description:
    "Check this to ensure the event will reach the server even if the user is navigating away from the current document (page). Any response from the server will be ignored."
});

const mergeIdField = dataElement({
  name: "mergeId",
  label: "Merge ID (Deprecated)",
  description:
    "Provide an identifier used to merge multiple events. This will populate the `eventMergeId` XDM field. This field has been deprecated until it is supported by Adobe Experience Platform."
});

const decisionScopesField = stringArray({
  name: "decisionScopes",
  label: "Scopes",
  singularLabel: "Scope",
  description:
    "Create an array of decision scopes to query with the event.",
  dataElementDescription:
    "This data element should resolve to an array of scopes."
});

const surfacesField = stringArray({
  name: "surfaces",
  label: "Surfaces",
  singularLabel: "Surface",
  description:
    "Create an array of surfaces to query with the event.",
  dataElementDescription:
    "This data element should resolve to an array of surfaces."
});

const renderDecisionsField = checkbox({
  name: "renderDecisions",
  label: "Render visual personalization decisions",
  description:
    "Check this to render visual personalization decisions.",
  defaultValue: true
});

const renderDecisionsChecked = disabledCheckbox({
  name: "renderDecisions",
  label: "Render visual personalization decisions",
  description:
    "Check this to render visual personalization decisions.",
  value: true
});

const sendNotificationsField = conditional({
  args: "renderDecisions",
  condition: renderDecisions => renderDecisions
}, [
  checkbox({
    name: "sendNotifications",
    label: "Automatically send a display notification",
    description:
      "Check this to automatically send a display notification. (Note when automatically sending a display notification, you cannot set the proposition metadata.)",
    defaultValue: true
  })
]);

const sendNotificationsUnchecked = disabledCheckbox({
  name: "sendNotifications",
  label: "Automatically send a display notification",
  description:
    "Check this to automatically send a display notification. (Note when automatically sending a display notification, you cannot set the proposition metadata.)",
  value: false
});

const configOverrideFields = configOverrides();
const datasetIdField = textField({
  name: "datasetId",
  label: "Dataset ID (deprecated)",
  description:
    "Send data to a different dataset than what's been provided in the datastream. Note: this option is deprecated. Use 'Event dataset' instead."
});

const sendEventForm = form({
  wrapGetInitialValues,
  wrapGetSettings
}, [
  radioGroup({
    name: "eventStyle",
    label: "Guided event style",
    dataElementSupported: false,
    defaultValue: UNGUIDED,
    items: [
      { value: UNGUIDED, label: "Unguided (all fields)" },
      { value: FETCH, label: "Fetch personalization" },
      { value: COLLECT, label: "Data collection with display notifications" }
    ],
    description:
      "Select the event style. Fetch personalization events do not record events in Adobe Analytics and have the type decisioning.propositionFetch. Data collection events do not request personalization decisions."
  }),
  instancePicker({ name: "instanceName" }),
  conditional({
    args: "eventStyle",
    condition: eventStyle => eventStyle === UNGUIDED
  }, [
    section({ label: "Data collection" }, [
      eventTypeField,
      xdmField,
      dataField,
      includePendingDisplayNotificationsField,
      documentUnloadingField,
      mergeIdField
    ]),
    section({ label: "Personalization" }, [
      decisionScopesField,
      surfacesField,
      renderDecisionsField,
      sendNotificationsField
    ]),
    section({ label: "Configuration overrides" }, [
      configOverrideFields,
      datasetIdField
    ])
  ]),
  conditional({
    args: "eventStyle",
    condition: eventStyle => eventStyle === FETCH
  }, [
    section({ label: "Data collection" }, [
      fetchEventTypeField,
      xdmField,
      dataField
    ]),
    section({ label: "Personalization" }, [
      decisionScopesField,
      surfacesField,
      renderDecisionsChecked,
      sendNotificationsUnchecked
    ]),
    section({ label: "Configuration overrides" }, [
      configOverrideFields
    ])
  ]),
  conditional({
    args: "eventStyle",
    condition: eventStyle => eventStyle === COLLECT
  }, [
    section({ label: "Data collection" }, [
      eventTypeField,
      xdmField,
      dataField,
      disabledIncludePendingDisplayNotificationsField
    ]),
    section({ label: "Configuration overrides" }, [
      configOverrideFields
    ])
  ])
]);

renderForm(sendEventForm);

import React from 'react';
import PropTypes from 'prop-types';
import form from '../forms/form';
import checkbox from '../forms/checkbox';
import radioGroup from '../forms/radioGroup';
import codeField from "../forms/codeField";
import conditional from "../forms/conditional";
import textField from '../forms/textField';
import { object } from 'yup';
import SectionHeader from '../components/sectionHeader';

const personalizationEventTriggerDefault = "" +
  "trigger();\n";

const stateEventTriggerDefault = "" +
  "if (document.readyState === \"complete\") {\n" +
  "  trigger();\n" +
  "} else {\n" +
  "  window.addEventListener(\"load\", trigger);\n" +
  "}\n";

const actionEventTriggerDefault = "\n";


const autoImplementationForm = form({}, [
  radioGroup({
    name: `personalizationEventTriggerType`,
    label: "Personalization event trigger",
    defaultValue: "library",
    dataElementSupported: false,
    items: [
      { value: "library", label: "Library loaded" },
      { value: "acdl", label: "Adobe Client Data Layer event" },
      { value: "custom", label: "Custom code trigger" },
      { value: "disabled", label: "Not triggered" },
    ]
  }),
  conditional({
    args: "personalizationEventTriggerType",
    condition: type => type === "acdl"
  }, [
    textField({
      name: "personalizationEventTriggerAcdlEvent",
      label: "Personalization Adobe Client Data Layer event",
      description: "The name of the Adobe Client Data Layer event that will trigger the personalization event."
    })
  ]),
  conditional({
    args: "personalizationEventTriggerType",
    condition: type => type === "custom"
  }, [
    codeField({
      name: "personalizationEventTriggerCode",
      label: "Personalization trigger code",
      buttonLabelSuffix: "trigger code",
      placeholder: personalizationEventTriggerDefault
    })
  ]),
  radioGroup({
    name: "stateEventTriggerType",
    label: "State event trigger",
    defaultValue: "load",
    dataElementSupported: false,
    items: [
      { value: "load", label: "Document loaded" },
      { value: "acdl", label: "ACDL event" },
      { value: "custom", label: "Custom code" },
      { value: "disabled", label: "Not triggered" },
    ]
  }),
  conditional({
    args: "stateEventTriggerType",
    condition: type => type === "acdl"
  }, [
    textField({
      name: "stateEventTriggerAcdlEvent",
      label: "State Adobe Client Data Layer event",
      description: "The name of the Adobe Client Data Layer event that will trigger the state event."
    })
  ]),
  conditional({
    args: "stateEventTriggerType",
    condition: type => type === "custom"
  }, [
    codeField({
      name: "stateEventTriggerCode",
      label: "State trigger code",
      buttonLabelSuffix: "trigger code",
      placeholder: stateEventTriggerDefault
    })
  ]),
  radioGroup({
    name: "actionEventTriggerType",
    label: "Action event trigger",
    defaultValue: "disabled",
    dataElementSupported: false,
    items: [
      { value: "acdl", label: "ACDL event" },
      { value: "custom", label: "Custom code" },
      { value: "disabled", label: "Not triggered" },
    ]
  }),
  conditional({
    args: "actionEventTriggerType",
    condition: type => type === "acdl"
  }, [
    textField({
      name: `actionEventTriggerAcdlEvent`,
      label: "Action Adobe Client Data Layer event",
      description: "The name of the Adobe Client Data Layer event that will trigger the action event."
    })
  ]),
  conditional({
    args: "actionEventTriggerType",
    condition: type => type === "custom"
  }, [
    codeField({
      name: "actionEventTriggerCode",
      label: "Action trigger code",
      buttonLabelSuffix: "trigger code",
      placeholder: actionEventTriggerDefault
    })
  ]),
]);


export const bridge = {
  getInstanceDefaults: () => {
    const autoImplementation = autoImplementationForm.getInitialValues({ initInfo: { settings: {} } });
    console.log("getInstanceDefaults", autoImplementation);
    return { autoImplementation };
  },
  getInitialInstanceValues: ({ instanceSettings }) => {
    const autoImplementation = autoImplementationForm.getInitialValues({
      initInfo: { settings: instanceSettings.autoImplementation },
    });
    console.log("getInitialInstanceValues", autoImplementation);
    return { autoImplementation };
  },
  getInstanceSettings: ({ instanceValues }) => {
    const autoImplementation = autoImplementationForm.getSettings({
      values: instanceValues.autoImplementation,
    });
    console.log("getInstanceSettings", autoImplementation);
    return { autoImplementation };
  },
  instanceValidationSchema: object().shape({
    autoPersonalization: object().shape(
      autoImplementationForm.validationShape
    )
  }),
}

const AutoImplementationSection = ({ instanceFieldName }) => {
  return (
    <>
      <SectionHeader>Automatic Implementation</SectionHeader>
      <autoImplementationForm.Component namePrefix={`${instanceFieldName}.autoImplementation.`} />
    </>
  );
};

AutoImplementationSection.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
};

export default AutoImplementationSection;

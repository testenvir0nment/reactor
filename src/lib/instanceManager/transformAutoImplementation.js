const buildTriggerFunction = ({ type, code, event }) => {
  if (type === "custom") {
    return code;
  }
  if (type === "acdl") {
    return (trigger) => {
      window.adobeClientDataLayer.push((dl) => {
        dl.addEventListener(event, () => {
          trigger(dl.getState());
        })
      });
    };
  }
  return undefined;
}

module.exports = ({
  personalizationEventTriggerType,
  personalizationEventTriggerCode,
  personalizationEventTriggerAcdlEvent,
  stateEventTriggerType,
  stateEventTriggerCode,
  stateEventTriggerAcdlEvent,
  actionEventTriggerType,
  actionEventTriggerCode,
  actionEventTriggerAcdlEvent,
}) => {

  const autoPersonalizationEnabled = (personalizationEventTriggerType !== "disabled");

  const setupPersonalizationTrigger = buildTriggerFunction({
    type: personalizationEventTriggerType,
    code: personalizationEventTriggerCode,
    event: personalizationEventTriggerAcdlEvent,
  });

  const setupStateTrigger = buildTriggerFunction({
    type: stateEventTriggerType,
    code: stateEventTriggerCode,
    event: stateEventTriggerAcdlEvent,
  });

  const setupActionTrigger = buildTriggerFunction({
    type: actionEventTriggerType,
    code: actionEventTriggerCode,
    event: actionEventTriggerAcdlEvent,
  });

  return {
    autoPersonalizationEnabled,
    setupPersonalizationTrigger,
    setupStateTrigger,
    setupActionTrigger,
  };
};

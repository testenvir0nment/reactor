/*
Copyright 2024 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
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

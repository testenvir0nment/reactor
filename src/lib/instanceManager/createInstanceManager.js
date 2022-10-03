/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

module.exports = ({
  turbine,
  window,
  createInstance,
  createEventMergeId,
  orgId,
  wrapOnBeforeEventSend
}) => {
  const { instances: instancesSettings } = turbine.getExtensionSettings();
  const instanceByName = {};

  instancesSettings.forEach(
    ({
      name,
      edgeConfigId,
      stagingEdgeConfigId,
      developmentEdgeConfigId,
      onBeforeEventSend,
      idMigrationEnabled,
      ...options
    }) => {
      const instance = createInstance({ name });
      window[name] = instance;
      instanceByName[name] = Promise.resolve()
        .then(() => {
          // when ID migration is enabled, wait for the Visitor extension to be available before
          // running commands after configure
          if (idMigrationEnabled) {
            return turbine.getSharedModule("adobe-mcid", "mcid-instance");
          }
          return undefined;
        })
        .then(() => {
          // no need to do anything with the visitor shared module, Web SDK can access it from window.Visitor
          return instance;
        });

      const computedEdgeConfigId =
        (turbine.environment.stage === "development" &&
          developmentEdgeConfigId) ||
        (turbine.environment.stage === "staging" && stagingEdgeConfigId) ||
        edgeConfigId;

      instance("configure", {
        ...options,
        edgeConfigId: computedEdgeConfigId,
        debugEnabled: turbine.debugEnabled,
        orgId: options.orgId || orgId,
        onBeforeEventSend: wrapOnBeforeEventSend(onBeforeEventSend)
      });
      turbine.onDebugChanged(enabled => {
        instance("setDebug", { enabled });
      });
    }
  );

  return {
    /**
     * Returns an instance by name.
     * @param name
     * @returns {Function}
     */
    getInstance(name) {
      // Use a promise chain here so that even when instanceByName[name] is undefined,
      // this function will still return a promise
      return Promise.resolve().then(() => {
        return instanceByName[name];
      });
    },
    /**
     * Synchronously creates an event merge ID.
     * @returns {string}
     */
    createEventMergeId() {
      return createEventMergeId();
    }
  };
};

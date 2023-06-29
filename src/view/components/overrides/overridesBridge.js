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
import { array, mixed, number, object, string } from "yup";
import { ENVIRONMENTS as OVERRIDE_ENVIRONMENTS } from "../../configuration/constants/environmentType";
import copyPropertiesIfValueDifferentThanDefault from "../../configuration/utils/copyPropertiesIfValueDifferentThanDefault";
import copyPropertiesWithDefaultFallback from "../../configuration/utils/copyPropertiesWithDefaultFallback";
import trimValue from "../../utils/trimValues";

export const bridge = {
  // return formik state
  getInstanceDefaults: () => ({
    edgeConfigOverrides: OVERRIDE_ENVIRONMENTS.reduce(
      (acc, env) => ({
        ...acc,
        [env]: {
          sandbox: "",
          datastreamId: "",
          datastreamIdInputMethod: "freeform",
          com_adobe_experience_platform: {
            datasets: {
              event: {
                datasetId: ""
              }
            }
          },
          com_adobe_analytics: {
            reportSuites: [""]
          },
          com_adobe_identity: {
            idSyncContainerId: undefined
          },
          com_adobe_target: {
            propertyToken: ""
          }
        }
      }),
      {}
    )
  }),

  // convert launch settings to formik state
  getInitialInstanceValues: ({ instanceSettings }) => {
    const instanceValues = {};

    copyPropertiesWithDefaultFallback({
      toObj: instanceValues,
      fromObj: instanceSettings,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: ["edgeConfigOverrides"]
    });

    OVERRIDE_ENVIRONMENTS.forEach(env => {
      if (
        instanceValues.edgeConfigOverrides?.[env]?.com_adobe_identity
          ?.idSyncContainerId
      ) {
        // Launch UI components expect this to be a string
        instanceValues.edgeConfigOverrides[
          env
        ].com_adobe_identity.idSyncContainerId = `${
          instanceValues.edgeConfigOverrides[env].com_adobe_identity
            .idSyncContainerId
        }`;
      }
    });

    return instanceValues;
  },
  // convert formik state to launch settings
  getInstanceSettings: ({ instanceValues }) => {
    const instanceSettings = {};
    const propertyKeysToCopy = ["edgeConfigOverrides"];

    copyPropertiesIfValueDifferentThanDefault({
      toObj: instanceSettings,
      fromObj: instanceValues,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: propertyKeysToCopy
    });

    OVERRIDE_ENVIRONMENTS.forEach(env => {
      const overrides = instanceSettings.edgeConfigOverrides?.[env];
      if (!overrides || Object.keys(overrides).length === 0) {
        return;
      }
      // Alloy, Konductor, and Blackbird expect the idSyncContainerID to be a
      // number
      if (overrides?.com_adobe_identity?.idSyncContainerId) {
        overrides.com_adobe_identity.idSyncContainerId = parseInt(
          overrides.com_adobe_identity.idSyncContainerId,
          10
        );
      }

      // filter out the blank report suites
      if (overrides.com_adobe_analytics?.reportSuites) {
        overrides.com_adobe_analytics.reportSuites = overrides.com_adobe_analytics.reportSuites.filter(
          rs => rs !== ""
        );
      }
    });

    return trimValue(instanceSettings);
  },
  formikStateValidationSchema: object({
    edgeConfigOverrides: object(
      OVERRIDE_ENVIRONMENTS.reduce(
        (acc, env) => ({
          ...acc,
          [env]: object({
            datastreamId: string(),
            datastreamInputMethod: mixed().oneOf(["freeform", "select"]),
            sandbox: string(),
            com_adobe_experience_platform: object({
              datasets: object({
                event: object({
                  datasetId: string()
                }),
                profile: object({
                  datasetId: string()
                })
              })
            }),
            com_adobe_analytics: object({
              reportSuites: array(string())
            }),
            com_adobe_identity: object({
              idSyncContainerId: number()
                .positive()
                .integer()
            }),
            com_adobe_target: object({
              propertyToken: string()
            })
          })
        }),
        {}
      )
    )
  })
};

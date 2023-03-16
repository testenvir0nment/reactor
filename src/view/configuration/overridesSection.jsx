import React from "react";
import { ActionButton, Flex } from "@adobe/react-spectrum";
import RemoveCircle from "@spectrum-icons/workflow/RemoveCircle";
import { FieldArray, useField } from "formik";
import PropTypes from "prop-types";
import SectionHeader from "../components/sectionHeader";
import FormikCheckbox from "../components/formikReactSpectrum3/formikCheckbox";
import copyPropertiesIfValueDifferentThanDefault from "./utils/copyPropertiesIfValueDifferentThanDefault";
import copyPropertiesWithDefaultFallback from "./utils/copyPropertiesWithDefaultFallback";
import FormElementContainer from "../components/formElementContainer";
import FieldSubset from "../components/fieldSubset";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";

export const bridge = {
  // return formik state
  getInstanceDefaults: () => ({
    globalOverridesEnabled: true,
    edgeConfigOverrides: {
      com_adobe_experience_platform: {
        datasets: {
          event: {
            datasetId: ""
          },
          profile: {
            datasetId: ""
          }
        }
      },
      com_adobe_analytics: {
        reportSuites: [""]
      },
      com_adobe_identity: {
        idSyncContainerId: ""
      },
      com_adobe_target: {
        propertyToken: ""
      }
    }
  }),
  // convert launch settings to formik state
  getInitialInstanceValues: ({ instanceSettings }) => {
    const instanceValues = {};

    copyPropertiesWithDefaultFallback({
      toObj: instanceValues,
      fromObj: instanceSettings,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: ["globalOverridesEnabled", "edgeConfigOverrides"]
    });

    return instanceValues;
  },
  // convert formik state to launch settings
  getInstanceSettings: ({ instanceValues }) => {
    const instanceSettings = {};
    const propertyKeysToCopy = ["globalOverridesEnabled"];

    if (instanceValues.globalOverridesEnabled) {
      propertyKeysToCopy.push("edgeConfigOverrides");
    }

    copyPropertiesIfValueDifferentThanDefault({
      toObj: instanceSettings,
      fromObj: instanceValues,
      defaultsObj: bridge.getInstanceDefaults(),
      keys: propertyKeysToCopy
    });

    return instanceSettings;
  }
};

const ReportSuitesOverride = ({ instanceFieldName, rsids }) => {
  return (
    <FieldArray name={`${instanceFieldName}.reportSuitesOverride`}>
      {({ remove, push }) => (
        <>
          {rsids.map((rsid, index) => (
            <Flex key={index} direction="row" alignItems="end">
              <FormikTextField
                data-test-id={`reportSuitesOverride.${index}`}
                label={`Report Suite #${index + 1}`}
                name={`${instanceFieldName}.edgeConfigOverrides.com_adobe_analytics.reportSuites.${index}`}
                width="size-5000"
              />
              {index > 0 && (
                <ActionButton
                  isQuiet
                  data-test-id={`removeReportSuite.${index}`}
                  aria-label="Icon only"
                  onPress={() => remove(index)}
                >
                  <RemoveCircle aria-label="Remove report suite" />
                </ActionButton>
              )}
            </Flex>
          ))}
          <ActionButton
            data-test-id="addReportSuite"
            marginTop="size-100"
            onPress={() => push("")}
          >
            Add Report Suite
          </ActionButton>
        </>
      )}
    </FieldArray>
  );
};

ReportSuitesOverride.propTypes = {
  instanceFieldName: PropTypes.string.isRequired,
  rsids: PropTypes.arrayOf(PropTypes.string).isRequired
};

const Overrides = ({ instanceFieldName }) => {
  const [{ value: instanceValues }] = useField(instanceFieldName);
  return (
    <>
      <SectionHeader>Datastream configuration overrides</SectionHeader>
      <FormElementContainer>
        <FormikCheckbox
          data-test-id="globalOverridesEnabled"
          name={`${instanceFieldName}.globalOverridesEnabled`}
          width="size-5000"
        >
          Enable global datastream configuration overrides
        </FormikCheckbox>
        {instanceValues.globalOverridesEnabled && (
          <FieldSubset>
            <FormikTextField
              data-test-id="eventDatasetOverride"
              label="Event Dataset ID"
              name={`${instanceFieldName}.edgeConfigOverrides.com_adobe_experience_platform.datasets.event.datasetId`}
              description=""
              width="size-5000"
            />
            <FormikTextField
              data-test-id="profileDatasetOverride"
              label="Profile Dataset ID"
              name={`${instanceFieldName}.edgeConfigOverrides.com_adobe_experience_platform.datasets.profile.datasetId`}
              description=""
              width="size-5000"
            />
            <FormikTextField
              data-test-id="idSyncContainerOverride"
              label="Identity Sync Container ID"
              name={`${instanceFieldName}.edgeConfigOverrides.com_adobe_identity.idSyncContainerId`}
              description=""
              width="size-5000"
            />
            <FormikTextField
              data-test-id="targetPropertyTokenOverride"
              label="Target Property Token"
              name={`${instanceFieldName}.edgeConfigOverrides.com_adobe_target.propertyToken`}
              description=""
              width="size-5000"
            />
            <ReportSuitesOverride
              instanceFieldName={instanceFieldName}
              rsids={
                instanceValues.edgeConfigOverrides.com_adobe_analytics
                  .reportSuites
              }
            />
          </FieldSubset>
        )}
      </FormElementContainer>
    </>
  );
};

Overrides.propTypes = {
  instanceFieldName: PropTypes.string.isRequired
};

export default Overrides;

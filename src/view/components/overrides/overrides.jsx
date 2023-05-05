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
import {
  ActionButton,
  Button,
  Flex,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Item,
  View,
  Checkbox
} from "@adobe/react-spectrum";
import Delete from "@spectrum-icons/workflow/Delete";
import { FieldArray, useField } from "formik";
import PropTypes from "prop-types";
import React from "react";

import FormElementContainer from "../formElementContainer";
import SectionHeader from "../sectionHeader";
import DataElementSelector from "../dataElementSelector";
import { ENVIRONMENTS as OVERRIDE_ENVIRONMENTS } from "../../configuration/constants/environmentType";
import FormikComboBox from "../formikReactSpectrum3/formikComboBox";

/**
 * The names of the different fields that can appear in the form. Used to pass
 * to the `showFields` prop of the `Overrides` component.
 */
export const FIELD_NAMES = {
  eventDatasetOverride: "eventDatasetOverride",
  idSyncContainerOverride: "idSyncContainerOverride",
  targetPropertyTokenOverride: "targetPropertyTokenOverride",
  reportSuitesOverride: "reportSuitesOverride"
};
/**
 * Takes a string and returns the a new string with the first letter capitalized.
 * @param {string} str
 * @returns {string}
 */
const capitialize = str => str.charAt(0).toUpperCase() + str.slice(1);

const ReportSuitesOverride = ({ prefix }) => {
  const fieldName = `${prefix}.com_adobe_analytics.reportSuites`;
  const [, { value: rsids }] = useField(fieldName);
  return (
    <FieldArray name={fieldName}>
      {({ remove, push }) => (
        <>
          <Flex direction="column" gap="size-100">
            {rsids.map((rsid, index) => (
              <Flex key={index} direction="row">
                <DataElementSelector>
                  <FormikComboBox
                    data-test-id={`${
                      FIELD_NAMES.reportSuitesOverride
                    }.${index}`}
                    label={index === 0 && "Report suites"}
                    allowsCustomValue
                    defaultItems={[]}
                    name={`${fieldName}.${index}`}
                    description={
                      index === rsids.length - 1 &&
                      "The IDs for the destination report suites in Adobe Analytics. The value must be a preconfigured override report suite from your datastream configuration and overrides the primary report suites."
                    }
                    width="size-5000"
                    key={index}
                  />
                </DataElementSelector>
                <ActionButton
                  isQuiet
                  isDisabled={rsids.length < 2}
                  marginTop={index === 0 && "size-300"}
                  data-test-id={`removeReportSuite.${index}`}
                  aria-label={`Remove report suite #${index + 1}`}
                  onPress={() => remove(index)}
                >
                  <Delete />
                </ActionButton>
              </Flex>
            ))}
          </Flex>
          <Button
            data-test-id="addReportSuite"
            variant="secondary"
            onPress={() => push("")}
            UNSAFE_style={{ maxWidth: "fit-content" }}
          >
            Add Report Suite
          </Button>
        </>
      )}
    </FieldArray>
  );
};

ReportSuitesOverride.propTypes = {
  prefix: PropTypes.string.isRequired
};

const HeaderContainer = ({ largeHeader = false, children, ...props }) => {
  if (largeHeader) {
    return <SectionHeader {...props}>{children}</SectionHeader>;
  }
  return (
    <Heading
      {...props}
      level={5}
      margin="0"
      UNSAFE_style={{
        fontWeight: "normal",
        color:
          "var(--spectrum-fieldlabel-text-color, var(--spectrum-alias-label-text-color) )"
      }}
    >
      {children}
    </Heading>
  );
};

HeaderContainer.propTypes = {
  largeHeader: PropTypes.bool,
  children: PropTypes.node.isRequired
};

/**
 * A section of the form that allows the user to copy all the overrides from the
 * current environment to the other two environments. Users select the destination
 * environments with checkboxes, then click the "Copy" button.
 *
 * @param {Object} props
 * @param {string} props.currentEnv The current environment.
 * @param {(source: string, destinations: string[]) => void} props.onPress The
 * function to call when the user clicks the "Copy" button.
 *
 * @returns {React.Element}
 */
const SettingsCopySection = ({ currentEnv, onPress }) => {
  const [destinations, setDestinations] = React.useState([]);
  const availableDestinations = OVERRIDE_ENVIRONMENTS.filter(
    env => env !== currentEnv
  );

  const onCopy = () => {
    onPress(currentEnv, destinations);
    setDestinations([]);
  };

  return (
    <View>
      <HeaderContainer>Copy overrides to…</HeaderContainer>
      <FormElementContainer>
        <Flex direction="row">
          {availableDestinations.map(env => (
            <Checkbox
              key={env}
              data-test-id={`copyOverrides.${env}`}
              isSelected={destinations.includes(env)}
              onChange={isSelected => {
                if (isSelected) {
                  setDestinations([...destinations, env]);
                } else {
                  setDestinations(destinations.filter(d => d !== env));
                }
              }}
            >
              {capitialize(env)}
            </Checkbox>
          ))}
        </Flex>
      </FormElementContainer>
      <Button
        data-test-id="copyOverrides"
        variant="secondary"
        isDisabled={destinations.length === 0}
        marginTop="size-100"
        onPress={onCopy}
        UNSAFE_style={{ maxWidth: "fit-content" }}
      >
        Copy
      </Button>
    </View>
  );
};

SettingsCopySection.propTypes = {
  currentEnv: PropTypes.oneOf(OVERRIDE_ENVIRONMENTS).isRequired,
  onPress: PropTypes.func.isRequired
};

/**
 * A section of a form that allows the user to override datastream configuration
 *
 * @typedef {Object} OverridesProps
 * @property {Object} initInfo
 * @property {string} options.instanceFieldName
 * The name of the Formik parent form. State will be stored as a nested object under the "edgeConfigOverrides" key.
 * @property {boolean} options.largeHeader Whether to use the large header. Defaults to false.
 * @property {Array<"eventDatasetOverride" | "idSyncContainerOverride" | "targetPropertyTokenOverride" | "targetPropertyTokenOverride" | "reportSuitesOverride">} options.showFields
 * Which fields to show. Defaults to showing all fields
 * @param {OverridesProps} options
 * @returns {React.Element}
 */
const Overrides = ({
  initInfo,
  instanceFieldName,
  largeHeader = false,
  showFields = [...Object.values(FIELD_NAMES)]
}) => {
  const prefix = instanceFieldName
    ? `${instanceFieldName}.edgeConfigOverrides`
    : "edgeConfigOverrides";
  const showFieldsSet = new Set(showFields);

  // TODO: Remove this console.log()
  console.log("initInfo", initInfo);

  const [
    ,
    { value: edgeConfigOverrides },
    { setValue: setEdgeConfigOverrides }
  ] = useField(prefix);
  const onCopy = (source, destinations) => {
    const newOverrides = destinations.reduce(
      (result, env) => ({ ...result, [env]: edgeConfigOverrides[source] }),
      edgeConfigOverrides
    );
    setEdgeConfigOverrides(newOverrides);
  };

  return (
    <>
      <HeaderContainer largeHeader={largeHeader}>
        Datastream Configuration Overrides
      </HeaderContainer>
      <FormElementContainer>
        <Tabs aria-label="Datastream Configuration Overrides">
          <TabList>
            {OVERRIDE_ENVIRONMENTS.map(env => (
              <Item key={env}>{capitialize(env)}</Item>
            ))}
          </TabList>
          <TabPanels>
            {OVERRIDE_ENVIRONMENTS.map(env => (
              <Item key={env}>
                <Flex
                  direction="column"
                  marginX={largeHeader ? "" : "size-300"}
                  gap="size-100"
                >
                  {showFieldsSet.has(FIELD_NAMES.eventDatasetOverride) && (
                    <DataElementSelector>
                      <FormikComboBox
                        data-test-id={FIELD_NAMES.eventDatasetOverride}
                        label="Event dataset"
                        allowsCustomValue
                        defaultItems={[]}
                        name={`${prefix}.${env}.com_adobe_experience_platform.datasets.event.datasetId`}
                        description="The ID for the destination event dataset in the Adobe Experience Platform. The value must be a preconfigured secondary dataset from your datastream configuration and overrides the primary dataset."
                        width="size-5000"
                      />
                    </DataElementSelector>
                  )}
                  {showFieldsSet.has(FIELD_NAMES.idSyncContainerOverride) && (
                    <DataElementSelector>
                      <FormikComboBox
                        data-test-id={FIELD_NAMES.idSyncContainerOverride}
                        label="Third-party ID sync container"
                        allowsCustomValue
                        defaultItems={[]}
                        name={`${prefix}.${env}.com_adobe_identity.idSyncContainerId`}
                        inputMode="numeric"
                        width="size-5000"
                        pattern={/\d+/}
                        description="The ID for the destination third-party ID sync container in Adobe Audience Manager. The value must be a preconfigured secondary container from your datastream configuration and overrides the primary container."
                      />
                    </DataElementSelector>
                  )}
                  {showFieldsSet.has(
                    FIELD_NAMES.targetPropertyTokenOverride
                  ) && (
                    <DataElementSelector>
                      <FormikComboBox
                        data-test-id={FIELD_NAMES.targetPropertyTokenOverride}
                        label="Target property token"
                        allowsCustomValue
                        defaultItems={[]}
                        name={`${prefix}.${env}.com_adobe_target.propertyToken`}
                        description="The token for the destination property in Adobe Target. The value must be a preconfigured property override from your datastream configuration and overrides the primary property."
                        width="size-5000"
                      />
                    </DataElementSelector>
                  )}
                  {showFieldsSet.has(FIELD_NAMES.reportSuitesOverride) && (
                    <ReportSuitesOverride prefix={`${prefix}.${env}`} />
                  )}
                  <SettingsCopySection currentEnv={env} onPress={onCopy} />
                </Flex>
              </Item>
            ))}
          </TabPanels>
        </Tabs>
      </FormElementContainer>
    </>
  );
};

Overrides.propTypes = {
  initInfo: PropTypes.object.isRequired,
  instanceFieldName: PropTypes.string,
  largeHeader: PropTypes.bool,
  showFields: PropTypes.arrayOf(PropTypes.oneOf(Object.values(FIELD_NAMES)))
};

export default Overrides;

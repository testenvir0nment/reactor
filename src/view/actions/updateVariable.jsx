/*
Copyright 2022 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import React, { useEffect, useState } from "react";
import { object, string, mixed } from "yup";
import { FieldArray, useField } from "formik";
import { Flex, Well, Button, Item, ActionButton, ButtonGroup, Radio, Divider } from "@adobe/react-spectrum";
import DeleteIcon from "@spectrum-icons/workflow/Delete";
import ArrowUpIcon from "@spectrum-icons/workflow/ArrowUp";
import AddCircleIcon from "@spectrum-icons/workflow/AddCircle";
import ArrowDownIcon from "@spectrum-icons/workflow/ArrowDown";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikPicker from "../components/formikReactSpectrum3/formikPicker";
import render from "../render";
import ExtensionView from "../components/extensionView";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import FormElementContainer from "../components/formElementContainer";
import DataElementSelector from "../components/dataElementSelector";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";
import PathSearch from "../components/pathSearch";
import fetchDataElements from "./utils/fetchDataElements";
import fetchSchema from "../dataElements/xdmObject/helpers/fetchSchema";
import FormikComboBox from "../components/formikReactSpectrum3/formikComboBox";
import { array } from "yup";

const SET = "set";
const SET_STRING = "setString";
const SET_NUMBER = "setNumber";
const SET_BOOLEAN = "setBoolean";
const SET_DATA_ELEMENT = "setDataElement";
const PUSH = "push";
const DELETE = "delete";

const blankInstruction = {
  path: "",
  operator: "",
  stringValue: "",
  numberValue: "",
  booleanValue: "",
  dataElementValue: ""
};

const getInitialValues = setDataElements => async ({ initInfo }) => {
  const initialValues = {};
  initialValues.dataElement = (initInfo.settings && initInfo.settings.dataElement) || "";
  initialValues.instructions = ((initInfo.settings && initInfo.settings.instructions) || [])
    .map(({ path, operator, value }) => {
      if (operator === DELETE) {
        return {
          path,
          operator: DELETE
        };
      }
      if (operator === PUSH) {
        return {
          path,
          operator: PUSH
        };
      }
      if (typeof value === "number") {
        return {
          path,
          operator: SET_NUMBER,
          numberValue: `${value}`
        };
      }
      if (typeof value === "boolean") {
        return {
          path,
          operator: SET_BOOLEAN,
          booleanValue: `${value}`
        };
      }
      if (singleDataElementRegex.test(value)) {
        return {
          path,
          operator: SET_DATA_ELEMENT,
          dataElementValue: value
        };
      }
      // else it's a string
      return {
        path,
        operator: SET_STRING,
        stringValue: `${value}`
      };
    })
    .map(instruction => ({ ...blankInstruction, ...instruction }));

  const {
    propertySettings: { id: propertyId },
    company: { orgId },
    tokens: { imsAccess }
  } = initInfo;

  setDataElements(await fetchDataElements({
    orgId,
    imsAccess,
    propertyId,
    delegateDescriptorIds: ["adobe-alloy-josnyder::dataElements::xdm-variable", "adobe-alloy-josnyder::dataElements::data-variable"]
  }));

  return initialValues;
};

const getSettings = ({ values }) => {
  const settings = {};
  settings.dataElement = values.dataElement;
  settings.instructions = values.instructions.map(
    ({
      path,
      operator,
      stringValue,
      numberValue,
      booleanValue,
      dataElementValue
    }) => {
      switch (operator) {
        case SET_NUMBER:
          return {
            path,
            operator: SET,
            value: singleDataElementRegex.test(numberValue) ? numberValue : Number.parseFloat(numberValue)
          };
        case SET_BOOLEAN:
          return {
            path,
            operator: SET,
            value: booleanValue === "true"
          };
        case SET_DATA_ELEMENT:
          return {
            path,
            operator: SET,
            value: dataElementValue
          };
        case DELETE:
          return {
            path,
            operator: DELETE
          };
        case PUSH:
          return {
            path,
            operator: PUSH
          };
        case SET_STRING:
          return {
            path,
            operator: SET,
            value: stringValue
          };
        default:
          return {
            path,
            operator
          }
      }
    }
  ).filter(({ operator }) => operator !== "");
  return settings;
};

const validationSchema = object().shape({
  dataElement: string().required("Please specify a data element."),
  instructions: array().of(
    object().shape({
      operator: mixed().when("path", {
        is: path => path !== undefined,
        then: string().required("Please specify an operator.")
      }),
      numberValue: mixed().when("operator", {
        is: SET_NUMBER,
        then: string().required("Please specify a number or single data element.")
          .matches(/^(-?[0-9]+(\.[0-9]+)?|%[^%]+%)$/, "Please specify a number or single data element.")
      }),
      booleanValue: mixed().when("operator", {
        is: SET_BOOLEAN,
        then: string().required("Please choose a value.")
          .matches(/^(true|false)$/, "Please choose a value.")
      }),
      dataElementValue: mixed().when("operator", {
        is: SET_DATA_ELEMENT,
        then: string().required("Please choose a data element.")
          .matches(/^%[^%]+%$/, "Please choose a data element.")
      })
    })
  )
});

const getAutocompletesForSchema = schema => {
  const autocompletes = [];
  const descend = (subSchema, pathPrefix) => {
    const dot = pathPrefix === "" ? "" : ".";
    const type = subSchema["meta:xdmType"];
    if (type === "object") {
      Object.keys(subSchema.properties).forEach(key => {
        const newPathPrefix = `${pathPrefix}${dot}${key}`;
        autocompletes.push({ name: newPathPrefix });
        descend(subSchema.properties[key], newPathPrefix);
      });
    }
    if (type === "array") {
      const newPathPrefix = `${pathPrefix}${dot}0`;
      autocompletes.push({ name: newPathPrefix });
      descend(subSchema.items, newPathPrefix);
    }
  };
  descend(schema, "");
  autocompletes.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  return autocompletes;
}

const pathDescription = "Specify the properties and array indicies separated by periods. Click the magnifying glass for help."

const PathField = ({ index, schema, autocompletes }) => {
  const [{ value }, , { setValue }] = useField(`instructions[${index}].path`);

  return (
    <Flex>
      <DataElementSelector augmentValue>
        { autocompletes ? (
          <FormikComboBox
            data-test-id={`instruction${index}pathComboBox`}
            label="Path"
            name={`instructions[${index}].path`}
            defaultItems={autocompletes}
            width="calc(size-2000 + size-200 + size-5000)"
            allowsCustomValue
            description={index === 0 ? pathDescription : ""}
          >
            {item => <Item key={item.name}>{item.name}</Item>}
          </FormikComboBox>
        ) : (
          <FormikTextField
            data-test-id={`instruction${index}pathField`}
            label="Path"
            name={`instructions[${index}].path`}
            width="calc(size-2000 + size-200 + size-5000)"
            description={index === 0 ? pathDescription : ""}
          />
        )}
      </DataElementSelector>
      <PathSearch
        value={value}
        setValue={setValue}
        schema={schema}
      />
    </Flex>
  );
};

const UpdateVariable = ({ dataElements, initInfo }) => {

  const {
    company: { orgId },
    tokens: { imsAccess }
  } = initInfo;

  const [{ value: dataElementCacheId }] = useField("dataElement");
  const [schema, setSchema] = useState();
  const [autocompletes, setAutocompletes] = useState();
  useEffect(async () => {
    setSchema(undefined);
    setAutocompletes(undefined);
    const dataElement = dataElements.find(({ settings: { cacheId }}) => dataElementCacheId === cacheId);
    if (dataElement && dataElement.settings && dataElement.settings.schema) {
      const newSchema = await fetchSchema({
        orgId,
        imsAccess,
        schemaId: dataElement.settings.schema.id,
        schemaVersion: dataElement.settings.schema.version,
        sandboxName: dataElement.settings.sandbox.name
      });
      setSchema(newSchema);
      setAutocompletes(getAutocompletesForSchema(newSchema));
    }
  }, [dataElementCacheId]);

  const getDataTypeForPath = path => {
    const pathSchema = path.split(".").filter(part => part !== "").reduce((subSchema, part) => {
      const type = subSchema && subSchema["meta:xdmType"];
      if (type === "object") {
        return subSchema.properties[part];
      }
      if (type === "array") {
        return subSchema.items;
      }
      return subSchema;
    }, schema);
    if (pathSchema) {
      return pathSchema["meta:xdmType"];
    } else {
      return "unknown";
    }
  };

  const [{ value: instructions }, , { setValue: setInstructions }] = useField("instructions");

  useEffect(() => {
    if (instructions.length === 0 || instructions[instructions.length - 1].path !== "") {
      setInstructions([...instructions, { ...blankInstruction }]);
    }
  }, [instructions]);

  return (
    <FormElementContainer>
      <FormikPicker
        data-test-id="dataElementPicker"
        name="dataElement"
        label="Data Element"
        description="Please specify the data element you would like to update. Only `Data variable` or `XDM variable` type data elements are available. When an `XDM variable` is chosen, the schema is loaded to autocomplete the paths below."
        width="size-5000"
        items={dataElements}
        isRequired
      >
        {item => (<Item key={item.settings.cacheId}>{item.name}</Item>)}
      </FormikPicker>
      <FieldArray
        id="instructions"
        name="instructions"
        render={arrayHelpers => (
          <Flex direction="column" gap="size-250">
            {instructions.map((instruction, index) => {
              const type = getDataTypeForPath(instruction.path);
              return (
                <Well key={`instruction${index}`} UNSAFE_style={{width: "max-content"}}>
                  <Flex direction="row" gap="size-200">
                    <FormElementContainer>
                      <PathField index={index} schema={schema} autocompletes={autocompletes}/>
                      <Flex direction="row" gap="size-200">
                        <FormikPicker
                          data-test-id={`instruction${index}operatorPicker`}
                          label="Action"
                          name={`instructions[${index}].operator`}
                          width="size-2000"
                        >
                          {(type === "unknown" || type === "string") && <Item key={SET_STRING}>Set string</Item>}
                          {(type === "unknown" || type === "integer" || type === "number") && <Item key={SET_NUMBER}>Set number</Item>}
                          {(type === "unknown" || type === "boolean") && <Item key={SET_BOOLEAN}>Set boolean</Item>}
                          {(type === "unknown" || type === "array") && <Item key={PUSH}>Add array element</Item>}
                          <Item key={SET_DATA_ELEMENT}>Set data element</Item>
                          <Item key={DELETE}>Delete</Item>
                        </FormikPicker>
                        {instruction.operator === SET_STRING && (
                          <DataElementSelector augmentValue>
                            <FormikTextField
                              data-test-id={`instruction${index}stringValueField`}
                              label="Value"
                              name={`instructions[${index}].stringValue`}
                              width="size-5000"
                            />
                          </DataElementSelector>
                        )}
                        {instruction.operator === SET_NUMBER && (
                          <DataElementSelector>
                            <FormikTextField
                              data-test-id={`instruction${index}numberValueField`}
                              label="Value"
                              name={`instructions[${index}].numberValue`}
                              width="size-5000"
                            />
                          </DataElementSelector>
                        )}
                        {instruction.operator === SET_BOOLEAN && (
                          <FormikRadioGroup
                            label="Value"
                            name={`instructions[${index}].booleanValue`}
                            orientation="horizontal"
                          >
                            <Radio
                              data-test-id={`instructions${index}booleanValueTrueRadio`}
                              value="true"
                            >
                              True
                            </Radio>
                            <Radio
                              data-test-id={`instructions${index}booleanValueFalseRadio`}
                              value="false"
                            >
                              False
                            </Radio>
                          </FormikRadioGroup>
                        )}
                        {instruction.operator === SET_DATA_ELEMENT && (
                          <DataElementSelector>
                            <FormikTextField
                              data-test-id={`instruction${index}dataElementValueField`}
                              label="Value"
                              name={`instructions[${index}].dataElementValue`}
                              width="size-5000"
                            />
                          </DataElementSelector>
                        )}
                      </Flex>
                    </FormElementContainer>
                    <Divider orientation="vertical" size="S"/>
                    <ButtonGroup orientation="vertical">
                      <ActionButton
                        data-test-id={`instruction${index}upButton`}
                        isQuiet
                        onPress={() => arrayHelpers.swap(index, index - 1)}
                        isDisabled={index === 0}
                      >
                        <ArrowUpIcon />
                      </ActionButton>
                      <ActionButton
                        data-test-id={`instruction${index}deleteButton`}
                        isQuiet
                        onPress={() => arrayHelpers.remove(index)}
                        isDisabled={index === instructions.length - 1 && instruction.operator === "" && instruction.path === ""}
                      >
                        <DeleteIcon />
                      </ActionButton>
                      <ActionButton
                        data-test-id={`instruction${index}addButton`}
                        isQuiet
                        onPress={() => arrayHelpers.insert(index + 1, {...blankInstruction})}
                      >
                        <AddCircleIcon />
                      </ActionButton>
                      <ActionButton
                        data-test-id={`instruction${index}downButton`}
                        isQuiet
                        onPress={() => arrayHelpers.swap(index, index + 1)}
                        isDisabled={index === instructions.length - 1}
                      >
                        <ArrowDownIcon />
                      </ActionButton>
                    </ButtonGroup>
                  </Flex>
                </Well>
              );
            })}
          </Flex>
        )}
      />
    </FormElementContainer>
  );
};

const UpdateVariableExtensionView = () => {

  const [dataElements, setDataElements] = useState([]);

  return (
    <ExtensionView
      getInitialValues={getInitialValues(setDataElements)}
      getSettings={getSettings}
      formikStateValidationSchema={validationSchema}
      render={({ initInfo }) => {
        return <UpdateVariable dataElements={dataElements} initInfo={initInfo} />;
      }}
    />
  );
}

render(UpdateVariableExtensionView);

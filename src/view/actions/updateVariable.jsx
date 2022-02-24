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

import React from "react";
import { object, string } from "yup";
import { FieldArray, useField } from "formik";
import { Flex, Well, Button, Item, Text, Radio } from "@adobe/react-spectrum";
import DeleteIcon from "@spectrum-icons/workflow/Delete";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikPicker from "../components/formikReactSpectrum3/formikPicker";
import render from "../render";
import ExtensionView from "../components/extensionView";
import singleDataElementRegex from "../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../constants/validationErrorMessages";
import FormElementContainer from "../components/formElementContainer";
import DataElementSelector from "../components/dataElementSelector";
import FormikRadioGroup from "../components/formikReactSpectrum3/formikRadioGroup";

const SET = "set";
const SET_STRING = "setString";
const SET_NUMBER = "setNumber";
const SET_BOOLEAN = "setBoolean";
const SET_DATA_ELEMENT = "setDataElement";
const DELETE = "delete";

const blankInstruction = {
  path: "",
  operator: SET_STRING,
  stringValue: "",
  numberValue: "",
  booleanValue: true,
  dataElementValue: ""
};

const getInitialValues = ({ initInfo }) => {
  const initialValues = {};
  initialValues.dataElement = initInfo.dataElement
    ? `%${initInfo.dataElement}%`
    : "";
  initialValues.instructions = (initInfo.instructions || [])
    .map(({ path, operator, value }) => {
      if (operator === DELETE) {
        return {
          path,
          operator: DELETE
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

  return initialValues;
};

const getSettings = ({ values }) => {
  const settings = {};
  settings.dataElement = values.dataElement.slice(1, -1); // remove the first and last characters
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
            value: Number.parseFloat(numberValue)
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
        case SET_STRING:
        default:
          return {
            path,
            operator: SET,
            value: stringValue
          };
      }
    }
  );
  return settings;
};

const validationSchema = object().shape({
  dataElement: string()
    .required(DATA_ELEMENT_REQUIRED)
    .matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED)
});

const UpdateVariable = () => {
  const [{ value: instructions }] = useField("instructions");

  return (
    <FormElementContainer>
      <DataElementSelector>
        <FormikTextField
          data-test-id="dataElementField"
          name="dataElement"
          label="Data Element"
          description="Please specify the data element you would like to update. This must be an `Object variable` type data element."
          width="size-5000"
          isRequired
        />
      </DataElementSelector>
      <FieldArray
        id="instructions"
        name="instructions"
        render={arrayHelpers => (
          <>
            <Flex
              marginTop="size-100"
              alignItems="flex-end"
              justifyContent="space-between"
            >
              <Button
                data-test-id="addInstructionButton"
                variant="secondary"
                onPress={() => {
                  arrayHelpers.push({ ...blankInstruction });
                }}
              >
                Add Instruction
              </Button>
            </Flex>
            <Flex direction="column" gap="size-250">
              {instructions.map((instruction, index) => (
                <Well key={`instruction${index}`}>
                  <FormElementContainer>
                    <FormikTextField
                      data-test-id={`instruction${index}pathField`}
                      label="Path"
                      name={`instructions[${index}].path`}
                      width="size-5000"
                    />
                    <FormikPicker
                      data-test-id={`instruction${index}operatorPicker`}
                      label="Action"
                      name={`instructions[${index}].operator`}
                      width="size-5000"
                    >
                      <Item key={SET_STRING}>Set string</Item>
                      <Item key={SET_NUMBER}>Set number</Item>
                      <Item key={SET_BOOLEAN}>Set boolean</Item>
                      <Item key={SET_DATA_ELEMENT}>Set data element</Item>
                      <Item key={DELETE}>Delete</Item>
                    </FormikPicker>
                    {instruction.operator === SET_STRING && (
                      <FormikTextField
                        data-test-id={`instruction${index}stringValueField`}
                        label="Value"
                        name={`instructions[${index}].stringValue`}
                        width="size-5000"
                      />
                    )}
                    {instruction.operator === SET_NUMBER && (
                      <FormikTextField
                        data-test-id={`instruction${index}numberValueField`}
                        label="Value"
                        name={`instructions[${index}].numberValue`}
                        width="size-5000"
                      />
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
                  </FormElementContainer>
                  <Button
                    data-test-id={`instruction${index}deleteButton`}
                    variant="secondary"
                    onPress={() => arrayHelpers.remove(index)}
                    marginTop="size-150"
                  >
                    <DeleteIcon />
                    <Text>Delete instruction</Text>
                  </Button>
                </Well>
              ))}
            </Flex>
          </>
        )}
      />
    </FormElementContainer>
  );
};

const UpdateVariableExtensionView = () => (
  <ExtensionView
    getInitialValues={getInitialValues}
    getSettings={getSettings}
    formikStateValidationSchema={validationSchema}
    render={() => {
      return <UpdateVariable />;
    }}
  />
);

render(UpdateVariableExtensionView);

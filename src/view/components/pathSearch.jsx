import React, { useEffect } from "react";
import Search from "@spectrum-icons/workflow/Search";
import { ActionButton, DialogTrigger, Heading, Flex, Text, Divider, Content, Dialog, ButtonGroup, Button, Item } from "@adobe/react-spectrum";
import { FieldArray, Form, Formik, useField } from "formik";
import FormElementContainer from "./formElementContainer";
import FormikTextField from "./formikReactSpectrum3/formikTextField";
import FormikPicker from "../components/formikReactSpectrum3/formikPicker";
import Delete from "@spectrum-icons/workflow/Delete";
import FormikComboBox from "./formikReactSpectrum3/formikComboBox";
import DataElementSelector from "./dataElementSelector";

const PathForm = ({ schema }) => {

  const [{ value: elements }, ,{ setValue: setElements }] = useField("elements");

  let arrayHelpersCopy;

  useEffect(() => {
    if (elements.length === 0 || elements[elements.length - 1].value !== "") {
      setElements([...elements, { value: "" }]);
    }
  }, [elements]);

  return (
    <FormElementContainer>
      <FieldArray
        id="elements"
        name="elements"
        render={arrayHelpers => {
          arrayHelpersCopy = arrayHelpers;
          let subSchema = schema;
          return (
            elements.map((element, index) => {
              let type = "unknown";
              let formElement = null;
              if (subSchema) {
                type = subSchema["meta:xdmType"];
              }
              if (type === "object") {
                const items = Object.keys(subSchema.properties).map(key => ({ name: key }));
                items.sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
                subSchema = subSchema.properties[element.value];
                 formElement = (
                  <FormikComboBox
                    data-test-id={`element${index}Picker`}
                    label="Property"
                    name={`elements[${index}].value`}
                    width="size-5000"
                    defaultItems={items}
                    allowsCustomValue
                    description={index === 0 ? "Specify the object property to update." : ""}
                  >
                    {item => (
                      <Item key={item.name}>
                        {item.name}
                      </Item>
                    )}
                  </FormikComboBox>
                );
              }
              if (type === "array") {
                subSchema = subSchema.items;
                formElement = (
                  <FormikTextField
                    data-test-id={`element${index}ArrayIndexField`}
                    label="Array index"
                    name={`elements[${index}].value`}
                    width="size-5000"
                    description="Specify the array index to update. Negative indicies count from the end (i.e. -1 is the last element.)"
                  />
                );
              }
              if (type === "unknown") {
                formElement = (
                  <FormikTextField
                    data-test-id={`element${index}PathElementField`}
                    label="Path element"
                    name={`elements[${index}].value`}
                    width="size-5000"
                    description={index === 0 ? "Specify the object property or array index to update." : ""}
                  />
                );
              }
              if (formElement) {
                return (
                  <Flex key={`element${index}`}>
                    <DataElementSelector augmentValue>
                      {formElement}
                    </DataElementSelector>
                    <ActionButton
                      isQuiet
                      onPress={() => arrayHelpers.remove(index)}
                      aria-label="Delete"
                      marginTop="size-300"
                      minWidth={0}
                    >
                      <Delete/>
                    </ActionButton>
                  </Flex>
                );
              }
              return null;
            })
          );
        }}
      />
    </FormElementContainer>
  );
};

const PathSearch = ({ schema, value, setValue }) => {
  const initialValues = {
    elements: value.split(".").map(element => ({
      value: element
    }))
  };

  let formikHandleSubmit;

  return (
    <DialogTrigger>
      <ActionButton
        isQuiet
        aria-label="Open path helper"
        marginTop="size-300"
        minWidth={0}
      >
        <Search/>
      </ActionButton>
      {(close)=> (
        <Dialog>
          <Heading>
            <Flex alignItems="center" gap="size-100">
              <Search size="S" />
              <Text>
                Path Helper
              </Text>
            </Flex>
          </Heading>
          <Divider/>
          <Content>
            <Formik
              initialValues={initialValues}
              onSubmit={values => {
                setValue(values.elements.map(({ value }) => value).filter(value => value !== "").join("."));
              }}
            >
              {({ handleSubmit }) => {
                formikHandleSubmit = handleSubmit;
                return <PathForm schema={schema} />
              }}
            </Formik>
          </Content>
          <ButtonGroup>
            <Button variant="secondary" onPress={close}>Cancel</Button>
            <Button variant="cta" onPress={() => {formikHandleSubmit(); close();}}>Save</Button>
          </ButtonGroup>
        </Dialog>
      )}
    </DialogTrigger>
  );
};

export default PathSearch;

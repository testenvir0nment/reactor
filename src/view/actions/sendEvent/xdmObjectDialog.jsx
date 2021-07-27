/*
Copyright 2021 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import React, { useImperativeHandle, useMemo, useRef, forwardRef } from "react";
import {
  Button,
  ButtonGroup,
  Content,
  Dialog,
  Divider,
  Heading,
  Radio,
  RadioGroup
} from "@adobe/react-spectrum";
import XdmObject from "../../components/xdmObject/xdmObject";
import useReportAsyncError from "../../utils/useReportAsyncError";
import { FormikProvider, useFormik } from "formik";
import { mixed, object, string } from "yup";
import deepEqual from "deep-equal";
import AdHocXdm from "./adHocXdm";
import FormikRadioGroup from "../../components/formikReactSpectrum3/formikRadioGroup";
import DataElementSelector from "../../components/dataElementSelector";
import FormikTextField from "../../components/formikReactSpectrum3/formikTextField";
import singleDataElementRegex from "../../constants/singleDataElementRegex";
import { DATA_ELEMENT_REQUIRED } from "../../constants/validationErrorMessages";
import FormElementContainer from "../../components/formElementContainer";

const INPUT_METHOD = {
  DATA_ELEMENT: "dataElement",
  AD_HOC: "adHoc"
};

const XdmObjectDialog = forwardRef(
  ({ initInfo, xdm, xdmMeta, onSave, onCancel }, ref) => {
    const adHocXdmRef = useRef();
    const formikPropsRef = useRef();
    const initialValues = useMemo(() => {
      if (!xdm || typeof xdm === "string") {
        return {
          inputMethod: INPUT_METHOD.DATA_ELEMENT,
          dataElement: xdm || "",
          adHoc: null
        };
      }

      return {
        inputMethod: INPUT_METHOD.AD_HOC,
        dataElement: "",
        adHoc: xdm
      };
    }, []);

    formikPropsRef.current = useFormik({
      onSubmit() {},
      initialValues,
      validationSchema: object().shape({
        dataElement: mixed().when("inputMethod", {
          is: INPUT_METHOD.DATA_ELEMENT.value,
          then: string()
            .matches(singleDataElementRegex, DATA_ELEMENT_REQUIRED)
            .required(DATA_ELEMENT_REQUIRED)
        })
      })
    });

    const { inputMethod, dataElement } = formikPropsRef.current.values;

    const validate = async () => {
      await formikPropsRef.current.submitForm();

      // The docs say that the promise submitForm returns
      // will be rejected if there are errors, but that is not the case.
      // Therefore, after the promise is resolved, we pull formikProps.errors
      // (which were set during submitForm()) to see if the form is valid.
      // https://github.com/jaredpalmer/formik/issues/1580
      formikPropsRef.current.setSubmitting(false);
      let isValid = Object.keys(formikPropsRef.current.errors).length === 0;

      if (inputMethod === INPUT_METHOD.AD_HOC) {
        isValid = isValid && adHocXdmRef.current.validate();
      }

      return isValid;
    };

    const getSettings = async () => {
      if (inputMethod === INPUT_METHOD.DATA_ELEMENT) {
        return dataElement;
      }

      return adHocXdmRef.current.getSettings();
    };

    useImperativeHandle(ref, () => {
      return {
        async validate() {
          const { xdm: newXdm, xdmMeta: newXdmMeta } = await getSettings();
          const isUnchanged =
            deepEqual(xdm, newXdm) && deepEqual(xdmMeta, newXdmMeta);

          if (isUnchanged) {
            return true;
          }

          // show validation error
          console.log("INVALID: HAS CHANGES");
          return false;
        }
      };
    });

    let inputForm;

    if (inputMethod === INPUT_METHOD.DATA_ELEMENT) {
      inputForm = (
        <DataElementSelector>
          <FormikTextField
            name="dataElement"
            label="Data Element"
            width="size-5000"
          />
        </DataElementSelector>
      );
    } else {
      inputForm = (
        <AdHocXdm
          ref={adHocXdmRef}
          initInfo={initInfo}
          xdm={xdm}
          xdmMeta={xdmMeta}
        />
      );
    }

    return (
      <Dialog>
        <Heading>Add XDM</Heading>
        <Divider />
        <Content>
          <FormikProvider value={formikPropsRef.current}>
            <FormElementContainer>
              <FormikRadioGroup
                name="inputMethod"
                label="Input Method"
                orientation="horizontal"
              >
                <Radio value={INPUT_METHOD.DATA_ELEMENT}>
                  Provide data element
                </Radio>
                <Radio value={INPUT_METHOD.AD_HOC}>Build ad-hoc XDM</Radio>
              </FormikRadioGroup>
              {inputForm}
            </FormElementContainer>
          </FormikProvider>
        </Content>
        <ButtonGroup>
          <Button variant="secondary" onPress={onCancel}>
            Cancel
          </Button>
          <Button
            variant="cta"
            onPress={async () => {
              const isValid = await validate();
              if (!isValid) {
                return;
              }
              onSave(await getSettings());
            }}
          >
            Add
          </Button>
        </ButtonGroup>
      </Dialog>
    );
  }
);

export default XdmObjectDialog;

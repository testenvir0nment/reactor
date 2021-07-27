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

import React, { forwardRef, useRef, useImperativeHandle } from "react";
import { object } from "yup";
import { FormikProvider, useFormik } from "formik";
import XdmObject from "../../components/xdmObject/xdmObject";
import useReportAsyncError from "../../utils/useReportAsyncError";

const AdHocXdm = ({ initInfo, xdm, xdmMeta, onSave, onCancel }, ref) => {
  const xdmObjectInitInfo = {
    settings:
      xdm && xdmMeta
        ? {
            data: xdm,
            sandbox: xdmMeta.sandbox,
            schema: xdmMeta.schema
          }
        : null,
    tokens: initInfo.tokens,
    company: initInfo.company
  };

  const reportAsyncError = useReportAsyncError();
  const viewRegistrationRef = useRef();
  const formikPropsRef = useRef();
  formikPropsRef.current = useFormik({
    onSubmit: () => {},
    validate: values => {
      let errors;

      // Formik swallows errors that occur during validation, but we want
      // to handle them in a proper manner.
      try {
        if (viewRegistrationRef.current?.validateFormikState) {
          errors = viewRegistrationRef.current.validateFormikState({ values });
        }
      } catch (error) {
        reportAsyncError(
          new Error("An error occurred while validating the view.")
        );
      }

      return errors;
    },
    validationSchema: () => {
      return (
        viewRegistrationRef.current?.formikStateValidationSchema ?? object()
      );
    }
  });

  const myValidateFormikState = async () => {
    // The view hasn't yet initialized formik with initialValues.
    if (!formikPropsRef.current.values) {
      return false;
    }

    await formikPropsRef.current.submitForm();

    // The docs say that the promise submitForm returns
    // will be rejected if there are errors, but that is not the case.
    // Therefore, after the promise is resolved, we pull formikProps.errors
    // (which were set during submitForm()) to see if the form is valid.
    // https://github.com/jaredpalmer/formik/issues/1580
    formikPropsRef.current.setSubmitting(false);
    return Object.keys(formikPropsRef.current.errors).length === 0;
  };

  const myValidateNonFormikState = async () => {
    if (!viewRegistrationRef.current) {
      // If the view hasn't registered yet, we don't want to consider
      // it valid.
      return false;
    }

    if (!viewRegistrationRef.current.validateNonFormikState) {
      return true;
    }

    return viewRegistrationRef.current.validateNonFormikState();
  };

  const validate = async () => {
    const results = await Promise.all([
      myValidateFormikState(),
      myValidateNonFormikState()
    ]);
    return results.every(result => result);
  };

  useImperativeHandle(ref, () => ({
    validate,
    async getSettings() {
      let newSettings;

      try {
        newSettings = await viewRegistrationRef.current.getSettings({
          initInfo: xdmObjectInitInfo,
          values: formikPropsRef.current.values
        });
      } catch (e) {
        // This will update the UI to show that an error has occurred.
        reportAsyncError(e);
        // Throwing the error will let Launch know not to save the settings.
        throw e;
      }

      return {
        xdm: newSettings.data,
        xdmMeta: {
          sandbox: newSettings.sandbox,
          schema: newSettings.schema
        }
      };
    }
  }));

  const registerImperativeFormApi = api => {
    viewRegistrationRef.current = viewRegistrationRef.current || {};
    viewRegistrationRef.current.getSettings = api.getSettings;
    viewRegistrationRef.current.validateFormikState = api.validateFormikState;
    viewRegistrationRef.current.formikStateValidationSchema =
      api.formikStateValidationSchema;
    viewRegistrationRef.current.validateNonFormikState =
      api.validateNonFormikState;
  };

  return (
    <FormikProvider value={formikPropsRef.current}>
      <XdmObject
        initInfo={xdmObjectInitInfo}
        formikProps={formikPropsRef.current}
        registerImperativeFormApi={registerImperativeFormApi}
      />
    </FormikProvider>
  );
};

export default forwardRef(AdHocXdm);

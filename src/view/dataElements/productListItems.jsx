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

import React from "react";
import render from "../render";
import ExtensionView from "../components/extensionView";
import FormElementContainer from "../components/formElementContainer";
import DataElementSelector from "../components/dataElementSelector";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import { object, string } from "yup";

const getInitialValues = ({ initInfo }) => {
  const { products = "" } = initInfo.settings || {};

  return {
    products
  };
};

const getSettings = ({ values }) => {
  return values;
};

const validationSchema = object().shape({
  products: string().required("Please specify a product string")
});

const EventMergeId = () => {
  return (
    <ExtensionView
      getInitialValues={getInitialValues}
      getSettings={getSettings}
      formikStateValidationSchema={validationSchema}
      render={() => (
        <FormElementContainer>
          <DataElementSelector>
            <FormikTextField
              data-test-id="productsField"
              name="products"
              description="Enter the products string or choose a data element containing the product string you would like to convert to XDM product list items."
              label="Products string"
              width="size-5000"
            />
          </DataElementSelector>
        </FormElementContainer>
      )}
    />
  );
};

render(EventMergeId);

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

import React from "react";
import PropTypes from "prop-types";
import ExtensionView from "./extensionView";
import Alert from "./alert";

const BetaExtensionView = ({
  render,
  getInitialValues,
  getSettings,
  validateNonFormikState,
  beta,
  ...additionalArgs
}) => {
  let wrappedGetInitialValues = getInitialValues;
  if (getInitialValues) {
    wrappedGetInitialValues = options => {
      const { betas } = options;
      if (!betas.includes(beta)) {
        return {};
      }
      return getInitialValues(options);
    };
  }

  let wrappedGetSettings = getSettings;
  if (wrappedGetSettings) {
    wrappedGetSettings = options => {
      const { betas } = options;
      if (!betas.includes(beta)) {
        return {};
      }
      return getSettings(options);
    };
  }

  const wrappedValidateNonFormikState = options => {
    const { betas } = options;
    if (!betas.includes(beta)) {
      return false;
    }

    if (!validateNonFormikState) {
      return true;
    }

    return validateNonFormikState(options);
  };

  return (
    <ExtensionView
      render={options => {
        const { betas } = options;
        if (!betas.includes(beta)) {
          return (
            <Alert variant="notice" title="Beta Feature">
              This feature is coming soon. Your organization is not part of this
              beta.
            </Alert>
          );
        }
        return render(options);
      }}
      getInitialValues={wrappedGetInitialValues}
      getSettings={wrappedGetSettings}
      validateNonFormikState={wrappedValidateNonFormikState}
      {...additionalArgs}
    />
  );
};

BetaExtensionView.propTypes = {
  render: PropTypes.func,
  getInitialValues: PropTypes.func,
  getSettings: PropTypes.func,
  validateFormikState: PropTypes.func,
  formikStateValidationSchema: PropTypes.object,
  validateNonFormikState: PropTypes.func,
  beta: PropTypes.string
};

export default BetaExtensionView;

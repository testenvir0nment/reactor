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
import { v4 as uuid } from "uuid";
import Alert from "../components/alert";
import render from "../render";
import ExtensionView from "../components/extensionView";
import FillParentAndCenterChildren from "../components/fillParentAndCenterChildren";
import Body from "../components/typography/body";

const getInitialValues = ({ initInfo }) => {
  const { cacheId = uuid() } = initInfo.settings || {};

  return {
    cacheId
  };
};

const getSettings = ({ values }) => {
  return values;
};

const EventMergeId = () => {
  return (
    <ExtensionView
      getInitialValues={getInitialValues}
      getSettings={getSettings}
      render={() => (
        <FillParentAndCenterChildren>
          <Alert
            variant="informative"
            title="Object variable data element"
            width="size-6000"
          >
            This data element starts as an empty object. Use &quot;Update
            variable&quot; action to set or clear properties.
          </Alert>
          <Body size="L" marginTop="size-200">
            No configuration necessary.
          </Body>
        </FillParentAndCenterChildren>
      )}
    />
  );
};

render(EventMergeId);

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

const {
  setValue,
  deletePath,
  pushUndefined
} = require("../../utils/pathUtils");

module.exports = ({ variableStore, logger }) => settings => {
  const variable = variableStore[settings.dataElement];

  const newVariable = settings.instructions.reduce((memo, { path, operator, value }) => {
    switch (operator) {
      case "set":
        return setValue(memo, path, value);
      case "delete":
        return deletePath(memo, path);
      case "push":
        return pushUndefined(memo, path);
      default:
        logger.warn("Unknown instruction: ", { path, operator, value });
        return memo;
    }
  }, variable);

  variableStore[settings.dataElement] = newVariable;
};

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
import { useEffect, useState } from "react";
import fetchConfig from "../../configuration/utils/fetchConfig";

/**
 * Takes a string and returns the a new string with the first letter capitalized.
 * @param {string} str
 * @returns {string}
 */
export const capitialize = str => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * The names of the different fields that can appear in the form. Used to pass
 * to the `showFields` prop of the `Overrides` component.
 */
export const FIELD_NAMES = Object.freeze({
  eventDatasetOverride: "eventDatasetOverride",
  idSyncContainerOverride: "idSyncContainerOverride",
  targetPropertyTokenOverride: "targetPropertyTokenOverride",
  reportSuitesOverride: "reportSuitesOverride",
  datastreamId: "datastreamId",
  sandbox: "sandbox"
});

/**
 * Given an instance name, returns the settings for that instance.
 * @param {Object} options
 * @param {Object} options.initInfo
 * @param {string} options.instanceName.
 * @returns {Object}
 */
export const getCurrentInstanceSettings = ({ initInfo, instanceName }) => {
  try {
    if (!instanceName) {
      instanceName = initInfo.settings.instanceName;
    }
    const instances =
      initInfo.extensionSettings?.instances ?? initInfo.settings?.instances;
    const instanceSettings = instances.find(
      instance => instance.name === instanceName
    );
    return instanceSettings;
  } catch (err) {
    console.error(err);
    return {};
  }
};

/**
 * A custom React hook that calls the `fetchConfig` function to get the Blackbird
 * configuration for the specified org, sandbox, and edge config ID. Returns the
 * result as well as the loading state and any errors that arise.
 * @param {Object} options
 * @param {string} options.authOrgId The org ID tied to the authenticated user
 * @param {string} options.configOrgId The org ID tied to the datastream configuration.
 * @param {string} options.imsAccess The IMS access token.
 * @param {string} options.edgeConfigId The ID of the datastream.
 * @param {string} options.sandbox The sandbox containing the datastream.
 * @param {{ current: { [key: string]: any } }} options.requestCache
 * @returns {{ result: any, isLoading: boolean, error: any }}
 */
export const useFetchConfig = ({
  authOrgId,
  configOrgId,
  imsAccess,
  edgeConfigId,
  sandbox,
  requestCache
}) => {
  const cacheKey = `${authOrgId}-${sandbox}-${edgeConfigId}`;
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    if (authOrgId !== configOrgId || !edgeConfigId || !sandbox || !imsAccess) {
      setResult(null);
      return;
    }
    setIsLoading(true);
    let request;
    if (requestCache.current[cacheKey]) {
      request = requestCache.current[cacheKey];
    } else {
      request = fetchConfig({
        orgId: authOrgId,
        imsAccess,
        edgeConfigId,
        sandbox,
        signal: null
      });
      requestCache.current[cacheKey] = request;
    }
    request
      .then(response => {
        const { data: { settings = {} } = {} } = response;
        setResult(settings);
        setError(null);
      })
      .catch(err => {
        setError(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [authOrgId, configOrgId, imsAccess, edgeConfigId, sandbox]);
  return { result, isLoading, error };
};

/**
 * Partial function application (curried) version of Array.prototype.includes().
 * Returns a function that takes an item and returns whether the item is in the
 * array. Items must be primatives, no objects.
 * Uses a Set internally for quick lookups.
 * @template T
 * @param {Array<T>} array
 * @param {Object} options
 * @param {boolean} options.errorOnEmptyArray errorOnEmptyArray Whether or not to return false if searching
 * for an item in an empty array.
 * @param {boolean} options.errorOnEmptyItem Whether or not to return false if searching for an empty item.
 * @returns {(item: T) => boolean}
 */
export const createIsItemInArray = (
  array,
  { errorOnEmptyArray = true, errorOnEmptyItem = true } = {}
) => {
  const items = new Set(array);
  return item => {
    if (items.size === 0 && !errorOnEmptyArray) {
      return true;
    }
    if (!item && !errorOnEmptyItem) {
      return true;
    }
    return items.has(item);
  };
};

export const dataElementRegex = /^([^%\n]*(%[^%\n]+%)+[^%\n]*)$/gi;

/**
 * Returns whether or not the value is a data element expression
 * @param {string} value
 * @returns {boolean}
 */
export const isDataElement = value => dataElementRegex.test(value);

/**
 * Creates a function that validates a given value. If it passes validation, it
 * returns null. Otherwise, it returns the given message.
 * @template T
 * @param {(value: T) => boolean} validator
 * @param {string} message
 * @param {boolean} appendValue If true, the value will be appended to the error message.
 * @returns {(value: T) => string | undefined}
 */
export const createValidatorWithMessage = (validator, message) => value =>
  validator(value) ? undefined : message.trim();

/**
 * Validate that a given item is a valid data element expression.
 * If not, return an error message.
 * @param {string} value
 * @returns {string | undefined}
 */
export const validateIsDataElement = createValidatorWithMessage(
  isDataElement,
  "The value must contain one or more valid data elements."
);

/**
 * Validate that a given item is in the array. If not, return an error message.
 * @template T
 * @param {Array<T>} array
 * @param {string} message
 * @param {Object} options
 * @param {boolean} options.errorOnEmptyArray errorOnEmptyArray Whether or not to return false if searching
 * for an item in an empty array.
 * @param {boolean} options.errorOnEmptyItem Whether or not to return false if searching for an empty item.
 * @returns {(value: T) => string | undefined}
 */
export const createValidateItemIsInArray = (
  array,
  message,
  options = { errorOnEmptyArray: false, errorOnEmptyItem: false }
) => createValidatorWithMessage(createIsItemInArray(array, options), message);

/**
 *
 * @param {(value: T) => string | undefined} validator
 * @returns
 */
export const combineValidatorWithIsDataElement = validator => value =>
  value?.includes("%") ? validateIsDataElement(value) : validator(value);

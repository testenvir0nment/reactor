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

import React, { useState, Fragment } from "react";
import PropTypes from "prop-types";
import { object, string } from "yup";
import { useField } from "formik";
import {
  Cell,
  Column,
  Row,
  TableView,
  TableBody,
  TableHeader,
  Flex,
  Button,
  Text,
  View,
  Divider,
  Heading
} from "@adobe/react-spectrum";
import EditIcon from "@spectrum-icons/workflow/Edit";
import render from "../render";
import ExtensionView from "../components/extensionView";
import FormElementContainer from "../components/formElementContainer";
import DataElementSelector from "../components/dataElementSelector";
import FormikTextField from "../components/formikReactSpectrum3/formikTextField";
import FormikCheckbox from "../components/formikReactSpectrum3/formikCheckbox";
import Alert from "../components/alert";

const DEFAULT_PROP_DELIMITER = ",";
const DEFAULT_LIST_DELIMITER = ",";
const DEFAULT_HIER_DELIMITER = "|";

const getInitialValues = ({ initInfo }) => {
  const { tracker = "", delimiters = {} } = initInfo.settings || {};

  const props = [];
  const lists = [];
  const hiers = [];

  let key;
  let i;
  for (i = 1; i <= 75; i += 1) {
    key = `prop${i}`;
    if (delimiters[key]) {
      props.push({ key, list: true, delimiter: delimiters[key] });
    } else {
      props.push({ key, list: false, delimiter: DEFAULT_PROP_DELIMITER });
    }
  }
  for (i = 1; i <= 3; i += 1) {
    key = `list${i}`;
    lists.push({ key, delimiter: delimiters[key] || DEFAULT_LIST_DELIMITER });
  }
  for (i = 1; i <= 5; i += 1) {
    key = `hier${i}`;
    hiers.push({ key, delimiter: delimiters[key] || DEFAULT_HIER_DELIMITER });
  }

  return {
    tracker,
    props,
    lists,
    hiers
  };
};

const getSettings = ({ values }) => {
  const { tracker, props, lists, hiers } = values;

  const delimiters = {};
  props.forEach(({ key, list, delimiter }) => {
    if (list) {
      delimiters[key] = delimiter;
    }
  });
  lists.forEach(({ key, delimiter }) => {
    if (delimiter !== DEFAULT_LIST_DELIMITER && delimiter !== "") {
      delimiters[key] = delimiter;
    }
  });
  hiers.forEach(({ key, delimiter }) => {
    if (delimiter !== DEFAULT_HIER_DELIMITER && delimiter !== "") {
      delimiters[key] = delimiter;
    }
  });
  return { tracker, delimiters };
};

const validationSchema = object().shape({
  products: string().required("Please specify a product string")
});

const ViewDelimiters = ({ items, label }) => {
  return (
    <TableView aria-label={label} width="size-3600">
      <TableHeader>
        <Column key="key">{label}</Column>
        <Column key="delimiter">Delimiter</Column>
      </TableHeader>
      <TableBody items={items}>
        {prop => <Row>{key => <Cell>{prop[key]}</Cell>}</Row>}
      </TableBody>
    </TableView>
  );
};
ViewDelimiters.propTypes = {
  items: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired
};

const ListPropEditor = ({ allProps }) => {
  return (
    <Flex direction="column" width="size-3600" gap="size-100">
      <Flex
        direction="row"
        gap="size-100"
        alignItems="center"
        marginStart="size-200"
      >
        <Heading
          level="4"
          width="size-1000"
          marginBottom="size-0"
          marginTop="size-0"
        >
          Prop
        </Heading>
        <Heading
          level="4"
          width="size-500"
          marginBottom="size-0"
          marginTop="size-0"
        >
          List?
        </Heading>
        <Heading
          level="4"
          width="size-1600"
          marginBottom="size-0"
          marginTop="size-0"
        >
          Delimiter
        </Heading>
      </Flex>
      <Divider size="S" />
      {allProps.map(({ key, list }, i) => (
        <Fragment key={key}>
          <Flex
            direction="row"
            gap="size-100"
            alignItems="center"
            marginStart="size-200"
          >
            <View width="size-1000">{key}</View>
            <FormikCheckbox
              name={`props.${i}.list`}
              data-test-id={`prop${i}ListField`}
              aria-label="List prop?"
              width="size-500"
            />
            <FormikTextField
              name={`props.${i}.delimiter`}
              data-test-id={`prop${i}DelimiterField`}
              width="size-1600"
              aria-label="Delimiter"
              isDisabled={!list}
            />
          </Flex>
          <Divider size="S" />
        </Fragment>
      ))}
    </Flex>
  );
};

ListPropEditor.propTypes = {
  allProps: PropTypes.array.isRequired
};

const DelimiterEditor = ({ items, label, name }) => {
  return (
    <Flex direction="column" width="size-3600" gap="size-100">
      <Flex
        direction="row"
        gap="size-100"
        alignItems="center"
        marginStart="size-200"
      >
        <Heading
          level="4"
          width="size-1600"
          marginBottom="size-0"
          marginTop="size-0"
        >
          {label}
        </Heading>
        <Heading
          level="4"
          width="size-1600"
          marginBottom="size-0"
          marginTop="size-0"
        >
          Delimiter
        </Heading>
      </Flex>
      <Divider size="S" />
      {items.map(({ key }, i) => (
        <Fragment key={key}>
          <Flex
            direction="row"
            gap="size-100"
            alignItems="center"
            marginStart="size-200"
          >
            <View width="size-1600">{key}</View>
            <FormikTextField
              name={`${name}s.${i}.delimiter`}
              data-test-id={`${name}${i}DelimiterField`}
              width="size-1600"
              aria-label="Delimiter"
            />
          </Flex>
          <Divider size="S" />
        </Fragment>
      ))}
    </Flex>
  );
};

DelimiterEditor.propTypes = {
  items: PropTypes.array.isRequired,
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired
};

const AnalyticsXdm = () => {
  const [editSection, setEditSection] = useState("");

  const [{ value: allProps }] = useField("props");
  const [{ value: allLists }] = useField("lists");
  const [{ value: allHiers }] = useField("hiers");

  const filteredProps = allProps.filter(({ list }) => list);
  const filteredLists = allLists.filter(
    ({ delimiter }) => delimiter !== DEFAULT_LIST_DELIMITER
  );
  const filteredHiers = allHiers.filter(
    ({ delimiter }) => delimiter !== DEFAULT_HIER_DELIMITER
  );

  return (
    <FormElementContainer>
      <DataElementSelector>
        <FormikTextField
          data-test-id="trackerField"
          name="tracker"
          description={
            'Enter the name of the tracker variable (i.e. "s") or specify a data element that resolves to the tracker.'
          }
          label="Tracker"
          width="size-5000"
        />
      </DataElementSelector>
      <Flex direction="row" gap="size-200">
        {editSection !== "props" && filteredProps.length === 0 && (
          <Alert
            variant="informative"
            title="List prop delimiters"
            width="size-3600"
          >
            <Text>No list props have been configured.</Text>
          </Alert>
        )}
        {editSection !== "props" && filteredProps.length > 0 && (
          <ViewDelimiters items={filteredProps} label="List prop" />
        )}
        {editSection !== "props" && (
          <Button
            variant="secondary"
            data-test-id="editProps"
            onPress={() => setEditSection("props")}
          >
            <EditIcon />
            <Text>Edit list props</Text>
          </Button>
        )}
        {editSection === "props" && (
          <>
            <ListPropEditor allProps={allProps} />
            <Button
              variant="secondary"
              data-test-id="doneEditProps"
              onPress={() => setEditSection("")}
            >
              <Text>Done editing list props</Text>
            </Button>
          </>
        )}
      </Flex>
      <Flex direction="row" gap="size-200">
        {editSection !== "lists" && filteredLists.length === 0 && (
          <Alert
            variant="informative"
            title="List variable delimiters"
            width="size-3600"
          >
            <Text>
              No custom delimiters have been defined. All list variables will
              use the default delimiter &quot;{DEFAULT_LIST_DELIMITER}&quot;.
            </Text>
          </Alert>
        )}
        {editSection !== "lists" && filteredLists.length > 0 && (
          <ViewDelimiters items={filteredLists} label="List variable" />
        )}
        {editSection !== "lists" && (
          <Button
            variant="secondary"
            data-test-id="editLists"
            onPress={() => setEditSection("lists")}
          >
            <EditIcon />
            <Text>Edit list variables</Text>
          </Button>
        )}
        {editSection === "lists" && (
          <>
            <DelimiterEditor
              items={allLists}
              label="List variable"
              name="list"
            />
            <Button
              variant="secondary"
              data-test-id="doneEditLists"
              onPress={() => setEditSection("")}
            >
              <Text>Done editing list variables</Text>
            </Button>
          </>
        )}
      </Flex>
      <Flex direction="row" gap="size-200">
        {editSection !== "hiers" && filteredHiers.length === 0 && (
          <Alert
            variant="informative"
            title="Hierarchy variable delimiters"
            width="size-3600"
          >
            <Text>
              No custom delimiters have been defined. All hierarchy variables
              will use the default delimiter &quot;{DEFAULT_HIER_DELIMITER}
              &quot;.
            </Text>
          </Alert>
        )}
        {editSection !== "hiers" && filteredHiers.length > 0 && (
          <ViewDelimiters items={filteredHiers} label="Hierarchy variable" />
        )}
        {editSection !== "hiers" && (
          <Button
            variant="secondary"
            data-test-id="editHiers"
            onPress={() => setEditSection("hiers")}
          >
            <EditIcon />
            <Text>Edit hierarchy variables</Text>
          </Button>
        )}
        {editSection === "hiers" && (
          <>
            <DelimiterEditor
              items={allHiers}
              label="Hierarchy variable"
              name="hier"
            />
            <Button
              variant="secondary"
              data-test-id="doneEditHiers"
              onPress={() => setEditSection("")}
            >
              <Text>Done editing hierarchy variables</Text>
            </Button>
          </>
        )}
      </Flex>
    </FormElementContainer>
  );
};

const AnalyticsXdmExtensionView = () => {
  return (
    <ExtensionView
      getInitialValues={getInitialValues}
      getSettings={getSettings}
      formikStateValidationSchema={validationSchema}
      render={() => <AnalyticsXdm />}
    />
  );
};

render(AnalyticsXdmExtensionView);

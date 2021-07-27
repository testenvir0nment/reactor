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

import React, { useImperativeHandle, forwardRef, useRef } from "react";
import { FieldArray, useField } from "formik";
import {
  Flex,
  Button,
  DialogTrigger,
  Dialog,
  Heading,
  ButtonGroup,
  Content,
  Divider,
  ActionButton
} from "@adobe/react-spectrum";
import XdmObjectDialog from "./xdmObjectDialog";

const XdmList = forwardRef(({ initInfo }, ref) => {
  const [{ value: xdmArray }] = useField("xdm");
  const [{ value: xdmMetaArray }] = useField("xdmMeta");
  const dialogRef = useRef();

  useImperativeHandle(ref, () => {
    return {
      validate() {
        if (dialogRef.current) {
          return dialogRef.current.validate();
        }
        return true;
      }
    };
  });

  const getXdmLabel = xdm => {
    debugger;
    if (typeof xdm === "string") {
      return xdm;
    }

    return Object.keys(xdm)[0];
  };

  return (
    <Flex direction="column" alignItems="flex-start">
      <FieldArray
        name="xdm"
        render={arrayHelpers => {
          return (
            <>
              {xdmArray.map((xdm, index) => {
                return <div key={index}>{getXdmLabel(xdm)}</div>;
              })}
              <DialogTrigger type="fullscreenTakeover">
                <ActionButton>Add XDM</ActionButton>
                {close => {
                  const onSave = ({ xdm }) => {
                    debugger;
                    arrayHelpers.push(settings.xdm);
                    // xdmMetaArray.slice().push()
                    close();
                  };

                  return (
                    <XdmObjectDialog
                      ref={dialogRef}
                      imsAccess={initInfo.tokens.imsAccess}
                      orgId={initInfo.company.orgId}
                      xdm={null}
                      xdmMeta={null}
                      initInfo={initInfo}
                      onSave={onSave}
                      onCancel={close}
                    />
                  );
                }}
              </DialogTrigger>
            </>
          );
        }}
      />
    </Flex>
  );
});

export default XdmList;

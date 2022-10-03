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

// The Adobe Launch bundler doesn't handle requiring npm packages, but this is
// equivalent to require("@adobe/alloy"). We could run our own bundler to do this,
// but this works. If Alloy changed the location of its cjs entry point we would
// need to change the path here.
const { createInstance, createEventMergeId } = require("../alloy");
const createInstanceManager = require("./createInstanceManager");
const injectWrapOnBeforeEventSend = require("./injectWrapOnBeforeEventSend");

const version = "__VERSION__";

const wrapOnBeforeEventSend = injectWrapOnBeforeEventSend({ version });

module.exports = createInstanceManager({
  turbine,
  window,
  createInstance,
  createEventMergeId,
  orgId: _satellite.company.orgId,
  wrapOnBeforeEventSend
});

/*
module.exports = Promise.resolve()
.then(() => {
  console.log("Waiting for mcid to be available");
  // Make sure that the Experience Cloud ID Service is initialized first
  return turbine.getSharedModule('adobe-mcid', 'mcid-instance');
})
.then(() => {
  console.log("Initializing Alloy");
  return createInstanceManager({
    turbine,
    window,
    createInstance,
    createEventMergeId,
    orgId: _satellite.company.orgId,
    wrapOnBeforeEventSend
  });
});
*/

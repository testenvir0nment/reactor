/*************************************************************************
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2016 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by all applicable intellectual property
* laws, including trade secret and copyright laws.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

'use strict';

var logger = require('@turbine/logger');

var getTracker = require('../helpers/getTracker');
var applyTrackerVariables = require('../helpers/applyTrackerVariables');

module.exports = function(settings, event) {
  getTracker().then(function(tracker) {
    logger.info('Set variables on the tracker.');
    applyTrackerVariables(tracker, settings.trackerProperties);
    if (settings.customSetup && settings.customSetup.source) {
      settings.customSetup.source.call(event.element, event, tracker);
    }
  }, function(errorMessage) {
    logger.error(
      'Cannot set variables: ' +
      errorMessage
    );
  });
};

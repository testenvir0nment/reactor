'use strict';

var publicRequire = require('../../__tests__/helpers/publicRequire');
var sendBeaconInjector = require('inject!../sendBeacon');
var Promise = publicRequire('promise');

var getLoggerMockObject = function() {
  return jasmine.createSpyObj('logger', ['info', 'error', 'warn', 'log']);
};

var getSendBeacon = function(mocks) {
  return sendBeaconInjector({
    'logger': (mocks && mocks.logger) || getLoggerMockObject(),
    'get-extension-configurations': (mocks && mocks['get-extension-configurations']) || function() {
      return [{
        id: 'EX1',
        name: 'EX1'
      }];
    },
    '../helpers/getTracker.js': (mocks && mocks['../helpers/getTracker.js']) ||
    function() {
      return Promise.resolve({});
    }
  });
};

describe('send beacon', function() {
  it('sends the beacon for a configuration', function(done) {
    var tracker = {
      t: jasmine.createSpy('t')
    };

    var sendBeacon = getSendBeacon({
      '../helpers/getTracker.js': function() {
        return Promise.resolve(tracker);
      }
    });

    sendBeacon({
      extensionConfigurationIds: ['EX1'],
      type: 'page'
    });

    setTimeout(function() {
      expect(tracker.t).toHaveBeenCalledTimes(1);
      done();
    });
  });

  it('sends the beacon for multiple configurations', function(done) {
    var tracker = {
      t: jasmine.createSpy('t')
    };

    var sendBeacon = getSendBeacon({
      '../helpers/getTracker.js': function() {
        return Promise.resolve(tracker);
      },
      'get-extension-configurations': function() {
        return [{
          id: 'EX1',
          name: 'EX1'
        },{
          id: 'EX2',
          name: 'EX2'
        }];
      }
    });

    sendBeacon({
      extensionConfigurationIds: ['EX1', 'EX2'],
      type: 'page'
    });

    setTimeout(function() {
      expect(tracker.t).toHaveBeenCalledTimes(2);
      done();
    });
  });

  it('sends the beacon for all the configurations when extensionConfigurationIds is missing',
    function(done) {
      var tracker = {
        t: jasmine.createSpy('t')
      };

      var sendBeacon = getSendBeacon({
        'get-extension-configurations': function() {
          return [{
            id: 'EX1',
            name: 'EX1'
          },{
            id: 'EX2',
            name: 'EX2'
          },{
            id: 'EX3',
            name: 'EX3'
          }];
        },
        '../helpers/getTracker.js': function() {
          return Promise.resolve(tracker);
        }
      });

      sendBeacon({
        type: 'page'
      });

      setTimeout(function() {
        expect(tracker.t).toHaveBeenCalledTimes(3);
        done();
      });
    });

  it('logs an error when getTracker throws an error', function(done) {
    var loggerSpy = getLoggerMockObject();
    var sendBeacon = getSendBeacon({
      '../helpers/getTracker.js': function() {
        return Promise.reject('some error');
      },
      logger: loggerSpy
    });

    sendBeacon({
      extensionConfigurationIds: ['EX1']
    });

    setTimeout(function() {
      expect(loggerSpy.error).toHaveBeenCalled();
      done();
    });
  });

  it('sends the custom link beacon for a configuration', function(done) {
    var tracker = {
      tl: jasmine.createSpy('tl')
    };

    var sendBeacon = getSendBeacon({
      '../helpers/getTracker.js': function() {
        return Promise.resolve(tracker);
      }
    });

    sendBeacon({
      extensionConfigurationIds: ['EX1']
    });

    setTimeout(function() {
      expect(tracker.tl.calls.count()).toBe(1);
      expect(tracker.tl).toHaveBeenCalledWith('true', 'o', 'link clicked');
      done();
    });
  });

  it('sends the custom link beacon using the link name and link type provided', function(done) {
    var tracker = {
      tl: jasmine.createSpy('tl')
    };

    var sendBeacon = getSendBeacon({
      '../helpers/getTracker.js': function() {
        return Promise.resolve(tracker);
      }
    });

    sendBeacon({
      extensionConfigurationIds: ['EX1'],
      linkName: 'some name',
      linkType: 'c'
    });

    setTimeout(function() {
      expect(tracker.tl.calls.count()).toBe(1);
      expect(tracker.tl).toHaveBeenCalledWith('true', 'c', 'some name');
      done();
    });
  });

  it('sends the custom link beacon using the target element when possible', function(done) {
    var targetElement = document.createElement('a');
    targetElement.innerHTML = 'link';

    var tracker = {
      tl: jasmine.createSpy('tl')
    };

    var sendBeacon = getSendBeacon({
      '../helpers/getTracker.js': function() {
        return Promise.resolve(tracker);
      }
    });

    sendBeacon({
      extensionConfigurationIds: ['EX1']
    }, targetElement);

    setTimeout(function() {
      expect(tracker.tl.calls.count()).toBe(1);
      expect(tracker.tl).toHaveBeenCalledWith(targetElement, 'o', 'link');
      done();
    });
  });
});

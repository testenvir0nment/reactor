const karmaSauceLauncher = require("karma-sauce-launcher");

const karmaConfig = require("./karma.conf");

module.exports = config => {
  karmaConfig(config);
  const customLaunchers = {
    sl_chromeW3C: {
      base: "SauceLabs",
      browserName: 'firefox',
      browserVersion: '105',
      platformName: 'Windows 10',
      acceptInsecureCerts: true,
      'sauce:options': {
        recordVideo: false,
        videoUploadOnPass: false,
        recordScreenshots: false,
        recordLogs: false,
      }
    },
    sl_firefoxW3C: {
      base: "SauceLabs",
      browserName: 'chrome',
      browserVersion: 'latest',
      platformName: 'Windows 10',
      acceptInsecureCerts: true,
      'sauce:options': {
        recordVideo: false,
        videoUploadOnPass: false,
        recordScreenshots: false,
        recordLogs: false,
      }
    },
    sl_safariW3C: {
      base: "SauceLabs",
      browserName: 'safari',
      browserVersion: '16',
      platformName: 'macOS 12',
      acceptInsecureCerts: true,
      'sauce:options': {
        recordVideo: false,
        videoUploadOnPass: false,
        recordScreenshots: false,
        recordLogs: false,
      }
    }
  };

  config.set({
    browsers: Object.keys(customLaunchers),
    customLaunchers,

    plugins: [
      "karma-jasmine",
      "karma-coverage",
      "karma-jasmine-matchers",
      "karma-spec-reporter",
      "karma-rollup-preprocessor",
      karmaSauceLauncher
    ],

    reporters: ["dots", "saucelabs"]
  });
};

const karmaSauceLauncher = require("karma-sauce-launcher");
const karmaConfig = require("./karma.conf");

module.exports = config => {
  karmaConfig(config);
  const customLaunchers = {
    sl_chromeW3C: {
      base: "SauceLabs",
      browserName: "chrome",
      browserVersion: "latest",
      platform: "Windows 11"
    },
    sl_safariW3C: {
      base: "SauceLabs",
      browserName: "safari",
      browserVersion: "latest",
      platform: "macOS 11.00"
    },
    sl_firefoxW3C: {
      base: "SauceLabs",
      browserName: "firefox",
      platformName: "Windows 11",
      browserVersion: "latest",
      "sauce:options": {
        screenResolution: "1280x1024",
        seleniumVersion: "3.141.59",
        tunnelIdentifier: process.env.JOB_NUMBER
      }
    },
    sl_edgeW3C: {
      base: "SauceLabs",
      browserName: "microsoftedge",
      browserVersion: "latest",
      platform: "Windows 11"
    }
  };

  config.set({
    browsers: Object.keys(customLaunchers),
    customLaunchers,
    concurrency: 10,
    colors: true,
    sauceLabs: {
      screenResolution: "800x600",
      build: `GH #${process.env.BUILD_NUMBER} (${process.env.BUILD_ID})`,
      tunnelIdentifier: process.env.JOB_NUMBER
    },
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

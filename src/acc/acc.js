var continuum = require('@continuum/continuum-javascript-professional/Continuum.professional');
var Continuum = continuum.Continuum;
var ReportManagementStrategy = continuum.ReportManagementStrategy;
var ModuleManagementStrategy = continuum.ModuleManagementStrategy;
var _ = require('lodash');
// TODO user conf file
// TODO what about conf per test?
var path = require('path');

function ACC(browser) {
  this.browser = browser;
}

ACC.prototype.setup = function () {
  return Continuum.setUp(this.browser, path.join(__dirname, '/acc.conf.js'), null);
};

// TODO have some config for submitting and only call 1 func in the test:
// local testing - no submit; central testing - submit
ACC.prototype.getAccessibilityConcerns = function (expect) {
  return Continuum.runAllTests().then(function (accessibilityConcerns) {
    try {
      expect(accessibilityConcerns.length).toBe(0);
    } finally {
      console.log(accessibilityConcerns.length + ' accessibility concern(s) found:\n' +
        JSON.stringify(accessibilityConcerns, null, 2));
      return accessibilityConcerns;
    }
  });
};

ACC.prototype.submitAccessibilityConcernsToAMP = function (accessibilityConcerns, browser) {
  console.log('\nSubmitting accessibility concerns to AMP...');
  var ampReportingService = Continuum.AMPReportingService; // AMPReportingService is available after setUp
  // TODO config ids and names
  return ampReportingService.setActiveOrganization(12345)  // ID of AMP organization to submit test results to
    .then(function () {
      return ampReportingService.setActiveAsset(36418);  // ID of AMP asset to submit test results to
      // note: had to make a new asset for the poc - the one for example didn;t work
    }).then(function () {
      return ampReportingService.setActiveReportByName('POC 1');
    }).then(function () {
      return browser.getTitle().then(function (title) {
        return browser.getCurrentUrl().then(function (url) {
          return ampReportingService.setActiveModuleByName(title, url);
        });
      });
    }).then(function () {
      return ampReportingService.setActiveReportManagementStrategy(ReportManagementStrategy.OVERWRITE);
    }).then(function () {
      return ampReportingService.setActiveModuleManagementStrategy(ModuleManagementStrategy.OVERWRITE);
    }).then(function () {
      return ampReportingService.submitAccessibilityConcernsToAMP(accessibilityConcerns);
    }).then(function () {
      console.log('Accessibility concerns submitted to AMP: ' + ampReportingService.activeModule.getAMPUrl());
    }).catch(function (e) {
      console.log('Failed to submit accessibility concerns: ', e);
    });
};

ACC.prototype.register = function (namespace) {
  _.extend(namespace, {
    getAccessibilityConcerns: this.getAccessibilityConcerns.bind(this),
    submitAccessibilityConcernsToAMP: this.submitAccessibilityConcernsToAMP.bind(this)
  });
};

module.exports = ACC;

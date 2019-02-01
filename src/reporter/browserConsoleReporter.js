/* eslint no-console: */

var _ = require('lodash');

function BrowserConsoleReporter() {
}

function JasmineBrowserConsoleReporter() {
}

JasmineBrowserConsoleReporter.prototype.specDone = function () {
  browser.getAndClearLogs().then(function (logs) {
    var template = _.template('BROWSER LOG: ${level}: ${message}');
    _.each(logs, function (log) {
      console.log(template(log));
    });
  });
};

BrowserConsoleReporter.prototype.register = function (jasmineEnv) {
  jasmineEnv.addReporter(new JasmineBrowserConsoleReporter());
};

module.exports = function () {
  return new BrowserConsoleReporter();
};

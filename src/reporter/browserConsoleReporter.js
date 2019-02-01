/* eslint no-console: */

var _ = require('lodash');

function BrowserConsoleReporter() {
}

function JasmineBrowserConsoleReporter() {
}

JasmineBrowserConsoleReporter.prototype.specDone = function () {
  this._collectAndClearLog();
};

JasmineBrowserConsoleReporter.prototype.jasmineDone = function () {
  this._collectAndClearLog();
};

JasmineBrowserConsoleReporter.prototype._collectAndClearLog = function () {
  // note that this cannot be awaited (logs might show up after the next spec has started) // see jasmine 3
  // works only for chrome
  browser.manage().logs().get('browser').then(function (logs) {
    // log properties: level, message, timestamp, type
    // for details, see selenium-webdriver/lib/logging.Entry
    var template = _.template('BROWSER LOG: ${level}: ${message} - ${type}');

    logs.map(function (log) {
      log.level = log.level.name.toLowerCase();
      return log;
    }).forEach(function (log) {
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

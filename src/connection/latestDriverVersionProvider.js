var q = require('q');
var request = require('request');

function LatestDriverVersionProvider(config, instanceConfig, logger) {
  this.logger = logger;
}

LatestDriverVersionProvider.prototype.getLatestVersion = function (binary) {
  var that = this;
  return that._getLatestMajorVersion(binary)
    .then(function (result) {
      if (result.latestMajorVersion) {
        binary.latestVersionUrl = binary.latestVersionUrlForMajor.replace('{majorVersion}', result.latestMajorVersion);
      }
      return that._getLatestDriverVersion(binary);
    });
};

LatestDriverVersionProvider.prototype._getLatestMajorVersion = function (binary) {
  var that = this;

  that.logger.info('Check for latest major version of: ' + binary.filename);
  return q.Promise(function (resolveFn, rejectFn) {
    if (binary.majorVersionUrl) {
      request({
        url: binary.majorVersionUrl
      }, function (error, res, body) {
        if (_hasError(error, res)) {
          rejectFn(_getErrorObject(error, res, binary.filename, 'the latest major version number'));
        } else {
          that.logger.info('Found latest major version of ' + binary.filename + ': ' + body);
          resolveFn({
            latestMajorVersion: _sanitizeBody(body)
          });
        }
      });
    } else {
      resolveFn({});
    }
  });
};

LatestDriverVersionProvider.prototype._getLatestDriverVersion = function (binary) {
  var that = this;

  that.logger.info('Check for latest version of: ' + binary.filename);
  return q.Promise(function (resolveFn, rejectFn) {
    request({
      url: binary.latestVersionUrlRedirect || binary.latestVersionUrl
    }, function (error, res, body) {
      if(_hasError(error, res)) {
        rejectFn(_getErrorObject(error, res, binary.filename, 'the latest version number'));
      } else {
        var latestVersion;

        // resolve latest version
        if(binary.latestVersionUrl) {
          latestVersion = body;
        } else if(binary.latestVersionUrlRedirect) {
          // request to the latest version is redirected to the latest release, so get the version from req.path
          var redirectPath = res.req.path.split('/');
          latestVersion = redirectPath[redirectPath.length - 1];
        }

        if (latestVersion) {
          that.logger.info('Found latest version of ' + binary.filename + ': ' + latestVersion);
          resolveFn({
            latestVersion: latestVersion
          });
        } else {
          rejectFn(new Error('Latest version resolving is not configured correctly, one of latestVersionUrl: ' + binary.latestVersionUrl +
          ' or latestVersionUrlRedirect: ' + binary.latestVersionUrlRedirect + ' should be provided'));
        }
      }
    });
  });
};

function _hasError(error, res) {
  return error || res.statusCode != 200;
}

function _getErrorObject(error, res, filename, info) {
  return new Error('Error while getting ' + info + ' for ' + filename +
    (error ? (', error: ' + error) :
      (res && res.statusCode ? (', status code: ' + res.statusCode) : '')));
}

function _sanitizeBody(body) {
  if (body && typeof body === 'string') {
    var number = body.trim();
    if (number.match(/^([0-9]+\.*)+$/)) {
      return number;
    }
  }
}

module.exports = function(config, instanceConfig, logger) {
  return new LatestDriverVersionProvider(config, instanceConfig, logger);
};

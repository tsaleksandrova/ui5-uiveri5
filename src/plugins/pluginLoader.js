var _plugins = [];

function init(moduleLoader) {
  _plugins = moduleLoader.loadModule('plugins');
}

function loadJasminePlugins() {
  return {
    suiteStarted: function(jasmineSuite){
      _callPlugins('suiteStarted', [{name:jasmineSuite.description}]);
    },
    specStarted: function(jasmineSpec){
      _callPlugins('specStarted', [{name:jasmineSpec.description}]);
    },
    specDone: function(jasmineSpec){
      _callPlugins('specDone', [{name:jasmineSpec.description}]);
    },
    suiteDone: function(jasmineSuite){
      _callPlugins('suiteDone', [{name:jasmineSuite.description}]);
    }
  };
}

function loadRunnerPlugins() {
  return [{
    inline: {
      setup: function() {
        _callPlugins('setup');
      },
      onPrepare: function() {
        _callPlugins('onPrepare');
      },
      teardown: function() {
        _callPlugins('teardown');
      }
    }
  }];
}

function _callPlugins(method, pluginData) {
  // call a method on every plugin, granted that it is defined
  return Promise.all(
    _plugins.map(function (plugin) {
      if (plugin[method]) {
        return plugin[method].apply(plugin, pluginData);
      }
    })
  );
}

module.exports = {
  init: init,
  loadJasminePlugins: loadJasminePlugins,
  loadRunnerPlugins: loadRunnerPlugins
};

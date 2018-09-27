var CoreObject  = require('core-object');
var fs          = require('fs');
var RSVP        = require('rsvp');

var denodeify   = require('rsvp').denodeify;
var readFile    = denodeify(fs.readFile);

module.exports = CoreObject.extend({
  init: function(options) {
    this._super();
    this._plugin = options.plugin;
  },

  generate: function() {
    var separator = this._plugin.readConfig('separator');
    var versionFile = this._plugin.readConfig('versionFile');
    var plugin = this._plugin;

    return readFile(versionFile)
      .then(function(contents) {
        var json = JSON.parse(contents);

        if (!json.version) {
          return RSVP.reject('Could not build revision with version `' + json.version + '`');
        }

        var versionString = json.version;
        var buildNumber = process.env.CI_PIPELINE_ID;

        if (buildNumber) {
          versionString = versionString + separator + buildNumber;
        } else {
          plugin.log('Missing GitLab pipeline id, using package version as revisionKey', { color: 'yellow', verbose: true });
        }

        return {
          revisionKey: versionString,
          timestamp: new Date().toISOString()
        };
      });
  }
});

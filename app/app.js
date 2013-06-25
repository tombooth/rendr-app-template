var BaseApp = require('rendr/shared/app'),
    syncer = require('rendr/shared/syncer');

module.exports = BaseApp.extend({

  initialize: function(attributes, options) {
    BaseApp.prototype.initialize.apply(this, arguments);

    syncer.setClientUrlBase(options ? options.clientUrlBase : '');
  },

  // @client
  start: function() {
    // Show a loading indicator when the app is fetching.
    this.router.on('action:start', function() { this.set({loading: true});  }, this);
    this.router.on('action:end',   function() { this.set({loading: false}); }, this);

    // Call 'super'.
    BaseApp.prototype.start.call(this);
  }

});

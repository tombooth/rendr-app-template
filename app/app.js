var BaseApp = require('rendr/shared/app'),
    syncer = require('rendr/shared/syncer');

module.exports = BaseApp.extend({

  initialize: function() {
    BaseApp.prototype.initialize.apply(this, arguments);

    syncer.setClientUrlBase(this.get('clientUrlBase'));
  },

  // @client
  start: function() {
    this.router.renderOnFirstRoute = !!this.get('renderOnFirstRoute');
    
    // Show a loading indicator when the app is fetching.
    this.router.on('action:start', function() { this.set({loading: true});  }, this);
    this.router.on('action:end',   function() { this.set({loading: false}); }, this);

    // Call 'super'.
    BaseApp.prototype.start.call(this);
  }

});

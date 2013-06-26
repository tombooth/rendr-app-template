(function() {
   var App = window.App = new (require('app/app'))({ }, {
      clientUrlBase: $('#boot').attr('data-urlbase'),
      renderOnFirstRoute: true
   });
   App.bootstrapData();
   App.start();
   App.router.navigate('', { trigger: true });
})();

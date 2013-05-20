(function(undefined) {

  App = {
    init : function() {
      // Inject scripts
      this.injectScripts(util.bind(function() {
        // Socket.io has loaded
        this.setupSocket();
      }, this));
    },

    setupSocket : function() {
      this.socket = io.connect('http://localhost:8088');
    },

    injectScripts : function(cb) {
      var totalLoaded = 0;
      var scripts = [
        'http://localhost:8088/socket.io/socket.io.js',
        'js/html2canvas.min.js'
      ];

      function scriptLoaded() {
        ++totalLoaded;

        if(totalLoaded === scripts.length) {
          return cb();
        }
      }

      var head = document.getElementsByTagName('head')[0];

      for(var i = 0; i < scripts.length; i++) {
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;

        s.onreadystatechanged = s.onload = function() {
          s.onreadystatechanged = s.onload = null;
          scriptLoaded();
        };

        s.src = scripts[i];
        head.appendChild(s);
      }
    }

  };

  util = {
    bind : function(fn, context) {
      return function() {
        fn.apply(context, arguments);
      };
    }
  };
  
  window['onload'] = function() {
    App.init();
  };

}).call(this);

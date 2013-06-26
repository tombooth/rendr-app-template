var path = require('path');

var stylesheetsDir = 'assets/stylesheets';
var rendrDir = 'node_modules/rendr';
var rendrModulesDir = rendrDir + '/node_modules';

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    bgShell: {
      runNode: {
        cmd: 'node ./node_modules/nodemon/nodemon.js index.js',
        bg: true
      }
    },

    jade: {
      template: {
        options: {
          pretty: true,
          data: {
            template: true,
            base: '/'
          }
        },
        files: {
          'app/templates/__layout.hbs': 'layout.jade'
        }
      },
      client: {
        options: {
          pretty: true,
          data: function() {
            var port = process.env.PORT || 3030,
                ipAddress;

            ipAddress = require('os').networkInterfaces()['en0']
               .filter(function(ip) { return ip.family === 'IPv4'; })[0].address;

            return {
              template: false,
              urlBase: 'http://' + ipAddress + ':' + port,
              base: ''
            };
          }
        },
        files: {
          'index.html': 'layout.jade'
        }
      }
    },

    stylus: {
      compile: {
        options: {
          paths: [stylesheetsDir],
          'include css': true
        },
        files: {
          'public/styles.css': stylesheetsDir + '/index.styl'
        }
      }
    },

    handlebars: {
      compile: {
        options: {
          namespace: false,
          commonjs: true,
          processName: function(filename) {
            return filename.replace('app/templates/', '').replace('.hbs', '');
          }
        },
        src: "app/templates/**/*.hbs",
        dest: "app/templates/compiledTemplates.js",
        filter: function(filepath) {
          var filename = path.basename(filepath);
          // Exclude files that begin with '__' from being sent to the client,
          // i.e. __layout.hbs.
          return filename.slice(0, 2) !== '__';
        }
      }
    },

    watch: {
      scripts: {
        files: 'app/**/*.js',
        tasks: ['rendr_stitch'],
        options: {
          interrupt: true
        }
      },
      templates: {
        files: 'app/**/*.hbs',
        tasks: ['handlebars'],
        options: {
          interrupt: true
        }
      },
      stylesheets: {
        files: stylesheetsDir + '/**/*.styl',
        tasks: ['stylus'],
        options: {
          interrupt: true
        }
      }
    },

    rendr_stitch: {
      compile: {
        options: {
          dependencies: [
            'assets/vendor/**/*.js'
          ],
          npmDependencies: {
            underscore: '../rendr/node_modules/underscore/underscore.js',
            backbone: '../rendr/node_modules/backbone/backbone.js',
            handlebars: '../rendr/node_modules/handlebars/dist/handlebars.runtime.js',
            async: '../rendr/node_modules/async/lib/async.js'
          },
          aliases: [
            {from: rendrDir + '/client', to: 'rendr/client'},
            {from: rendrDir + '/shared', to: 'rendr/shared'}
          ]
        },
        files: [{
          dest: 'public/mergedAssets.js',
          src: [
            'app/**/*.js',
            rendrDir + '/client/**/*.js',
            rendrDir + '/shared/**/*.js'
          ]
        }]
      }
    },

    compress: {
      phonegap: {
        options: {
          archive: 'phonegap.zip'
        },
        files: [
          { src: 'config.xml', dest: '' },
          { src: 'index.html', dest: '' },
          { expand: true, cwd: 'public/', src: ['**'], dest: '' }
        ]
      },
      chromeapp: {
        options: {
          archive: 'chromeapp.zip'
        },
        files: [
          { src: 'manifest.json', dest: '' },
          { src: 'index.html', dest: '' },
          { expand: true, cwd: 'public/', src: ['**'], dest: '' }
        ]
      }
    },

    'phonegap-build': {
      main: {
        options: {
          archive: '<%=compress.phonegap.options.archive%>',
          appId: '446430',
          user: { email: 'rendrexampleapp@gmail.com', password: 'r3ndr3x@mpl3@app' },
          keys: {
            android: { "key_pw": "r3ndr3x@mpl3@app", "keystore_pw": "r3ndr3x@mpl3@app" }
          },
          download: {
            android: 'android.apk'
          }
        }
      }
    },

    simple_crx: {
      main: {
        options: {
          src: '<%=compress.chromeapp.options.archive%>',
          dest: 'chromeapp.crx',
          key: 'chromeapp.pem'
        }
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-stylus');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-handlebars');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-bg-shell');
  grunt.loadNpmTasks('grunt-rendr-stitch');
  grunt.loadNpmTasks('grunt-phonegap-build');
  grunt.loadNpmTasks('grunt-simple-crx');

  grunt.registerTask('compile', ['jade:template', 'handlebars', 'rendr_stitch', 'stylus']);
  grunt.registerTask('phonegap', ['compile', 'jade:client', 'compress:phonegap', 'phonegap-build']);
  grunt.registerTask('chromeapp', ['compile', 'jade:client', 'compress:chromeapp', 'simple_crx']);

  // Run the server and watch for file changes
  grunt.registerTask('server', ['bgShell:runNode', 'compile', 'watch']);

  grunt.registerTask('all', ['phonegap', 'chromeapp', 'server']);


  // Default task(s).
  grunt.registerTask('default', ['compile']);
};

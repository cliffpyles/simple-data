#!/usr/bin/env node
var server = require('./lib/server.js');
var yargs = require('yargs')
  .usage('Usage: simple-data <command>')
  .command('init <project_name>', 'Initialize a new project')
  .command('start [options]', 'Start the server')
  .command('generate <resource>', 'Generate a resource type in the db')
  .command('import <filepath | url>', 'Import data from an external source')
  .alias('h','help')
  .alias('v','version')
  .help('h')
  .version(function() {
    return require('../package').version;
  });
var argv = yargs.argv;
var command = argv._[0];

var exports = module.exports = (function(){
  var options = {};
  this.processUserInput = function() {
    switch (command) {
      case 'start':
        server.start(options);
        break;
      case 'init':
        server.init(options);
        break;
      case 'generate':
        options.resourceName = argv._[1];
        server.generateResource(options);
        break;
      case 'import':
        options.externalSource = argv._[1];
        server.importData(options);
        break;
      default:

        break;
    }
  };
  this.processUserInput();
})();

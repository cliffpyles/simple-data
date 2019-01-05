var fs = require('fs-extra');
var _ = require('lodash');
var low = require('lowdb');
var bodyParser = require('body-parser');
var beautify = require('js-beautify').js_beautify;
var jsop = require('jsop');
var request = require('request');

var Server = function () {
  this.settings = {
    port: 9000,
    database: 'data/db.json',
    config: 'simple.json',
    apiStandard: false, //false, swagger, json-api
    namespace: ''
  };
  this.getDatabasePath = function() {
    return process.cwd() + `/${this.settings.database}`;
  };
  this.getConfigPath = function() {
    return process.cwd() + `/${this.settings.config}`;
  };
  this.db = {};
};


Server.prototype.init = function(cliOptions) {
  var self = this;
  self.loadSettings(cliOptions).then(function(settings) {
    var simpleConfigPath = self.getConfigPath();
    var simpleDatabase = self.getDatabasePath();

    //create config file
    fs.outputFile(simpleConfigPath,beautify(JSON.stringify(settings), {indent_size: 2}), function(err) {
      if(err) console.log('ERROR: err.message');
      console.log('SimpleData Config Initialized');
    });

    //create database if it doesn't exist already
    fs.outputFile(simpleDatabase, '{}', function(err){
      if(err) console.log('ERROR: err.message');
      console.log('SimpleData Database Initialized');
    });
  }).catch(function(err) {
    console.log('ERROR: err.message');
  });
};

Server.prototype.start = function(cliOptions) {
  var self = this;
  self.loadSettings(cliOptions)
    .then(self.loadData)
    .then(self.loadWebServer);
};

Server.prototype.generateResource = function(cliOptions) {
  var self = this;
  self.loadSettings(cliOptions)
    .then(function(server) {
      var db = jsop(server.getDatabasePath());
      if (db[cliOptions.resourceName]) {
        console.log(`${cliOptions.resourceName} already exists`);
      } else {
        db[cliOptions.resourceName]=[];
        console.log(`${cliOptions.resourceName} created`);
      }
    });
};

Server.prototype.importData = function (cliOptions) {
  var self = this;
  var isURL = /^http(s)?:\/\/(.)*$/i;
  self.loadSettings(cliOptions)
    .then(function(server) {
      if(isURL.test(server.settings.externalSource)) {
        request(server.settings.externalSource, function(err, res, body) {
          fs.outputFile(server.getDatabasePath(), body, function(err){
            if(err) console.log('ERROR: ' + err.message);
            console.log(server.settings.externalSource + ' was imported successfully');
          });
        });
      } else {
        fs.copy(server.settings.externalSource, server.getDatabasePath(), function(err) {
          if(err) console.log('ERROR: ' + err.message);
          console.log(server.settings.externalSource + ' was imported successfully');
        });
      }
    });
};

Server.prototype.loadData = function (server) {
  return new Promise(function(resolve, reject){
    if(server.settings.apiStandard === 'swagger') {
      //swagger coming soon
    }else if (server.settings.apiStandard === 'json-api') {
      //json:api coming soon
    }else{
      //loading data with no standard
      server.db = low(server.getDatabasePath());
    }
    server.db._.mixin(require('underscore-db'));
    resolve(server);
  });
};


Server.prototype.loadWebServer = function(server) {
  server.web = require('express')();
  server.web.listen(server.settings.port, function() {
    console.log('listening on port ' + server.settings.port);
  });
  server.web.use(bodyParser.json()); // for parsing application/json
  server.web.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

  server.web.get(server.settings.namespace + '/', function(req,res) {
    res.send('');
  });
  server.web.get('/status', function(req,res) {
    res.json({
      status: 'active'
    });
  });
  server.web.get(server.settings.namespace + '/:resource', function(req,res) {
    var data = {};
    var filter = {};
    var sortBy = '';
    if (req.query.sortBy){
      sortBy = req.query.sortBy;
      delete req.query.sortBy;
    }
    filter = req.query;
    data = server.db(req.params.resource)
      .chain()
      .where(filter)
      .sortBy(sortBy)
      .value();
    res.json(data);
  });
  server.web.post(server.settings.namespace + '/:resource', function(req,res) {
    var data = {};
    data = server.db(req.params.resource).insert(req.body);
    res.json(data);
  });
  server.web.get(server.settings.namespace + '/:resource/:id', function(req,res) {
    var data = {};
    data[req.params.resource] = server
      .db(req.params.resource)
      .find({id: req.params.id});
    res.json(data);
  });
  server.web.put(server.settings.namespace + '/:resource', function(req,res) {
    var data = {};
    var resourceId = req.body.id;
    delete req.body.id;
    data = server.db(req.params.resource).updateById(resourceId, req.body);
    res.json(data);
  });
  server.web.put(server.settings.namespace + '/:resource/:id', function(req,res) {
    var data = {};
    data = server.db(req.params.resource).updateById(req.params.id, req.body);
    res.json(data);
  });
  server.web.patch('/:resource', function(req,res) {
    var data = {};
    var resourceId = req.body.id;
    delete req.body.id;
    data = server.db(req.params.resource).updateById(resourceId, req.body);
    res.json(data);
  });
  server.web.patch('/:resource/:id', function(req,res) {
    var data = {};
    data = server.db(req.params.resource).updateById(req.params.id, req.body);
    res.json(data);
  });
  server.web.delete(server.settings.namespace + '/:resource', function(req,res) {
    var data = {};
    var resourceId = req.body.id;
    delete req.body.id;
    data = server.db(req.params.resource).removeById(resourceId);
    res.json(data);
  });
  server.web.delete(server.settings.namespace + '/:resource/:id', function(req,res) {
    var data = {};
    data = server.db(req.params.resource).removeById(req.params.id);
    res.json(data);
  });
};

Server.prototype.loadSettings = function(cliOptions) {
  var self = this;
  var configFilepath = self.getConfigPath();
  return new Promise(function(resolve, reject) {
    fs.readJson(configFilepath, 'utf8', function(err, data){
      if (err) {
        self.settings = _.assign(self.settings, cliOptions);
        resolve(self);
      } else {
        self.settings = _.assign(self.settings, data, cliOptions);
        resolve(self);
      }
    });
  });
};

module.exports = new Server();

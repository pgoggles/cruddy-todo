const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');
var join = Promise.join;
Promise.promisifyAll(fs);
var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  var callbackFunction = function (err, counterString) {
    fs.writeFile(exports.dataDir + '/' + counterString + '.txt', text, (err) => {
      if (err) {
        throw ('error writing todo');
      } else {
        callback(null, { id: counterString, text }); /// {id: id, text: text}
      }
    });
  };
  counter.getNextUniqueId(callbackFunction);
};

exports.readAll = (callback) => {
  fs.readdirAsync(exports.dataDir).map(function(fileName) {
    var text = fs.readFileAsync(exports.dataDir + '/' + fileName, 'utf-8');
    return join(fileName, text, function(fileName, text) {
      return {
        id: fileName.replace('.txt', ''),
        text: text
      };
    });
  }).then(function(data) {
    callback(null, data);
  });

  // var data = _.map(items, (text, id) => {
  //   return { id, text };
  // });
  // callback(null, data);
};

exports.readOne = (id, callback) => {
  fs.readFile(exports.dataDir + '/' + id + '.txt', 'utf8', (err, text) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text });
    }
  });
};

exports.update = (id, text, callback) => {
  fs.access(exports.dataDir + '/' + id + '.txt', (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(exports.dataDir + '/' + id + '.txt', text, (err) => {
        if (err) {
          callback(new Error(`No item with id: ${id}`));
        } else {
          callback(null, { id, text });
        }
      });
    }
  });
};

exports.delete = (id, callback) => {
  fs.unlink(exports.dataDir + '/' + id + '.txt', (err) => {
    if (err) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback();
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');


exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};

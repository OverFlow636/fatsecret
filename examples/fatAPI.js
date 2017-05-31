'use strict';

const FatSecret = require('..');
const fatAPI = new FatSecret(process.env.FS_KEY, process.env.FS_SECRET);

console.json = function(obj) {
  console.log(JSON.stringify(obj, null, 2));
};

module.exports = fatAPI;

'use strict';

const { error } = require('console');
const conf = require('../../conf/config');
const log = require('./watchLogs');

// Test main
(async()=>{
    log.add("message 1");
    log.add("message 2");
    await log.send();
    await log.send("message 3");

})().catch((e1)=>{
  console.error(e1.message);
});
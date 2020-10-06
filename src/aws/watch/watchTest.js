'use strict';

const { error } = require('console');
const conf = require('../../conf/config');
const log = require('./watchLogs');

// Test main
(async()=>{

  log.configure({useTimestamp:true,timestampMode:log.MODE_ACTION_BASE});

    log.add("message 1");
    log.add("message 2");
    // await log.send();
    await log.send("message 3");
    log.add("message 8");
    await log.send("message 4");
    await log.send("message 4-1");
    await log.send("message 4-2");
    await log.send("message 4-3");
    log.add("message 9");
    await log.send("message 5");
    log.add("message 10");
    log.add("message 11");
    log.add("message 12");
    await log.send("message 6");

})().catch((e1)=>{
  console.error(e1.message);
  console.error(e1.stack);
});
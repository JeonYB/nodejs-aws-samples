'use strict';

const { error } = require('console');
const conf = require('../../conf/config');
const watch = require('../../util/aws-utils').watch;
let logArr = [];
let sequenceToken = null;
const logStreamName = `${new Date().getTime()}-jeonybTest`;

module.exports.add = msg => {
    logArr.push({
        message: msg,
        timestamp: new Date().getTime()
    });
}

module.exports.send = async (msg)=>{
    if(msg){
        this.add(msg);
    }
    let watchParams = {
      logEvents: logArr.slice(),
      logGroupName: conf.watch.logGroupName,
      logStreamName: logStreamName,
      sequenceToken: sequenceToken
    }
    logArr = [];
    await watch.createLogStream({logGroupName : watchParams.logGroupName, logStreamName: watchParams.logStreamName}).promise().catch(e=>{console.log("로그 스트림이 생성되어있습니다.");});
    try{
        let logRes = await watch.putLogEvents(watchParams).promise();
        sequenceToken = logRes.nextSequenceToken;
    }catch(e) {
        sequenceToken = getSeqByErrorMsg(e);
        watchParams.sequenceToken = sequenceToken;
        await watch.putLogEvents(watchParams).promise().catch( e2 => {
            console.error("logging retry 실패");
        })
    };
}

const getSeqByErrorMsg = (e) => {
    try{
        return e.message.split(":")[1].trim();
    }catch(e2){
        return null;
    }
}

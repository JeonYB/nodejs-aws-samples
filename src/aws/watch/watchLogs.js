'use strict';

const conf = require('../../conf/config');
const watch = require('../../util/aws-utils').watch;
const startTimestamp = new Date().getTime();
const logStreamName = `${new Date().getTime()}-jeonybTest`;
const MODE_START_BASE = 'START_BASE';
const MODE_ACTION_BASE = 'ACTION_BASE';

let beforeTimestamp = startTimestamp;
let logArr = [];
let sequenceToken = null;

let logConf = {
    useTimestamp : false,
    timestampMode : MODE_START_BASE/*ACTION_BASE*/
}

module.exports.configure = (confJson) => {
    if(typeof confJson != 'object'){
        console.error('Config는 Json으로 입력해야합니다.');
        return;
    } 
    logConf = Object.assign(logConf, confJson);
    console.log(JSON.stringify(logConf));
}

module.exports.add = msg => {
    let t = new Date().getTime();
    if(logConf.useTimestamp == true){
        let duration = 0;
        if(MODE_START_BASE === logConf.timestampMode){
            duration = t - startTimestamp;
        }else if(MODE_ACTION_BASE === logConf.timestampMode){
            duration = t - beforeTimestamp;
            beforeTimestamp = t;
        }   
        msg = `${msg} (${numberWithCommas(duration)}ms)`;
    }
    logArr.push({
        message: msg,
        timestamp: t
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

module.exports.MODE_START_BASE = MODE_START_BASE;
module.exports.MODE_ACTION_BASE = MODE_ACTION_BASE;

const getSeqByErrorMsg = (e) => {
    try{
        return e.message.split(":")[1].trim();
    }catch(e2){
        return null;
    }
}

const numberWithCommas = (x) =>{
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

'use strict';

const config = require('../conf/config');
const log = require('../aws/watch/watchLogs');


// aws init
const AWS = require('aws-sdk');
AWS.config.update({region: config.aws.region});

// let cred =  new AWS.SharedIniFileCredentials({profile: '{profilename}'})
// AWS.config.credentials = cred;

const sqs = new AWS.SQS();
const s3 = new AWS.S3();
const watch = new AWS.CloudWatchLogs({apiVersion: config.watch.version, region: config.aws.region});

module.exports = {
    s3 : s3,
    sqs : sqs,
    watch: watch
}


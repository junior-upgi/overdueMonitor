let fs = require('fs');
let moment = require('moment-timezone');
let httpRequest = require('request-promise');

let serverConfig = require('./serverConfig.js');

let telegramUser = require('../model/telegramUser.js');
let telegramBot = require('../model/telegramBot.js');

function alertSystemError(systemReference, functionReference, errorMessage) {
    let currentDatetime = moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    let messageHeading = httpRequest({ // broadcast alert when error encountered
        method: 'post',
        uri: serverConfig.broadcastAPIUrl,
        form: {
            chat_id: telegramUser.getUserID('蔡佳佑'),
            text: `error encountered while executing [${systemReference}][${functionReference}] @ ${currentDatetime}`,
            token: telegramBot.getToken('upgiITBot')
        }
    });
    let messageBody = httpRequest({
        method: 'post',
        uri: serverConfig.broadcastAPIUrl,
        form: {
            chat_id: telegramUser.getUserID('蔡佳佑'),
            text: `${errorMessage}`,
            token: telegramBot.getToken('upgiITBot')
        }
    });
    messageHeading().then(function() {
        return messageBody();
    }).then(function() {
        return console.log('error message had been alerted');
    }).catch(function(error) {
        return console.log(error);
    });
}

function fileRemoval(completeFilePath, callback) {
    console.log(completeFilePath);
    fs.unlink(completeFilePath, function(error) {
        if (error !== null) {
            console.log('file removal failure (may not be critical failure): ' + error);
            return false;
        } else {
            console.log(completeFilePath + ' removed successfully');
            if (callback === undefined) {
                return true;
            } else {
                callback();
            }
        }
    });
}

function uuidGenerator() {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

module.exports = {
    alertSystemError: alertSystemError,
    fileRemoval: fileRemoval,
    uuidGenerator: uuidGenerator
};

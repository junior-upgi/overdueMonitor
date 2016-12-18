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

module.exports = {
    alertSystemError
};

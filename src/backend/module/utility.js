const cron = require('node-cron');
// const CronJob = require('cron').CronJob;
const fs = require('fs');
const moment = require('moment-timezone');
const mssql = require('mssql');
const httpRequest = require('request-promise');
const winston = require('winston');

const serverConfig = require('./serverConfig.js');

const telegramUser = require('../model/telegramUser.js');
const telegramBot = require('../model/telegramBot.js');

// Create the log directory if it does not exist
if (!fs.existsSync(serverConfig.logDir)) {
    fs.mkdirSync(serverConfig.logDir);
}
const logger = new(winston.Logger)({
    transports: [
        // colorize the output to the console
        new(winston.transports.Console)({
            timestamp: function() {
                return moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            },
            colorize: true,
            level: 'debug'
        }),
        new(winston.transports.File)({
            filename: `${serverConfig.logDir}/results.log`,
            timestamp: function() {
                return moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
            },
            level: serverConfig.development ? 'debug' : 'info'
        })
    ]
});

function executeQuery(queryString, callback) {
    logger.info(`${serverConfig.systemReference} database access function triggered`);
    logger.info(`query: ${queryString}`);
    let mssqlConnection = new mssql.Connection(serverConfig.mssqlConfig);
    mssqlConnection.connect()
        .then(function() {
            let mssqlRequest = new mssql.Request(mssqlConnection);
            mssqlRequest.query(queryString)
                .then(function(recordset) {
                    mssqlConnection.close();
                    logger.info(`${serverConfig.systemReference} database access completed`);
                    return callback(recordset);
                })
                .catch(function(error) {
                    logger.error(`${serverConfig.systemReference} database access failure: ${error}`);
                    alertSystemError('database query', error);
                    return callback(null, error);
                });
        })
        .catch(function(error) {
            logger.error(`${serverConfig.systemReference} database connection failure: ${error}`);
            alertSystemError('database connection', error);
            return callback(null, error);
        });
}

let statusReport = cron.schedule('0 0 8,22 * * *', function() {
    // let statusReport = new CronJob('0 0 8,22 * * *', function() {
    logger.info(`${serverConfig.systemReference} reporting mechanism triggered`);
    let issuedDatetime = moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    let message = `${issuedDatetime} ${serverConfig.systemReference} server reporting in`;
    httpRequest({
        method: 'post',
        uri: serverConfig.botAPIUrl + telegramBot.getToken('upgiItBot') + '/sendMessage',
        body: {
            chat_id: telegramUser.getUserID('資訊課統義玻璃'),
            text: `${message}`,
            token: telegramBot.getToken('upgiItBot')
        },
        json: true
    }).then(function(response) {
        logger.verbose(`${message}`);
        return logger.info(`${serverConfig.systemReference} reporting mechanism completed`);
    }).catch(function(error) {
        alertSystemError('statusReport', error);
        return logger.error(`${serverConfig.systemReference} reporting mechanism failure ${error}`);
    });
    // }, null, false, serverConfig.workingTimezone);
}, false);

function alertSystemError(functionRef, message) {
    let currentDatetime = moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    httpRequest({ // broadcast alert when error encountered
        method: 'post',
        uri: serverConfig.botAPIUrl + telegramBot.getToken('upgiItBot') + '/sendMessage',
        body: {
            chat_id: telegramUser.getUserID('資訊課統義玻璃'),
            text: `error encountered while executing [${serverConfig.systemReference}][${functionRef}] @ ${currentDatetime}`,
            token: telegramBot.getToken('upgiItBot')
        },
        json: true
    }).then(function(response) {
        httpRequest({
            method: 'post',
            uri: serverConfig.botAPIUrl + telegramBot.getToken('upgiItBot') + '/sendMessage',
            form: {
                chat_id: telegramUser.getUserID('資訊課統義玻璃'),
                text: `error message: ${message}`,
                token: telegramBot.getToken('upgiItBot')
            }
        }).then(function(response) {
            return logger.info(`${serverConfig.systemReference} ${functionRef} alert sent`);
        }).catch(function(error) {
            return logger.error(`${serverConfig.systemReference} ${functionRef} failure: ${error}`);
        });
    }).catch(function(error) {
        return logger.error(`${serverConfig.systemReference} ${functionRef} failure: ${error}`);
    });
}

function fileRemoval(completeFilePath, callback) {
    fs.unlink(completeFilePath, function(error) {
        if (error !== null) {
            logger.error('file removal failure (may not be critical failure): ' + error);
            return false;
        } else {
            logger.info(completeFilePath + ' removed successfully');
            if (callback === undefined) {
                return true;
            } else {
                callback();
            }
        }
    });
}

function sendMessage(recipientIDList, messageList) {
    recipientIDList.forEach(function(recipientID) {
        messageList.forEach(function(message) {
            httpRequest({
                method: 'post',
                uri: serverConfig.botAPIUrl + telegramBot.getToken('upgiItBot') + '/sendMessage',
                form: {
                    chat_id: recipientID,
                    text: message,
                    token: telegramBot.getToken('upgiItBot')
                }
            }).then(function(response) {
                logger.info(`message sent to ${telegramUser.getUserName(parseInt(recipientID))}`);
            }).catch(function(error) {
                logger.error(`messaging failure for ${message} ${telegramUser.getUserName(parseInt(recipientID))}`);
            });
        });
    });
    return;
}

module.exports = {
    alertSystemError: alertSystemError,
    sendMessage: sendMessage,
    executeQuery: executeQuery,
    fileRemoval: fileRemoval,
    logger: logger,
    statusReport: statusReport
};

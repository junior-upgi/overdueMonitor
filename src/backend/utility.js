import fs from 'fs';
import moment from 'moment-timezone';
import cron from 'node-cron';
import nodemailer from 'nodemailer';
import os from 'os';
import httpRequest from 'request-promise';
import winston from 'winston';
import xlsx from 'xlsx';

import { administrator, development, logDir, smtpTransportAccount, systemReference } from './serverConfig.js';
import { botApiUrl, getBotToken } from './model/telegram.js';
// logging utility
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) { fs.mkdirSync(logDir); }
export const logger = new(winston.Logger)({
    transports: [
        // colorize the output to the console
        new(winston.transports.Console)({
            timestamp: currentDatetimeString(),
            colorize: true,
            level: 'debug'
        }),
        new(winston.transports.File)({
            filename: `${logDir}/results.log`,
            timestamp: currentDatetimeString(),
            level: development ? 'debug' : 'info'
        })
    ]
});

// status report utility
export const statusReport = cron.schedule('0 0 8,22 * * *', () => {
    logger.info(`${systemReference} reporting mechanism triggered`);
    const issuedDatetime = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
    const message = `${issuedDatetime} ${systemReference} server reporting in from ${os.hostname()}`;
    httpRequest({
        method: 'post',
        uri: botApiUrl + getBotToken('upgiITBot') + '/sendMessage',
        body: {
            chat_id: administrator,
            text: `${message}`,
            token: getBotToken('upgiITBot')
        },
        json: true
    }).then((response) => {
        logger.verbose(`${message}`);
        return logger.info(`${systemReference} reporting mechanism completed`);
    }).catch((error) => {
        alertSystemError('statusReport', error);
        return logger.error(`${systemReference} reporting mechanism failure ${error}`);
    });
}, false);

// telegram messaging utility
export function alertSystemError(functionRef, message) {
    httpRequest({ // broadcast alert heading
        method: 'post',
        uri: botApiUrl + getBotToken('upgiITBot') + '/sendMessage',
        body: {
            chat_id: administrator,
            text: `error encountered while executing [${systemReference}][${functionRef}] @ ${currentDatetimeString()}`,
            token: getBotToken('upgiITBot')
        },
        json: true
    }).then((response) => {
        return httpRequest({ // broadcast alert body message
            method: 'post',
            uri: botApiUrl + getBotToken('upgiITBot') + '/sendMessage',
            form: {
                chat_id: administrator,
                text: `error message: ${message}`,
                token: getBotToken('upgiITBot')
            }
        });
    }).then((response) => {
        return logger.info(`${systemReference} alert sent`);
    }).catch((error) => {
        return logger.error(`${systemReference} failure: ${error}`);
    });
}

export function endpointErrorHandler(method, originalUrl, errorMessage) {
    const errorString = `${method} ${originalUrl} route failure: ${errorMessage}`;
    logger.error(errorString);
    logger.info(alertSystemError(`${method} ${originalUrl} route`, errorString));
    return {
        errorMessage: errorString
    };
}

// date and time utility
export function currentDatetimeString() { return moment(new Date()).format('YYYY-MM-DD HH:mm:ss'); }
export function currentYear() { return new Date().getFullYear(); }
export function currentMonth() { return new Date().getMonth(); }
export function currentDateString() { return moment(new Date()).format('YYYY-MM-DD'); }
export function firstDateStringOfCurrentMonth() { return moment(new Date(currentYear(), currentMonth(), 1)).format('YYYY-MM-DD'); }
export function lastDateStringOfCurrentMonth() { return moment(new Date(currentYear(), currentMonth() + 1, 1)).subtract(1, 'day').format('YYYY-MM-DD'); }

// email utility
const smtpTransport = nodemailer.createTransport(smtpTransportAccount);
export function sendEmail(senderString, recipientList, subject, emailBody, attachmentList) {
    const mailOption = {
        from: subject,
        to: recipientList.join(),
        subject: subject,
        text: emailBody,
        attachments: attachmentList
    };
    return new Promise((resolve, reject) => {
        smtpTransport.sendMail(mailOption, function(error, info) {
            if (error) {
                reject('failed to send message: ' + error);
            } else {
                resolve('email(s) sent successfully: ' + info.response);
            }
        });
    });
}

// sheet.js excel utility functions
function Workbook() {
    if (!(this instanceof Workbook)) return new Workbook();
    this.SheetNames = [];
    this.Sheets = {};
}

function datenum(v, date1904) {
    if (date1904) v += 1462;
    let epoch = Date.parse(v);
    return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function insertWorksheetData(data, opts) {
    let ws = {};
    let range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
    for (let R = 0; R !== data.length; ++R) {
        for (let C = 0; C !== data[R].length; ++C) {
            if (range.s.r > R) range.s.r = R;
            if (range.s.c > C) range.s.c = C;
            if (range.e.r < R) range.e.r = R;
            if (range.e.c < C) range.e.c = C;
            let cell = { v: data[R][C] };
            if (cell.v === null) continue;
            let cell_ref = xlsx.utils.encode_cell({ c: C, r: R });

            if (typeof cell.v === 'number') cell.t = 'n';
            else if (typeof cell.v === 'boolean') cell.t = 'b';
            else if (cell.v instanceof Date) {
                cell.t = 'n';
                cell.z = xlsx.SSF._table[14];
                cell.v = datenum(cell.v);
            } else cell.t = 's';

            ws[cell_ref] = cell;
        }
    }
    if (range.s.c < 10000000) ws['!ref'] = xlsx.utils.encode_range(range);
    return ws;
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! UNTESTED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// worksheetDataList is an array holding objects with the following attributes
// worksheetDataList[n].titleColumnArray - array of strings to be used as first row before the actual data
// worksheetDataList[n].dataObject - array of object that should all have the same number of attributes to .titleColumArray.length
// worksheetDataList[n].worksheetName - string holding the name fore the worksheet
export function createExcelFile(worksheetDataList, fullDestinationPath) {
    let workbook = new Workbook(); // create an workbook object
    worksheetDataList.forEach((worksheet) => { // cycle through each worksheet and create them before placing in the workbook
        let worksheetDataContainer = []; // array to hold rows of excel data
        worksheetDataContainer.push(worksheet.titleColumnArray); // push the title column into the worksheetDataContainer
        worksheet.dataObject.forEach((dataRow) => { // convert data object into arrays of array (individual rows of data)
            let rowArray = []; // temp array to hold the current indexed object's data
            for (let indexedAttrib in dataRow) { // loop through object's individual attributes
                rowArray.push(dataRow[indexedAttrib]); // push the indexed attrib value onto the temp array
            }
            worksheetDataContainer.push(rowArray); // push an array(row of data) into the container
        });
        let worksheetName = worksheet.worksheetName; // indicate the name of the current worksheet that's being created
        workbook.SheetNames.push(worksheetName); // create the worksheet and supplying a name to it
        workbook.Sheets[worksheetName] = insertWorksheetData(worksheetDataContainer); // insert the worksheet data into the workbook
    });
    xlsx.writeFile(workbook, fullDestinationPath); // write a physical file onto the disk
}

/*
function sendMobileMessage(recipientIDList, messageList, botName) {
    recipientIDList.forEach((recipientID) => {
        messageList.forEach((message) => {
            httpRequest({
                method: 'post',
                uri: serverConfig.botAPIUrl + telegram.getBotToken(botName) + '/sendMessage',
                form: {
                    chat_id: recipientID,
                    text: message,
                    token: telegram.getBotToken(botName)
                }
            }).then((response) => {
                logger.info('message sent');
            }).catch((error) => {
                logger.error(`messaging failure: ${error}`);
            });
        });
    });
    return;
}

function firstOfMonthString(year, month) {
    return moment(new Date(year, month - 1, 1), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
}

function todayDateString() {
    return moment(new Date(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
}

module.exports = {
    alertSystemError: alertSystemError,
    endpointErrorHandler: endpointErrorHandler,
    logger: logger,
    sendMobileMessage: sendMobileMessage,
    statusReport: statusReport,
    // date and time utility
    currentDatetimeString: currentDatetimeString,
    firstOfMonthString: firstOfMonthString,
    todayDateString: todayDateString
};
*/

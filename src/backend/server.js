const cors = require('cors');
const CronJob = require('cron').CronJob;
const express = require('express');
const moment = require('moment-timezone');
// const morgan = require('morgan');
const httpRequest = require('request-promise');
const favicon = require('serve-favicon');

const serverConfig = require('./module/serverConfig.js');
const utility = require('./module/utility.js');

const queryString = require('./model/queryString.js');
const upgiSystem = require('./model/upgiSystem.js');
const telegramUser = require('./model/telegramUser.js');
const telegramBot = require('./model/telegramBot.js');

let app = express();
app.use(cors());
// app.use(morgan('dev'));

// app.use(favicon(__dirname + '/../src/frontend/upgiLogo.png')); // middleware to serve favicon
app.use(favicon(__dirname + '/../public/upgiLogo.png')); // middleware to serve favicon
app.use('/overdueMonitor', express.static('./public')); // serve static files
app.use('/overdueMonitor/bower_components', express.static('./bower_components')); // serve static files

app.get('/status', function(request, response) {
    return response.status(200).json({
        system: serverConfig.systemReference,
        status: 'online',
        timestamp: moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss')
    });
});

app.get('/overdueMonitor/overview', function(request, response) {
    utility.executeQuery(queryString.overview, function(overviewData, error) {
        if (error) {
            utility.logger.error(`/overdueMonitor/overview route error: ${error}`);
            return response.status(500).send([{}]);
        } else {
            return response.status(200).json(overviewData);
        }
    });
});

app.get('/overdueMonitor/annualReportSummary', function(request, response) {
    utility.executeQuery(queryString.annualReportSummary,
        function(annualReportSummaryData, error) {
            if (error) {
                utility.logger.error(`/overdueMonitor/annualReportSummary route error: ${error}`);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(annualReportSummaryData);
            }
        });
});

app.get('/overdueMonitor/warning_NewOverdue', function(request, response) {
    utility.executeQuery(queryString.warning_NewOverdue,
        function(warning_NewOverdueData, error) {
            if (error) {
                utility.logger.error(`/overdueMonitor/warning_NewOverdue route error: ${error}`);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_NewOverdueData);
            }
        });
});

app.get('/overdueMonitor/warning_OneWeek', function(request, response) {
    utility.executeQuery(queryString.warning_OneWeek,
        function(warning_OneWeekData, error) {
            if (error) {
                utility.logger.error(`/overdueMonitor/warning_OneWeek route error: ${error}`);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_OneWeekData);
            }
        });
});

app.get('/overdueMonitor/warning_TwoWeek', function(request, response) {
    utility.executeQuery(queryString.warning_TwoWeek,
        function(warning_TwoWeekData, error) {
            if (error) {
                utility.logger.error(`/overdueMonitor/warning_TwoWeek route error: ${error}`);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_TwoWeekData);
            }
        });
});

app.get('/overdueMonitor/warning_PastWeekOverdue', function(request, response) {
    utility.executeQuery(queryString.warning_PastWeekOverdue,
        function(warning_PastWeekOverdueData, error) {
            if (error) {
                utility.logger.error(`/overdueMonitor/warning_PastWeekOverdue route error: ${error}`);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_PastWeekOverdueData);
            }
        });
});

app.get('/overdueMonitor/warning_ProlongedOverdue', function(request, response) {
    utility.executeQuery(queryString.warning_ProlongedOverdue,
        function(warning_ProlongedOverdueData, error) {
            if (error) {
                utility.logger.error(`/overdueMonitor/warning_ProlongedOverdue route error: ${error}`);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_ProlongedOverdueData);
            }
        });
});

app.listen(serverConfig.serverPort, function(error) { // start backend server
    if (error) {
        utility.logger.error(`error starting ${serverConfig.systemReference} server: ${error}`);
    } else {
        utility.logger.info(`${serverConfig.systemReference} server in operation... (${serverConfig.serverUrl})`);
    }
});

utility.statusReport.start(); // start the server status reporting function

// record cash flow information periodically
let captureCashFlowSnapshot = new CronJob(upgiSystem.list[1].jobList[4].schedule, function() { // perform everyday at 17:00
    utility.logger.info(`proceeding with scheduled [${upgiSystem.list[1].jobList[4].reference}]`);
    utility.executeQuery(queryString.overview, function(recordset, error) {
        if (error) {
            return utility.alertSystemError(upgiSystem.list[1].jobList[4].reference,
                'error encountered while executing scheduled captureCashFlowSnapshot function: ' + error);
        }
        utility.executeQuery(queryString.cashFlowSnapshotInsertQuery(
            recordset[0].AMTN_PENDING,
            recordset[0].AMTN_OVERDUE,
            recordset[0].AMTN_DEPOSIT
        ), function(recordset, error) {
            if (error) {
                return utility.alertSystemError(upgiSystem.list[1].jobList[4].reference,
                    'error encountered while executing cashFlowSnapshotInsertQuery: ' + error);
            }
            utility.sendMessage([telegramUser.getUserID('蔡佳佑')], ['captureCashFlowSnapshot completed successfully...']);
            return utility.logger.info('captureCashFlowSnapshot completed successfully...');
        });
    });
}, null, false, serverConfig.workingTimezone);
captureCashFlowSnapshot.start();

// overdue alert and warning cron jobs
let newOverdueMonitorJob = upgiSystem.list[1].jobList[0];
let recentOverdueMonitorJob = upgiSystem.list[1].jobList[1];
let oneWeekWarningMonitorJob = upgiSystem.list[1].jobList[2];
let twoWeekWarningMonitorJob = upgiSystem.list[1].jobList[3];
let newOverdueMonitorTask =
    new CronJob(
        newOverdueMonitorJob.schedule,
        function() {
            broadcastMonitorResult(newOverdueMonitorJob, '【新增逾期款項】', queryString.warning_NewOverdue);
        },
        null, false, serverConfig.workingTimezone);
let recentOverdueMonitorTask =
    new CronJob(
        recentOverdueMonitorJob.schedule,
        function() {
            broadcastMonitorResult(recentOverdueMonitorJob, '【近期逾期款項目】', queryString.warning_PastWeekOverdue);
        },
        null, false, serverConfig.workingTimezone);
let oneWeekWarningMonitorTask =
    new CronJob(
        oneWeekWarningMonitorJob.schedule,
        function() {
            broadcastMonitorResult(oneWeekWarningMonitorJob, '【本週即將逾期項目】', queryString.warning_OneWeek);
        },
        null, false, serverConfig.workingTimezone);
let twoWeekWarningMonitorTask =
    new CronJob(
        twoWeekWarningMonitorJob.schedule,
        function() {
            broadcastMonitorResult(twoWeekWarningMonitorJob, '【兩週內即將逾期項目】', queryString.warning_TwoWeek);
        },
        null, false, serverConfig.workingTimezone);
newOverdueMonitorTask.start();
recentOverdueMonitorTask.start();
oneWeekWarningMonitorTask.start();
twoWeekWarningMonitorTask.start();

// template function to execute scheduled cron alert and warning jobs
function broadcastMonitorResult(monitoredJob, groupMessageTitle, jobSQLScript) {
    utility.logger.info(`${monitoredJob.reference} cronjob triggered`);
    let individualMessage = {}; // list to hold a list of broadcast recipients
    let groupMessage = groupMessageTitle; // string to hold group message
    if (monitoredJob.online === true) { // only execute the cron job if the 'online' property is true
        utility.logger.info(`proceeding with scheduled [${monitoredJob.reference}]`);
        // query the database for designated overdue related data
        utility.executeQuery(jobSQLScript, function(recordset, error) {
            if (error) {
                utility.alertSystemError(monitoredJob.id, error);
                return utility.logger.error(`${monitoredJob.reference} cronjob data access failure ${error}`);
            }
            if (recordset.length > 0) { // if query yields data
                utility.logger.info(`${recordset.length} record(s) to process`);
                // loop through each data record and prepare group and individual message
                recordset.forEach(function(record) {
                    groupMessage += '\n' + record.content;
                    if (individualMessage[telegramUser.getUserID(record.SAL_NAME)] === undefined) {
                        individualMessage[telegramUser.getUserID(record.SAL_NAME)] = `${monitoredJob.reference}致${record.SAL_NAME}\n${record.content}`;
                    } else {
                        individualMessage[telegramUser.getUserID(record.SAL_NAME)] += `\n${record.content}`;
                    }
                });
                // broadcast messages for individuals
                for (let salesErpID in individualMessage) {
                    // add additional broadcast targets from upgiSystem (if specified)
                    let broadcastTargetIDList = [parseInt(salesErpID)].concat(monitoredJob.targetUserIDList);
                    // loop through each broadcast target and make the broadcast request
                    broadcastTargetIDList.forEach(function(broadcastTargetID) {
                        httpRequest({
                            method: 'post',
                            uri: serverConfig.broadcastServerUrl,
                            form: {
                                chat_id: broadcastTargetID,
                                text: individualMessage[salesErpID],
                                token: telegramBot.getToken('overdueMonitorBot')
                            }
                        }).then(function(response) {
                            utility.logger.info('individual message for ${telegramUser.getUserName(broadcastTargetID)} had been sent to the broadcast server');
                        }).catch(function(error) {
                            utility.alertSystemError(monitoredJob.id, error);
                            utility.logger.error(`${monitoredJob.reference} broadcasting cronjob for ${telegramUser.getUserName(broadcastTargetID)} concluded with error`);
                            utility.logger.error(error);
                        });
                    });
                }
                // broadcast messages to sales group
                if (monitoredJob.broadcast === true) { // only broadcast if the 'broadcast' property is true
                    monitoredJob.targetGroupIDList.forEach(function(targetGroupID) {
                        httpRequest({ // broadcast group message
                            method: 'post',
                            uri: serverConfig.broadcastServerUrl,
                            form: {
                                chat_id: targetGroupID,
                                text: groupMessage,
                                token: telegramBot.getToken('overdueMonitorBot')
                            }
                        }).then(function(response) {
                            utility.logger.info('group message sent to broadcast server');
                            return utility.logger.info(`${monitoredJob.reference} broadcasting cronjob completed`);
                        }).catch(function(error) {
                            utility.alertSystemError(monitoredJob.id, error);
                            utility.logger.error(`${monitoredJob.reference} broadcasting cronjob concluded with error`);
                            return utility.logger.error(error);
                        });
                    });
                }
            } else { // query did not yield any data
                if (monitoredJob.broadcast === true) { // only broadcast if the 'broadcast' property is true
                    monitoredJob.targetGroupIDList.forEach(function(targetGroupID) {
                        httpRequest({ // broadcast group message
                            method: 'post',
                            uri: serverConfig.broadcastServerUrl,
                            form: {
                                chat_id: targetGroupID,
                                text: `${monitoredJob.reference} 目前無相關資料`,
                                token: telegramBot.getToken('overdueMonitorBot')
                            }
                        }).then(function() {
                            utility.logger.info('message sent to broadcast server');
                            utility.logger.info(`${monitoredJob.reference} cronjob - no data to broadcast`);
                            return utility.logger.info(`${monitoredJob.reference} broadcasting cronjob completed`);
                        }).catch(function(error) {
                            utility.alertSystemError(monitoredJob.id, error);
                            utility.logger.error(`${monitoredJob.reference} broadcasting cronjob concluded with error`);
                            return utility.logger.error(error);
                        });
                    });
                }
            }
        });
    }
}

// reminder to each sales to look at the customized overview page
let notifyCustomOverviewPage = new CronJob('0 5 9 * * *', function() {
    utility.executeQuery('SELECT * FROM overdueMonitor.dbo.activeSalesStaffDetail;', function(recordset, error) {
        if (error) {
            utility.logger.error(error);
        }
        if (recordset.length > 0) {
            recordset.forEach(function(record) {
                let message = '';
                if (record.principle === 1) {
                    message = `<a href="${serverConfig.publicServerUrl}/overdueMonitor/mobileReport.html">${record.first_name} 請點選此訊息連結查看業務整體逾期帳款現況</a>`;
                } else {
                    message = `<a href="${serverConfig.publicServerUrl}/overdueMonitor/mobileReport.html?SAL_NO=${record.erpID}">${record.first_name} 請點選此訊息連結查看個人業務逾期帳款現況</a>`;
                }
                httpRequest({
                    method: 'post',
                    uri: serverConfig.broadcastServerUrl,
                    form: {
                        chat_id: record.telegramID,
                        text: message,
                        token: telegramBot.getToken('overdueMonitorBot')
                    }
                }).then(function(response) {
                    utility.logger.info(`custom page notification sent to ${record.full_name}`);
                }).catch(function(error) {
                    utility.alertSystemError(notifyCustomOverviewPage, 'error');
                });
            });
        } else {
            return;
        }
        return;
    });
}, null, false, serverConfig.workingTimezone);
notifyCustomOverviewPage.start();

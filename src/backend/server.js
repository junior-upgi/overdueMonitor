let cors = require('cors');
let CronJob = require('cron').CronJob;
let express = require('express');
let moment = require('moment-timezone');
let morgan = require('morgan');
let httpRequest = require('request-promise');
let favicon = require('serve-favicon');

let database = require('./module/database.js');
let serverConfig = require('./module/serverConfig.js');
let utility = require('./module/utility.js');

let queryString = require('./model/queryString.js');
let upgiSystem = require('./model/upgiSystem.js');
let telegramUser = require('./model/telegramUser.js');
let telegramBot = require('./model/telegramBot.js');

let app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(favicon('./public/upgiLogo.png'));
app.use('/overdueMonitor', express.static('./public')); // serve static files

app.get('/status', function(request, response) {
    return response.status(200).json({
        status: 'online'
    });
});

app.get('/overdueMonitor/overview', function(request, response) {
    database.executeQuery(queryString.overview, function(overviewData, error) {
        if (error) {
            console.log(error);
            return response.status(500).send([{}]);
        } else {
            return response.status(200).json(overviewData);
        }
    });
});

app.get('/overdueMonitor/annualReportSummary', function(request, response) {
    database.executeQuery(queryString.annualReportSummary,
        function(annualReportSummaryData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(annualReportSummaryData);
            }
        });
});

app.get('/overdueMonitor/warning_NewOverdue', function(request, response) {
    database.executeQuery(queryString.warning_NewOverdue,
        function(warning_NewOverdueData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_NewOverdueData);
            }
        });
});

app.get('/overdueMonitor/warning_OneWeek', function(request, response) {
    database.executeQuery(queryString.warning_OneWeek,
        function(warning_OneWeekData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_OneWeekData);
            }
        });
});

app.get('/overdueMonitor/warning_TwoWeek', function(request, response) {
    database.executeQuery(queryString.warning_TwoWeek,
        function(warning_TwoWeekData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_TwoWeekData);
            }
        });
});

app.get('/overdueMonitor/warning_PastWeekOverdue', function(request, response) {
    database.executeQuery(queryString.warning_PastWeekOverdue,
        function(warning_PastWeekOverdueData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_PastWeekOverdueData);
            }
        });
});

app.get('/overdueMonitor/warning_ProlongedOverdue', function(request, response) {
    database.executeQuery(queryString.warning_ProlongedOverdue,
        function(warning_ProlongedOverdueData, error) {
            if (error) {
                console.log(error);
                return response.status(500).send([{}]);
            } else {
                return response.status(200).json(warning_ProlongedOverdueData);
            }
        });
});

app.listen(serverConfig.serverPort, function(error) {
    if (error) {
        console.error(error);
    } else {
        console.log('overdueMonitor server running on... (' + serverConfig.serverUrl + ')');
    }
});

// record cash flow information periodically
let captureCashFlowSnapshot = new CronJob(upgiSystem.list[1].jobList[4].schedule, function() { // perform everyday at 17:00
    let currentDatetime = moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    console.log(`
${currentDatetime} proceeding with scheduled [${upgiSystem.list[1].jobList[4].reference}]`);
    database.executeQuery(queryString.overview, function(recordset, error) {
        if (error) {
            return utility.alertSystemError(upgiSystem.list[1].id,
                upgiSystem.list[1].jobList[4].reference,
                'error encountered while executing scheduled captureCashFlowSnapshot function: ' + error);
        }
        database.executeQuery(queryString.cashFlowSnapshotInsertQuery(
            recordset[0].AMTN_PENDING,
            recordset[0].AMTN_OVERDUE,
            recordset[0].AMTN_DEPOSIT
        ), function(recordset, error) {
            if (error) {
                return utility.alertSystemError(upgiSystem.list[1].id,
                    upgiSystem.list[1].jobList[4].reference,
                    'error encountered while executing cashFlowSnapshotInsertQuery: ' + error);
            }
            return console.log('captureCashFlowSnapshot completed successfully...');
        });
    });
}, null, true, serverConfig.workingTimezone);
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
        null, true, serverConfig.workingTimezone);
let recentOverdueMonitorTask =
    new CronJob(
        recentOverdueMonitorJob.schedule,
        function() {
            broadcastMonitorResult(recentOverdueMonitorJob, '【近期逾期款項目】', queryString.warning_PastWeekOverdue);
        },
        null, true, serverConfig.workingTimezone);
let oneWeekWarningMonitorTask =
    new CronJob(
        oneWeekWarningMonitorJob.schedule,
        function() {
            broadcastMonitorResult(oneWeekWarningMonitorJob, '【本週即將逾期項目】', queryString.warning_OneWeek);
        },
        null, true, serverConfig.workingTimezone);
let twoWeekWarningMonitorTask =
    new CronJob(
        twoWeekWarningMonitorJob.schedule,
        function() {
            broadcastMonitorResult(twoWeekWarningMonitorJob, '【兩週內即將逾期項目】', queryString.warning_TwoWeek);
        },
        null, true, serverConfig.workingTimezone);
newOverdueMonitorTask.start();
recentOverdueMonitorTask.start();
oneWeekWarningMonitorTask.start();
twoWeekWarningMonitorTask.start();

// template function to execute scheduled cron alert and warning jobs
function broadcastMonitorResult(monitoredJob, groupMessageTitle, jobSQLScript) {
    let broadcastTargetIDList = []; // list to hold a list of broadcast recipients
    let groupMessage = groupMessageTitle; // string to hold group message
    if (monitoredJob.online === true) { // only execute the cron job if the 'online' property is true
        let currentDatetime = moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
        console.log(`${currentDatetime} proceeding with scheduled [${monitoredJob.reference}]`);
        // query the database for designated overdue related data
        database.executeQuery(jobSQLScript, function(recordset, error) {
            if (error) {
                return utility.alertSystemError(upgiSystem.list[1].id, monitoredJob.id, error);
            }
            if (recordset.length > 0) {
                recordset.forEach(function(record) { // loop through each record in the list
                    groupMessage += '\n' + record.content;
                    broadcastTargetIDList = monitoredJob.targetUserIDList.slice(); // reinitialize
                    broadcastTargetIDList.push(telegramUser.getUserID(record.SAL_NAME)); // add staff that came up in the current record
                    if (monitoredJob.broadcast === true) { // only broadcast if the 'broadcast' property is true
                        broadcastTargetIDList.forEach(function(broadcastTargetID) { // loop through broadcastTargetIDList and broadcast
                            httpRequest({ // broadcast individual message
                                method: 'post',
                                uri: serverConfig.broadcastAPIUrl,
                                form: {
                                    chat_id: broadcastTargetID,
                                    text: record.verboseMessage,
                                    token: telegramBot.getToken('overdueMonitorBot')
                                }
                            }).catch(function(error) {
                                console.log(error);
                                utility.alertSystemError(upgiSystem.list[1].id, monitoredJob.id, error);
                            });
                        });
                    }
                });
                if (monitoredJob.broadcast === true) { // only broadcast if the 'broadcast' property is true
                    monitoredJob.targetGroupIDList.forEach(function(targetGroupID) {
                        httpRequest({ // broadcast group message
                            method: 'post',
                            uri: serverConfig.broadcastAPIUrl,
                            form: {
                                chat_id: targetGroupID,
                                text: groupMessage,
                                token: telegramBot.getToken('overdueMonitorBot')
                            }
                        }).catch(function(error) {
                            console.log(error);
                            utility.alertSystemError(upgiSystem.list[1].id, monitoredJob.id, error);
                        });
                    });
                }
            } else {
                if (monitoredJob.broadcast === true) { // only broadcast if the 'broadcast' property is true
                    monitoredJob.targetGroupIDList.forEach(function(targetGroupID) {
                        httpRequest({ // broadcast group message
                            method: 'post',
                            uri: serverConfig.broadcastAPIUrl,
                            form: {
                                chat_id: targetGroupID,
                                text: '【昨日無新增逾期款項】',
                                token: telegramBot.getToken('overdueMonitorBot')
                            }
                        }).catch(function(error) {
                            console.log(error);
                            utility.alertSystemError(upgiSystem.list[1].id, monitoredJob.id, error);
                        });
                    });
                }
            }
        });
    }
}

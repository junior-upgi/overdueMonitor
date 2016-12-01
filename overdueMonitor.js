"use strict";

var moment = require("moment-timezone");
var CronJob = require("cron").CronJob;
var httpRequest = require("request-promise");

var config = require("./config.js");
var database = require("./module/database.js");
var queryString = require("./model/queryString.js");
var telegramBot = require("./model/telegramBot.js");
var telegramChat = require("./model/telegramChat.js");
var telegramUser = require("./model/telegramUser.js");
var upgiSystem = require("./model/upgiSystem.js");

var captureCashFlowSnapshot = new CronJob("0 * * * * *", function() {
    database.executeQuery(queryString.overviewQuery, function(recordset, error) {
        if (error) {
            httpRequest({ // broadcast alert when error encountered
                method: "post",
                uri: config.broadcastAPIUrl,
                form: {
                    chat_id: telegramUser.getUserID("蔡佳佑"),
                    text: "error encountered while executing scheduled 'captureCashFlowSnapshot' function: " + error,
                    token: telegramBot.getToken("overdueMonitorBot")
                }
            }).catch(function(error) {
                return console.log(error);
            });
            return console.log("error encountered while executing scheduled 'captureCashFlowSnapshot' function: " + error);
        }
        return console.log(recordset[0]);
    });
}, null, true, config.workingTimezone);
captureCashFlowSnapshot.start();

var newOverdueMonitorJob = upgiSystem.list[1].jobList[0];
var recentOverdueMonitorJob = upgiSystem.list[1].jobList[1];
var oneWeekWarningMonitorJob = upgiSystem.list[1].jobList[2];
var twoWeekWarningMonitorJob = upgiSystem.list[1].jobList[3];
var newOverdueMonitorTask =
    new CronJob(
        newOverdueMonitorJob.schedule,
        function() {
            broadcastMonitorResult(newOverdueMonitorJob, "【新增逾期款項】", queryString.newOverdueAlarmQuery)
        },
        null, true, config.workingTimezone);
var recentOverdueMonitorTask =
    new CronJob(
        recentOverdueMonitorJob.schedule,
        function() {
            broadcastMonitorResult(recentOverdueMonitorJob, "【近期逾期款項目】", queryString.pastWeekOverdueAlarmQuery)
        },
        null, true, config.workingTimezone);
var oneWeekWarningMonitorTask =
    new CronJob(
        oneWeekWarningMonitorJob.schedule,
        function() {
            broadcastMonitorResult(oneWeekWarningMonitorJob, "【本週即將逾期項目】", queryString.oneWeekWarningQuery)
        },
        null, true, config.workingTimezone);
var twoWeekWarningMonitorTask =
    new CronJob(
        twoWeekWarningMonitorJob.schedule,
        function() {
            broadcastMonitorResult(twoWeekWarningMonitorJob, "【兩週內即將逾期項目】", queryString.twoWeekWarningQuery);
        },
        null, true, config.workingTimezone);
newOverdueMonitorTask.start();
recentOverdueMonitorTask.start();
oneWeekWarningMonitorTask.start();
twoWeekWarningMonitorTask.start();

function broadcastMonitorResult(monitoredJob, groupMessageTitle, jobSQLScript) {
    var broadcastTargetIDList = []; // list to hold a list of broadcast recipients
    var groupMessage = groupMessageTitle; // string to hold group message
    if (monitoredJob.online === true) { // only execute the cron job if the 'online' property is true
        console.log(
            "\n" + moment(moment(), "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") + " " +
            "proceeding with scheduled [" + monitoredJob.id + "]"
        );
        // query the database for recent overdue records
        database.executeQuery(jobSQLScript, function(recordset, error) {
            if (error) {
                return console.log(error);
            }
            recordset.forEach(function(record) { // loop through each record in the list
                groupMessage += "\n" + record.content;
                broadcastTargetIDList = monitoredJob.targetUserIDList.slice(); // reinitialize
                broadcastTargetIDList.push(telegramUser.getUserID(record.SAL_NAME)); // add staff that came up in the current record
                if (monitoredJob.broadcast === true) { // only broadcast if the 'broadcast' property is true
                    broadcastTargetIDList.forEach(function(broadcastTargetID) { // loop through broadcastTargetIDList and broadcast
                        httpRequest({ // broadcast individual message
                            method: "post",
                            uri: config.broadcastAPIUrl,
                            form: {
                                chat_id: broadcastTargetID,
                                text: record.verboseMessage,
                                token: telegramBot.getToken("overdueMonitorBot")
                            }
                        }).catch(function(error) {
                            console.log(error);
                        });
                    });
                }
            });
            if (monitoredJob.broadcast === true) { // only broadcast if the 'broadcast' property is true
                monitoredJob.targetGroupIDList.forEach(function(targetGroupID) {
                    httpRequest({ // broadcast group message
                        method: "post",
                        uri: config.broadcastAPIUrl,
                        form: {
                            chat_id: targetGroupID,
                            text: groupMessage,
                            token: telegramBot.getToken("overdueMonitorBot")
                        }
                    }).catch(function(error) {
                        console.log(error);
                    });
                });
            }
        });
    }
};
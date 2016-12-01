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

var dailyMonitorTask = new CronJob(upgiSystem.list[1].jobList[0].schedule, function() {
    var broadcastTargetIDList = []; // list to hold a list of broadcast recipients
    var newOverdueGroupMessage = "【新增逾期款項】"; // string to hold group message
    if (upgiSystem.list[1].jobList[0].online === true) { // only execute the cron job if the 'online' property is true
        console.log(
            "\n" + moment(moment(), "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") + " " +
            "proceeding with scheduled [" + upgiSystem.list[1].jobList[0].id + "]"
        );
        // query the database for new overdue records
        database.executeQuery(queryString.newOverdueAlarmQuery, function(newOverdueList, error) {
            if (error) {
                return console.log(error);
            }
            newOverdueList.forEach(function(newOverdue) { // loop through each record in the list
                newOverdueGroupMessage += "\n   " + newOverdue.content;
                broadcastTargetIDList = upgiSystem.list[1].jobList[0].targetUserIDList.slice(); // reinitialize
                broadcastTargetIDList.push(telegramUser.getUserID(newOverdue.SAL_NAME)); // add staff that came up in the current record
                if (upgiSystem.list[1].jobList[0].broadcast === true) { // only broadcast if the 'broadcast' property is true
                    broadcastTargetIDList.forEach(function(broadcastTargetID) { // loop through broadcastTargetIDList and broadcast
                        httpRequest({ // broadcast individual message
                            method: "post",
                            uri: config.broadcastAPIUrl,
                            form: {
                                chat_id: broadcastTargetID,
                                text: newOverdue.verboseMessage,
                                token: telegramBot.getToken("overdueMonitorBot")
                            }
                        }).catch(function(error) {
                            console.log(error);
                        });
                    });
                }
            });
            if (upgiSystem.list[1].jobList[0].broadcast === true) { // only broadcast if the 'broadcast' property is true
                httpRequest({ // broadcast group message
                    method: "post",
                    uri: config.broadcastAPIUrl,
                    form: {
                        chat_id: telegramChat.getChatID("業務群組"),
                        text: newOverdueGroupMessage,
                        token: telegramBot.getToken("overdueMonitorBot")
                    }
                }).catch(function(error) {
                    console.log(error);
                });
            }
        });
    }
}, null, true, config.workingTimezone);
dailyMonitorTask.start();

var weeklyMonitorTask = new CronJob(upgiSystem.list[1].jobList[1].schedule, function() {
    var broadcastTargetIDList = []; // list to hold a list of broadcast recipients
    var groupMessage = "【近期逾期款項目】"; // string to hold group message
    if (upgiSystem.list[1].jobList[1].online === true) { // only execute the cron job if the 'online' property is true
        console.log(
            "\n" + moment(moment(), "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") + " " +
            "proceeding with scheduled [" + upgiSystem.list[1].jobList[1].id + "]"
        );
        // query the database for recent overdue records
        database.executeQuery(queryString.pastWeekOverdueAlarmQuery, function(pastWeekOverdueList, error) {
            if (error) {
                return console.log(error);
            }
            pastWeekOverdueList.forEach(function(pastWeekOverdue) { // loop through each record in the list
                groupMessage += "\n" + pastWeekOverdue.content;
                broadcastTargetIDList = upgiSystem.list[1].jobList[1].targetUserIDList.slice(); // reinitialize
                broadcastTargetIDList.push(telegramUser.getUserID(pastWeekOverdue.SAL_NAME)); // add staff that came up in the current record
                if (upgiSystem.list[1].jobList[1].broadcast === true) { // only broadcast if the 'broadcast' property is true
                    broadcastTargetIDList.forEach(function(broadcastTargetID) { // loop through broadcastTargetIDList and broadcast
                        httpRequest({ // broadcast individual message
                            method: "post",
                            uri: config.broadcastAPIUrl,
                            form: {
                                chat_id: broadcastTargetID,
                                text: pastWeekOverdue.verboseMessage,
                                token: telegramBot.getToken("overdueMonitorBot")
                            }
                        }).catch(function(error) {
                            console.log(error);
                        });
                    });
                }
            });
            if (upgiSystem.list[1].jobList[1].broadcast === true) { // only broadcast if the 'broadcast' property is true
                upgiSystem.list[1].jobList[1].targetGroupIDList.forEach(function(targetGroupID) {
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
}, null, true, config.workingTimezone);
weeklyMonitorTask.start();
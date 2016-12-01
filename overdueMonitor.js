"use strict";

var moment = require("moment-timezone");
var CronJob = require("cron").CronJob;
var httpRequest = require("request-promise");
var Q = require("q");

var config = require("./config.js");
var database = require("./module/database.js");
var queryString = require("./model/queryString.js");
var telegramBot = require("./model/telegramBot.js");
var telegramChat = require("./model/telegramChat.js");
var telegramUser = require("./model/telegramUser.js");
var upgiSystem = require("./model/upgiSystem.js");

//var newOverdueGroupMessage = ""; // string to hold group message of new overdue records
var dailyMonitorTask = new CronJob(upgiSystem.list[1].jobList[0].schedule, function() {
    var broadcastTargetIDList = []; // list to hold a list of broadcast recipients
    var newOverdueGroupMessage = "【新增逾期款項】"; // reinitialize
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
            broadcastTargetIDList = upgiSystem.list[1].jobList[0].targetUserIDList.slice();
            newOverdueList.forEach(function(newOverdue) { // loop through each record in the list
                newOverdueGroupMessage += "\n   " + newOverdue.content;
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
                        });
                    });
                }
            });
            httpRequest({ // broadcast group message
                method: "post",
                uri: config.broadcastAPIUrl,
                form: {
                    chat_id: telegramChat.getChatID("業務群組"),
                    text: newOverdueGroupMessage,
                    token: telegramBot.getToken("overdueMonitorBot")
                }
            });
        });
    }
}, null, true, config.workingTimezone);
dailyMonitorTask.start();

/*
var weeklyMonitorTask = new CronJob(upgiSystem.list[1].jobList[1].schedule, function() {
    if (upgiSystem.list[1].jobList[1].online === true) {
        console.log(
            moment(moment(), "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") + " " +
            "proceeding with scheduled [" + upgiSystem.list[1].jobList[1].id + "]"
        );
        database.executeQuery(queryString.pastWeekOverdueAlarmQuery, function(pastWeekOverdueList, error) {
            if (error) {
                return console.log(error);
            }
            pastWeekOverdueList.forEach(function(pastWeekOverdue) {
                console.log(pastWeekOverdue.content);
            });
        });
        database.executeQuery(queryString.oneWeekWarningQuery, function(oneWeekWarningList, error) {
            if (error) {
                return console.log(error);
            }
            oneWeekWarningList.forEach(function(oneWeekWarning) {
                console.log(oneWeekWarning.content);
            });
        });
        database.executeQuery(queryString.twoWeekWarningQuery, function(twoWeekWarningList, error) {
            if (error) {
                return console.log(error);
            }
            twoWeekWarningList.forEach(function(twoWeekWarning) {
                console.log(twoWeekWarning.content);
            });
        });
        if (upgiSystem.list[1].jobList[1].broadcast === true) {

        }
    }
}, null, true, config.workingTimezone);
weeklyMonitorTask.start();
*/
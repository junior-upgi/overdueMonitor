var moment = require("moment-timezone");
var CronJob = require("cron").CronJob;
var mssql = require("mssql");
var httpRequest = require("request");

var queryString = require("./model/queryString.js");
var config = require("./config.js");

var dailyMonitorTask = new CronJob("0 0 9 * * *", function() {
    var mssqlConnection = new mssql.Connection(config.mssqlConfig);
    var mssqlRequest;
    mssqlConnection.connect()
        .then(function() {
            mssqlRequest = new mssql.Request(mssqlConnection);
            mssqlRequest.query(queryString.newOverdueAlarmQuery)
                .then(function(newOverdueList) {
                    newOverdueList.forEach(function(newOverdue) {
                        console.log(newOverdue.verboseMessage);
                        httpRequest.post("http://upgi.ddns.net:9001/broadcast") // to me
                            .form({
                                chat_id: 241630569,
                                text: newOverdue.verboseMessage,
                                token: "267738010:AAGT17aLumIfVPNeFWht8eUEPuC2HfAouGk"
                            });
                        httpRequest.post("http://upgi.ddns.net:9001/broadcast") // to it chatroom
                            .form({
                                chat_id: -157638300,
                                text: newOverdue.verboseMessage,
                                token: "267738010:AAGT17aLumIfVPNeFWht8eUEPuC2HfAouGk"
                            });
                    });
                    mssqlConnection.close();
                })
                .catch(function(error) {
                    return console.log("overdueMonitor.dbo.warning_NewOverdue 查詢發生錯誤： " + error);
                });
        })
        .catch(function(error) { // connect failure
            return console.log("資料庫連結發生錯誤： " + error);
        });
}, null, true, config.workingTimezone);
dailyMonitorTask.start();

var weeklyMonitorTask = new CronJob("0 0 9 * * 1", function() {
    var mssqlConnection = new mssql.Connection(config.mssqlConfig);
    var mssqlRequest;
    mssqlConnection.connect()
        .then(function() {
            mssqlRequest = new mssql.Request(mssqlConnection);
            mssqlRequest.query(queryString.WeeklySummaryQuery)
                .then(function(newOverdueList) {
                    newOverdueList.forEach(function(newOverdue) {
                        console.log(newOverdue.verboseMessage);
                        httpRequest.post("http://upgi.ddns.net:9001/broadcast") // to me
                            .form({
                                chat_id: 241630569,
                                text: newOverdue.verboseMessage,
                                token: "267738010:AAGT17aLumIfVPNeFWht8eUEPuC2HfAouGk"
                            });
                        httpRequest.post("http://upgi.ddns.net:9001/broadcast") // to it chatroom
                            .form({
                                chat_id: -157638300,
                                text: newOverdue.verboseMessage,
                                token: "267738010:AAGT17aLumIfVPNeFWht8eUEPuC2HfAouGk"
                            });
                    });
                    mssqlConnection.close();
                })
                .catch(function(error) {
                    return console.log("overdueMonitor.dbo.warning_NewOverdue 查詢發生錯誤： " + error);
                });
        })
        .catch(function(error) { // connect failure
            return console.log("資料庫連結發生錯誤： " + error);
        });
}, null, true, config.workingTimezone);
weeklyMonitorTask.start();
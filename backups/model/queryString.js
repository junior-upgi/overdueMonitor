"use strict";

var moment = require("moment-timezone");

var oneWeekWarningQuery = "SELECT * FROM overdueMonitor.dbo.warning_OneWeek ORDER BY recipientID, DUE_DATE;";
var twoWeekWarningQuery = "SELECT * FROM overdueMonitor.dbo.warning_TwoWeek ORDER BY recipientID, DUE_DATE;";
var pastWeekOverdueAlarmQuery = "SELECT * FROM overdueMonitor.dbo.warning_PastWeekOverdue ORDER BY recipientID, DUE_DATE;";
var newOverdueAlarmQuery = "SELECT * FROM overdueMonitor.dbo.warning_NewOverdue;";
var weeklySummaryQuery = "SELECT * FROM overdueMonitor.dbo.warning_WeeklySummary;";
var overviewQuery = "SELECT * FROM overdueMonitor.dbo.overview;";

function cashFlowSnapshotInsertQuery(AMTN_PENDING, AMTN_OVERDUE, AMTN_DEPOSIT) {
    return "INSERT INTO overdueMonitor.dbo.cashFlowSnapshot VALUES('" +
        moment(moment(), "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD") + "'," +
        AMTN_PENDING + "," +
        AMTN_OVERDUE + "," +
        AMTN_DEPOSIT + ",'" +
        moment(moment(), "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD HH:mm:ss") + "');";
};

module.exports = {
    oneWeekWarningQuery,
    twoWeekWarningQuery,
    pastWeekOverdueAlarmQuery,
    newOverdueAlarmQuery,
    weeklySummaryQuery,
    overviewQuery,
    cashFlowSnapshotInsertQuery
};
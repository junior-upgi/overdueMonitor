oneWeekWarningQuery = "SELECT * FROM overdueMonitor.dbo.warning_OneWeek ORDER BY recipientID, DUE_DATE;";
twoWeekWarningQuery = "SELECT * FROM overdueMonitor.dbo.warning_TwoWeek ORDER BY recipientID, DUE_DATE;";
pastWeekOverdueAlarmQuery = "SELECT * FROM overdueMonitor.dbo.warning_PastWeekOverdue ORDER BY recipientID, DUE_DATE;";
newOverdueAlarmQuery = "SELECT * FROM overdueMonitor.dbo.warning_NewOverdue;";
WeeklySummaryQuery = "SELECT * FROM overdueMonitor.dbo.warning_WeeklySummary;";

module.exports = {
    oneWeekWarningQuery,
    twoWeekWarningQuery,
    pastWeekOverdueAlarmQuery,
    newOverdueAlarmQuery,
    WeeklySummaryQuery
};
var moment = require('moment-timezone');

var annualReportSummary = 'SELECT * FROM overdueMonitor.dbo.annualReportSummary ORDER BY YEAR ASC;';
var overview = 'SELECT * FROM overdueMonitor.dbo.overview;';
var warning_NewOverdue = 'SELECT * FROM overdueMonitor.dbo.warning_NewOverdue ORDER BY PS_DD ASC;';
var warning_OneWeek = 'SELECT * FROM overdueMonitor.dbo.warning_OneWeek ORDER BY G_PERIOD_REMAIN ASC;';
var warning_PastWeekOverdue = 'SELECT * FROM overdueMonitor.dbo.warning_PastWeekOverdue ORDER BY G_PERIOD_REMAIN ASC;';
var warning_ProlongedOverdue = 'SELECT * FROM overdueMonitor.dbo.warning_ProlongedOverdue ORDER BY DATEDIFF(day,DUE_DATE,GETDATE()) ASC;';
var warning_TwoWeek = 'SELECT * FROM overdueMonitor.dbo.warning_TwoWeek ORDER BY G_PERIOD_REMAIN ASC;';

function cashFlowSnapshotInsertQuery(AMTN_PENDING, AMTN_OVERDUE, AMTN_DEPOSIT) {
    let currentDate = moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD');
    let currentDatetime = moment(moment(), 'YYYY-MM-DD HH:mm:ss').format('YYYY-MM-DD HH:mm:ss');
    return `INSERT INTO overdueMonitor.dbo.cashFlowSnapshot VALUES('${currentDate}',${AMTN_PENDING},${AMTN_OVERDUE},${AMTN_DEPOSIT},'${currentDatetime}');`;
};

module.exports = {
    annualReportSummary,
    overview,
    warning_NewOverdue,
    warning_OneWeek,
    warning_PastWeekOverdue,
    warning_ProlongedOverdue,
    warning_TwoWeek,
    cashFlowSnapshotInsertQuery
};

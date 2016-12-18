SELECT
    CUS_NO
    ,[YEAR]
    ,[MONTH]
    ,DURATION
    ,AMTN_OUT AS AMTN_OVERDUE
    ,G_PERIOD_REMAIN
    ,[STATUS]
    ,LATE_COUNT
FROM overdueMonitor.dbo.outstandingOverview
WHERE [STATUS]=1;
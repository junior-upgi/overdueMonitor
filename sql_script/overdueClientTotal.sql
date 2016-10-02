SELECT
    CUS_NO
    ,SUM(AMTN_OVERDUE) AS AMTN_OVERDUE
    ,[STATUS]
    ,MAX(LATE_COUNT) AS LATE_COUNT
FROM UPGI_OverdueMonitor.dbo.overdue
GROUP BY CUS_NO,[STATUS];
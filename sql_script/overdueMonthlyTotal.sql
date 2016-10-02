SELECT
    [YEAR]
    ,[MONTH]
    ,SUM(AMTN_OVERDUE) AS AMTN_OVERDUE
    ,[STATUS]
FROM UPGI_OverdueMonitor.dbo.overdue
GROUP BY [YEAR],[MONTH],[STATUS];

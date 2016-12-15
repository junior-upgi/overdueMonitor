SELECT
    [YEAR]
    ,[MONTH]
    ,SUM(AMTN_OVERDUE) AS AMTN_OVERDUE
    ,[STATUS]
FROM overdueMonitor.dbo.overdue
GROUP BY [YEAR],[MONTH],[STATUS];

SELECT
    [YEAR]
    ,[MONTH]
    ,SUM(AMTN_PENDING) AS AMTN_PENDING
    ,[STATUS]
FROM sunlikeerp.overdueMonitor.dbo.pending
GROUP BY [YEAR],[MONTH],[STATUS];
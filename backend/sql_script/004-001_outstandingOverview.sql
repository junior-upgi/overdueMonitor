SELECT
	a.CUS_NO
	,a.[YEAR]
	,a.[MONTH]
	,SUM(a.DURATION)/COUNT(*) AS DURATION
	,SUM(a.AMTN_OUT) AS AMTN_OUT
	,SUM(a.G_PERIOD_REMAIN)/COUNT(*) AS G_PERIOD_REMAIN
	,a.[STATUS]
	,CASE WHEN a.[STATUS]=1 THEN DATEDIFF(MONTH,DATEADD(DAY,(SUM(a.G_PERIOD-a.DURATION)/COUNT(*)),GETDATE()),GETDATE())
	ELSE 0 END AS LATE_COUNT
FROM sunlikeerp.overdueMonitor.dbo.outstanding a
GROUP BY a.CUS_NO,a.[YEAR],a.[MONTH],a.[STATUS];
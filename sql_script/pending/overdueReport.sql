SELECT
	e.CUS_NO
	,f.CUS_SNM
	,f.TERM_DESC
	,e.YEAR
	,e.MONTH
	,e.AMTN_OVERDUE
	,e.AMTN_PENDING
	,f.TOTAL_AMTN_OVERDUE
	,f.MAX_LATE_COUNT
	,f.AMTN_DEPOSIT
	,f.SAL_NAME
FROM (
	SELECT a.YEAR,a.MONTH,b.CUS_NO,b.AMTN_OVERDUE,NULL AS AMTN_PENDING
	FROM UPGI_OverdueMonitor.dbo.observedPeriod a LEFT JOIN UPGI_OverdueMonitor.dbo.overdue b ON (a.YEAR=b.YEAR AND a.MONTH=b.MONTH)
	WHERE b.CUS_NO IS NOT NULL
	UNION
	SELECT c.YEAR,d.MONTH,d.CUS_NO,NULL AS AMTN_OVERDUE,d.AMTN_PENDING
	FROM UPGI_OverdueMonitor.dbo.observedPeriod c LEFT JOIN UPGI_OverdueMonitor.dbo.pending d ON (c.YEAR=d.YEAR AND c.MONTH=d.MONTH)
	WHERE d.CUS_NO IS NOT NULL) e
	INNER JOIN [UPGI_OverdueMonitor].[dbo].[overdueClientOverview] f ON e.CUS_NO=f.CUS_NO;
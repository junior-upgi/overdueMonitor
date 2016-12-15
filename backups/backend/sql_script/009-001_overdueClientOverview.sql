SELECT
    a.CUS_NO
	,b.CUS_SNM
	,b.TERM_DESC
    ,a.AMTN_OVERDUE AS TOTAL_AMTN_OVERDUE
    ,a.LATE_COUNT AS MAX_LATE_COUNT
	,d.AMTN_PENDING AS TOTAL_AMTN_PENDING
	,c.AMTN_DEPOSIT
	,b.SAL_NO
	,b.SAL_NAME
FROM overdueMonitor.dbo.overdueClientTotal a
	INNER JOIN overdueMonitor.dbo.clientData b ON a.CUS_NO=b.CUS_NO
	LEFT JOIN overdueMonitor.dbo.depositClientTotal c ON a.CUS_NO=c.CUS_NO
	LEFT JOIN overdueMonitor.dbo.pendingClientTotal d ON a.CUS_NO=d.CUS_NO;
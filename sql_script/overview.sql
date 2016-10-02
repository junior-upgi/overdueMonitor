SELECT
	a.AMTN_PENDING
	,b.AMTN_OVERDUE
	,c.AMTN_DEPOSIT
FROM
	(SELECT SUM(AMTN_PENDING) AS AMTN_PENDING FROM UPGI_OverdueMonitor.dbo.pending) a
	,(SELECT SUM(AMTN_OVERDUE) AS AMTN_OVERDUE FROM UPGI_OverdueMonitor.dbo.overdue) b
	,(SELECT SUM(AMTN_DEPOSIT) AS AMTN_DEPOSIT FROM UPGI_OverdueMonitor.dbo.depositClientTotal) c;
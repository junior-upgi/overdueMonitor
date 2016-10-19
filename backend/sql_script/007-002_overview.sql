SELECT
	a.AMTN_PENDING
	,b.AMTN_OVERDUE
	,c.AMTN_DEPOSIT
FROM
	(SELECT SUM(AMTN_PENDING) AS AMTN_PENDING FROM sunlikeerp.overdueMonitor.dbo.pending) a
	,(SELECT SUM(AMTN_OVERDUE) AS AMTN_OVERDUE FROM sunlikeerp.overdueMonitor.dbo.overdue) b
	,(SELECT SUM(AMTN_DEPOSIT) AS AMTN_DEPOSIT FROM sunlikeerp.overdueMonitor.dbo.depositClientTotal) c;
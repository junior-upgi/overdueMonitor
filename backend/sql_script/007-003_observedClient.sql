SELECT DISTINCT a.CUS_NO
FROM (
	SELECT CUS_NO FROM sunlikeerp.overdueMonitor.dbo.depositClientTotal
	UNION
	SELECT CUS_NO FROM sunlikeerp.overdueMonitor.dbo.overdueClientTotal
	UNION
	SELECT CUS_NO FROM sunlikeerp.overdueMonitor.dbo.pendingClientTotal) a;
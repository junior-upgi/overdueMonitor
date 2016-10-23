SELECT DISTINCT a.CUS_NO
FROM (
	SELECT CUS_NO FROM overdueMonitor.dbo.depositClientTotal
	UNION
	SELECT CUS_NO FROM overdueMonitor.dbo.overdueClientTotal
	UNION
	SELECT CUS_NO FROM overdueMonitor.dbo.pendingClientTotal) a;
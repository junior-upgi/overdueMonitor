SELECT DISTINCT a.CUS_NO
FROM (
	SELECT CUS_NO FROM UPGI_OverdueMonitor.dbo.depositClientTotal
	UNION
	SELECT CUS_NO FROM UPGI_OverdueMonitor.dbo.overdueClientTotal
	UNION
	SELECT CUS_NO FROM UPGI_OverdueMonitor.dbo.pendingClientTotal) a;
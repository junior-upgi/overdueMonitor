SELECT ISNULL(SUM(OVERDUE),0) AS OVERDUE
FROM UPGI_OverdueMonitor.dbo.overduePastTenMonths;
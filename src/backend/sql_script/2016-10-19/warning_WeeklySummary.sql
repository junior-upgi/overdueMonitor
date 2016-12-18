SELECT * FROM UPGI_OverdueMonitor.dbo.warning_OneWeek
UNION
SELECT * FROM UPGI_OverdueMonitor.dbo.warning_TwoWeek;
-- must manually specify the ORDER BY statement, SQL Server won't save the query otherwise
-- ORDER BY recipientID,DUE_DATE;
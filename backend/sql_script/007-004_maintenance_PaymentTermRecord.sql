SELECT
	a.CUS_NO
	,c.SNM
	,'未建立客戶付款條件記錄' AS ISSUE
	,'INSERT INTO sunlikeerp.overdueMonitor.dbo.paymentTerm VALUES ('''+a.CUS_NO+''',0,NULL,1,0);' AS INSERT_STATEMENT
FROM sunlikeerp.overdueMonitor.dbo.observedClient a
	LEFT JOIN sunlikeerp.overdueMonitor.dbo.paymentTerm b ON a.CUS_NO=b.CUS_NO
	LEFT JOIN sunlikeerp.DB_U105.dbo.CUST c ON a.CUS_NO=c.CUS_NO
WHERE b.CUS_NO IS NULL;
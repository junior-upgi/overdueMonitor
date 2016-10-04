SELECT
	a.CUS_NO
	,b.SAL_NO
	,b.CUS_SNM
	,b.TERM_DESC
	,c.OVERDUE AS OVERDUE_EXT
	,d.OVERDUE AS OVERDUE_TOTAL
	,d.LATE_COUNT
	,e.AMTN_BAL AS AMTN_BAL_TOTAL
	,f.DEPOSIT AS DEPOSIT_TOTAL
	,b.SAL_NAME
FROM UPGI_OverdueMonitor.dbo.observedClient a
	LEFT JOIN UPGI_OverdueMonitor.dbo.clientData b ON (a.CUS_NO COLLATE Compatibility_196_404_30001)=(b.CUS_NO COLLATE Compatibility_196_404_30001)
	LEFT JOIN UPGI_OverdueMonitor.dbo.overduePastTenMonths c ON a.CUS_NO=c.CUS_NO
	LEFT JOIN UPGI_OverdueMonitor.dbo.overdueSummary d ON a.CUS_NO=d.CUS_NO
	LEFT JOIN UPGI_OverdueMonitor.dbo.pendingPaymentSummary e ON a.CUS_NO=e.CUS_NO
	LEFT JOIN UPGI_OverdueMonitor.dbo.deposit f ON a.CUS_NO=f.CUS_NO
ORDER BY b.CUS_SNM;
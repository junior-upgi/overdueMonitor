SELECT
	a.CUS_NO
	,d.CUS_SNM
	,c.TOTAL_AMTN_OUT
	,b.AMTN_DEPOSIT
	,c.TOTAL_AMTN_OUT-b.AMTN_DEPOSIT AS CUR_BAL
	,CAST(d.LIM_NR AS INT) AS LIM_NR
FROM overdueMonitor.dbo.paymentTerm a
	LEFT JOIN overdueMonitor.dbo.depositClientTotal b ON a.CUS_NO=b.CUS_NO
	LEFT JOIN (
		SELECT CUS_NO,SUM(AMTN_OUT) AS TOTAL_AMTN_OUT
		FROM overdueMonitor.dbo.outstanding
		GROUP BY CUS_NO) c ON a.CUS_NO=c.CUS_NO
	LEFT JOIN overdueMonitor.dbo.clientData d ON a.CUS_NO=d.CUS_NO
WHERE b.CUS_NO IS NOT NULL AND c.CUS_NO IS NOT NULL AND d.CUS_NO IS NOT NULL;
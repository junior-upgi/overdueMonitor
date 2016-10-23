SELECT
	b.CUS_NO
	,b.PS_NO
	,b.LZ_NO
	,a.ARP_NO
	,b.PS_DD
	,a.CLS_NO
	,a.ITM
	,a.CLS_DD
	,DATEDIFF(dd,b.PS_DD,a.CLS_DD) AS DURATION
	,a.AMTN_CLS
	,0 AS AMTN_OUT
	,NULL AS G_PERIOD
	,NULL AS G_PERIOD_REMAIN
	,NULL AS STATUS
FROM overdueMonitor.dbo.payment a
	LEFT JOIN overdueMonitor.dbo.billable b ON a.ARP_NO=b.ARP_NO
WHERE b.PS_NO IS NOT NULL
UNION
SELECT
	d.CUS_NO
	,d.PS_NO
	,d.LZ_NO
	,d.ARP_NO
	,d.PS_DD
	,NULL AS CLS_NO
	,0 AS ITM
	,NULL AS CLS_DD
	,d.DURATION
	,0 AS AMTN_CLS
	,d.AMTN_OUT
	,d.G_PERIOD
	,d.G_PERIOD_REMAIN
	,d.STATUS
FROM overdueMonitor.dbo.outstanding d
ORDER BY CUS_NO,PS_DD,PS_NO,ITM DESC,CLS_DD,G_PERIOD_REMAIN;
/*order by statement must be removed in order to save this as view*/
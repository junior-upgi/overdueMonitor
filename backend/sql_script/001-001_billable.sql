SELECT
	a.PS_NO
	,b.LZ_NO
	,b.ARP_NO
	,a.PS_DD
	,a.CUS_NO
	,a.AMTN_NET
	,0 AS 'INSERTED'
FROM (
	SELECT
		a.PS_NO
		,a.CUS_NO
		,CAST(a.PS_DD AS DATE) AS PS_DD
		,a.ACC_FP_NO
		,CAST(SUM(b.AMTN_NET) AS INT) AS AMTN_NET
	FROM sunlikeerp.DB_U105.dbo.MF_PSS a
		INNER JOIN sunlikeerp.DB_U105.dbo.TF_PSS b ON a.PS_NO=b.PS_NO
	WHERE a.PS_ID='SA' AND a.PS_DD>='2016-01-01'
	GROUP BY a.PS_NO,a.CUS_NO,a.PS_DD,a.ACC_FP_NO) a
	LEFT JOIN sunlikeerp.DB_U105.dbo.MF_LZ b ON a.ACC_FP_NO=b.LZ_NO
	LEFT JOIN sunlikeerp.overdueMonitor.dbo.ignoreBillable c ON (
		a.CUS_NO=c.CUS_NO
		AND b.ARP_NO=c.ARP_NO
		AND b.LZ_NO=c.LZ_NO
		AND a.AMTN_NET=c.AMTN_NET)
WHERE a.AMTN_NET>0 AND c.CUS_NO IS NULL
UNION
SELECT
	NULL AS PS_NO
	,LZ_NO
	,ARP_NO
	,PS_DD
	,CUS_NO
	,AMTN_NET
	,1 AS 'INSERTED'
FROM sunlikeerp.overdueMonitor.dbo.includeBillable;
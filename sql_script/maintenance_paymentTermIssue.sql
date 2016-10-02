SELECT
	a.CUS_NO
	,a.CUS_SNM
	,b.CUS_NO AS OBSERVED_CUS_NO
	,a.TERM_DESC
	,b.G_PERIOD
	,CAST(a.LIM_NR AS INT) AS LIM_NR
	,a.CRD_ID
	,CASE
		WHEN TERM_DESC IS NULL THEN '付款條件不明'
		WHEN LIM_NR IS NULL THEN '進用額度未設定'
        ELSE '查詢發生錯誤，請向 IT 單位反應'
	END AS ISSUE
	,a.SAL_NO
	,a.SAL_NAME
FROM UPGI_OverdueMonitor.dbo.clientData a
	LEFT JOIN UPGI_OverdueMonitor.dbo.outstanding b ON (a.CUS_NO COLLATE Compatibility_196_404_30001)=(b.CUS_NO COLLATE Compatibility_196_404_30001)
WHERE (b.CUS_NO IS NOT NULL AND a.TERM_DESC IS NULL) OR (b.CUS_NO IS NOT NULL AND a.LIM_NR IS NULL)
GROUP BY a.CUS_NO,a.CUS_SNM,b.CUS_NO,a.TERM_DESC,b.G_PERIOD,a.LIM_NR,a.CRD_ID,a.SAL_NO,a.SAL_NAME;
SELECT
	g.CUS_NO
	,g.CUS_SNM
	,g.SAL_REP_NO
	,g.SAL_NAME
	,CASE
		WHEN g.SAL_REP_NO IS NULL THEN '未設定責任業務'
		ELSE '設定業務非現行業務單位成員'
	END AS ISSUE
FROM (
	-- subquery to find all observed client without valid sales data in
	-- the dbo.SALM (official ERP system) or dbo.activeSalesStaff (custom data)
	SELECT
		d.CUS_NO
		,d.CUS_SNM
		,d.SAL_NO AS SAL_REP_NO
		,d.SAL_NAME
		,e.CUS_NO AS OBSERVED_CUS_NO
		,f.SAL_NO AS ACTIVE_SAL_NO
	FROM (
		-- subquery to list detailed client data for all clients
		SELECT
			a.CUS_NO
			,b.NAME AS CUS_NAME
			,b.SNM AS CUS_SNM
			,b.LIM_NR
			,b.CRD_ID
			,a.TERM_DESC
			,b.SAL AS SAL_NO
			,c.NAME AS SAL_NAME
		FROM overdueMonitor.dbo.paymentTerm a
			LEFT JOIN DB_U105.dbo.CUST b ON a.CUS_NO=b.CUS_NO
			LEFT JOIN DB_U105.dbo.SALM c ON b.SAL=c.SAL_NO) d
		LEFT JOIN overdueMonitor.dbo.outstanding e ON d.CUS_NO=e.CUS_NO
		LEFT JOIN overdueMonitor.dbo.activeSalesStaff f ON d.SAL_NO=f.SAL_NO
	WHERE (e.CUS_NO IS NOT NULL AND d.SAL_NO IS NULL) OR (e.CUS_NO IS NOT NULL AND f.SAL_NO IS NULL)) g
GROUP BY g.CUS_NO,g.CUS_SNM,g.SAL_REP_NO,g.SAL_NAME;
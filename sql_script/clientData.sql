-- all sales found that are not in the 'dbo.activeSalesStaff' table are substituted by the manager
-- automatically, therefore the data does not represent what's actually in the ERP system.

-- the 'dbo.maintenance_salesDataIssue' does not, and cannot use data from this view.
-- Otherwise it will not find records missing or has unreasonable sales reference

-- steps:
-- 1. find all client from ERP data that matches the ones listed in the 'dbo.paymentTerm' table
-- 2. match result from #1 to the 'dbo.activeSalesStaff' table
-- 3. subquery for principle sales (manager), and substitue all records with no sales defined
--    in the ERP data or is defined but not in the 'dbo.activeSalesStaff' with the principle sales
-- 4. join the dbo.SALM table to get the sales name.  DONE!!!

-- comments in the query are for troubleshooting purpose

SELECT
	g.CUS_NO
	,g.CUS_NAME
	,g.CUS_SNM
	,g.LIM_NR
	,g.CRD_ID
	,g.TERM_DESC
	,g.SAL_NO
	,h.NAME AS SAL_NAME
FROM (
	SELECT
		a.CUS_NO
		,b.NAME AS CUS_NAME
		,b.SNM AS CUS_SNM
		,b.LIM_NR
		,b.CRD_ID
		,a.TERM_DESC
		--,b.SAL AS ERP_SAL_NO
		--,c.SAL_NO AS _ACT_SAL_NO
		--,c.principle AS _principle
		,CASE
			WHEN b.SAL=c.SAL_NO THEN c.SAL_NO
			--WHEN b.SAL IS NOT NULL AND c.SAL_NO IS NULL THEN f.SAL_NO
			ELSE f.SAL_NO
		END AS SAL_NO
		/*,CASE
			WHEN b.SAL=c.SAL_NO THEN c.principle
			--WHEN b.SAL IS NOT NULL AND c.SAL_NO IS NULL THEN 1
			ELSE 1
		END AS principle*/
		--,f.SAL_NO AS _principle_act_sal_no
	FROM UPGI_OverdueMonitor.dbo.paymentTerm a
		LEFT JOIN DB_U105.dbo.CUST b ON a.CUS_NO=b.CUS_NO
		LEFT JOIN UPGI_OverdueMonitor.dbo.activeSalesStaff c ON b.SAL=c.SAL_NO, (
			-- subquery to find the principle in the list of active sales staff
			SELECT
				d.SAL_NO
				,e.NAME AS SAL_NAME
			FROM UPGI_OverdueMonitor.dbo.activeSalesStaff d
				LEFT JOIN DB_U105.dbo.SALM e ON d.SAL_NO=e.SAL_NO
			WHERE d.principle=1) f) g
	LEFT JOIN DB_U105.dbo.SALM h ON g.SAL_NO=h.SAL_NO;

/*
--prior version that does not substitue missing or non-active sales
SELECT
	a.CUS_NO
	,b.NAME AS CUS_NAME
	,b.SNM AS CUS_SNM
	,b.LIM_NR
	,b.CRD_ID
	,a.TERM_DESC
	,b.SAL AS SAL_NO
	,c.NAME AS SAL_NAME
FROM UPGI_OverdueMonitor.dbo.paymentTerm a
	LEFT JOIN DB_U105.dbo.CUST b ON a.CUS_NO=b.CUS_NO
	LEFT JOIN DB_U105.dbo.SALM c ON b.SAL=c.SAL_NO;*/
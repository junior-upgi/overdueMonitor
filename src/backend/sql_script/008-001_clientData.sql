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
    ,g.G_PERIOD
	,g.SAL_NO
	,h.NAME AS SAL_NAME
	,j.AMTN_DEPOSIT
	,k.AMTN_PENDING
	,l.AMTN_OVERDUE
FROM (
	SELECT
		a.CUS_NO
		,b.NAME AS CUS_NAME
		,b.SNM AS CUS_SNM
        ,CAST(ROUND(b.LIM_NR,0) AS INT) AS LIM_NR
		,b.CRD_ID
		,a.TERM_DESC
        ,a.G_PERIOD
		,CASE
			WHEN b.SAL=c.SAL_NO THEN c.SAL_NO
			ELSE f.SAL_NO
		END AS SAL_NO
	FROM overdueMonitor.dbo.paymentTerm a
		LEFT JOIN DB_U105.dbo.CUST b ON a.CUS_NO=b.CUS_NO
		LEFT JOIN overdueMonitor.dbo.activeSalesStaff c ON b.SAL=c.SAL_NO, (
			-- subquery to find the principle in the list of active sales staff
			SELECT
				d.SAL_NO
				,e.NAME AS SAL_NAME
			FROM overdueMonitor.dbo.activeSalesStaff d
				LEFT JOIN DB_U105.dbo.SALM e ON d.SAL_NO=e.SAL_NO
			WHERE d.principle=1) f) g
	LEFT JOIN DB_U105.dbo.SALM h ON g.SAL_NO=h.SAL_NO
	LEFT JOIN overdueMonitor.dbo.observedClient i ON g.CUS_NO=i.CUS_NO -- for excluding clients that has no payment matters
	LEFT JOIN overdueMonitor.dbo.depositClientTotal j ON g.CUS_NO=j.CUS_NO -- deposit total per client
	LEFT JOIN overdueMonitor.dbo.pendingClientTotal k ON g.CUS_NO=k.CUS_NO -- pending total per client
	LEFT JOIN overdueMonitor.dbo.overdueClientTotal l ON g.CUS_NO=l.CUS_NO -- overdue total per client
WHERE i.CUS_NO IS NOT NULL;

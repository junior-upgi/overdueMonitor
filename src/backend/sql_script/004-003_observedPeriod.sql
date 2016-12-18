SELECT DISTINCT
	[YEAR]
	,[MONTH]
	,CONCAT(CAST([YEAR] AS VARCHAR),CONCAT('/',REPLACE(STR([MONTH],2),' ','0'))) AS LABEL
FROM sunlikeerp.overdueMonitor.dbo.outstandingOverview;
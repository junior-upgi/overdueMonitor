SELECT
	b.SAL_NO AS erpID
	,c.NAME AS full_name
	,b.first_name
	,b.last_name
	,a.principle
	,b.id AS telegramID
	,b.username AS telegramUsername
FROM overdueMonitor.dbo.activeSalesStaff a
	LEFT JOIN telegram.dbo.[user] b ON a.SAL_NO=b.SAL_NO
	LEFT JOIN DB_U105.dbo.SALM c ON a.SAL_NO=c.SAL_NO;

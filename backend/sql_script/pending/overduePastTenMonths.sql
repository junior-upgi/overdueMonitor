SELECT
    b.CUS_NO
    ,ISNULL(c.OVERDUE,0) AS OVERDUE
FROM UPGI_OverdueMonitor.dbo.observedClient b
    LEFT JOIN (
    SELECT
        a.CUS_NO
        ,SUM(a.AMTN_BAL) AS OVERDUE
    FROM UPGI_OverdueMonitor.dbo.outstanding a
    WHERE a.[STATUS]=1
        AND ((a.[YEAR]<YEAR(DATEADD(DAY,-300,GETDATE())))
        OR (a.[YEAR]=YEAR(DATEADD(DAY,-300,GETDATE())) AND a.[MONTH]<=MONTH(DATEADD(DAY,-300,GETDATE()))))
    GROUP BY a.CUS_NO) c ON b.CUS_NO=c.CUS_NO;
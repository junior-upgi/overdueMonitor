SELECT
    '【逾期款項發生警訊】' AS manualTopic
	,'【逾期款監控系統】致業務員：'+b.SAL_NAME+' - 客戶【'+b.CUS_SNM+'】以於昨日產生逾期款項 $'+FORMAT(a.AMTN_OUT,N'N0','zh-TW')+' ('+a.PS_NO+')。請注意！' AS content
    ,4 AS messageCategoryID
    ,1 AS systemCategoryID
    ,'05060001' AS uid
	,b.SAL_NO AS recipientID
    ,'http://upgi.ddns.net/overdue-monitor/index.php' AS url
    ,'alarm.mp3' AS audioFile
	,b.SAL_NAME
    ,a.CUS_NO
	,b.CUS_SNM
	,b.TERM_DESC
    ,a.PS_NO
    ,a.PS_DD
    ,a.[YEAR]
    ,a.[MONTH]
    ,a.AMTN_OUT
    ,a.G_PERIOD
	,DATEADD(day,c.G_PERIOD,a.PS_DD) AS DUE_DATE
	,CURRENT_TIMESTAMP AS [generated]
FROM UPGI_OverdueMonitor.dbo.outstanding a
	LEFT JOIN UPGI_OverdueMonitor.dbo.clientData b ON a.CUS_NO=b.CUS_NO
	LEFT JOIN UPGI_OverdueMonitor.dbo.paymentTerm c ON a.CUS_NO=c.CUS_NO
WHERE a.[STATUS]=1 AND (DATEADD(day,c.G_PERIOD,a.PS_DD)=CAST(DATEADD(day,-1,GETDATE()) AS DATE));

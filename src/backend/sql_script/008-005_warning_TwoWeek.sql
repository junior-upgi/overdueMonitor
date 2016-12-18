SELECT
    CAST('【2週內應收貨款提醒】' AS VARCHAR(255)) AS manualTopic
    ,'【'+b.CUS_SNM+'】出貨金額 $'+FORMAT(a.AMTN_OUT,N'N0','zh-TW')+' 將於'+CAST(a.G_PERIOD_REMAIN AS VARCHAR)+'日後到期。' AS content
    ,4 AS messageCategoryID
    ,1 AS systemCategoryID
    ,'05060001' AS uid
	,b.SAL_NO AS recipientID
    ,'http://upgi.ddns.net:9003/overdueMonitor?SAL_NO='+b.SAL_NO AS url
    ,'warning.mp3' AS audioFile
    ,'【逾期款監控系統】致業務員：'+b.SAL_NAME+' - 客戶【'+b.CUS_SNM+'】於 '+CAST(a.PS_DD AS VARCHAR)+' 出貨金額 $'+FORMAT(a.AMTN_OUT,N'N0','zh-TW')+' ('+a.PS_NO+')，其繳費期限將於'+CAST(a.G_PERIOD_REMAIN AS VARCHAR)+'日後到期，請注意催款時效。' AS verboseMessage
	,b.SAL_NAME
    ,a.CUS_NO
	,b.CUS_SNM
	,b.TERM_DESC
    ,a.PS_NO
    ,a.PS_DD
    ,a.[YEAR]
    ,a.[MONTH]
    ,a.AMTN_OUT
    ,a.G_PERIOD_REMAIN
	,DATEADD(day,c.G_PERIOD,a.PS_DD) AS DUE_DATE
	,GETDATE() AS [generated]
FROM overdueMonitor.dbo.outstanding a
	LEFT JOIN overdueMonitor.dbo.clientData b ON a.CUS_NO=b.CUS_NO
	LEFT JOIN overdueMonitor.dbo.paymentTerm c ON a.CUS_NO=c.CUS_NO
WHERE a.[STATUS]=0 AND (a.G_PERIOD_REMAIN BETWEEN 8 AND 14);

SELECT
    '【2週內應收貨款提醒】' AS title
    ,'【逾期款監控系統】致業務員：'+ISNULL(b.SAL_NAME,'趙婉伶(代)')+' - 客戶【'+b.CUS_SNM+'】於'+CAST(a.PS_DD AS VARCHAR)+' 出貨金額 $'+FORMAT(a.AMTN_OUT,N'N0','zh-TW')+' ('+a.PS_NO+')，其繳費期限將於'+CAST(a.G_PERIOD_REMAIN AS VARCHAR)+'日後到期，請注意催款時效。' AS content
    ,1 AS messageID
    ,1 AS systemID
    ,'05060001' AS uid
	,ISNULL(b.SAL_NO,'08030005') AS recipientID
    ,'http://upgi.ddns.net/overdue-monitor/index.php' AS url
    ,'warning.mp3' AS audioFile
	,ISNULL(b.SAL_NAME,'趙婉伶(代)') AS SAL_NAME
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
	,CURRENT_TIMESTAMP AS [generated]
FROM UPGI_OverdueMonitor.dbo.outstanding a
	LEFT JOIN UPGI_OverdueMonitor.dbo.clientData b ON a.CUS_NO=b.CUS_NO
	LEFT JOIN UPGI_OverdueMonitor.dbo.paymentTerm c ON a.CUS_NO=c.CUS_NO
WHERE a.[STATUS]=0 AND (a.G_PERIOD_REMAIN BETWEEN 8 AND 14);